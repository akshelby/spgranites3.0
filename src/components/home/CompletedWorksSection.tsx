import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Play } from 'lucide-react';
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

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const data = await api.get('/api/completed-works');
        setWorks(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  if (loading || works.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium tracking-wider uppercase text-sm">Portfolio</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Our Completed Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our recent granite and marble installations crafted with precision and care
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {work.media_type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={work.media_url || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={work.media_url || ''}
                    alt={work.stone_type || 'Completed work'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

              <div className="p-4 space-y-2">
                {(work.area || work.city) && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{[work.area, work.city].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {work.completion_date && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{new Date(work.completion_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link to="/completed-works">
            <Button variant="outline" size="lg" className="group">
              View All Completed Works
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
