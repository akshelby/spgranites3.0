import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CompletedWork {
  id: string;
  media_url: string | null;
  media_type: string;
  stone_type: string | null;
  category: string | null;
  customer_name: string | null;
  city: string | null;
  area: string | null;
  completion_date: string | null;
}

export function CompletedWorksSection() {
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const data = await api.get('/api/completed-works');
        setWorks(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [works]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('div')?.offsetWidth || 300;
    el.scrollBy({ left: direction === 'left' ? -cardWidth - 16 : cardWidth + 16, behavior: 'smooth' });
  };

  if (loading || works.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="text-primary font-medium tracking-wider uppercase text-sm">Portfolio</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">Our Completed Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Explore our recent granite and marble installations crafted with precision and care
          </p>
        </motion.div>
      </div>

      <div className="relative group/scroll">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-background transition-all opacity-0 group-hover/scroll:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-background transition-all opacity-0 group-hover/scroll:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-4 md:px-8 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex-shrink-0 w-[280px] sm:w-[320px] group rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {work.media_type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={work.media_url || ''}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={work.media_url || ''}
                    alt={work.stone_type || 'Completed work'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                  {work.stone_type && (
                    <Badge variant="secondary" className="bg-white/90 text-black text-xs font-medium">
                      {work.stone_type}
                    </Badge>
                  )}
                  {work.category && (
                    <Badge variant="outline" className="bg-black/50 text-white border-white/30 text-xs">
                      {work.category}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between">
                {(work.area || work.city) && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{[work.area, work.city].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {work.stone_type && !work.area && !work.city && (
                  <span className="text-sm text-muted-foreground truncate">{work.stone_type}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-6"
        >
          <Button asChild size="default" className="hover-slide border-2 border-transparent">
            <Link to="/completed-works">
              View All Works
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
