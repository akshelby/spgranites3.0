import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { SPLoader } from '@/components/ui/SPLoader';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Catalog } from '@/types/database';
import { useTranslation } from 'react-i18next';

export default function CatalogsPage() {
  const { t } = useTranslation();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const data = await api.get('/api/catalogs');
      if (data) setCatalogs(data as Catalog[]);
    } catch {}
    setLoading(false);
  };

  const handleDownload = async (catalog: Catalog) => {
    try {
      await api.post(`/api/catalogs/${catalog.id}/download`);
    } catch {}
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
            {t('catalogs.label')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2 heading-stylish"
            data-testid="text-catalogs-title"
          >
            {t('catalogs.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            {t('catalogs.subtitle')}
          </motion.p>
        </div>

        {loading ? (
          <SPLoader size="md" text="Loading catalogs..." fullPage />
        ) : catalogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-1">{t('catalogs.noCatalogs')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('catalogs.noCatalogsHint')}
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
                      {t('catalogs.download')}
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
                    {catalog.download_count} {t('catalogs.downloads')}
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
