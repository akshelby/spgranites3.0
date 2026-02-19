import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Pencil, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial, CustomerReview } from '@/types/database';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { toast } from 'sonner';
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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [myReviews, setMyReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<{ photos: string[]; index: number } | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [testimonialRes, reviewRes] = await Promise.all([
        supabase.from('testimonials').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        supabase.from('customer_reviews').select('*').order('created_at', { ascending: false }),
      ]);
      if (testimonialRes.data) setTestimonials(testimonialRes.data as Testimonial[]);
      if (reviewRes.data) setCustomerReviews(reviewRes.data as CustomerReview[]);

      if (user) {
        const { data } = await supabase.from('customer_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setMyReviews(data as CustomerReview[]);
      } else {
        setMyReviews([]);
      }
    } catch {}
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', deleteId)
        .eq('user_id', user!.id) as any;
      if (error) throw error;
      toast.success('Review deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete review');
    }
    setDeleteId(null);
  };

  const isMyReview = (reviewId: string) => {
    return myReviews.some(r => r.id === reviewId);
  };

  const getMyReview = (reviewId: string) => {
    return myReviews.find(r => r.id === reviewId) || null;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-sm sm:text-base uppercase tracking-wide"
          >
            {t('testimonials.pageLabel')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
            data-testid="text-testimonials-title"
          >
            {t('testimonials.pageTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto"
          >
            {t('testimonials.subtitle')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          {editingReview ? (
            <ReviewForm
              editReview={editingReview}
              onSuccess={() => { setEditingReview(null); fetchData(); }}
              onCancel={() => setEditingReview(null)}
            />
          ) : (
            <ReviewForm onSuccess={() => fetchData()} />
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 sm:h-40 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {testimonials.length > 0 && (
              <section className="mb-6 sm:mb-10">
                <h2 className="text-lg sm:text-xl font-display font-bold mb-3 sm:mb-4">
                  {t('testimonials.featuredTestimonials')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card p-3 sm:p-4 rounded-lg border border-border relative"
                      data-testid={`card-testimonial-${testimonial.id}`}
                    >
                      <Quote className="absolute top-2.5 right-2.5 h-5 w-5 sm:h-6 sm:w-6 text-primary/20" />
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              i < testimonial.rating
                                ? 'text-primary fill-primary'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground mb-3 line-clamp-3">
                        "{testimonial.review_text}"
                      </p>
                      <div className="flex items-center gap-2">
                        {testimonial.image_url ? (
                          <img
                            src={testimonial.image_url}
                            alt={testimonial.customer_name}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {testimonial.customer_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold">{testimonial.customer_name}</h4>
                          {testimonial.company && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {testimonial.designation && `${testimonial.designation}, `}
                              {testimonial.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {customerReviews.length > 0 && (
              <section>
                <h2 className="text-lg sm:text-xl font-display font-bold mb-3 sm:mb-4">
                  {t('testimonials.customerReviews')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {customerReviews.map((review, index) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={index}
                      isOwner={isMyReview(review.id)}
                      onEdit={() => { const r = getMyReview(review.id); if (r) setEditingReview(r); }}
                      onDelete={() => setDeleteId(review.id)}
                      onPhotoClick={(photos, idx) => setShowPhotoModal({ photos, index: idx })}
                    />
                  ))}
                </div>
              </section>
            )}

            {testimonials.length === 0 && customerReviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">{t('testimonials.noReviews')}</p>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
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

      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(null)}
        >
          <img
            src={showPhotoModal.photos[showPhotoModal.index]}
            alt="Review photo"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </MainLayout>
  );
}

interface ReviewCardProps {
  review: CustomerReview;
  index: number;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPhotoClick: (photos: string[], index: number) => void;
}

function ReviewCard({ review, index, isOwner, onEdit, onDelete, onPhotoClick }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card p-3 sm:p-4 rounded-lg border border-border relative"
      data-testid={`card-review-${review.id}`}
    >
      {isOwner && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
            title="Edit review"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            title="Delete review"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-2.5">
        {review.profile_photo_url ? (
          <img
            src={review.profile_photo_url}
            alt={review.customer_name}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {review.customer_name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5 pr-16">
            <h4 className="text-sm sm:text-base font-semibold truncate">{review.customer_name}</h4>
            <div className="flex gap-0.5 shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    i < review.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          {(review.city || review.area_name) && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {[review.area_name, review.city].filter(Boolean).join(', ')}
            </p>
          )}
          <p className="text-sm sm:text-base text-muted-foreground">
            {review.review_text}
          </p>

          {review.photos && review.photos.length > 0 && (
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {review.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`Review photo ${i + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  loading="lazy"
                  onClick={() => onPhotoClick(review.photos, i)}
                />
              ))}
            </div>
          )}

          {review.video_url && (
            <div className="mt-2">
              <video
                src={review.video_url}
                controls
                className="w-full max-w-xs rounded-lg border border-border"
                preload="metadata"
              />
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
