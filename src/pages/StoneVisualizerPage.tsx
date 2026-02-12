import { MainLayout } from '@/components/layout';
import StoneVisualizer from '@/components/visualizer/StoneVisualizer';

export default function StoneVisualizerPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Stone Visualizer</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Customize and preview how different stones, finishes, and edge profiles will look on your kitchen countertop, dining table, or bathroom vanity. Play with the options and request a free estimate when you're ready.
          </p>
        </div>
        <StoneVisualizer />
      </div>
    </MainLayout>
  );
}
