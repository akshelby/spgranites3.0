import { MainLayout } from '@/components/layout';
import {
  HeroSection,
  StatsSection,
  PremiumCollection,
  CategoriesSection,
  FeaturedProducts,
  ServicesSection,
  TestimonialsSection,
  CTASection,
} from '@/components/home';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <PremiumCollection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedProducts />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
}
