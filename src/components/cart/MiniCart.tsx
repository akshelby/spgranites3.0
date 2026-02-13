import { motion } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Tag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function MiniCart() {
  const { items, isMiniCartOpen, setMiniCartOpen, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <Sheet open={isMiniCartOpen} onOpenChange={setMiniCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('cart.yourCart')} ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t('cart.empty')}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {t('cart.emptyCartMessage')}
            </p>
            <Button onClick={() => setMiniCartOpen(false)} asChild>
              <Link to="/products">{t('cart.browseProducts')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((item) => {
                const discount = getDiscount(item.price, item.comparePrice);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                    data-testid={`minicart-item-${item.productId}`}
                  >
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={() => setMiniCartOpen(false)}
                      className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.productId}`}
                        onClick={() => setMiniCartOpen(false)}
                        className="text-sm font-medium line-clamp-1 hover:underline"
                        data-testid={`text-minicart-name-${item.productId}`}
                      >
                        {item.name}
                      </Link>

                      {item.category && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.category}
                        </p>
                      )}

                      {item.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold text-primary" data-testid={`text-minicart-price-${item.productId}`}>
                          {formatPrice(item.price)}
                        </span>
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(item.comparePrice)}
                          </span>
                        )}
                        {discount > 0 && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {discount}% {t('common.off')}
                          </Badge>
                        )}
                      </div>

                      {item.inStock !== false && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5 mt-0.5">
                          <CheckCircle className="h-2.5 w-2.5" />
                          {t('products.inStock')}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center border border-border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-minicart-minus-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-minicart-plus-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`button-minicart-remove-${item.productId}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('cart.subtotal')} ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})</span>
                <span className="text-lg font-bold" data-testid="text-minicart-subtotal">{formatPrice(getCartTotal())}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {t('cart.shippingNote')}
              </p>
              {user ? (
                <Button className="w-full" size="lg" asChild onClick={() => setMiniCartOpen(false)}>
                  <Link to="/cart">{t('cart.checkout')}</Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild onClick={() => setMiniCartOpen(false)}>
                  <Link to="/auth?redirect=/cart">{t('cart.signInToCheckout')}</Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMiniCartOpen(false)}
                asChild
              >
                <Link to="/products">{t('cart.continueShopping')}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
