import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/database';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data) {
      setServices(data as Service[]);
    }
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
            What We Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
            data-testid="text-services-title"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            From consultation to installation, we provide comprehensive stone solutions.
          </motion.p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 sm:h-44 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card rounded-lg border border-border overflow-hidden hover-elevate transition-all"
                data-testid={`card-service-${service.id}`}
              >
                {service.image_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold mb-1">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-1">
                    {service.short_description}
                  </p>
                  {service.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
