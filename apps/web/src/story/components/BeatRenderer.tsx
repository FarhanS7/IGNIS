import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';
import type { Beat, EvidenceRef, TextSizeSetting } from '../types';
import { getLayerPreferences, saveLayerPreferences } from '../storage';
import { GravityMorphCanvas } from './GravityMorphCanvas';

export interface BeatRendererProps {
  beat: Beat;
  beatIndex: number;
  totalBeats: number;
  onOpenGlossary: (term?: string) => void;
  predictedChoiceId?: string;
  onSelectPrediction?: (choiceId: string) => void;
  checkAnswerId?: string;
  onSelectCheckAnswer?: (choiceId: string) => void;
  onNextBeat?: () => void;
  scrollProgressG?: number;
  textSize?: TextSizeSetting;
  showEmberCaptionsInFlow?: boolean;
}

export const BeatRenderer: React.FC<BeatRendererProps> = ({
  beat,
  beatIndex,
  totalBeats,
  onOpenGlossary,
  predictedChoiceId,
  onSelectPrediction,
  checkAnswerId,
  onSelectCheckAnswer,
  onNextBeat,
  scrollProgressG,
  textSize = 'normal',
  showEmberCaptionsInFlow = false,
}) => {
  const initialLayerPrefs = getLayerPreferences();
  const [layer2Open, setLayer2Open] = useState<boolean>(initialLayerPrefs.layer2Open);
  const [layer3Open, setLayer3Open] = useState<boolean>(initialLayerPrefs.layer3Open);
  const [copiedTakeaway, setCopiedTakeaway] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const handleToggleLayer2 = () => {
    setLayer2Open((prev) => {
      const next = !prev;
      saveLayerPreferences({ layer2Open: next });
      return next;
    });
  };

  const handleToggleLayer3 = () => {
    setLayer3Open((prev) => {
      const next = !prev;
      saveLayerPreferences({ layer3Open: next });
      return next;
    });
  };

  const bodyTextClass =
    textSize === 'xlarge'
      ? 'text-lg sm:text-xl'
      : textSize === 'large'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const handleCopyTakeaway = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedTakeaway(true);
      setTimeout(() => setCopiedTakeaway(false), 2200);
    } catch {
      // Fallback
    }
  };

  const renderEvidenceBadge = (ref: EvidenceRef, idx: number) => {
    if (ref.type === 'measured') {
      return (
        <div
          key={idx}
          className="flex flex-col gap-1 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-[10px] uppercase tracking-wider font-mono">
              <CheckCircle2 className="w-3 h-3" />
              Measured NASA Telemetry
            </span>
            {ref.provenanceLevel && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px]">
                Tier Level {ref.provenanceLevel}
              </span>
            )}
          </div>

          {ref.citationLabel && (
            <div className="font-medium text-white text-xs mt-1">
              {ref.citationLabel}
            </div>
          )}

          {ref.telemetryNote && (
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {ref.telemetryNote}
            </p>
          )}

          {ref.experimentId && (
            <Link
              to={`/experiment/${ref.experimentId}`}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 mt-1 self-start font-mono"
            >
              <span>View in Flight Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      );
    }

    return (
      <div
        key={idx}
        className="flex flex-col gap-1 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] uppercase tracking-wider font-mono">
            <Sparkles className="w-3 h-3" />
            Educational Analogy
          </span>
        </div>
        {ref.simplificationNote && (
          <p className="text-amber-100/90 text-[11px] leading-relaxed mt-1">
            {ref.simplificationNote}
          </p>
        )}
      </div>
    );
  };

  return (
    <motion.article
      id={`beat-${beat.id}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`min-h-screen py-16 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col justify-center border-b border-white/5 last:border-b-0 pb-44 sm:pb-36 ${
        shouldReduceMotion ? '' : 'snap-start'
      }`}
      aria-label={`Beat ${beatIndex + 1}: ${beat.title}`}
    >
      {/* Beat Header Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-wider text-cyan-400">
          Beat {beatIndex + 1} of {totalBeats} • {beat.type.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={() => onOpenGlossary()}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer transition-colors"
          aria-label="Open science glossary"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Glossary</span>
        </button>
      </div>

      {/* Main Beat Title & Subtitle (Staggered entrance by ~80ms) */}
      <motion.div
        className="mb-6"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.08, ease: 'easeOut' }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-['Space_Grotesk'] text-white tracking-tight leading-tight">
          {beat.title}
        </h2>
        {beat.subtitle && (
          <p className="text-lg text-slate-300 mt-2 font-['Hanken_Grotesk']">
            {beat.subtitle}
          </p>
        )}
      </motion.div>

      {/* In-flow Ember speech caption when companion avatar is disabled (D8) */}
      {showEmberCaptionsInFlow && beat.avatar.speech && (
        <div className="mb-4 p-4 rounded-xl bg-[#071329]/90 border border-amber-500/30 flex items-start gap-3">
          <span className="text-amber-400 font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
            Ember:
          </span>
          <p className="text-slate-200 text-sm leading-relaxed italic font-sans">
            {beat.avatar.speech}
          </p>
        </div>
      )}

      {/* Layer 1: Story Content (Short, vivid, student-friendly) */}
      <div className={`p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-4 ${bodyTextClass} text-slate-200 leading-relaxed font-['Hanken_Grotesk']`}>
        <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-cyan-300">
          {beat.layer1.headline}
        </h3>
        {beat.layer1.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}

        {beat.layer1.keyFact && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 text-sm">
            <Info className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
            <div>
              <strong className="text-white">Remember this: </strong>
              {beat.layer1.keyFact}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Section for Predict Beat */}
      {beat.type === 'predict' && beat.predictInteraction && (
        <div className="my-8 p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Prediction</span>
          </div>
          <h4 className="text-xl font-bold font-['Space_Grotesk'] text-white">
            {beat.predictInteraction.question}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {beat.predictInteraction.choices.map((choice) => {
              const isSelected = predictedChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => onSelectPrediction && onSelectPrediction(choice.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="font-semibold text-sm sm:text-base font-['Space_Grotesk'] mb-1">
                    {choice.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    Click to lock in this hypothesis
                  </div>
                </button>
              );
            })}
          </div>

          {/* D3: "Not sure, show me" option */}
          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => onSelectPrediction && onSelectPrediction('unsure')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-mono flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Not sure? Reveal hypothesis directly"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Not sure, show me</span>
            </button>
          </div>

          {/* Feedback Card after Prediction */}
          {predictedChoiceId && (
            <div className="p-4 rounded-xl bg-black/40 border border-cyan-400/30 animate-fade-in space-y-2">
              {predictedChoiceId === 'unsure' ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                    <span>Exploring the Unknown</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Science begins with open curiosity! NASA researchers hypothesized that in microgravity, eliminating buoyant upward draft would allow oxygen and fuel diffusion to govern the reaction uniformly in all directions—yielding a symmetrical spherical flame.
                  </p>
                </>
              ) : (() => {
                const selected = beat.predictInteraction.choices.find(
                  (c) => c.id === predictedChoiceId
                );
                if (!selected) return null;
                return (
                  <>
                    <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                      <span>{selected.feedbackTitle}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selected.feedbackText}
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Interactive Section for Reveal Beat (Gravity Morph 3D Scene) */}
      {beat.type === 'reveal' && (
        <div className="my-8 space-y-4">
          <GravityMorphCanvas
            initialGravityG={0.0}
            scrollProgressG={scrollProgressG}
          />
        </div>
      )}

      {/* Interactive Section for Check Beat */}
      {beat.type === 'check' && beat.checkInteraction && (
        <div className="my-8 p-6 rounded-2xl bg-[#09152a] border border-cyan-500/30 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Concept Quick Check</span>
          </div>
          <h4 className="text-xl font-bold font-['Space_Grotesk'] text-white">
            {beat.checkInteraction.question}
          </h4>

          <div className="space-y-3">
            {beat.checkInteraction.choices.map((choice) => {
              const isSelected = checkAnswerId === choice.id;
              return (
                <div key={choice.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onSelectCheckAnswer && onSelectCheckAnswer(choice.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? choice.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-amber-950/40 border-amber-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        choice.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-amber-400" />
                        )
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-500" />
                      )}
                    </div>
                    <div className="text-sm sm:text-base font-medium">
                      {choice.label}
                    </div>
                  </button>

                  {isSelected && (
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <strong className={choice.isCorrect ? 'text-emerald-400' : 'text-amber-400'}>
                        {choice.isCorrect ? 'Spot on! ' : 'Great hypothesis! Let’s explore why: '}
                      </strong>
                      {choice.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* D3: Check "Not sure, show me" option */}
          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => {
                const correctChoice = beat.checkInteraction?.choices.find((c) => c.isCorrect);
                if (correctChoice && onSelectCheckAnswer) {
                  onSelectCheckAnswer(correctChoice.id);
                }
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-mono flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              aria-label="Not sure? Show explanation directly"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Not sure, show me</span>
            </button>
          </div>

          {checkAnswerId && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
              <span className="font-semibold text-white">Deeper Physics Insight: </span>
              {beat.checkInteraction.deeperContext}
            </div>
          )}
        </div>
      )}

      {/* Interactive Section for Takeaway Beat */}
      {beat.type === 'takeaway' && (
        <div className="my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#09152a] to-cyan-500/10 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider">
              Shareable Takeaway
            </span>
            <button
              type="button"
              onClick={() => handleCopyTakeaway(beat.layer1.headline)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
              aria-label="Copy takeaway quote"
            >
              {copiedTakeaway ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Quote</span>
                </>
              )}
            </button>
          </div>

          <blockquote className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white leading-snug">
            "{beat.layer1.headline}"
          </blockquote>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {beat.layer1.paragraphs[0]}
          </p>
        </div>
      )}

      {/* Layer 2: Go Deeper (Expandable Physics & Evidence) */}
      {beat.layer2 && (
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-slate-900/60 overflow-hidden w-full max-w-full">
          <button
            type="button"
            onClick={handleToggleLayer2}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold font-['Space_Grotesk'] text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
            aria-expanded={layer2Open}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Layer 2: Go Deeper into the Physics</span>
            </div>
            {layer2Open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {layer2Open && (
            <div className="p-5 border-t border-white/10 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fade-in">
              <h4 className="font-bold text-base text-white">
                {beat.layer2.headline}
              </h4>
              {beat.layer2.physicsExplanation.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              {beat.layer2.scientificPrinciples && (
                <div className="space-y-1.5 pt-2">
                  <div className="font-semibold text-cyan-400 text-xs font-mono uppercase">
                    Governing Physical Principles:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {beat.layer2.scientificPrinciples.map((principle, idx) => (
                      <li key={idx}>{principle}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence References */}
              {beat.layer2.evidenceRefs && beat.layer2.evidenceRefs.length > 0 && (
                <div className="pt-3 space-y-2">
                  <div className="font-semibold text-slate-400 text-xs font-mono uppercase">
                    Primary NASA Evidence Grounding:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {beat.layer2.evidenceRefs.map(renderEvidenceBadge)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Layer 3: Show Data (Expandable Recharts Visualization) */}
      {beat.layer3 && (
        <div className="mt-3 rounded-xl border border-indigo-500/20 bg-slate-900/60 overflow-hidden w-full max-w-full">
          <button
            type="button"
            onClick={handleToggleLayer3}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold font-['Space_Grotesk'] text-indigo-300 hover:bg-white/5 transition-colors cursor-pointer"
            aria-expanded={layer3Open}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Layer 3: Show Telemetry & Flight Data</span>
            </div>
            {layer3Open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {layer3Open && (
            <div className="p-5 border-t border-white/10 space-y-4 animate-fade-in">
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  {beat.layer3.headline}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {beat.layer3.chartDescription}
                </p>
              </div>

              {/* Recharts Line/Area Visualization or Empty Fallback (D9) */}
              {beat.layer3.data && beat.layer3.data.length > 0 ? (
                <div className="h-56 w-full pt-2 min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={beat.layer3.data}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis
                        dataKey={beat.layer3.xAxisKey}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09152a',
                          borderColor: '#38bdf8',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#f8fafc',
                        }}
                      />
                      {beat.layer3.dataKeys.map((dk) => (
                        <Line
                          key={dk.key}
                          type="monotone"
                          dataKey={dk.key}
                          stroke={dk.color}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: dk.color }}
                          name={dk.label}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-950/40 border border-white/10 text-center text-xs text-slate-400 font-mono">
                  Telemetry flight records currently previewing in flight explorer.
                </div>
              )}

              {/* Link to Flight Explorer */}
              {beat.layer3.sourceExperimentId && (
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/experiment/${beat.layer3.sourceExperimentId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 underline underline-offset-2 font-mono"
                  >
                    <span>Inspect Raw NASA Flight Records in Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress navigation helper */}
      {onNextBeat && beatIndex < totalBeats - 1 && (
        <div className="mt-8 pt-4 flex justify-end">
          <button
            type="button"
            onClick={onNextBeat}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Next Beat</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.article>
  );
};
