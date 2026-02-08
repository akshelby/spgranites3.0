import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Bath, UtensilsCrossed, Grid3X3, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BhrundhavanIcon } from './BhrundhavanIcon';
import { cn } from '@/lib/utils';
import { ElementType } from 'react';

// Import category images
import kitchenCountertopsImg from '@/assets/categories/kitchen-countertops.jpg';
import flooringImg from '@/assets/categories/flooring.jpg';
import bathroomImg from '@/assets/categories/bathroom.jpg';
import staircasesImg from '@/assets/categories/staircases.jpg';

interface Category {
  id: string;
  name: string;
  icon: ElementType;
  link: string;
  description: string;
  image: string;
}

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    name: 'Kitchen Countertops',
    icon: ChefHat,
    link: '/products?category=kitchen-slab',
    description: 'Premium kitchen countertops',
    image: kitchenCountertopsImg,
  },
  {
    id: 'vanity-top',
    name: 'Vanity Top',
    icon: Bath,
    link: '/products?category=vanity-top',
    description: 'Elegant bathroom vanities',
    image: bathroomImg,
  },
  {
    id: 'dining-top',
    name: 'Dining Table Top',
    icon: UtensilsCrossed,
    link: '/products?category=dining-top',
    description: 'Stunning dining surfaces',
    image: flooringImg,
  },
  {
    id: 'bhrundhavan',
    name: 'Bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    description: 'Traditional tulsi planters',
    image: staircasesImg,
  },
  {
    id: 'tiles-fixing',
    name: 'Tiles Fixing',
    icon: Grid3X3,
    link: '/services',
    description: 'Professional tile installation',
    image: flooringImg,
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    icon: Phone,
    link: '/contact',
    description: 'Get in touch with us',
    image: bathroomImg,
  },
  {
    id: 'offline-stores',
    name: 'Offline Stores',
    icon: MapPin,
    link: '/stores',
    description: 'Visit our showrooms',
    image: kitchenCountertopsImg,
  },
];

export function CategoriesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const totalItems = categories.length;

  const rotateLeft = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const rotateRight = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(rotateRight, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, rotateRight]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Calculate position for each card in the ring
  const getCardStyle = (index: number) => {
    const angleStep = 360 / totalItems;
    const relativeIndex = (index - currentIndex + totalItems) % totalItems;
    const angle = relativeIndex * angleStep;
    
    // Radius of the ring (adjust based on screen size via CSS)
    const radius = 280;
    
    // Calculate 3D position
    const rotateY = angle;
    const translateZ = radius;
    
    // Calculate opacity and scale based on position
    // Front (0°) = full opacity/scale, Back (180°) = minimum
    const normalizedAngle = Math.abs(((angle + 180) % 360) - 180);
    const opacity = 1 - (normalizedAngle / 180) * 0.7;
    const scale = 1 - (normalizedAngle / 180) * 0.3;
    const zIndex = Math.round((180 - normalizedAngle) / 10);

    return {
      rotateY,
      translateZ,
      opacity,
      scale,
      zIndex,
    };
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
            Explore Categories
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Premium stone surfaces for every space
          </p>
        </motion.div>

        {/* 3D Carousel Container */}
        <div
          className="relative h-[320px] sm:h-[380px] md:h-[420px] flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows */}
          <button
            onClick={rotateLeft}
            className="absolute left-2 sm:left-8 md:left-16 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Previous category"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>

          <button
            onClick={rotateRight}
            className="absolute right-2 sm:right-8 md:right-16 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Next category"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>

          {/* 3D Ring */}
          <div
            className="relative w-full h-full"
            style={{
              perspective: '1000px',
              perspectiveOrigin: 'center center',
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {categories.map((category, index) => {
                const style = getCardStyle(index);
                const isFront = index === currentIndex;

                return (
                  <motion.div
                    key={category.id}
                    className="absolute"
                    animate={{
                      rotateY: style.rotateY,
                      z: style.translateZ,
                      opacity: style.opacity,
                      scale: style.scale,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      zIndex: style.zIndex,
                    }}
                  >
                    <Link
                      to={category.link}
                      className={cn(
                        'block relative w-[200px] h-[260px] sm:w-[260px] sm:h-[320px] md:w-[320px] md:h-[380px]',
                        'rounded-2xl overflow-hidden shadow-2xl',
                        'transition-all duration-300',
                        isFront && 'ring-2 ring-primary/50'
                      )}
                      style={{
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Background Image */}
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/70 mt-1">
                          {category.description}
                        </p>
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-primary w-6 sm:w-8'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to category ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
