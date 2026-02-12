import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, RotateCcw } from 'lucide-react';
import VisualizerPreview from './VisualizerPreview';
import VisualizerControls from './VisualizerControls';
import EdgePreview from './EdgePreview';
import {
  stoneColors,
  edgeProfiles,
  finishes,
  type SurfaceType,
  type StoneColor,
  type EdgeProfile,
  type FinishType,
} from './stonePresets';

export default function StoneVisualizer() {
  const navigate = useNavigate();
  const [surface, setSurface] = useState<SurfaceType>('kitchen');
  const [stone, setStone] = useState<StoneColor>(stoneColors[0]);
  const [edge, setEdge] = useState<EdgeProfile>(edgeProfiles[0]);
  const [finish, setFinish] = useState<FinishType>(finishes[0]);

  const handleReset = () => {
    setSurface('kitchen');
    setStone(stoneColors[0]);
    setEdge(edgeProfiles[0]);
    setFinish(finishes[0]);
  };

  const handleRequestEstimate = () => {
    const params = new URLSearchParams({
      surface,
      stone: stone.name,
      stoneCategory: stone.category,
      edge: edge.name,
      finish: finish.name,
    });
    navigate(`/estimation?${params.toString()}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6" data-testid="stone-visualizer">
      <div className="flex-1 min-w-0">
        <VisualizerPreview surface={surface} stone={stone} finish={finish} />

        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Edge Profile</p>
            <EdgePreview edge={edge} stone={stone} finish={finish} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={handleRequestEstimate} data-testid="button-request-estimate">
            <FileText className="h-4 w-4 mr-2" />
            Request Estimate
          </Button>
          <Button variant="outline" onClick={handleReset} data-testid="button-reset-visualizer">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1">Your Configuration</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Surface:</span>
              <span className="capitalize" data-testid="text-config-surface">{surface === 'kitchen' ? 'Kitchen Countertop' : surface === 'dining' ? 'Dining Table' : 'Vanity Top'}</span>
              <span className="text-muted-foreground">Stone:</span>
              <span data-testid="text-config-stone">{stone.name}</span>
              <span className="text-muted-foreground">Material:</span>
              <span className="capitalize" data-testid="text-config-material">{stone.category}</span>
              <span className="text-muted-foreground">Edge:</span>
              <span data-testid="text-config-edge">{edge.name}</span>
              <span className="text-muted-foreground">Finish:</span>
              <span data-testid="text-config-finish">{finish.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <VisualizerControls
          surface={surface}
          stone={stone}
          edge={edge}
          finish={finish}
          onSurfaceChange={setSurface}
          onStoneChange={setStone}
          onEdgeChange={setEdge}
          onFinishChange={setFinish}
        />
      </div>
    </div>
  );
}
