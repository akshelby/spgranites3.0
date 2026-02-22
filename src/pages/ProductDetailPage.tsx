import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, ChevronLeft, Star, Check, Send } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { SPLoader } from '@/components/ui/SPLoader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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

interface ProductReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; display_name: string | null } | null;
}

export default function ProductDetailPage() {
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
      const { data: productData, error: productError } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (productError) throw productError;
      if (productData) {
        let category = null;
        if (productData.category_id) {
          const { data: catData } = await supabase.from('product_categories').select('*').eq('id', productData.category_id).single();
          category = catData;
        }
        const { data: reviewsData } = await supabase.from('product_reviews').select('*').eq('product_id', productData.id).eq('is_approved', true);
        const fullProduct = { ...productData, category, reviews: reviewsData || [] } as Product;
        setProduct(fullProduct);
        setReviews((reviewsData || []) as ProductReview[]);
      }
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details. Please try again.');
      toast.error('Failed to load product');
    }
    setLoading(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = async () => {
    if (!user || !product) return;
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('product_reviews').insert({
        product_id: product.id,
        rating: reviewRating,
        review_text: reviewText || null,
        user_id: user.id,
      }).select().single();
      if (error) throw error;
      toast.success(t('products.reviewSubmitted'));
      setReviewText('');
      setReviewRating(5);
      fetchProduct();
    } catch (err: any) {
      if (err?.message?.includes('already') || err?.code === '23505') {
        toast.error(t('products.alreadyReviewed'));
      } else {
        toast.error(t('products.reviewFailed'));
      }
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
      image: product.images?.[0] || '/placeholder.svg',
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

  const images = product.images?.length ? product.images : ['/placeholder.svg'];

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-5"
          data-testid="link-back-products"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t('products.backToProducts')}
        </Link>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2 sm:mb-3">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product-main"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 shrink-0',
                      selectedImage === i ? 'border-primary' : 'border-transparent'
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-1.5 sm:mb-2" data-testid="text-product-name">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.round(avgRating) ? 'text-primary fill-primary' : 'text-muted'
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1.5">
                  ({reviews.length} {reviews.length === 1 ? t('products.review') : t('products.reviews')})
                </span>
              </div>
              {product.stock_quantity > 0 ? (
                <span className="flex items-center gap-0.5 text-xs text-success" data-testid="status-in-stock">
                  <Check className="h-3.5 w-3.5" />
                  {t('products.inStock')}
                </span>
              ) : (
                <span className="text-xs text-destructive" data-testid="status-out-stock">{t('products.outOfStock')}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-primary" data-testid="text-product-price">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                  <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs font-medium rounded">
                    {Math.round((1 - product.price / product.compare_price) * 100)}% {t('common.off')}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-5 line-clamp-3" data-testid="text-product-desc">
              {product.short_description || product.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-qty-minus"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 text-center text-sm font-medium" data-testid="text-quantity">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-qty-plus"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                size="default"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 sm:flex-none text-sm"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                {t('products.addToCart')}
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  data-testid="button-wishlist-toggle"
                >
                  <Heart
                    className={cn(
                      'h-4 w-4',
                      isInWishlist(product.id) && 'fill-destructive text-destructive'
                    )}
                  />
                </Button>
              )}
            </div>

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description" className="text-xs sm:text-sm" data-testid="tab-description">{t('products.description')}</TabsTrigger>
                <TabsTrigger value="specifications" className="text-xs sm:text-sm" data-testid="tab-specifications">{t('products.specifications')}</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs sm:text-sm" data-testid="tab-reviews">
                  {t('products.reviews')} ({reviews.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-3">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                  {product.description || t('products.noDescription')}
                </p>
              </TabsContent>
              <TabsContent value="specifications" className="mt-3">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-border">
                          <td className="py-1.5 font-medium text-xs sm:text-sm">{key}</td>
                          <td className="py-1.5 text-muted-foreground text-xs sm:text-sm">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('products.noSpecifications')}</p>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="mt-3 space-y-4">
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
                      <span className="text-xs text-muted-foreground ml-1">
                        {reviewRating}/5
                      </span>
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
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <Link to="/auth" className="underline font-medium" data-testid="link-login-review">{t('products.signInToReview')}</Link> {t('products.signInToReviewText')}
                  </p>
                )}
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-border pb-3 last:border-0"
                        data-testid={`review-${review.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                              {(review.profiles?.display_name || review.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium">
                                {review.profiles?.display_name || review.profiles?.full_name || 'Customer'}
                              </p>
                              <div className="flex items-center gap-1">
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
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-9">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('products.noReviews')}</p>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-display font-bold mb-3 sm:mb-4" data-testid="text-related-title">
              {t('products.relatedProducts')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/products/${rp.slug}`}
                  className="group bg-card rounded-lg overflow-hidden border border-border hover-elevate transition-all"
                  data-testid={`link-related-${rp.id}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={rp.images?.[0] || '/placeholder.svg'}
                      alt={rp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <h3 className="text-xs sm:text-sm font-medium line-clamp-1">{rp.name}</h3>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      {formatPrice(rp.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
