"""Data loader and preprocessor for NASA SAME/SAME-R microgravity flight telemetry.

Loads analyzed flight telemetry from PSI-101 / PSI-102:
- Targets: Photoelectric detector sensitivity (R_photo) and Ionization detector sensitivity (R_ion)
- Features: Aerodynamic Mean Diameter (AMD), Inlet Velocity, Net Aging Duration, Sample Temperature
- Spacecraft Materials: Teflon, Kapton, Lampwick (cotton), Silicone, Pyrell
"""

import os
from typing import Dict, List, Tuple, Optional
import numpy as np
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
EXCEL_PATH = os.path.join(
    BASE_DIR, 'data', 'raw_ml', 'd5_samer', 'PSI-101_Analyzed Data_SAME, SAME-R_Results.xlsx'
)

SOLID_MATERIALS = ['Teflon', 'Kapton', 'Lampwick', 'Silicone', 'Pyrell']

# Reference sensitivity for standard large/cellulose particles (Lampwick median)
# Used to convert raw V/(mg/m3) into dimensionless multiplier (nominal = 1.0)
REFERENCE_SENSITIVITY_V_PER_MG_M3 = 0.2153


def load_same_flight_dataset(
    excel_path: Optional[str] = None
) -> pd.DataFrame:
    """Load cleaned, validated SAME flight runs for solid materials.

    Filters to solid spacecraft materials, coerces numeric telemetry columns,
    and constructs response metrics.
    """
    path = excel_path or EXCEL_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"SAME-R Excel file not found at: {path}")

    # Sheet 'Reduced Data with ISS Det' has row 1 as header
    df = pd.read_excel(path, sheet_name='Reduced Data with ISS Det', header=1)

    # Filter to solid materials
    df = df[df['Sample Type'].isin(SOLID_MATERIALS)].copy()

    # Extract and coerce numeric columns
    df['material'] = df['Sample Type'].astype(str)
    df['amd_um'] = pd.to_numeric(df['M1/M0 (micro-m)--AMD'], errors='coerce')
    df['v_iss'] = pd.to_numeric(df['ISS Detector Scatter (volts)'], errors='coerce')
    df['v_sts_delta'] = pd.to_numeric(df['STS detector delta'], errors='coerce')
    df['dusttrak_b_mg_m3'] = pd.to_numeric(
        df['DustTrak B calibratred and corrected for dilution (mg/m3)'], errors='coerce'
    )
    df['inlet_velocity_cm_s'] = pd.to_numeric(df['Inlet Velocity (cm/sec)'], errors='coerce').fillna(0.0)
    df['net_aging_s'] = pd.to_numeric(df['Net Aging  Duration'], errors='coerce').fillna(0.0)
    df['sample_temp_c'] = pd.to_numeric(df['Sample Temperature C'], errors='coerce')
    df['mass_loss_mg'] = pd.to_numeric(df['Mass Loss mg'], errors='coerce')
    df['flight_phase'] = pd.to_numeric(df.iloc[:, 0], errors='coerce').fillna(2.0).astype(int)

    # Filter valid records: must have positive diameter and reference mass
    valid_mask = (
        (df['amd_um'] > 0.0) &
        (df['dusttrak_b_mg_m3'] > 0.0) &
        (df['v_iss'] >= 0.0)
    )
    clean_df = df[valid_mask].copy().reset_index(drop=True)

    # Compute response metrics
    clean_df['r_photo_raw'] = clean_df['v_iss'] / clean_df['dusttrak_b_mg_m3']
    clean_df['r_ion_raw'] = clean_df['v_sts_delta'] / clean_df['dusttrak_b_mg_m3']

    # Dimensionless multipliers relative to reference cellulose sensitivity
    clean_df['photo_multiplier'] = clean_df['r_photo_raw'] / REFERENCE_SENSITIVITY_V_PER_MG_M3
    clean_df['ion_multiplier'] = clean_df['r_ion_raw'] / (REFERENCE_SENSITIVITY_V_PER_MG_M3 * 0.1)

    return clean_df
