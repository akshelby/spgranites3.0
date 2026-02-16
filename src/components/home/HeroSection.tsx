import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import heroCountertopImg from '@/assets/hero-countertop.jpg';
import kitchenImg from '@/assets/categories/kitchen-countertops.jpg';
import flooringImg from '@/assets/categories/flooring.jpg';
import bathroomImg from '@/assets/categories/bathroom.jpg';
import staircasesImg from '@/assets/categories/staircases.jpg';
import blackGraniteImg from '@/assets/products/black-granite.jpg';

interface CarouselCard {
  id: string;
  title: string;
  image_url: string;
  display_order: number;
}

const localImages: Record<string, string> = {
  'Black Galaxy Granite': blackGraniteImg,
  'Kitchen Countertops': kitchenImg,
  'Luxury Flooring': flooringImg,
  'Modern Bathrooms': bathroomImg,
  'Stone Staircases': staircasesImg,
};

function getCardImage(card: CarouselCard): string {
  if (localImages[card.title]) return localImages[card.title];
  if (card.image_url && card.image_url !== '/placeholder.svg') return card.image_url;
  return heroCountertopImg;
}

export function HeroSection() {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [rotationSpeed, setRotationSpeed] = useState(3000);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data: settings } = await supabase
          .from('hero_carousel_settings')
          .select('*')
          .limit(1)
          .single();
        if (settings) {
          setAutoRotate(settings.auto_rotate);
          setRotationSpeed(settings.rotation_speed || 3000);
        }
        const { data } = await supabase
          .from('hero_carousel_cards')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        if (data && data.length > 0) setCards(data);
      } catch {
        // silent
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    if (!autoRotate || cards.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % cards.length);
    }, rotationSpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRotate, cards.length, rotationSpeed]);

  const goTo = useCallback((i: number) => {
    setActiveIndex(i);
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 6000);
  }, []);

  return (
    <section className="min-h-screen flex items-center bg-background relative overflow-hidden" data-testid="hero-section">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-destructive/10 to-transparent blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[hsl(220,60%,30%)]/8 to-transparent blur-3xl"
      />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 mb-6 sm:mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide">
                S P Granites — Since 2014
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6"
              data-testid="text-hero-title"
            >
              Premium Granite{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(220,60%,25%)] to-[hsl(220,70%,45%)] dark:from-[hsl(220,50%,70%)] dark:to-[hsl(220,60%,85%)]">
                  &amp; Quartz
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-destructive to-destructive/40 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                />
              </span>{' '}
              Countertops
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-10 max-w-xl mx-auto lg:mx-0"
              data-testid="text-hero-subtitle"
            >
              Custom-designed stone surfaces crafted with precision and elegance
              for kitchens, offices, and commercial spaces.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/estimation"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-destructive to-[hsl(0,72%,40%)] shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                data-testid="button-get-estimate"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Get Free Estimate
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold border-2 border-border text-foreground hover:bg-muted hover:scale-105 transition-all duration-300 shadow-sm backdrop-blur-sm"
                data-testid="button-view-work"
              >
                View Our Work
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Hero Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Main carousel image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-foreground/10 ring-1 ring-border/30 relative">
                {cards.length > 0 ? (
                  cards.map((card, i) => (
                    <motion.img
                      key={card.id}
                      src={getCardImage(card)}
                      alt={card.title}
                      className="w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[560px] object-cover"
                      initial={false}
                      animate={{ opacity: i === activeIndex ? 1 : 0 }}
                      transition={{ duration: 0.6 }}
                      style={{
                        position: i === 0 ? 'relative' : 'absolute',
                        inset: i === 0 ? undefined : 0,
                      }}
                      draggable={false}
                    />
                  ))
                ) : (
                  <img
                    src={heroCountertopImg}
                    alt="Premium granite countertop"
                    className="w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[560px] object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />

                {/* Card title overlay */}
                {cards.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.p
                      key={activeIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white text-sm sm:text-lg font-semibold drop-shadow-lg"
                    >
                      {cards[activeIndex]?.title}
                    </motion.p>
                  </div>
                )}
              </div>

              {/* Dots indicator */}
              {cards.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {cards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === activeIndex
                          ? 'w-6 bg-destructive'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-xl"
              >
                <p className="text-xs sm:text-sm font-bold text-foreground">500+ Projects</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Delivered with excellence</p>
              </motion.div>

              {/* Quality badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 bg-gradient-to-br from-destructive to-[hsl(0,72%,40%)] rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg shadow-destructive/30"
              >
                <div className="text-center text-white">
                  <p className="text-sm sm:text-base font-bold leading-none">10+</p>
                  <p className="text-[8px] sm:text-[10px] font-medium opacity-90">Years</p>
                </div>
              </motion.div>

              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-destructive/5 via-transparent to-[hsl(220,60%,30%)]/5 opacity-80 blur-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
