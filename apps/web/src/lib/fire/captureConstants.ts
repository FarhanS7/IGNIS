/**
 * Constants and Real NASA Provenance Fixtures for Capture Mode & Video Demo.
 * Pure constants and data structures.
 */

export const IGNIS_SUBMISSION_URL = 'https://ignis.space';

export interface NasaProvenanceProof {
  investigationName: string;
  investigationId: string;
  runId: string;
  doi: string;
  publication: string;
  apparatus: string;
  flightPlatform: string;
  measuredFuel: string;
  sensorTypes: string[];
}

export const REAL_NASA_PROVENANCE: NasaProvenanceProof = {
  investigationName: 'Smoke Aerosol Measurement Experiment (SAME / SAME-R)',
  investigationId: 'SAME-R',
  runId: 'SAME-R-CEL-01',
  doi: '10.2514/6.2013-3435',
  publication: 'AIAA Aerospace Sciences Meeting / NTRS-20130000422',
  apparatus: 'Microgravity Science Glovebox (MSG)',
  flightPlatform: 'International Space Station (ISS)',
  measuredFuel: 'Cellulose (filter paper pyrolysis)',
  sensorTypes: [
    'Laser photometer / optical obscuration (%/m)',
    'Carbon Monoxide electrochemical cell (ppm)',
    'Thermocouple array (deg C)',
  ],
};

export interface CaptureBeat {
  id: string;
  start_s: number;
  end_s: number;
  label: string;
  caption: string;
}

export const CAPTURE_BEATS: CaptureBeat[] = [
  {
    id: 'hook',
    start_s: 0.0,
    end_s: 8.0,
    label: 'Hook',
    caption: 'Fire in space is different.',
  },
  {
    id: 'why_it_matters',
    start_s: 8.0,
    end_s: 16.0,
    label: 'Why It Matters',
    caption: "On Earth, smoke rises. Here, it doesn't.",
  },
  {
    id: 'reveal',
    start_s: 16.0,
    end_s: 24.0,
    label: 'Station Reveal',
    caption: 'IGNIS: fire safety from NASA flight data',
  },
  {
    id: 'ignite',
    start_s: 24.0,
    end_s: 34.0,
    label: 'Ignition',
    caption: 't = 0',
  },
  {
    id: 'race',
    start_s: 34.0,
    end_s: 46.0,
    label: 'The Race',
    caption: 'Sensors react',
  },
  {
    id: 'locate',
    start_s: 46.0,
    end_s: 56.0,
    label: 'Locate Source',
    caption: 'Source found: Avionics Bay',
  },
  {
    id: 'contain',
    start_s: 56.0,
    end_s: 70.0,
    label: 'Contain & Suppress',
    caption: 'Crew confirms. Fire out.',
  },
  {
    id: 'proof',
    start_s: 70.0,
    end_s: 80.0,
    label: 'NASA Provenance Proof',
    caption: 'Every number traces to NASA.',
  },
  {
    id: 'close',
    start_s: 80.0,
    end_s: 90.0,
    label: 'Honest Close',
    caption: 'Simulated. Not flight software.',
  },
];

export const TOTAL_CAPTURE_DURATION_S = 90.0;

