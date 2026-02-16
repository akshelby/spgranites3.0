import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-foreground text-background relative overflow-hidden" data-testid="cta-section">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--background)) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight" data-testid="text-cta-title">
            Transform Your Space with Premium Stone
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-60 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Get a free consultation and estimate for your next project. Our team of experts is ready to bring your vision to life.
          </p>
          <Link
            to="/estimation"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-destructive to-[hsl(0,72%,40%)] shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40 hover:scale-105 transition-all duration-300"
            data-testid="button-cta-quote"
          >
            Request a Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
