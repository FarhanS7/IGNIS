import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Compass,
  ArrowRight,
  ShieldCheck,
  Database,
  Layers,
  Sparkles,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EvidenceBadge } from '../components/common/EvidenceBadge';

export const LandingPage: React.FC = () => {
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  return (
    <div className="relative space-y-20 py-4 sm:py-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-500/10 via-sky-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-2 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-medium tracking-wide shadow-inner shadow-orange-500/10"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="font-semibold text-orange-400">NASA Space Apps Challenge 2026</span>
          <span className="text-slate-500 font-mono">/</span>
          <span className="text-slate-300">Flame in Freefall</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-['Space_Grotesk',sans-serif]">
            Build a habitat. <br className="hidden sm:inline" />
            Start a fire. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
              Discover the science.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal pt-2">
            In microgravity, flames don't rise—they form silent, glowing spheres.
            IGNIS connects deep-space habitat designs with verified NASA combustion experiments to evaluate real fire behavior.
          </p>
        </motion.div>

        {/* Live Platform Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="font-mono text-white font-semibold">9</span> NASA Flight Campaigns
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-white font-semibold">25+</span> Verified Test Runs
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-white font-semibold">5-Tier</span> Evidence Hierarchy
          </div>
        </motion.div>
      </section>

      {/* Two-Mode Gateway Cards (FR-LND-001 & FR-LND-002) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Mode 1: Build a Habitat */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card
            variant="interactive"
            padding="lg"
            className="group h-full flex flex-col justify-between border-slate-800/90 hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-105 group-hover:border-orange-500/50 transition-all shadow-inner">
                  <Flame className="w-7 h-7 text-orange-400 group-hover:text-orange-300" />
                </div>
                <Badge variant="flame" size="xs">
                  MODE 01 · ENGINEERING
                </Badge>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                  Build a Habitat
                </h2>
                <p className="text-orange-400/90 font-medium text-xs mt-1">
                  Design a habitat atmosphere and test real flammability behavior.
                </p>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Configure destination gravity (Orbital ISS, Moon, Mars), cabin oxygen concentration, pressure, and materials.
                IGNIS evaluates your scenario against eligible NASA flight experiments using strict physical comparability filtering.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-slate-300">
                  Microgravity (0g) / Lunar (0.16g) / Mars (0.38g)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-slate-300">
                  PMMA / Cotton / Polymers
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-slate-300">
                  Fire Behavior Profile
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/build" className="w-full block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-between group-hover:shadow-orange-500/30"
                >
                  <span className="font-semibold">Launch Habitat Builder</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Mode 2: Explore Fire */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card
            variant="interactive"
            padding="lg"
            className="group h-full flex flex-col justify-between border-slate-800/90 hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all duration-300"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 group-hover:border-sky-500/50 transition-all shadow-inner">
                  <Compass className="w-7 h-7 text-sky-400 group-hover:text-sky-300" />
                </div>
                <Badge variant="plasma" size="xs">
                  MODE 02 · DISCOVERY
                </Badge>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                  Explore Fire Stories
                </h2>
                <p className="text-sky-400/90 font-medium text-xs mt-1">
                  Discover how flames behave when gravity vanishes.
                </p>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Step through guided visual narratives breaking down spherical cold flames, Cygnus cargo spacecraft fire tests (Saffire),
                and why traditional terrestrial fire extinguishers can fail in microgravity.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-slate-300">
                  Saffire Spacecraft Burns
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-slate-300">
                  Cold Flame Chemistry
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-slate-300">
                  Earth vs Space Comparisons
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/explore" className="w-full block">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-between border-sky-500/30 text-sky-200 hover:border-sky-500/60 hover:text-white group-hover:shadow-sky-500/20"
                >
                  <span className="font-semibold">Explore Fire Narratives</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Trust & Scientific Guarantees Section */}
      <section className="max-w-5xl mx-auto space-y-6 pt-6 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
              Scientific Precision & Authority Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Every insight on IGNIS is grounded in published NASA Physical Sciences Informatics telemetry.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <EvidenceBadge level="A" size="xs" />
            <EvidenceBadge level="B" size="xs" />
            <EvidenceBadge level="C" size="xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card variant="glass" padding="sm" className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Comparable-Evidence Gate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Incompatible fuels (e.g. comparing PMMA solids to gas flames) and ungrounded gravity transfers are rigorously excluded before similarity scoring.
            </p>
          </Card>

          <Card variant="glass" padding="sm" className="space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Database className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Verified NASA PSI Records</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesized directly from Saffire I-VI, BASS, FLEX, and SOFIE microgravity flight and drop-tower combustion campaigns with DOI tracking.
            </p>
          </Card>

          <Card variant="glass" padding="sm" className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Evidence Dimensions</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Replaces unscientific "safe/unsafe" risk scores with transparent evidence dimensions: flame spread, sustained burning, and extinction limits.
            </p>
          </Card>
        </div>
      </section>

      {/* Mission Quick-Jump & Explore Teasers */}
      <section className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[#0F1626]/80 via-[#162035]/60 to-[#0F1626]/80 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Spaceflight Research</span>
          </div>
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Have a specific microgravity fire question?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Ask IGNIS uses retrieval-augmented AI to cite exact NASA flight tests, atmospheric conditions, and observed combustion metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/ask">
            <Button variant="outline" size="md" icon={<Sparkles className="w-4 h-4 text-amber-400" />}>
              Ask IGNIS
            </Button>
          </Link>
          <Link to="/experiment/exp-saffire-1">
            <Button variant="ghost" size="md" icon={<ChevronRight className="w-4 h-4" />}>
              View Saffire Mission
            </Button>
          </Link>
        </div>
      </section>

      {/* FR-LND-003: Visible Research Disclaimer Link */}
      <section className="text-center pt-4">
        <button
          onClick={() => setShowDisclaimerModal(true)}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Research & Engineering Notice: Scientific Scope & Limitations</span>
        </button>
      </section>

      {/* Research Disclaimer Modal (FR-LND-003) */}
      <AnimatePresence>
        {showDisclaimerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0A0E1A] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-black space-y-6 relative"
            >
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
