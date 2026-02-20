import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Settings, Sparkles, Hammer, MessageCircle, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/database';

const serviceIconMap: Record<string, typeof Wrench> = {
  installation: Wrench,
  fabrication: Settings,
  polishing: Sparkles,
  repair: Hammer,
  consultation: MessageCircle,
  design: Ruler,
};

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setServices(data as Service[]);
      } else {
        setServices([
          { id: '1', name: 'Installation', slug: 'installation', short_description: t('services.installationDesc'), description: null, image_url: null, icon: 'installation', display_order: 1, is_active: true, created_at: '', updated_at: '' },
          { id: '2', name: 'Fabrication', slug: 'fabrication', short_description: t('services.fabricationDesc'), description: null, image_url: null, icon: 'fabrication', display_order: 2, is_active: true, created_at: '', updated_at: '' },
          { id: '3', name: 'Polishing', slug: 'polishing', short_description: t('services.polishingDesc'), description: null, image_url: null, icon: 'polishing', display_order: 3, is_active: true, created_at: '', updated_at: '' },
          { id: '4', name: 'Repair', slug: 'repair', short_description: t('services.repairDesc'), description: null, image_url: null, icon: 'repair', display_order: 4, is_active: true, created_at: '', updated_at: '' },
        ]);
      }
    } catch {
      setServices([
        { id: '1', name: 'Installation', slug: 'installation', short_description: t('services.installationDesc'), description: null, image_url: null, icon: 'installation', display_order: 1, is_active: true, created_at: '', updated_at: '' },
        { id: '2', name: 'Fabrication', slug: 'fabrication', short_description: t('services.fabricationDesc'), description: null, image_url: null, icon: 'fabrication', display_order: 2, is_active: true, created_at: '', updated_at: '' },
        { id: '3', name: 'Polishing', slug: 'polishing', short_description: t('services.polishingDesc'), description: null, image_url: null, icon: 'polishing', display_order: 3, is_active: true, created_at: '', updated_at: '' },
        { id: '4', name: 'Repair', slug: 'repair', short_description: t('services.repairDesc'), description: null, image_url: null, icon: 'repair', display_order: 4, is_active: true, created_at: '', updated_at: '' },
      ]);
    }
  };

  return (
    <section className="py-8 sm:py-10 lg:py-14 bg-background" data-testid="services-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-3 sm:mb-6 lg:mb-8"
        >
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-testid="text-services-label">{t('services.label')}</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mt-1 sm:mt-1.5 mb-1.5 sm:mb-3 leading-tight" data-testid="text-services-title">
            {t('services.title')}
          </h2>
          <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-5">
          {services.map((service, index) => {
            const IconComponent = serviceIconMap[service.icon || service.slug] || Wrench;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group p-2.5 sm:p-3 lg:p-6 bg-card rounded-2xl border border-border/60 shadow-soft hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                data-testid={`service-card-${service.id}`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                  <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                </div>
                <h3 className="text-xs sm:text-sm lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-2">
                  {service.name}
                </h3>
                <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground line-clamp-2 lg:line-clamp-3">
                  {service.short_description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-10"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
            data-testid="link-view-all-services"
          >
            {t('services.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
