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
  analyzeHabitat: (scenario: ScenarioInput): Promise<AnalysisResult> => {
    return request<AnalysisResult>('/analyze', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
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
