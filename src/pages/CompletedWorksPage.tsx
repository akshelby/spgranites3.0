import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, MapPin, Calendar, User, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface CompletedWork {
  id: string;
  media_url: string;
  media_type: string;
  stone_type: string;
  category: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  area: string;
  description: string;
  completion_date: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ['Kitchen', 'Staircase', 'Bathroom', 'Flooring', 'Countertop', 'Wall Cladding', 'Other'];

function maskPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length <= 6) return cleaned;
  return cleaned.slice(0, 3) + '****' + cleaned.slice(-3);
}

export default function CompletedWorksPage() {
  usePageTitle('Our Completed Works');
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [stoneFilter, setStoneFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedWork, setSelectedWork] = useState<CompletedWork | null>(null);

  useEffect(() => {
    async function fetchWorks() {
      try {
        const data = await api.get('/api/completed-works');
        setWorks(Array.isArray(data) ? data : []);
      } catch {
        setWorks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchWorks();
  }, []);

  const stoneTypes = [...new Set(works.map(w => w.stone_type).filter(Boolean))];

  const filteredWorks = works.filter(w => {
    if (stoneFilter !== 'all' && w.stone_type !== stoneFilter) return false;
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
          >
            Gallery
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
          >
            Our Completed Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            Browse through our portfolio of premium granite installations and craftsmanship
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-6 justify-center"
        >
          <Select value={stoneFilter} onValueChange={setStoneFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stone Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stone Types</SelectItem>
              {stoneTypes.map(st => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No completed works found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => setSelectedWork(work)}
                className="bg-card rounded-2xl border border-border/60 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {work.media_type === 'video' ? (
                    <>
                      <video
                        src={work.media_url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={work.media_url}
                      alt={`${work.stone_type} ${work.category}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="p-3 sm:p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {work.stone_type && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">{work.stone_type}</Badge>
                    )}
                    {work.category && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs">{work.category}</Badge>
                    )}
                  </div>

                  {work.customer_name && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm mb-1">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{work.customer_name}</span>
                    </div>
                  )}

                  {work.customer_phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{maskPhone(work.customer_phone)}</span>
                    </div>
                  )}

                  {(work.area || work.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{[work.area, work.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {work.completion_date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{format(new Date(work.completion_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedWork} onOpenChange={(open) => { if (!open) setSelectedWork(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedWork && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-display">
                  {selectedWork.stone_type} — {selectedWork.category}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {selectedWork.media_type === 'video' ? (
                    <video
                      src={selectedWork.media_url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={selectedWork.media_url}
                      alt={`${selectedWork.stone_type} ${selectedWork.category}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedWork.stone_type && (
                    <Badge variant="secondary">{selectedWork.stone_type}</Badge>
                  )}
                  {selectedWork.category && (
                    <Badge variant="outline">{selectedWork.category}</Badge>
                  )}
                </div>

                {selectedWork.description && (
                  <p className="text-sm text-muted-foreground">{selectedWork.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {selectedWork.customer_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedWork.customer_name}</span>
                    </div>
                  )}
                  {selectedWork.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{maskPhone(selectedWork.customer_phone)}</span>
                    </div>
                  )}
                  {(selectedWork.area || selectedWork.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[selectedWork.area, selectedWork.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {selectedWork.completion_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(selectedWork.completion_date), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}