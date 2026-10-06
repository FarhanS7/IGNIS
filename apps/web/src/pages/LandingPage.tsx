import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Compass, ArrowRight, ShieldCheck, Database, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wide"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>Scientific Microgravity Combustion Intelligence Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
        >
          Understand Fire Beyond Earth. <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
            Grounded in Real NASA Flight Data.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Flames in zero gravity form silent, spherical domes without buoyant draft.
          Cross-reference spacecraft habitats and lunar bases against verified NASA PSI missions.
        </motion.p>
      </section>

      {/* Two-Mode Gateway Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Mode 1: Build a Habitat */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative group rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 p-8 shadow-xl hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">Mode 01 · Engineering</span>
              <h2 className="text-2xl font-bold text-white mt-1">Build a Habitat</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Configure destination environments (Orbital ISS, Lunar Surface, Mars Base) and evaluate fire behavior profiles against eligible flight tests using strict scientific comparability filtering.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono">0g / 0.16g / 0.38g</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono">O₂ / Pressure / Airflow</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono">Materials Catalog</span>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to="/build"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all group-hover:gap-3"
            >
              <span>Launch Habitat Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Mode 2: Explore Fire Stories */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative group rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 p-8 shadow-xl hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">Mode 02 · Discovery</span>
              <h2 className="text-2xl font-bold text-white mt-1">Explore Fire Stories</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Step through interactive scientific narratives explaining the physics of microgravity combustion, real Cygnus spacecraft fires (Saffire), and Earth-space flammability contrasts.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono">Saffire Spacecraft Burns</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono">Cold Flame Chemistry</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono">FIRMS Context</span>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to="/explore"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 hover:border-sky-500/60 font-semibold text-sm transition-all group-hover:gap-3"
            >
              <span>Explore Fire Narratives</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trust & Scientific Guarantees */}
      <section className="max-w-5xl mx-auto pt-6 border-t border-slate-800/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>Comparable-Evidence Gate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Incompatible fuels and invalid gravity transfers are blocked or flagged prior to ranking.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Database className="w-4 h-4 text-sky-400" />
              <span>NASA PSI Telemetry</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anchored on primary flight data from Saffire I-VI, BASS, FLEX, and SOFIE campaigns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Evidence-Guided Viz</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clear scientific distinction between observed flight telemetry and non-simulation projections.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
