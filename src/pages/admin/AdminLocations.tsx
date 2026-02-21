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
import { Plus, Pencil, Trash2, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  google_maps_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    google_maps_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchLocations();
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

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('store_locations')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({ title: 'Error', description: 'Failed to load locations.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const locationData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || null,
        email: formData.email || null,
        google_maps_url: formData.google_maps_url || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('store_locations')
          .update(locationData)
          .eq('id', editingLocation.id);
        if (error) throw error;
        toast({ title: 'Location updated' });
      } else {
        const { error } = await supabase
          .from('store_locations')
          .insert(locationData);
        if (error) throw error;
        toast({ title: 'Location created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      phone: location.phone || '',
      email: location.email || '',
      google_maps_url: location.google_maps_url || '',
      display_order: location.display_order,
      is_active: location.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('store_locations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Location deleted' });
      fetchLocations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      google_maps_url: '',
      display_order: 0,
      is_active: true,
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Location',
      render: (location: Location) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{location.name}</p>
            <p className="max-w-xs truncate text-sm text-muted-foreground">{location.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (location: Location) => (
        <div className="space-y-1">
          {location.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {location.phone}
            </div>
          )}
          {location.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              {location.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'display_order',
      header: 'Order',
      render: (location: Location) => <Badge variant="secondary">{location.display_order}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (location: Location) => (
        <Badge variant={location.is_active ? 'default' : 'secondary'}>
          {location.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (location: Location) => (
        <div className="flex gap-1">
          {location.google_maps_url && (
            <Button variant="ghost" size="icon" asChild>
              <a href={location.google_maps_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(location.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Store Locations"
        description="Manage your store locations"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_maps_url">Google Maps URL</Label>
                  <Input
                    id="google_maps_url"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
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
                    {editingLocation ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={locations}
        loading={loading}
        emptyMessage="No store locations yet"
      />
    </AdminLayout>
  );
}
