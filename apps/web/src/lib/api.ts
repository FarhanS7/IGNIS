/**
 * Typed API Client for the IGNIS Platform.
 * Connects React frontend to FastAPI backend endpoints.
 * Reference: PRD v1.1 §21, §10, §8 | task-C11-api-client.md.
 */

import type {
  AnalysisResult,
  AskRequest,
  AskResponse,
  DataSource,
  Experiment,
  ExperimentRun,
  HabitatPreset,
  HealthResponse,
  PaginatedExperiments,
  ScenarioInput,
  Story,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class AppError extends Error {
  public status: number;
  public detail: string;
  public url: string;

  constructor(status: number, detail: string, url: string) {
    super(`API Error ${status} at ${url}: ${detail}`);
    this.name = 'AppError';
    this.status = status;
    this.detail = detail;
    this.url = url;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: { msg: string }) => e.msg).join(', ');
        }
      } catch {
        // Fallback to response.statusText if not JSON
      }
      throw new AppError(response.status, errorMessage, url);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      0,
      error instanceof Error ? error.message : 'Network connection failure',
      url
    );
  }
}

export const api = {
  // System Health
  getHealth: (): Promise<HealthResponse> => {
    return request<HealthResponse>('/health');
  },

  // Experiments
  getExperiments: (params: {
    limit?: number;
    offset?: number;
    search?: string;
    gravity?: string;
    fuel_type?: string;
    material?: string;
  } = {}): Promise<PaginatedExperiments> => {
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));
    if (params.search) query.set('search', params.search);
    if (params.gravity) query.set('gravity', params.gravity);
    if (params.fuel_type) query.set('fuel_type', params.fuel_type);
    if (params.material) query.set('material', params.material);

    const queryString = query.toString();
    return request<PaginatedExperiments>(`/experiments${queryString ? `?${queryString}` : ''}`);
  },

  getExperiment: (id: string): Promise<Experiment> => {
    return request<Experiment>(`/experiments/${id}`);
  },

  getExperimentRuns: (id: string): Promise<ExperimentRun[]> => {
    return request<ExperimentRun[]>(`/experiments/${id}/runs`);
  },

  getRelatedExperiments: (id: string): Promise<Experiment[]> => {
    return request<Experiment[]>(`/experiments/${id}/related`);
  },

  // Habitat Presets
  getHabitatPresets: (): Promise<HabitatPreset[]> => {
    return request<HabitatPreset[]>('/habitat-presets');
  },

  getHabitatPreset: (slug: string): Promise<HabitatPreset> => {
    return request<HabitatPreset>(`/habitat-presets/${slug}`);
  },

  // Matching & Evidence Engine
  analyzeHabitat: async (scenario: ScenarioInput, options?: { signal?: AbortSignal }): Promise<AnalysisResult> => {
    const payload = {
      scenario: {
        material: scenario.material,
        gravityEnvironment: scenario.gravity_environment,
        oxygenPct: scenario.oxygen_pct,
        pressureKpa: scenario.pressure_kpa,
        airflowCmS: scenario.airflow_cm_s,
        objectives: scenario.objective ? [scenario.objective] : [],
      },
      limit: 10,
    };

    const raw = await request<any>('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: options?.signal,
    });

    const bp = raw.behaviorProfile || raw.behavior_profile;
    const mappedMatches = (raw.results || raw.matches || []).map((item: any) => {
      const factors = item.factors || [];
      const oxygenFactor = factors.find((f: any) => f.factor === 'oxygen');
      const pressureFactor = factors.find((f: any) => f.factor === 'pressure');
      const airflowFactor = factors.find((f: any) => f.factor === 'airflow');
      const gravityFactor = factors.find((f: any) => f.factor === 'gravity');
      const materialFactor = factors.find((f: any) => f.factor === 'material_or_fuel' || f.factor === 'material');

      const expOxygen = oxygenFactor?.experiment_value != null ? Number(oxygenFactor.experiment_value) : null;
      const expPressure = pressureFactor?.experiment_value != null ? Number(pressureFactor.experiment_value) : null;
      const expAirflow = airflowFactor?.experiment_value != null ? Number(airflowFactor.experiment_value) : null;
      const expGravity = gravityFactor?.experiment_value != null ? String(gravityFactor.experiment_value) : null;
      const expMaterial = materialFactor?.experiment_value != null ? String(materialFactor.experiment_value) : null;

      return {
        run_id: String(item.runId || item.run_id),
        experiment_id: String(item.experimentId || item.experiment_id),
        run: {
          id: String(item.runId || item.run_id),
          experiment_id: String(item.experimentId || item.experiment_id),
          run_label: item.title,
          fuel_type: expMaterial || item.material || scenario.material,
          material: expMaterial || item.material || scenario.material,
          gravity_environment: expGravity || item.gravityEnvironment || scenario.gravity_environment,
          oxygen_pct: expOxygen != null ? expOxygen : scenario.oxygen_pct,
          pressure_kpa: expPressure != null ? expPressure : scenario.pressure_kpa,
          airflow_cm_s: expAirflow != null ? expAirflow : scenario.airflow_cm_s,
          observation_summary: item.title,
        },
      experiment: {
        id: String(item.experimentId || item.experiment_id),
        title: item.title,
        experiment_family: item.experimentFamily || item.experiment_family || 'NASA Flight Campaign',
      },
      similarity_score: item.evidenceSimilarity ?? item.similarity_score ?? 0,
      evidence_similarity: item.evidenceSimilarity ?? item.similarity_score ?? 0,
      coverage_score: item.coverage ?? item.coverage_score ?? 0,
      coverage_level: (item.coverage >= 0.8 ? 'high' : item.coverage >= 0.5 ? 'medium' : 'limited') as any,
      confidence_level: item.confidence ?? item.confidence_level ?? 'medium',
      eligibility: {
        status: item.eligibility,
        is_comparable: item.eligibility === 'eligible',
        reasons: item.eligibilityWarnings || item.warnings || [],
      },
      factor_explanations: (item.factors || []).map((f: any) => ({
        factor: f.factor,
        factor_name: f.factor,
        similarity_score: f.similarity_score,
        active_weight: f.active_weight,
        weight: f.active_weight,
        explanation: `${f.factor}: scenario ${f.scenario_value} vs flight ${f.experiment_value}`,
        scenario_value: f.scenario_value,
        experiment_value: f.experiment_value,
      })),
    };
  });

    return {
      scenario,
      total_evaluated: raw.totalEvaluated ?? raw.total_evaluated ?? 0,
      eligible_count: raw.eligibleCount ?? raw.eligible_count ?? 0,
      excluded_count: raw.excludedCount ?? raw.excluded_count ?? 0,
      behavior_profile: bp,
      matches: mappedMatches,
    };
  },

  // Ask IGNIS / Q&A
  ask: (payload: AskRequest): Promise<AskResponse> => {
    return request<AskResponse>('/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Stories (Explore Fire)
  getStories: (): Promise<Story[]> => {
    return request<Story[]>('/stories');
  },

  getStory: (slug: string): Promise<Story> => {
    return request<Story>(`/stories/${slug}`);
  },

  // Sources & Provenance
  getDataSources: (): Promise<DataSource[]> => {
    return request<DataSource[]>('/sources');
  },
};

export default api;
