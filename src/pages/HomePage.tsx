import { SaasHero } from '@/components/home/SaasHero';
import { SaasFeatures } from '@/components/home/SaasFeatures';
import { SaasCTA } from '@/components/home/SaasCTA';

export default function HomePage() {
  return (
    <main>
      <SaasHero />
      <SaasFeatures />
      <SaasCTA />
    </main>
  );
}
