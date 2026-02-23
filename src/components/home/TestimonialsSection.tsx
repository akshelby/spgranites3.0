import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Testimonial } from '@/types/database';

const defaultTestimonials: Testimonial[] = [
  { id: '1', customer_name: 'Rajesh Kumar', company: 'Home Owner', designation: null, review_text: 'Excellent quality granite and professional installation. The team was punctual and the work was completed perfectly.', rating: 5, image_url: null, is_active: true, display_order: 1, created_at: '', updated_at: '' },
  { id: '2', customer_name: 'Priya Sharma', company: 'Interior Designer', designation: 'Lead Designer', review_text: 'I recommend SP Granites to all my clients. Their marble collection is stunning and the craftsmanship is top-notch.', rating: 5, image_url: null, is_active: true, display_order: 2, created_at: '', updated_at: '' },
  { id: '3', customer_name: 'Anand Builders', company: 'Construction Company', designation: 'Project Manager', review_text: 'We have been working with SP Granites for over 5 years. Reliable, quality products, and excellent customer service.', rating: 5, image_url: null, is_active: true, display_order: 3, created_at: '', updated_at: '' },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const { t } = useTranslation();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await api.get('/api/testimonials');
      if (data && data.length > 0) {
        setTestimonials(data as Testimonial[]);
      } else {
        setTestimonials([
          { id: '1', customer_name: 'Rajesh Kumar', company: 'Home Owner', designation: null, review_text: 'Excellent quality granite and professional installation. The team was punctual and the work was completed perfectly.', rating: 5, image_url: null, is_active: true, display_order: 1, created_at: '', updated_at: '' },
          { id: '2', customer_name: 'Priya Sharma', company: 'Interior Designer', designation: 'Lead Designer', review_text: 'I recommend SP Granites to all my clients. Their marble collection is stunning and the craftsmanship is top-notch.', rating: 5, image_url: null, is_active: true, display_order: 2, created_at: '', updated_at: '' },
          { id: '3', customer_name: 'Anand Builders', company: 'Construction Company', designation: 'Project Manager', review_text: 'We have been working with SP Granites for over 5 years. Reliable, quality products, and excellent customer service.', rating: 5, image_url: null, is_active: true, display_order: 3, created_at: '', updated_at: '' },
        ]);
      }
    } catch {
      setTestimonials(defaultTestimonials);
    }
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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mt-1 sm:mt-1.5 mb-1.5 sm:mb-3 leading-tight" data-testid="text-testimonials-title">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3 lg:gap-5">
          {testimonials.map((testimonial, index) => (
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

              <div className="flex gap-0.5 mb-1 sm:mb-2">
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
      </div>
    </section>
  );
}
