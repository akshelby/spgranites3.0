import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
  const { t } = useTranslation();

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
    try {
      const { data, error } = await supabase.from('hero_carousel_cards').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        const mappedCards = data.map((card: any) => ({
          ...card,
          image_url: card.image_url === '/placeholder.svg' 
            ? (fallbackImages[card.title] || blackGraniteImg)
            : card.image_url
        }));
        setCards(mappedCards);
      } else {
        setCards([
          { id: '1', title: 'Premium Granite', image_url: blackGraniteImg },
          { id: '2', title: 'Elegant Marble', image_url: kitchenCountertopsImg },
          { id: '3', title: 'Modern Countertops', image_url: flooringImg },
        ]);
      }
    } catch {
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
    <section className="relative min-h-[55vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden bg-background" data-testid="hero-section">
      <div className="container mx-auto px-4 py-8 sm:py-14 lg:py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-5 tracking-wide"
              data-testid="text-hero-badge"
            >
              {t('hero.badge')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.15] mb-3 sm:mb-6"
              data-testid="text-hero-title"
            >
              {t('hero.title')}{' '}
              <span className="text-primary">{t('hero.titleHighlight')}</span>{' '}
              {t('hero.titleEnd')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              data-testid="text-hero-subtitle"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start items-center sm:items-start"
            >
              <Button size="lg" asChild className="group w-full sm:w-auto text-xs sm:text-sm" data-testid="button-browse-products">
                <Link to="/products">
                  {t('hero.browseProducts')}
                  <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm" data-testid="button-free-estimation">
                <Link to="/estimation">{t('hero.freeEstimation')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-primary/30 text-primary text-xs sm:text-sm" data-testid="button-visualizer-cta">
                <Link to="/visualizer">
                  <Gem className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {t('hero.tryVisualizer')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative h-[250px] sm:h-[350px] lg:h-[500px]"
            data-testid="hero-carousel"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg">
              <AnimatePresence mode="wait">
                {cards.length > 0 && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={cards[currentIndex]?.image_url}
                      alt={cards[currentIndex]?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-lg sm:text-2xl font-display font-bold"
                      >
                        {cards[currentIndex]?.title}
                      </motion.h3>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center transition-colors"
              aria-label="Previous slide"
              data-testid="button-hero-prev"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center transition-colors"
              aria-label="Next slide"
              data-testid="button-hero-next"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-6 bg-primary'
                      : 'w-1.5 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  data-testid={`button-hero-dot-${index}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
