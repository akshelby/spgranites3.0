import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowupFormProps {
  leadId?: string;
  userId?: string;
  onFollowupAdded: () => void;
}

export function FollowupForm({ leadId, userId, onFollowupAdded }: FollowupFormProps) {
  const [open, setOpen] = useState(false);
  const [dueAt, setDueAt] = useState('');
  const [channel, setChannel] = useState('call');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueAt || !user) return;

    setSaving(true);
    try {
      await api.post('/api/admin/crm-followups', {
        lead_id: leadId || null,
        user_id: userId || null,
        due_at: new Date(dueAt).toISOString(),
        channel,
        summary: summary.trim() || null,
        created_by: user.id,
      });

      setDueAt('');
      setSummary('');
      setChannel('call');
      setOpen(false);
      onFollowupAdded();
      toast({ title: 'Follow-up scheduled' });
    } catch (err) {
      console.error('Error adding follow-up:', err);
      toast({ title: 'Failed to add follow-up', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Schedule Follow-up
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-3">
      <Input
        type="datetime-local"
        value={dueAt}
        onChange={(e) => setDueAt(e.target.value)}
        required
        className="text-sm"
      />
      <Select value={channel} onValueChange={setChannel}>
        <SelectTrigger className="text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="call">Phone Call</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="visit">Visit</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        placeholder="What's this follow-up about?"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="min-h-[50px] resize-none text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving || !dueAt} className="flex-1">
          Schedule
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
