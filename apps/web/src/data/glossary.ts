export interface GlossaryEntry {
  term: string;
  shortName?: string;
  definition: string;
  category?: 'Facility' | 'Mission' | 'Physics' | 'Material' | 'Metric' | 'Standard';
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // Facilities & NASA Platforms
  psi: {
    term: 'Physical Sciences Informatics (PSI)',
    shortName: 'PSI',
    definition: 'NASA’s open-access repository of flight and ground research data from experiments performed aboard the International Space Station and space shuttles.',
    category: 'Facility',
  },
  cir: {
    term: 'Combustion Integrated Rack (CIR)',
    shortName: 'CIR',
    definition: 'A sealed combustion chamber inside the ISS Destiny module equipped with high-speed cameras, gas analyzers, and optical sensors to study microgravity flames safely.',
    category: 'Facility',
  },
  msg: {
    term: 'Microgravity Science Glovebox (MSG)',
    shortName: 'MSG',
    definition: 'A sealed laboratory workspace aboard the ISS with built-in gloves and negative pressure that allows astronauts to safely manipulate combustion and fluid experiments.',
    category: 'Facility',
  },

  // Flight Missions & Experiments
  bass: {
    term: 'Burning and Suppression of Solids (BASS)',
    shortName: 'BASS',
    definition: 'A series of NASA spaceflight investigations aboard the ISS testing how solid plastic and fabric fuels ignite, burn, and extinguish in weightlessness.',
    category: 'Mission',
  },
  saffire: {
    term: 'Spacecraft Fire Experiment (Saffire)',
    shortName: 'Saffire',
    definition: 'NASA flight campaigns conducted inside uncrewed Cygnus cargo vehicles after departing the ISS to study large-scale fire growth on meter-long fuel samples.',
    category: 'Mission',
  },
  flex: {
    term: 'Flame Extinction Experiment (FLEX)',
    shortName: 'FLEX',
    definition: 'An ISS research program investigating the burning and low-temperature extinction behavior of isolated liquid fuel droplets in microgravity.',
    category: 'Mission',
  },

  // Standards
  'std-6001b': {
    term: 'NASA Standard 6001B (STD-6001B)',
    shortName: 'STD-6001B',
    definition: 'NASA’s official specification for testing and screening materials for flammability, toxicity, and off-gassing before they are certified to fly on crewed spacecraft.',
    category: 'Standard',
  },

  // Mathematics & Metrics
  'jaccard overlap': {
    term: 'Jaccard Overlap',
    shortName: 'Jaccard Similarity',
    definition: 'A mathematical formula that measures the similarity between two sets by dividing the size of their shared elements by the size of their total combined elements.',
    category: 'Metric',
  },
  'evidence similarity': {
    term: 'Evidence Similarity',
    shortName: 'Similarity Score',
    definition: 'A normalized score (0–100%) indicating how closely a user’s simulated habitat atmosphere matches verified parameters from real NASA flight runs.',
    category: 'Metric',
  },
  coverage: {
    term: 'Data Coverage',
    shortName: 'Coverage',
    definition: 'An assessment of how thoroughly NASA’s published flight experiments cover all parameters (oxygen, pressure, flow) within a chosen scenario.',
    category: 'Metric',
  },
  confidence: {
    term: 'Scientific Confidence',
    shortName: 'Confidence',
    definition: 'A rating of certainty based on empirical data density, flight test repetition, and whether gravity transfer warnings apply.',
    category: 'Metric',
  },

  // Physics Concepts
  'richardson number': {
    term: 'Richardson Number (Ri)',
    shortName: 'Ri',
    definition: 'A dimensionless physics ratio comparing natural buoyancy draft to forced airflow speed; values near zero mean forced ventilation completely dominates.',
    category: 'Physics',
  },
  buoyancy: {
    term: 'Buoyancy (Natural Convection)',
    shortName: 'Buoyancy',
    definition: 'The upward floating force caused by gravity acting on density differences, which makes hot combustion gases rise on Earth but vanishes in space freefall.',
    category: 'Physics',
  },
  microgravity: {
    term: 'Microgravity (0g)',
    shortName: 'Microgravity',
    definition: 'An environment of near-weightlessness created by orbital freefall, where gravity’s acceleration is balanced by circular motion, eliminating buoyant updraft.',
    category: 'Physics',
  },
  'flame spread': {
    term: 'Flame Spread',
    shortName: 'Flame Spread',
    definition: 'The speed and pattern with which a burning combustion front travels across the surface of a solid material or fuel sheet.',
    category: 'Physics',
  },
  extinction: {
    term: 'Flame Extinction',
    shortName: 'Extinction',
    definition: 'The moment a flame goes out because heat loss exceeds heat generation or because local oxygen is consumed faster than diffusion can resupply it.',
    category: 'Physics',
  },
  'sustained burning': {
    term: 'Sustained Burning',
    shortName: 'Sustained Burning',
    definition: 'Continuous self-supporting combustion that continues releasing heat after the external igniter or spark has been turned off.',
    category: 'Physics',
  },

  // Materials
  pmma: {
    term: 'Poly(methyl methacrylate) (PMMA)',
    shortName: 'PMMA / Acrylic',
    definition: 'A transparent rigid polymer plastic (Plexiglas) used as the benchmark standard fuel across NASA BASS and Saffire combustion research.',
    category: 'Material',
  },
};

/**
 * Normalizes term lookup strings (case-insensitive, trims punctuation/whitespace)
 */
export function getGlossaryEntry(termKey: string): GlossaryEntry | undefined {
  const normalized = termKey.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (GLOSSARY[normalized]) return GLOSSARY[normalized];

  // Specific alias mappings
  const aliases: Record<string, string> = {
    'nasa psi': 'psi',
    'nasa std 6001b': 'std-6001b',
    'nasa-std-6001b': 'std-6001b',
    'std 6001b': 'std-6001b',
    'cir': 'cir',
    'msg': 'msg',
    'bass': 'bass',
    'bass ii': 'bass',
    'saffire': 'saffire',
    'saffire i': 'saffire',
    'saffire ii': 'saffire',
    'flex': 'flex',
    'flex 2': 'flex',
    'jaccard': 'jaccard overlap',
    'jaccard similarity': 'jaccard overlap',
    'richardson': 'richardson number',
    'ri': 'richardson number',
    'buoyancy': 'buoyancy',
    'buoyant': 'buoyancy',
    'buoyant convection': 'buoyancy',
    'microgravity': 'microgravity',
    '0g': 'microgravity',
    'zero gravity': 'microgravity',
    'pmma': 'pmma',
    'acrylic': 'pmma',
    'flame spread': 'flame spread',
    'spread': 'flame spread',
    'extinction': 'extinction',
    'quenching': 'extinction',
    'sustained burning': 'sustained burning',
    'similarity': 'evidence similarity',
    'evidence similarity': 'evidence similarity',
    'coverage': 'coverage',
    'confidence': 'confidence',
  };

  const targetKey = aliases[normalized];
  if (targetKey && GLOSSARY[targetKey]) {
    return GLOSSARY[targetKey];
  }

  // Fallback search across keys
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return entry;
    }
  }

  return undefined;
}
