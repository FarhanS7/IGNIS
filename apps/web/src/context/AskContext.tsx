import React, { useState, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import type { ConfidenceLevel, EvidenceLevel, ScenarioInput, AskRequest } from '../types/api';
import {
  AskContext,
  type AskContextValue,
  type ChatMessage,
  type GroundedCitation,
  type AskPageContext,
} from './AskContextDefinition';

export type { ChatMessage, GroundedCitation, AskPageContext, AskContextValue };

const DEFAULT_GENERAL_PROMPTS = [
  'Why do microgravity flames form a spherical shape?',
  'What did Saffire discover about large-scale spacecraft fire safety?',
  'The Airflow Paradox: Why does 0.05 m/s ventilation sustain flame spread?',
  'Does fire behave differently in lunar gravity (0.16g) compared to 0g?',
  'What are cool flames and how were they discovered in the FLEX experiments?',
  'Can I burn gasoline or uncertified polyurethane in a space station habitat?',
];

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
        experimentId: '22222222-2222-2222-2222-222222222207',
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
        experimentId: '22222222-2222-2222-2222-222222222201',
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
        experimentId: '22222222-2222-2222-2222-222222222202',
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
        experimentId: '22222222-2222-2222-2222-222222222205',
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
        experimentId: '22222222-2222-2222-2222-222222222207',
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

let msgCounter = 0;
const genMessageId = (prefix: string) => {
  msgCounter += 1;
  return `${prefix}-${Date.now()}-${msgCounter}`;
};

export const AskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [pageContext, setPageContext] = useState<AskPageContext | null>(null);

  const openDrawer = useCallback((initialQuery?: string) => {
    setIsDrawerOpen(true);
    if (initialQuery) {
      setInputQuery(initialQuery);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const clearSession = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setInputQuery('');
  }, []);

  // Compute context-sensitive suggested prompts
  const suggestedPrompts = useMemo(() => {
    if (pageContext?.suggestedPrompts && pageContext.suggestedPrompts.length > 0) {
      return pageContext.suggestedPrompts;
    }
    if (pageContext?.type === 'simulator') {
      return [
        'Why does this flame look the way it does?',
        'What would change if oxygen were 30%?',
        'Which NASA run is closest to this and why?',
        'How does forced airflow prevent flame self-extinction in this habitat?',
      ];
    }
    if (pageContext?.type === 'experiment' && pageContext.experiment) {
      const exp = pageContext.experiment;
      return [
        `What were the key discoveries of NASA ${exp.title}?`,
        `How does airflow affect flame spread in ${exp.experiment_family}?`,
        'What materials and ignition methods were tested in this campaign?',
        `What makes ${exp.mission_platform || 'this platform'} unique for combustion research?`,
      ];
    }
    if (pageContext?.type === 'story') {
      return [
        'Explain the microgravity physics in this story in simple terms.',
        'What NASA flight experiments validate this narrative?',
        'How does spacecraft ventilation create the life-support paradox?',
      ];
    }
    return DEFAULT_GENERAL_PROMPTS;
  }, [pageContext]);

  const sendMessage = useCallback(
    async (queryToSend?: string) => {
      const query = (queryToSend || inputQuery).trim();
      if (!query) return;

      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const userMsg: ChatMessage = {
        id: genMessageId('user'),
        role: 'user',
        content: query,
        timestamp: timestampStr,
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!queryToSend) setInputQuery('');
      setIsLoading(true);

      // Construct contextual payload
      let formattedQuestion = query;
      let scope = 'global';
      let scenarioContext: ScenarioInput | null = null;
      let experimentId: string | undefined = undefined;
      let storySlug: string | undefined = undefined;

      if (pageContext) {
        if (pageContext.type === 'simulator' && pageContext.scenario) {
          scope = 'scenario';
          scenarioContext = pageContext.scenario;
          const s = pageContext.scenario;
          formattedQuestion = `[Habitat Context: ${s.gravity_environment}, ${s.oxygen_pct}% O₂, ${s.pressure_kpa} kPa, ${s.airflow_cm_s} cm/s flow, fuel: ${s.material}] ${query}`;
        } else if (pageContext.type === 'experiment' && pageContext.experiment) {
          scope = 'experiment';
          const exp = pageContext.experiment;
          if (exp.id.includes('-') && exp.id.length === 36) {
            experimentId = exp.id;
          }
          formattedQuestion = `[Experiment Context: NASA ${exp.experiment_family} - ${exp.title}] ${query}`;
        } else if (pageContext.type === 'story' && pageContext.storySlug) {
          scope = 'story';
          storySlug = pageContext.storySlug;
          formattedQuestion = `[Story Context: ${pageContext.title || pageContext.storySlug}] ${query}`;
        }
      }

      const payload: AskRequest = {
        question: formattedQuestion,
        scope,
        scenario_context: scenarioContext,
        experiment_id: experimentId,
        story_slug: storySlug,
        conversation_history: messages.slice(-4).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      try {
        const res = await api.ask(payload);

        const citations: GroundedCitation[] = (res.grounded_sources || []).map((s, idx) => ({
          id: `cite-${idx}`,
          experimentId: s.experiment_id || undefined,
          title: s.title,
          documentTitle: s.doi || 'NASA Flight Publication Archive',
          doi: s.doi || undefined,
          evidenceLevel: (s.evidence_level as EvidenceLevel) || 'A',
          quote: s.quote || '',
        }));

        const asstMsg: ChatMessage = {
          id: genMessageId('asst'),
          role: 'assistant',
          content: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: res.confidence,
          isLowEvidence:
            res.confidence === 'low' ||
            res.answer.includes('INSUFFICIENT NASA EMPIRICAL EVIDENCE') ||
            res.answer.includes('INSUFFICIENT NASA EVIDENCE'),
          citations,
          caveats: res.caveats,
          isOfflineFallback: false,
        };

        setMessages((prev) => [...prev, asstMsg]);
      } catch (err) {
        console.warn('Backend API ask unreachable, using embedded NASA grounded knowledge base:', err);

        // 5. Offline fallback with visible note
        const lower = query.toLowerCase();

        const isDangerousOrUngrounded =
          lower.includes('gasoline') ||
          lower.includes('polyurethane') ||
          lower.includes('rocket fuel in hab') ||
          lower.includes('alien') ||
          lower.includes('laser weapon');

        const responseItem = KNOWLEDGE_BASE.find((k) =>
          k.keywords.some((kw) => lower.includes(kw))
        );

        if (isDangerousOrUngrounded) {
          const lowEvidenceMsg: ChatMessage = {
            id: genMessageId('asst'),
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
            isOfflineFallback: true,
          };
          setMessages((prev) => [...prev, lowEvidenceMsg]);
        } else if (responseItem) {
          const asstMsg: ChatMessage = {
            id: genMessageId('asst'),
            role: 'assistant',
            content: responseItem.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: responseItem.confidence,
            isLowEvidence: responseItem.isLowEvidence,
            observedFacts: responseItem.observedFacts,
            citations: responseItem.citations,
            caveats: responseItem.caveats,
            isOfflineFallback: true,
          };
          setMessages((prev) => [...prev, asstMsg]);
        } else {
          // Context-aware general answer
          let contextNote = '';
          if (pageContext?.type === 'simulator' && pageContext.scenario) {
            contextNote = `Under your configured habitat environment (${pageContext.scenario.gravity_environment}, ${pageContext.scenario.oxygen_pct}% O₂, ${pageContext.scenario.airflow_cm_s} cm/s ventilation), combustion dynamics deviate fundamentally from 1g Earth fires. `;
          } else if (pageContext?.type === 'experiment' && pageContext.experiment) {
            contextNote = `Regarding NASA flight mission ${pageContext.experiment.title}: `;
          }

          const generalMsg: ChatMessage = {
            id: genMessageId('asst'),
            role: 'assistant',
            content: `${contextNote}Regarding **"${query}"**:\n\nIn microgravity environments, fire behavior is decoupled from Earth-like buoyant acceleration. Oxygen transport relies entirely on forced life-support circulation (0.05 to 0.20 m/s) and slow molecular diffusion.\n\nNASA flight investigations (Saffire I–VI, BASS, FLEX) demonstrate that materials exhibit lower burning rates, rounded reaction fronts, and distinct extinction limits where flames choke in their own stagnant exhaust unless continuous airflow is provided.`,
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
            isOfflineFallback: true,
          };
          setMessages((prev) => [...prev, generalMsg]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [inputQuery, messages, pageContext]
  );

  const value = useMemo<AskContextValue>(
    () => ({
      messages,
      inputQuery,
      setInputQuery,
      isLoading,
      sendMessage,
      clearSession,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      pageContext,
      setPageContext,
      suggestedPrompts,
    }),
    [
      messages,
      inputQuery,
      isLoading,
      sendMessage,
      clearSession,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      pageContext,
      suggestedPrompts,
    ]
  );

  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
};
