import React from 'react';
import { AlertOctagon, CheckCircle2, ChevronRight, Flame, ShieldAlert, Wind } from 'lucide-react';

export interface GuidedProgressSequenceProps {
  t: number;
  duration_s: number;
  onSeek: (time_s: number) => void;
  className?: string;
}

interface StepDef {
  number: number;
  id: string;
  label: string;
  time_s: number;
  endTime_s: number;
  icon: React.ReactNode;
}

export const GuidedProgressSequence: React.FC<GuidedProgressSequenceProps> = ({
  t,
  onSeek,
  className = '',
}) => {
  const steps: StepDef[] = [
    {
      number: 1,
      id: 'INCIDENT',
      label: 'Incident',
      time_s: 0.0,
      endTime_s: 5.0,
      icon: <Flame className="h-3.5 w-3.5" />,
    },
    {
      number: 2,
      id: 'DETECTION',
      label: 'Detection',
      time_s: 5.0,
      endTime_s: 11.0,
      icon: <Wind className="h-3.5 w-3.5" />,
    },
    {
      number: 3,
      id: 'ALARM',
      label: 'Alarm',
      time_s: 11.0,
      endTime_s: 16.0,
      icon: <AlertOctagon className="h-3.5 w-3.5" />,
    },
    {
      number: 4,
      id: 'RESPONSE',
      label: 'Response',
      time_s: 16.0,
      endTime_s: 27.0,
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
    {
      number: 5,
      id: 'OUTCOME',
      label: 'Outcome',
      time_s: 27.0,
      endTime_s: 36.0,
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <nav
      aria-label="Incident Progression"
      className={`flex items-center justify-center gap-1 sm:gap-2 flex-wrap ${className}`}
    >
      {steps.map((step, idx) => {
        const isActive = t >= step.time_s && (idx === steps.length - 1 ? t <= step.endTime_s : t < step.endTime_s);
        const isPast = t >= step.endTime_s;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onSeek(step.time_s)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-600/30 border border-cyan-400 text-white shadow-[0_0_15px_rgba(58,215,255,0.35)] ring-1 ring-cyan-400/50'
                  : isPast
                  ? 'bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/40'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
              title={`Jump to ${step.label} (${step.time_s.toFixed(0)}s)`}
            >
              <span
                className={
                  isActive
                    ? 'text-cyan-300'
                    : isPast
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }
              >
                {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.icon}
              </span>
              <span className="font-semibold">{step.label}</span>
              <span className="text-[10px] opacity-70 ml-0.5">{step.time_s.toFixed(0)}s</span>
            </button>

            {idx < steps.length - 1 && (
              <ChevronRight
                className={`h-3 w-3 shrink-0 ${
                  isPast ? 'text-cyan-500/60' : 'text-slate-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

