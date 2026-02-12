import { useMemo } from 'react';
import KitchenScene from './KitchenScene';
import DiningScene from './DiningScene';
import VanityScene from './VanityScene';
import type { SurfaceType, StoneColor, FinishType } from './stonePresets';

interface VisualizerPreviewProps {
  surface: SurfaceType;
  stone: StoneColor;
  finish: FinishType;
}

export default function VisualizerPreview({ surface, stone, finish }: VisualizerPreviewProps) {
  const textureStyle = useMemo<React.CSSProperties>(() => {
    const layers: string[] = [];
    if (finish.overlay && finish.overlay !== 'none') {
      layers.push(finish.overlay);
    }
    layers.push(stone.texture.trim());

    return {
      backgroundImage: layers.join(', '),
      backgroundColor: stone.baseColor,
      backgroundSize: layers.map(() => '100% 100%').join(', '),
      filter: finish.cssFilter,
      transition: 'all 0.4s ease',
    };
  }, [stone, finish]);

  return (
    <div className="relative w-full rounded-md overflow-hidden border" data-testid="visualizer-preview">
      <div className="aspect-[8/5] w-full">
        {surface === 'kitchen' && <KitchenScene textureStyle={textureStyle} />}
        {surface === 'dining' && <DiningScene textureStyle={textureStyle} />}
        {surface === 'vanity' && <VanityScene textureStyle={textureStyle} />}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
        <p className="text-white text-sm font-medium" data-testid="text-stone-name">{stone.name}</p>
        <p className="text-white/70 text-xs capitalize" data-testid="text-stone-details">
          {stone.category} &middot; {finish.name} finish
        </p>
      </div>
    </div>
  );
}
