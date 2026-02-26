import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { SPLoader } from '@/components/ui/SPLoader';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/database';
import { useTranslation } from 'react-i18next';
import { Scissors, Wrench, Sparkles, Palette, Truck, Hammer, HardHat, Ruler, Settings } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

const serviceIconMap: Record<string, React.ElementType> = {
  'fabrication': Scissors,
  'cutting': Scissors,
  'installation': Wrench,
  'polishing': Sparkles,
  'restoration': Sparkles,
  'design': Palette,
  'consultation': Palette,
  'delivery': Truck,
  'construction': HardHat,
  'measurement': Ruler,
  'repair': Hammer,
};

function getServiceIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [keyword, icon] of Object.entries(serviceIconMap)) {
    if (lower.includes(keyword)) return icon;
  }
  return Settings;
}

export default function ServicesPage() {
  usePageTitle('Our Services');
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data) setServices(data as unknown as Service[]);
    } catch {}
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-6 sm:mb-10">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
          >
            {t('services.label')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
            data-testid="text-services-title"
          >
            {t('services.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            {t('services.pageSubtitle')}
          </motion.p>
        </div>

        {loading ? (
          <SPLoader size="lg" text="Loading services..." fullPage />
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">{t('services.noServices')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map((service, index) => {
              const Icon = getServiceIcon(service.name);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  data-testid={`card-service-${service.id}`}
                >
                  {service.image_url && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {service.short_description}
                        </p>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3 border-t border-border/50 pt-3">
                        {service.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
