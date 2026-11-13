/**
 * Story Mode - Chapter 1: "Why fire is round in space"
 *
 * Grounded in NASA FLEX flight droplet combustion dataset (PSI-69 / NTRS-20130014061).
 * Epistemic caveat: "Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels."
 */

import type { Chapter } from '../types.ts';

export const chapter1: Chapter = {
  id: 'chapter-01',
  slug: 'why-is-fire-round-in-space',
  number: 1,
  title: 'Why fire is round in space',
  subtitle: 'How orbital freefall turns wild teardrop flames into serene glowing spheres',
  summary:
    'On Earth, gravity creates buoyant updrafts that shape candle flames into flickering teardrops. In orbital microgravity, fire spreads equally in all directions, forming a quiet blue sphere.',
  estimatedMinutes: {
    quick: 2,
    full: 3,
  },
  status: 'available',
  heroFlameScenario: {
    material: 'droplet_fuel',
    oxygen_pct: 21.0,
    pressure_kpa: 101.3,
    airflow_cm_s: 0.0,
    gravity_g: 0.0,
  },
  nextChapterSlug: 'same-fire-different-air',
  epistemicCaveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
  takeaways: [
    'On Earth, gravity pulls dense cold air down, pushing lighter hot gases up into a flickering teardrop.',
    'In orbital freefall, buoyancy vanishes completely, so oxygen diffuses into the flame equally from all directions.',
    'Without buoyant chimney drafts, orbital flames burn slower, cooler, and form serene blue spheres.',
  ],
  takeawayMessage:
    'Without gravity pulling cold air down, hot air cannot rise. Fire in orbit spreads equally in all directions — turning into a perfect sphere governed by pure molecular diffusion.',
  limitsOfData: [
    'Flight tests were conducted inside sealed microgravity chambers (ISS CIR Combustion Integrated Rack).',
    'Droplet combustion physics (FLEX) applies to isolated fuel droplets; spacecraft wiring harnesses behave with 3D structural melting.',
    'Lunar (0.16g) and Martian (0.38g) partial buoyancy values are extrapolated from parabolic flights and drop towers.',
  ],
  glossary: [
    {
      term: 'Buoyancy',
      pronunciation: 'BOY-un-see',
      shortDefinition:
        'The upward force exerted by a denser fluid pushing a lighter fluid out of the way.',
      plainAnalogy:
        'Like trying to push a beach ball underwater — the heavier water pushes down, forcing the lightweight ball up.',
    },
    {
      term: 'Molecular Diffusion',
      pronunciation: 'dih-FYOO-zhun',
      shortDefinition:
        'The slow, random bouncing of individual gas molecules from areas of high concentration to low concentration.',
      plainAnalogy:
        'A single drop of blue dye gently spreading outward in a still glass of water.',
    },
    {
      term: 'Microgravity',
      pronunciation: 'MY-kroh-GRAV-ih-tee',
      shortDefinition:
        'A continuous freefall state in orbit where the net physical effects of gravity appear to vanish.',
      plainAnalogy:
        'Like riding in an elevator whose cables snapped — you and everything around you fall at the exact same rate.',
    },
  ],
  beats: [
    // -------------------------------------------------------------------------
    // BEAT 1: COLD OPEN (Hook)
    // -------------------------------------------------------------------------
    {
      id: 'beat-01-cold-open',
      type: 'hook',
      act: 'coldOpen',
      truthTag: 'Illustration',
      title: 'Why Fire is Round in Space',
      subtitle: 'Every campfire you have ever seen points up — except in space',
      levelText: {
        little: 'Fire is round in space.',
        explorer:
          'On Earth, campfire flames stretch upward. In space, fire blossoms into a calm blue sphere.',
        scientist:
          'Buoyancy-driven natural convection is eliminated in orbital microgravity. Without buoyant chimney drafts, combustion transport transitions entirely to symmetric molecular diffusion.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'curious',
        speech: 'Every fire on Earth has a top and a bottom. But what happens when you turn off gravity?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'Every flame on Earth points up',
        paragraphs: [
          'On Earth, campfires stretch into flickering teardrops. In orbital microgravity, flames blossom into calm, spherical blue balls.',
        ],
        keyFact: 'Flames only stretch upward because Earth gravity pulls cold air down.',
      },
      layer2: {
        headline: 'Natural Convection vs Orbital Freefall',
        physicsExplanation: [
          'Earth gravity pulls colder, denser air downward. This forces hot combustion products to rise, creating a continuous upward chimney draft that stretches the flame into a teardrop.',
        ],
        scientificPrinciples: ['Archimedes Buoyancy Principle', 'Density-Driven Natural Convection'],
        evidenceRefs: [
          {
            type: 'simplified',
            experimentId: 'FLEX-1',
            runId: 'PSI-69-RUN-0001',
            citationLabel: 'NASA PSI-69 / CIR Archive',
            simplificationNote: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-69 (FLEX)',
        platform: 'ISS CIR (Combustion Integrated Rack)',
        doiOrNtrs: 'NTRS-20130014061',
        quoteOrRow:
          'The digital images yielded droplet and flame diameters as functions of time and subsequently droplet burning rate, flame standoff ratio, and initial and extinction droplet diameters.',
        caveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 2: WONDER (Check)
    // -------------------------------------------------------------------------
    {
      id: 'beat-02-wonder',
      type: 'check',
      act: 'wonder',
      truthTag: 'Illustration',
      title: 'The Gravity Chimney',
      subtitle: 'Why does campfire smoke and fire rise on Earth?',
      levelText: {
        little: 'Why does Earth fire point up?',
        explorer:
          'Heavy cold air falls down, pushing light hot air up into a flickering teardrop flame.',
        scientist:
          'Archimedes buoyancy creates a density-driven updraft on Earth. Heated combustion products accelerate upward, elongating the reaction zone into a flickering teardrop.',
      },
      modes: ['full'],
      avatar: {
        expression: 'thinking',
        speech: 'Think about a campfire. If heavy air did not sink, where would hot air go?',
      },
      avatarDock: 'left',
      layer1: {
        headline: 'Gravity creates a natural chimney',
        paragraphs: [
          'Heavy cold air sinks under gravity, forcing lighter hot air upward into a chimney draft that stretches the flame.',
        ],
        keyFact: 'Without gravity pulling cold air down, hot air has nowhere to rise.',
      },
      layer2: {
        headline: 'Density-Driven Convection',
        physicsExplanation: [
          'Archimedes buoyancy forces colder, denser air downward, driving lighter hot gases upward into a natural chimney draft.',
        ],
        scientificPrinciples: ['Archimedes Principle', 'Natural Convection'],
        evidenceRefs: [],
      },
      checkInteraction: {
        question: 'Why does a candle flame always stretch upward on Earth?',
        choices: [
          {
            id: 'buoyancy_cold_air',
            label: 'Heavier cold air sinks, forcing lighter hot gases upward',
            isCorrect: true,
            explanation:
              'Gravity pulls denser cold air downward, displacing hot combustion gases upward into a chimney draft.',
          },
          {
            id: 'wind_in_room',
            label: 'Indoor ventilation fans blow the flame straight up',
            isCorrect: false,
            explanation:
              'Even in perfectly still air, density differences create their own upward buoyant draft.',
          },
          {
            id: 'oxygen_magnetic',
            label: 'Oxygen molecules are pulled by Earth magnetic field',
            isCorrect: false,
            explanation:
              'Atmospheric buoyancy is purely density-driven under gravity, not magnetic.',
          },
        ],
        deeperContext:
          'This chimney draft feeds oxygen into the flame at meters per second on Earth.',
      },
      provenance: {
        datasetId: 'PSI-69 (FLEX)',
        platform: 'ISS CIR',
        doiOrNtrs: 'NTRS-20130014061',
        quoteOrRow:
          'The initial droplet size varied between approximately 1.5 mm and 4 mm to capture both diffusive extinction brought about by insufficient residence time at the flame and radiative extinction',
        caveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 3: PREDICT (Hypothesis)
    // -------------------------------------------------------------------------
    {
      id: 'beat-03-predict',
      type: 'predict',
      act: 'do',
      truthTag: 'Illustration',
      title: 'What Happens in Orbit?',
      subtitle: 'Lock in your hypothesis before dialling down the gravity',
      levelText: {
        little: 'What shape will space fire make?',
        explorer:
          'Without gravity pulling air down, fire spreads equally in all directions into a glowing sphere.',
        scientist:
          'Hypothesize flame geometry under zero-g: when the Grashof number approaches zero, molecular diffusion balances isotropically, forming a spherical reaction front.',
      },
      modes: ['full'],
      avatar: {
        expression: 'thinking',
        speech: 'Think about how air moves without gravity. If there is no buoyant draft, where can oxygen go?',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'What shape does fire make in zero-g?',
        paragraphs: [
          'Imagine lighting a flame inside the Space Station. Without gravity pulling heavy air downward, what shape will it take?',
        ],
        keyFact: 'Without buoyant chimney updrafts, physical symmetry takes over the flame front.',
      },
      layer2: {
        headline: 'Symmetrical Reaction Front',
        physicsExplanation: [
          'When natural convection is removed, transport of oxygen and fuel vapor is governed entirely by isotropic molecular diffusion.',
        ],
        scientificPrinciples: ['Isotropic Diffusion', 'Reaction Front Symmetry'],
        evidenceRefs: [],
      },
      predictInteraction: {
        prompt: 'Formulate your hypothesis on flame geometry:',
        question: 'What shape does fire take when buoyant convection disappears?',
        choices: [
          {
            id: 'sphere',
            label: 'A spherical glowing ball',
            shapePreview: 'sphere',
            feedbackTitle: 'Hypothesis Confirmed: Perfect Symmetry!',
            feedbackText:
              'Without gravity-driven updrafts, oxygen diffuses into the reaction zone equally from all directions, creating a smooth spherical flame front.',
            isAccurate: true,
          },
          {
            id: 'teardrop',
            label: 'A taller, narrower teardrop',
            shapePreview: 'teardrop',
            feedbackTitle: 'Not in Orbit!',
            feedbackText:
              'Teardrops require gravity pulling dense cold air downward to force hot air up. In freefall, hot air has nowhere to rise.',
            isAccurate: false,
          },
          {
            id: 'flat',
            label: 'A flat pancake on the surface',
            shapePreview: 'flat',
            feedbackTitle: 'Close, but Symmetrical!',
            feedbackText:
              'Forced winds can flatten flames against surfaces, but in quiescent orbital air, molecular diffusion expands equally in 3D.',
            isAccurate: false,
          },
          {
            id: 'spark',
            label: 'Instant explosive flash',
            shapePreview: 'spark',
            feedbackTitle: 'Explosions Require High Confinement',
            feedbackText:
              'Freefall fire is actually much calmer and slower than on Earth because oxygen only arrives via gentle molecular diffusion.',
            isAccurate: false,
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-69 (FLEX)',
        platform: 'ISS CIR',
        doiOrNtrs: 'NTRS-20130014061',
        quoteOrRow:
          'both freely floated and tethered droplets were ignited using symmetrically opposed hot-wire igniters and the burning histories were recorded',
        caveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 4: DO (Gravity Morph)
    // -------------------------------------------------------------------------
    {
      id: 'beat-04-do',
      type: 'reveal',
      act: 'do',
      truthTag: 'Illustration',
      title: 'Watch Gravity Vanish',
      subtitle: 'Dial the gravity field from Earth normal to orbital freefall',
      levelText: {
        little: 'Dial down gravity. Watch it round!',
        explorer:
          'Slide from Earth gravity to orbit. Watch buoyant updrafts vanish as the flame becomes spherical.',
        scientist:
          'Scale gravity from 1.0g to 0.0g to observe the diminution of buoyant velocity and the transition from convective soot emission to blue gas chemiluminescence.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'surprised',
        speech: 'Watch the teardrop relax as you dial down gravity! Notice how the bright yellow soot disappears.',
      },
      avatarDock: 'left',
      layer1: {
        headline: 'Watch gravity vanish',
        paragraphs: [
          'Scroll or drag the slider to lower gravity from Earth normal (1g) to orbital freefall (0g). Watch buoyant updrafts disappear as the flame rounds out.',
        ],
        keyFact: 'Sooth-yellow color comes from hot buoyant soot; orbital blue comes from clean gas chemiluminescence.',
      },
      layer2: {
        headline: 'Partial Gravity and Buoyancy Transition',
        physicsExplanation: [
          'As gravity scales from 1.0g down to 0.0g, buoyant velocity diminishes following the Grashof number, transitioning flame transport from buoyant to molecular diffusion.',
        ],
        scientificPrinciples: ['Grashof Number Scaling', 'Buoyancy Velocity Diminution'],
        evidenceRefs: [],
      },
      revealInteraction: {
        title: 'Planetary Gravity Morph',
        instruction: 'Drag the slider across Moon, Mars, and orbital regimes:',
        regimes: [
          {
            gravityG: 1.0,
            label: 'Earth (1.00g)',
            destinationName: 'Earth Sea Level',
            description: 'Vigorous buoyant convection stretching flame upward into a flickering yellow teardrop.',
            flameShape: 'Elongated flickering teardrop',
            scenario: { material: 'droplet_fuel', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 1.0 },
          },
          {
            gravityG: 0.38,
            label: 'Mars (0.38g)',
            destinationName: 'Martian Outpost',
            description: 'Partial buoyancy produces a widened, rounded teardrop with diminished flickering.',
            flameShape: 'Widened dome teardrop',
            scenario: { material: 'droplet_fuel', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 0.38 },
          },
          {
            gravityG: 0.16,
            label: 'Moon (0.16g)',
            destinationName: 'Lunar Gateway / Base',
            description: 'Near-spherical dome with low soot production and pale blue luminescence.',
            flameShape: 'Hemispherical blue dome',
            scenario: { material: 'droplet_fuel', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 0.16 },
          },
          {
            gravityG: 0.0,
            label: 'Orbit (0.00g)',
            destinationName: 'International Space Station',
            description: 'Pure molecular diffusion creates a perfect spherical blue flame without flickering.',
            flameShape: 'Perfect glowing blue sphere',
            scenario: { material: 'droplet_fuel', oxygen_pct: 21.0, pressure_kpa: 101.3, airflow_cm_s: 0.0, gravity_g: 0.0 },
          },
        ],
      },
      provenance: {
        datasetId: 'PSI-69 (FLEX)',
        platform: 'ISS CIR',
        doiOrNtrs: 'NTRS-20130014061',
        quoteOrRow:
          'The digital images yielded droplet and flame diameters as functions of time and subsequently droplet burning rate, flame standoff ratio, and initial and extinction droplet diameters.',
        caveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 5: REVEAL (Real NASA Flight Droplets)
    // -------------------------------------------------------------------------
    {
      id: 'beat-05-reveal',
      type: 'why',
      act: 'reveal',
      truthTag: 'From NASA flight tests',
      title: 'Droplet Size and Burn Duration',
      subtitle: 'Verified droplet combustion measurements from the Space Station CIR',
      levelText: {
        little: 'Bigger fuel drops burn much longer!',
        explorer:
          'NASA tested 233 droplets on the Space Station. Larger droplets take quadratically longer to burn.',
        scientist:
          'ISS CIR FLEX flight records confirm droplet burning follows the d-squared evaporation law across 233 microgravity burns, governed by spherical diffusive transport.',
      },
      modes: ['full'],
      avatar: {
        expression: 'proud',
        speech: 'Every dot in this chart is an actual fuel droplet ignited aboard the International Space Station!',
      },
      avatarDock: 'right',
      dropletRuns: [
        {
          runId: 'PSI-69-RUN-0003',
          testNumber: 3,
          fuel: 'Methanol',
          initialDiameterMm: 1.61,
          durationSec: 3.2,
          csvRow: 4,
        },
        {
          runId: 'PSI-69-RUN-0001',
          testNumber: 1,
          fuel: 'Methanol',
          initialDiameterMm: 1.69,
          durationSec: 4.3,
          csvRow: 2,
        },
        {
          runId: 'PSI-69-RUN-0006',
          testNumber: 6,
          fuel: 'Methanol',
          initialDiameterMm: 2.54,
          durationSec: 9.6,
          csvRow: 7,
        },
        {
          runId: 'PSI-69-RUN-0226',
          testNumber: 226,
          fuel: 'Methanol',
          initialDiameterMm: 2.79,
          durationSec: 12.5,
          csvRow: 227,
        },
      ],
      layer1: {
        headline: 'Droplet diameter governs burn duration',
        paragraphs: [
          'NASA tested 233 fuel droplets in orbit. Across all tests, initial droplet diameter directly governed how long the spherical flame burned.',
        ],
        keyFact: 'Droplet burning follows the d-squared law: larger droplets take quadratically longer to burn.',
      },
      layer2: {
        headline: 'Symmetrical Molecular Diffusion',
        physicsExplanation: [
          'In microgravity, fuel vapor radiates outward in a spherical shell, while ambient oxygen diffuses inward. The reaction front stabilizes where the stoichiometric ratio balances.',
        ],
        scientificPrinciples: ['Fick’s Law of Molecular Diffusion', 'D-squared Evaporation Law'],
        evidenceRefs: [
          {
            type: 'simplified',
            experimentId: 'FLEX-1',
            runId: 'PSI-69-RUN-0001',
            citationLabel: 'FLEX / NTRS-20130014061',
            simplificationNote: 'Measured burning rate constant across 233 flight droplet runs.',
          },
        ],
      },
      layer3: {
        headline: 'FLEX Droplet Diameter vs Burn Duration',
        chartDescription:
          'Real NASA flight records from the Combustion Integrated Rack (PSI-69) showing burn duration across initial droplet sizes.',
        xAxisKey: 'diameter_mm',
        dataKeys: [
          {
            key: 'burn_time_s',
            label: 'Burn Duration (s)',
            color: '#38bdf8',
            unit: 's',
          },
        ],
        data: [
          { diameter_mm: '1.61', burn_time_s: 3.2, runId: 'PSI-69-RUN-0003' },
          { diameter_mm: '1.69', burn_time_s: 4.3, runId: 'PSI-69-RUN-0001' },
          { diameter_mm: '2.54', burn_time_s: 9.6, runId: 'PSI-69-RUN-0006' },
          { diameter_mm: '2.79', burn_time_s: 12.5, runId: 'PSI-69-RUN-0226' },
          { diameter_mm: '3.86', burn_time_s: 13.6, runId: 'PSI-69-RUN-0010' },
        ],
        sourceExperimentId: 'FLEX-1',
        sourceRunId: 'PSI-69-RUN-0001',
        citationLabel: 'NASA PSI-69 Experimental Table',
      },
      provenance: {
        datasetId: 'PSI-69 (FLEX)',
        platform: 'ISS CIR',
        runId: 'PSI-69-RUN-0001',
        doiOrNtrs: '10.60555/flex-iss-cir',
        quoteOrRow: 'Test #1 Methanol 1.69mm initial diameter burned for 4.3s in microgravity (CSV row 2).',
        caveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 6: TAKEAWAY (Summary)
    // -------------------------------------------------------------------------
    {
      id: 'beat-06-takeaway',
      type: 'takeaway',
      act: 'takeaway',
      truthTag: 'Illustration',
      title: 'The Orbit Fire Rule',
      subtitle: 'What this means for astronaut safety and mission planning',
      levelText: {
        little: 'No gravity means no chimney drafts.',
        explorer:
          'Without gravity separating hot and cold air, space fire is a serene sphere guided by diffusion.',
        scientist:
          'In orbital freefall, buoyancy vanishes completely. Quiescent flames burn cooler, spherically, and depend entirely on ventilation for fresh reactant exchange.',
      },
      modes: ['quick', 'full'],
      avatar: {
        expression: 'proud',
        speech: 'You unlocked the physics of space flames! Next, let’s discover what happens when you introduce airflow.',
      },
      avatarDock: 'right',
      layer1: {
        headline: 'No gravity, no chimney effect',
        paragraphs: [
          'Without gravity separating hot and cold gases, combustion is driven by pure molecular diffusion. Fire becomes spherical, quiet, and dependent on cabin ventilation to survive.',
        ],
        keyFact: 'In space, fire does not have an "up". It only goes where cabin air pushes it.',
      },
      provenance: {
        datasetId: 'PSI-69 (FLEX)',
        platform: 'ISS CIR',
        doiOrNtrs: 'NTRS-20130014061',
        quoteOrRow:
          'The digital images yielded droplet and flame diameters as functions of time and subsequently droplet burning rate, flame standoff ratio, and initial and extinction droplet diameters.',
        caveat: 'Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels.',
      },
    },
  ],
};
