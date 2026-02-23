import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ShoppingCart, MessageSquare, Calculator, StickyNote, Clock, Package } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'order' | 'enquiry' | 'estimation' | 'note' | 'followup';
  title: string;
  description: string;
  date: string;
  meta?: string;
}

interface ActivityTimelineProps {
  userId?: string;
  leadId?: string;
  refreshKey?: number;
}

const typeConfig = {
  order: { icon: ShoppingCart, color: 'text-blue-500 bg-blue-500/10' },
  enquiry: { icon: MessageSquare, color: 'text-amber-500 bg-amber-500/10' },
  estimation: { icon: Calculator, color: 'text-purple-500 bg-purple-500/10' },
  note: { icon: StickyNote, color: 'text-emerald-500 bg-emerald-500/10' },
  followup: { icon: Clock, color: 'text-primary bg-primary/10' },
};

export function ActivityTimeline({ userId, leadId, refreshKey }: ActivityTimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [userId, leadId, refreshKey]);

  const fetchTimeline = async () => {
    try {
      const timeline: TimelineItem[] = [];

      if (userId) {
        try {
          const orders = await api.get('/api/orders');
          const userOrders = (orders || []).filter((o: any) => o.user_id === userId).slice(0, 10);
          userOrders.forEach((o: any) => {
            timeline.push({
              id: `order-${o.id}`,
              type: 'order',
              title: `Order ${o.order_number}`,
              description: `₹${Number(o.total_amount).toLocaleString()} — ${o.status}`,
              date: o.created_at,
            });
          });
        } catch {}
      }

      const notesParams = new URLSearchParams();
      if (leadId) notesParams.set('lead_id', leadId);
      if (userId) notesParams.set('user_id', userId);

      try {
        const notes = await api.get(`/api/admin/crm-notes?${notesParams.toString()}`);
        (notes || []).forEach((n: any) => {
          timeline.push({
            id: `note-${n.id}`,
            type: 'note',
            title: 'Note added',
            description: n.note.length > 80 ? n.note.substring(0, 80) + '...' : n.note,
            date: n.created_at,
          });
        });
      } catch {}

      const followupsParams = new URLSearchParams();
      if (leadId) followupsParams.set('lead_id', leadId);
      if (userId) followupsParams.set('user_id', userId);

      try {
        const followups = await api.get(`/api/admin/crm-followups?${followupsParams.toString()}`);
        (followups || []).forEach((f: any) => {
          timeline.push({
            id: `followup-${f.id}`,
            type: 'followup',
            title: `Follow-up (${f.channel || 'call'})`,
            description: f.summary || `${f.status}`,
            date: f.created_at,
            meta: f.status,
          });
        });
      } catch {}

      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(timeline);
    } catch (err) {
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
        <Package className="h-8 w-8" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      {items.map((item) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        return (
          <div key={item.id} className="relative flex gap-3 pl-1">
            <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.color}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
