import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Grid, List, ShoppingCart, Heart, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categorySlug = searchParams.get('category');
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('product_categories').select('*').eq('is_active', true);
      if (error) throw error;
      if (data) setCategories(data);
    } catch {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (categorySlug) {
        const { data: catData } = await supabase.from('product_categories').select('id').eq('slug', categorySlug).single();
        if (catData) {
          query = query.eq('category_id', catData.id);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) setProducts(data as Product[]);
    } catch {}
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3 sm:mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold" data-testid="text-page-title">
              {t('products.title')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {filteredProducts.length} {t('products.results')}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-2 mb-3 sm:mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('products.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
              data-testid="input-search"
            />
          </div>
          <Select
            value={categorySlug || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                searchParams.delete('category');
              } else {
                searchParams.set('category', value);
              }
              setSearchParams(searchParams);
            }}
          >
            <SelectTrigger className="w-32 sm:w-44 h-9 text-sm" data-testid="select-category">
              <SelectValue placeholder={t('products.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('products.allCategories')}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-48 sm:h-56" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-base font-semibold mb-1">{t('products.noProducts')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('products.noProductsHint')}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'grid',
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3'
                : 'grid-cols-1 gap-2'
            )}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.015, 0.3) }}
                className={cn(
                  'group bg-card rounded-lg overflow-hidden border border-border hover-elevate transition-all',
                  viewMode === 'list' && 'flex'
                )}
                data-testid={`card-product-${product.id}`}
              >
                <div
                  className={cn(
                    'relative overflow-hidden',
                    viewMode === 'grid' ? 'aspect-[4/3]' : 'w-28 sm:w-36 shrink-0'
                  )}
                >
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 py-0.5 bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-semibold rounded" data-testid={`badge-discount-${product.id}`}>
                      {Math.round((1 - product.price / product.compare_price) * 100)}% {t('common.off')}
                    </span>
                  )}
                  {user && (
                    <button
                      onClick={() => handleWishlistToggle(product.id)}
                      className={cn(
                        'absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 flex items-center justify-center transition-colors',
                        isInWishlist(product.id)
                          ? 'text-destructive'
                          : 'text-muted-foreground hover:text-destructive'
                      )}
                      data-testid={`button-wishlist-${product.id}`}
                    >
                      <Heart
                        className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', isInWishlist(product.id) && 'fill-current')}
                      />
                    </button>
                  )}
                </div>
                <div className={cn("p-2 sm:p-2.5 flex-1", viewMode === 'list' && 'flex flex-col justify-center')}>
                  <Link to={`/products/${product.slug}`} data-testid={`link-product-${product.id}`}>
                    <h3 className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-1 sm:mt-1.5 flex items-center gap-1 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-primary" data-testid={`text-price-${product.id}`}>
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-1.5 text-[10px] sm:text-xs"
                    onClick={() => handleAddToCart(product)}
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    {t('products.addToCart')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
