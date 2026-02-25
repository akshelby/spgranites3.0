import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';


export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-8 sm:py-10 lg:py-14 bg-primary text-primary-foreground relative overflow-hidden" data-testid="cta-section">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold mb-2 sm:mb-4 heading-stylish text-emerald-300" data-testid="text-cta-title">
            {t('cta.title')}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base opacity-85 mb-3 sm:mb-6">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-5 sm:gap-6 justify-center items-center">
            <Link
              to="/estimation"
              className="cta-ribbon-btn cta-ribbon-btn-cta-dark group"
              data-testid="button-cta-estimation"
            >
              <span className="cta-ribbon-btn-inner">
                {t('cta.getEstimation')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a
              href="tel:+919876543210"
              className="cta-ribbon-btn cta-ribbon-btn-cta-outline group"
              data-testid="button-cta-call"
            >
              <span className="cta-ribbon-btn-inner">
                <Phone className="mr-2 h-4 w-4" />
                {t('cta.callUs')}
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
