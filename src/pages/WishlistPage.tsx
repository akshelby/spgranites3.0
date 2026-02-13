import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { useTranslation } from 'react-i18next';

export default function WishlistPage() {
  const { t } = useTranslation();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [items]);

  const fetchProducts = async () => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const productIds = items.map((item) => item.productId);
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (data) setProducts(data as Product[]);
    setLoading(false);
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
      image: product.images?.[0] || '/placeholder.svg',
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-display font-bold mb-3 sm:mb-5">{t('wishlist.title')}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (products.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2" data-testid="text-empty-wishlist">{t('wishlist.empty')}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {t('wishlist.emptyHint')}
          </p>
          <Button asChild size="default" data-testid="button-browse">
            <Link to="/products">{t('wishlist.browseProducts')}</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-display font-bold mb-3 sm:mb-5" data-testid="text-wishlist-title">
          {t('wishlist.title')} ({products.length})
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group bg-card rounded-lg overflow-hidden border border-border hover-elevate transition-all"
              data-testid={`card-wishlist-${product.id}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 flex items-center justify-center text-destructive"
                  data-testid={`button-remove-wishlist-${product.id}`}
                >
                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
              <div className="p-2 sm:p-2.5">
                <Link to={`/products/${product.slug}`}>
                  <h3 className="text-xs sm:text-sm font-medium line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {formatPrice(product.price)}
                </p>
                <Button
                  className="w-full mt-1.5 text-[10px] sm:text-xs"
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  data-testid={`button-add-cart-${product.id}`}
                >
                  <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
