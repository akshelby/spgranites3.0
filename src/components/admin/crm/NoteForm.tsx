import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NoteFormProps {
  leadId?: string;
  userId?: string;
  onNoteAdded: () => void;
}

export function NoteForm({ leadId, userId, onNoteAdded }: NoteFormProps) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !user) return;

    setSaving(true);
    try {
      await api.post('/api/admin/crm-notes', {
        lead_id: leadId || null,
        user_id: userId || null,
        author_id: user.id,
        note: note.trim(),
      });

      setNote('');
      onNoteAdded();
      toast({ title: 'Note added' });
    } catch (err) {
      console.error('Error adding note:', err);
      toast({ title: 'Failed to add note', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        placeholder="Add a note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-[60px] flex-1 resize-none text-sm"
        rows={2}
      />
      <Button type="submit" size="icon" disabled={saving || !note.trim()} className="shrink-0 self-end">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
