import { useState, ElementType } from 'react';
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
}

export function CategoryItem({ name, icon: Icon, link, index, gradient }: CategoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);
  };

  const clickColorClass = index % 2 === 0 ? 'text-success' : 'text-destructive';

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Icon Container */}
        <motion.div
          className={cn(
            'relative w-16 h-16 sm:w-18 sm:h-18 md:w-22 md:h-22',
            'rounded-2xl flex items-center justify-center',
            'border transition-all duration-300',
            'bg-card border-border shadow-sm',
            gradient && `bg-gradient-to-br ${gradient}`,
            isHovered && 'border-primary/40 shadow-md shadow-primary/10'
          )}
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {/* Icon */}
          <Icon
            className={cn(
              'w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10',
              'transition-colors duration-300 relative z-10',
              isClicked
                ? clickColorClass
                : isHovered
                  ? 'text-primary'
                  : 'text-foreground/70'
            )}
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Label */}
        <span
          className={cn(
            'text-xs sm:text-sm font-medium text-center',
            'transition-colors duration-300 leading-tight max-w-[5rem]',
            isClicked
              ? clickColorClass
              : isHovered
                ? 'text-foreground'
                : 'text-muted-foreground'
          )}
        >
          {name}
        </span>
      </Link>
    </motion.div>
  );
}
