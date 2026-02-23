import { useEffect, useState } from 'react';
import { AdminLayout, StatsCard, PageHeader } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { FollowupList } from '@/components/admin/crm/FollowupList';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { isPast, isToday } from 'date-fns';

interface PipelineStats {
  new: number;
  contacted: number;
  interested: number;
  quoted: number;
  converted: number;
  lost: number;
}

interface OverviewStats {
  totalLeads: number;
  totalCustomers: number;
  overdueFollowups: number;
  todayFollowups: number;
  conversionRate: number;
}

interface RecentLead {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  source: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  interested: 'bg-purple-500',
  quoted: 'bg-cyan-500',
  converted: 'bg-emerald-500',
  lost: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  quoted: 'Quoted',
  converted: 'Converted',
  lost: 'Lost',
};

export default function AdminCRMOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalLeads: 0,
    totalCustomers: 0,
    overdueFollowups: 0,
    todayFollowups: 0,
    conversionRate: 0,
  });
  const [pipeline, setPipeline] = useState<PipelineStats>({
    new: 0, contacted: 0, interested: 0, quoted: 0, converted: 0, lost: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const [leads, users, followups] = await Promise.all([
        api.get('/api/admin/leads'),
        api.get('/api/admin/users'),
        api.get('/api/admin/crm-followups'),
      ]);

      const leadsArr = leads || [];
      const followupsArr = (followups || []).filter((f: any) => f.status === 'pending');
      const totalCustomers = (users || []).length;

      const pipelineCounts: PipelineStats = {
        new: 0, contacted: 0, interested: 0, quoted: 0, converted: 0, lost: 0,
      };
      leadsArr.forEach((l: any) => {
        if (l.status in pipelineCounts) {
          pipelineCounts[l.status as keyof PipelineStats]++;
        }
      });

      const overdueFollowups = followupsArr.filter((f: any) => isPast(new Date(f.due_at)) && !isToday(new Date(f.due_at))).length;
      const todayFollowups = followupsArr.filter((f: any) => isToday(new Date(f.due_at))).length;

      const convertedCount = pipelineCounts.converted;
      const totalNonLost = leadsArr.length - pipelineCounts.lost;
      const conversionRate = totalNonLost > 0 ? Math.round((convertedCount / totalNonLost) * 100) : 0;

      setStats({
        totalLeads: leadsArr.length,
        totalCustomers,
        overdueFollowups,
        todayFollowups,
        conversionRate,
      });
      setPipeline(pipelineCounts);

      const recent = leadsArr
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentLeads(recent);
    } catch (err) {
      console.error('Error fetching CRM overview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="CRM"
        description="Customer relationship management"
        action={
          <Link to="/admin/crm/leads">
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Lead</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<UserPlus className="h-6 w-6" />}
          description="In pipeline"
        />
        <StatsCard
          title="Customers"
          value={stats.totalCustomers}
          icon={<Users className="h-6 w-6" />}
          description="Registered users"
        />
        <StatsCard
          title="Due Today"
          value={stats.todayFollowups}
          icon={<Clock className="h-6 w-6" />}
          description={stats.overdueFollowups > 0 ? `${stats.overdueFollowups} overdue` : 'Follow-ups'}
        />
        <StatsCard
          title="Conversion"
          value={`${stats.conversionRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Lead to customer"
        />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Sales Pipeline</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Object.entries(pipeline).map(([status, count]) => (
            <Card key={status} className="overflow-hidden">
              <div className={`h-1 ${statusColors[status]}`} />
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{count}</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {statusLabels[status]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Leads</CardTitle>
            <Link to="/admin/crm/leads">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <UserPlus className="h-8 w-8" />
                <p className="text-sm">No leads yet</p>
                <Link to="/admin/crm/leads">
                  <Button variant="outline" size="sm">Add your first lead</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to="/admin/crm/leads"
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{lead.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" />
                            {lead.phone}
                          </span>
                        )}
                        {lead.source && <span className="capitalize">{lead.source}</span>}
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${
                      statusColors[lead.status] ? `${statusColors[lead.status]} text-white` : 'bg-muted'
                    }`}>
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Upcoming Follow-ups
              {stats.overdueFollowups > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertTriangle className="mr-1 h-2.5 w-2.5" />
                  {stats.overdueFollowups} overdue
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FollowupList showAll={false} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
