import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  BookOpen,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

export const LandingPage: React.FC = () => {
  const [selectedFlameMode, setSelectedFlameMode] = useState<'earth' | 'space'>('space');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Canvas 2D Animated Flame Visualizer (Earth 1g vs Microgravity 0g)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 + (selectedFlameMode === 'earth' ? 25 : 0);

      ctx.clearRect(0, 0, w, h);

      if (selectedFlameMode === 'earth') {
        // --- EARTH 1g: Elongated, flickering, buoyant teardrop flame ---
        const flicker = Math.sin(t * 7) * 3 + Math.cos(t * 11) * 2;
        const flameHeight = 110 + flicker;
        const flameWidth = 44 + Math.sin(t * 5) * 2;

        // Upward convective buoyancy airflow particles
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1.5;
        for (let i = -2; i <= 2; i++) {
          const streamX = cx + i * 28;
          const streamY = (h - ((t * 80 + Math.abs(i) * 30) % h));
          ctx.beginPath();
          ctx.moveTo(streamX, streamY);
          ctx.lineTo(streamX, streamY - 20);
          ctx.stroke();
        }

        // Outer buoyant flame sheath (yellow/orange)
        const outerGrad = ctx.createRadialGradient(
          cx, cy - 20, 10,
          cx, cy - 30, flameHeight
        );
        outerGrad.addColorStop(0, 'rgba(255, 230, 120, 0.95)');
        outerGrad.addColorStop(0.35, 'rgba(255, 122, 61, 0.85)');
        outerGrad.addColorStop(0.75, 'rgba(239, 68, 68, 0.4)');
        outerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - flameWidth / 2, cy + 10);
        ctx.quadraticCurveTo(cx - flameWidth, cy - flameHeight * 0.4, cx, cy - flameHeight);
        ctx.quadraticCurveTo(cx + flameWidth, cy - flameHeight * 0.4, cx + flameWidth / 2, cy + 10);
        ctx.closePath();
        ctx.fillStyle = outerGrad;
        ctx.fill();
        ctx.restore();

        // Inner blue luminous base
        const blueGrad = ctx.createRadialGradient(cx, cy + 5, 2, cx, cy, 25);
        blueGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        blueGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.5)');
        blueGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = blueGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + 5, 20, 0, Math.PI * 2);
        ctx.fill();

        // Wick / fuel source
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 3, cy + 8, 6, 22);

      } else {
        // --- SPACE 0g: Serene, spherically symmetric, blue diffusion halo ---
        const pulse = Math.sin(t * 2) * 2;
        const radius = 55 + pulse;

        // Radial molecular diffusion field rings
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        for (let r = 75; r <= 135; r += 20) {
          ctx.beginPath();
          ctx.arc(cx, cy, r + pulse * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Outer faint blue reaction zone
        const haloGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.6);
        haloGrad.addColorStop(0, 'rgba(125, 211, 252, 0.85)');
        haloGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.65)');
        haloGrad.addColorStop(0.75, 'rgba(14, 165, 233, 0.25)');
        haloGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Spherical blue chemiluminescent shell
        const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.7)');
        coreGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.4)');
        coreGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Suspended droplet / central fuel anchor
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedFlameMode]);

  return (
    <div className="space-y-24 max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      {/* 1. HERO SECTION */}
      <section className="pt-6 sm:pt-12 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>NASA Space Apps Challenge 2026 • Flame in Freefall</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-['Space_Grotesk',sans-serif] leading-[1.08]">
            Build a habitat. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400">
              Start a fire.
            </span> <br />
            Discover the science.
          </h1>
          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            What happens to combustion when buoyant gravity vanishes? Explore four decades of authentic NASA microgravity flight experiments with live physics, visual analytics, and zero AI hallucination.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/build">
            <Button variant="primary" size="lg" icon={<Flame className="w-5 h-5 text-white" />}>
              Launch Fire Simulator
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="secondary" size="lg" icon={<BookOpen className="w-5 h-5" />}>
              Explore Stories
            </Button>
          </Link>
          <Link to="/ask">
            <Button variant="ghost" size="lg" icon={<Sparkles className="w-5 h-5 text-cyan-400" />}>
              Ask IGNIS AI
            </Button>
          </Link>
        </div>

        {/* Live Interactive Flame Visual Comparison Teaser */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="text-left">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                  Interactive Physics Teaser
                </span>
                <h3 className="text-sm font-bold text-white">
                  Buoyancy vs Pure Diffusion Flame Dynamics
                </h3>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex rounded-xl bg-black/60 p-1 border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedFlameMode('earth')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFlameMode === 'earth'
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Earth (1g Buoyant)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFlameMode('space')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFlameMode === 'space'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Orbit (0g Microgravity)
                </button>
              </div>
            </div>

            {/* Canvas Visualizer + Comparison Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-7 aspect-video sm:aspect-square max-h-64 mx-auto rounded-2xl bg-black/90 border border-slate-800/80 flex items-center justify-center relative overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="w-full h-full object-contain block"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 border border-slate-800 text-[10px] font-mono text-slate-300">
                  {selectedFlameMode === 'earth' ? 'TERRESTRIAL 1g' : 'ORBITAL 0g (ISS)'}
                </div>
              </div>

              <div className="sm:col-span-5 text-left space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">FLAME GEOMETRY</span>
                  <span className="text-white font-bold text-sm block">
                    {selectedFlameMode === 'earth' ? 'Teardrop (Upward Buoyancy)' : 'Symmetrical Sphere (0g)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">PEAK FLAME TEMPERATURE</span>
                  <span className={selectedFlameMode === 'earth' ? 'text-amber-400 font-bold text-sm block' : 'text-cyan-400 font-bold text-sm block'}>
                    {selectedFlameMode === 'earth' ? '~1600 K (High Radiative Soot)' : '~1100 K (Cool Blue Chemiluminescence)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">MASS TRANSPORT MECHANISM</span>
                  <span className="text-slate-300 block text-[11px]">
                    {selectedFlameMode === 'earth'
                      ? 'Natural convective upward draft replenishes O₂'
                      : 'Molecular diffusion only; requires forced ventilation'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 Simple Steps) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="plasma" size="xs">THE THREE-STEP WORKFLOW</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            How IGNIS Works
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            From atmospheric engineering to empirical NASA flight telemetry in three transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Configure Your Habitat</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select Orbital (0g), Lunar Base (0.16g), or Mars Base (0.38g). Interactively dial oxygen concentration (18–34%), cabin pressure, and life-support duct airflow.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Synthesize Fire Behavior</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our 6-factor similarity engine computes flame spread likelihood, sustained burning duration, and low-flow extinction boundaries derived from NASA flight experiments.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Inspect NASA Ground Truth</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every insight traces directly to peer-reviewed NASA flight studies (Saffire, BASS, FLEX). Verify thermocouple logs, video records, and DOIs with zero AI hallucination.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE EXPERIENCE PORTALS */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="flame" size="xs">PLATFORM CAPABILITIES</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Choose an Experience
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Directly navigate to any platform tool from here or the top navigation bar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Portal 1: Habitat Fire Lab */}
          <Card variant="glass" padding="lg" className="flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <Badge variant="flame" size="xs">SIMULATOR</Badge>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Habitat Fire Lab
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Tune cabin atmospheres, choose material samples (PMMA, cotton, Nomex), and synthesize fire behavior profiles with gravity-transfer warnings.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/build" className="w-full">
                <Button variant="primary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-4 h-4" />}>
                  Launch Simulator
                </Button>
              </Link>
            </div>
          </Card>

          {/* Portal 2: Guided Stories */}
          <Card variant="glass" padding="lg" className="flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <Badge variant="plasma" size="xs">VISUAL STORIES</Badge>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Guided Science Stories
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Visual step-by-step physics explainers: why fire forms a sphere in weightlessness, the airflow paradox in space stations, and the Earthdata satellite bridge.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/explore" className="w-full">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Stories
                </Button>
              </Link>
            </div>
          </Card>

          {/* Portal 3: NASA Experiments & Flame Vision */}
          <Card variant="glass" padding="lg" className="flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <Badge variant="plasma" size="xs">FLIGHT DATA & CV</Badge>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Experiments & Flame Vision
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Access 40+ flight test records and scrub through authentic ISS optical camera recordings synchronized with classical computer vision telemetry.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/experiments" className="w-full">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={<ArrowRight className="w-4 h-4" />}>
                  Browse Database
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. ASK IGNIS CALLOUT BANNER */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>GROUNDED NASA RESEARCH ASSISTANT</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
              Ask IGNIS Anything About Space Fire
            </h3>
            <p className="text-slate-300 text-sm">
              Inquiries are strictly constrained to empirical NASA flight literature and physical science informatics.
            </p>
          </div>

          <Link to="/ask">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Open Ask IGNIS
            </Button>
          </Link>
        </div>

        {/* Suggested Quick Questions */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-slate-400 block mb-2.5">
            TRY ASKING A POPULAR QUESTION:
          </span>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/ask?q=Why+does+fire+burn+as+a+sphere+in+space%3F"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all font-mono"
            >
              "Why does fire burn as a sphere in space?" →
            </Link>
            <Link
              to="/ask?q=Can+flames+survive+without+forced+airflow+in+microgravity%3F"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all font-mono"
            >
              "Can flames survive without ventilation?" →
            </Link>
            <Link
              to="/ask?q=What+did+the+Saffire+spacecraft+fire+experiments+discover%3F"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all font-mono"
            >
              "What did Saffire discover about large fabric burns?" →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CREDIBILITY & NON-OPERATIONAL NOTICE */}
      <section className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center space-y-2 text-xs text-slate-500 font-mono">
        <p>
          <strong>NASA Physical Sciences Informatics (PSI) • NASA Earthdata • NASA Open Data</strong>
        </p>
        <p className="max-w-2xl mx-auto leading-relaxed">
          IGNIS is an educational and research exploration platform for the NASA International Space Apps Challenge 2026. All synthesized profiles are illustrative and non-operational (PRD v1.1 §1.1).
        </p>
      </section>
    </div>
  );
};

export default LandingPage;
