import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Import local images
import blackGraniteImg from '@/assets/products/black-granite.jpg';
import kitchenCountertopsImg from '@/assets/categories/kitchen-countertops.jpg';
import flooringImg from '@/assets/categories/flooring.jpg';
import bathroomImg from '@/assets/categories/bathroom.jpg';
import staircasesImg from '@/assets/categories/staircases.jpg';

interface CarouselCard {
  id: string;
  title: string;
  image_url: string;
}

const fallbackImages: Record<string, string> = {
  'Black Galaxy Granite': blackGraniteImg,
  'Kitchen Countertops': kitchenCountertopsImg,
  'Luxury Flooring': flooringImg,
  'Modern Bathrooms': bathroomImg,
  'Stone Staircases': staircasesImg,
};

export function HeroSection() {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCarouselCards();
  }, []);

  useEffect(() => {
    if (cards.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [cards.length]);

  const fetchCarouselCards = async () => {
    const { data } = await supabase
      .from('hero_carousel_cards')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (data && data.length > 0) {
      // Map to use fallback images if placeholder
      const mappedCards = data.map(card => ({
        ...card,
        image_url: card.image_url === '/placeholder.svg' 
          ? (fallbackImages[card.title] || blackGraniteImg)
          : card.image_url
      }));
      setCards(mappedCards);
    } else {
      // Fallback placeholder cards
      setCards([
        { id: '1', title: 'Premium Granite', image_url: blackGraniteImg },
        { id: '2', title: 'Elegant Marble', image_url: kitchenCountertopsImg },
        { id: '3', title: 'Modern Countertops', image_url: flooringImg },
      ]);
    }
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % cards.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{ x: [0, 60], y: [0, 60] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute -inset-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </motion.div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              25+ Years of Excellence
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6"
            >
              Crafting{' '}
              <span className="text-gradient">Premium</span>{' '}
              Stone Excellence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Transform your spaces with our exquisite collection of granite, marble, 
              and premium stone products. Expert craftsmanship meets timeless elegance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" asChild className="group">
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/estimation">Get Free Estimation</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px]"
          >
            <div className="relative w-full h-full perspective-1000">
              {cards.map((card, index) => {
                const offset = (index - currentIndex + cards.length) % cards.length;
                const isActive = offset === 0;
                const isPrev = offset === cards.length - 1;
                const isNext = offset === 1;

                return (
                  <motion.div
                    key={card.id}
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-premium"
                    initial={false}
                    animate={{
                      x: isActive ? 0 : isPrev ? -80 : isNext ? 80 : 0,
                      scale: isActive ? 1 : 0.85,
                      opacity: isActive ? 1 : isPrev || isNext ? 0.5 : 0,
                      zIndex: isActive ? 10 : isPrev || isNext ? 5 : 0,
                      rotateY: isActive ? 0 : isPrev ? 15 : isNext ? -15 : 0,
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-2xl font-display font-bold">
                        {card.title}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-primary'
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
