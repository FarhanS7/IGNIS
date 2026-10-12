import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sliders, Database, ArrowRight, ShieldAlert } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card
        variant="glass"
        padding="lg"
        className="max-w-xl w-full text-center space-y-6 border-white/15 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-center">
          <Badge variant="moderate" size="sm" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
            HTTP 404 · Navigation Anomaly
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk',sans-serif] tracking-tight">
            Trajectory Lost in Deep Space
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
            The requested coordinates do not correspond to any active mission module or flight record in the IGNIS telemetry archive.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <Link to="/simulator" className="group">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-1.5 h-full">
              <div className="flex items-center justify-between text-cyan-300">
                <Sliders className="w-4 h-4" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-sm font-bold text-white">Habitat Simulator</h3>
              <p className="text-xs text-slate-400">Model spacecraft atmosphere, ventilation, and fire spread.</p>
            </div>
          </Link>

          <Link to="/experiments" className="group">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 transition-all space-y-1.5 h-full">
              <div className="flex items-center justify-between text-orange-400">
                <Database className="w-4 h-4" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-sm font-bold text-white">Flight Data Archive</h3>
              <p className="text-xs text-slate-400">Explore Saffire, FLEX-2, and CIR drop-tower telemetry.</p>
            </div>
          </Link>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="ghost" size="sm" icon={<Compass className="w-4 h-4" />}>
              Return to Mission Overview
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
