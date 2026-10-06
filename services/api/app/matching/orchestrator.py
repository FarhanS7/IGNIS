"""Full Match and Analysis Orchestrator (Task B2.7 | PRD v1.1 §15, §16.5, §21.4).

Executes the complete scientific scenario pipeline:
1. Ingestion of target ScenarioInput
2. Pre-scoring filtration via Comparable-Evidence Filter (Module B1)
3. Normalized multi-attribute similarity scoring with weight renormalization
4. Coverage and confidence evaluation with strict gravity mismatch capping
5. Synthesis of the Fire Behavior Profile across eligible evidence
"""

from ..behavior.profile import build_behavior_profile
from ..db.repository import Repository, get_repository
from ..eligibility.models import EligibilityResult, ScenarioInput
from ..eligibility.orchestrator import evaluate_eligibility
from ..models.enums import ConfidenceLevel, CoverageLevel, EligibilityStatus
from .categorical import categorical_similarity
from .coverage import compute_confidence, compute_coverage
from .models import AnalysisResult, EvidenceMatch, FactorExplanation
from .numeric import DEFAULT_TOLERANCES, numeric_similarity
from .objective import objective_overlap
from .weights import compute_weighted_similarity


def run_scenario_analysis(
    scenario: ScenarioInput,
    repo: Repository | None = None,
) -> AnalysisResult:
    """Executes the full IGNIS scenario comparison and fire behavior synthesis pipeline."""
    target_repo = repo or get_repository()
    experiments = target_repo.list_experiments(limit=1000)

    total_evaluated = 0
    excluded_count = 0
    eligible_matches: list[EvidenceMatch] = []

    for exp in experiments:
        runs = target_repo.list_experiment_runs(exp.id)
        for run in runs:
            total_evaluated += 1

            # 1. Eligibility gate check
            eligibility = evaluate_eligibility(scenario, exp, run)
            if eligibility.status == EligibilityStatus.INELIGIBLE:
                excluded_count += 1
                continue

            # 2. Factor-level similarity scoring
            material_score = categorical_similarity(scenario.material, run.material)
            oxygen_score = numeric_similarity(scenario.oxygen_pct, run.oxygen_pct, DEFAULT_TOLERANCES["oxygen_pct"])
            pressure_score = numeric_similarity(scenario.pressure_kpa, run.pressure_kpa, DEFAULT_TOLERANCES["pressure_kpa"])
            airflow_score = numeric_similarity(scenario.airflow_cm_s, run.airflow_cm_s, DEFAULT_TOLERANCES["airflow_cm_s"])
            objective_score = objective_overlap(scenario.objective, exp.objectives)
            geometry_score = 1.0 if (run.geometry and run.geometry.lower() in ("flat", "sheet", "film")) else None

            factor_scores = {
                "material_or_fuel": material_score,
                "oxygen": oxygen_score,
                "pressure": pressure_score,
                "airflow": airflow_score,
                "objective": objective_score,
                "geometry": geometry_score,
            }

            # 3. Weighted similarity with renormalization
            raw_similarity, active_weights = compute_weighted_similarity(factor_scores)
            similarity_score = raw_similarity if raw_similarity is not None else 0.0

            # 4. Coverage and confidence with gravity mismatch capping
            coverage_score, coverage_level = compute_coverage(active_weights.keys())
            has_gravity_mismatch = any("gravity" in w.lower() for w in eligibility.warnings)
            has_major_warning = len(eligibility.warnings) > 0
            confidence_level = compute_confidence(
                coverage_score,
                has_gravity_mismatch=has_gravity_mismatch,
                has_major_warning=has_major_warning,
            )

            # 5. Explanations breakdown
            scenario_values = {
                "material_or_fuel": scenario.material.value,
                "oxygen": scenario.oxygen_pct,
                "pressure": scenario.pressure_kpa,
                "airflow": scenario.airflow_cm_s,
                "objective": scenario.objective.value,
                "geometry": "reference",
            }
            experiment_values = {
                "material_or_fuel": run.material.value if run.material else None,
                "oxygen": run.oxygen_pct,
                "pressure": run.pressure_kpa,
                "airflow": run.airflow_cm_s,
                "objective": ", ".join(o.value for o in exp.objectives),
                "geometry": run.geometry,
            }

            explanations = [
                FactorExplanation(
                    factor=factor,
                    scenario_value=scenario_values.get(factor),
                    experiment_value=experiment_values.get(factor),
                    similarity_score=round(factor_scores[factor], 4) if factor_scores[factor] is not None else None,
                    active_weight=round(active_weights.get(factor, 0.0), 4),
                )
                for factor in active_weights.keys()
            ]

            match = EvidenceMatch(
                run=run,
                experiment=exp,
                similarity_score=round(similarity_score, 4),
                coverage_score=round(coverage_score, 4),
                coverage_level=coverage_level,
                confidence_level=confidence_level,
                eligibility=eligibility,
                factor_explanations=explanations,
            )
            eligible_matches.append(match)

    # 6. Sort matches descending by similarity score, tie-break deterministically by run UUID
    eligible_matches.sort(
        key=lambda m: (m.similarity_score, str(m.run.id)),
        reverse=True,
    )

    # 7. Synthesize Fire Behavior Profile from top eligible evidence
    top_matches = eligible_matches[:20]
    top_runs = [m.run for m in top_matches]
    unique_exps_count = len({m.experiment.id for m in top_matches})

    profile_coverage = CoverageLevel.MEDIUM
    profile_confidence = CoverageLevel.MEDIUM
    if top_matches:
        profile_coverage = top_matches[0].coverage_level
        profile_confidence = top_matches[0].confidence_level

    behavior_profile = build_behavior_profile(
        top_runs,
        unique_experiments_count=unique_exps_count,
        coverage=profile_coverage,
        confidence=profile_confidence,
    )

    return AnalysisResult(
        scenario=scenario,
        matches=eligible_matches,
        behavior_profile=behavior_profile,
        total_evaluated=total_evaluated,
        eligible_count=len(eligible_matches),
        excluded_count=excluded_count,
    )
