"""Feature extraction for M2 multi-sensor fusion detector.

Implements unit-free, dimensionless features matching docs/models/feature_spec.md:
- Background-normalized level
- Least-squares window slope (exact causal convolution filter)
- Window maximum level
- Cross-channel agreement fraction
"""

from typing import List, Dict, Tuple, Optional
import numpy as np
import pandas as pd


CHANNELS = ['PM25_Room', 'CO_Room', 'Temperature_Room']


def compute_baseline_stats(
    series: np.ndarray,
    k: int = 10
) -> Tuple[float, float]:
    """Compute baseline median and scale epsilon from the first k samples."""
    k_eff = min(k, len(series))
    if k_eff <= 0:
        return 0.0, 1.0

    init_samples = series[:k_eff]
    b = float(np.median(init_samples))
    mad = float(np.median(np.abs(init_samples - b)))
    eps = max(1e-6, mad)
    scale = max(abs(b), eps)
    return b, scale


def extract_features_from_dataframe(
    df: pd.DataFrame,
    window_size: int = 6,
    k_baseline: int = 10,
    z_thresholds: Tuple[float, float, float] = (0.5, 0.5, 0.2),
    smoke_col: str = 'PM25_Room',
    co_col: str = 'CO_Room',
    temp_col: str = 'Temperature_Room'
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, List[str]]:
    """Vectorized feature extraction from experiment DataFrame.

    Returns:
    - X: feature matrix (N, 10)
    - y: binary targets (1 for Fire, 0 for Nuisance/Background)
    - groups: experiment_id per sample
    - feature_names: list of 10 feature names
    """
    feature_names = [
        'L_smoke', 'L_co', 'L_temp',
        'S_smoke', 'S_co', 'S_temp',
        'M_smoke', 'M_co', 'M_temp',
        'agreement_fraction'
    ]

    # Precompute causal least-squares slope convolution kernel
    w = window_size
    u = np.linspace(0.0, 1.0, w)
    u_bar = 0.5
    denom = np.sum((u - u_bar) ** 2)
    slope_kernel = ((u - u_bar) / denom)[::-1]

    all_X: List[np.ndarray] = []
    all_y: List[np.ndarray] = []
    all_groups: List[np.ndarray] = []

    # Group by (experiment_id, Sensor_ID)
    grouped = df.groupby(['experiment_id', 'Sensor_ID'], sort=False)

    for (exp_id, sensor_id), group_df in grouped:
        n_samples = len(group_df)
        if n_samples < window_size:
            continue

        smoke = group_df[smoke_col].to_numpy(dtype=float)
        co = group_df[co_col].to_numpy(dtype=float)
        temp = group_df[temp_col].to_numpy(dtype=float)

        # Baseline per experiment segment
        b_smoke, s_smoke = compute_baseline_stats(smoke, k=k_baseline)
        b_co, s_co = compute_baseline_stats(co, k=k_baseline)
        b_temp, s_temp = compute_baseline_stats(temp, k=k_baseline)

        # 1. Background-normalized levels
        norm_smoke = (smoke - b_smoke) / s_smoke
        norm_co = (co - b_co) / s_co
        norm_temp = (temp - b_temp) / s_temp

        # Slices for trailing window
        L_smoke = norm_smoke[w - 1:]
        L_co = norm_co[w - 1:]
        L_temp = norm_temp[w - 1:]

        # 2. Least-squares slopes via causal convolution
        S_smoke = np.convolve(norm_smoke, slope_kernel, mode='valid')
        S_co = np.convolve(norm_co, slope_kernel, mode='valid')
        S_temp = np.convolve(norm_temp, slope_kernel, mode='valid')

        # 3. Window maximums via pandas rolling
        M_smoke = pd.Series(norm_smoke).rolling(window=w).max().to_numpy()[w - 1:]
        M_co = pd.Series(norm_co).rolling(window=w).max().to_numpy()[w - 1:]
        M_temp = pd.Series(norm_temp).rolling(window=w).max().to_numpy()[w - 1:]

        # 4. Cross-channel agreement fraction
        agree_smoke = (L_smoke >= z_thresholds[0]).astype(float)
        agree_co = (L_co >= z_thresholds[1]).astype(float)
        agree_temp = (L_temp >= z_thresholds[2]).astype(float)
        A = (agree_smoke + agree_co + agree_temp) / 3.0

        # Stack group features (M, 10)
        group_X = np.column_stack([
            L_smoke, L_co, L_temp,
            S_smoke, S_co, S_temp,
            M_smoke, M_co, M_temp,
            A
        ])

        # Target label
        if 'ternary_label' in group_df.columns:
            group_y = (group_df['ternary_label'].iloc[w - 1:] == 'Fire').to_numpy(dtype=int)
        else:
            group_y = np.zeros(len(L_smoke), dtype=int)

        group_ids = np.full(len(L_smoke), str(exp_id), dtype=object)

        all_X.append(group_X)
        all_y.append(group_y)
        all_groups.append(group_ids)

    if not all_X:
        return np.empty((0, 10), dtype=np.float32), np.empty(0, dtype=int), np.empty(0, dtype=str), feature_names

    X_mat = np.vstack(all_X).astype(np.float32)
    y_vec = np.concatenate(all_y).astype(int)
    groups_vec = np.concatenate(all_groups).astype(str)

    return X_mat, y_vec, groups_vec, feature_names
