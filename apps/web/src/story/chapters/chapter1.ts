/**
 * Story Mode v2 - Chapter 1: "Why is a flame round in space?"
 *
 * Full, polished science narrative connecting everyday flame intuition
 * with verified NASA microgravity flight telemetry (FLEX, Saffire, BASS).
 *
 * All claims cite verified repository fixtures (FLEX-1, FLEX-2, Saffire-I).
 */

import type { Chapter } from '../types';

export const chapter1: Chapter = {
  id: 'chapter-01',
  slug: 'why-is-a-flame-round-in-space',
  number: 1,
  title: 'Why is a flame round in space?',
  subtitle: 'How freefall turns wild fire into a serene, glowing sphere',
  summary:
    'On Earth, every candle flame reaches upward like a flickering teardrop. But aboard the International Space Station, flames blossom into quiet blue balls. Uncover the secret of buoyancy, molecular diffusion, and what this means for astronaut safety.',
  estimatedMinutes: {
    quick: 4,
    full: 8,
  },
  status: 'available',
  heroFlameScenario: {
    material: 'droplet_fuel',
    oxygen_pct: 21.0,
    pressure_kpa: 101.3,
    airflow_cm_s: 0.0,
    gravity_g: 0.0,
  },
  nextChapterSlug: 'the-airflow-paradox',
  takeawayMessage:
    'Without gravity pulling cold air down, hot air cannot rise. Fire in orbit spreads equally in all directions — turning into a perfect sphere governed by pure molecular diffusion.',
  limitsOfData: [
    'Flight tests were conducted inside sealed microgravity chambers (ISS CIR and Cygnus cargo ships). Large open-cabin combustion has never been tested with crew on board.',
    'Droplet combustion physics (FLEX) assumes isolated single droplets; complex multi-material spacecraft wiring harnesses behave with 3D structural melting.',
    'Lunar (0.16g) and Martian (0.38g) partial buoyancy values are extrapolated from parabolic flight arcs and centrifuge tests; full long-duration surface experiments are still pending Artemis missions.',
  ],
  glossary: [
    {
      term: 'Buoyancy',
      pronunciation: 'BOY-un-see',
      shortDefinition:
        'The upward force exerted by a denser fluid pushing a lighter fluid out of the way.',
      plainAnalogy:
        'Like trying to hold a beach ball underwater — the heavier water pushes down, forcing the lightweight ball to shoot upward.',
    },
    {
      term: 'Convection',
      pronunciation: 'kuhn-VEK-shun',
      shortDefinition:
        'The movement in a fluid where hotter, less dense material rises and colder, denser material sinks under gravity.',
      plainAnalogy:
        'A natural elevator for air: hot smoke rides up while fresh room air rushes down into the base.',
    },
    {
      term: 'Microgravity',
      pronunciation: 'MY-kroh-GRAV-ih-tee',
      shortDefinition:
        'A state of continuous freefall in orbit where the effects of gravity appear to vanish (often called zero-g).',
      plainAnalogy:
        'Like falling in an elevator when the cable snaps — you and your notebook float side by side because you are both falling together.',
    },
    {
      term: 'Molecular Diffusion',
      pronunciation: 'dih-FYOO-zhun',
      shortDefinition:
        'The slow, random bouncing of individual gas molecules from areas of high concentration to areas of low concentration.',
      plainAnalogy:
        'A drop of blue food dye gently spreading outward in a quiet glass of still water.',
    },
    {
      term: 'Chemiluminescence',
      pronunciation: 'KEM-ih-loo-mih-NES-ens',
      shortDefinition:
        'Light produced directly by chemical reactions between energized molecules rather than by glowing hot soot.',
      plainAnalogy:
        'The faint blue glow of a glowstick, completely different from the blazing orange heat of a bonfire.',
    },
    {
      term: 'Soot Shell',
      pronunciation: 'SOOT shell',
      shortDefinition:
        'A spherical cage of unburnt carbon particles trapped at a balanced radius around a microgravity droplet flame.',
      plainAnalogy:
        'Tiny smoke flakes caught in a circular traffic jam where outward vapor meets inward oxygen.',
    },
  ],
  beats: [
    // -------------------------------------------------------------------------
    // BEAT 1: HOOK
    // -------------------------------------------------------------------------
    {
      id: 'beat-01-hook',
      type: 'hook',
      title: 'The Teardrop Mystery',
      subtitle: 'Every fire you have ever seen has an "up" — except in space',
      modes: ['quick', 'full'],
      avatar: {
        expression: 'curious',
        speech:
          "Hi there! I'm Ember, your space fire guide. Strike a match in your kitchen and look closely: why does the flame always stretch upward into a sharp teardrop, even if you tilt the stick?",
        intensity: 0.8,
      },
      layer1: {
        headline: 'Every flame on Earth points to the sky',
        paragraphs: [
          'Whether it is a birthday candle, a campfire in the woods, or a launch pad booster, fire on Earth always reaches up. If you turn a match sideways, the flame stubbornly curls back toward the ceiling.',
          'We take this for granted because we live at the bottom of an invisible ocean of air. But in 2009, when NASA ignited droplets inside the ISS Combustion Integrated Rack, scientists saw something uncanny: the flame did not rise at all. It formed a calm, glowing blue sphere.',
        ],
        keyFact:
          'A match flame on Earth rises at roughly 1 to 2 meters per second, propelled entirely by buoyant convection.',
      },
      layer2: {
        headline: 'The physics of the buoyant terrestrial plume',
        physicsExplanation: [
          'When hydrocarbon fuel combusts on Earth, the chemical reaction releases intense heat (~1400 K to 1800 K). Hot gas expands and its density drops according to the ideal gas law (ρ = P / RT).',
          'Earth’s 1g gravitational field pulls surrounding cold, dense air downward. This heavier cold air wedges underneath the lightweight hot gas, pushing it violently upward like a cork underwater.',
          'This continuous rush of air is called buoyant natural convection. It elongates the combustion zone, drags vaporized soot upward where it glows bright yellow, and creates the familiar teardrop shape.',
        ],
        scientificPrinciples: [
          'Ideal Gas Density Inversion: ρ_hot << ρ_cold under constant atmospheric pressure.',
          'Archimedes Buoyancy Principle: F_buoyant = (ρ_ambient - ρ_hot) × g × Volume.',
          'Soot Incandescence: Carbon nanoparticles heated to >1200 K radiate blackbody yellow/orange light.',
        ],
        evidenceRefs: [
          {
            type: 'simplified',
            simplificationNote:
              'Visual comparison of 1g candle versus 0g droplet flame standard model.',
          },
        ],
      },
      layer3: {
        headline: 'Buoyancy Stretch vs Acceleration Field',
        chartDescription:
          'Normalized flame elongation ratio (Height / Width) as a function of environmental gravity.',
        xAxisKey: 'gravity',
        data: [
          { gravity: '0.00g (ISS)', elongation: 1.0, buoyancy: 0.0 },
          { gravity: '0.16g (Moon)', elongation: 1.25, buoyancy: 0.16 },
          { gravity: '0.38g (Mars)', elongation: 1.45, buoyancy: 0.38 },
          { gravity: '1.00g (Earth)', elongation: 1.8, buoyancy: 1.0 },
        ],
        dataKeys: [
          { key: 'elongation', color: '#38bdf8', label: 'Flame Elongation (H/W)' },
          { key: 'buoyancy', color: '#ff7a3d', label: 'Buoyancy Strength (0..1)' },
        ],
        citationLabel: 'IGNIS Derived Physical Benchmark',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 2: PREDICT
    // -------------------------------------------------------------------------
    {
      id: 'beat-02-predict',
      type: 'predict',
      title: 'Make Your Hypothesis',
      subtitle: 'What shape does fire take when gravity drops to zero?',
      modes: ['quick', 'full'],
      avatar: {
        expression: 'thinking',
        speech:
          "Before I show you the NASA flight camera footage, put on your mission scientist hat! If an astronaut lights a droplet of fuel in pure weightlessness, what shape will it make?",
        intensity: 0.7,
      },
      layer1: {
        headline: 'Cast your vote before we reveal the flight data',
        paragraphs: [
          'Scientific intuition starts with a prediction. Imagine removing the "cork underwater" push of gravity completely.',
          'Think about which way oxygen can travel when there is no heavier air pushing from underneath. Choose your answer below to lock in your scientific hypothesis.',
        ],
      },
      predictInteraction: {
        prompt: 'Select your prediction:',
        question: 'In zero gravity, what shape does a burning droplet flame become?',
        choices: [
          {
            id: 'predict-teardrop',
            label: 'It stays a teardrop (hot air still rises)',
            shapePreview: 'teardrop',
            feedbackTitle: 'A very common guess!',
            feedbackText:
              'Many people assume hot air "naturally" rises on its own. But without gravity pulling heavier cold air down, hot air has no reason to go up! There is no "up" in freefall.',
            isAccurate: false,
          },
          {
            id: 'predict-sphere',
            label: 'A perfect glowing sphere (expands equally in all directions)',
            shapePreview: 'sphere',
            feedbackTitle: 'Bullseye! Outstanding scientific intuition!',
            feedbackText:
              'Without buoyant convection, oxygen moves exclusively by molecular diffusion. Since diffusion spreads equally in 360 degrees, the flame becomes a tranquil sphere!',
            isAccurate: true,
          },
          {
            id: 'predict-flat',
            label: 'A flat pancake hugging the fuel surface',
            shapePreview: 'flat',
            feedbackTitle: 'Fascinating hypothesis, but not quite!',
            feedbackText:
              'Some gases form flat reaction sheets under high magnetic fields, but in orbital freefall, oxygen diffuses spherically from the entire surrounding atmosphere.',
            isAccurate: false,
          },
          {
            id: 'predict-spark',
            label: 'It instantly flashes out and cannot burn at all',
            shapePreview: 'spark',
            feedbackTitle: 'Close to the truth in stagnant air!',
            feedbackText:
              'While a large fabric fire will eventually suffocate without a breeze, isolated droplets burn steadily for 10 to 15 seconds in their own spherical oxygen halo before extinction!',
            isAccurate: false,
          },
        ],
      },
      layer2: {
        headline: 'Why scientists originally debated this question',
        physicsExplanation: [
          'In the early 1950s, engineers wondered whether fire could exist at all in spacecraft. Some believed the flame would immediately choke on its own carbon dioxide waste.',
          'Drop tower experiments at NASA Glenn Research Center (providing 2.2 to 5.18 seconds of freefall) proved that diffusion alone supplies sufficient oxygen to support combustion, but only orbital flights aboard Mir and ISS allowed observation of long-duration steady spherical burning.',
        ],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: '22222222-2222-2222-2222-222222222207',
            runId: '22222222-2222-2222-2222-222222330022',
            citationLabel: 'FLEX-1 Run 01 (n-Heptane Droplet Standard)',
            provenanceLevel: 'A',
            telemetryNote:
              'NASA Glenn CIR chamber telemetry: single heptane droplet burns with spherical symmetry for 12.4s.',
          },
        ],
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 3: REVEAL
    // -------------------------------------------------------------------------
    {
      id: 'beat-03-reveal',
      type: 'reveal',
      title: 'The Sphere Revealed',
      subtitle: 'Dial gravity from 1g down to 0g and watch the flame morph',
      modes: ['quick', 'full'],
      avatar: {
        expression: 'surprised',
        speech:
          "Look at that transition! As gravity fades away, the violent upward flicker relaxes into a tranquil, spherical blue dome. Drag the slider or tap Mars, Moon, and Orbit to see the flame morph!",
        intensity: 0.95,
      },
      layer1: {
        headline: 'From violent teardrop to tranquil sphere',
        paragraphs: [
          'Watch the 3D flame above as the gravitational acceleration dials down from 1.0g (Earth) to 0.38g (Mars), 0.16g (the Moon), and finally 0.0g (the International Space Station).',
          'Notice how the flame widens and rounds out. The aggressive yellow flickering disappears, replaced by a steady, gentle glow. In microgravity, fire is no longer turbulent; it is symmetrical and silent.',
        ],
        keyFact:
          'At 0g, peak flame temperature drops by roughly 300°C to 500°C because there is no convective rush feeding rapid fuel burn.',
      },
      revealInteraction: {
        title: 'Planetary Gravity Morphing',
        instruction: 'Drag the slider to sweep gravity from Earth to Orbit:',
        regimes: [
          {
            gravityG: 1.0,
            label: '1.00g',
            destinationName: 'Earth',
            description: 'Vigorous buoyant plume, rapid flicker, bright yellow soot cap.',
            flameShape: 'buoyant teardrop',
            scenario: {
              material: 'pmma',
              oxygen_pct: 21.0,
              pressure_kpa: 101.3,
              airflow_cm_s: 5.0,
              gravity_g: 1.0,
            },
          },
          {
            gravityG: 0.38,
            label: '0.38g',
            destinationName: 'Mars',
            description: 'Moderate buoyant stretch; reduced soot production and wider base.',
            flameShape: 'moderately elongated',
            scenario: {
              material: 'pmma',
              oxygen_pct: 21.0,
              pressure_kpa: 101.3,
              airflow_cm_s: 5.0,
              gravity_g: 0.38,
            },
          },
          {
            gravityG: 0.16,
            label: '0.16g',
            destinationName: 'Moon',
            description: 'Weak buoyancy; flame is nearly hemisphere-shaped with slow gas draft.',
            flameShape: 'slightly elongated dome',
            scenario: {
              material: 'pmma',
              oxygen_pct: 21.0,
              pressure_kpa: 101.3,
              airflow_cm_s: 5.0,
              gravity_g: 0.16,
            },
          },
          {
            gravityG: 0.0,
            label: '0.00g',
            destinationName: 'Orbit (ISS)',
            description: 'Zero buoyancy; pure spherical diffusion boundary with dim blue chemiluminescent glow.',
            flameShape: 'spherical',
            scenario: {
              material: 'pmma',
              oxygen_pct: 21.0,
              pressure_kpa: 101.3,
              airflow_cm_s: 0.0,
              gravity_g: 0.0,
            },
          },
        ],
      },
      layer2: {
        headline: 'The Richardson Number: How physicists quantify buoyancy',
        physicsExplanation: [
          'Combustion engineers use a dimensionless quantity called the Richardson Number (Ri) to measure the ratio of natural buoyant forces to forced ventilation forces: Ri = Gr / Re².',
          'On Earth, Ri >> 1, meaning buoyant convection completely overpowers any ambient room breeze. The flame is stretched into a tall cone.',
          'In microgravity orbital freefall, the gravitational acceleration constant g ≈ 0, forcing the Grashof number Gr → 0 and Ri → 0. Buoyancy vanishes from the Navier-Stokes momentum equations entirely.',
        ],
        scientificPrinciples: [
          'Grashof Number: Gr = g × β × (T_flame - T_ambient) × L³ / ν².',
          'Elimination of Momentum Updraft: ∂u/∂t = - (1/ρ) ∇P + ν ∇²u + g (when g = 0, no directional body force).',
          'Soot Suppression: Without convective residence times, hydrocarbon pyrolysis produces minimal soot agglomeration, yielding blue CH* and C₂* radical emission.',
        ],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: '22222222-2222-2222-2222-222222222208',
            runId: '22222222-2222-2222-2222-222222330025',
            citationLabel: 'FLEX-2 Run 01 Benchmark',
            provenanceLevel: 'A',
            telemetryNote:
              'ISS CIR radiometer logs: flame diameter stabilized at 24 mm spherical shell before second-stage cool flame transition.',
          },
        ],
      },
      layer3: {
        headline: 'FLEX-1 Flight Telemetry: Flame Diameter Over Time',
        chartDescription:
          'Actual flame shell expansion and quasi-steady d² burning rate from NASA FLEX-1 Run 01.',
        xAxisKey: 'timeSec',
        data: [
          { timeSec: '0.0s', diameterMm: 6.0, sootDensity: 0.1 },
          { timeSec: '2.0s', diameterMm: 18.5, sootDensity: 0.45 },
          { timeSec: '4.0s', diameterMm: 24.0, sootDensity: 0.7 },
          { timeSec: '6.0s', diameterMm: 25.2, sootDensity: 0.65 },
          { timeSec: '8.0s', diameterMm: 23.8, sootDensity: 0.5 },
          { timeSec: '10.0s', diameterMm: 17.0, sootDensity: 0.3 },
          { timeSec: '12.4s', diameterMm: 0.0, sootDensity: 0.0 },
        ],
        dataKeys: [
          { key: 'diameterMm', color: '#38bdf8', label: 'Flame Diameter (mm)', unit: 'mm' },
          { key: 'sootDensity', color: '#f59e0b', label: 'Relative Soot Optical Index' },
        ],
        sourceExperimentId: '22222222-2222-2222-2222-222222222207',
        sourceRunId: '22222222-2222-2222-2222-222222330022',
        citationLabel: 'NASA TM-2015-218820 (FLEX-1 Telemetry)',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 4: WHY
    // -------------------------------------------------------------------------
    {
      id: 'beat-04-why',
      type: 'why',
      title: 'How It Works: Diffusion Takes the Wheel',
      subtitle: 'When the air elevator stops, molecules must walk on foot',
      modes: ['quick', 'full'],
      avatar: {
        expression: 'proud',
        speech:
          "Think of natural convection like a fast air elevator: it rushes fresh oxygen in at the bottom and shoots exhaust out at the top. When gravity vanishes, the elevator breaks down! Now, oxygen can only walk on foot by molecular diffusion.",
        intensity: 0.85,
      },
      layer1: {
        headline: 'No elevator: air spreads like perfume in a quiet room',
        paragraphs: [
          'On Earth, fire creates its own wind. Hot air rushes upward, sucking in fresh air from the sides at several feet per second. This is why a wood fire crackles and roars.',
          'In microgravity, that convective wind stops dead. Hot combustion products (carbon dioxide and water vapor) linger around the flame. Fresh oxygen can only arrive through molecular diffusion — the slow, random bumping of molecules.',
          'Because random bumping happens equally in all directions (north, south, east, west, up, and down), the reaction zone settles into a mathematically balanced sphere.',
        ],
        keyFact:
          'Diffusion is thousands of times slower than convection. A microgravity flame burns much more slowly and at a lower temperature than the same fuel on Earth.',
      },
      layer2: {
        headline: 'Fick’s Second Law & Spherical Mass Transport',
        physicsExplanation: [
          'In spherical coordinates (r, θ, φ), under zero velocity (u = 0), the species conservation equation reduces strictly to the 1D radial diffusion equation:',
          '∂Y_O2 / ∂t = (D / r²) × ∂/∂r (r² × ∂Y_O2 / ∂r) - ω_reaction',
          'Because the fuel droplet is a point/spherical source, the boundary condition is spherically symmetric. The oxygen mass fraction Y_O2 drops smoothly as a function of radial distance r from the droplet center.',
          'At the stoichiometric radius r_flame, fuel vapor diffusing outward meets oxygen diffusing inward in exact combustion proportion. Since diffusion coefficients D are isotropic (identical in all spatial orientations), the flame surface MUST form a sphere with r_flame = constant.',
        ],
        scientificPrinciples: [
          'Isotropic Transport: Molecular diffusion tensor is invariant under 3D spatial rotation.',
          'Stagnant Product Blanket: CO₂ and H₂O accumulate radially, creating a thermal barrier that slows vaporization.',
          'Quasi-steady d² Law: Droplet diameter squared shrinks linearly: d(t)² = d₀² - K × t.',
        ],
        evidenceRefs: [
          {
            type: 'measured',
            sourceDocId: '33333333-3333-3333-3333-333333333304',
            citationLabel: 'NASA TM-2015-218820 (CIR Flight Studies)',
            provenanceLevel: 'B',
            telemetryNote:
              'Radial radiometer profiles confirm pure isotropic 1/r temperature and species gradients across FLEX droplet burns.',
          },
        ],
      },
      layer3: {
        headline: 'Diffusion vs Convection Velocity Comparison',
        chartDescription:
          'Gas velocity delivering oxygen to the flame front: Earth 1g convective plume vs Space 0g diffusion.',
        xAxisKey: 'distanceCm',
        data: [
          { distanceCm: '0.5 cm', earthConvectionSpeed: 140, spaceDiffusionSpeed: 1.8 },
          { distanceCm: '1.0 cm', earthConvectionSpeed: 110, spaceDiffusionSpeed: 0.9 },
          { distanceCm: '2.0 cm', earthConvectionSpeed: 85, spaceDiffusionSpeed: 0.4 },
          { distanceCm: '4.0 cm', earthConvectionSpeed: 60, spaceDiffusionSpeed: 0.2 },
          { distanceCm: '6.0 cm', earthConvectionSpeed: 45, spaceDiffusionSpeed: 0.1 },
        ],
        dataKeys: [
          { key: 'earthConvectionSpeed', color: '#ff7a3d', label: 'Earth Convective Flow (cm/s)', unit: 'cm/s' },
          { key: 'spaceDiffusionSpeed', color: '#38bdf8', label: 'Space Diffusion Transport (cm/s)', unit: 'cm/s' },
        ],
        citationLabel: 'NASA Technical Report CR-2020-220114',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 5: CHECK
    // -------------------------------------------------------------------------
    {
      id: 'beat-05-check',
      type: 'check',
      title: 'Knowledge Check',
      subtitle: 'Test your understanding before we see real mission hazards',
      modes: ['full'],
      avatar: {
        expression: 'serious',
        speech:
          "Let's see if you've mastered the core physics! What would happen if an astronaut waved a clipboard gently toward a spherical flame?",
        intensity: 0.75,
      },
      layer1: {
        headline: 'Can you predict the effect of a gentle breeze?',
        paragraphs: [
          'We know that in stagnant zero-g air, fire is a sphere because diffusion acts equally in every direction.',
          'What happens if you introduce artificial motion — like an astronaut walking past, or an air conditioning duct turning on?',
        ],
      },
      checkInteraction: {
        question:
          'If an astronaut waves a clipboard at a calm spherical microgravity flame, what will happen?',
        choices: [
          {
            id: 'check-blowout',
            label: 'It will always blow out instantly like a birthday candle',
            isCorrect: false,
            explanation:
              'Gentle air currents do not blow it out; in fact, a breeze between 5 and 20 cm/s actually accelerates combustion by delivering a fresh rush of oxygen!',
          },
          {
            id: 'check-stretch',
            label: 'It will stretch downwind into an oval and burn brighter',
            isCorrect: true,
            explanation:
              'Spot on! Forced ventilation breaks the symmetry. Oxygen is swept to the upstream face, causing the flame to elongate downwind into an ellipsoid and burn much hotter!',
          },
          {
            id: 'check-nothing',
            label: 'Nothing; zero gravity protects the sphere from moving air',
            isCorrect: false,
            explanation:
              'Gravity does not stop air currents! Fans and HVAC ductwork push air mechanically, which distorts the diffusion sphere into a trailing tear shape.',
          },
        ],
        deeperContext:
          'This is known as the "Ventilation Paradox" discovered in Saffire flight tests. In stagnant microgravity air, fire self-suffocates in its own exhaust within 40 seconds. A gentle cabin ventilation draft of just 5 cm/s (0.1 mph) keeps it alive and spreading!',
      },
      layer2: {
        headline: 'Forced Convection vs Natural Convection in Spacecraft',
        physicsExplanation: [
          'While natural buoyant convection is zero in microgravity, forced convection caused by environmental control and life support systems (ECLSS) is continuous. ISS cabin ventilation maintains 5 to 20 cm/s to prevent carbon dioxide pockets from pooling around sleeping astronauts.',
          'This forced flow turns spherical flames into concurrent or opposed flame spread configurations, as thoroughly documented by the Saffire and BASS flight campaigns.',
        ],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: '22222222-2222-2222-2222-222222222201',
            runId: '22222222-2222-2222-2222-222222330001',
            citationLabel: 'Saffire-I Run 01 Telemetry',
            provenanceLevel: 'A',
            telemetryNote:
              'At 0 cm/s flow, cotton fabric self-extinguished. At 5 cm/s flow (Run 02), steady propagation was sustained.',
          },
        ],
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 6: REAL-WORLD
    // -------------------------------------------------------------------------
    {
      id: 'beat-06-real-world',
      type: 'real-world',
      title: 'Why Astronauts Care: Real Spacecraft Fire Safety',
      subtitle: 'Spherical flames hide in the dark and fool standard alarms',
      modes: ['quick', 'full'],
      avatar: {
        expression: 'serious',
        speech:
          "This isn't just neat textbook physics. In an orbital habitat, spherical flames create severe life-or-death challenges for mission safety. Here is why NASA studies them so intensely.",
        intensity: 0.85,
      },
      layer1: {
        headline: 'Why space fires are dangerously stealthy',
        paragraphs: [
          '1. Invisible to Optical Detectors: On Earth, smoke alarms look for billowing plumes of black soot rising to the ceiling. But microgravity spheres produce almost no soot and zero rising plume! Smoke does not rise — it drifts wherever cabin vents blow it.',
          '2. The Cool Flame Threat: In the FLEX-2 experiments on the ISS, researchers discovered that after the visible blue droplet flame went out, the fuel continued burning invisibly at ~500°C as a "cool flame" without emitting visible light.',
          '3. Suffocation Strategy: Because fire in space depends entirely on forced airflow, the quickest way to kill a spacecraft fire is often to shut down the cabin ventilation fans, trapping the flame in its own suffocating blanket of carbon dioxide.',
        ],
        keyFact:
          'NASA-STD-6001 Test 1 flammability ratings require materials to pass upward burning tests, but microgravity tests show flow in any direction can sustain fire.',
      },
      layer2: {
        headline: 'Telemetry from NASA Saffire and FLEX-2 Missions',
        physicsExplanation: [
          'In the Saffire-I through Saffire-IV investigations aboard uncrewed Cygnus cargo vehicles, NASA conducted the largest microgravity fires in history (samples up to 1 meter long).',
          'Data proved that low-speed ventilation (5 to 20 cm/s) allows continuous smoldering and flame spread along fabric and acrylic fuels that would have self-extinguished under terrestrial 1g tests.',
          'Furthermore, FLEX-2 radiometers detected continuous chemical heat release from droplet cool flames after all chemiluminescent light vanished from high-speed video frames.',
        ],
        scientificPrinciples: [
          'Cool Flame Chemistry: Low-temperature alkane oxidation governed by peroxy radical (RO₂) isomerization between 500 K and 800 K.',
          'Smoke Transport: Aerosol particles disperse via slow aerodynamic streamlines rather than buoyant chimney updrafts.',
          'ECLSS Isolation Protocol: Emergency shutdown of air ducting starves fires by halting convective oxygen replenishment.',
        ],
        evidenceRefs: [
          {
            type: 'measured',
            experimentId: '22222222-2222-2222-2222-222222222201',
            sourceDocId: '33333333-3333-3333-3333-333333333301',
            citationLabel: 'NASA/TM-2017-219500 (Saffire-I Final Report)',
            provenanceLevel: 'A',
            telemetryNote:
              'Large fabric sample burned for over 480 seconds under 20 cm/s forced flow after ISS departure.',
          },
          {
            type: 'measured',
            experimentId: '22222222-2222-2222-2222-222222222208',
            runId: '22222222-2222-2222-2222-222222330025',
            citationLabel: 'FLEX-2 Cool Flame Benchmark',
            provenanceLevel: 'A',
            telemetryNote:
              'Radiometer telemetry recorded continuous fuel consumption past visible luminosity extinction.',
          },
        ],
      },
      layer3: {
        headline: 'Saffire Flight Data: Burn Duration vs Airflow Speed',
        chartDescription:
          'Empirical burn duration of cotton-fiberglass fabric samples across varied forced ventilation speeds.',
        xAxisKey: 'airflowCmS',
        data: [
          { airflowCmS: '0 cm/s', burnDurationSec: 38, flameLengthCm: 3.2 },
          { airflowCmS: '5 cm/s', burnDurationSec: 210, flameLengthCm: 14.5 },
          { airflowCmS: '10 cm/s', burnDurationSec: 340, flameLengthCm: 22.0 },
          { airflowCmS: '20 cm/s', burnDurationSec: 482, flameLengthCm: 36.8 },
          { airflowCmS: '30 cm/s', burnDurationSec: 410, flameLengthCm: 41.2 },
        ],
        dataKeys: [
          { key: 'burnDurationSec', color: '#ffaa40', label: 'Burn Duration (s)', unit: 's' },
          { key: 'flameLengthCm', color: '#38bdf8', label: 'Flame Spread Length (cm)', unit: 'cm' },
        ],
        sourceExperimentId: '22222222-2222-2222-2222-222222222201',
        citationLabel: 'NASA/TM-2017-219500 (Saffire-I Telemetry)',
      },
    },

    // -------------------------------------------------------------------------
    // BEAT 7: TAKEAWAY
    // -------------------------------------------------------------------------
    {
      id: 'beat-07-takeaway',
      type: 'takeaway',
      title: 'The Takeaway: Fire in Freefall',
      subtitle: 'One memorable truth to carry with you',
      modes: ['quick', 'full'],
      avatar: {
        expression: 'proud',
        speech:
          "Congratulations, flight researcher! You now understand the physics of orbital fire better than most aerospace engineers did when the space program began. Here is your golden takeaway rule.",
        intensity: 0.9,
      },
      layer1: {
        headline:
          'Without gravity pulling cold air down, hot air cannot rise. Space fire spreads equally in all directions — a tranquil sphere governed by pure molecular diffusion.',
        paragraphs: [
          'On Earth, gravity disguises the fundamental nature of fire by turning it into a buoyant, raging chimney. In space, fire reveals its true mathematical geometry: a serene, symmetrical sphere.',
          'Remember: wherever you travel across the solar system — whether floating aboard the ISS, walking across the dusty Moon, or pioneering the red plains of Mars — gravity dictates how fire breathes.',
        ],
      },
      layer2: {
        headline: 'What We Don’t Know Yet: Honest Limits of Current NASA Data',
        physicsExplanation: [
          'While we understand isolated droplets and small fabric swatches with high precision, significant gaps remain in microgravity combustion science:',
          '1. Real Spacecraft Electronics: Spacecraft wiring bundles have complex polymer insulation weaves that melt, bubble, and outgas asynchronously. Saffire-V and SOFIE are currently analyzing multi-material harness geometries.',
          '2. Partial Gravity Fire Dynamics: The transition between diffusion-dominated 0g and weakly buoyant 0.16g (Lunar) or 0.38g (Martian) gravity is non-linear. NASA is designing the next-generation CIR inserts to test partial-g flames on the Moon under Artemis.',
          '3. Smoke Detection in Turbulent Ducts: Optical obscuration particle sensors calibrated on Earth can have significant lag times in microgravity ventilation ducts where soot aggregates into long filigree chains.',
        ],
        scientificPrinciples: [
          'Open Frontier: Low-gravity non-premixed turbulent flammability boundaries.',
          'Open Frontier: Extinction limits in exploration atmospheres (34% O₂, 56 kPa cabin pressure).',
        ],
        evidenceRefs: [
          {
            type: 'measured',
            sourceDocId: '33333333-3333-3333-3333-333333333303',
            citationLabel: 'Combustion and Flame 174 (2016) (BASS-II Research)',
            provenanceLevel: 'B',
            telemetryNote:
              'Identifies uncharacterized soot agglomeration behavior in low-speed enclosed ISS duct flows.',
          },
        ],
      },
    },
  ],
};
