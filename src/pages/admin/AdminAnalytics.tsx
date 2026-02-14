import { useEffect, useState } from 'react';
import { AdminLayout, StatsCard, PageHeader } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  Eye,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DailyVisitor {
  date: string;
  count: number;
}

interface VisitorStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<VisitorStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [dailyData, setDailyData] = useState<DailyVisitor[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const data = await api.get('/api/admin/analytics');
      const visitors = data?.visitors || [];

      const todayStart = startOfDay(now);
      const weekStart = startOfDay(subDays(now, 7));
      const monthStart = startOfDay(subDays(now, 30));

      let total = visitors.length;
      let today = 0;
      let thisWeek = 0;
      let thisMonth = 0;
      const dailyMap = new Map<string, number>();
      const pageMap = new Map<string, number>();

      visitors.forEach((v: any) => {
        const visitDate = new Date(v.visited_at);
        if (visitDate >= todayStart) today++;
        if (visitDate >= weekStart) thisWeek++;
        if (visitDate >= monthStart) thisMonth++;

        const date = format(visitDate, 'MMM d');
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);

        if (v.page_url) {
          pageMap.set(v.page_url, (pageMap.get(v.page_url) || 0) + 1);
        }
      });

      setStats({ total, today, thisWeek, thisMonth });

      const last7Days: DailyVisitor[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(now, i), 'MMM d');
        last7Days.push({ date, count: dailyMap.get(date) || 0 });
      }
      setDailyData(last7Days);

      const sortedPages = Array.from(pageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page, count]) => ({ page, count }));
      setTopPages(sortedPages);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...dailyData.map(d => d.count), 1);

  return (
    <AdminLayout>
      <PageHeader
        title="Analytics"
        description="Site traffic and visitor insights"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Visitors"
          value={stats.total}
          icon={<Eye className="h-6 w-6" />}
          description="All time"
        />
        <StatsCard
          title="Today"
          value={stats.today}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Visitors today"
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeek}
          icon={<Globe className="h-6 w-6" />}
          description="Last 7 days"
        />
        <StatsCard
          title="This Month"
          value={stats.thisMonth}
          icon={<Monitor className="h-6 w-6" />}
          description="Last 30 days"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Daily Visitors Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visitors (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="flex h-48 items-end gap-2">
                {dailyData.map((day, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-primary transition-all"
                      style={{ height: `${(day.count / maxCount) * 150}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                    <span className="text-xs font-medium">{day.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : topPages.length === 0 ? (
              <p className="text-center text-muted-foreground">No page data yet</p>
            ) : (
              <div className="space-y-3">
                {topPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="max-w-xs truncate text-sm">{page.page || '/'}</p>
                    <span className="text-sm font-medium">{page.count}</span>
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
