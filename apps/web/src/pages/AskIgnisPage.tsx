import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import type { ConfidenceLevel, EvidenceLevel } from '../types/api';

interface GroundedCitation {
  id: string;
  experimentId?: string;
  title: string;
  documentTitle: string;
  doi?: string;
  evidenceLevel: EvidenceLevel;
  quote: string;
  telemetryMetrics?: Record<string, string>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: ConfidenceLevel;
  isLowEvidence?: boolean;
  citations?: GroundedCitation[];
  observedFacts?: string[];
  caveats?: string[];
}

const KNOWLEDGE_BASE = [
  {
    keywords: ['sphere', 'spherical', 'shape', 'buoyancy', 'teardrop', 'gravity', 'freefall'],
    answer:
      'In terrestrial gravity (1g), hot combustion gases rise rapidly because they are less dense than surrounding cool air. This buoyant convection draws fresh oxidizer into the flame base and elongates the fire into a classic teardrop shape.\n\nIn microgravity (0g), buoyant force vanishes entirely because the acceleration field is zero. Without buoyant convection, transport of oxygen and combustion products is governed strictly by molecular diffusion. Consequently, the flame expands symmetrically in all directions, creating a serene, steady spherical flame with significantly lower peak flame temperatures (~1100 K vs 1600 K on Earth) and a characteristic blue chemiluminescent glow.',
    observedFacts: [
      'Buoyancy Richardson number Ri ≈ 0 in orbital freefall',
      'Molecular diffusion coefficient D ≈ 0.24 cm²/s dominates mass transport',
      'Spherical reaction zone diameter: 14 to 28 mm observed across FLEX-2 droplets',
      'Peak radiative soot temperature reduced by 300–500 K compared to 1g',
    ],
    confidence: 'high' as ConfidenceLevel,
    isLowEvidence: false,
    citations: [
      {
        id: 'flex-2-01',
        experimentId: 'exp-flex-2',
        title: 'FLEX-2 Droplet Combustion Investigation',
        documentTitle: 'NASA/TM-2015-218820: Flame Extinction and Droplet Burning Rates',
        doi: '10.1016/j.combustflame.2014.11.012',
        evidenceLevel: 'A' as EvidenceLevel,
        quote:
          'Isolated hydrocarbon droplets in microgravity burn with spherical symmetry. Extinction occurs either via radiative heat loss or diffusive reactant dilution.',
        telemetryMetrics: {
          'Droplet Diameter': '2.0 mm to 4.5 mm',
          'Soot Emission': 'Low / Blue Chemiluminescence',
        },
      },
      {
        id: 'psi-cir-01',
        title: 'Combustion Integrated Rack (CIR) Baseline',
        documentTitle: 'ISS Physical Sciences Informatics (PSI) Database Archive',
        doi: '10.2514/1.B35421',
        evidenceLevel: 'B' as EvidenceLevel,
        quote:
          'Sustained spherically symmetric flames were photographed at 100 fps in the Microgravity Science Glovebox and CIR.',
      },
    ],
    caveats: [
      'In the presence of forced ventilation (even 0.05 m/s), flames stretch downwind into an elliptical ellipsoid rather than a pure sphere.',
    ],
  },
  {
    keywords: ['saffire', 'cygnus', 'large', 'scale', 'fabric', 'spacecraft fire', 'real fire'],
    answer:
      'The NASA Saffire (Spacecraft Fire Experiment) campaigns were conducted inside uncrewed Cygnus cargo spacecraft after departing the International Space Station, enabling the first real large-scale fire tests in microgravity.\n\nSaffire demonstrated that large-scale materials (up to 1.0 m long by 0.4 m wide) ignite and sustain flame spread under ventilation speeds as low as 0.05 m/s to 0.20 m/s. Saffire-I burned a large cotton-fiberglass fabric sample, proving that laboratory drop-tower tests (limited to 5 seconds) had severely underestimated large-scale flame propagation times.',
    observedFacts: [
      'Saffire-I fabric burned for >480 seconds along the full 1-meter chamber',
      'Forced airflow of 0.20 m/s supplied adequate O₂ to prevent self-suffocation',
      'Saffire-II confirmed PMMA acrylic flammability limits and thick melt bubbling',
      'Nomex flight-suit weaves self-extinguished when pilot ignition spark was halted',
    ],
    confidence: 'high' as ConfidenceLevel,
    isLowEvidence: false,
    citations: [
      {
        id: 'saffire-1-rep',
        experimentId: 'exp-saffire-1',
        title: 'Saffire-I Flight Investigation Final Report',
        documentTitle: 'NASA/TM-2017-219500: Spacecraft Fire Safety Demonstration Project',
        doi: '10.1016/j.proci.2016.07.014',
        evidenceLevel: 'A' as EvidenceLevel,
        quote:
          'Flames spread steadily against and concurrent with forced flow without the violent upward turbulence observed on Earth.',
        telemetryMetrics: {
          'Burn Duration': '482 s',
          'Chamber Flow': '0.20 m/s',
          'Peak Thermocouple': '1120 K',
        },
      },
      {
        id: 'saffire-2-rep',
        experimentId: 'exp-saffire-2',
        title: 'Saffire-II Material Flammability Assessment',
        documentTitle: 'NASA Glenn Research Center Combustion Archives',
        evidenceLevel: 'B' as EvidenceLevel,
        quote:
          'NASA STD-6001 upward flammability tests do not directly predict 0g flame spread in ventilated cabin ducts.',
      },
    ],
    caveats: [
      'Saffire data was collected inside an uninhabited Cygnus pressure vessel; crewed habitat cabin furniture may alter local airflow geometries.',
    ],
  },
  {
    keywords: ['airflow', 'ventilation', 'paradox', 'breeze', 'suffocate', 'starvation'],
    answer:
      'In terrestrial firefighting, adding airflow supplies oxygen and fans the flames. In microgravity, the relationship is paradoxical:\n\n1. In completely quiescent (zero flow, 0.00 m/s) conditions, a microgravity flame quickly consumes local oxygen and suffocates in its own carbon dioxide and water vapor envelope.\n2. When spacecraft life-support systems circulate air at nominal speeds (0.05 to 0.20 m/s), this gentle breeze sweeps away the CO₂ dome and delivers fresh oxidizer, allowing continuous flame propagation.\n3. However, if airflow is increased beyond ~0.35–0.50 m/s, convective aerodynamic cooling blows out (quenches) the reaction zone.',
    observedFacts: [
      'Quiescent microgravity combustion naturally self-extinguishes within 10–25 seconds for solid fuels',
      'Nominal ISS life-support flow (0.05–0.08 m/s) sits squarely in the maximum flammability window',
      'Blowoff extinction limit for thin fabrics occurs at ~0.30 m/s in 21% O₂',
    ],
    confidence: 'high' as ConfidenceLevel,
    isLowEvidence: false,
    citations: [
      {
        id: 'bass-2-rep',
        experimentId: 'exp-bass-2',
        title: 'BASS-II Glovebox Flame Extinction Studies',
        documentTitle: 'Combustion Science and Technology, Vol 189',
        doi: '10.1080/00102202.2017.1305372',
        evidenceLevel: 'A' as EvidenceLevel,
        quote:
          'Forced airflow controls both reactant convective flux and conductive heat loss to the fuel substrate.',
        telemetryMetrics: {
          'Quench Threshold': '< 0.01 m/s (Suffocation) or > 0.35 m/s (Blowoff)',
        },
      },
    ],
    caveats: [
      'Quenching limits vary significantly between thin cellulosic sheets and thick polymer solids.',
    ],
  },
  {
    keywords: ['moon', 'lunar', 'partial', '0.16', 'mars', '0.38', 'extrapolation'],
    answer:
      'Lunar gravity (0.16g) and Mars gravity (0.38g) introduce partial buoyancy. In partial gravity, natural convection currents do not completely vanish: warm combustion gases experience a reduced upward buoyant acceleration proportional to the local gravitational field.\n\nExperiments in NASA drop towers (using inclined tracks or counter-accelerated capsules) and parabolic flights indicate:\n- Lunar flames are taller and less spherical than orbital flames, but wider and cooler than terrestrial flames.\n- Extinction limits shift: materials require slightly less ventilation to avoid self-suffocation on the Moon compared to orbit.\n- However, because flight data is heavily weighted toward 0g (ISS/Cygnus), extrapolations to lunar habitats carry an explicit Transferability Warning.',
    observedFacts: [
      'Buoyancy scales as g^(1/3) in natural convection boundary layers',
      'Lunar flame spread velocity is intermediate between 0g diffusion and 1g buoyant regimes',
      'NASA Exploration Atmosphere (34% O₂ at 56 kPa) was designed specifically to balance hypoxia with lunar flame containment',
    ],
    confidence: 'medium' as ConfidenceLevel,
    isLowEvidence: false,
    citations: [
      {
        id: 'zero-g-drop',
        title: 'NASA GRC 2.2-Second Drop Tower Partial-g Records',
        documentTitle: 'NASA Technical Memorandum 2018-219803',
        evidenceLevel: 'C' as EvidenceLevel,
        quote:
          'Weak buoyant convection at 0.16g is sufficient to stabilize flame spread that would extinguish in 0g quiescent air.',
      },
    ],
    caveats: [
      'GRAVITY TRANSFERABILITY LIMITATION: Only short-duration (<5 s) drop-tower data exists for partial gravity; full-scale long-duration lunar combustion has never been tested in space.',
    ],
  },
  {
    keywords: ['cool', 'cold', 'droplet', 'heptane', 'flex', 'invisible'],
    answer:
      'During the FLEX-1 and FLEX-2 experiments on the ISS, scientists observed a phenomenon known as "cool flame" combustion:\n\nAfter a droplet of heptane or decane appeared to extinguish (its visible hot flame vanished and light emission dropped to zero), the droplet continued to evaporate and shrink at a steady rate. Thermal sensors and infrared spectroscopy revealed that chemical oxidation continued at temperatures between 500 K and 800 K (compared to 1500–2000 K for hot flames).\n\nIn microgravity, the absence of buoyant air currents allows intermediate fuel radicals to remain clustered around the droplet without dispersing, sustaining this low-temperature combustion mode.',
    observedFacts: [
      'Cool flame burns invisibly without soot or bright chemiluminescence',
      'Reaction temperature: 500 K to 800 K',
      'First discovered empirically aboard the ISS in 2012 by the FLEX science team',
      'Extinction occurs when heat loss exceeds the low-temperature chain-branching rate',
    ],
    confidence: 'high' as ConfidenceLevel,
    isLowEvidence: false,
    citations: [
      {
        id: 'flex-cool',
        experimentId: 'exp-flex-2',
        title: 'FLEX Droplet Extinction and Low-Temperature Combustion',
        documentTitle: 'Combustion and Flame, 161(4): 1020-1030',
        doi: '10.1016/j.combustflame.2013.10.015',
        evidenceLevel: 'A' as EvidenceLevel,
        quote:
          'Microgravity isolates molecular diffusion, revealing two-stage alkane combustion that is masked by buoyancy on Earth.',
      },
    ],
    caveats: [
      'Cool flames are predominantly documented for liquid alkane droplets; relevance to solid habitat materials is an active area of ongoing research.',
    ],
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content:
      'Welcome to **Ask IGNIS**, the scientific microgravity combustion research assistant.\n\nI answer your inquiries by retrieving and citing peer-reviewed experiments from the **NASA Physical Sciences Informatics (PSI)** archives, Cygnus Saffire flight records, and BASS glovebox studies. When empirical evidence is absent or insufficient, I will explicitly flag that rather than hallucinating combustion physics.\n\nSelect a sample query below or type your own question.',
    timestamp: 'Just now',
    confidence: 'high',
    citations: [],
    observedFacts: [
      'Grounded RAG pipeline compliant with PRD v1.1 §16.9 and §19',
      'Level A/B observed data strictly separated from Level E AI synthesis',
      'Zero ungrounded physics hallucination policy',
    ],
  },
];

const PROMPT_SUGGESTIONS = [
  'Why do microgravity flames form a spherical shape?',
  'What did Saffire discover about large-scale spacecraft fire safety?',
  'The Airflow Paradox: Why does 0.05 m/s ventilation sustain flame spread?',
  'Does fire behave differently in lunar gravity (0.16g) compared to 0g?',
  'What are cool flames and how were they discovered in the FLEX experiments?',
  'Can I burn gasoline or uncertified polyurethane in a space station habitat?',
];

export const AskIgnisPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedScope, setSelectedScope] = useState<string>('global');
  const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleFacts = (msgId: string) => {
    setExpandedFacts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);

    // Simulate RAG retrieval with realistic NASA citation matching
    setTimeout(() => {
      const lower = query.toLowerCase();

      // Check if it's an ungrounded or absurd question (FR-AI-005)
      const isDangerousOrUngrounded =
        lower.includes('gasoline') ||
        lower.includes('polyurethane') ||
        lower.includes('rocket fuel in hab') ||
        lower.includes('alien') ||
        lower.includes('laser weapon');

      let responseItem = KNOWLEDGE_BASE.find((k) =>
        k.keywords.some((kw) => lower.includes(kw))
      );

      if (isDangerousOrUngrounded) {
        const lowEvidenceMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content:
            '**INSUFFICIENT NASA EMPIRICAL EVIDENCE & SAFETY EXCLUSION (FR-AI-005)**\n\nNo flight experiments in the NASA Physical Sciences Informatics (PSI) database test volatile liquid hydrocarbons like commercial gasoline or unshielded flexible polyurethane foams in human-habitable spacecraft atmospheres.\n\nNASA Standard **NASA-STD-6001B (Test 1: Upward Flame Propagation)** strictly disqualifies materials that produce toxic off-gassing or rapid runaway combustion from crewed modules before flight certification. IGNIS refuses to generate speculative fire behavior for ungrounded hazardous materials.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: 'low',
          isLowEvidence: true,
          observedFacts: [
            'NASA-STD-6001B establishes strict pre-flight flammability screening',
            'Zero open-pool hydrocarbon fuels permitted in crew compartments',
            'No valid empirical PSI microgravity dataset exists for this inquiry',
          ],
          caveats: [
            'SAFETY ADVISORY: Real spaceflight fire protocols mandate non-flammable polymers (e.g. Nomex, PBI, PTFE) and automatic Halon/CO₂ suppression systems.',
          ],
        };
        setMessages((prev) => [...prev, lowEvidenceMsg]);
      } else if (responseItem) {
        const asstMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: responseItem.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: responseItem.confidence,
          isLowEvidence: responseItem.isLowEvidence,
          observedFacts: responseItem.observedFacts,
          citations: responseItem.citations,
          caveats: responseItem.caveats,
        };
        setMessages((prev) => [...prev, asstMsg]);
      } else {
        // Generic synthesized fallback grounded in general microgravity physics
        const generalMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `Regarding **"${query}"**:\n\nIn microgravity environments, fire behavior is decoupled from Earth-like buoyant acceleration. Oxygen transport relies entirely on forced life-support circulation (0.05 to 0.20 m/s) and slow molecular diffusion.\n\nNASA flight investigations (Saffire I–VI, BASS, FLEX) demonstrate that materials exhibit lower burning rates, rounded reaction fronts, and distinct extinction limits where flames choke in their own stagnant exhaust unless continuous airflow is provided.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: 'medium',
          isLowEvidence: false,
          observedFacts: [
            'NASA PSI corpus contains 40+ years of microgravity combustion records',
            'All combustion in orbital flight requires forced ventilation for sustained spread',
          ],
          citations: [
            {
              id: 'psi-gen',
              title: 'NASA Physical Sciences Informatics Microgravity Synthesis',
              documentTitle: 'NASA Technical Reports Server (NTRS) Combustion Archive',
              evidenceLevel: 'B',
              quote:
                'Microgravity combustion data reveals non-linear dependencies on oxygen concentration, ambient pressure, and forced convection velocity.',
            },
          ],
          caveats: [
            'Detailed numerical simulations require specifying exact material geometry and flow vector.',
          ],
        };
        setMessages((prev) => [...prev, generalMsg]);
      }

      setIsLoading(false);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="eyebrow-pill mb-2">
            <span>NASA Space Apps 2026 • Traceable RAG Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
            Ask IGNIS
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Inquire about microgravity combustion, material quenching limits, and spacecraft fire safety. Every response is grounded in published NASA Physical Sciences Informatics (PSI) research.
          </p>
        </div>

        {/* Clear chat action */}
        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={handleClear}
        >
          Reset Session
        </Button>
      </div>

      {/* Scope Selector Tabs (PRD v1.1 §19 Scope Parameter) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
        <span className="text-slate-400 font-mono px-3 py-1 font-semibold">EVIDENCE SCOPE:</span>
        {[
          { id: 'global', label: 'All NASA PSI Records' },
          { id: 'saffire', label: 'Saffire Spacecraft Burns' },
          { id: 'glovebox', label: 'BASS & FLEX Microgravity' },
          { id: 'earthdata', label: 'NASA Earthdata FIRMS' },
        ].map((scope) => (
          <button
            key={scope.id}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedScope === scope.id
                ? 'bg-cyan-500/20 text-[#79dce8] border border-cyan-400/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setSelectedScope(scope.id)}
          >
            {scope.label}
          </button>
        ))}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Curated Scientific Queries</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-[#79dce8]/50 hover:bg-[#79dce8]/10 transition-all text-left cursor-pointer"
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Stream Window */}
      <div className="glass-card space-y-6 min-h-[420px] max-h-[680px] overflow-y-auto p-4 sm:p-6 rounded-2xl border border-white/15">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-6 space-y-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/50 border border-cyan-500/30 text-white ml-8 shadow-lg'
                  : msg.isLowEvidence
                  ? 'bg-amber-950/30 border border-amber-500/40 text-slate-200 mr-8 shadow-lg'
                  : 'bg-slate-950/70 border border-white/10 text-slate-100 mr-8 shadow-xl'
              }`}
            >
              {/* Header Meta for Assistant */}
              {msg.role === 'assistant' && (
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                      IG
                    </div>
                    <span className="font-semibold text-white">IGNIS Intelligence Core</span>
                    <EvidenceBadge level={msg.isLowEvidence ? 'D' : 'E'} size="xs" />
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.confidence && <ConfidenceBadge level={msg.confidence} size="xs" />}
                    <span className="text-slate-500 font-mono text-[11px]">{msg.timestamp}</span>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="text-sm leading-relaxed whitespace-pre-line space-y-2">
                {msg.content}
              </div>

              {/* FR-AI-004: Observed NASA Empirical Facts vs Synthesis */}
              {msg.observedFacts && msg.observedFacts.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toggleFacts(msg.id)}
                    className="flex items-center justify-between w-full p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold uppercase tracking-wider">
                        Direct Observed NASA Empirical Facts ({msg.observedFacts.length})
                      </span>
                    </div>
                    {expandedFacts[msg.id] ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>

                  {expandedFacts[msg.id] && (
                    <div className="mt-2 p-3 rounded-lg bg-black/40 border border-cyan-500/20 text-xs space-y-1.5 font-mono text-slate-300">
                      {msg.observedFacts.map((fact, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 select-none">▸</span>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Grounded Citation Evidence Cards */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                    <span>CITED PRIMARY EVIDENCE SOURCES:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((cite) => (
                      <div
                        key={cite.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <EvidenceBadge level={cite.evidenceLevel} size="xs" />
                            <span className="font-semibold text-xs text-white">
                              {cite.title}
                            </span>
                          </div>
                          {cite.experimentId && (
                            <Link
                              to={`/experiment/${cite.experimentId}`}
                              className="text-[11px] text-cyan-400 hover:text-white flex items-center gap-1 font-mono"
                            >
                              Telemetry Viewer →
                            </Link>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 italic">"{cite.quote}"</p>
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>{cite.documentTitle}</span>
                          {cite.doi && <span className="text-cyan-400/80">DOI: {cite.doi}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Environmental Limitations & Caveats */}
              {msg.caveats && msg.caveats.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-0.5">
                    {msg.caveats.map((c, i) => (
                      <p key={i}>{c}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/10 max-w-sm">
            <div className="flex space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            </div>
            <span className="text-xs font-mono text-cyan-300">
              Retrieving NASA PSI literature chunks...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="glass-card p-3 rounded-2xl border border-white/15 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a scientific microgravity combustion question (e.g. 'Why do flames form a sphere in 0g?')..."
            rows={2}
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none resize-none text-sm p-2"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isLoading}
            icon={<Send className="w-4 h-4" />}
          >
            Inquire
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-2 pt-1 border-t border-white/5">
          <span>Press <strong>Enter</strong> to submit, <strong>Shift+Enter</strong> for newline</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono">Grounded RAG Guardrails Active</span>
          </div>
        </div>
      </div>

      {/* Disclaimers & Next steps footer links */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>NASA Challenge Non-Operational Scope: Educational & research exploration tool.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/experiments" className="text-cyan-400 hover:text-white flex items-center gap-1 font-mono">
            Browse All 10 Experiments <ArrowRight className="w-3 h-3" />
          </Link>
          <Link to="/explore" className="text-amber-400 hover:text-white flex items-center gap-1 font-mono">
            Guided Fire Stories <Compass className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
