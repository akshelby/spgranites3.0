import { MainLayout } from '@/components/layout';
import {
  HeroSection,
  PremiumCollection,
  StatsSection,
} from '@/components/home';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { CompletedWorksSection } from '@/components/home/CompletedWorksSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function HomePage() {
  usePageTitle();
  return (
    <MainLayout>
      <HeroSection />
      <PremiumCollection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedProducts />
      <ServicesSection />
      <CompletedWorksSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
}
