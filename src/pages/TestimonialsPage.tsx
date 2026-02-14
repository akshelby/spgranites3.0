import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { api } from '@/lib/api';
import { Testimonial, CustomerReview } from '@/types/database';
import { useTranslation } from 'react-i18next';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testimonialData, reviewData] = await Promise.all([
        api.get('/api/testimonials'),
        api.get('/api/customer-reviews'),
      ]);
      if (testimonialData) setTestimonials(testimonialData as Testimonial[]);
      if (reviewData) setCustomerReviews(reviewData as CustomerReview[]);
    } catch {}
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
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
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            {t('testimonials.subtitle')}
          </motion.p>
        </div>

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
                            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                              i < testimonial.rating
                                ? 'text-primary fill-primary'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3">
                        "{testimonial.review_text}"
                      </p>
                      <div className="flex items-center gap-2">
                        {testimonial.image_url ? (
                          <img
                            src={testimonial.image_url}
                            alt={testimonial.customer_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                            {testimonial.customer_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold">{testimonial.customer_name}</h4>
                          {testimonial.company && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
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
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-card p-3 sm:p-4 rounded-lg border border-border"
                      data-testid={`card-review-${review.id}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {review.profile_photo_url ? (
                          <img
                            src={review.profile_photo_url}
                            alt={review.customer_name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                            {review.customer_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs sm:text-sm font-semibold truncate">{review.customer_name}</h4>
                            <div className="flex gap-0.5 shrink-0">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                                    i < review.rating
                                      ? 'text-primary fill-primary'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {(review.city || review.area_name) && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                              {[review.area_name, review.city].filter(Boolean).join(', ')}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {review.review_text}
                          </p>
                          {review.photos && review.photos.length > 0 && (
                            <div className="flex gap-1.5 mt-2 overflow-x-auto">
                              {review.photos.map((photo, i) => (
                                <img
                                  key={i}
                                  src={photo}
                                  alt={`Review photo ${i + 1}`}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover shrink-0"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
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
    </MainLayout>
  );
}
