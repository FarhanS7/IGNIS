"""Train/test experimental group splits for M2 fusion detector.

Guarantees ZERO row leakage by strictly partitioning on experiment identifiers.
S1: Leave-one-scenario-out (generalization to unseen fire and nuisance fuels).
S2: Cross-site split (D1 EN54 room vs D2 industrial hall domain shift).
S3: Leave-one-repetition-out (optimistic sanity check).
"""

from typing import List, Dict, Tuple, Generator, Set
import numpy as np
import pandas as pd


FIRE_SCENARIOS = ['Wood', 'Candles', 'Cable', 'Lunts']
NUISANCE_SCENARIOS = ['Ethanol', 'Deodorant', 'Hairspray', 'Green_Waste', 'Exhaust', 'CO', 'Smoke', 'Welding', 'Abrasive_Cutting']


def get_s1_leave_one_scenario_splits(
    df: pd.DataFrame
) -> List[Tuple[str, np.ndarray, np.ndarray]]:
    """Leave-one-scenario-out splits on D1.

    For each fire scenario and each nuisance scenario:
    - Test fold: all experiments of that held-out scenario (+ adjacent background).
    - Train fold: all experiments of all remaining scenarios.

    Returns:
    - List of (scenario_name, train_mask, test_mask)
    """
    splits = []
    scenarios = [s for s in sorted(df['scenario_label'].unique()) if s != 'Background']

    for held_out in scenarios:
        test_mask = (df['scenario_label'] == held_out).to_numpy()
        train_mask = ~test_mask & (df['scenario_label'] != 'Background')

        # Check disjointness of groups
        train_groups = set(df.loc[train_mask, 'experiment_id'].unique())
        test_groups = set(df.loc[test_mask, 'experiment_id'].unique())
        assert len(train_groups.intersection(test_groups)) == 0, "Group leakage detected in S1 split!"

        splits.append((held_out, train_mask, test_mask))

    return splits


def get_s2_cross_site_split(
    df_d1: pd.DataFrame,
    df_d2: pd.DataFrame
) -> List[Tuple[str, pd.DataFrame, pd.DataFrame]]:
    """Cross-site generalization splits between EN54 test room (D1) and Industrial Hall (D2).

    1. Train D1 -> Test D2
    2. Train D2 -> Test D1
    """
    # Ensure disjoint group IDs
    d1_groups = set(df_d1['experiment_id'].unique())
    d2_groups = set(df_d2['experiment_id'].unique())
    assert len(d1_groups.intersection(d2_groups)) == 0, "Cross-site group collision!"

    return [
        ("D1_train_to_D2_test", df_d1, df_d2),
        ("D2_train_to_D1_test", df_d2, df_d1)
    ]


def get_s3_leave_repetition_out_splits(
    df: pd.DataFrame
) -> List[Tuple[str, np.ndarray, np.ndarray]]:
    """Leave-one-repetition-out within each fire scenario.

    For each repetition of each fire scenario:
    - Test fold: that specific repetition experiment.
    - Train fold: all other experiments in the dataset (other repetitions of that scenario,
      plus other scenarios and background/nuisance data).
    """
    splits = []
    for scenario in FIRE_SCENARIOS:
        scen_df = df[df['scenario_label'] == scenario]
        reps = sorted(scen_df['repetition'].unique())
        if len(reps) <= 1:
            continue

        for held_rep in reps:
            test_mask = (df['scenario_label'] == scenario) & (df['repetition'] == held_rep)
            train_mask = ~test_mask

            train_groups = set(df.loc[train_mask, 'experiment_id'].unique())
            test_groups = set(df.loc[test_mask, 'experiment_id'].unique())
            assert len(train_groups.intersection(test_groups)) == 0, "Group leakage detected in S3 split!"

            splits.append((f"{scenario}_rep{held_rep:02d}", train_mask.to_numpy(), test_mask.to_numpy()))

    return splits
