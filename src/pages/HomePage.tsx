import { MainLayout } from '@/components/layout';
import {
  HeroSection,
  ServicesSection,
  StatsSection,
  CTASection,
} from '@/components/home';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <CTASection />
    </MainLayout>
  );
}
