import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Address } from '@/types/database';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });

    if (data) {
      setAddresses(data as Address[]);
      const defaultAddr = data.find((a) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: '',
          subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          total_amount: total,
          shipping_address: selectedAddress as any,
          billing_address: selectedAddress as any,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2" data-testid="text-empty-cart">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Add items to your cart to get started.
          </p>
          <Button asChild size="default" data-testid="button-browse-products">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-display font-bold mb-3 sm:mb-5" data-testid="text-cart-title">
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-2 sm:space-y-3">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-3 p-2.5 sm:p-3 bg-card rounded-lg border border-border"
                data-testid={`card-cart-item-${item.productId}`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md overflow-hidden shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center border border-border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`button-qty-minus-${item.productId}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-qty-plus-${item.productId}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive text-xs"
                      onClick={() => removeFromCart(item.id)}
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" data-testid={`text-item-total-${item.productId}`}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm sm:text-base">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {addresses.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted-foreground text-xs mb-2">
                      No addresses saved
                    </p>
                    <Button variant="outline" size="sm" asChild data-testid="button-add-address">
                      <Link to="/profile">Add Address</Link>
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-2"
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-start space-x-2 p-2 rounded-md border border-border hover-elevate cursor-pointer"
                        onClick={() => setSelectedAddressId(address.id!)}
                        data-testid={`radio-address-${address.id}`}
                      >
                        <RadioGroupItem value={address.id!} id={address.id} />
                        <Label htmlFor={address.id} className="cursor-pointer flex-1 text-xs">
                          <p className="font-medium text-sm">{address.full_name}</p>
                          <p className="text-muted-foreground">
                            {address.address_line_1}, {address.city} - {address.pincode}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm sm:text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-order-total">{formatPrice(total)}</span>
                </div>
                <Button
                  className="w-full"
                  size="default"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || addresses.length === 0}
                  data-testid="button-place-order"
                >
                  {isPlacingOrder ? (
                    'Placing Order...'
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
                {subtotal < 10000 && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                    Free shipping on orders above ₹10,000
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
