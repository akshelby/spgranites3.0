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
  arcColor?: string;
  onClick?: () => void;
}

export function CategoryItem({
  name,
  icon: Icon,
  link,
  bgColor,
  prominent,
  prominentBg,
  arcColor,
  index,
  onClick,
}: CategoryItemProps) {
  const isExternal = link.startsWith('tel:') || link.startsWith('http') || link.startsWith('mailto:');

  const bg = prominent ? prominentBg : bgColor;
  const ringColor = arcColor || '#ef4444';

  const content = (
    <div className="flex flex-col items-center gap-2.5 sm:gap-3">
      <motion.div
        className="relative"
        whileHover={{ y: -5, scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        {...(prominent ? {
          animate: { scale: [1, 1.06, 1] },
          transition: { duration: 2.4, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' },
        } : {})}
      >
        {/* Glow / shadow disc behind the icon */}
        <div
          className="absolute rounded-full transition-all duration-300 group-hover:opacity-100"
          style={{
            width: 'calc(100% + 6px)',
            height: 'calc(100% + 6px)',
            top: '-3px',
            left: '-3px',
            background: ringColor,
            opacity: 0.18,
            filter: 'blur(8px)',
            zIndex: 0,
          }}
        />

        {/* Static circle ring */}
        <div
          className="absolute rounded-full transition-all duration-300 group-hover:opacity-100"
          style={{
            width: 'calc(100% + 14px)',
            height: 'calc(100% + 14px)',
            top: '-7px',
            left: '-7px',
            border: `2.5px solid ${ringColor}`,
            opacity: 0.85,
            zIndex: 0,
          }}
        />

        {/* Icon circle */}
        <div
          className={cn(
            'category-icon-circle',
            prominent ? 'category-icon-prominent' : '',
            'relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]',
            'rounded-full flex items-center justify-center',
            'transition-all duration-300 group-hover:scale-105',
            prominent && bg,
          )}
          style={{
            zIndex: 3,
            boxShadow: `0 4px 14px 0 rgba(0,0,0,0.22), 0 1px 4px 0 rgba(0,0,0,0.12)`,
          }}
        >
          <Icon
            className={cn(
              'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 relative z-10',
              prominent ? 'text-white' : 'text-foreground'
            )}
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
