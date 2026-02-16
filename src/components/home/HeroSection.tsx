import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroCountertopImg from '@/assets/hero-countertop.jpg';

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center bg-background relative overflow-hidden" data-testid="hero-section">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-6 sm:mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide">
                S P Granites — Since 2014
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6"
              data-testid="text-hero-title"
            >
              Premium Granite{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(0,0%,15%)] to-[hsl(220,60%,30%)] dark:from-[hsl(0,0%,90%)] dark:to-[hsl(220,60%,70%)]">
                &amp; Quartz
              </span>{' '}
              Countertops
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-10 max-w-xl mx-auto lg:mx-0"
              data-testid="text-hero-subtitle"
            >
              Custom-designed stone surfaces crafted with precision and elegance
              for kitchens, offices, and commercial spaces.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/estimation"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-destructive to-[hsl(0,72%,40%)] shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:scale-105 transition-all duration-300"
                data-testid="button-get-estimate"
              >
                Get Free Estimate
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold border-2 border-border text-foreground hover:bg-muted hover:scale-105 transition-all duration-300 shadow-sm"
                data-testid="button-view-work"
              >
                View Our Work
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-foreground/10">
                <img
                  src={heroCountertopImg}
                  alt="Premium granite countertop in a luxury kitchen"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[560px] object-cover"
                />
              </div>
              {/* Soft glow behind image */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-muted via-transparent to-muted opacity-60 blur-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
