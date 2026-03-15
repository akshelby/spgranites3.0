import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  margin?: string;
  scale?: boolean;
  rotate?: number;
}

const easing = [0.25, 0.1, 0.25, 1] as const;

export function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 50,
  once = true,
  margin = '-80px',
  scale = false,
  rotate = 0,
}: ScrollRevealProps) {
  const directionMap: Record<RevealDirection, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const offset = directionMap[direction];

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...offset,
        ...(scale ? { scale: 0.92 } : {}),
        ...(rotate ? { rotate } : {}),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        ...(scale ? { scale: 1 } : {}),
        ...(rotate ? { rotate: 0 } : {}),
      }}
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease: easing,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  margin?: string;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  once = true,
  margin = '-60px',
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  scale?: boolean;
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up',
  distance = 40,
  duration = 0.6,
  scale = false,
}: StaggerItemProps) {
  const directionMap: Record<RevealDirection, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const offset = directionMap[direction];

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          ...offset,
          ...(scale ? { scale: 0.92 } : {}),
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          ...(scale ? { scale: 1 } : {}),
          transition: {
            duration,
            ease: easing,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
