import { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryItemProps {
  id: string;
  name: string;
  icon: ElementType;
  link: string;
  description: string;
  index: number;
  gradient?: string;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
}

export function CategoryItem({ name, icon: Icon, link, iconColor, bgColor, borderColor }: CategoryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        to={link}
        className="flex flex-col items-center gap-3 group"
        data-testid={`link-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <motion.div
          className={cn(
            'relative w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24',
            'rounded-2xl flex items-center justify-center',
            'border-2 transition-all duration-300',
            bgColor || 'bg-card',
            borderColor || 'border-border',
            'group-hover:shadow-lg group-hover:scale-105'
          )}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11',
              'transition-transform duration-300 relative z-10',
              'group-hover:scale-110',
              iconColor || 'text-foreground/70'
            )}
            strokeWidth={1.5}
          />
        </motion.div>

        <span
          className={cn(
            'text-xs sm:text-sm font-semibold text-center',
            'transition-colors duration-300 leading-tight max-w-[6rem]',
            'text-muted-foreground group-hover:text-foreground'
          )}
        >
          {name}
        </span>
      </Link>
    </motion.div>
  );
}
