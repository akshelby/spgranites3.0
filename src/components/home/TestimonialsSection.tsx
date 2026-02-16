import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial } from '@/types/database';

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase.from('testimonials').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
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
      setTestimonials([
        { id: '1', customer_name: 'Rajesh Kumar', company: 'Home Owner', designation: null, review_text: 'Excellent quality granite and professional installation. The team was punctual and the work was completed perfectly.', rating: 5, image_url: null, is_active: true, display_order: 1, created_at: '', updated_at: '' },
        { id: '2', customer_name: 'Priya Sharma', company: 'Interior Designer', designation: 'Lead Designer', review_text: 'I recommend SP Granites to all my clients. Their marble collection is stunning and the craftsmanship is top-notch.', rating: 5, image_url: null, is_active: true, display_order: 2, created_at: '', updated_at: '' },
        { id: '3', customer_name: 'Anand Builders', company: 'Construction Company', designation: 'Project Manager', review_text: 'We have been working with SP Granites for over 5 years. Reliable, quality products, and excellent customer service.', rating: 5, image_url: null, is_active: true, display_order: 3, created_at: '', updated_at: '' },
      ]);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-muted/40" data-testid="testimonials-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8 lg:mb-12"
        >
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider" data-testid="text-testimonials-label">{t('testimonials.label')}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black mt-2 sm:mt-3 mb-3 sm:mb-5 leading-tight tracking-tight" data-testid="text-testimonials-title">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-4 sm:p-5 lg:p-8 rounded-2xl border border-border/40 shadow-soft hover:shadow-float hover:-translate-y-2 transition-all duration-500 relative"
              data-testid={`testimonial-card-${testimonial.id}`}
            >
              <Quote className="absolute top-3 right-3 h-5 w-5 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary/15" />
              <div className="flex gap-0.5 mb-2 sm:mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 sm:mb-6 line-clamp-3 sm:line-clamp-4 lg:line-clamp-none">
                "{testimonial.review_text}"
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm lg:text-base">
                  {testimonial.customer_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm lg:text-base font-semibold">{testimonial.customer_name}</h4>
                  {testimonial.company && (
                    <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                      {testimonial.designation && `${testimonial.designation}, `}
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
