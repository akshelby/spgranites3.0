import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, Star, Send } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { SPLoader } from '@/components/ui/SPLoader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PageErrorFallback } from '@/components/ErrorBoundary';
import { resolveProductImage, defaultProductImage } from '@/lib/productImages';

interface ProductReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; display_name: string | null } | null;
}

export default function ProductDetailPage() {
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const { t } = useTranslation();
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try by slug first, fall back to id if slug looks like a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug!);
      const query = supabase
        .from('products')
        .select('*, category:product_categories(*)');

      const { data, error: fetchError } = isUuid
        ? await query.or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle()
        : await query.eq('slug', slug!).maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setProduct(data as any);
        if (data.category_id) fetchRelatedProducts(data.category_id, data.id);

        const { data: reviewsData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false });

        const reviewsWithProfiles: ProductReview[] = [];
        if (reviewsData) {
          for (const r of reviewsData) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, display_name')
              .eq('id', r.user_id)
              .single();
            reviewsWithProfiles.push({ ...r, profiles: profileData } as any);
          }
        }
        setReviews(reviewsWithProfiles);
      }
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details. Please try again.');
      toast.error('Failed to load product');
    }
    setLoading(false);
  };

  const fetchRelatedProducts = async (categoryId: string, currentId: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', currentId)
        .limit(3);
      if (data) setRelatedProducts(data as any);
    } catch (err) {
      console.error('Failed to load related products:', err);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = async () => {
    if (!user || !product) return;
    setSubmittingReview(true);
    try {
      const { error: insertError } = await supabase
        .from('product_reviews')
        .insert({
          product_id: product.id,
          rating: reviewRating,
          review_text: reviewText || null,
          user_id: user.id,
        });

      if (insertError) {
        if (insertError.message?.includes('unique') || insertError.message?.includes('duplicate')) {
          toast.error(t('products.alreadyReviewed'));
        } else {
          throw insertError;
        }
      } else {
        toast.success(t('products.reviewSubmitted'));
        setReviewText('');
        setReviewRating(5);
        fetchProduct();
      }
    } catch (err: any) {
      toast.error(t('products.reviewFailed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: resolveProductImage(product),
      description: product.short_description || product.description || undefined,
      category: product.category?.name || undefined,
      comparePrice: product.compare_price || undefined,
      unit: 'per sq.ft',
      inStock: product.stock_quantity > 0,
    });
  };

  const handleWishlistToggle = async () => {
    if (!user || !product) return;
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <SPLoader size="lg" text="Loading product..." fullPage />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <PageErrorFallback error={error} resetError={fetchProduct} />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-bold mb-3">{t('products.productNotFound')}</h1>
          <Button asChild size="default">
            <Link to="/products">{t('products.backToProducts')}</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const resolvedMainImage = resolveProductImage(product);
  const rawImages = product.images?.length
    ? product.images.map(img => {
        if (img.includes('unsplash') || img === '/placeholder.svg') return resolvedMainImage;
        return img;
      })
    : [resolvedMainImage];

  // Ensure at least 3 thumbnail images for the vertical strip (pad with main image)
  const images = rawImages.length < 3
    ? [...rawImages, ...Array(3 - rawImages.length).fill(resolvedMainImage)]
    : rawImages;

  const inStock = product.stock_quantity > 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-foreground transition-colors">Store</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[55%_1fr] gap-6 lg:gap-10">
          {/* LEFT: Image Gallery — vertical thumbnails + main image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-3 sm:gap-4"
          >
            {/* Vertical Thumbnails */}
            {images.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 w-24 lg:w-28 shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'aspect-square rounded-md overflow-hidden border-2 transition-all duration-200',
                      selectedImage === i
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-muted-foreground/40'
                    )}
                    data-testid={`button-thumb-${i}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative">
              <div
                className="aspect-[3/4] sm:aspect-square lg:aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-zoom-in"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.5)' });
                  }}
                  onMouseLeave={() => setZoomStyle({})}
                >
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out"
                    style={zoomStyle}
                    data-testid="img-product-main"
                  />
              </div>

              {/* Mobile horizontal thumbnails */}
              {images.length > 1 && (
                <div className="flex sm:hidden gap-1.5 mt-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'w-14 h-14 rounded-md overflow-hidden border-2 shrink-0',
                        selectedImage === i ? 'border-primary' : 'border-border'
                      )}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Product Name */}
            <h1
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight mb-3"
              data-testid="text-product-name"
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-lg sm:text-xl font-medium text-foreground" data-testid="text-product-price">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-product-desc">
              {product.short_description || product.description}
            </p>

            {/* Bullet features from specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <ul className="space-y-1.5 mb-6 text-sm text-foreground">
                {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                    <span>{key}: {value}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.round(avgRating) ? 'text-primary fill-primary' : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? t('products.review') : t('products.reviews')})
                </span>
              </div>
            )}

            {/* Quantity + Add to Cart — MKBHD style */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-border rounded-none overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-muted transition-colors"
                  data-testid="button-qty-minus"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium border-x border-border py-2.5" data-testid="text-quantity">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 hover:bg-muted transition-colors"
                  data-testid="button-qty-plus"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                  'h-11 px-12 text-sm border-2 border-transparent hover-slide',
                  !inStock && 'opacity-60'
                )}
                data-testid="button-add-to-cart"
              >
                {inStock ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('products.addToCart')}
                  </>
                ) : (
                  t('products.outOfStock')
                )}
              </Button>
            </div>

            {user && (
              <div className="mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={handleWishlistToggle}
                  data-testid="button-wishlist-toggle"
                >
                  <Heart
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isInWishlist(product.id) && 'fill-destructive text-destructive'
                    )}
                  />
                </Button>
              </div>
            )}

            {/* Accordion Details */}
            <Accordion type="multiple" className="w-full border-t border-border">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm font-semibold py-4">
                  More details
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {product.description || t('products.noDescription')}
                  </p>
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                          <span>{key}: {value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="reviews">
                <AccordionTrigger className="text-sm font-semibold py-4">
                  {t('products.reviews')} ({reviews.length})
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  {user && (
                    <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4" data-testid="form-review">
                      <h4 className="text-sm font-semibold mb-2">{t('products.writeReview')}</h4>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            onMouseEnter={() => setHoverRating(i + 1)}
                            onMouseLeave={() => setHoverRating(0)}
                            data-testid={`button-star-${i + 1}`}
                          >
                            <Star
                              className={cn(
                                'h-5 w-5 transition-colors',
                                i < (hoverRating || reviewRating)
                                  ? 'text-primary fill-primary'
                                  : 'text-muted'
                              )}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{reviewRating}/5</span>
                      </div>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={t('products.reviewPlaceholder')}
                        rows={3}
                        className="mb-2 text-sm"
                        data-testid="input-review-text"
                      />
                      <Button
                        size="sm"
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        data-testid="button-submit-review"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {submittingReview ? t('products.submitting') : t('products.submitReview')}
                      </Button>
                    </div>
                  )}
                  {!user && (
                    <p className="text-sm text-muted-foreground">
                      <Link to="/auth" className="underline font-medium">{t('products.signInToReview')}</Link> {t('products.signInToReviewText')}
                    </p>
                  )}
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                {(review.profiles?.display_name || review.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {review.profiles?.display_name || review.profiles?.full_name || 'Customer'}
                                </p>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-3 w-3',
                                        i < review.rating ? 'text-primary fill-primary' : 'text-muted'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(review.created_at), 'dd MMM yyyy')}
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground mt-1 ml-9">{review.review_text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2 text-center">{t('products.noReviews')}</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality">
                <AccordionTrigger className="text-sm font-semibold py-4">
                  Quality guarantee & returns
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                      Quality is guaranteed. If there is a visible quality issue, we'll replace or refund it.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                      Custom orders may have slight natural stone variations which add to their unique beauty.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>

        {/* Related Products — "You may also like" */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/products/${rp.slug || rp.id}`}
                  className="group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <img
                      src={resolveProductImage(rp)}
                      alt={rp.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm font-semibold lowercase">{rp.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatPrice(rp.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
