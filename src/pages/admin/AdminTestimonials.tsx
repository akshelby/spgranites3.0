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
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  customer_name: string;
  designation: string | null;
  company: string | null;
  review_text: string;
  rating: number;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    designation: '',
    company: '',
    review_text: '',
    rating: 5,
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchTestimonials();
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

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setTestimonials((data as any) || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({ title: 'Error', description: 'Failed to load testimonials.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const testimonialData = {
        customer_name: formData.customer_name,
        designation: formData.designation || null,
        company: formData.company || null,
        review_text: formData.review_text,
        rating: formData.rating,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData as any)
          .eq('id', editingTestimonial.id);
        if (error) throw error;
        toast({ title: 'Testimonial updated' });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialData as any);
        if (error) throw error;
        toast({ title: 'Testimonial created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customer_name: testimonial.customer_name,
      designation: testimonial.designation || '',
      company: testimonial.company || '',
      review_text: testimonial.review_text,
      rating: testimonial.rating,
      display_order: testimonial.display_order,
      is_active: testimonial.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Testimonial deleted' });
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      customer_name: '',
      designation: '',
      company: '',
      review_text: '',
      rating: 5,
      display_order: 0,
      is_active: true,
    });
  };

  const columns = [
    {
      key: 'customer_name',
      header: 'Customer',
      render: (t: Testimonial) => (
        <div>
          <p className="font-medium">{t.customer_name}</p>
          <p className="text-sm text-muted-foreground">
            {[t.designation, t.company].filter(Boolean).join(' at ') || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (t: Testimonial) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'review_text',
      header: 'Review',
      render: (t: Testimonial) => (
        <p className="max-w-md truncate text-sm text-muted-foreground">{t.review_text}</p>
      ),
    },
    {
      key: 'display_order',
      header: 'Order',
      render: (t: Testimonial) => <Badge variant="secondary">{t.display_order}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (t: Testimonial) => (
        <Badge variant={t.is_active ? 'default' : 'secondary'}>
          {t.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (t: Testimonial) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Testimonials"
        description="Manage customer testimonials"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review_text">Review</Label>
                  <Textarea
                    id="review_text"
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    />
                  </div>
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
                    {editingTestimonial ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={testimonials}
        loading={loading}
        emptyMessage="No testimonials yet"
      />
    </AdminLayout>
  );
}
