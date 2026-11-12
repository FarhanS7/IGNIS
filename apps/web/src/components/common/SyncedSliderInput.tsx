import React, { useState } from 'react';
import { Info } from 'lucide-react';

export interface SyncedInputProps {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  hint: string;
  statusText?: string;
  statusType?: 'cyan' | 'amber' | 'slate';
  tooltip?: string;
  onChange: (val: number) => void;
}

export const SyncedSliderInput: React.FC<SyncedInputProps> = ({
  id,
  label,
  unit,
  min,
  max,
  step,
  value,
  hint,
  statusText,
  statusType = 'slate',
  tooltip,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [typedValue, setTypedValue] = useState<string>('');
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const displayValue = isFocused ? typedValue : String(value);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    setTypedValue(String(num));
    setErrorHint(null);
    onChange(num);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setTypedValue(String(value));
    setErrorHint(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedValue(raw);

    const num = parseFloat(raw);
    if (isNaN(num)) {
      setErrorHint(hint);
      return;
    }

    if (num < min || num > max) {
      setErrorHint(hint);
    } else {
      setErrorHint(null);
      onChange(num);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(typedValue);
    if (isNaN(num)) {
      setErrorHint(null);
      return;
    }

    const clamped = Math.min(max, Math.max(min, num));
    setErrorHint(null);
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor={id} className="text-sm font-medium text-white">
            {label}
          </label>
          {tooltip && (
            <span className="group relative inline-flex items-center cursor-help" tabIndex={0} aria-label={tooltip}>
              <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              <span className="pointer-events-none absolute left-0 bottom-full mb-1.5 hidden w-max max-w-xs rounded-md bg-slate-950 px-2 py-1 text-xs text-slate-300 shadow-md border border-slate-800 group-hover:block group-focus:block z-30 font-sans">
                {tooltip}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onFocus={handleFocus}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-20 px-2 py-0.5 text-right font-mono text-xs rounded bg-black/60 border ${
              errorHint ? 'border-amber-400 text-amber-300' : 'border-slate-700 text-white'
            } focus:outline-none focus:border-cyan-400`}
          />
          <span className="text-xs font-mono text-slate-400 min-w-[2.2rem]">{unit}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        aria-label={`${label} slider`}
      />

      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span>{min} {unit}</span>
        {errorHint && <span className="text-amber-400 font-sans text-xs">{errorHint}</span>}
        <span>{max} {unit}</span>
      </div>

      {statusText && (
        <div
          className={`text-xs font-sans ${
            statusType === 'cyan'
              ? 'text-cyan-400 font-medium'
              : statusType === 'amber'
              ? 'text-amber-400 font-medium'
              : 'text-slate-400'
          }`}
        >
          {statusText}
        </div>
      )}
    </div>
  );
};
