/**
 * useWebGLSupport.ts – Detects whether the browser can render WebGL content.
 *
 * Returns `true` when a WebGL 2 (or fallback WebGL 1) context can be
 * obtained from an offscreen canvas.  The probe runs once on mount and
 * the result is memoised for the lifetime of the component.
 */

import { useState, useEffect } from 'react';

let cachedResult: boolean | null = null;

function probeWebGL(): boolean {
  if (cachedResult !== null) return cachedResult;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    cachedResult = gl !== null;

    // Immediately lose context to free GPU resources from probe
    if (gl) {
      const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }
  } catch {
    cachedResult = false;
  }

  return cachedResult!;
}

/**
 * Hook: returns `true` when the current browser supports WebGL.
 * Safe for SSR (returns `false` during server render).
 */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    setSupported(probeWebGL());
  }, []);

  return supported;
}
