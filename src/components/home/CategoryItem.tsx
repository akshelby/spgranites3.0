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
  glowColor,
  arcColor,
  index,
  onClick,
}: CategoryItemProps) {
  const isExternal = link.startsWith('tel:') || link.startsWith('http') || link.startsWith('mailto:');

  const bg = prominent ? prominentBg : bgColor;
  const animDelay = `-${((index * 0.47) % 2).toFixed(2)}s`;

  // Build the conic-gradient using the chosen arc color
  const r = arcColor || '#ef4444';
  const cometGradient = `conic-gradient(from 0deg, transparent 0%, transparent 70%, ${r}33 80%, ${r}d9 92%, ${r} 97%, ${r} 100%)`;

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
        {/* Comet arc ring — orbits far from the icon */}
        <div
          className="comet-ring"
          style={{
            width: 'calc(100% + 28px)',
            height: 'calc(100% + 28px)',
            top: '-14px',
            left: '-14px',
            animationDelay: animDelay,
            background: cometGradient,
          }}
        />

        {/* Mask: bg-background circle that hides everything except the thin outer arc */}
        <div
          className="absolute rounded-full bg-background"
          style={{
            width: 'calc(100% + 20px)',
            height: 'calc(100% + 20px)',
            top: '-10px',
            left: '-10px',
            zIndex: 1,
          }}
        />

        {/*
          Icon circle:
          - Light mode: no background fill, icon is black (text-foreground)
          - Dark mode: coloured gradient bg, icon is white/foreground
          - Prominent (WhatsApp/Chat): always coloured bg
        */}
        <div
          className={cn(
            'category-icon-circle',
            'relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]',
            'rounded-full flex items-center justify-center',
            'transition-all duration-300',
            prominent && bg,
          )}
          style={{ zIndex: 3 }}
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
