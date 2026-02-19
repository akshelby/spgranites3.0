import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Briefcase, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { icon: Clock, value: 25, suffix: '+', label: t('stats.yearsExperience') },
    { icon: Users, value: 500, suffix: '+', label: t('stats.happyClients') },
    { icon: Briefcase, value: 1000, suffix: '+', label: t('stats.projectsDone') },
    { icon: Award, value: 50, suffix: '+', label: t('stats.awards') },
  ];

  return (
    <section className="py-6 sm:py-8 lg:py-10 bg-foreground text-background" data-testid="stats-section">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-4 gap-3 sm:gap-6 lg:gap-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
              data-testid={`stat-${index}`}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-1.5 sm:mb-2 lg:mb-3 rounded-full bg-white/10 flex items-center justify-center">
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
              </div>
              <div className="text-base sm:text-xl lg:text-3xl font-bold font-display mb-0.5 sm:mb-1 text-white">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[9px] sm:text-[11px] lg:text-sm text-white/70 leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
