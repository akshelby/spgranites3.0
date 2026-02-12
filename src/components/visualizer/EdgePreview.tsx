import { useMemo } from 'react';
import type { EdgeProfile, StoneColor, FinishType } from './stonePresets';

interface EdgePreviewProps {
  edge: EdgeProfile;
  stone: StoneColor;
  finish: FinishType;
}

export default function EdgePreview({ edge, stone, finish }: EdgePreviewProps) {
  const textureStyle = useMemo<React.CSSProperties>(() => {
    const layers: string[] = [];
    if (finish.overlay && finish.overlay !== 'none') {
      layers.push(finish.overlay);
    }
    layers.push(stone.texture.trim());
    return {
      backgroundImage: layers.join(', '),
      backgroundColor: stone.baseColor,
      backgroundSize: '100% 100%',
      filter: finish.cssFilter,
    };
  }, [stone, finish]);

  return (
    <div className="flex items-center gap-4" data-testid="edge-preview">
      <svg viewBox="0 0 200 40" className="w-full h-12 border rounded-md bg-muted/30">
        <defs>
          <pattern id="edge-texture" patternUnits="userSpaceOnUse" width="200" height="40">
            <foreignObject width="200" height="40">
              <div style={{ width: '100%', height: '100%', ...textureStyle }} />
            </foreignObject>
          </pattern>
        </defs>

        <rect x="0" y="0" width="200" height="16" fill="url(#edge-texture)" />

        <g transform="translate(0, 16) scale(2, 3)">
          <path d={edge.svgPath} fill="url(#edge-texture)" />
        </g>

        <text x="100" y="38" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">
          {edge.name}
        </text>
      </svg>
    </div>
  );
}
