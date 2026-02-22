import { useEffect, useState } from 'react';
import { AdminLayout, StatsCard, PageHeader } from '@/components/admin';
import { useCategoryStyle } from '@/hooks/useCategoryStyle';
import { LayoutGrid, Rows3 } from 'lucide-react';
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
import { format, subDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalEnquiries: number;
  totalRevenue: number;
  totalVisitors: number;
  pendingOrders: number;
  avgRating: number;
  growthPercent: number;
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
    growthPercent: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, enquiriesRes, testimonialsRes, visitorsRes, usersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount, status', { count: 'exact' }),
        supabase.from('enquiries' as any).select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('rating'),
        (supabase.from as any)('site_visitors').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const totalProducts = productsRes.count || 0;
      const totalOrders = ordersRes.count || 0;
      const totalEnquiries = enquiriesRes.count || 0;
      const totalVisitors = visitorsRes.count || 0;
      const totalUsers = usersRes.count || 0;

      const orderRows = ordersRes.data || [];
      const totalRevenue = orderRows.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
      const pendingOrders = orderRows.filter((o: any) => o.status === 'pending').length;

      const testimonialRows = testimonialsRes.data || [];
      const avgRating = testimonialRows.length > 0
        ? Math.round((testimonialRows.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / testimonialRows.length) * 10) / 10
        : 0;

      const now = new Date();
      const thisWeekStart = startOfDay(subDays(now, 7)).toISOString();
      const lastWeekStart = startOfDay(subDays(now, 14)).toISOString();

      const [thisWeekRes, lastWeekRes] = await Promise.all([
        (supabase.from as any)('site_visitors')
          .select('id', { count: 'exact', head: true })
          .gte('visited_at', thisWeekStart),
        (supabase.from as any)('site_visitors')
          .select('id', { count: 'exact', head: true })
          .gte('visited_at', lastWeekStart)
          .lt('visited_at', thisWeekStart),
      ]);

      const thisWeekCount = thisWeekRes.count || 0;
      const lastWeekCount = lastWeekRes.count || 0;
      const growthPercent = lastWeekCount > 0
        ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
        : thisWeekCount > 0 ? 100 : 0;

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalEnquiries,
        totalRevenue,
        totalVisitors,
        pendingOrders,
        avgRating,
        growthPercent,
      });

      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders((recentOrdersData as any) || []);

      const { data: recentEnquiriesData } = await supabase
        .from('enquiries' as any)
        .select('id, name, phone, message, created_at, is_read')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentEnquiries((recentEnquiriesData as any) || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please refresh the page.');
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

  const { style: categoryStyle, updateStyle: updateCategoryStyle } = useCategoryStyle();

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance"
      />

      {/* Category Icon Style Toggle */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Homepage Category Icon Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateCategoryStyle('circle')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  categoryStyle === 'circle'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Circle Buttons
              </button>
              <button
                onClick={() => updateCategoryStyle('pill')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  categoryStyle === 'pill'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Rows3 className="w-4 h-4" />
                Pill Buttons
              </button>
              <span className="text-xs text-muted-foreground ml-2">
                Changes apply instantly on the homepage
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

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
          value={`${stats.growthPercent >= 0 ? '+' : ''}${stats.growthPercent}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: Math.abs(stats.growthPercent), isPositive: stats.growthPercent >= 0 }}
          description="vs last week"
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
