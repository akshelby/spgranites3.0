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
  onClick?: () => void;
}

export function CategoryItem({ name, icon: Icon, link, iconColor, bgColor, borderColor, prominent, prominentBg, onClick }: CategoryItemProps) {
  const isExternal = link.startsWith('tel:') || link.startsWith('http') || link.startsWith('mailto:');

  const content = (
    <>
      <motion.div
        className={cn(
          'relative w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] md:w-24 md:h-24 lg:w-28 lg:h-28',
          'rounded-xl sm:rounded-2xl flex items-center justify-center',
          'border-2 transition-all duration-300',
          prominent ? prominentBg : (bgColor || 'bg-card'),
          prominent ? 'border-transparent shadow-lg' : (borderColor || 'border-border'),
          'group-hover:shadow-lg group-hover:scale-105'
        )}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...(prominent ? {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" }
        } : {})}
      >
        <Icon
          className={cn(
            'w-6 h-6 sm:w-8 sm:h-8 md:w-11 md:h-11 lg:w-12 lg:h-12',
            'transition-transform duration-300 relative z-10',
            'group-hover:scale-110',
            prominent ? 'text-white' : (iconColor || 'text-foreground/70')
          )}
          strokeWidth={1.5}
        />
      </motion.div>
      <span
        className={cn(
          'text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold text-center',
          'transition-colors duration-300 leading-tight max-w-[5rem] sm:max-w-[6rem] lg:max-w-[8rem]',
          prominent ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground'
        )}
      >
        {name}
      </span>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex flex-col items-center gap-3 group"
          data-testid={`link-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {content}
        </button>
      ) : isExternal ? (
        <a
          href={link}
          className="flex flex-col items-center gap-3 group"
          data-testid={`link-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {content}
        </a>
      ) : (
        <Link
          to={link}
          className="flex flex-col items-center gap-3 group"
          data-testid={`link-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {content}
        </Link>
      )}
    </motion.div>
  );
}
