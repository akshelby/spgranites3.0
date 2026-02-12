import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Palette, Scissors, Sparkles } from 'lucide-react';
import {
  surfaces,
  stoneColors,
  edgeProfiles,
  finishes,
  type SurfaceType,
  type StoneColor,
  type EdgeProfile,
  type FinishType,
} from './stonePresets';

interface VisualizerControlsProps {
  surface: SurfaceType;
  stone: StoneColor;
  edge: EdgeProfile;
  finish: FinishType;
  onSurfaceChange: (s: SurfaceType) => void;
  onStoneChange: (s: StoneColor) => void;
  onEdgeChange: (e: EdgeProfile) => void;
  onFinishChange: (f: FinishType) => void;
}

export default function VisualizerControls({
  surface,
  stone,
  edge,
  finish,
  onSurfaceChange,
  onStoneChange,
  onEdgeChange,
  onFinishChange,
}: VisualizerControlsProps) {
  const categories = ['granite', 'marble', 'quartz'] as const;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Surface Type
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {surfaces.map((s) => (
            <Button
              key={s.id}
              variant={surface === s.id ? 'default' : 'outline'}
              className="justify-start text-left h-auto py-2"
              onClick={() => onSurfaceChange(s.id)}
              data-testid={`button-surface-${s.id}`}
            >
              <div>
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs opacity-70">{s.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Stone Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.map((cat) => (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
              <div className="grid grid-cols-3 gap-2">
                {stoneColors
                  .filter((c) => c.category === cat)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onStoneChange(c)}
                      className={`group flex flex-col items-center gap-1 p-1.5 rounded-md transition-colors ${
                        stone.id === c.id ? 'ring-2 ring-primary bg-muted' : 'hover-elevate'
                      }`}
                      data-testid={`button-stone-${c.id}`}
                    >
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: c.baseColor }}
                      >
                        <div
                          className="w-full h-full rounded-md"
                          style={{
                            backgroundImage: c.texture.trim(),
                            backgroundSize: '100% 100%',
                          }}
                        />
                      </div>
                      <span className="text-[10px] leading-tight text-center text-muted-foreground">{c.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Edge Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {edgeProfiles.map((e) => (
            <Badge
              key={e.id}
              variant={edge.id === e.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onEdgeChange(e)}
              data-testid={`button-edge-${e.id}`}
            >
              {e.name}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Finish
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {finishes.map((f) => (
            <Button
              key={f.id}
              variant={finish.id === f.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFinishChange(f)}
              data-testid={`button-finish-${f.id}`}
            >
              {f.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
