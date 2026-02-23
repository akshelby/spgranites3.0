import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Star, Image, Video, Eye } from 'lucide-react';
import { format } from 'date-fns';
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

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  photos: string[];
  video_url: string | null;
  city: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewReview, setPreviewReview] = useState<Review | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const data = await api.get('/api/admin/reviews');
      setReviews((data?.customerReviews || []) as Review[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({ title: 'Error', description: 'Failed to load reviews.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/admin/customer-reviews/${deleteId}`);
      toast({ title: 'Review removed for violating rules' });
      fetchReviews();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setDeleteId(null);
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
      key: 'media',
      header: 'Media',
      render: (review: Review) => (
        <div className="flex items-center gap-2">
          {review.photos && review.photos.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Image className="h-3.5 w-3.5" /> {review.photos.length}
            </span>
          )}
          {review.video_url && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Video className="h-3.5 w-3.5" />
            </span>
          )}
          {(!review.photos || review.photos.length === 0) && !review.video_url && (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
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
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (review: Review) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setPreviewReview(review)} title="Preview review">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(review.id)} title="Remove review">
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
        description="View and remove reviews that violate rules"
      />

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyMessage="No reviews yet"
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this review? This will permanently delete it because it violates the rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewReview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreviewReview(null)}>
          <div className="bg-card rounded-xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Review by {previewReview.customer_name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewReview(null)}>Close</Button>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < previewReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
              ))}
              {previewReview.city && <span className="text-sm text-muted-foreground ml-2">from {previewReview.city}</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{previewReview.review_text}</p>
            {previewReview.photos && previewReview.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previewReview.photos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Photo ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                ))}
              </div>
            )}
            {previewReview.video_url && (
              <video src={previewReview.video_url} controls className="w-full rounded-lg" preload="metadata" />
            )}
            <div className="flex justify-end mt-4">
              <Button variant="destructive" size="sm" onClick={() => { setDeleteId(previewReview.id); setPreviewReview(null); }}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
