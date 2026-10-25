import React, { useEffect, useRef } from 'react';
import { X, Settings, Sparkles, Eye, Type, HelpCircle, Keyboard } from 'lucide-react';
import type { StorySettings, TextSizeSetting } from '../types';

export interface StorySettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StorySettings;
  onUpdateSettings: (newSettings: Partial<StorySettings>) => void;
  onReplayOnboarding: () => void;
}

export const StorySettingsPanel: React.FC<StorySettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReplayOnboarding,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc and focus trap
  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-[#081225] border border-cyan-500/30 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#060e1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-white">
                Story Experience Settings
              </h2>
              <p className="text-xs text-slate-400">
                Personalize animation, companion, and reading comfort
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Motion Override Setting */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motion & Animation</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'system' as const, label: 'System (Auto)' },
                { val: 'true' as const, label: 'Reduced' },
                { val: 'false' as const, label: 'Full Motion' },
              ].map((opt) => {
                const isSelected = settings.reduceMotionOverride === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => onUpdateSettings({ reduceMotionOverride: opt.val })}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              {settings.reduceMotionOverride === 'true'
                ? 'Animations, parallax, typewriter effects, and avatar floating are paused.'
                : settings.reduceMotionOverride === 'false'
                ? 'Full interactive animations and spring physics enabled.'
                : 'Follows your operating system prefers-reduced-motion setting.'}
            </p>
          </div>

          {/* Ember Companion On / Off */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ember Avatar Companion</span>
                </div>
                <p className="text-xs text-slate-300">
                  Show animated guide orb alongside dialogue bubbles
                </p>
              </div>

              <button
                type="button"
                onClick={() => onUpdateSettings({ emberEnabled: !settings.emberEnabled })}
                className={`min-w-[48px] h-7 rounded-full p-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  settings.emberEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.emberEnabled}
                aria-label="Toggle Ember avatar companion"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.emberEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {!settings.emberEnabled && (
              <p className="text-[11px] text-amber-300/80 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                Ember is hidden. Dialogue and hints are shown as comfortable in-flow reading captions.
              </p>
            )}
          </div>

          {/* Text Size (3 steps) */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400">
              <Type className="w-3.5 h-3.5" />
              <span>Reading Text Size</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'normal' as TextSizeSetting, label: 'Normal (100%)' },
                { val: 'large' as TextSizeSetting, label: 'Large (115%)' },
                { val: 'xlarge' as TextSizeSetting, label: 'X-Large (130%)' },
              ].map((opt) => {
                const isSelected = settings.textSize === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => onUpdateSettings({ textSize: opt.val })}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts Overview */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Navigation Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/30 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Next beat:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Right</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">j</kbd>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Previous beat:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Left</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">k</kbd>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Open glossary:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">g</kbd>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Close modal:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Replay Onboarding Intro */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200">First-Time Guided Tour</div>
              <div className="text-[11px] text-slate-400">Review navigation, evidence badges, and deep layers</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onReplayOnboarding();
              }}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Replay Tour</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#060e1d] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Settings persist automatically</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
