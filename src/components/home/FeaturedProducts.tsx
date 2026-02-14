import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

import blackGraniteImg from '@/assets/products/black-granite.jpg';
import brownGraniteImg from '@/assets/products/brown-granite.jpg';
import greenGraniteImg from '@/assets/products/green-granite.jpg';
import bluePearlImg from '@/assets/products/blue-pearl.jpg';
import redGraniteImg from '@/assets/products/red-granite.jpg';
import greyGraniteImg from '@/assets/products/grey-granite.jpg';

const productImages: Record<string, string> = {
  'black-galaxy-granite': blackGraniteImg,
  'absolute-black-granite': blackGraniteImg,
  'kashmir-white-granite': greyGraniteImg,
  'tan-brown-granite': brownGraniteImg,
  'blue-pearl-granite': bluePearlImg,
  'imperial-red-granite': redGraniteImg,
  'steel-grey-granite': greyGraniteImg,
  'green-galaxy-granite': greenGraniteImg,
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(8);

    if (data) {
      setProducts(data as Product[]);
    }
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0 && product.images[0] !== '/placeholder.svg') {
      return product.images[0];
    }
    return productImages[product.slug] || blackGraniteImg;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: getProductImage(product),
      description: product.short_description || product.description || undefined,
      category: product.category?.name || undefined,
      comparePrice: product.compare_price || undefined,
      unit: 'per sq.ft',
      inStock: product.stock_quantity > 0,
    });
  };

  const handleWishlistToggle = async (productId: string) => {
    if (!user) return;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-muted/40" data-testid="featured-products-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8 lg:mb-12"
        >
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider" data-testid="text-featured-label">{t('featured.label')}</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-bold mt-1 sm:mt-2 mb-1 sm:mb-4" data-testid="text-featured-title">
            {t('featured.title')}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card rounded-md overflow-hidden border border-border"
              data-testid={`card-product-${product.id}`}
            >
              <div className="relative aspect-[4/3] lg:aspect-[3/2] overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.compare_price && product.compare_price > product.price && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold rounded" data-testid={`badge-discount-${product.id}`}>
                    {Math.round((1 - product.price / product.compare_price) * 100)}% {t('featured.off')}
                  </span>
                )}
                {user && (
                  <button
                    onClick={() => handleWishlistToggle(product.id)}
                    className={cn(
                      'absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center transition-colors',
                      isInWishlist(product.id) ? 'text-destructive' : 'text-muted-foreground'
                    )}
                    data-testid={`button-wishlist-${product.id}`}
                  >
                    <Heart className={cn('h-3.5 w-3.5', isInWishlist(product.id) && 'fill-current')} />
                  </button>
                )}
              </div>
              <div className="p-2.5 sm:p-4 lg:p-5">
                <Link to={`/products/${product.slug}`}>
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold line-clamp-1" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between gap-1 mt-1.5 sm:mt-3">
                  <div>
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-foreground" data-testid={`text-price-${product.id}`}>
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground line-through ml-1">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="default"
                    variant="outline"
                    onClick={() => handleAddToCart(product)}
                    className="hidden lg:inline-flex text-xs"
                    data-testid={`button-add-cart-desktop-${product.id}`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    {t('featured.addToCart')}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAddToCart(product)}
                    className="lg:hidden"
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-10"
        >
          <Button asChild size="default" data-testid="button-view-all-products">
            <Link to="/products">
              {t('featured.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
