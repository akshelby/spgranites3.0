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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    icon: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        short_description: formData.short_description || null,
        description: formData.description || null,
        icon: formData.icon || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: 'Service updated' });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
        toast({ title: 'Service created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug,
      short_description: service.short_description || '',
      description: service.description || '',
      icon: service.icon || '',
      display_order: service.display_order,
      is_active: service.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Service deleted' });
      fetchServices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      icon: '',
      display_order: 0,
      is_active: true,
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Service',
      render: (service: Service) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
            {service.icon || '🔧'}
          </div>
          <div>
            <p className="font-medium">{service.name}</p>
            <p className="text-sm text-muted-foreground">{service.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'short_description',
      header: 'Description',
      render: (service: Service) => (
        <p className="max-w-md truncate text-sm text-muted-foreground">
          {service.short_description || '-'}
        </p>
      ),
    },
    {
      key: 'display_order',
      header: 'Order',
      render: (service: Service) => <Badge variant="secondary">{service.display_order}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (service: Service) => (
        <Badge variant={service.is_active ? 'default' : 'secondary'}>
          {service.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (service: Service) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Services"
        description="Manage your service offerings"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🔧"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
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
                    {editingService ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={services}
        loading={loading}
        emptyMessage="No services yet"
      />
    </AdminLayout>
  );
}
