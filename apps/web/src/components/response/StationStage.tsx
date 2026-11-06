import React, { Suspense, lazy } from 'react';
import type { HabitatGraph } from '../../lib/fire/types.ts';
import type { Timeline, TimelineFrameState } from '../../lib/fire/timeline/types.ts';
import { useWebGLSupport } from '../../visuals/useWebGLSupport.ts';
import { useReducedMotion } from '../../visuals/useReducedMotion.ts';
import { StationFallback2D } from './StationFallback2D.tsx';

// Lazy-load the heavy 3D Scene as required by Step 2
const Station3DScene = lazy(() => import('./Station3DScene.tsx'));

export interface StationStageProps {
  habitat: HabitatGraph;
  timeline: Timeline;
  frameState: TimelineFrameState;
  t: number;
}

class StageErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[StationStage] WebGL error caught, rendering 2D fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const StationStage: React.FC<StationStageProps> = (props) => {
  const isWebGLSupported = useWebGLSupport();
  const prefersReducedMotion = useReducedMotion();

  // If WebGL is not supported or user prefers reduced motion, render the 2D SVG fallback
  if (!isWebGLSupported || prefersReducedMotion) {
    return <StationFallback2D {...props} />;
  }

  return (
    <StageErrorBoundary fallback={<StationFallback2D {...props} />}>
      <Suspense fallback={<StationFallback2D {...props} />}>
        <Station3DScene {...props} />
      </Suspense>
    </StageErrorBoundary>
  );
};

export default StationStage;

