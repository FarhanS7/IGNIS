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
    description: 'Watch the physical flame geometry, reaction dome, and ignition stability adapt in real time.',
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
    <section id="how-it-works" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider uppercase">
          Three Simple Steps
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
          How IGNIS Works
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
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
                className={`h-full relative overflow-hidden transition-all duration-300 hover:border-slate-600 ${step.borderColor}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step.glowColor} flex items-center justify-center ${step.accentColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-700 select-none">
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
    </section>
  );
};

export default HowItWorksSection;
