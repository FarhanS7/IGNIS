"""Experiment and group segmentation for multi-sensor fire datasets.

Segments continuous time series into discrete experimental units (scenario x repetition)
and contiguous background segments, ensuring strictly disjoint train/test splits.
"""

from typing import List, Dict, Tuple, Optional, Any
import pandas as pd
import numpy as np


def assign_experiment_groups(
    df: pd.DataFrame,
    dataset_name: str = "D1"
) -> pd.DataFrame:
    """Assign deterministic experiment_id and repetition_id to each row.

    Rules:
    - Segments per sensor stream to guarantee exact alignment.
    - Consecutive non-Background rows of the same scenario form an active experiment.
    - Each active experiment receives a unique id: f"{dataset_name}_{scenario}_rep{rep:02d}".
    - Background segments between experiments are assigned as f"{dataset_name}_bg_{bg_idx:03d}".
    """
    df = df.copy()

    scenario_col = 'scenario_label'
    if scenario_col not in df.columns:
        raise ValueError(f"Required column '{scenario_col}' not found in dataframe")

    exp_ids = np.empty(len(df), dtype=object)
    reps = np.empty(len(df), dtype=int)
    exp_types = np.empty(len(df), dtype=object)

    grouped = df.groupby('Sensor_ID', sort=False)
    for sensor_id, grp in grouped:
        indices = grp.index.to_numpy()
        labels = grp[scenario_col].to_numpy()

        rep_counters: Dict[str, int] = {}
        bg_counter = 0
        curr_label = None
        curr_exp_id = ""
        curr_rep = 0
        curr_type = ""

        for idx, lbl in zip(indices, labels):
            if lbl != curr_label:
                curr_label = lbl
                if lbl == 'Background':
                    bg_counter += 1
                    curr_exp_id = f"{dataset_name}_bg_{bg_counter:03d}"
                    curr_rep = bg_counter
                    curr_type = "Background"
                else:
                    rep_counters[lbl] = rep_counters.get(lbl, 0) + 1
                    curr_rep = rep_counters[lbl]
                    curr_exp_id = f"{dataset_name}_{lbl}_rep{curr_rep:02d}"
                    curr_type = lbl
            exp_ids[idx] = curr_exp_id
            reps[idx] = curr_rep
            exp_types[idx] = curr_type

    df['experiment_id'] = exp_ids
    df['repetition'] = reps
    df['experiment_type'] = exp_types

    return df
