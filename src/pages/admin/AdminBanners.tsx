import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Image } from 'lucide-react';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchBanners();
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

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setBanners((data as any) || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({ title: 'Error', description: 'Failed to load banners.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bannerData = {
        title: formData.title || null,
        subtitle: formData.subtitle || null,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        button_text: formData.button_text || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData as any)
          .eq('id', editingBanner.id);
        if (error) throw error;
        toast({ title: 'Banner updated' });
      } else {
        const { error } = await supabase
          .from('banners')
          .insert(bannerData as any);
        if (error) throw error;
        toast({ title: 'Banner created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Banner deleted' });
      fetchBanners();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      button_text: '',
      display_order: 0,
      is_active: true,
    });
  };

  const columns = [
    {
      key: 'title',
      header: 'Banner',
      render: (banner: Banner) => (
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {banner.image_url ? (
              <img src={banner.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">{banner.title || 'Untitled'}</p>
            <p className="text-sm text-muted-foreground">{banner.subtitle || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'display_order',
      header: 'Order',
      render: (banner: Banner) => <Badge variant="secondary">{banner.display_order}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (banner: Banner) => (
        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
          {banner.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (banner: Banner) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Banners"
        description="Manage promotional banners"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link_url">Link URL</Label>
                    <Input
                      id="link_url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button_text">Button Text</Label>
                    <Input
                      id="button_text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBanner ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={banners}
        loading={loading}
        emptyMessage="No banners yet"
      />
    </AdminLayout>
  );
}
