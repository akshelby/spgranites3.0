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

  // Raised (resting) — strong lift with top highlight and bottom shadow
  const raisedShadow = `
    0 6px 18px rgba(0,0,0,0.18),
    0 2px 6px rgba(0,0,0,0.12),
    -2px -3px 8px rgba(255,255,255,0.85),
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 -1px 0 rgba(0,0,0,0.06)
  `;
  // Pressed — sinks inward
  const pressedShadow = `
    0 1px 3px rgba(0,0,0,0.14),
    -1px -1px 3px rgba(255,255,255,0.6),
    inset 3px 4px 10px rgba(0,0,0,0.16),
    inset -1px -2px 5px rgba(255,255,255,0.5)
  `;

  const content = (
    <div className="flex flex-col items-center gap-2.5 sm:gap-3">
      <motion.div
        className="relative cursor-pointer"
        whileHover={{ y: -4, scale: 1.06 }}
        whileTap={{ y: 1, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        {...(prominent ? {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2.4, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' },
        } : {})}
      >
        {/* Circle ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 'calc(100% + 14px)',
            height: 'calc(100% + 14px)',
            top: '-7px',
            left: '-7px',
            border: `2.5px solid ${ringColor}`,
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        {/* Push-button icon circle */}
        <motion.div
          className={cn(
            'category-icon-circle',
            prominent ? 'category-icon-prominent' : '',
            'relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]',
            'rounded-full flex items-center justify-center',
            'transition-[box-shadow] duration-100',
            prominent && bg,
          )}
          style={{
            zIndex: 3,
            boxShadow: raisedShadow,
            // Soft white base for non-prominent so shadows read clearly
            background: prominent ? undefined : 'hsl(0 0% 97%)',
          }}
          whileTap={{ boxShadow: pressedShadow } as never}
        >
          {/* Inner top highlight — light mode only */}
          {!prominent && (
            <div className="absolute inset-0 rounded-full pointer-events-none dark:hidden"
              style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, transparent 55%)' }} />
          )}
          <Icon
            className={cn(
              'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 relative z-10',
              prominent ? 'text-white' : 'text-foreground'
            )}
            strokeWidth={1.75}
          />
        </motion.div>
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
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
