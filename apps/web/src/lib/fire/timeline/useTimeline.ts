import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { BuildTimelineOptions } from './buildTimeline.ts';
import { buildTimeline } from './buildTimeline.ts';
import type { Timeline, TimelineFrameState } from './types.ts';

export interface UseTimelineReturn {
  timeline: Timeline;
  t: number;
  isPlaying: boolean;
  speed: number;
  frameState: TimelineFrameState;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (targetTime_s: number) => void;
  setSpeed: (speedMultiplier: number) => void;
  restart: () => void;
}

export function useTimeline(options: BuildTimelineOptions = {}, autoPlay: boolean = true): UseTimelineReturn {
  // Precomputed deterministic timeline
  const timeline = useMemo(() => buildTimeline(options), [
    options.habitatId,
    options.fuel,
    options.sourceZoneId,
    options.seed,
    options.mode,
    options.growthRate,
    options.peakHRR_kW,
    options.duration_s,
    options.crewConfirmDelay_s,
  ]);

  const [t, setT] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [speed, setSpeedState] = useState<number>(1.0);

  const tRef = useRef<number>(0);
  tRef.current = t;

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef<number>(speed);
  speedRef.current = speed;

  const lastRafTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // RAF loop for monotonic, drift-free time updates
  useEffect(() => {
    if (!isPlaying) {
      lastRafTimeRef.current = null;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (lastRafTimeRef.current === null) {
        lastRafTimeRef.current = now;
      } else {
        const deltaSec = (now - lastRafTimeRef.current) / 1000.0;
        lastRafTimeRef.current = now;

        const nextT = tRef.current + deltaSec * speedRef.current;
        if (nextT >= timeline.duration_s) {
          tRef.current = timeline.duration_s;
          setT(timeline.duration_s);
          setIsPlaying(false);
          return;
        } else {
          tRef.current = nextT;
          setT(nextT);
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, timeline.duration_s]);

  const play = useCallback(() => {
    if (tRef.current >= timeline.duration_s) {
      tRef.current = 0;
      setT(0);
    }
    setIsPlaying(true);
  }, [timeline.duration_s]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seek = useCallback(
    (targetTime_s: number) => {
      const clamped = Math.max(0, Math.min(timeline.duration_s, targetTime_s));
      tRef.current = clamped;
      setT(clamped);
    },
    [timeline.duration_s]
  );

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
  }, []);

  const restart = useCallback(() => {
    tRef.current = 0;
    setT(0);
    setIsPlaying(true);
  }, []);

  const frameState = useMemo(() => timeline.getStateAt(t), [timeline, t]);

  return {
    timeline,
    t,
    isPlaying,
    speed,
    frameState,
    play,
    pause,
    togglePlay,
    seek,
    setSpeed,
    restart,
  };
}

