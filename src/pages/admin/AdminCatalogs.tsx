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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Download, FileText } from 'lucide-react';

interface Catalog {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCatalogs();
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

  const fetchCatalogs = async () => {
    try {
      const data = await api.get('/api/admin/catalogs');
      setCatalogs(data || []);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast({ title: 'Error', description: 'Failed to load catalogs.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const catalogData = {
        title: formData.title,
        description: formData.description || null,
        file_url: formData.file_url,
        is_active: formData.is_active,
      };

      if (editingCatalog) {
        await api.put(`/api/admin/catalogs/${editingCatalog.id}`, catalogData);
        toast({ title: 'Catalog updated' });
      } else {
        await api.post('/api/admin/catalogs', catalogData);
        toast({ title: 'Catalog created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchCatalogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setFormData({
      title: catalog.title,
      description: catalog.description || '',
      file_url: catalog.file_url,
      is_active: catalog.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalog?')) return;

    try {
      await api.delete(`/api/admin/catalogs/${id}`);
      toast({ title: 'Catalog deleted' });
      fetchCatalogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingCatalog(null);
    setFormData({ title: '', description: '', file_url: '', is_active: true });
  };

  const columns = [
    {
      key: 'title',
      header: 'Catalog',
      render: (catalog: Catalog) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{catalog.title}</p>
            <p className="max-w-xs truncate text-sm text-muted-foreground">
              {catalog.description || '-'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'download_count',
      header: 'Downloads',
      render: (catalog: Catalog) => (
        <div className="flex items-center gap-1 text-sm">
          <Download className="h-4 w-4 text-muted-foreground" />
          {catalog.download_count}
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (catalog: Catalog) => (
        <Badge variant={catalog.is_active ? 'default' : 'secondary'}>
          {catalog.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (catalog: Catalog) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(catalog)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(catalog.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Catalogs"
        description="Manage downloadable catalogs"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Catalog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCatalog ? 'Edit Catalog' : 'Add Catalog'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_url">File URL</Label>
                  <Input
                    id="file_url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://..."
                    required
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

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCatalog ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={catalogs}
        loading={loading}
        emptyMessage="No catalogs yet"
      />
    </AdminLayout>
  );
}
