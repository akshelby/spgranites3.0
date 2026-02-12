import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Catalog } from '@/types/database';

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    const { data } = await supabase
      .from('catalogs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) setCatalogs(data as Catalog[]);
    setLoading(false);
  };

  const handleDownload = async (catalog: Catalog) => {
    await supabase
      .from('catalogs')
      .update({ download_count: catalog.download_count + 1 })
      .eq('id', catalog.id);

    window.open(catalog.file_url, '_blank');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
          >
            Resources
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
            data-testid="text-catalogs-title"
          >
            Download Catalogs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            Browse and download our product catalogs to explore our collections.
          </motion.p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 sm:h-56 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : catalogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-1">No catalogs available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for our product catalogs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {catalogs.map((catalog, index) => (
              <motion.div
                key={catalog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card rounded-lg border border-border overflow-hidden hover-elevate transition-all"
                data-testid={`card-catalog-${catalog.id}`}
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {catalog.thumbnail_url ? (
                    <img
                      src={catalog.thumbnail_url}
                      alt={catalog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <Button size="sm" onClick={() => handleDownload(catalog)} data-testid={`button-download-${catalog.id}`}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="text-xs sm:text-sm font-semibold mb-0.5 line-clamp-1">{catalog.title}</h3>
                  {catalog.description && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mb-0.5">
                      {catalog.description}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground" data-testid={`text-downloads-${catalog.id}`}>
                    {catalog.download_count} downloads
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
