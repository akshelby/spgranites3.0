import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Clock, Gem, Zap } from 'lucide-react';

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  { icon: Briefcase, value: 500, suffix: '+', label: 'Projects Completed' },
  { icon: Clock, value: 10, suffix: '+', label: 'Years Experience' },
  { icon: Gem, value: 100, suffix: '%', label: 'Premium Quality Materials' },
  { icon: Zap, value: 48, suffix: 'hr', label: 'Fast Installation' },
];

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-background" data-testid="stats-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14 lg:mb-16"
        >
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            Why Us
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 sm:mt-3 tracking-tight">
            Why Choose S P Granites
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center p-5 sm:p-6 lg:p-8 rounded-2xl bg-muted/40 border border-border/50"
              data-testid={`stat-${index}`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1 sm:mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
