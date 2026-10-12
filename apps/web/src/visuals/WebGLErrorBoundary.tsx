/**
 * WebGLErrorBoundary.tsx – Error boundary for Three.js / R3F components.
 *
 * Wraps any WebGL component and falls back to the provided `fallback`
 * prop (typically the SVG flame) on:
 *   - Any React render error
 *   - WebGL context loss
 *
 * Usage:
 *   <WebGLErrorBoundary fallback={<SvgFlame ... />}>
 *     <Canvas><Flame3D ... /></Canvas>
 *   </WebGLErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  /** Fallback UI to render when WebGL fails */
  fallback: ReactNode;
  /** Optional children – the WebGL scene */
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log but don't crash – the fallback SVG will take over
    console.warn(
      '[IGNIS] WebGL component failed, falling back to SVG:',
      error.message,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
