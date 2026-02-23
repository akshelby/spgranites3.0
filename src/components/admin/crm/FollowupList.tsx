import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CrmFollowup } from '@/types/database';
import { format, isPast, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Phone, Mail, MessageCircle, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowupListProps {
  leadId?: string;
  userId?: string;
  refreshKey?: number;
  showAll?: boolean;
}

const channelIcons: Record<string, any> = {
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  visit: MapPin,
};

export function FollowupList({ leadId, userId, refreshKey, showAll }: FollowupListProps) {
  const [followups, setFollowups] = useState<CrmFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFollowups();
  }, [leadId, userId, refreshKey]);

  const fetchFollowups = async () => {
    try {
      const params = new URLSearchParams();
      if (leadId) params.set('lead_id', leadId);
      if (userId) params.set('user_id', userId);

      const data = await api.get(`/api/admin/crm-followups?${params.toString()}`);
      let result = data || [];
      if (!showAll) {
        result = result.filter((f: any) => f.status === 'pending');
      }
      setFollowups(result);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'done' | 'skipped') => {
    try {
      await api.put(`/api/admin/crm-followups/${id}`, {
        status,
        completed_at: new Date().toISOString(),
      });

      toast({ title: status === 'done' ? 'Marked as done' : 'Skipped' });
      fetchFollowups();
    } catch (err) {
      console.error('Error updating follow-up:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (followups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
        <Clock className="h-8 w-8" />
        <p className="text-sm">No follow-ups scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {followups.map((f) => {
        const overdue = f.status === 'pending' && isPast(new Date(f.due_at));
        const today = isToday(new Date(f.due_at));
        const ChannelIcon = channelIcons[f.channel || 'call'] || Phone;

        return (
          <div
            key={f.id}
            className={`rounded-lg border p-3 ${
              overdue ? 'border-destructive/50 bg-destructive/5' : today ? 'border-amber-500/50 bg-amber-500/5' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-1.5 ${overdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                <ChannelIcon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {format(new Date(f.due_at), 'MMM d, h:mm a')}
                  </span>
                  {overdue && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Overdue</Badge>}
                  {today && !overdue && <Badge className="text-[10px] px-1.5 py-0 bg-amber-500">Today</Badge>}
                  {f.status === 'done' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Done</Badge>}
                </div>
                {f.summary && <p className="mt-0.5 text-xs text-muted-foreground">{f.summary}</p>}
              </div>
              {f.status === 'pending' && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus(f.id, 'done')}>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus(f.id, 'skipped')}>
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
