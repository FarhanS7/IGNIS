"""Data loader for NASA FLEX (PSI-69) and FLEX-2 (PSI-68) droplet combustion flight experiments.

Loads flight telemetry from data/raw/PSI-69_Experimental table_FLEX.csv:
- Fuels: Methanol (polar alcohol) and Heptane (alkane hydrocarbon)
- Atmospheric components: O2, CO2, N2, He mole fractions
- Pressure (kPa) and initial droplet diameter (mm)
- Grouping: Environmental gas mixture setting (prevents repeated-test leakage)
- Binary Target: 1 = Extinguished (quenched at finite diameter), 0 = Sustained (completion / disruption)
"""

import os
from typing import Dict, List, Tuple, Optional
import numpy as np
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
FLEX_CSV_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'PSI-69_Experimental table_FLEX.csv')

FEATURE_NAMES = [
    'oxygen_mole_fraction',
    'co2_mole_fraction',
    'nitrogen_mole_fraction',
    'helium_mole_fraction',
    'ambient_pressure_kpa',
    'droplet_initial_diameter_mm',
    'is_heptane'
]


def load_flex_dataset(csv_path: Optional[str] = None) -> pd.DataFrame:
    """Load cleaned, validated FLEX droplet flight dataset."""
    path = csv_path or FLEX_CSV_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"FLEX dataset not found at: {path}")

    df = pd.read_csv(path, encoding='latin1')

    # Coerce numeric environmental and geometry columns
    df['o2'] = pd.to_numeric(df['O initial ambient composition; mole fraction'], errors='coerce')
    df['co2'] = pd.to_numeric(df['CO initial ambient composition; mole fraction'], errors='coerce')
    df['n2'] = pd.to_numeric(df['N initial ambient composition; mole fraction'], errors='coerce')
    df['he'] = pd.to_numeric(df['He initial ambient composition; mole fraction'], errors='coerce')
    # Convert mmHg to kPa (1 mmHg = 0.133322 kPa)
    df['pressure_kpa'] = pd.to_numeric(df['Ambient pressure; mmHg'], errors='coerce') * 0.133322
    df['droplet_d0_mm'] = pd.to_numeric(df['Droplet initial diameter; mm'], errors='coerce')
    df['fuel'] = df['Fuel'].astype(str)
    df['test_end'] = df['Test end'].astype(str)

    # Filter complete records with valid initial diameter and gas composition
    valid = (
        df['o2'].notna() &
        df['co2'].notna() &
        df['n2'].notna() &
        df['he'].notna() &
        df['pressure_kpa'].notna() &
        df['droplet_d0_mm'].notna() &
        df['test_end'].isin(['Extinction', 'Disruption', 'Completion'])
    )
    clean_df = df[valid].copy().reset_index(drop=True)

    # Binary target: 1 = Extinguished, 0 = Sustained (Disruption or Completion)
    clean_df['is_extinguished'] = (clean_df['test_end'] == 'Extinction').astype(int)
    clean_df['is_heptane'] = (clean_df['fuel'] == 'Heptane').astype(float)

    # Experimental Mixture Group ID (prevents repeated-test leakage)
    press_bin = (clean_df['pressure_kpa'] / 10.0).round() * 10.0
    clean_df['mixture_group_id'] = [
        f"{f}_O2_{o:.2f}_CO2_{c:.2f}_He_{h:.2f}_P_{p:.0f}"
        for f, o, c, h, p in zip(
            clean_df['fuel'],
            clean_df['o2'],
            clean_df['co2'],
            clean_df['he'],
            press_bin
        )
    ]

    return clean_df


def extract_features_and_labels(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, List[str], List[str]]:
    """Extract standard feature matrix X, target vector y, group IDs, and feature names."""
    X = np.column_stack([
        df['o2'].to_numpy(dtype=float),
        df['co2'].to_numpy(dtype=float),
        df['n2'].to_numpy(dtype=float),
        df['he'].to_numpy(dtype=float),
        df['pressure_kpa'].to_numpy(dtype=float),
        df['droplet_d0_mm'].to_numpy(dtype=float),
        df['is_heptane'].to_numpy(dtype=float)
    ])
    y = df['is_extinguished'].to_numpy(dtype=int)
    groups = df['mixture_group_id'].tolist()
    return X, y, groups, FEATURE_NAMES

