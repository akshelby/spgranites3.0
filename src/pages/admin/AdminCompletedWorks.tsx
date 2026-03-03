import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react';
import { format } from 'date-fns';

interface CompletedWork {
  id: string;
  media_url: string | null;
  media_type: string;
  stone_type: string | null;
  category: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  city: string | null;
  area: string | null;
  description: string | null;
  completion_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface WorkForm {
  media_url: string;
  media_type: string;
  stone_type: string;
  category: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  area: string;
  description: string;
  completion_date: string;
  is_active: boolean;
}

const CATEGORIES = ['Kitchen', 'Staircase', 'Bathroom', 'Flooring', 'Countertop', 'Wall Cladding', 'Other'];

const emptyForm: WorkForm = {
  media_url: '',
  media_type: 'image',
  stone_type: '',
  category: '',
  customer_name: '',
  customer_phone: '',
  city: '',
  area: '',
  description: '',
  completion_date: '',
  is_active: true,
};

export default function AdminCompletedWorks() {
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const data = await api.get('/api/admin/completed-works');
      setWorks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load completed works.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { error } = await supabase.storage.from('completed-works').upload(fileName, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('completed-works').getPublicUrl(fileName);
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      setForm(prev => ({ ...prev, media_url: urlData.publicUrl, media_type: mediaType }));
      toast({ title: 'Media uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (work: CompletedWork) => {
    setEditingId(work.id);
    setForm({
      media_url: work.media_url || '',
      media_type: work.media_type || 'image',
      stone_type: work.stone_type || '',
      category: work.category || '',
      customer_name: work.customer_name || '',
      customer_phone: work.customer_phone || '',
      city: work.city || '',
      area: work.area || '',
      description: work.description || '',
      completion_date: work.completion_date || '',
      is_active: work.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.media_url) {
      toast({ title: 'Media required', description: 'Please upload an image or video.', variant: 'destructive' });
      return;
    }
    if (!form.stone_type.trim()) {
      toast({ title: 'Stone type required', description: 'Please enter the stone type.', variant: 'destructive' });
      return;
    }
    if (!form.category) {
      toast({ title: 'Category required', description: 'Please select a category.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/completed-works/${editingId}`, form);
        toast({ title: 'Work updated successfully' });
      } else {
        await api.post('/api/admin/completed-works', form);
        toast({ title: 'Work added successfully' });
      }
      setDialogOpen(false);
      fetchWorks();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/admin/completed-works/${deleteId}`);
      toast({ title: 'Work deleted successfully' });
      fetchWorks();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setDeleteId(null);
  };

  const updateField = (key: keyof WorkForm, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Completed Works"
        description="Manage your completed granite works gallery"
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Work
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No completed works yet</p>
          <p className="text-sm mt-1">Add your first completed work to showcase it</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map((work) => (
            <Card key={work.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {work.media_url ? (
                  work.media_type === 'video' ? (
                    <video src={work.media_url} className="w-full h-full object-cover" preload="metadata" />
                  ) : (
                    <img src={work.media_url} alt={work.stone_type || 'Work'} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No media</div>
                )}
                {!work.is_active && (
                  <Badge variant="secondary" className="absolute top-2 right-2">Inactive</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {work.stone_type && <Badge variant="outline" className="text-xs">{work.stone_type}</Badge>}
                  {work.category && <Badge variant="secondary" className="text-xs">{work.category}</Badge>}
                </div>
                {work.customer_name && <p className="font-medium text-sm">{work.customer_name}</p>}
                {(work.area || work.city) && (
                  <p className="text-xs text-muted-foreground">{[work.area, work.city].filter(Boolean).join(', ')}</p>
                )}
                {work.completion_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(work.completion_date), 'MMM d, yyyy')}
                  </p>
                )}
                <div className="flex gap-1 mt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(work)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(work.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Work' : 'Add New Work'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Media</label>
              {form.media_url ? (
                <div className="relative">
                  {form.media_type === 'video' ? (
                    <video src={form.media_url} className="w-full aspect-video object-cover rounded-lg" preload="metadata" controls />
                  ) : (
                    <img src={form.media_url} alt="Preview" className="w-full aspect-video object-cover rounded-lg" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => updateField('media_url', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload image or video</span>
                    </>
                  )}
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Stone Type</label>
                <Input value={form.stone_type} onChange={e => updateField('stone_type', e.target.value)} placeholder="e.g. Black Galaxy" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Customer Name</label>
                <Input value={form.customer_name} onChange={e => updateField('customer_name', e.target.value)} placeholder="Customer name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Customer Phone</label>
                <Input value={form.customer_phone} onChange={e => updateField('customer_phone', e.target.value)} placeholder="Phone number" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Input value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="City" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Area</label>
                <Input value={form.area} onChange={e => updateField('area', e.target.value)} placeholder="Area / Locality" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Describe the work..." rows={3} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Completion Date</label>
              <Input type="date" value={form.completion_date} onChange={e => updateField('completion_date', e.target.value)} />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => updateField('is_active', v)} />
              <label className="text-sm font-medium">Active (visible to public)</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this completed work? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
