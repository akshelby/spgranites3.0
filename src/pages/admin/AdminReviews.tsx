import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  city: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ is_approved: approved })
        .eq('id', id);
      if (error) throw error;
      toast({ title: approved ? 'Review approved' : 'Review rejected' });
      fetchReviews();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Review deleted' });
      fetchReviews();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const columns = [
    {
      key: 'customer_name',
      header: 'Customer',
      render: (review: Review) => (
        <div>
          <p className="font-medium">{review.customer_name}</p>
          <p className="text-sm text-muted-foreground">{review.city || '-'}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (review: Review) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'review_text',
      header: 'Review',
      render: (review: Review) => (
        <p className="max-w-md truncate text-sm text-muted-foreground">
          {review.review_text || '-'}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (review: Review) => (
        <p className="text-sm text-muted-foreground">
          {format(new Date(review.created_at), 'MMM d, yyyy')}
        </p>
      ),
    },
    {
      key: 'is_approved',
      header: 'Status',
      render: (review: Review) => (
        <Badge variant={review.is_approved ? 'default' : 'secondary'}>
          {review.is_approved ? 'Approved' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (review: Review) => (
        <div className="flex gap-1">
          {!review.is_approved ? (
            <Button variant="ghost" size="icon" onClick={() => toggleApproval(review.id, true)}>
              <Check className="h-4 w-4 text-emerald-600" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => toggleApproval(review.id, false)}>
              <X className="h-4 w-4 text-amber-600" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Customer Reviews"
        description="Manage and approve customer reviews"
      />

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyMessage="No reviews yet"
      />
    </AdminLayout>
  );
}
