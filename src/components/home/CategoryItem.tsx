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
}

export function CategoryItem({ name, icon: Icon, link, index }: CategoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);
  };

  // Alternating colors: even = green, odd = red
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
        className="flex flex-col items-center gap-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Icon Container */}
        <motion.div
          className={cn(
            'relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20',
            'rounded-full flex items-center justify-center',
            'border-2 transition-all duration-300',
            'bg-card border-border',
            isHovered && 'bg-foreground/5 border-foreground/30'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.5 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Icon */}
          <Icon
            className={cn(
              'w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9',
              'transition-colors duration-300 relative z-10',
              isClicked
                ? clickColorClass
                : isHovered
                  ? 'text-foreground'
                  : 'text-foreground/70'
            )}
          />
        </motion.div>

        {/* Label */}
        <span
          className={cn(
            'text-xs sm:text-sm md:text-base font-medium text-center',
            'transition-colors duration-300 leading-tight',
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
