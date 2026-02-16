import { MainLayout } from '@/components/layout';
import {
  HeroSection,
  PremiumCollection,
  CategoriesSection,
  FeaturedProducts,
  ServicesSection,
  TestimonialsSection,
  StatsSection,
  CTASection,
} from '@/components/home';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <PremiumCollection />
      <CategoriesSection />
      <FeaturedProducts />
      <ServicesSection />
      <TestimonialsSection />
      <StatsSection />
      <CTASection />
    </MainLayout>
  );
}
