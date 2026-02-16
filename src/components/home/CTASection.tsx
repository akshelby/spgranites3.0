import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-foreground text-background relative overflow-hidden" data-testid="cta-section">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-destructive/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[hsl(220,60%,30%)]/10 blur-3xl"
      />

      {/* Dot pattern */}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-background/20 mb-6 sm:mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs sm:text-sm font-medium opacity-70">Free Consultation Available</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight" data-testid="text-cta-title">
            Transform Your Space with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-[hsl(0,72%,55%)]">
              Premium Stone
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-60 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Get a free consultation and estimate for your next project. Our team of experts is ready to bring your vision to life.
          </p>
          <Link
            to="/estimation"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-destructive to-[hsl(0,72%,40%)] shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40 hover:scale-105 transition-all duration-300 relative overflow-hidden"
            data-testid="button-cta-quote"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            Request a Quote
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
