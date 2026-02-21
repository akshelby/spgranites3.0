import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string | null;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          toast({ title: 'Loading timeout', description: 'Data is taking too long to load. Please try refreshing.', variant: 'destructive' });
        }
        return false;
      });
    }, 15000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({ title: 'Error loading data', description: error?.message || 'Please try refreshing the page.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status } as any)
        .eq('id', orderId);
      if (error) throw error;
      toast({ title: 'Order status updated' });
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'order_number',
      header: 'Order',
      render: (order: Order) => (
        <div>
          <p className="font-medium">{order.order_number}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (order: Order) => (
        <p className="font-medium">₹{order.total_amount.toLocaleString()}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => (
        <Select
          value={order.status}
          onValueChange={(value) => updateOrderStatus(order.id, value)}
        >
          <SelectTrigger className="w-32">
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (order: Order) => (
        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
          {order.payment_status || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (order: Order) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/orders/${order.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Orders"
        description="Manage customer orders"
      />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        loading={loading}
        emptyMessage="No orders found"
      />
    </AdminLayout>
  );
}
