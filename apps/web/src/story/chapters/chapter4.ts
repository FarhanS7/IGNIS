/**
 * Story Mode - Chapter 4: "What NASA has not tested"
 *
 * Grounded in NASA exploration research gaps and tested flight envelope (NTRS-20240002981).
 * Cites exact flight bounds: TESTED_O2 13.6%–22.2%, FLOW 0–28.2 cm/s, Pressure 101.3 kPa, 0g only.
 */

import type { Chapter } from '../types.ts';

export const chapter4: Chapter = {
  id: 'chapter-04',
  slug: 'what-nasa-has-not-tested',
  number: 4,
  title: 'What NASA has not tested',
  subtitle: 'The uncharted frontiers of lunar, Martian, and high-oxygen exploration atmospheres',
  summary:
    'Every solid fire test in NASA’s flight archives was conducted in Earth orbit at sea-level pressure and normal oxygen. Moon gravity, Mars gravity, and Artemis 34% oxygen atmospheres remain untested in long-duration missions.',
  estimatedMinutes: {
    quick: 2,
    full: 3,
  },
  status: 'available',
  heroFlameScenario: {
    material: 'thick_solid',
    oxygen_pct: 34.0,
    pressure_kpa: 56.0,
    airflow_cm_s: 5.0,
    gravity_g: 0.16,
  },
  nextChapterSlug: undefined,
  takeaways: [
    'All NASA long-duration microgravity fire data was recorded in Earth orbit (0.0g) at sea-level pressure (101.3 kPa).',
    'Artemis exploration cabins plan 34% oxygen at reduced pressure (56 kPa), completely outside the flight-tested envelope.',
    'Zero long-duration solid combustion experiments have ever been conducted on the Moon (0.16g) or Mars (0.38g).',
  ],
  takeawayMessage:
    'Because deep space exploration atmospheres have never been tested in orbit, IGNIS strictly bounds its matcher to verified NASA flight records and flags untested regimes as research gaps.',
  limitsOfData: [
    'Tested microgravity data stops at 22.2% oxygen; human exploration atmospheres plan up to 34% oxygen.',
    'Partial gravity flammability is modeled from short 20-second parabolic aircraft flights and ground drop towers.',
    'Zero long-duration combustion experiments exist for the lunar or Martian surfaces.',
  ],
  glossary: [
    {
      term: 'Exploration Atmosphere',
      pronunciation: 'EK-spluh-RAY-shun AT-muhs-feer',
      shortDefinition:
        'A proposed spacecraft cabin environment using 34% oxygen at 56 kPa (8.2 psia) to allow rapid spacewalks without hours of pre-breathing.',
      plainAnalogy:
        'Like high-altitude mountain air enriched with extra oxygen so astronauts can put on spacesuits and walk outside without decompression sickness.',
    },
    {
      term: 'Tested Flight Envelope',
      pronunciation: 'TEST-id FLYT EN-vuh-lohp',
      shortDefinition:
        'The exact range of environmental conditions (oxygen, airflow, pressure, gravity) that NASA has physically measured in space.',
      plainAnalogy:
        'The charted waters on an old nautical map — outside this boundary lies uncharted open ocean.',
    },
    {
      term: 'Partial Gravity',
      pronunciation: 'PAR-shuhl GRAV-ih-tee',
      shortDefinition:
        'Gravitational acceleration between zero and Earth normal, such as lunar gravity (0.16g) or Martian gravity (0.38g).',
      plainAnalogy:
        'Weighing only one-sixth of your body weight on the Moon, or one-third on Mars.',
    },
  ],
  beats: [
    // -------------------------------------------------------------------------
    // BEAT 1: HOOK (29 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-01-hook',
      type: 'hook',
      act: 'coldOpen',
      truthTag: 'Illustration',
      title: 'The Earth Orbit Boundary',
      subtitle: 'Humanity has only studied fire in low Earth orbit',
      levelText: {
        little: 'We only tested near Earth.',
        explorer:
          'Every space fire test in NASA\'s flight database was conducted in Earth orbit at normal pressure and air.',
        scientist:
          'All microgravity solid combustion flight archives derive from low Earth orbit platforms (ISS, Shuttle, Cygnus) at 101.3 kPa ambient pressure.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'curious',
        speech: 'We have spent decades studying fire on the Space Station. But what happens when we leave Earth orbit?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'We have only tested low orbit',
        paragraphs: [
          'Every solid fire test in NASA’s microgravity flight database was conducted in Earth orbit at 101.3 kPa pressure and at most 22.2% oxygen. Deep space exploration is uncharted territory.',
        ],
        keyFact: 'NASA has physical flight records only for 0g orbit and 1g ground tests.',
      },
      layer2: {
        headline: 'The ISS Tested Boundary',
        physicsExplanation: [
          'The International Space Station operates at standard terrestrial sea-level conditions: 21% oxygen and 101.3 kPa (14.7 psi). Consequently, flight safety testing focused on that single atmospheric regime.',
        ],
        scientificPrinciples: ['Atmospheric Environmental Boundaries', 'Operational Envelope Limits'],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: 'BASS-II',
            runId: 'PSI-25-RUN-0001',
            citationLabel: 'NASA/TM-20210011385',
            telemetryNote: 'All flight testing in BASS-II and Saffire was performed in sealed 0g orbital spacecraft.',
          },
        ],
      },
      provenance: {
        datasetId: 'NASA Flight Database (BASS-II / Saffire)',
        platform: 'ISS & Cygnus',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'The lack of this experimental data has forced spacecraft designers to base their designs and safety precautions on 1-g understanding of flame spread, flame self-extinguishment, fire detection, and suppression.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 2: PREDICT (20 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-02-predict',
      type: 'predict',
      act: 'do',
      truthTag: 'Illustration',
      title: 'The Moon and Mars Gap',
      subtitle: 'How much partial gravity combustion data actually exists?',
      levelText: {
        little: 'Zero fire tests on Moon.',
        explorer:
          'Humanity has conducted zero long-duration fire experiments on the surface of the Moon or Mars.',
        scientist:
          'Zero long-duration solid combustion experiments exist for lunar (0.16g) or Martian (0.38g) gravitational regimes. Current models rely on parabolic flights.',
      },
      modes: ['full'],
      avatar: {
        expression: 'thinking',
        speech: 'How many long-duration fire tests has humanity conducted on the lunar surface?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'How many Moon fire tests exist?',
        paragraphs: [
          'How many long-duration solid combustion experiments has humanity performed on the surface of the Moon (0.16g) or Mars (0.38g)?',
        ],
        keyFact: 'Zero long-duration solid combustion experiments have been conducted on the Moon or Mars.',
      },
      predictInteraction: {
        prompt: 'Estimate human lunar combustion testing:',
        question: 'How many long-duration fire experiments have operated on the Moon or Mars?',
        choices: [
          {
            id: 'zero',
            label: 'Exactly zero tests',
            shapePreview: 'spark',
            feedbackTitle: 'Exactly Zero Flight Tests!',
            feedbackText:
              'Apollo never conducted combustion tests, and robotic landers do not carry fire chambers. We have zero long-duration partial-gravity solid fire data.',
            isAccurate: true,
          },
          {
            id: 'dozens',
            label: 'Around 25 tests during Apollo',
            shapePreview: 'flat',
            feedbackTitle: 'No: Apollo Avoided Fire Experiments',
            feedbackText:
              'Following the tragic Apollo 1 fire on the launchpad in 1967, deliberate combustion testing on manned missions was strictly prohibited.',
            isAccurate: false,
          },
          {
            id: 'hundreds',
            label: 'Hundreds of tests on Mars rovers',
            shapePreview: 'teardrop',
            feedbackTitle: 'Rovers Do Not Test Combustion',
            feedbackText:
              'Mars rovers study geology and climate; none carry sealed combustion enclosures for spacecraft material qualification.',
            isAccurate: false,
          },
        ],
      },
      provenance: {
        datasetId: 'NASA Exploration Architecture',
        platform: 'Artemis & Mars',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'Zero long-duration solid combustion experiments have been conducted on the Moon or Mars.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 3: REVEAL / ENVELOPE (27 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-03-reveal',
      type: 'reveal',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'The Artemis Atmosphere Gap',
      subtitle: 'Why the Gateway exploration cabin pushes beyond verified boundaries',
      levelText: {
        little: 'Moon air has more oxygen.',
        explorer:
          'Artemis plans 34% oxygen at reduced pressure. NASA\'s flight tests only reached 22.2% oxygen, leaving deep space untested.',
        scientist:
          'The Artemis Gateway 34.0% O2 / 56.0 kPa cabin architecture lies completely outside the NASA microgravity flight-tested flammability boundary (13.6%–22.2% O2).',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'surprised',
        speech: 'Artemis plans to raise oxygen from 21% up to 34% while dropping pressure to 56 kPa. That is completely uncharted in microgravity!',
      },
      avatarDock: 'left',
      layer1: {
        headline: 'High oxygen, low pressure',
        paragraphs: [
          'To enable rapid spacewalks, the Artemis Lunar Gateway uses 34% oxygen at 56 kPa. NASA’s microgravity flight database only tested up to 22.2% oxygen at 101.3 kPa.',
        ],
        keyFact: 'Higher oxygen dramatically increases material flammability and flame spread rates.',
      },
      revealInteraction: {
        title: 'Exploration Envelope vs Tested Flight Data',
        instruction: 'Compare flight-tested conditions against future exploration targets:',
        regimes: [
          {
            gravityG: 0.0,
            label: 'NASA Tested Limit (22.2% O2 / 101.3 kPa)',
            destinationName: 'ISS Tested Envelope',
            description: 'Upper boundary of verified flight flammability data from BASS-II and Saffire.',
            flameShape: 'Verified stable boundary',
            scenario: { material: 'pmma', oxygen_pct: 22.2, pressure_kpa: 101.3, airflow_cm_s: 5.0, gravity_g: 0.0 },
          },
          {
            gravityG: 0.16,
            label: 'Artemis Gateway (34.0% O2 / 56.0 kPa)',
            destinationName: 'Lunar Gateway Cabin',
            description: 'Reduced pressure exploration atmosphere with elevated oxygen to eliminate airlock pre-breathing.',
            flameShape: 'Uncharted high-oxygen regime',
            scenario: { material: 'thick_solid', oxygen_pct: 34.0, pressure_kpa: 56.0, airflow_cm_s: 5.0, gravity_g: 0.16 },
          },
          {
            gravityG: 0.38,
            label: 'Mars Habitat (28.0% O2 / 70.3 kPa)',
            destinationName: 'Mars Surface Outpost',
            description: 'Intermediate pressure habitat optimized for Martian surface operations and spacewalk frequency.',
            flameShape: 'Uncharted partial-gravity regime',
            scenario: { material: 'composite', oxygen_pct: 28.0, pressure_kpa: 70.3, airflow_cm_s: 5.0, gravity_g: 0.38 },
          },
        ],
      },
      provenance: {
        datasetId: 'NASA Flight Envelope',
        platform: 'ISS CIR / MSG',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'Tested oxygen range: 13.6% to 22.2%. Untested exploration target: 34.0% O2 at 56.0 kPa.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 4: DATA / GAPS MATRIX (24 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-04-why',
      type: 'why',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'The Verified Research Gaps',
      subtitle: 'How IGNIS protects scientific honesty by flagging untested regimes',
      levelText: {
        little: 'We warn about untested air.',
        explorer:
          'IGNIS flags whenever you test settings outside NASA\'s flight database, protecting honest science and showing research gaps.',
        scientist:
          'IGNIS enforces strict epistemic boundaries: parameters exceeding tested limits (O2 > 22.2%, partial g, low pressure) are categorized as exploration research gaps.',
      },
      modes: ['full'],
      avatar: {
        expression: 'proud',
        speech: 'When you test 34% oxygen in our simulator, IGNIS explicitly warns you that NASA has never tested this setup in orbit.',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Explore the limits in IGNIS',
        paragraphs: [
          'Our matcher strictly bounds predictions to tested data. Outside 13.6% to 22.2% O2, IGNIS flags that NASA has never validated fire behavior in microgravity.',
        ],
        keyFact: 'Tested bounds: Oxygen 13.6%–22.2%, Airflow 0.0–28.2 cm/s, Pressure 101.3 kPa, Gravity 0.0g.',
      },
      layer2: {
        headline: 'Epistemic Boundary Enforcement',
        physicsExplanation: [
          'Physical extrapolation into high-oxygen, low-pressure regimes without flight calibration risks dangerous false certainty. IGNIS classifies all parameters outside physical evidence as research gaps.',
        ],
        scientificPrinciples: ['Domain Boundary Verification', 'Epistemic Uncertainty Tracking'],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: 'BASS-II',
            runId: 'PSI-25-RUN-0001',
            citationLabel: 'ICES-2024-365 / NTRS-20240002981',
            telemetryNote: 'Identifies open exploration research gaps across lunar, Martian, and Gateway cabin architectures.',
          },
        ],
      },
      layer3: {
        headline: 'NASA Tested Envelope vs Exploration Frontiers',
        chartDescription:
          'Comparison of NASA physical flight testing boundaries against planned exploration mission parameters.',
        xAxisKey: 'mission',
        dataKeys: [
          {
            key: 'oxygen_pct',
            label: 'Oxygen Concentration (%)',
            color: '#38bdf8',
            unit: '%',
          },
          {
            key: 'pressure_kpa',
            label: 'Cabin Pressure (kPa)',
            color: '#f59e0b',
            unit: 'kPa',
          },
        ],
        data: [
          { mission: 'BASS-II Min Tested', oxygen_pct: 13.6, pressure_kpa: 101.3, status: 'Tested' },
          { mission: 'ISS Standard Air', oxygen_pct: 21.0, pressure_kpa: 101.3, status: 'Tested' },
          { mission: 'BASS-II Max Tested', oxygen_pct: 22.2, pressure_kpa: 101.3, status: 'Tested' },
          { mission: 'Mars Transit Habitat', oxygen_pct: 28.0, pressure_kpa: 70.3, status: 'Untested Gap' },
          { mission: 'Artemis Gateway', oxygen_pct: 34.0, pressure_kpa: 56.0, status: 'Untested Gap' },
        ],
        sourceExperimentId: 'BASS-II',
        sourceRunId: 'PSI-25-RUN-0001',
        citationLabel: 'NTRS-20240002981 Table 1',
      },
      provenance: {
        datasetId: 'IGNIS Verification Engine',
        platform: 'Tested Flight Envelope',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'TESTED_O2_MIN: 13.6%, TESTED_O2_MAX: 22.2%, TESTED_FLOW_MIN: 0.0, TESTED_FLOW_MAX: 28.18 cm/s.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 5: TAKEAWAY (24 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-05-takeaway',
      type: 'takeaway',
      act: 'takeaway',
      truthTag: 'From NASA flight tests',
      title: 'Take the Controls in the Simulator',
      subtitle: 'Put the physics into action or test exploration gaps yourself',
      levelText: {
        little: 'Try the simulator yourself now!',
        explorer:
          'Now that you understand space fire, explore verified NASA flight tests or test exploration frontiers in the Simulator.',
        scientist:
          'Validate physical regimes or explore open exploration research gaps using the interactive IGNIS Simulator and Research Gaps ranking engine.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'proud',
        speech: 'You now know more about space fire than 99% of people on Earth! Jump into the Simulator to test your knowledge.',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Take the controls in the simulator',
        paragraphs: [
          'Now that you know how space fire works, take the controls. Test real flight conditions or push past the envelope in the IGNIS Simulator.',
        ],
        keyFact: 'Click "Try the Simulator" below or explore our Research Gaps ranking to see where future missions must test.',
      },
      provenance: {
        datasetId: 'IGNIS Flight Simulator',
        platform: 'Interactive Lab',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'Exploration gap analysis connecting NASA PSI flight archives to Artemis mission planning.',
      },
    },
  ],
};
