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
    <section className="py-8 sm:py-12 lg:py-16 bg-foreground text-background" data-testid="stats-section">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
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
              <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto mb-2 sm:mb-3 rounded-full bg-white/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <div className="text-lg sm:text-2xl lg:text-4xl font-bold font-display mb-0.5 sm:mb-1">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[10px] sm:text-xs lg:text-sm opacity-60 leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
