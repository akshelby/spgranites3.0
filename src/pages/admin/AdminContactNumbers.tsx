import { useState, useEffect } from 'react';
import { AdminLayout, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Phone, GripVertical } from 'lucide-react';

interface ContactNumber {
  id: string;
  phone_number: string;
  label: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminContactNumbers() {
  const [numbers, setNumbers] = useState<ContactNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNumbers();
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

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/admin/contact-numbers');
      setNumbers(data || []);
    } catch (error) {
      console.error('Error fetching contact numbers:', error);
      toast({ title: 'Error', description: 'Failed to load contact numbers.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!phoneInput.trim()) return;
    setSaving(true);
    try {
      const maxOrder = numbers.length > 0 ? Math.max(...numbers.map(n => n.display_order)) : 0;
      await api.post('/api/admin/contact-numbers', {
        phone_number: phoneInput.trim(),
        label: labelInput.trim() || null,
        is_active: true,
        display_order: maxOrder + 1,
      });
      toast({ title: 'Number added successfully' });
      setPhoneInput('');
      setLabelInput('');
      setDialogOpen(false);
      fetchNumbers();
    } catch (error) {
      toast({ title: 'Failed to add number', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/api/admin/contact-numbers/${id}`, { is_active: !currentActive });
      setNumbers(prev =>
        prev.map(n => n.id === id ? { ...n, is_active: !currentActive } : n)
      );
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/contact-numbers/${id}`);
      toast({ title: 'Number deleted' });
      setNumbers(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Contact Numbers"
        description="Manage phone numbers shown in the contact popup"
      />

      <div className="mb-4">
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-number">
          <Plus className="mr-2 h-4 w-4" />
          Add Number
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : numbers.length === 0 ? (
        <Card className="p-8 text-center">
          <Phone className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No contact numbers added yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {numbers.map((num) => (
            <Card key={num.id} className="flex items-center gap-4 p-4" data-testid={`card-number-${num.id}`}>
              <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground" data-testid={`text-admin-phone-${num.id}`}>
                  {num.phone_number}
                </p>
                {num.label && (
                  <p className="text-sm text-muted-foreground">{num.label}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`toggle-${num.id}`} className="text-xs text-muted-foreground">
                    {num.is_active ? 'Active' : 'Inactive'}
                  </Label>
                  <Switch
                    id={`toggle-${num.id}`}
                    checked={num.is_active}
                    onCheckedChange={() => handleToggle(num.id, num.is_active)}
                    data-testid={`switch-toggle-${num.id}`}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(num.id)}
                  data-testid={`button-delete-${num.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-add-number">
          <DialogHeader>
            <DialogTitle>Add Contact Number</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="+91 9876543210"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                data-testid="input-phone-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-label">Label (optional)</Label>
              <Input
                id="phone-label"
                placeholder="e.g., Main Office, Sales"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                data-testid="input-phone-label"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-add">
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving || !phoneInput.trim()} data-testid="button-save-number">
              {saving ? 'Saving...' : 'Add Number'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
