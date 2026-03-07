import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

import { productImageMap, resolveProductImage, defaultProductImage } from '@/lib/productImages';

const fallbackProducts: Product[] = [
  { id: 'fb-1', name: 'Black Galaxy Granite', slug: 'black-galaxy-granite', description: 'Premium black granite with golden flecks', short_description: 'Premium black granite', price: 4500, compare_price: 5500, images: [productImageMap['black-galaxy-granite'] || defaultProductImage], stock_quantity: 100, is_active: true, is_featured: true, category: { name: 'Granite' } } as Product,
  { id: 'fb-2', name: 'Absolute Black Granite', slug: 'absolute-black-granite', description: 'Deep black granite for modern spaces', short_description: 'Deep black granite', price: 3800, compare_price: 4200, images: [productImageMap['absolute-black-granite'] || defaultProductImage], stock_quantity: 80, is_active: true, is_featured: true, category: { name: 'Granite' } } as Product,
  { id: 'fb-3', name: 'Tan Brown Granite', slug: 'tan-brown-granite', description: 'Warm brown granite with natural patterns', short_description: 'Warm brown granite', price: 2800, compare_price: 3200, images: [productImageMap['tan-brown-granite'] || defaultProductImage], stock_quantity: 120, is_active: true, is_featured: true, category: { name: 'Granite' } } as Product,
  { id: 'fb-4', name: 'Blue Pearl Granite', slug: 'blue-pearl-granite', description: 'Stunning blue granite with pearl-like shine', short_description: 'Blue pearl granite', price: 5200, compare_price: 6000, images: [productImageMap['blue-pearl-granite'] || defaultProductImage], stock_quantity: 50, is_active: true, is_featured: true, category: { name: 'Granite' } } as Product,
  { id: 'fb-5', name: 'Green Galaxy Granite', slug: 'green-galaxy-granite', description: 'Exotic green granite with galaxy pattern', short_description: 'Green galaxy granite', price: 3500, compare_price: 4000, images: [productImageMap['green-galaxy-granite'] || defaultProductImage], stock_quantity: 60, is_active: true, is_featured: true, category: { name: 'Granite' } } as Product,
  { id: 'fb-6', name: 'Imperial Red Granite', slug: 'imperial-red-granite', description: 'Rich red granite for bold designs', short_description: 'Imperial red granite', price: 4000, compare_price: 4500, images: [productImageMap['imperial-red-granite'] || defaultProductImage], stock_quantity: 70, is_active: true, is_featured: true, category: { name: 'Granite' } } as Product,
];

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const { addToCart, items, updateQuantity } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [products]);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('div')?.offsetWidth || 200;
    el.scrollBy({ left: direction === 'left' ? -cardWidth - 12 : cardWidth + 12, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    const fetchFeaturedProducts = async (attempt = 0) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (cancelled || error) return;
        const safeData = Array.isArray(data) ? data : [];
        const featured = safeData.filter((p: any) => p.is_featured);
        if (featured.length > 0) {
          setProducts(featured.slice(0, 8) as Product[]);
        } else if (safeData.length > 0) {
          setProducts(safeData.slice(0, 8) as Product[]);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err: any) {
        if (!cancelled && attempt < 2 && (err?.message?.includes('bort') || err?.message?.includes('Abort'))) {
          setTimeout(() => fetchFeaturedProducts(attempt + 1), 500 * (attempt + 1));
          return;
        }
        if (!cancelled) setProducts(fallbackProducts);
      }
    };
    fetchFeaturedProducts();
    return () => { cancelled = true; };
  }, []);

  const getProductImage = (product: Product) => resolveProductImage(product);

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
    <section className="py-8 sm:py-10 lg:py-14 bg-muted/30" data-testid="featured-products-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-3 sm:mb-6 lg:mb-8"
        >
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-testid="text-featured-label">{t('featured.label')}</span>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mt-1 sm:mt-1.5 mb-1.5 sm:mb-3 leading-tight heading-stylish" data-testid="text-featured-title">
            {t('featured.title')}
          </h3>
          <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </motion.div>
      </div>

      <div className="relative group/scroll">
        {canScrollLeft && (
          <button
            onClick={() => scrollBy('left')}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-background transition-all opacity-0 group-hover/scroll:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scrollBy('right')}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-background transition-all opacity-0 group-hover/scroll:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-4 md:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex-shrink-0 w-[240px] sm:w-[300px] lg:w-[340px] group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              data-testid={`card-product-${product.id}`}
              onClick={() => window.location.href = `/products/${product.slug}`}
            >
              <div className="relative aspect-[3/3] overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  onError={(e) => { (e.target as HTMLImageElement).src = defaultProductImage; }}
                />
                {product.compare_price && product.compare_price > product.price && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold rounded" data-testid={`badge-discount-${product.id}`}>
                    {Math.round((1 - product.price / product.compare_price) * 100)}% {t('featured.off')}
                  </span>
                )}
                {user && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleWishlistToggle(product.id); }}
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
              <div className="p-2 sm:p-3">
                <h3 className="text-[11px] sm:text-xs lg:text-sm font-semibold line-clamp-1" data-testid={`text-product-name-${product.id}`}>
                  {product.name}
                </h3>
                <div className="flex items-center justify-between gap-1 mt-1 sm:mt-2">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-foreground" data-testid={`text-price-${product.id}`}>
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through ml-1">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const cartItem = items.find(i => i.productId === product.id);
                    if (cartItem) {
                      return (
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 border-red-500 text-red-600"
                            onClick={(e) => { e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity - 1); }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-bold w-5 text-center">{cartItem.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 border-red-500 text-red-600"
                            onClick={(e) => { e.stopPropagation(); updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    }
                    return (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="h-7 w-7 sm:h-8 sm:w-8 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-8"
        >
          <Button asChild size="default" className="hover-slide border-2 border-transparent" data-testid="button-view-all-products">
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
