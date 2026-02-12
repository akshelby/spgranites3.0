import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, ChevronLeft, Star, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, product_categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setProduct(data as Product);
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_id', data.category_id)
        .neq('id', data.id)
        .limit(6);
      if (related) setRelatedProducts(related as Product[]);
    }
    setLoading(false);
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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-muted rounded mb-4" />
            <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-5 bg-muted rounded w-1/4" />
                <div className="h-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-bold mb-3">Product not found</h1>
          <Button asChild size="default">
            <Link to="/products">Back to Products</Link>
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
          Back to Products
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
                      i < 4 ? 'text-primary fill-primary' : 'text-muted'
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1.5">
                  (24 reviews)
                </span>
              </div>
              {product.stock_quantity > 0 ? (
                <span className="flex items-center gap-0.5 text-xs text-success" data-testid="status-in-stock">
                  <Check className="h-3.5 w-3.5" />
                  In Stock
                </span>
              ) : (
                <span className="text-xs text-destructive" data-testid="status-out-stock">Out of Stock</span>
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
                    {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
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
                Add to Cart
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
                <TabsTrigger value="description" className="text-xs sm:text-sm" data-testid="tab-description">Description</TabsTrigger>
                <TabsTrigger value="specifications" className="text-xs sm:text-sm" data-testid="tab-specifications">Specifications</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-3">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                  {product.description || 'No description available.'}
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
                  <p className="text-xs sm:text-sm text-muted-foreground">No specifications available.</p>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-display font-bold mb-3 sm:mb-4" data-testid="text-related-title">
              Related Products
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
