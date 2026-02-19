import { lazy, Suspense } from 'react';
import { MainLayout } from '@/components/layout';
import {
  HeroSection,
  PremiumCollection,
  StatsSection,
} from '@/components/home';

const CategoriesSection = lazy(() => import('@/components/home/CategoriesSection').then(m => ({ default: m.CategoriesSection })));
const FeaturedProducts = lazy(() => import('@/components/home/FeaturedProducts').then(m => ({ default: m.FeaturedProducts })));
const ServicesSection = lazy(() => import('@/components/home/ServicesSection').then(m => ({ default: m.ServicesSection })));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const CTASection = lazy(() => import('@/components/home/CTASection').then(m => ({ default: m.CTASection })));

function SectionFallback() {
  return <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
}

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <PremiumCollection />
      <StatsSection />
      <Suspense fallback={<SectionFallback />}>
        <CategoriesSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ServicesSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CTASection />
      </Suspense>
    </MainLayout>
  );
}
