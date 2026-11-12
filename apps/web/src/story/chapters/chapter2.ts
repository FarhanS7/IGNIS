/**
 * Story Mode - Chapter 2: "Same fire, different air"
 *
 * Grounded in NASA BASS-II flight solid fuel combustion dataset (PSI-25 / NTRS-20210011385).
 * Flow calibration note: Airflow converted from fan dial settings using U = 1.0066 * AirDisplay (basis: converted).
 */

import type { Chapter } from '../types.ts';

export const chapter2: Chapter = {
  id: 'chapter-02',
  slug: 'same-fire-different-air',
  number: 2,
  title: 'Same fire, different air',
  subtitle: 'How oxygen and airflow control whether spacecraft fire burns or starves',
  summary:
    'In dead-still space air, fire quickly starves itself because its own CO2 exhaust suffocates the flame. But introduce a tiny breeze of just 1 to 5 cm/s, and solid fuel burns readily.',
  estimatedMinutes: {
    quick: 2,
    full: 3,
  },
  status: 'available',
  heroFlameScenario: {
    material: 'pmma',
    oxygen_pct: 21.0,
    pressure_kpa: 101.3,
    airflow_cm_s: 5.0,
    gravity_g: 0.0,
  },
  nextChapterSlug: 'smoke-that-does-not-rise',
  epistemicCaveat:
    'Solid fuel burns in ISS microgravity (BASS-II). Airflow converted from fan settings via U = 1.0066 * AirDisplay.',
  takeaways: [
    'In dead-still space air, fire quickly starves itself because hot CO2 exhaust cannot rise away.',
    'A tiny breeze of just 1 to 5 cm/s sweeps exhaust away and sustains solid fuel burning.',
    'Lower oxygen requires faster airflow to prevent low-speed quenching extinction.',
  ],
  takeawayMessage:
    'Astronaut life support requires continuous air circulation to breathe, but that very ventilation provides the exact draft that allows spacecraft fires to burn in orbit.',
  limitsOfData: [
    'Tested solid fuels inside the Microgravity Science Glovebox were narrow flat strips (PMMA acrylic and cotton/fiberglass).',
    'Cabin pressure was maintained at standard ambient 101.3 kPa and not varied.',
    'Tested oxygen concentrations spanned 13.6% to 22.2%; exploration atmospheres above 22.2% were never tested in BASS-II.',
  ],
  glossary: [
    {
      term: 'Quenching Speed',
      pronunciation: 'KWENCH-ing speed',
      shortDefinition:
        'The critical minimum or maximum airflow speed beyond which a flame loses too much heat or oxygen and goes out.',
      plainAnalogy:
        'Like blowing too softly on a campfire so it suffocates, or blowing too hard so the breeze chills the flame cold.',
    },
    {
      term: 'Stagnant Microgravity',
      pronunciation: 'STAG-nuhnt my-kroh-GRAV-ih-tee',
      shortDefinition:
        'Orbital air with zero fan ventilation, where heat and mass transfer occur solely through molecular diffusion.',
      plainAnalogy:
        'A perfectly still room where neither air currents nor gravity can stir the air.',
    },
    {
      term: 'Concurrent Spread',
      pronunciation: 'kuhn-KUR-uhnt spread',
      shortDefinition:
        'Flame spreading in the exact same direction that the ventilation breeze is blowing.',
      plainAnalogy:
        'A grass fire racing downwind with the wind pushing heat ahead into fresh grass.',
    },
  ],
  beats: [
    // -------------------------------------------------------------------------
    // BEAT 1: HOOK / COLD OPEN
    // -------------------------------------------------------------------------
    {
      id: 'beat-01-hook',
      type: 'hook',
      act: 'coldOpen',
      truthTag: 'Illustration',
      title: 'The Suffocating Flame',
      subtitle: 'Why still air is a spacecraft fire’s worst enemy',
      levelText: {
        little: 'Still air starves space fire.',
        explorer:
          'On Earth, drafts blow fire out. In space, completely still air is what starves a flame.',
        scientist:
          'Without buoyant natural convection, combustion products accumulate at the fuel surface. The stagnant boundary layer inhibits oxygen diffusion, causing quiescent flame extinction.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'curious',
        speech: 'On Earth, blowing on a match puts it out. But in space, still air is what puts fire out!',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Dead air puts fire out',
        paragraphs: [
          'On Earth, blowing gently on a candle blows it out. But in orbit, completely still air starves fire because hot smoke cannot rise away from the fuel.',
        ],
        keyFact: 'Without gravity, hot combustion exhaust stays trapped right against the fuel surface.',
      },
      layer2: {
        headline: 'The Stagnant Boundary Layer',
        physicsExplanation: [
          'In zero gravity with zero ventilation, combustion generates carbon dioxide and water vapor that form a stagnant blanket around the flame front. Oxygen diffusion slows until the reaction starves.',
        ],
        scientificPrinciples: ['Diffusive Suffocation', 'Quiescent Extinction Limit'],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: 'BASS-II',
            runId: 'PSI-25-RUN-0001',
            citationLabel: 'NASA BASS-II Flight Archive',
            telemetryNote: 'Solid fuel strips extinguish in stagnant microgravity unless forced air provides replenishment.',
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-25 (BASS-II)',
        platform: 'ISS MSG (Microgravity Science Glovebox)',
        doiOrNtrs: 'NTRS-20210011385',
        quoteOrRow: 'The quenching speeds were found to be between 1 and 5 cm/s with higher speed in lower O2 atmosphere.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 2: PREDICT
    // -------------------------------------------------------------------------
    {
      id: 'beat-02-predict',
      type: 'predict',
      act: 'do',
      truthTag: 'Illustration',
      title: 'The Airflow Paradox',
      subtitle: 'What happens when ventilation shuts off?',
      levelText: {
        little: 'Will still air put fire out?',
        explorer:
          'Without ventilation fans, will a spacecraft fire spread or suffocate in its own exhaust?',
        scientist:
          'Evaluating solid fuel combustion in stagnant microgravity: does molecular diffusion suffice to sustain concurrent flame spread against conductive and radiative heat loss?',
      },
      modes: ['full'],
      avatar: {
        expression: 'thinking',
        speech: 'If a fire starts behind a locker and fans shut down, will it spread through the station?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Does space fire survive still air?',
        paragraphs: [
          'If a solid fuel catches fire inside the Microgravity Glovebox with ventilation fans turned off, will the flame grow, shrink, or extinguish?',
        ],
        keyFact: 'Without forced airflow, solid fuels cannot sustain combustion in microgravity.',
      },
      predictInteraction: {
        prompt: 'Predict the outcome of zero ventilation:',
        question: 'What happens to a solid fuel flame in completely stagnant zero-g air?',
        choices: [
          {
            id: 'extinguish',
            label: 'It suffocates and goes out on its own',
            shapePreview: 'flat',
            feedbackTitle: 'Correct: Quiescent Extinction!',
            feedbackText:
              'Without airflow, combustion products accumulate right at the surface, blocking incoming oxygen and extinguishing the flame.',
            isAccurate: true,
          },
          {
            id: 'grows',
            label: 'It spreads rapidly through the cabin',
            shapePreview: 'spark',
            feedbackTitle: 'No: Fire Requires Oxygen Flow',
            feedbackText:
              'Without buoyancy or fans, fresh oxygen cannot reach the burning surface fast enough to sustain combustion.',
            isAccurate: false,
          },
          {
            id: 'constant',
            label: 'It burns steadily forever',
            shapePreview: 'sphere',
            feedbackTitle: 'Diffusion Is Too Slow for Solids',
            feedbackText:
              'Solid fuels require higher reaction temperatures than isolated gas droplets and rapidly lose heat to the fuel base.',
            isAccurate: false,
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-25 (BASS-II)',
        platform: 'ISS MSG',
        doiOrNtrs: 'NTRS-20210011385',
        quoteOrRow: 'diffusion flames in microgravity are not affected by buoyancy-induced flow, thus providing a chance to study low-speed flame quenching',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 3: REVEAL / BREEZE
    // -------------------------------------------------------------------------
    {
      id: 'beat-03-reveal',
      type: 'reveal',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'A Whisper of Air',
      subtitle: 'Why 1 to 5 cm/s ventilation is the most dangerous breeze in space',
      levelText: {
        little: 'A gentle breeze feeds fire.',
        explorer:
          'A tiny breeze of just 1 to 5 cm/s removes suffocating exhaust and feeds oxygen to the flame.',
        scientist:
          'NASA BASS-II flight tests on ISS confirmed that low-speed forced ventilation between 1.0 and 5.0 cm/s sustains PMMA solid fuel combustion.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'surprised',
        speech: 'A breeze of just 2 cm/s is so faint you can barely feel it on your skin, but to a space fire, it is life support!',
      },
      avatarDock: 'left',
      layer1: {
        headline: 'A whisper of air sustains fire',
        paragraphs: [
          'NASA\'s BASS-II experiments proved that gentle airflow between 1.0 and 5.0 cm/s removes suffocating exhaust and feeds oxygen, allowing solid fuels like PMMA acrylic to burn.',
        ],
        keyFact: 'Airflow was converted from fan dial settings using U = 1.0066 * AirDisplay (basis tier: converted).',
      },
      revealInteraction: {
        title: 'Ventilation vs Extinction Regimes',
        instruction: 'Explore how airflow velocity alters flame persistence:',
        regimes: [
          {
            gravityG: 0.0,
            label: 'Quiescent (0.0 cm/s)',
            destinationName: 'Stagnant Zero-G',
            description: 'Flame suffocates within seconds as CO2 builds up and oxygen cannot penetrate.',
            flameShape: 'Dim dying halo',
            scenario: { material: 'pmma', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 0.0 },
          },
          {
            gravityG: 0.0,
            label: 'Quenching Boundary (2.0 cm/s)',
            destinationName: 'Low-Speed Critical Limit',
            description: 'Critical threshold where forced breeze barely balances radiative heat loss.',
            flameShape: 'Hemispherical blue edge',
            scenario: { material: 'pmma', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 2.01, gravity_g: 0.0 },
          },
          {
            gravityG: 0.0,
            label: 'Steady Flame (5.0 cm/s)',
            destinationName: 'Active Cabin Breeze',
            description: 'Standard cabin ventilation provides optimal oxygen delivery for steady flame spread.',
            flameShape: 'Tilted elongated dome',
            scenario: { material: 'pmma', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 5.03, gravity_g: 0.0 },
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-25 (BASS-II)',
        platform: 'ISS MSG',
        doiOrNtrs: 'NTRS-20210011385',
        quoteOrRow: 'The quenching speeds were found to be between 1 and 5 cm/s with higher speed in lower O2 atmosphere.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 4: DATA / BASS-II FLIGHT RUNS
    // -------------------------------------------------------------------------
    {
      id: 'beat-04-why',
      type: 'why',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'BASS-II Flight Boundaries',
      subtitle: 'Real solid fuel combustion data across tested oxygen and airflow',
      levelText: {
        little: 'More oxygen burns fire brighter.',
        explorer:
          'Lower oxygen requires faster forced airflow to avoid low-speed quenching extinction.',
        scientist:
          'BASS-II flammability envelope mapping across 13.6% to 22.2% O2. Lower oxygen concentration necessitates higher convective oxygen flux to overcome radiative heat loss.',
      },
      modes: ['full'],
      avatar: {
        expression: 'proud',
        speech: 'Notice how lower oxygen levels require faster air speeds just to keep the flame burning.',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Tested oxygen vs airflow',
        paragraphs: [
          'NASA tested 132 usable solid burns from 13.6% to 22.2% oxygen. Crews sometimes turned fans off, so flame cessation did not always occur on its own. Airflow alone does not decide the outcome.',
        ],
        keyFact: 'At 13.6% oxygen, fire quenches easily; at 22.2% oxygen, fire burns tenaciously.',
      },
      layer2: {
        headline: 'Concurrent Flame Spread Boundary',
        physicsExplanation: [
          'Solid fuels spread concurrently with the forced breeze. Airflow was converted via U = 1.0066 * AirDisplay. When oxygen drops, the chemical reaction slows, requiring higher convective oxygen flux to survive radiative heat losses.',
        ],
        scientificPrinciples: ['Low-Speed Quenching Extinction', 'Concurrent Flame Spread'],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: 'BASS-II',
            runId: 'PSI-25-RUN-0001',
            citationLabel: 'NASA PSI-25 / MSG Archive',
            telemetryNote: 'Measured flammability outcomes across PMMA film thickness, oxygen fraction, and ventilation velocity.',
          },
        ],
      },
      layer3: {
        headline: 'BASS-II Solid Fuel Runs (Oxygen % vs Airflow cm/s)',
        chartDescription:
          'Flight burn records from the Microgravity Science Glovebox (PSI-25) showing forced airflow speeds and oxygen concentrations.',
        xAxisKey: 'oxygen_pct',
        dataKeys: [
          {
            key: 'flow_cm_s',
            label: 'Airflow Speed (cm/s)',
            color: '#38bdf8',
            unit: 'cm/s',
          },
        ],
        data: [
          { oxygen_pct: '21.0', flow_cm_s: 3.02, runId: 'PSI-25-RUN-0006', fuel: 'PMMA' },
          { oxygen_pct: '22.2', flow_cm_s: 2.01, runId: 'PSI-25-RUN-0003', fuel: 'PMMA' },
          { oxygen_pct: '22.2', flow_cm_s: 5.03, runId: 'PSI-25-RUN-0001', fuel: 'PMMA' },
          { oxygen_pct: '22.2', flow_cm_s: 5.03, runId: 'PSI-25-RUN-0004', fuel: 'PMMA' },
          { oxygen_pct: '22.2', flow_cm_s: 2.01, runId: 'PSI-25-RUN-0007', fuel: 'PMMA' },
        ],
        sourceExperimentId: 'BASS-II',
        sourceRunId: 'PSI-25-RUN-0001',
        citationLabel: 'NASA PSI-25 Experimental Table',
      },
      provenance: {
        datasetId: 'PSI-25 (BASS-II)',
        platform: 'ISS MSG',
        runId: 'PSI-25-RUN-0001',
        doiOrNtrs: '10.60555/4qc4-de67',
        quoteOrRow: 'Run PSI-25-RUN-0001: 100 micron PMMA, 22.2% O2, 5.03 cm/s flow ignited and recorded frames (CSV row 2).',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 5: TAKEAWAY
    // -------------------------------------------------------------------------
    {
      id: 'beat-05-takeaway',
      type: 'takeaway',
      act: 'takeaway',
      truthTag: 'From NASA flight tests',
      title: 'The Ventilation Double-Edged Sword',
      subtitle: 'Why ventilation control is the primary fire safety countermeasure',
      levelText: {
        little: 'Fans feed space fire.',
        explorer:
          'Astronaut life support requires air circulation, but that very breeze provides the draft that sustains fire.',
        scientist:
          'Ventilation isolation is the primary automated spacecraft fire countermeasure, starving the reaction without requiring cabin depressurization.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'serious',
        speech: 'Shutting down ventilation fans is always the first automatic command when a spacecraft fire alarm sounds!',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Cabin air is a double-edged sword',
        paragraphs: [
          'Astronaut life support requires continuous air circulation to breathe, but that very ventilation provides the exact draft that allows spacecraft fires to burn in orbit.',
        ],
        keyFact: 'Isolating ventilation starves fire without having to dump cabin pressure.',
      },
      provenance: {
        datasetId: 'PSI-25 (BASS-II)',
        platform: 'ISS MSG',
        doiOrNtrs: 'NTRS-20210011385',
        quoteOrRow: 'Transition from solid diffusion flame spreading to quenching extinction is a slow heat loss process',
      },
    },
  ],
};
