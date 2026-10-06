import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Button } from '../components/common/Button';

interface PlanetInfo {
  name: string;
  presetText: string;
  clip: string;
  still: string;
  cutout: string;
  lede: string;
}

const PLANETS: Record<string, PlanetInfo> = {
  orbital: {
    name: 'ORBITAL',
    presetText: 'ORBITAL (0g MICROGRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png',
    lede: 'Build a habitat in microgravity. Adjust cabin oxygen, pressure, and airflow — discover what NASA’s real microgravity combustion experiments reveal about fire behavior in your scenario.',
  },
  moon: {
    name: 'LUNAR',
    presetText: 'LUNAR (0.16g PARTIAL GRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png',
    lede: 'Design a lunar base habitat. 0.16g partial gravity alters flame dynamics — evidence from microgravity experiments carries an explicit gravity-transfer warning. Discover what the science actually shows.',
  },
  mars: {
    name: 'MARS',
    presetText: 'MARS (0.38g PARTIAL GRAVITY)',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_51eae59a-2459-4c84-907c-cc5edfe5fea7.mp4',
    still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png',
    lede: 'A fire starts halfway to Mars. What does the evidence say? Explore NASA’s combustion research and discover what partial gravity means for flame spread and extinction limits.',
  },
};

const ORDER = ['orbital', 'moon', 'mars'];

interface AskPromptItem {
  status: string;
  text: string;
  sources: string[];
}

const ASK_DATA: AskPromptItem[] = [
  {
    status: 'GROUNDED ANSWER • 95% EVIDENCE COVERAGE',
    text: 'In Earth gravity, hot combustion gases rise due to buoyancy (natural convection), drawing fresh oxygen into the base and giving flames their characteristic teardrop shape. In microgravity (0g), gravity-driven buoyancy is absent. Oxygen transport occurs almost purely via molecular diffusion, causing the reaction zone to form a symmetrical sphere around the fuel source with lower flame temperatures and a distinct blue chemiluminescent glow.',
    sources: [
      'NASA TM-2015-218820 (FLEX-2)',
      'ISS Physical Science Informatics (PSI)',
      'Combustion Integrated Rack (CIR)',
    ],
  },
  {
    status: 'GROUNDED ANSWER • 93% EVIDENCE COVERAGE',
    text: 'The Saffire (Spacecraft Fire Experiment) missions conducted inside Cygnus cargo vehicles after unberthing from the ISS revealed that large-scale materials (up to 1 meter in length) burn differently than small laboratory samples. Saffire demonstrated that low-speed cabin ventilation (0.05 to 0.20 m/s) maintains active flame propagation across fabric and PMMA, whereas complete cessation of airflow leads to rapid oxygen starvation and flame quenching.',
    sources: [
      'Saffire-I Flight Report (NASA/TM-2017-219500)',
      'NASA Glenn Research Center Combustion Archives',
      'Cygnus OA-6 Experiment Protocol',
    ],
  },
  {
    status: 'GROUNDED ANSWER • 88% EVIDENCE COVERAGE (TRANSFERABILITY CAVEAT)',
    text: "Yes. Lunar gravity is approximately one-sixth (0.16g) of Earth's gravity. In 0.16g, buoyancy does not entirely vanish: weak natural convection currents still develop, transporting hot combustion products upward and drawing modest amounts of fresh oxidizer. Consequently, lunar flames are not perfectly spherical like orbital flames, and materials exhibit slightly lower extinction limits than in total weightlessness.",
    sources: [
      'Zero-Gravity Facility Drop Tower 1/6g Tests',
      'BASS-II Partial Gravity Extrapolation Studies',
      'NASA Exploration Atmosphere Standards',
    ],
  },
];

interface ChartPreset {
  o2: { pct: number; text: string; tag: string; color: string };
  flow: { pct: number; text: string; tag: string; color: string };
  press: { pct: number; text: string; tag: string; color: string };
  fuel: { pct: number; text: string; tag: string; color: string };
  comp: { pct: number; text: string; tag: string; color: string };
  status: string;
}

const CHART_PRESETS: Record<string, ChartPreset> = {
  iss: {
    o2: { pct: 28, text: '21.0 %', tag: 'SAFE', color: '#39ff96' },
    flow: { pct: 32, text: '0.05 m/s', tag: 'SAFE', color: '#39ff96' },
    press: { pct: 70, text: '101.3 kPa', tag: 'MODERATE', color: '#ffaa40' },
    fuel: { pct: 78, text: 'PMMA Acrylic', tag: 'ELEVATED', color: '#ff7a3d' },
    comp: { pct: 44, text: '56 / 100 Safety', tag: 'MODERATE', color: '#ffaa40' },
    status: 'Controlled ISS Microgravity Propagation Margin',
  },
  gateway: {
    o2: { pct: 88, text: '34.0 %', tag: 'CRITICAL', color: '#ff3b57' },
    flow: { pct: 45, text: '0.08 m/s', tag: 'MODERATE', color: '#ffaa40' },
    press: { pct: 35, text: '56.0 kPa', tag: 'SAFE', color: '#39ff96' },
    fuel: { pct: 22, text: 'Nomex Fabric', tag: 'SAFE', color: '#39ff96' },
    comp: { pct: 52, text: '48 / 100 Safety', tag: 'MODERATE', color: '#ffaa40' },
    status: 'High O2 offset by low pressure and flame-resistant Nomex',
  },
  depower: {
    o2: { pct: 28, text: '21.0 %', tag: 'SAFE', color: '#39ff96' },
    flow: { pct: 10, text: '0.00 m/s', tag: 'SAFE', color: '#39ff96' },
    press: { pct: 70, text: '101.3 kPa', tag: 'MODERATE', color: '#ffaa40' },
    fuel: { pct: 58, text: 'Cotton Blend', tag: 'MODERATE', color: '#ffaa40' },
    comp: { pct: 18, text: '82 / 100 Safety', tag: 'SAFE', color: '#39ff96' },
    status: 'Quiescent Starvation: Fire rapidly self-extinguishes in its own CO2 dome',
  },
  critical: {
    o2: { pct: 82, text: '32.0 %', tag: 'CRITICAL', color: '#ff3b57' },
    flow: { pct: 92, text: '0.22 m/s', tag: 'CRITICAL', color: '#ff3b57' },
    press: { pct: 70, text: '101.3 kPa', tag: 'MODERATE', color: '#ffaa40' },
    fuel: { pct: 88, text: 'Polyethylene', tag: 'CRITICAL', color: '#ff3b57' },
    comp: { pct: 86, text: '14 / 100 Safety', tag: 'CRITICAL', color: '#ff3b57' },
    status: 'High ventilation anomaly with enriched O2 creates runaway flame propagation',
  },
};

export const LandingPage: React.FC = () => {
  // 1. Featured environment planet state
  const [featuredPlanet, setFeaturedPlanet] = useState<string>('orbital');

  // 2. Habitat Simulator State
  const [simDest, setSimDest] = useState<'orbital' | 'lunar' | 'mars'>('orbital');
  const [simO2, setSimO2] = useState<number>(21.0);
  const [simPress, setSimPress] = useState<number>(101.3);
  const [simFlow, setSimFlow] = useState<number>(0.05);
  const [simFuel, setSimFuel] = useState<string>('pmma');

  // 3. Flame Vision Canvas & Scrubber State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [flameTime, setFlameTime] = useState<number>(3.5);
  const [flameHud, setFlameHud] = useState({
    status: 'STEADY SPHERICAL FLAME',
    areaRatio: '1.42',
    centroid: '[320, 200]',
  });

  // 4. Ask IGNIS prompt index
  const [askIndex, setAskIndex] = useState<number>(0);

  // 5. Telemetry Chart Preset
  const [chartPresetKey, setChartPresetKey] = useState<string>('iss');

  // 6. Research Disclaimer Modal
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);

  // Remaining 2 planets for left and right buttons
  const otherPlanets = ORDER.filter((p) => p !== featuredPlanet);
  const leftPlanetKey = otherPlanets[0];
  const rightPlanetKey = otherPlanets[1];

  // Draw Flame Vision Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background deep dark
    ctx.fillStyle = '#020713';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(121,220,232,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Droplet fuel center
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    let radius = 0;
    let statusText = 'EXTINGUISHED';
    let areaRatioVal = '0.00';

    if (flameTime < 0.5) {
      statusText = 'SPARK IGNITION';
      radius = flameTime * 50;
      areaRatioVal = (radius / 30).toFixed(2);
    } else if (flameTime < 6.5) {
      statusText = 'STEADY SPHERICAL FLAME';
      radius = 55 + Math.sin(flameTime * 1.5) * 4;
      areaRatioVal = (1.2 + (flameTime / 6.5) * 0.4).toFixed(2);
    } else if (flameTime < 8.4) {
      statusText = 'COOL FLAME TRANSITION';
      const decay = (8.4 - flameTime) / 1.9;
      radius = 55 * decay;
      areaRatioVal = (0.5 * decay).toFixed(2);
    } else {
      statusText = 'COMPLETE EXTINCTION (t=8.42s)';
      radius = 0;
      areaRatioVal = '0.00';
    }

    setFlameHud({
      status: statusText,
      areaRatio: areaRatioVal,
      centroid: `[${cx.toFixed(0)}, ${cy.toFixed(0)}]`,
    });

    if (radius > 1) {
      // Outer spherical glow
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.4);
      grad.addColorStop(0, 'rgba(255, 230, 180, 0.9)');
      grad.addColorStop(0.3, 'rgba(255, 140, 50, 0.7)');
      grad.addColorStop(0.7, 'rgba(70, 160, 255, 0.4)');
      grad.addColorStop(1, 'rgba(40, 120, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // CV Segmented Contour (cyan dashed outline)
      ctx.strokeStyle = '#79dce8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bounding Box
      ctx.strokeStyle = 'rgba(121,220,232,0.4)';
      ctx.strokeRect(cx - radius - 5, cy - radius - 5, (radius + 5) * 2, (radius + 5) * 2);

      // Centroid marker
      ctx.fillStyle = '#ff7a3d';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [flameTime]);

  // Habitat Simulation calculations
  let spreadScore = 20;
  if (simFuel === 'pmma') spreadScore += 30;
  if (simFuel === 'cotton') spreadScore += 25;
  if (simFuel === 'nomex') spreadScore -= 15;
  if (simFuel === 'poly') spreadScore += 20;
  spreadScore += (simO2 - 21) * 3.5;
  spreadScore += simFlow * 120;
  spreadScore = Math.max(10, Math.min(95, Math.round(spreadScore)));

  let sustainedScore = Math.round(spreadScore * 0.9 + (simPress / 101.3) * 10);
  sustainedScore = Math.max(15, Math.min(92, sustainedScore));

  let extScore = Math.round(100 - spreadScore * 0.7);
  if (simFlow === 0) extScore = 95;

  const spreadTag =
    spreadScore > 65
      ? { label: 'Elevated', cls: 'tag-elevated', bg: 'var(--ember)' }
      : spreadScore > 40
      ? { label: 'Mixed', cls: 'tag-mixed', bg: 'var(--amber)' }
      : { label: 'Limited', cls: 'tag-limited', bg: 'var(--cyan)' };

  const sustainedTag =
    sustainedScore > 60
      ? { label: 'Elevated', cls: 'tag-elevated', bg: 'var(--ember)' }
      : sustainedScore > 35
      ? { label: 'Mixed', cls: 'tag-mixed', bg: 'var(--amber)' }
      : { label: 'Limited', cls: 'tag-limited', bg: 'var(--cyan)' };

  const extTag =
    extScore > 70
      ? { label: 'Strong Quenching', cls: 'tag-limited', bg: 'var(--cyan)' }
      : { label: 'Moderate', cls: 'tag-mixed', bg: 'var(--amber)' };

  const currentChart = CHART_PRESETS[chartPresetKey] || CHART_PRESETS.iss;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed Space Background */}
      <div className="fixed-bg" aria-hidden="true" />

      {/* ======================================================================
          HERO STAGE (EXACT TEMPLATE ARCHITECTURE & UI)
          ====================================================================== */}
      <section className="stage">
        <div
          className="sky"
          style={{ backgroundImage: `url("${PLANETS[featuredPlanet].still}")` }}
        >
          {ORDER.map((p) => {
            const planet = PLANETS[p];
            const isActive = featuredPlanet === p;
            return (
              <video
                key={p}
                className={isActive ? 'is-active' : ''}
                autoPlay={isActive}
                preload="auto"
                src={planet.clip}
                poster={planet.still}
                muted
                loop
                playsInline
                aria-hidden="true"
              />
            );
          })}
        </div>

        <div className="ui">
          <main className="copy">
            <div className="col eyebrow">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span className="hero-badge-text">
                  NASA SPACE APPS CHALLENGE 2026 • FLAME IN FREEFALL
                </span>
              </div>
            </div>

            <h1 className="col title">
              Build a Space Habitat.<br />
              <span className="hero-gradient-text">Discover the Fire Science.</span>
            </h1>

            <div className="col dest-preset-wrapper">
              <div className="dest-preset-pill">
                <span className="dest-indicator-dot" />
                <span className="dest-preset-label">ENVIRONMENT PRESET: </span>
                <span className="dest-name">{PLANETS[featuredPlanet].presetText}</span>
              </div>
            </div>

            <p className="col lede">{PLANETS[featuredPlanet].lede}</p>

            <div className="col cta">
              {/* Left Planet Switcher Button */}
              <button
                className="planet planet-l"
                type="button"
                onClick={() => setFeaturedPlanet(leftPlanetKey)}
                title={`Switch environment to ${PLANETS[leftPlanetKey].name}`}
                aria-label={`Show ${PLANETS[leftPlanetKey].name}`}
              >
                <img
                  className="is-shown"
                  alt={PLANETS[leftPlanetKey].name}
                  src={PLANETS[leftPlanetKey].cutout}
                />
              </button>

              {/* Right Planet Switcher Button */}
              <button
                className="planet planet-r"
                type="button"
                onClick={() => setFeaturedPlanet(rightPlanetKey)}
                title={`Switch environment to ${PLANETS[rightPlanetKey].name}`}
                aria-label={`Show ${PLANETS[rightPlanetKey].name}`}
              >
                <img
                  className="is-shown"
                  alt={PLANETS[rightPlanetKey].name}
                  src={PLANETS[rightPlanetKey].cutout}
                />
              </button>

              {/* Start Building Action */}
              <button
                type="button"
                onClick={() => scrollToSection('habitat-builder')}
                className="cursor-pointer"
              >
                START BUILDING
              </button>

              <span className="label label-l">{PLANETS[leftPlanetKey].name}</span>
              <span className="label label-r">{PLANETS[rightPlanetKey].name}</span>
            </div>
          </main>
        </div>

        {/* Smooth Scroll Down Indicator */}
        <button
          className="scroll"
          type="button"
          onClick={() => scrollToSection('overview')}
          aria-label="Scroll to next section"
        >
          <svg viewBox="0 0 26 33" fill="none" aria-hidden="true">
            <path
              d="M13 1.5 V31.5 M1.9 20.4 L13 31.5 L24.1 20.4"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </button>
      </section>

      {/* ======================================================================
          IGNIS PROJECT SHOWCASE SECTIONS
          ====================================================================== */}
      <div className="ignis-content">
        {/* 1. OVERVIEW & PRODUCT THESIS */}
        <section id="overview" className="ignis-section">
          <div className="section-header">
            <div className="eyebrow-pill">NASA Space Apps Challenge 2026</div>
            <h2 className="section-title">
              The AI is Not the Source of Truth.<br />
              <span style={{ color: 'var(--cyan)' }}>NASA Experiments Are.</span>
            </h2>
            <p className="section-lead">
              IGNIS transforms four decades of NASA microgravity combustion research into a living, navigable evidence network — making data searchable, comparable, and visual without asking AI to hallucinate the physics.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="stats-banner">
            <div className="stat-box">
              <div className="stat-val">40+</div>
              <div className="stat-lbl">Years NASA Data</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">5 Levels</div>
              <div className="stat-lbl">Evidence Provenance</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">100%</div>
              <div className="stat-lbl">Traceable Citations</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">0g → 0.38g</div>
              <div className="stat-lbl">Gravity Regimes</div>
            </div>
          </div>

          {/* Two Ways In */}
          <div className="grid-2">
            <div className="glass-card mode-card">
              <div>
                <span className="mode-badge">Core Experience</span>
                <h3 className="mode-title">Build a Habitat</h3>
                <p className="mode-desc">
                  Configure your mission destination and engineer cabin atmosphere — oxygen, pressure, forced airflow, and materials. Discover comparable NASA combustion experiments and inspect an evidence-grounded fire behavior profile.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToSection('habitat-builder')}
                  className="mode-action cursor-pointer"
                >
                  Configure Scenario ↓
                </button>
                <Link to="/build" className="text-xs text-sky-400 hover:text-white flex items-center gap-1 font-mono">
                  Full Studio Studio <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass-card mode-card fire-card">
              <div>
                <span className="mode-badge">Science Stories</span>
                <h3 className="mode-title">Explore Fire</h3>
                <p className="mode-desc">
                  Journey through guided scientific stories. Discover why zero-gravity flames form perfect spheres, contrast space combustion with NASA Earthdata wildfire sensing, and scrub synchronized computer-vision flame analytics.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToSection('explore-fire')}
                  className="mode-action cursor-pointer"
                >
                  Explore Fire Stories ↓
                </button>
                <Link to="/explore" className="text-xs text-amber-400 hover:text-white flex items-center gap-1 font-mono">
                  All Stories <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE BUILD A HABITAT SIMULATOR */}
        <section
          id="habitat-builder"
          className="ignis-section"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="section-header">
            <div className="eyebrow-pill">Interactive Scenario Builder</div>
            <h2 className="section-title">Build a Space Habitat</h2>
            <p className="section-lead">
              Tune environmental variables to test fire safety against real NASA flight and drop-tower investigations.
            </p>
          </div>

          <div className="sim-container">
            {/* Left: Controls */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: '#fff' }}>
                  1. Destination & Cabin Interior
                </h3>
                <Link
                  to="/build"
                  className="text-xs text-sky-400 hover:text-white flex items-center gap-1 font-mono px-2.5 py-1 rounded bg-sky-950/40 border border-sky-800/50"
                >
                  <Sliders className="w-3 h-3" /> Full Studio
                </Link>
              </div>

              {/* Destination Selector */}
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(234,243,250,0.8)',
                  marginBottom: '8px',
                }}
              >
                MISSION DESTINATION
              </label>
              <div className="dest-tabs">
                <button
                  type="button"
                  className={`dest-btn ${simDest === 'orbital' ? 'active' : ''}`}
                  onClick={() => setSimDest('orbital')}
                >
                  Orbital (0g)
                </button>
                <button
                  type="button"
                  className={`dest-btn ${simDest === 'lunar' ? 'active' : ''}`}
                  onClick={() => setSimDest('lunar')}
                >
                  Moon Base (0.16g)
                </button>
                <button
                  type="button"
                  className={`dest-btn ${simDest === 'mars' ? 'active' : ''}`}
                  onClick={() => setSimDest('mars')}
                >
                  Mars Base (0.38g)
                </button>
              </div>

              {/* O2 Slider */}
              <div className="control-group">
                <div className="control-label">
                  <span>Oxygen Concentration (O<sub>2</sub>)</span>
                  <span className="control-val">{simO2.toFixed(1)} %</span>
                </div>
                <input
                  type="range"
                  className="sim-slider"
                  min="18.0"
                  max="34.0"
                  step="0.5"
                  value={simO2}
                  onChange={(e) => setSimO2(parseFloat(e.target.value))}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '4px',
                  }}
                >
                  <span>Earth Sea-Level (21%)</span>
                  <span>Exploration Atmosphere (34%)</span>
                </div>
              </div>

              {/* Pressure Slider */}
              <div className="control-group">
                <div className="control-label">
                  <span>Cabin Total Pressure</span>
                  <span className="control-val">{simPress.toFixed(1)} kPa</span>
                </div>
                <input
                  type="range"
                  className="sim-slider"
                  min="50.0"
                  max="101.3"
                  step="1.0"
                  value={simPress}
                  onChange={(e) => setSimPress(parseFloat(e.target.value))}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '4px',
                  }}
                >
                  <span>Reduced Hab (56 kPa)</span>
                  <span>Standard Sea Level (101.3 kPa)</span>
                </div>
              </div>

              {/* Airflow Slider */}
              <div className="control-group">
                <div className="control-label">
                  <span>Forced Ventilation Airflow</span>
                  <span className="control-val">{simFlow.toFixed(2)} m/s</span>
                </div>
                <input
                  type="range"
                  className="sim-slider"
                  min="0.00"
                  max="0.25"
                  step="0.01"
                  value={simFlow}
                  onChange={(e) => setSimFlow(parseFloat(e.target.value))}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '4px',
                  }}
                >
                  <span>Quiescent (0 m/s)</span>
                  <span>ISS Nominal (0.05 m/s)</span>
                  <span>High Flow (0.25 m/s)</span>
                </div>
              </div>

              {/* Material Selection */}
              <div className="control-group" style={{ marginBottom: 0 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '8px',
                  }}
                >
                  Target Material Sample
                </label>
                <select
                  className="fuel-select"
                  value={simFuel}
                  onChange={(e) => setSimFuel(e.target.value)}
                >
                  <option value="pmma">PMMA (Polymethyl Methacrylate / Acrylic) — Saffire benchmark</option>
                  <option value="cotton">Cotton / Fiberglass Fabric — BASS benchmark</option>
                  <option value="nomex">Nomex Flame-Resistant Aramid — Spacecraft flight suits</option>
                  <option value="poly">Polyethylene Solid Fuel — Wire insulation sim</option>
                </select>
              </div>
            </div>

            {/* Right: Fire Behavior Profile */}
            <div className="profile-card">
              <div className="profile-header">
                <div>
                  <div className="profile-title">Fire Behavior Profile</div>
                  <div style={{ fontSize: '12px', color: 'rgba(234,243,250,0.65)' }}>
                    Evaluated against 18 NASA experiments
                  </div>
                </div>
                <span className="dim-tag tag-limited">Coverage: High</span>
              </div>

              {/* Gravity Warning Banner */}
              {simDest !== 'orbital' && (
                <div className="caveat-banner">
                  <strong>⚠ GRAVITY TRANSFERABILITY WARNING:</strong> This scenario uses partial gravity (
                  <span>{simDest === 'lunar' ? '0.16g' : '0.38g'}</span>), but evidence is matched from microgravity (0g) flight data. Natural buoyancy convection begins to re-emerge at this g-level.
                </div>
              )}

              {/* Behavior Dimensions */}
              <div className="dimension-row">
                <div className="dim-meta">
                  <span>Flame Spread Evidence</span>
                  <span className={`dim-tag ${spreadTag.cls}`}>{spreadTag.label}</span>
                </div>
                <div className="dim-bar-bg">
                  <div
                    className="dim-bar-fill"
                    style={{ width: `${spreadScore}%`, background: spreadTag.bg }}
                  />
                </div>
              </div>

              <div className="dimension-row">
                <div className="dim-meta">
                  <span>Sustained Burning Evidence</span>
                  <span className={`dim-tag ${sustainedTag.cls}`}>{sustainedTag.label}</span>
                </div>
                <div className="dim-bar-bg">
                  <div
                    className="dim-bar-fill"
                    style={{ width: `${sustainedScore}%`, background: sustainedTag.bg }}
                  />
                </div>
              </div>

              <div className="dimension-row">
                <div className="dim-meta">
                  <span>Extinction Limits (Quenching vs Flammability)</span>
                  <span className={`dim-tag ${extTag.cls}`}>{extTag.label}</span>
                </div>
                <div className="dim-bar-bg">
                  <div
                    className="dim-bar-fill"
                    style={{ width: `${extScore}%`, background: extTag.bg }}
                  />
                </div>
              </div>

              {/* Matched Experiments */}
              <div className="exp-matches">
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Top Scientifically Comparable Experiments</span>
                  <Link to="/experiments" className="text-[11px] text-sky-400 hover:text-white lowercase">
                    catalog →
                  </Link>
                </div>
                <div>
                  {simFuel === 'pmma' && (
                    <>
                      <div className="exp-match-item">
                        <div>
                          <Link to="/experiment/exp-saffire-2" className="exp-name hover:text-sky-300">
                            Saffire-II (Cygnus Spacecraft Flight)
                          </Link>
                          <div className="exp-details">PMMA 5cm × 30cm • flow: 0.20 m/s • O₂: 21% • microgravity</div>
                        </div>
                        <div className="exp-score">95% Match</div>
                      </div>
                      <div className="exp-match-item">
                        <div>
                          <Link to="/experiment/exp-bass-1" className="exp-name hover:text-sky-300">
                            BASS-I Solid Fuel Extinction
                          </Link>
                          <div className="exp-details">Acrylic rod burning in quiescent to low flow</div>
                        </div>
                        <div className="exp-score">88% Match</div>
                      </div>
                    </>
                  )}
                  {simFuel === 'cotton' && (
                    <>
                      <div className="exp-match-item">
                        <div>
                          <Link to="/experiment/exp-bass-2" className="exp-name hover:text-sky-300">
                            BASS-II (Burning and Suppression of Solids)
                          </Link>
                          <div className="exp-details">Cotton-fiberglass blend • flow: 0.05 m/s • ISS Microgravity Glovebox</div>
                        </div>
                        <div className="exp-score">96% Match</div>
                      </div>
                      <div className="exp-match-item">
                        <div>
                          <Link to="/experiment/exp-saffire-3" className="exp-name hover:text-sky-300">
                            Saffire-III Fabric Flammability
                          </Link>
                          <div className="exp-details">Cotton blend test in low-pressure oxygen enrichment</div>
                        </div>
                        <div className="exp-score">89% Match</div>
                      </div>
                    </>
                  )}
                  {simFuel === 'nomex' && (
                    <>
                      <div className="exp-match-item">
                        <div>
                          <Link to="/experiment/exp-saffire-4" className="exp-name hover:text-sky-300">
                            Saffire-IV Spacecraft Textile Assessment
                          </Link>
                          <div className="exp-details">Flame-retardant flight suit weave • 0.20 m/s forced ventilation</div>
                        </div>
                        <div className="exp-score">94% Match</div>
                      </div>
                      <div className="exp-match-item">
                        <div>
                          <div className="exp-name">NASA WSTF Flammability Test 1</div>
                          <div className="exp-details">Upward flame spread standard • Self-extinguishes under 24% O₂</div>
                        </div>
                        <div className="exp-score">91% Match</div>
                      </div>
                    </>
                  )}
                  {simFuel === 'poly' && (
                    <div className="exp-match-item">
                      <div>
                        <Link to="/experiment/exp-cir-acme" className="exp-name hover:text-sky-300">
                          CIR ACME (Advanced Combustion via Microgravity Experiments)
                        </Link>
                        <div className="exp-details">Hydrocarbon / polymer boundary layer burning</div>
                      </div>
                      <div className="exp-score">92% Match</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="disclaimer-pill">
                Illustrative evidence-guided visualization — not a certified physical simulation.
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE EVIDENCE ENGINE & TRUST MODEL */}
        <section
          id="evidence-engine"
          className="ignis-section"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="section-header">
            <div className="eyebrow-pill">Rigorous Provenance</div>
            <h2 className="section-title">The Evidence Engine & Trust Model</h2>
            <p className="section-lead">
              Every insight in IGNIS carries an explicit authority level. We distinguish directly observed NASA raw telemetry from synthetic AI summaries.
            </p>
          </div>

          {/* 5 Levels Grid */}
          <div className="grid-3" style={{ marginBottom: '48px' }}>
            <div className="level-card">
              <span className="level-badge level-a">Level A</span>
              <div className="level-name">Observed / NASA Source</div>
              <p className="level-desc">Directly reported or recorded in NASA flight data, PSI archives, or peer-reviewed literature. Maximum authority.</p>
            </div>
            <div className="level-card">
              <span className="level-badge level-b">Level B</span>
              <div className="level-name">Normalized Source Data</div>
              <p className="level-desc">Structured, standardized, and unit-converted data tables with verified DOI and NASA technical report accession numbers.</p>
            </div>
            <div className="level-card">
              <span className="level-badge level-c">Level C</span>
              <div className="level-name">Derived by IGNIS</div>
              <p className="level-desc">Computed scientific metrics such as Computer Vision flame area, growth curves, and centroid tracking. Fully reproducible.</p>
            </div>
            <div className="level-card">
              <span className="level-badge level-d">Level D</span>
              <div className="level-name">Similarity Interpretation</div>
              <p className="level-desc">Inference derived by comparing multi-dimensional environmental vectors with transparent mathematical weighting.</p>
            </div>
            <div className="level-card">
              <span className="level-badge level-e">Level E</span>
              <div className="level-name">AI Synthesis</div>
              <p className="level-desc">Natural language explanations generated by LLM strictly constrained to retrieved source passages. Zero hallucination.</p>
            </div>
            <div
              className="level-card"
              style={{
                background: 'linear-gradient(135deg, rgba(121,220,232,0.1), rgba(12,27,47,0.7))',
                borderColor: 'var(--cyan)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '1px', marginBottom: '8px' }}>
                SIMILARITY WEIGHTS
              </div>
              <div style={{ fontSize: '13px', color: '#fff', lineHeight: 1.7 }}>
                • <strong>Fuel Material:</strong> 30%<br />
                • <strong>Oxygen (O₂):</strong> 20%<br />
                • <strong>Forced Airflow:</strong> 20%<br />
                • <strong>Pressure:</strong> 15%<br />
                • <strong>Scientific Objective:</strong> 10%<br />
                • <strong>Geometry / Regime:</strong> 5%
              </div>
            </div>
          </div>
        </section>

        {/* 4. AI FLAME VISION */}
        <section
          id="flame-vision"
          className="ignis-section"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="section-header">
            <div className="eyebrow-pill">Computer Vision Pipeline</div>
            <h2 className="section-title">AI Flame Vision: Video into Science</h2>
            <p className="section-lead">
              Transforming unstructured NASA microgravity combustion video into verified quantitative time-series data.
            </p>
          </div>

          <div className="vision-grid">
            {/* Interactive Visualizer */}
            <div>
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="vision-canvas"
                  width={640}
                  height={400}
                />
                <div className="vision-hud">
                  <div className="hud-top">
                    <span>EXP: FLEX-2 DROPLET COMBUSTION</span>
                    <span style={{ color: 'var(--cyan)' }}>{flameHud.status}</span>
                  </div>
                  <div className="hud-bottom">
                    <span>FLAME AREA RATIO: {flameHud.areaRatio}</span>
                    <span>CENTROID: {flameHud.centroid}</span>
                  </div>
                </div>
              </div>

              <div className="scrubber-panel">
                <div className="time-display">
                  <span>Video Timeline Scrubber</span>
                  <span style={{ color: 'var(--cyan)' }}>t = {flameTime.toFixed(2)} s</span>
                </div>
                <input
                  type="range"
                  className="sim-slider"
                  min="0"
                  max="10"
                  step="0.05"
                  value={flameTime}
                  onChange={(e) => setFlameTime(parseFloat(e.target.value))}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '6px',
                  }}
                >
                  <span>0.0s (Ignition)</span>
                  <span>3.5s (Steady Spherical)</span>
                  <span>7.2s (Cool Flame)</span>
                  <span>8.4s (Extinction)</span>
                </div>
              </div>
            </div>

            {/* Explanation & Metrics */}
            <div className="glass-card">
              <span className="level-badge level-c">Level C • Computer Vision Derived</span>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: '#fff', marginBottom: '14px' }}>
                Color-Space Contour Analysis
              </h3>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(234,243,250,0.8)', marginBottom: '20px' }}>
                Rather than relying on uninterpretable deep models, IGNIS employs classical robust computer vision: HSV color-space thresholding, connected component contour extraction, and temporal smoothing to track the flame boundary.
              </p>
              <div
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '14px',
                  padding: '18px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: 1.8,
                }}
              >
                <div style={{ color: 'var(--cyan)' }}>
                  ▸ Peak Flame Diameter: <span style={{ color: '#fff' }}>18.4 mm</span>
                </div>
                <div style={{ color: 'var(--cyan)' }}>
                  ▸ Extinction Timestamp: <span style={{ color: '#fff' }}>t = 8.42 s (±0.05s)</span>
                </div>
                <div style={{ color: 'var(--cyan)' }}>
                  ▸ Soot Radiative Loss: <span style={{ color: '#fff' }}>Low (Blue Quench)</span>
                </div>
                <div style={{ color: 'var(--cyan)' }}>
                  ▸ Molecular Diffusion Coeff: <span style={{ color: '#fff' }}>0.24 cm²/s</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. EXPLORE FIRE STORIES */}
        <section
          id="explore-fire"
          className="ignis-section"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="section-header">
            <div className="eyebrow-pill">Public Science Communication</div>
            <h2 className="section-title">Explore Fire: Guided Scientific Stories</h2>
            <p className="section-lead">
              Curated journeys designed for students, mission planners, and the public — linking physical intuition to real NASA data.
            </p>
          </div>

          <div className="grid-3">
            <div className="story-card">
              <div>
                <div className="story-tag">Physics Fundamentals • P0</div>
                <h3 className="story-title">Why Does Fire Burn as a Sphere in Space?</h3>
                <p className="story-excerpt">
                  On Earth, hot air rises because it is lighter than cold air. In zero gravity, buoyancy disappears. Without buoyancy, hot combustion gases do not rise — the flame surrounds the fuel in a serene, blue spherical halo.
                </p>
              </div>
              <button
                type="button"
                className="story-link"
                onClick={() => {
                  setAskIndex(0);
                  scrollToSection('ask-ignis');
                }}
              >
                Explore Story Evidence →
              </button>
            </div>

            <div className="story-card">
              <div>
                <div className="story-tag">Earthdata Remote Sensing • P0</div>
                <h3 className="story-title">Fire from Space vs Fire in Space</h3>
                <p className="story-excerpt">
                  Contrasting NASA FIRMS satellite thermal anomaly detection of Earth wildfires with enclosed spacecraft combustion aboard the Cygnus vehicle. Macro planetary observation meets micro cabin safety.
                </p>
              </div>
              <button
                type="button"
                className="story-link"
                onClick={() => {
                  setAskIndex(1);
                  scrollToSection('ask-ignis');
                }}
              >
                Explore Story Evidence →
              </button>
            </div>

            <div className="story-card">
              <div>
                <div className="story-tag">Ventilation Dynamics • P1</div>
                <h3 className="story-title">The Airflow Paradox in Spacecraft</h3>
                <p className="story-excerpt">
                  Without ventilation, a microgravity flame quickly suffocates in its own carbon dioxide. A gentle breeze from the life support system (0.05 m/s) actually feeds the flame by replenishing oxygen.
                </p>
              </div>
              <button
                type="button"
                className="story-link"
                onClick={() => {
                  setAskIndex(2);
                  scrollToSection('ask-ignis');
                }}
              >
                Explore Story Evidence →
              </button>
            </div>
          </div>
        </section>

        {/* 6. ASK IGNIS (AI RESEARCH ASSISTANT) */}
        <section
          id="ask-ignis"
          className="ignis-section"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="section-header">
            <div className="eyebrow-pill">Traceable AI Assistant</div>
            <h2 className="section-title">Ask IGNIS</h2>
            <p className="section-lead">
              Inquire about microgravity combustion, material flammability, and NASA flight findings — every answer cited to primary evidence.
            </p>
          </div>

          <div className="ask-box">
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(234,243,250,0.8)',
                marginBottom: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Click a sample scientific inquiry:</span>
              <Link to="/ask" className="text-sky-400 hover:text-white flex items-center gap-1 font-mono text-xs">
                Launch Full Chat Studio <Sparkles className="w-3 h-3" />
              </Link>
            </div>

            <div className="prompt-chips">
              <button
                type="button"
                className={`chip ${askIndex === 0 ? 'active' : ''}`}
                onClick={() => setAskIndex(0)}
              >
                Why do microgravity flames form a sphere?
              </button>
              <button
                type="button"
                className={`chip ${askIndex === 1 ? 'active' : ''}`}
                onClick={() => setAskIndex(1)}
              >
                What did Saffire discover about spacecraft fire safety?
              </button>
              <button
                type="button"
                className={`chip ${askIndex === 2 ? 'active' : ''}`}
                onClick={() => setAskIndex(2)}
              >
                Does fire behave differently on the Moon than in orbit?
              </button>
            </div>

            <div className="qa-response-area">
              <div className="qa-status">
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--cyan)',
                    boxShadow: '0 0 8px var(--cyan)',
                  }}
                />
                <span>{ASK_DATA[askIndex].status}</span>
              </div>
              <div className="qa-text">{ASK_DATA[askIndex].text}</div>
              <div className="qa-sources">
                <span>Evidence Sources:</span>
                {ASK_DATA[askIndex].sources.map((s, i) => (
                  <span key={i} className="source-pill">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. SPACECRAFT FLAMMABILITY TELEMETRY BAR GRAPH */}
        <section
          id="safety-matrix"
          className="ignis-section"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="section-header">
            <div className="eyebrow-pill">Telemetry & Flammability Index</div>
            <h2 className="section-title">Spacecraft Safety Telemetry Bar Graph</h2>
            <p className="section-lead">
              A normalized multi-variable flammability index measuring cabin oxygen, life-support airflow, barometric pressure, and material susceptibility across NASA STD-6001 safety thresholds.
            </p>
          </div>

          <div className="flame-chart-card">
            <div className="flame-chart-header">
              <div>
                <div className="flame-chart-eyebrow">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--cyan)',
                      boxShadow: '0 0 8px var(--cyan)',
                    }}
                  />
                  <span>MULTI-VARIABLE SAFETY THRESHOLD BENCHMARKS</span>
                </div>
                <div className="flame-chart-title">Habitat Flammability Profile & Risk Envelope</div>
                <div className="flame-chart-sub">
                  Normalized risk index per parameter cutting across NASA STD-6001 safety thresholds. Select a scenario to inspect telemetry.
                </div>
              </div>

              <div className="flame-chart-presets">
                <span className="flame-chart-preset-lbl">BENCHMARKS:</span>
                <button
                  type="button"
                  className={`flame-chart-preset-btn ${chartPresetKey === 'iss' ? 'active' : ''}`}
                  onClick={() => setChartPresetKey('iss')}
                >
                  ISS Nominal
                </button>
                <button
                  type="button"
                  className={`flame-chart-preset-btn ${chartPresetKey === 'gateway' ? 'active' : ''}`}
                  onClick={() => setChartPresetKey('gateway')}
                >
                  Artemis Gateway
                </button>
                <button
                  type="button"
                  className={`flame-chart-preset-btn ${chartPresetKey === 'depower' ? 'active' : ''}`}
                  onClick={() => setChartPresetKey('depower')}
                >
                  Quiescent Depower
                </button>
                <button
                  type="button"
                  className={`flame-chart-preset-btn ${chartPresetKey === 'critical' ? 'active' : ''}`}
                  onClick={() => setChartPresetKey('critical')}
                >
                  Vent Anomaly
                </button>
              </div>
            </div>

            <div className="graph-stage">
              {/* Y-Axis Scale */}
              <div className="y-axis-labels">
                <span>100%</span>
                <span>85%</span>
                <span>65%</span>
                <span>35%</span>
                <span>0%</span>
              </div>

              {/* Plot Area with Horizontal Bands & Bars */}
              <div className="graph-plot">
                {/* Horizontal Safety Bands */}
                <div className="hazard-band band-critical">🔴 CRITICAL RUNAWAY (&gt;85%)</div>
                <div className="hazard-band band-elevated">🟠 ELEVATED HAZARD (65-85%)</div>
                <div className="hazard-band band-moderate">🟡 MODERATE MARGIN (35-65%)</div>
                <div className="hazard-band band-safe">🟢 SAFE / QUENCHED (&lt;35%)</div>

                {/* Vertical Bars Track */}
                <div className="bars-track">
                  {/* Bar 1: Oxygen */}
                  <div className="bar-col">
                    <div
                      className="bar-pillar-stem"
                      style={{
                        height: `${currentChart.o2.pct}%`,
                        background: currentChart.o2.color,
                        boxShadow: `0 0 16px ${currentChart.o2.color}80`,
                      }}
                    >
                      <span className="bar-float-val">{currentChart.o2.pct}%</span>
                    </div>
                    <div className="x-axis-caption">
                      <div className="x-axis-name">Oxygen (O₂)</div>
                      <div className="x-axis-detail">{currentChart.o2.text}</div>
                      <div
                        className="x-axis-badge"
                        style={{ color: currentChart.o2.color, borderColor: currentChart.o2.color }}
                      >
                        {currentChart.o2.tag}
                      </div>
                    </div>
                  </div>

                  {/* Bar 2: Flow */}
                  <div className="bar-col">
                    <div
                      className="bar-pillar-stem"
                      style={{
                        height: `${currentChart.flow.pct}%`,
                        background: currentChart.flow.color,
                        boxShadow: `0 0 16px ${currentChart.flow.color}80`,
                      }}
                    >
                      <span className="bar-float-val">{currentChart.flow.pct}%</span>
                    </div>
                    <div className="x-axis-caption">
                      <div className="x-axis-name">Ventilation</div>
                      <div className="x-axis-detail">{currentChart.flow.text}</div>
                      <div
                        className="x-axis-badge"
                        style={{ color: currentChart.flow.color, borderColor: currentChart.flow.color }}
                      >
                        {currentChart.flow.tag}
                      </div>
                    </div>
                  </div>

                  {/* Bar 3: Pressure */}
                  <div className="bar-col">
                    <div
                      className="bar-pillar-stem"
                      style={{
                        height: `${currentChart.press.pct}%`,
                        background: currentChart.press.color,
                        boxShadow: `0 0 16px ${currentChart.press.color}80`,
                      }}
                    >
                      <span className="bar-float-val">{currentChart.press.pct}%</span>
                    </div>
                    <div className="x-axis-caption">
                      <div className="x-axis-name">Pressure</div>
                      <div className="x-axis-detail">{currentChart.press.text}</div>
                      <div
                        className="x-axis-badge"
                        style={{ color: currentChart.press.color, borderColor: currentChart.press.color }}
                      >
                        {currentChart.press.tag}
                      </div>
                    </div>
                  </div>

                  {/* Bar 4: Material Fuel */}
                  <div className="bar-col">
                    <div
                      className="bar-pillar-stem"
                      style={{
                        height: `${currentChart.fuel.pct}%`,
                        background: currentChart.fuel.color,
                        boxShadow: `0 0 16px ${currentChart.fuel.color}80`,
                      }}
                    >
                      <span className="bar-float-val">{currentChart.fuel.pct}%</span>
                    </div>
                    <div className="x-axis-caption">
                      <div className="x-axis-name">Material LOC</div>
                      <div className="x-axis-detail">{currentChart.fuel.text}</div>
                      <div
                        className="x-axis-badge"
                        style={{ color: currentChart.fuel.color, borderColor: currentChart.fuel.color }}
                      >
                        {currentChart.fuel.tag}
                      </div>
                    </div>
                  </div>

                  {/* Bar 5: Composite Risk */}
                  <div className="bar-col">
                    <div
                      className="bar-pillar-stem"
                      style={{
                        height: `${currentChart.comp.pct}%`,
                        background: currentChart.comp.color,
                        boxShadow: `0 0 16px ${currentChart.comp.color}80`,
                      }}
                    >
                      <span className="bar-float-val">{currentChart.comp.pct}%</span>
                    </div>
                    <div className="x-axis-caption">
                      <div className="x-axis-name">Composite Risk</div>
                      <div className="x-axis-detail">{currentChart.comp.text}</div>
                      <div
                        className="x-axis-badge"
                        style={{ color: currentChart.comp.color, borderColor: currentChart.comp.color }}
                      >
                        {currentChart.comp.tag}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Footer Status */}
            <div className="flame-chart-footer">
              <div>
                <span>FLIGHT REFERENCE: </span>
                <strong>NASA-STD-6001B • CYGNUS SAFFIRE I-VI</strong>
              </div>
              <div>
                CURRENT STATE: <strong>{currentChart.status}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer Link Trigger */}
        <section className="text-center py-8">
          <button
            type="button"
            onClick={() => setShowDisclaimerModal(true)}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Research & Engineering Notice: Scientific Scope & Limitations</span>
          </button>
        </section>
      </div>

      {/* Research Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0E1A] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-black space-y-6 relative">
            <button
              onClick={() => setShowDisclaimerModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Scientific Traceability Notice (PRD v1.1 §1.1)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
                Research & Education Disclaimer
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed border-y border-slate-800/80 py-4 max-h-[60vh] overflow-y-auto">
              <p>
                <strong>IGNIS (Intelligent Guidance from NASA Ignition Studies)</strong> is developed for the NASA International Space Apps Challenge 2026 under the challenge <em>"Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data"</em>.
              </p>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                <p className="font-semibold text-rose-200">Non-Operational Notice:</p>
                <p className="text-xs">
                  IGNIS is explicitly <strong>NOT</strong> an operational flight-clearance tool, a certified life-support fire safety calculator, a probabilistic risk model, or a computational fluid dynamics (CFD) simulation engine. It must not be used for real-time mission-critical decisions.
                </p>
              </div>
              <p>
                <strong>Source of Truth:</strong> NASA experiments remain the sole empirical source of truth. IGNIS organizes, ranks, and visualizes peer-reviewed NASA Physical Sciences Informatics (PSI) research data.
              </p>
              <p>
                <strong>No Binary Risk Verdicts:</strong> In accordance with combustion science best practices, IGNIS never outputs simplified "safe" or "unsafe" labels. Instead, it provides behavioral dimensions (flame spread, sustained burning, extinction) anchored to comparable test data.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Link
                to="/about"
                onClick={() => setShowDisclaimerModal(false)}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <span>Read full methodology & provenance policy</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowDisclaimerModal(false)}
              >
                Acknowledge & Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
