import { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryItemPillProps {
  id: string;
  name: string;
  icon: ElementType;
  link: string;
  description: string;
  index: number;
  prominent?: boolean;
  prominentBg?: string;
  arcColor?: string;
  onClick?: () => void;
}

export function CategoryItemPill({
  name,
  icon: Icon,
  link,
  prominent,
  arcColor,
  index,
  onClick,
}: CategoryItemPillProps) {
  const isExternal = link.startsWith('tel:') || link.startsWith('http') || link.startsWith('mailto:');
  const accentColor = arcColor || '#ef4444';

  const raisedShadow = `3px 5px 12px rgba(0,0,0,0.25), -1px -1px 5px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.35)`;
  const pressedShadow = `0 1px 2px rgba(0,0,0,0.18), inset 2px 3px 8px rgba(0,0,0,0.22), inset -1px -1px 4px rgba(255,255,255,0.3)`;

  const pillContent = (
    <motion.div
      className="relative"
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ y: 1, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    >
      <motion.div
        className={cn(
          'group/pill relative flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3',
          'rounded-sm overflow-hidden',
          'transition-all duration-100',
        )}
        style={{
          transform: 'skewX(-8deg)',
          background: prominent
            ? accentColor === '#25D366'
              ? 'linear-gradient(135deg,#25D366,#128C7E)'
              : `linear-gradient(135deg, #ef4444, #b91c1c)`
            : 'hsl(var(--card))',
          boxShadow: raisedShadow,
          border: `1.5px solid ${prominent ? 'transparent' : accentColor}44`,
          minWidth: '88px',
        }}
        whileTap={{ boxShadow: pressedShadow } as never}
      >
        {/* Sliding red fill on hover (only for non-prominent) */}
        {!prominent && (
          <div
            className="absolute inset-0 origin-left scale-x-0 group-hover/pill:scale-x-100 transition-transform duration-300 ease-out"
            style={{
              background: accentColor === '#25D366'
                ? 'linear-gradient(135deg,#25D366,#128C7E)'
                : 'linear-gradient(135deg, #ef4444, #b91c1c)',
            }}
          />
        )}

        {/* Accent stripe on the left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] z-10 group-hover/pill:opacity-0 transition-opacity duration-200"
          style={{ background: accentColor }}
        />

        <div className="relative z-10 flex items-center gap-2 pl-1" style={{ transform: 'skewX(8deg)' }}>
          <Icon
            className={cn(
              'w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors duration-200',
              prominent
                ? 'text-white'
                : 'text-foreground group-hover/pill:text-white'
            )}
            strokeWidth={1.75}
          />
          <span
            className={cn(
              'text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-tight whitespace-nowrap transition-colors duration-200',
              prominent
                ? 'text-white'
                : 'text-foreground group-hover/pill:text-white'
            )}
          >
            {name}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );

  const wrapperClass = 'group focus:outline-none';
  const testId = `pill-category-${name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.92 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className={wrapperClass} data-testid={testId}>
          {pillContent}
        </button>
      ) : isExternal ? (
        <a href={link} className={wrapperClass} data-testid={testId}>
          {pillContent}
        </a>
      ) : (
        <Link to={link} className={wrapperClass} data-testid={testId}>
          {pillContent}
        </Link>
      )}
    </motion.div>
  );
}
