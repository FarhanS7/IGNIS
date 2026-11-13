/**
 * Story Mode - Chapter 3: "Smoke that does not rise"
 *
 * Grounded in NASA SAME-R flight smoke sensor response dataset (PSI-101 / NTRS-20210011385).
 * Epistemic caveat: "Trained on Earth-gravity data. Not validated in microgravity."
 */

import type { Chapter } from '../types.ts';

export const chapter3: Chapter = {
  id: 'chapter-03',
  slug: 'smoke-that-does-not-rise',
  number: 3,
  title: 'Smoke that does not rise',
  subtitle: 'Why spacecraft smoke detectors cannot rely on smoke floating to the ceiling',
  summary:
    'On Earth, hot smoke rushes toward the ceiling. In orbital microgravity, smoke has no buoyant upward drive and stays where it was born until ventilation fans carry it.',
  estimatedMinutes: {
    quick: 2,
    full: 3,
  },
  status: 'available',
  heroFlameScenario: {
    material: 'thin_solid',
    oxygen_pct: 21.0,
    pressure_kpa: 101.3,
    airflow_cm_s: 0.0,
    gravity_g: 0.0,
  },
  nextChapterSlug: 'what-nasa-has-not-tested',
  takeaways: [
    'In orbit, smoke lacks buoyant lift and hovers around overheated wires until cabin fans move it.',
    'Overheated spacecraft insulation like Kapton produces tiny sub-micron smoke particles that optical sensors can miss.',
    'Spacecraft fire safety relies on duct detectors embedded directly into ventilation return lines.',
  ],
  takeawayMessage:
    'Without buoyancy to lift hot gases, spacecraft smoke alarms cannot sit on the ceiling. They must be coupled directly to ventilation return ducts to catch smoldering fires.',
  limitsOfData: [
    'SAME-R tested overheated aerospace polymers in orbital microgravity aboard the Space Station.',
    'Published dataset contains 104 valid microgravity records out of 130 planned flight matrix conditions.',
  ],
  glossary: [
    {
      term: 'Sensor Ratio (Rt/R0)',
      pronunciation: 'SEN-ser RAY-shee-oh',
      shortDefinition:
        'The ratio of smoke detector resistance during a test (Rt) compared to baseline clean air resistance (R0).',
      plainAnalogy:
        'Like measuring how much fog dims a flashlight beam compared to shining it through crystal clear air.',
    },
    {
      term: 'Kapton Insulation',
      pronunciation: 'KAP-tahn in-suh-LAY-shun',
      shortDefinition:
        'A high-performance polyimide plastic film widely used to insulate electrical wiring in spacecraft.',
      plainAnalogy:
        'Tough, gold-colored heat-resistant tape wrapped around thousands of meters of spacecraft wiring.',
    },
    {
      term: 'Duct Detector',
      pronunciation: 'DUHKT dih-TEK-ter',
      shortDefinition:
        'A smoke detection sensor installed directly inside an air conditioning return duct rather than in the open cabin.',
      plainAnalogy:
        'Placing a smoke sensor right at the vacuum cleaner exhaust so no drifting particle escapes unnoticed.',
    },
  ],
  beats: [
    // -------------------------------------------------------------------------
    // BEAT 1: HOOK (26 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-01-hook',
      type: 'hook',
      act: 'coldOpen',
      truthTag: 'Illustration',
      title: 'Where Is the Ceiling?',
      subtitle: 'Why smoke detectors on space station walls do not work',
      levelText: {
        little: 'Smoke does not rise up.',
        explorer:
          'Without gravity, hot smoke cannot rise to the ceiling. It hovers right where it started.',
        scientist:
          'The absence of gravitational buoyancy eliminates natural convective plumes. Combustion aerosol expands solely via molecular diffusion and forced cabin ventilation.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'curious',
        speech: 'On Earth, every home smoke detector is screwed to the ceiling. But on a space station, where is the ceiling?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'No buoyancy means no rising smoke',
        paragraphs: [
          'On Earth, smoke alarms are mounted on ceilings because buoyant hot gases rise. In orbit, there is no buoyancy: smoke stays exactly where it was born.',
        ],
        keyFact: 'Without gravity, smoke forms an expanding cloud that lingers around smoldering components.',
      },
      layer2: {
        headline: 'Elimination of Buoyant Plumes',
        physicsExplanation: [
          'Smoke rises on Earth because combustion gases are hotter and less dense than the surrounding air. In orbital freefall, there is no gravitational force to separate fluids by density.',
        ],
        scientificPrinciples: ['Absence of Buoyant Plume Transport', 'Quiescent Aerosol Agglomeration'],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: 'SAME-R',
            runId: 'SAME-R-101',
            citationLabel: 'NASA SAME-R Flight Archive',
            telemetryNote: 'Microgravity smoke stays localized around overheating wire samples without buoyant vertical escape.',
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-101 (SAME-R)',
        platform: 'International Space Station (ISS)',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'Figure 7 presents the smoke concentrations at the FFD and the response of a terrestrial ionization detector.',
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
      title: 'Detecting Hidden Smoke',
      subtitle: 'Where would you place sensors to protect astronauts?',
      levelText: {
        little: 'Put sensors in air vents.',
        explorer:
          'Because smoke does not rise, alarms must sit directly inside ventilation ducts where air is pulled.',
        scientist:
          'Without vertical buoyant transport, ceiling-mounted detection fails. Smoke detection relies on active ventilation return lines drawing aerosol across duct sensors.',
      },
      modes: ['full'],
      avatar: {
        expression: 'thinking',
        speech: 'If an electrical wire begins smoldering behind a science rack, how will the alarm notice?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Where should smoke detectors go?',
        paragraphs: [
          'If electrical wiring behind an equipment rack begins smoldering, where should spacecraft engineers place sensors to detect the fire earliest?',
        ],
        keyFact: 'Forced ventilation return lines are the only reliable conduits carrying smoke in orbit.',
      },
      predictInteraction: {
        prompt: 'Choose the optimal sensor location:',
        question: 'How do you detect smoke in microgravity without buoyant plumes?',
        choices: [
          {
            id: 'ducts',
            label: 'Inside ventilation return ducts',
            shapePreview: 'flat',
            feedbackTitle: 'Correct: Duct-Mounted Detection!',
            feedbackText:
              'Spacecraft ventilation fans pull air from every equipment bay into return ducts, ensuring smoke passes directly through the sensors.',
            isAccurate: true,
          },
          {
            id: 'ceiling',
            label: 'On the highest module ceiling',
            shapePreview: 'teardrop',
            feedbackTitle: 'Ceiling Alarms Fail in Space',
            feedbackText:
              'Smoke does not rise in microgravity. A fire can smolder indefinitely without smoke ever reaching an open-cabin ceiling.',
            isAccurate: false,
          },
          {
            id: 'floor',
            label: 'On the deck plates near the floor',
            shapePreview: 'spark',
            feedbackTitle: 'Smoke Floats Without Sinking',
            feedbackText:
              'Without gravity, smoke neither falls nor rises; it merely drifts with the prevailing forced breeze.',
            isAccurate: false,
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-101 (SAME-R)',
        platform: 'Space Shuttle & ISS',
        doiOrNtrs: 'NTRS-20210011385',
        quoteOrRow: 'We present data from both downward experiments and microgravity experiments for the same fuel',
        caveat: 'Trained on Earth-gravity data. Not validated in microgravity.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 3: REVEAL / MATERIALS (24 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-03-reveal',
      type: 'reveal',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'The Space Materials Problem',
      subtitle: 'Overheated wire insulation behaves unlike terrestrial wood smoke',
      levelText: {
        little: 'Different wires make different smoke.',
        explorer:
          'Overheated spacecraft wiring like Kapton releases ultra-fine sub-micron particles that standard optical sensors struggle to detect.',
        scientist:
          'Pyrolysis of high-performance spacecraft polymers generates distinct aerosol distributions. Kapton insulation yields fine sub-micron particles requiring ionization or dual-wavelength detection.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'surprised',
        speech: 'Kapton wire smoke produces tiny sub-micron particles that standard optical smoke alarms can barely see!',
      },
      avatarDock: 'left',
      layer1: {
        headline: 'Wire smoke looks different',
        paragraphs: [
          'Spacecraft wires use high-temperature insulation like Kapton, Teflon, and Silicone. When overheated, they release tiny sub-micron smoke particles that Earth optical detectors can easily miss.',
        ],
        keyFact: 'Trained on Earth-gravity data. Not validated in microgravity.',
      },
      revealInteraction: {
        title: 'Spacecraft Material Smoke Properties',
        instruction: 'Compare sensor response ratios across common aerospace materials:',
        regimes: [
          {
            gravityG: 0.0,
            label: 'Kapton Wire Insulation',
            destinationName: 'Polyimide Wiring',
            description: 'Overheated Kapton yields an Rt/R0 sensor ratio of 1.48 with ultra-fine aerosol particles.',
            flameShape: 'Sub-micron smoke cloud',
            scenario: { material: 'thin_solid', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 0.0 },
          },
          {
            gravityG: 0.0,
            label: 'Teflon Wire Sleeving',
            destinationName: 'PTFE Fluoropolymer',
            description: 'Thermal decomposition produces high particulate counts with a sensor response ratio of 1.45.',
            flameShape: 'Dense fluoropolymer aerosol',
            scenario: { material: 'composite', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 0.0 },
          },
          {
            gravityG: 0.0,
            label: 'Silicone Rubber Seals',
            destinationName: 'Elastomeric Gaskets',
            description: 'Overheated silicone releases larger silica particulate chains with a sensor ratio of 1.35.',
            flameShape: 'Silica agglomerate cloud',
            scenario: { material: 'other', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 1.0, gravity_g: 0.0 },
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-101 (SAME-R)',
        platform: 'International Space Station (ISS)',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'SAME-R flight sensor tests across Kapton, Silicone, and Teflon wiring insulation',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 4: DATA / SAME-R TELEMETRY (29 words)
    // -------------------------------------------------------------------------
    {
      id: 'beat-04-why',
      type: 'why',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'SAME-R Flight Telemetry',
      subtitle: 'Real sensor response ratios (Rt/R0) measured aboard the Space Station',
      levelText: {
        little: 'NASA tested 104 space smokes.',
        explorer:
          'NASA tested 104 flight runs across Kapton, Teflon, and Silicone to measure how smoke detector resistance changes in orbit.',
        scientist:
          'SAME-R flight investigation on ISS quantified ionization sensor response ratios (Rt/R0). Kapton produced a ratio of 1.48 at 0 cm/s flow across aging times up to 60s.',
      },
      modes: ['full'],
      avatar: {
        expression: 'proud',
        speech: 'Every dot represents an overheated aerospace material tested in microgravity aboard the Space Station.',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Real flight sensor responses',
        paragraphs: [
          'NASA\'s SAME-R experiment tested ionization and optical sensor response ratios across 104 flight tests. Overheated Kapton yielded a sensor ratio Rt/R0 of 1.48 at 0 cm/s inlet velocity.',
        ],
        keyFact: 'Sensor ratio Rt/R0 measures electrical resistance change when smoke particles enter the detector.',
      },
      layer2: {
        headline: 'Aerosol Aging in Quiescent Air',
        physicsExplanation: [
          'Without gravity to induce settling, smoke particles stay suspended longer and collide through Brownian motion, gradually growing in particle size over net aging times up to 60 seconds.',
        ],
        scientificPrinciples: ['Brownian Particle Coagulation', 'Ionization Chamber Recombination'],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: 'SAME-R',
            runId: 'SAME-R-101',
            citationLabel: 'NASA PSI-101 Experimental Table',
            telemetryNote: 'Measured sensor response ratio Rt/R0 across overheated aerospace polymers at 0.0 and 1.0 cm/s flow.',
          },
        ],
      },
      layer3: {
        headline: 'SAME-R Sensor Response Ratio (Rt/R0) by Material',
        chartDescription:
          'Smoke detector resistance response (Rt/R0) differs significantly across spacecraft materials. Tested on the International Space Station (104 valid microgravity run records with complete sensor response data out of 130 planned flight matrix conditions).',
        xAxisKey: 'material',
        dataKeys: [
          {
            key: 'ratio',
            label: 'Sensor Ratio (Rt/R0)',
            color: '#38bdf8',
            unit: 'ratio',
          },
        ],
        data: [
          { material: 'Pyrell Foam', ratio: 1.23, testId: 'SAME-R-107', csvRow: 108 },
          { material: 'Lampwick', ratio: 1.28, testId: 'SAME-R-106', csvRow: 70 },
          { material: 'Silicone', ratio: 1.35, testId: 'SAME-R-103', csvRow: 48 },
          { material: 'Teflon', ratio: 1.45, testId: 'SAME-R-100', csvRow: 86 },
          { material: 'Kapton', ratio: 1.48, testId: 'SAME-R-101', csvRow: 24 },
        ],
        sourceExperimentId: 'SAME-R',
        sourceRunId: 'SAME-R-101',
        citationLabel: 'PSI-101_Experimental table_SAME-R.csv',
      },
      provenance: {
        datasetId: 'PSI-101 (SAME-R)',
        platform: 'International Space Station (ISS)',
        runId: 'SAME-R-101',
        doiOrNtrs: 'NTRS-20240002981',
        quoteOrRow: 'Figure 7 presents the smoke concentrations at the FFD and the response of a terrestrial ionization detector.',
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
      title: 'The Duct Detection Strategy',
      subtitle: 'How spacecraft design overcomes zero-gravity smoke stagnation',
      levelText: {
        little: 'Air vents catch space smoke.',
        explorer:
          'Spacecraft fire safety couples detectors to ventilation ducts because fans are the only way smoke travels in space.',
        scientist:
          'Duct-embedded multi-parameter detection is the primary defense against smoldering electrical fires in forced-convection microgravity environments.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'serious',
        speech: 'Smoke in space only travels where ventilation fans guide it. Good airflow design is what saves lives.',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Fans are the fire sensors\' eyes',
        paragraphs: [
          'Spacecraft fire safety couples smoke detectors directly to ventilation return ducts. If cabin fans fail, smoke remains invisible until it spreads throughout the module.',
        ],
        keyFact: 'Modern space fire defense uses multi-wavelength optical and carbon monoxide sensors together.',
      },
      provenance: {
        datasetId: 'PSI-101 (SAME-R)',
        platform: 'Space Shuttle & ISS',
        doiOrNtrs: 'NTRS-20210011385',
        quoteOrRow: 'Flame spread is determined by the competing physics at the flame leading edge.',
        caveat: 'Trained on Earth-gravity data. Not validated in microgravity.',
      },
    },
  ],
};
