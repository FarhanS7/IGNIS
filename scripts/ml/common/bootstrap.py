"""Group-level bootstrap confidence intervals for fire detection metrics.

Resamples experimental groups with replacement (default 2000 resamples, seed 42)
to calculate non-parametric 95% bootstrap confidence intervals.
"""

from typing import List, Dict, Callable, Any, Tuple
import numpy as np


def compute_group_bootstrap_ci(
    group_ids: List[str],
    eval_fn: Callable[[List[str]], float],
    n_resamples: int = 2000,
    alpha: float = 0.05,
    seed: int = 42
) -> Dict[str, float]:
    """Calculate 95% bootstrap confidence interval over grouped units.

    Parameters:
    -----------
    group_ids: list of unique experiment identifiers
    eval_fn: function taking a list of resampled group ids and returning a scalar metric
    n_resamples: number of bootstrap resamples (default 2000)
    alpha: significance level (0.05 for 95% CI)
    seed: random seed for reproducibility
    """
    rng = np.random.default_rng(seed)
    unique_groups = np.array(group_ids)
    n_groups = len(unique_groups)

    if n_groups == 0:
        return {'point': 0.0, 'ci_lower': 0.0, 'ci_upper': 0.0}

    point_estimate = float(eval_fn(list(unique_groups)))

    if n_groups == 1:
        return {'point': point_estimate, 'ci_lower': point_estimate, 'ci_upper': point_estimate}

    boot_vals = np.empty(n_resamples, dtype=float)
    for i in range(n_resamples):
        sampled_indices = rng.integers(0, n_groups, size=n_groups)
        sampled_groups = list(unique_groups[sampled_indices])
        boot_vals[i] = eval_fn(sampled_groups)

    lower_pct = 100.0 * (alpha / 2.0)
    upper_pct = 100.0 * (1.0 - alpha / 2.0)

    ci_lower = float(np.percentile(boot_vals, lower_pct))
    ci_upper = float(np.percentile(boot_vals, upper_pct))

    return {
        'point': point_estimate,
        'ci_lower': ci_lower,
        'ci_upper': ci_upper
    }

