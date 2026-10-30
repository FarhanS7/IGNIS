/**
 * Real-Data Solid Fuel Matching Engine (TypeScript implementation).
 *
 * Scores user exploration scenarios directly against usable solid microgravity flight runs
 * from NASA PSI (BASS-II, Saffire-I, Saffire-II).
 *
 * Rules:
 * 1. Only usable solid runs (explicit outcome + >=2 measured/converted environmental factors).
 * 2. Factors scored: material family, oxygen concentration, flow velocity, and geometry (where measured).
 * 3. Pressure is ASSUMED for all solid runs:
 *    - Excluded from similarity scoring (weight = 0).
 *    - Never presented as a matched factor.
 *    - Mandatory coverage warning emitted: "No solid-fuel flight run measured pressure; scenario pressure untested."
 * 4. Dynamic weight renormalization across active measured factors only.
 * 5. 2D (O2, Flow) envelope calculation:
 *    - Normalized distance to nearest tested run.
 *    - Outside tested range flag.
 *    - Full array of tested flight points for plotting.
 * 6. Gravitational extrapolation caveats for Moon (0.16 g) and Mars (0.38 g).
 */

import type {
  FactorMatchDetail,
  MaterialMap,
  OutcomeClass,
  RawEvidenceSolidRun,
  RealSolidMatch,
  RealSolidMatchResult,
  SolidEnvelopeData,
  SolidScenarioInput,
  TestedEnvelopePoint,
} from "./types";

export const TESTED_O2_MIN = 13.6;
export const TESTED_O2_MAX = 22.2;
export const TESTED_FLOW_MIN = 0.0;
export const TESTED_FLOW_MAX = 28.18;

export const TOLERANCE_O2 = 10.0;
export const TOLERANCE_FLOW = 20.0;
export const TOLERANCE_THICKNESS = 5.0;

export const DEFAULT_WEIGHTS_WITH_GEOMETRY: Record<string, number> = {
  material: 0.40,
  oxygen: 0.35,
  flow: 0.20,
  geometry: 0.05,
};

export const DEFAULT_WEIGHTS_WITHOUT_GEOMETRY: Record<string, number> = {
  material: 0.45,
  oxygen: 0.35,
  flow: 0.20,
};

export function extractMaterialFamily(materialStr: string | null | undefined): string {
  const m = (materialStr || "").toLowerCase();
  if (m.includes("sibal") || m.includes("cotton")) {
    return "SIBAL";
  }
  if (["pmma", "acrylic", "plexiglas", "rod", "film", "slab", "spherical", "clear", "black", "micron"].some((k) => m.includes(k))) {
    return "PMMA";
  }
  if (m.includes("nomex")) {
    return "Nomex";
  }
  if (m.includes("silicone")) {
    return "Silicone";
  }
  if (m.includes("wax") || m.includes("candle")) {
    return "Wax";
  }
  if (m.includes("fabric")) {
    return "Fabric/Polymer";
  }
  return "Other";
}

export function extractGeometry(materialStr: string | null | undefined, investigationId: string = ""): [string | null, number | null] {
  const mat = (materialStr || "").toLowerCase();
  let shape: string | null = null;
  let thickness_mm: number | null = null;

  if (mat.includes("rod")) {
    shape = "rod";
    if (mat.includes("1/4")) {
      thickness_mm = 6.35;
    } else if (mat.includes("3/8")) {
      thickness_mm = 9.525;
    } else if (mat.includes("1/2") || mat.includes("0.5")) {
      thickness_mm = 12.7;
    }
  } else if (mat.includes("spherical") || mat.includes("sphere")) {
    shape = "sphere";
    thickness_mm = 40.0;
  } else if (mat.includes("candle")) {
    shape = "cylinder";
  } else if (["film", "micron", "slab", "sibal", "nomex", "silicone", "fabric", "pmma", "sheet", "flat"].some((k) => mat.includes(k))) {
    shape = "flat";
    const m_mic = mat.match(/(\d+)\s*micron/);
    const m_mm_thick = mat.match(/(\d+(?:\.\d+)?)\s*mm\s*thick/);
    const m_mm = mat.match(/(\d+(?:\.\d+)?)\s*mm/);
    if (m_mic) {
      thickness_mm = parseFloat(m_mic[1]) / 1000.0;
    } else if (m_mm_thick) {
      thickness_mm = parseFloat(m_mm_thick[1]);
    } else if (mat.includes("0.1 mm")) {
      thickness_mm = 0.1;
    } else if (mat.includes("0.2 mm")) {
      thickness_mm = 0.2;
    } else if (mat.includes("0.4 mm")) {
      thickness_mm = 0.4;
    } else if (m_mm) {
      thickness_mm = parseFloat(m_mm[1]);
    } else if (investigationId === "PSI-98") {
      thickness_mm = 3.7;
    } else if (investigationId === "PSI-99") {
      thickness_mm = 0.4;
    } else if (mat.includes("sibal")) {
      thickness_mm = 0.3;
    }
  }

  return [shape, thickness_mm];
}

export function computeMaterialSimilarity(targetFamily: string, candidateFamily: string): number {
  if (targetFamily === candidateFamily) {
    return 1.0;
  }
  const pair = new Set([targetFamily, candidateFamily]);
  if (pair.has("SIBAL") && pair.has("Fabric/Polymer")) {
    return 0.70;
  }
  if (pair.has("SIBAL") && pair.has("Nomex")) {
    return 0.50;
  }
  if (pair.has("PMMA") && pair.has("Fabric/Polymer")) {
    return 0.30;
  }
  if (pair.has("SIBAL") && pair.has("PMMA")) {
    return 0.10;
  }
  return 0.0;
}

function roundN(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

interface ProcessedRun {
  raw: RawEvidenceSolidRun;
  run_uid: string;
  investigation_id: string;
  source_file: string;
  source_row: number;
  material: string;
  material_family: string;
  o2: number;
  o2_basis: any;
  flow: number;
  flow_basis: any;
  outcome_class: OutcomeClass;
  shape: string | null;
  thickness_mm: number | null;
  u: number;
  v: number;
}

export class RealSolidMatcher {
  private materialMap: MaterialMap;
  private usableRuns: RawEvidenceSolidRun[];
  private processedRuns: ProcessedRun[] = [];
  public testedPoints: TestedEnvelopePoint[] = [];

  constructor(
    runs: RawEvidenceSolidRun[],
    materialMap: MaterialMap = {}
  ) {
    this.materialMap = materialMap;
    this.usableRuns = runs.filter((r) => r.usable_for_matching === true);
    if (this.usableRuns.length === 0) {
      throw new Error("No usable solid runs found in evidence dataset.");
    }

    for (const r of this.usableRuns) {
      const o2_val = r.oxygen_pct.value;
      const flow_val = r.flow_cm_s.value;
      const raw_mat = r.material || "";

      let mat_fam: string;
      let shape: string | null = null;
      let thick: number | null = null;

      if (this.materialMap[raw_mat]) {
        const mat_entry = this.materialMap[raw_mat];
        mat_fam = mat_entry.family;
        shape = mat_entry.geometry;
        thick = mat_entry.thickness_mm;
      } else {
        mat_fam = extractMaterialFamily(raw_mat);
        const [extracted_shape, extracted_thick] = extractGeometry(raw_mat, r.investigation_id || "");
        shape = extracted_shape;
        thick = extracted_thick;
      }

      const u = (o2_val - TESTED_O2_MIN) / (TESTED_O2_MAX - TESTED_O2_MIN);
      const v = (flow_val - TESTED_FLOW_MIN) / (TESTED_FLOW_MAX - TESTED_FLOW_MIN);

      const processed: ProcessedRun = {
        raw: r,
        run_uid: r.run_uid,
        investigation_id: r.investigation_id,
        source_file: r.oxygen_pct.source_file,
        source_row: r.oxygen_pct.source_row,
        material: raw_mat,
        material_family: mat_fam,
        o2: o2_val,
        o2_basis: r.oxygen_pct.basis,
        flow: flow_val,
        flow_basis: r.flow_cm_s.basis,
        outcome_class: r.outcome_class || "unknown",
        shape,
        thickness_mm: thick,
        u,
        v,
      };

      this.processedRuns.push(processed);
      this.testedPoints.push({
        run_uid: r.run_uid,
        oxygen_pct: roundN(o2_val, 2),
        flow_cm_s: roundN(flow_val, 2),
        material: raw_mat,
        material_family: mat_fam,
        outcome_class: r.outcome_class || "unknown",
      });
    }
  }

  public match(
    scenario: SolidScenarioInput,
    weights?: Record<string, number> | null,
    top_k?: number | null
  ): RealSolidMatchResult {
    let target_family: string;
    if (this.materialMap[scenario.material]) {
      target_family = this.materialMap[scenario.material].family;
    } else {
      target_family = extractMaterialFamily(scenario.material);
    }

    const has_geometry = scenario.geometry != null || scenario.thickness_mm != null;

    let raw_weights: Record<string, number>;
    if (weights != null) {
      raw_weights = { ...weights };
    } else if (has_geometry) {
      raw_weights = { ...DEFAULT_WEIGHTS_WITH_GEOMETRY };
    } else {
      raw_weights = { ...DEFAULT_WEIGHTS_WITHOUT_GEOMETRY };
    }

    // PRESSURE EPISTEMIC RULE: Exclude pressure from scoring
    delete raw_weights.pressure;

    const u_s = (scenario.oxygen_pct - TESTED_O2_MIN) / (TESTED_O2_MAX - TESTED_O2_MIN);
    const v_s = (scenario.flow_cm_s - TESTED_FLOW_MIN) / (TESTED_FLOW_MAX - TESTED_FLOW_MIN);

    const outside_tested_range =
      scenario.oxygen_pct < TESTED_O2_MIN ||
      scenario.oxygen_pct > TESTED_O2_MAX ||
      scenario.flow_cm_s < TESTED_FLOW_MIN ||
      scenario.flow_cm_s > TESTED_FLOW_MAX;

    let nearest_dist_sq = Infinity;
    const scored_matches: RealSolidMatch[] = [];

    for (const pr of this.processedRuns) {
      // 1. 2D Euclidean envelope distance in normalized space
      const dist_sq = Math.pow(u_s - pr.u, 2) + Math.pow(v_s - pr.v, 2);
      if (dist_sq < nearest_dist_sq) {
        nearest_dist_sq = dist_sq;
      }

      // 2. Factor-level similarities
      const mat_sim = computeMaterialSimilarity(target_family, pr.material_family);

      const diff_o2 = Math.abs(scenario.oxygen_pct - pr.o2);
      const o2_sim = Math.max(0.0, 1.0 - diff_o2 / TOLERANCE_O2);

      const diff_flow = Math.abs(scenario.flow_cm_s - pr.flow);
      const flow_sim = Math.max(0.0, 1.0 - diff_flow / TOLERANCE_FLOW);

      let geom_sim: number | null = null;
      if (has_geometry && pr.shape !== null) {
        const shape_sim =
          scenario.geometry && scenario.geometry.toLowerCase() === pr.shape ? 1.0 : 0.4;
        if (scenario.thickness_mm != null && pr.thickness_mm != null) {
          const diff_t = Math.abs(scenario.thickness_mm - pr.thickness_mm);
          const t_sim = Math.max(0.0, 1.0 - diff_t / TOLERANCE_THICKNESS);
          geom_sim = (shape_sim + t_sim) / 2.0;
        } else {
          geom_sim = shape_sim;
        }
      }

      // 3. Dynamic weight renormalization over active measured factors
      const factor_scores: Record<string, number> = {
        material: mat_sim,
        oxygen: o2_sim,
        flow: flow_sim,
      };
      if (geom_sim !== null && "geometry" in raw_weights) {
        factor_scores.geometry = geom_sim;
      }

      let total_active_weight = 0;
      for (const f of Object.keys(factor_scores)) {
        if (f in raw_weights) {
          total_active_weight += raw_weights[f];
        }
      }

      const norm_weights: Record<string, number> = {};
      const num_factors = Object.keys(factor_scores).length;
      for (const f of Object.keys(factor_scores)) {
        if (total_active_weight > 0 && f in raw_weights) {
          norm_weights[f] = raw_weights[f] / total_active_weight;
        } else {
          norm_weights[f] = 1.0 / num_factors;
        }
      }

      let overall_sim = 0;
      for (const f of Object.keys(factor_scores)) {
        overall_sim += factor_scores[f] * norm_weights[f];
      }

      // 4. Factor breakdowns with provenance basis
      const factors_detail: Record<string, FactorMatchDetail> = {
        material: {
          factor: "material",
          scenario_value: scenario.material,
          experiment_value: pr.material,
          basis: pr.raw.fuel_class === "solid" ? "measured" : "transcribed",
          similarity: roundN(mat_sim, 4),
          weight: roundN(norm_weights.material, 4),
          note: `Family match: ${target_family} vs ${pr.material_family}`,
        },
        oxygen: {
          factor: "oxygen",
          scenario_value: scenario.oxygen_pct,
          experiment_value: pr.o2,
          basis: pr.o2_basis,
          similarity: roundN(o2_sim, 4),
          weight: roundN(norm_weights.oxygen, 4),
          note: `Delta O2: ${roundN(diff_o2, 2)}%`,
        },
        flow: {
          factor: "flow",
          scenario_value: scenario.flow_cm_s,
          experiment_value: pr.flow,
          basis: pr.flow_basis,
          similarity: roundN(flow_sim, 4),
          weight: roundN(norm_weights.flow, 4),
          note: `Delta flow: ${roundN(diff_flow, 2)} cm/s`,
        },
      };

      if (geom_sim !== null && "geometry" in norm_weights) {
        factors_detail.geometry = {
          factor: "geometry",
          scenario_value: `${scenario.geometry || "any"} (${scenario.thickness_mm != null ? scenario.thickness_mm : "any"} mm)`,
          experiment_value: `${pr.shape} (${pr.thickness_mm} mm)`,
          basis: pr.thickness_mm !== null ? "measured" : "derived",
          similarity: roundN(geom_sim, 4),
          weight: roundN(norm_weights.geometry, 4),
          note: "Shape and dimension comparison",
        };
      }

      scored_matches.push({
        run_uid: pr.run_uid,
        source_file: pr.source_file,
        source_row: pr.source_row,
        similarity: roundN(overall_sim, 4),
        outcome_class: pr.outcome_class,
        factors: factors_detail,
        metadata: {
          investigation_id: pr.investigation_id,
          platform: pr.raw.platform,
          frames_shot: pr.raw.frames_shot,
          outcome_source_column: pr.raw.outcome_source_column || "none",
        },
      });
    }

    // Sort matches: similarity descending, then run_uid descending (matching Python's tuple sort)
    scored_matches.sort((a, b) => {
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      }
      return b.run_uid.localeCompare(a.run_uid);
    });

    let final_matches = scored_matches;
    if (top_k != null) {
      final_matches = final_matches.slice(0, top_k);
    }

    const nearest_distance_norm = roundN(Math.sqrt(nearest_dist_sq), 4);
    const envelope: SolidEnvelopeData = {
      scenario_point: {
        oxygen_pct: scenario.oxygen_pct,
        flow_cm_s: scenario.flow_cm_s,
      },
      tested_range_o2: [TESTED_O2_MIN, TESTED_O2_MAX],
      tested_range_flow: [TESTED_FLOW_MIN, TESTED_FLOW_MAX],
      nearest_distance_norm,
      outside_tested_range,
      tested_points: this.testedPoints,
    };

    const warnings: string[] = [
      "No solid-fuel flight run measured pressure; scenario pressure untested.",
    ];
    if (scenario.gravity_g != null && scenario.gravity_g > 0.01) {
      warnings.push(
        "All solid flight runs are microgravity (~0 g); lunar (0.16 g) and martian (0.38 g) predictions are extrapolations."
      );
    }
    if (outside_tested_range) {
      const formatFloat = (val: number): string => (Number.isInteger(val) ? val.toFixed(1) : val.toString());
      warnings.push(
        `Scenario conditions (O2=${formatFloat(scenario.oxygen_pct)}%, flow=${formatFloat(scenario.flow_cm_s)} cm/s) fall outside tested microgravity solid flight envelope (O2: ${formatFloat(TESTED_O2_MIN)}-${formatFloat(TESTED_O2_MAX)}%, flow: ${formatFloat(TESTED_FLOW_MIN)}-${formatFloat(TESTED_FLOW_MAX)} cm/s).`
      );
    }

    return {
      scenario,
      matches: final_matches,
      total_evaluated: this.processedRuns.length,
      envelope,
      warnings,
    };
  }
}
