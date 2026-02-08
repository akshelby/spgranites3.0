import { useEffect, useState } from 'react';
import { AdminLayout, StatsCard, PageHeader } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
  IndianRupee,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalEnquiries: number;
  totalRevenue: number;
  totalVisitors: number;
  pendingOrders: number;
  avgRating: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentEnquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalEnquiries: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    pendingOrders: 0,
    avgRating: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all stats in parallel
      const [
        productsRes,
        ordersRes,
        usersRes,
        enquiriesRes,
        visitorsRes,
        reviewsRes,
        recentOrdersRes,
        recentEnquiriesRes,
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount, status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('enquiries').select('id', { count: 'exact', head: true }),
        supabase.from('site_visitors').select('id', { count: 'exact', head: true }),
        supabase.from('customer_reviews').select('rating'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalEnquiries: enquiriesRes.count || 0,
        totalRevenue,
        totalVisitors: visitorsRes.count || 0,
        pendingOrders,
        avgRating: Math.round(avgRating * 10) / 10,
      });

      setRecentOrders(recentOrdersRes.data || []);
      setRecentEnquiries(recentEnquiriesRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6" />}
          description="Active products in catalog"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="h-6 w-6" />}
          description={`${stats.pendingOrders} pending`}
        />
        <StatsCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<IndianRupee className="h-6 w-6" />}
          description="Total sales"
        />
        <StatsCard
          title="Visitors"
          value={stats.totalVisitors}
          icon={<Eye className="h-6 w-6" />}
          description="Total site visitors"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6" />}
          description="Registered users"
        />
        <StatsCard
          title="Enquiries"
          value={stats.totalEnquiries}
          icon={<MessageSquare className="h-6 w-6" />}
          description="Contact submissions"
        />
        <StatsCard
          title="Avg Rating"
          value={stats.avgRating}
          icon={<Star className="h-6 w-6" />}
          description="Customer reviews"
        />
        <StatsCard
          title="Growth"
          value="12%"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
          description="vs last month"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total_amount.toLocaleString()}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enquiries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentEnquiries.length === 0 ? (
              <p className="text-center text-muted-foreground">No enquiries yet</p>
            ) : (
              <div className="space-y-3">
                {recentEnquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{enquiry.name}</p>
                        {!enquiry.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {enquiry.message}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {format(new Date(enquiry.created_at), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
