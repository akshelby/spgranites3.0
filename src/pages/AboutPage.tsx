import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Award, Users, Clock, Shield, ArrowRight, Gem, Hammer, Heart, Truck, Building2, Target, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('About Us');
  const { t } = useTranslation();

  const stats = [
    { label: t('about.yearsExperience'), value: '25+', icon: Clock },
    { label: t('about.happyCustomers'), value: '5,000+', icon: Users },
    { label: t('about.projectsCompleted'), value: '10,000+', icon: Award },
    { label: t('about.qualityGuarantee'), value: '100%', icon: Shield },
  ];

  const values = [
    {
      title: t('about.premiumQuality'),
      description: t('about.premiumQualityDesc'),
      icon: Gem,
    },
    {
      title: t('about.expertCraftsmanship'),
      description: t('about.expertCraftsmanshipDesc'),
      icon: Hammer,
    },
    {
      title: t('about.customerFirst'),
      description: t('about.customerFirstDesc'),
      icon: Heart,
    },
    {
      title: t('about.timelyDelivery'),
      description: t('about.timelyDeliveryDesc'),
      icon: Truck,
    },
  ];

  return (
    <MainLayout>
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/50 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-14 relative">
          <div className="text-center mb-6 sm:mb-10">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
            >
              {t('about.label')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-2 sm:mb-3 heading-stylish"
              data-testid="text-about-title"
            >
              {t('about.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
            >
              {t('about.subtitle')}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-6 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-14"
        >
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-display font-bold heading-stylish" data-testid="text-who-we-are">
                {t('about.whoWeAre')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('about.whoWeAreP1')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('about.whoWeAreP2')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t('about.whoWeAreP3')}
            </p>
          </div>
          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold" data-testid="text-mission">
                  {t('about.mission')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-[52px]">
                {t('about.missionText')}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold" data-testid="text-vision">
                  {t('about.vision')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-[52px]">
                {t('about.visionText')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className="text-center border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="pt-5 pb-5 px-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10 sm:mb-14"
        >
          <h2 className="text-lg sm:text-xl font-display font-bold text-center mb-6 sm:mb-8" data-testid="text-values-title">
            {t('about.values')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {values.map((value) => (
              <Card key={value.title} className="hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="pt-5 pb-5 px-5 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <value.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold mb-1">{value.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-br from-card to-primary/5 border border-primary/10 rounded-xl p-6 sm:p-10"
        >
          <h2 className="text-lg sm:text-xl font-display font-bold mb-2" data-testid="text-cta-title">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5 max-w-lg mx-auto">
            {t('about.ctaText')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Button asChild size="lg">
              <Link to="/products" data-testid="link-browse-products">
                Browse Products <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/estimation" data-testid="link-get-estimate">
                {t('about.getEstimate')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
