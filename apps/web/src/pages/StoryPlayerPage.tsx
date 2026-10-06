import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/common/Button';

interface Section {
  order: number;
  heading: string;
  content: string;
  animationKey: string;
  evidenceCard: Record<string, string>;
  suggestedQuestion: string;
  sourceLinks: string[];
}

interface StoryData {
  title: string;
  summary: string;
  category: string;
  earthdataContext?: Record<string, string>;
  sections: Section[];
}

const STORY_DATA: Record<string, StoryData> = {
  'microgravity-fire': {
    title: 'Why Does Fire Burn as a Sphere in Space?',
    summary:
      'Discover why zero-gravity combustion eliminates natural buoyancy convection, creating serene spherical flames where molecular diffusion dictates life and death.',
    category: 'Physics Explainer',
    sections: [
      {
        order: 0,
        heading: 'The Force That Shapes Candle Flames',
        content:
          'On Earth, when you light a candle, hot air expands and becomes less dense than the surrounding cold air. Gravity pulls the denser cold air downward, forcing the hot air to rise. This buoyant natural convection pulls fresh oxygen into the base and stretches the flame into a teardrop shape.',
        animationKey: 'earth-teardrop-flame',
        evidenceCard: {
          Principle: 'Buoyant Natural Convection',
          'Gravity Regime': '1.0g (Standard Earth Gravity)',
          'Peak Gas Velocity': '~1.5 m/s upward buoyancy draft',
        },
        suggestedQuestion: 'Why do microgravity flames form a sphere?',
        sourceLinks: ['NASA Glenn Research Center Drop Tower Archives'],
      },
      {
        order: 1,
        heading: 'The Freefall Revolution',
        content:
          'In microgravity aboard the International Space Station, gravity is cancelled by continuous orbital freefall. Hot combustion gases no longer rise. Without buoyancy, oxygen cannot be pulled into the flame base by convection. Instead, oxygen must slowly migrate into the reaction zone purely via molecular diffusion.',
        animationKey: 'spherical-diffusion-halo',
        evidenceCard: {
          Experiment: 'FLEX-2 (Flame Extinction Experiment)',
          Observation: 'Symmetrical blue spherical diffusion shell',
          'Transport Mode': 'Pure molecular diffusion (D ≈ 0.24 cm²/s)',
        },
        suggestedQuestion: 'How does molecular diffusion replace convection in orbit?',
        sourceLinks: ['NASA TM-2015-218820 (FLEX-2)', 'ISS Physical Sciences Informatics'],
      },
      {
        order: 2,
        heading: 'Suffocation and the Life-Support Paradox',
        content:
          'Because oxygen moves so slowly without convection, a zero-gravity flame in completely stagnant air quickly suffocates in its own carbon dioxide shell. However, the gentle breeze from spacecraft life-support ventilation (0.05 to 0.20 m/s) sweeps the CO₂ away and feeds the flame fresh oxidizer.',
        animationKey: 'stagnant-suffocation-graph',
        evidenceCard: {
          Experiment: 'Saffire-I Flight Investigation',
          Finding: 'Self-quenching under 0 m/s quiescent flow; sustained spread at 0.20 m/s',
          Platform: 'Cygnus OA-5 Cargo Spacecraft',
        },
        suggestedQuestion: 'What did Saffire discover about spacecraft ventilation?',
        sourceLinks: ['Saffire-I Flight Report (NASA/TM-2017-219500)'],
      },
    ],
  },
  'fire-from-space': {
    title: 'Fire from Space vs Fire in Space',
    summary:
      'Bridging NASA Earthdata satellite thermal anomaly detection of terrestrial wildfires with microgravity combustion inside the Cygnus spacecraft.',
    category: 'Earthdata Bridge',
    earthdataContext: {
      Sensor: 'Terra/Aqua MODIS & Suomi NPP VIIRS',
      Bands: 'Thermal Infrared 3.9µm and 11µm',
      Application: 'Active Fire Detection & Burned Area Mapping',
      Provider: 'NASA LANCE FIRMS',
    },
    sections: [
      {
        order: 0,
        heading: 'Planetary Heat Signatures (NASA Earthdata FIRMS)',
        content:
          "From 700 kilometers above Earth, NASA satellites monitor our planet's fiery metabolism. Sensors on MODIS and VIIRS detect middle-infrared thermal emissions, pinpointing active wildfire fronts in near real-time through the FIRMS system at 375-meter pixel resolution.",
        animationKey: 'satellite-earth-orbit',
        evidenceCard: {
          Source: 'NASA LANCE FIRMS System',
          Resolution: '375-meter active thermal pixel',
          Coverage: 'Global terrestrial wildfire monitoring',
        },
        suggestedQuestion: 'How does NASA detect wildfires from orbit?',
        sourceLinks: ['NASA Earthdata FIRMS Data User Guide', 'MODIS Thermal Anomaly Product'],
      },
      {
        order: 1,
        heading: 'The Enclosed Cygnus Chamber',
        content:
          'While Earthdata satellites gaze downward at continent-scale fires, engineers inside the Cygnus vehicle after ISS unberthing ignited the largest deliberate fires ever conducted in space. Here, the challenge is microscopic containment and crew cabin safety rather than planetary observation.',
        animationKey: 'cygnus-burn-chamber',
        evidenceCard: {
          Experiment: 'Saffire-II Material Flammability Assessment',
          'Sample Dimension': 'PMMA acrylic & Nomex samples in flow duct',
          Safety: 'Conducted post-unberth prior to atmospheric reentry',
        },
        suggestedQuestion: 'Why did NASA burn Cygnus spacecraft after departing ISS?',
        sourceLinks: ['AIAA 2018-0912 (Saffire-II)', 'NASA Glenn Combustion Archives'],
      },
    ],
  },
};

export const StoryPlayerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const storyKey = slug && STORY_DATA[slug] ? slug : 'microgravity-fire';
  const story = STORY_DATA[storyKey];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const section = story.sections[currentStep] || story.sections[0];
  const totalSteps = story.sections.length;

  // Render animated canvas visualizer depending on animationKey
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId = 0;
    const w = canvas.width;
    const h = canvas.height;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Deep space background
      ctx.fillStyle = '#020713';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      if (section.animationKey === 'earth-teardrop-flame') {
        // Draw 1g buoyant flame (elongated teardrop with rising air particles)
        // Upward buoyancy draft vectors
        ctx.strokeStyle = 'rgba(121,220,232,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const x = cx - 60 + i * 30;
          const offset = (frame * 2 + i * 20) % (h - 60);
          const y = h - 30 - offset;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - 20);
          ctx.stroke();
        }

        // Teardrop flame
        const grad = ctx.createLinearGradient(cx, cy + 50, cx, cy - 70);
        grad.addColorStop(0, 'rgba(40,100,255,0.7)');
        grad.addColorStop(0.3, 'rgba(255,140,20,0.85)');
        grad.addColorStop(0.7, 'rgba(255,220,80,0.9)');
        grad.addColorStop(1, 'rgba(255,255,220,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 65 + Math.sin(frame * 0.1) * 3);
        ctx.bezierCurveTo(cx + 35, cy - 20, cx + 30, cy + 45, cx, cy + 45);
        ctx.bezierCurveTo(cx - 30, cy + 45, cx - 35, cy - 20, cx, cy - 65 + Math.sin(frame * 0.1) * 3);
        ctx.fill();

        // Label
        ctx.fillStyle = '#79dce8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1g BUOYANT CONVECTION (RISING TEARDROP)', cx, h - 16);
      } else if (section.animationKey === 'spherical-diffusion-halo') {
        // Draw 0g spherical flame with radial diffusion vectors
        const radius = 50 + Math.sin(frame * 0.04) * 2;

        // Diffusion glow halo
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius * 1.3);
        grad.addColorStop(0, 'rgba(255,220,180,0.9)');
        grad.addColorStop(0.3, 'rgba(255,120,40,0.7)');
        grad.addColorStop(0.8, 'rgba(70,160,255,0.4)');
        grad.addColorStop(1, 'rgba(40,120,255,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Central droplet fuel
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        // Radial diffusion arrows
        ctx.strokeStyle = 'rgba(121,220,232,0.3)';
        ctx.lineWidth = 1;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const r1 = radius + 15;
          const r2 = r1 + 14 + Math.sin(frame * 0.08 + a) * 4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
          ctx.stroke();
        }

        ctx.fillStyle = '#79dce8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('0g MOLECULAR DIFFUSION (SPHERICAL HALO)', cx, h - 16);
      } else if (section.animationKey === 'satellite-earth-orbit') {
        // Draw Earth satellite sensing orbit with thermal pixels
        ctx.fillStyle = 'rgba(20,50,90,0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy + 90, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(121,220,232,0.4)';
        ctx.stroke();

        // Satellite scanning beam
        const satX = cx - 80 + Math.sin(frame * 0.03) * 30;
        const satY = cy - 60;
        ctx.fillStyle = '#79dce8';
        ctx.fillRect(satX - 6, satY - 4, 12, 8);

        // Beam
        ctx.fillStyle = 'rgba(255,122,61,0.15)';
        ctx.beginPath();
        ctx.moveTo(satX, satY + 4);
        ctx.lineTo(cx - 30, cy + 20);
        ctx.lineTo(cx + 30, cy + 20);
        ctx.closePath();
        ctx.fill();

        // Thermal hotspots
        ctx.fillStyle = '#ff3b57';
        ctx.beginPath();
        ctx.arc(cx - 5, cy + 18, 4 + Math.sin(frame * 0.1) * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff7a3d';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NASA FIRMS 375m THERMAL ANOMALY SENSING', cx, h - 16);
      } else {
        // Cygnus burn chamber duct schematic
        ctx.strokeStyle = 'rgba(214,239,255,0.2)';
        ctx.strokeRect(cx - 120, cy - 40, 240, 80);

        // Forced airflow arrow
        ctx.strokeStyle = '#79dce8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy);
        ctx.lineTo(cx + 80, cy);
        ctx.stroke();

        // Burning fuel strip
        ctx.fillStyle = '#ff7a3d';
        ctx.fillRect(cx - 20, cy - 6, 60, 12);

        ctx.fillStyle = '#fff';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CYGNUS FLOW DUCT (0.05 - 0.20 m/s AIRFLOW)', cx, h - 16);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [section.animationKey]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Breadcrumb & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Story Index</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            PART {currentStep + 1} OF {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {story.sections.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`w-7 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'bg-cyan-400 w-10 shadow-sm shadow-cyan-400/50'
                    : idx < currentStep
                    ? 'bg-cyan-700/60'
                    : 'bg-white/15'
                }`}
                title={`Jump to Part ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Story Title & Badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            {story.category}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400 font-mono">P0 Story Milestone</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white font-['Space_Grotesk',sans-serif]">
          {story.title}
        </h1>
      </div>

      {/* Earthdata Context Pill Banner (if applicable) */}
      {story.earthdataContext && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-300 font-mono">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            <span>EARTHDATA INTEGRATION: {story.earthdataContext.Sensor}</span>
          </div>
          <span className="text-slate-400">{story.earthdataContext.Provider}</span>
        </div>
      )}

      {/* Interactive Visualizer Canvas */}
      <div className="canvas-wrapper aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative">
        <canvas
          ref={canvasRef}
          width={700}
          height={300}
          className="w-full h-full block"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] font-mono text-cyan-300">
          <span>ANIMATION KEY: {section.animationKey}</span>
        </div>
      </div>

      {/* Current Section Narrative Content */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/15 space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
          {section.heading}
        </h2>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
          {section.content}
        </p>

        {/* Embedded Empirical Evidence Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>NASA Empirical Evidence Card</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Level A/B Provenance</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {Object.entries(section.evidenceCard).map(([key, val]) => (
              <div key={key} className="p-2 rounded bg-white/5 border border-white/5">
                <span className="text-slate-400">{key}: </span>
                <span className="text-white font-semibold">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
            <span>Sources:</span>
            {section.sourceLinks.map((s, i) => (
              <span key={i} className="text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Ask IGNIS Inquiry Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Deepen this science with Ask IGNIS:
            </div>
            <p className="text-xs text-slate-300 italic">
              "{section.suggestedQuestion}"
            </p>
          </div>
          <Link to="/ask">
            <Button
              variant="outline"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              className="shrink-0"
            >
              Ask IGNIS RAG
            </Button>
          </Link>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          size="md"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Previous Part
        </Button>

        {currentStep < totalSteps - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))}
            className="flex-row-reverse"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Next Part
          </Button>
        ) : (
          <Link to="/explore">
            <Button
              variant="primary"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete Story
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
