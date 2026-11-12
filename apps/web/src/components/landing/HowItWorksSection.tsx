import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sliders, Flame, Layers } from 'lucide-react';
import { Card } from '../common/Card';

const STEPS = [
  {
    num: '01',
    title: 'Set cabin conditions',
    description: 'Configure gravity, oxygen concentration, cabin pressure, and life-support airflow.',
    icon: Sliders,
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    glowColor: 'bg-cyan-500/10',
  },
  {
    num: '02',
    title: 'See how fire behaves',
    description: 'Watch the illustrative 3D flame geometry, reaction dome, and ignition stability adapt in real time.',
    icon: Flame,
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    glowColor: 'bg-orange-500/10',
  },
  {
    num: '03',
    title: 'Query NASA flight evidence',
    description: 'Evaluate your habitat scenario against 132 usable solid flight runs and 14 PSI flight investigations with full DOI provenance.',
    icon: Layers,
    accentColor: 'text-amber-300',
    borderColor: 'border-amber-500/30',
    glowColor: 'bg-amber-500/10',
  },
];

export const HowItWorksSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 relative">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="cinema-eyebrow">
          <span className="cinema-hairline" />
          <span>01 / THREE-STAGE DISCOVERY</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif] leading-tight">
          <span>HOW IGNIS </span>
          <span className="cinema-line-outline">DECODES </span>
          <span className="cinema-line-warm">FREEFALL</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
          From environmental atmosphere parameters to peer-reviewed NASA flight matches in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : idx * 0.12 }}
            >
              <Card
                variant="glass"
                padding="lg"
                className={`h-full relative overflow-hidden transition-all duration-300 cinema-card hover:border-slate-500 ${step.borderColor}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step.glowColor} flex items-center justify-center ${step.accentColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold font-mono text-cyan-400/60 select-none tracking-widest">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk',sans-serif]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Real NASA Telemetry Signal Observation Card (Inspired by ECLIPSE) */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.2 }}
        className="mt-12 max-w-2xl mx-auto"
      >
        <div className="signal-observation">
          <div className="flex items-center justify-between mb-2">
            <span className="signal-kicker">
              <i /> NASA PSI FLIGHT TELEMETRY / MICROGRAVITY
            </span>
            <span className="text-[9px] font-mono text-cyan-400/90 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              ORBITAL (0g)
            </span>
          </div>

          <div className="signal-reading">
            <strong>0.0001</strong>
            <span>g<br />RESIDUAL ACCEL</span>
          </div>

          <svg className="signal-wave" viewBox="0 0 300 44" aria-hidden="true">
            <path className="wave-base" d="M0 22H300" />
            <path
              className="wave-live"
              d="M0 22H38l6-4 5 8 6-17 6 31 6-24 6 12 7-6h28l7-11 6 23 7-32 7 40 7-29 7 15 7-6h28l7-7 7 18 7-29 7 31 7-17 7 6 7-2h45"
            />
          </svg>

          <p className="text-xs text-slate-300 font-mono leading-relaxed mb-3">
            Saffire &amp; BASS-II chamber instrumentation: Quiescent spherical diffusion zone. Absence of buoyancy suppresses natural convective draft.
          </p>

          <div className="signal-status">
            <span>PRESSURE: <b>101.3 kPa</b></span>
            <span>OXYGEN: <b>21.0%</b></span>
            <span>RECORDS: <b>1,401 FLIGHT RUNS</b></span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HowItWorksSection;
