import rawRuns from '../../data/evidence_runs.json' with { type: 'json' };
import rawMissions from '../../data/missions.json' with { type: 'json' };
import { extractMaterialFamily } from '../matcher/real_solid_matcher.ts';

export interface MissionScenarioParam {
  value: number | string;
  unit: string;
  source_type: 'corpus_citation' | 'user_assumption';
  doc_id?: string | null;
  chunk_id?: string | null;
  citation_text: string;
  editable: boolean;
}

export interface MissionScenario {
  id: string;
  title: string;
  description: string;
  parameters: {
    oxygen_pct: MissionScenarioParam;
    pressure_kpa: MissionScenarioParam;
    flow_cm_s: MissionScenarioParam;
    gravity_g: MissionScenarioParam;
    material_family: MissionScenarioParam;
  };
}

export interface NearestRunSummary {
  run_uid: string;
  oxygen_pct: number;
  flow_cm_s: number;
  material: string;
  material_family: string;
  outcome_class: string;
  distance: number;
}

export interface GapAnalysisResult {
  scenario_id: string;
  title: string;
  description: string;
  rank: number;
  evidence_coverage_pct: number;
  normalized_distance_to_nearest: number;
  same_material_runs_in_radius: number;
  radius: number;
  pressure_measured: boolean; // Always false in tested microgravity solid flight record
  pressure_extrapolation: boolean;
  gravity_matches: boolean;
  nearest_run: NearestRunSummary | null;
  gap_recommendations: string[];
  parameters: {
    oxygen_pct: number;
    pressure_kpa: number;
    flow_cm_s: number;
    gravity_g: number;
    material_family: string;
  };
}

// Filter usable solid runs
const USABLE_SOLID_RUNS = (rawRuns as any[]).filter(
  (r) => r.fuel_class === 'solid' && r.usable_for_matching === true
);

export function getMaterialFamily(material: string): string {
  return extractMaterialFamily(material);
}

export function computeScenarioGapMetrics(
  scenario: {
    id: string;
    title: string;
    description: string;
    oxygen_pct: number;
    pressure_kpa: number;
    flow_cm_s: number;
    gravity_g: number;
    material_family: string;
  },
  radius = 0.25
): GapAnalysisResult {
  const { oxygen_pct, pressure_kpa, flow_cm_s, gravity_g, material_family } = scenario;

  let minDistance = 999.0;
  let nearestRun: NearestRunSummary | null = null;
  let sameMaterialInRadius = 0;

  for (const r of USABLE_SOLID_RUNS) {
    const rO2 = r.oxygen_pct?.value;
    const rFlow = r.flow_cm_s?.value;
    if (typeof rO2 !== 'number' || typeof rFlow !== 'number') continue;

    // 2D Normalized Euclidean distance: (O2 / 20.0%, Flow / 40.0 cm/s)
    const dO2 = (oxygen_pct - rO2) / 20.0;
    const dFlow = (flow_cm_s - rFlow) / 40.0;
    const dist = Math.sqrt(dO2 * dO2 + dFlow * dFlow);

    const rFamily = getMaterialFamily(r.material || '');

    if (dist < minDistance) {
      minDistance = dist;
      nearestRun = {
        run_uid: r.run_uid,
        oxygen_pct: rO2,
        flow_cm_s: rFlow,
        material: r.material,
        material_family: rFamily,
        outcome_class: r.outcome_class,
        distance: Math.round(dist * 1000) / 1000,
      };
    }

    if (rFamily === material_family && dist <= radius) {
      sameMaterialInRadius++;
    }
  }

  // Components:
  // 1. Proximity: max(0, 1 - d_min)
  const proximityScore = Math.max(0, 1.0 - minDistance);

  // 2. Local material density: min(1, count / 5)
  const densityScore = Math.min(1.0, sameMaterialInRadius / 5.0);

  // 3. Pressure regime match: true if within 5% of 101.325 kPa (nominal 1 atm baseline)
  const pMatches1Atm = Math.abs(pressure_kpa - 101.325) < 5.0;

  // 4. Gravity match: true if microgravity (0.0 g)
  const gMatchesMicrogravity = gravity_g === 0.0;

  // Weighted formula: 40% proximity, 30% local material density, 15% pressure regime, 15% gravity
  const evidenceCoveragePct = Math.round(
    (0.4 * proximityScore +
      0.3 * densityScore +
      0.15 * (pMatches1Atm ? 1.0 : 0.0) +
      0.15 * (gMatchesMicrogravity ? 1.0 : 0.0)) *
      1000
  ) / 10;

  // Strictly templated recommendations from missing axes (no free-form claims)
  const gapRecommendations: string[] = [];

  if (minDistance > 0.15 && nearestRun) {
    gapRecommendations.push(
      `Requires microgravity burn at ${oxygen_pct}% O2 / ${flow_cm_s} cm/s (tested nearest: ${nearestRun.oxygen_pct}% O2, ${nearestRun.flow_cm_s} cm/s)`
    );
  }

  if (!pMatches1Atm) {
    gapRecommendations.push(
      `Requires flight burn with active pressure transducer at ${pressure_kpa} kPa (tested solid record only measured at nominal 1 atm)`
    );
  }

  if (!gMatchesMicrogravity) {
    gapRecommendations.push(
      `Requires partial-gravity centrifuge flight test or drop-tower / parabolic campaign at ${gravity_g} g (tested record microgravity-only)`
    );
  }

  if (sameMaterialInRadius < 3) {
    gapRecommendations.push(
      `Requires repeat burn campaign for material family '${material_family}' in this velocity regime (found ${sameMaterialInRadius} runs within radius ${radius})`
    );
  }

  if (gapRecommendations.length === 0) {
    gapRecommendations.push(
      'Tested flight record provides dense baseline data; recommended experiment is fine-grained flammability boundary mapping.'
    );
  }

  return {
    scenario_id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    rank: 0, // Assigned after sorting
    evidence_coverage_pct: evidenceCoveragePct,
    normalized_distance_to_nearest: Math.round(minDistance * 1000) / 1000,
    same_material_runs_in_radius: sameMaterialInRadius,
    radius,
    pressure_measured: false, // Always False in solid flight record
    pressure_extrapolation: !pMatches1Atm,
    gravity_matches: gMatchesMicrogravity,
    nearest_run: nearestRun,
    gap_recommendations: gapRecommendations,
    parameters: {
      oxygen_pct,
      pressure_kpa,
      flow_cm_s,
      gravity_g,
      material_family,
    },
  };
}

export function rankMissionsByCoverage(
  scenarios: MissionScenario[],
  radius = 0.25,
  overrides: Record<string, Partial<{ oxygen_pct: number; pressure_kpa: number; flow_cm_s: number; gravity_g: number; material_family: string }>> = {}
): GapAnalysisResult[] {
  const results = scenarios.map((s) => {
    const ov = overrides[s.id] || {};
    return computeScenarioGapMetrics(
      {
        id: s.id,
        title: s.title,
        description: s.description,
        oxygen_pct: ov.oxygen_pct ?? (Number(s.parameters.oxygen_pct.value) || 21.0),
        pressure_kpa: ov.pressure_kpa ?? (Number(s.parameters.pressure_kpa.value) || 101.3),
        flow_cm_s: ov.flow_cm_s ?? (Number(s.parameters.flow_cm_s.value) || 5.0),
        gravity_g: ov.gravity_g ?? (Number(s.parameters.gravity_g.value) || 0.0),
        material_family: ov.material_family ?? String(s.parameters.material_family.value),
      },
      radius
    );
  });

  results.sort((a, b) => b.evidence_coverage_pct - a.evidence_coverage_pct);

  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return results;
}

export function getDefaultMissions(): MissionScenario[] {
  return (rawMissions as any).scenarios as MissionScenario[];
}
