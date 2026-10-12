import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Database, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '../common/Card';

const EXPLORE_ITEMS = [
  {
    title: 'Flight Data',
    route: '/experiments',
    description: 'Inspect peer-reviewed NASA microgravity flight campaigns, sensor time-series, and optical video telemetry.',
    icon: Database,
    accent: 'text-cyan-400',
    tag: 'NASA PSI Archive',
  },
  {
    title: 'Stories',
    route: '/explore',
    description: 'Follow guided narrative journeys explaining physical combustion intuition with real spacecraft test data.',
    icon: BookOpen,
    accent: 'text-amber-400',
    tag: 'Guided Science',
  },
  {
    title: 'Ask IGNIS',
    route: '/ask',
    description: 'Query an evidence-grounded research assistant citing published NASA papers and flight findings.',
    icon: Sparkles,
    accent: 'text-sky-300',
    tag: 'Traceable Assistant',
  },
];

export const ExploreMoreRow: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider uppercase mb-2">
            Beyond the Simulator
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
            Explore More NASA Fire Science
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {EXPLORE_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : idx * 0.1 }}
            >
              <Link to={item.route} className="block h-full group">
                <Card
                  variant="interactive"
                  padding="lg"
                  className="h-full flex flex-col justify-between space-y-4 border-slate-800 hover:border-slate-700 bg-slate-900/60"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className={`w-5 h-5 ${item.accent}`} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-slate-800">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-['Space_Grotesk',sans-serif]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-mono font-medium text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore {item.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ExploreMoreRow;
