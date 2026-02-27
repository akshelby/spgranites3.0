import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, PenLine, X, Play, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial, CustomerReview } from '@/types/database';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const defaultTestimonials: Testimonial[] = [
  { id: '1', customer_name: 'Rajesh Kumar', company: 'Home Owner', designation: null, review_text: 'Excellent quality granite and professional installation. The team was punctual and the work was completed perfectly.', rating: 5, image_url: null, is_active: true, display_order: 1, created_at: '', updated_at: '' },
  { id: '2', customer_name: 'Priya Sharma', company: 'Interior Designer', designation: 'Lead Designer', review_text: 'I recommend SP Granites to all my clients. Their marble collection is stunning and the craftsmanship is top-notch.', rating: 5, image_url: null, is_active: true, display_order: 2, created_at: '', updated_at: '' },
  { id: '3', customer_name: 'Anand Builders', company: 'Construction Company', designation: 'Project Manager', review_text: 'We have been working with SP Granites for over 5 years. Reliable, quality products, and excellent customer service.', rating: 5, image_url: null, is_active: true, display_order: 3, created_at: '', updated_at: '' },
];

function MediaGallery({ photos, videoUrl }: { photos?: string[]; videoUrl?: string | null }) {
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const hasMedia = (photos && photos.length > 0) || videoUrl;
  if (!hasMedia) return null;

  return (
    <>
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {photos?.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedMedia({ type: 'image', url })}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        {videoUrl && (
          <button
            type="button"
            onClick={() => setSelectedMedia({ type: 'video', url: videoUrl })}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer bg-black/80 flex items-center justify-center relative"
          >
            <Play className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-w-3xl max-h-[80vh] w-full" onClick={e => e.stopPropagation()}>
              {selectedMedia.type === 'image' ? (
                <img src={selectedMedia.url} alt="" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <video src={selectedMedia.url} controls autoPlay className="w-full max-h-[80vh] rounded-lg" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { t } = useTranslation();

  const fetchTestimonials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setTestimonials(data as Testimonial[]);
      } else {
        setTestimonials(defaultTestimonials);
      }
    } catch {
      setTestimonials(defaultTestimonials);
    }
  }, []);

  const fetchCustomerReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && Array.isArray(data)) {
        setCustomerReviews(data as CustomerReview[]);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
    fetchCustomerReviews();

    const channel = supabase
      .channel('customer_reviews_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_reviews' }, () => {
        fetchCustomerReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTestimonials, fetchCustomerReviews]);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchCustomerReviews();
  };

  return (
    <section className="py-8 sm:py-10 lg:py-14 bg-muted/30" data-testid="testimonials-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-3 sm:mb-6 lg:mb-8"
        >
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-testid="text-testimonials-label">{t('testimonials.label')}</span>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mt-1 sm:mt-1.5 mb-1.5 sm:mb-3 leading-tight heading-stylish" data-testid="text-testimonials-title">
            {t('testimonials.title')}
          </h3>
          <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {customerReviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3 lg:gap-5 mb-4 sm:mb-6">
            {customerReviews.map((review) => (
              <div
                key={review.id}
                className="bg-card p-3 sm:p-4 lg:p-6 rounded-2xl border border-border/60 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  {review.created_at && (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground/70">
                      <Calendar className="h-2.5 w-2.5" />
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-4 flex-1">
                  "{review.review_text}"
                </p>

                <MediaGallery photos={review.photos} videoUrl={review.video_url} />

                <div className="flex items-center gap-1.5 sm:gap-2.5 mt-auto pt-1.5 sm:pt-2 border-t border-border/40">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px] sm:text-xs lg:text-sm">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] sm:text-xs lg:text-sm font-semibold truncate">{review.customer_name}</h4>
                    {review.city && (
                      <p className="text-[10px] sm:text-[10px] lg:text-xs text-muted-foreground truncate">
                        {review.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3 lg:gap-5">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card p-3 sm:p-4 lg:p-6 rounded-2xl border border-border/60 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
              data-testid={`testimonial-card-${testimonial.id}`}
            >
              <Quote className="absolute top-2 right-2 h-3.5 w-3.5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary/15" />

              {testimonial.image_url && (
                <div className="mb-2 sm:mb-3 rounded-xl overflow-hidden aspect-[4/3]">
                  <img
                    src={testimonial.image_url}
                    alt={`Review by ${testimonial.customer_name}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 ${
                        i < testimonial.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                {testimonial.created_at && (
                  <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground/70">
                    <Calendar className="h-2.5 w-2.5" />
                    {format(new Date(testimonial.created_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>

              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-3 sm:line-clamp-4 lg:line-clamp-none flex-1">
                "{testimonial.review_text}"
              </p>

              <div className="flex items-center gap-1.5 sm:gap-2.5 mt-auto pt-1.5 sm:pt-2 border-t border-border/40">
                {testimonial.image_url ? (
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.customer_name}
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px] sm:text-xs lg:text-sm">
                    {testimonial.customer_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-[10px] sm:text-xs lg:text-sm font-semibold truncate">{testimonial.customer_name}</h4>
                  {testimonial.company && (
                    <p className="text-[10px] sm:text-[10px] lg:text-xs text-muted-foreground truncate">
                      {testimonial.designation && `${testimonial.designation}, `}
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-5 sm:mt-8 flex justify-center"
        >
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant={showReviewForm ? "outline" : "default"}
            className="gap-2"
          >
            {showReviewForm ? (
              <>
                <X className="h-4 w-4" />
                Close
              </>
            ) : (
              <>
                <PenLine className="h-4 w-4" />
                Write a Review
              </>
            )}
          </Button>
        </motion.div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="max-w-2xl mx-auto mt-4 sm:mt-6">
                <ReviewForm
                  onSuccess={handleReviewSuccess}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
