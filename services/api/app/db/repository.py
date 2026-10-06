"""Repository layer for IGNIS database entities (PRD v1.1 §18, §21).

Provides clean data access for Experiments, ExperimentRuns, HabitatPresets, DataSources, etc.
Supports both live Supabase PostgREST queries and high-fidelity local fixture storage.
"""

import json
from pathlib import Path
from uuid import UUID
from typing import Any

from ..config import settings
from ..models.enums import GravityEnvironment, FuelType, MaterialFamily
from ..models.experiment import ExperimentRead, ExperimentRunRead
from ..models.habitat_preset import HabitatPresetRead
from ..models.data_source import DataSourceRead


class Repository:
    """Data repository with fallback fixture support."""

    def __init__(self, fixtures_dir: Path | None = None):
        self.fixtures_dir = fixtures_dir or settings.FIXTURES_DIR
        self._experiments: dict[UUID, ExperimentRead] = {}
        self._runs: list[ExperimentRunRead] = []
        self._presets: list[HabitatPresetRead] = []
        self._data_sources: list[DataSourceRead] = []
        self._load_from_fixtures()

    def _load_from_fixtures(self) -> None:
        """Loads data from local fixture JSON files."""
        if not self.fixtures_dir.exists():
            return

        # Load data sources
        ds_file = self.fixtures_dir / "data_sources.json"
        if ds_file.exists():
            with open(ds_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._data_sources = [DataSourceRead.model_validate(r) for r in data]

        # Load experiments
        exp_file = self.fixtures_dir / "experiments.json"
        if exp_file.exists():
            with open(exp_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for r in data:
                    model = ExperimentRead.model_validate(r)
                    self._experiments[model.id] = model

        # Load experiment runs
        runs_file = self.fixtures_dir / "experiment_runs.json"
        if runs_file.exists():
            with open(runs_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._runs = [ExperimentRunRead.model_validate(r) for r in data]

        # Load habitat presets
        presets_file = self.fixtures_dir / "habitat_presets.json"
        if presets_file.exists():
            with open(presets_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._presets = [HabitatPresetRead.model_validate(r) for r in data]

    def list_experiments(
        self,
        gravity_environment: GravityEnvironment | None = None,
        fuel_type: FuelType | None = None,
        material_family: MaterialFamily | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ExperimentRead]:
        """Lists experiments with optional filtering."""
        results = list(self._experiments.values())

        if gravity_environment:
            results = [e for e in results if e.gravity_environment == gravity_environment]

        if fuel_type or material_family:
            filtered = []
            for exp in results:
                exp_runs = self.list_experiment_runs(exp.id)
                if fuel_type and not any(r.fuel_type == fuel_type for r in exp_runs):
                    continue
                if material_family and not any(r.material == material_family for r in exp_runs):
                    continue
                filtered.append(exp)
            results = filtered

        return results[offset : offset + limit]

    def get_experiment(self, experiment_id: UUID) -> ExperimentRead | None:
        """Retrieves a single experiment by its UUID."""
        return self._experiments.get(experiment_id)

    def list_experiment_runs(self, experiment_id: UUID) -> list[ExperimentRunRead]:
        """Lists all test runs associated with a given experiment."""
        return [r for r in self._runs if r.experiment_id == experiment_id]

    def get_related_experiments(self, experiment_id: UUID, limit: int = 5) -> list[ExperimentRead]:
        """Finds related experiments sharing fuel type, material family, or gravity."""
        target = self.get_experiment(experiment_id)
        if not target:
            return []

        target_runs = self.list_experiment_runs(experiment_id)
        target_fuels = {r.fuel_type for r in target_runs if r.fuel_type}
        target_materials = {r.material for r in target_runs if r.material}

        scored: list[tuple[int, ExperimentRead]] = []
        for exp_id, exp in self._experiments.items():
            if exp_id == experiment_id:
                continue

            score = 0
            exp_runs = self.list_experiment_runs(exp_id)
            exp_fuels = {r.fuel_type for r in exp_runs if r.fuel_type}
            exp_materials = {r.material for r in exp_runs if r.material}

            # Shared material families
            if target_materials.intersection(exp_materials):
                score += 3
            # Shared fuel types
            if target_fuels.intersection(exp_fuels):
                score += 2
            # Shared gravity environment
            if exp.gravity_environment == target.gravity_environment:
                score += 1

            if score > 0:
                scored.append((score, exp))

        # Sort descending by score
        scored.sort(key=lambda item: item[0], reverse=True)
        return [item[1] for item in scored[:limit]]

    def list_habitat_presets(self) -> list[HabitatPresetRead]:
        """Lists all habitat presets."""
        return list(self._presets)

    def get_habitat_preset_by_slug(self, slug: str) -> HabitatPresetRead | None:
        """Retrieves a single preset by its unique slug."""
        for p in self._presets:
            if p.slug == slug:
                return p
        return None


# Singleton instance
_repo_instance: Repository | None = None


def get_repository() -> Repository:
    """Dependency injector / factory for the Repository instance."""
    global _repo_instance
    if _repo_instance is None:
        _repo_instance = Repository()
    return _repo_instance
