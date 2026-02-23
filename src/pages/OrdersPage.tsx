import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { SPLoader } from '@/components/ui/SPLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Order } from '@/types/database';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PageErrorFallback } from '@/components/ErrorBoundary';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  processing: 'bg-info text-info-foreground',
  shipped: 'bg-info text-info-foreground',
  delivered: 'bg-success text-success-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchOrders = async () => {
    setError(null);
    try {
      const data = await api.get('/api/orders');
      if (data) setOrders(data as Order[]);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Failed to load your orders. Please try again.');
      toast.error('Failed to load orders');
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

  if (loading) {
    return (
      <MainLayout>
        <SPLoader size="lg" text="Loading orders..." fullPage />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <PageErrorFallback error={error} resetError={fetchOrders} />
        </div>
      </MainLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2" data-testid="text-no-orders">{t('orders.noOrders')}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {t('orders.noOrdersHint')}
          </p>
          <Button asChild size="default" data-testid="button-start-shopping">
            <Link to="/products">{t('orders.startShopping')}</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-display font-bold mb-3 sm:mb-5" data-testid="text-orders-title">{t('orders.title')}</h1>

        <div className="space-y-2">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center gap-3 bg-card rounded-lg border border-border p-3 sm:p-4 hover-elevate transition-all"
                data-testid={`link-order-${order.id}`}
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold">{order.order_number}</h3>
                    <Badge className={statusColors[order.status]} data-testid={`badge-status-${order.id}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
                    {formatPrice(order.total_amount)}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
