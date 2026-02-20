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
  prominent?: boolean;
  prominentBg?: string;
  glowColor?: string;
  onClick?: () => void;
}

export function CategoryItem({
  name,
  icon: Icon,
  link,
  bgColor,
  prominent,
  prominentBg,
  glowColor,
  onClick,
}: CategoryItemProps) {
  const isExternal = link.startsWith('tel:') || link.startsWith('http') || link.startsWith('mailto:');

  const bg = prominent ? prominentBg : bgColor;

  const content = (
    <div className="flex flex-col items-center gap-2.5 sm:gap-3">
      <motion.div
        className="relative"
        whileHover={{ y: -6, scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        {...(prominent ? {
          animate: { scale: [1, 1.06, 1] },
          transition: { duration: 2.4, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' },
        } : {})}
      >
        {/* Glowing red ring */}
        <div className="absolute -inset-[3px] rounded-full bg-transparent ring-2 ring-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.6)] transition-all duration-300 group-hover:shadow-[0_0_18px_4px_rgba(239,68,68,0.85)] group-hover:ring-red-400" />

        {/* Soft red glow behind */}
        <div className="absolute inset-0 rounded-full blur-md opacity-50 scale-95 bg-red-500 transition-all duration-300 group-hover:opacity-80 group-hover:scale-110" />

        {/* Icon circle */}
        <div
          className={cn(
            'relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]',
            'rounded-full flex items-center justify-center',
            'shadow-lg transition-shadow duration-300 group-hover:shadow-xl',
            bg
          )}
        >
          {/* Inner highlight arc */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

          <Icon
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white relative z-10 drop-shadow"
            strokeWidth={1.75}
          />
        </div>
      </motion.div>

      <span
        className={cn(
          'text-[10px] sm:text-[11px] md:text-xs font-semibold text-center leading-tight',
          'max-w-[5rem] sm:max-w-[6rem] tracking-wide',
          'transition-colors duration-300',
          prominent ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground'
        )}
      >
        {name}
      </span>
    </div>
  );

  const wrapperClass = 'group focus:outline-none';
  const testId = `link-category-${name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className={wrapperClass} data-testid={testId}>
          {content}
        </button>
      ) : isExternal ? (
        <a href={link} className={wrapperClass} data-testid={testId}>
          {content}
        </a>
      ) : (
        <Link to={link} className={wrapperClass} data-testid={testId}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}
