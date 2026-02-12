import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, MapPin, CreditCard, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/database';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  processing: 'bg-info text-info-foreground',
  shipped: 'bg-info text-info-foreground',
  delivered: 'bg-success text-success-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed'];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) fetchOrder();
  }, [orderId, user]);

  const fetchOrder = async () => {
    const [orderRes, itemsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single(),
      supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId),
    ]);

    if (orderRes.data) setOrder(orderRes.data as unknown as Order);
    if (itemsRes.data) setItems(itemsRes.data as OrderItem[]);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const currentStatusIndex = order ? orderStatuses.indexOf(order.status) : -1;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
          <div className="space-y-3">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-bold mb-3">Order not found</h1>
          <Button asChild size="default">
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-5"
          data-testid="link-back-orders"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-2xl font-display font-bold" data-testid="text-order-number">
              {order.order_number}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Placed on {format(new Date(order.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <Badge className={cn(statusColors[order.status], 'text-xs')} data-testid="badge-order-status">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        {order.status !== 'cancelled' && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="py-2.5 px-3 sm:py-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
              <div className="flex justify-between relative">
                {orderStatuses.slice(0, -1).map((status, index) => (
                  <div key={status} className="flex flex-col items-center relative z-10">
                    <div
                      className={cn(
                        'w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2',
                        index <= currentStatusIndex
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-muted border-border text-muted-foreground'
                      )}
                    >
                      {index < currentStatusIndex ? (
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <span className="text-[10px] sm:text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-[9px] sm:text-xs mt-1 capitalize hidden sm:block">
                      {status}
                    </span>
                  </div>
                ))}
                <div className="absolute top-3.5 sm:top-[18px] left-0 right-0 h-0.5 bg-border -z-0">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(currentStatusIndex / (orderStatuses.length - 2)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="py-2.5 px-3 sm:py-4 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
                <div className="space-y-2 sm:space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 pb-2 sm:pb-3 border-b last:border-0 last:pb-0"
                      data-testid={`item-order-${item.id}`}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-md flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium truncate">{item.product_name}</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Qty: {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold shrink-0">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="py-2.5 px-3 sm:py-4 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4 space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping_amount === 0
                      ? 'Free'
                      : formatPrice(order.shipping_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-sm sm:text-base">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-order-total">{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {order.shipping_address && (
              <Card>
                <CardHeader className="py-2.5 px-3 sm:py-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
                  <p className="text-xs sm:text-sm font-medium">{order.shipping_address.full_name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {order.shipping_address.address_line_1}
                    {order.shipping_address.address_line_2 &&
                      `, ${order.shipping_address.address_line_2}`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                    {order.shipping_address.pincode}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Phone: {order.shipping_address.phone}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
