import React, { useEffect, useRef } from 'react';

export const GlowingCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const settings = {
      length: 40,
      width: 8,
      taper: 0.8,
      follow: 0.16,
      intensity: 1.9,
      spread: 1.2,
      brightness: 1.25,
      pulse: 1.1,
      idleTimeout: 700,
      fadeDuration: 900,
    };

    const points = Array.from({ length: settings.length }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    let moved = 0;
    let ready = false;

    const isEnabled = () => finePointer.matches && !motion.matches && !document.hidden;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      if (!canvas || !ctx) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      ready = false;
      if (ctx) ctx.clearRect(0, 0, width, height);
    }

    function draw(now: number) {
      frame = 0;
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const fade = Math.max(0, 1 - Math.max(0, now - moved - settings.idleTimeout) / settings.fadeDuration);
      if (!isEnabled() || fade === 0) {
        stop();
        return;
      }

      const step = Math.min((now - (previous || now - 16.67)) / 16.67, 3);
      previous = now;

      for (let i = 0; i < points.length; i++) {
        const leader = i === 0 ? target : points[i - 1];
        const follow = 1 - Math.pow(1 - (i === 0 ? settings.follow : 0.38), step);
        points[i].x += (leader.x - points[i].x) * follow;
        points[i].y += (leader.y - points[i].y) * follow;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const layer of [
        { scale: 5.5, alpha: 0.035 },
        { scale: 3, alpha: 0.09 },
        { scale: 1, alpha: 0.65 },
      ]) {
        for (let i = points.length - 1; i > 0; i--) {
          const progress = i / (points.length - 1);
          const life = Math.pow(1 - progress, 0.9);
          const pulse = 1 + Math.sin(now * 0.003 * settings.pulse - progress * 11) * 0.16;
          const rgb = [103 + 64 * progress, 232 - 93 * progress, 249 + progress];
          ctx.strokeStyle = `rgba(${rgb.map(Math.round).join(',')},${Math.min(
            1,
            layer.alpha * life * fade * pulse * settings.brightness * settings.intensity / 1.9
          )})`;
          ctx.lineWidth =
            settings.width *
            (1 - settings.taper * progress) *
            layer.scale *
            (layer.scale > 1 ? settings.spread : 1);
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[i - 1].x, points[i - 1].y);
          ctx.stroke();
        }
      }

      const head = points[0];
      const radius = settings.width * 3 * settings.spread;
      const halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
      halo.addColorStop(0, `rgba(235,255,255,${0.85 * fade})`);
      halo.addColorStop(0.15, `rgba(103,232,249,${0.6 * fade})`);
      halo.addColorStop(0.45, `rgba(103,232,249,${0.13 * fade})`);
      halo.addColorStop(1, 'rgba(103,232,249,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(head.x - radius, head.y - radius, radius * 2, radius * 2);

      frame = requestAnimationFrame(draw);
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !isEnabled()) return;
      target.x = event.clientX;
      target.y = event.clientY;
      moved = performance.now();
      if (!ready) {
        points.forEach((point) => {
          point.x = target.x;
          point.y = target.y;
        });
        ready = true;
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onResize = () => {
      stop();
      resize();
    };

    resize();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', stop);
    window.addEventListener('blur', stop);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      stop();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', stop);
      window.removeEventListener('blur', stop);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="glow-cursor" aria-hidden="true" />;
};
