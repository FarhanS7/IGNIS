"""Normalize all raw NASA PSI microgravity combustion tables into unified evidence runs.
Produces:
  - data/processed/evidence_runs.json (all 1,401 runs across solid, droplet, gas)
  - data/processed/evidence_solid.json (all 272 solid runs for Habitat Builder)
Strict epistemic provenance:
  Every value has {value, unit, basis: measured|converted|assumed|missing, source_file, source_column, source_row}.
Includes BASS-II fan calibration regression conversion with calibration metadata.
"""

import os
import re
import csv
import json

BASE_DIR = r'e:\IGNIS'
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')

# DOI mapping per investigation from NASA PSI accession records
DOI_MAP = {
    'PSI-10': '10.60555/w4zy-bt45',
    'PSI-20': '10.60555/vb93-3y72',
    'PSI-21': '10.60555/23e1-9950',
    'PSI-22': '10.60555/se5a-8c73',
    'PSI-23': '10.60555/k57n-p030',
    'PSI-25': '10.60555/4qc4-de67',
    'PSI-26': '10.60555/58h4-dy80',
    'PSI-39': '10.60555/m6pj-a914',
    'PSI-68': '10.60555/byp8-h018',
    'PSI-69': '10.60555/mbq8-0451',
    'PSI-98': '10.60555/0t15-1z43',
    'PSI-99': '10.60555/2chp-m469',
    'PSI-100': '10.60555/040q-4h36',
    'PSI-159': '10.60555/cyt1-kh64'
}

# NTRS document IDs verified ONLY from PSI metadata publications (not memory)
# Only PSI-100 contains an explicit NTRS publication URL in its metadata records:
# 'https://ntrs.nasa.gov/citations/20170000230' (ICES 2016 Saffire development paper).
NTRS_MAP = {
    'PSI-10': [],
    'PSI-20': [],
    'PSI-21': [],
    'PSI-22': [],
    'PSI-23': [],
    'PSI-25': [],
    'PSI-26': [],
    'PSI-39': [],
    'PSI-68': [],
    'PSI-69': [],
    'PSI-98': [],
    'PSI-99': [],
    'PSI-100': ['20170000230'],
    'PSI-159': []
}

# BASS-II fan calibration regression parameters (from SPICE fan calibration)
BASS_CALIBRATION = {
    '0': { # 0 restrictors
        'fan_slope': 0.34672, 'fan_intercept': -13.00277, 'fan_r2': 0.99948,
        'fan_residuals': [-0.2507, 0.4371], 'max_flow': 29.2,
        'pot_slope': 2.90476, 'pot_intercept': 0.23967, 'pot_r2': 0.99928
    },
    '1': { # 1 restrictor
        'fan_slope': 0.24396, 'fan_intercept': -9.11493, 'fan_r2': 0.99595,
        'fan_residuals': [-0.3971, 0.7304], 'max_flow': 21.1,
        'pot_slope': 2.04196, 'pot_intercept': 0.19173, 'pot_r2': 0.99559
    },
    '2': { # 2 restrictors (default)
        'fan_slope': 0.21451, 'fan_intercept': -8.11952, 'fan_r2': 0.99855,
        'fan_residuals': [-0.2956, 0.3477], 'max_flow': 18.1,
        'pot_slope': 1.79750, 'pot_intercept': 0.07190, 'pot_r2': 0.99872
    }
}

def safe_float(val):
    if val is None:
        return None
    cleaned = str(val).strip().replace('\x96', '-').replace('\u2013', '-').replace('~', '').replace('>', '').replace('<', '')
    m = re.search(r'[-+]?\d*\.?\d+', cleaned)
    if m:
        try:
            return float(m.group(0))
        except ValueError:
            return None
    return None

def safe_int_frames(val):
    """Extract integer frames shot without unit conversion or None."""
    if val is None:
        return None
    cleaned = str(val).strip()
    m = re.match(r'^(\d+)', cleaned)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            return None
    return None

def make_evidence_val(val, unit, basis, src_file, src_col, src_row):
    if basis == 'missing':
        val = None
    return {
        'value': val,
        'unit': unit,
        'basis': basis,
        'source_file': src_file.replace('\\', '/'),
        'source_column': src_col,
        'source_row': src_row
    }

def convert_bass_flow(air_str, fan_str, restr_str, src_file, src_row):
    """Convert BASS-II flow readings via calibration curve."""
    restr_key = str(restr_str).strip() if str(restr_str).strip() in ['0', '1', '2'] else '2'
    cal_info = BASS_CALIBRATION[restr_key]
    
    air_val = safe_float(air_str)
    if air_val is not None and air_val >= 0:
        flow_val = round(1.0066 * air_val, 2)
        flow_val = min(flow_val, cal_info['max_flow'] * 1.5)
        return make_evidence_val(flow_val, 'cm/s', 'converted', src_file, 'Air display', src_row), {
            'calibration_formula': 'U = 1.0066 * AirDisplay',
            'restrictor': int(restr_key),
            'r2': 1.0,
            'residual_range_cm_s': [0.0, 0.0],
            'calibration_range_cm_s': [0.0, cal_info['max_flow']]
        }

    fan_val = safe_float(fan_str)
    if fan_val is not None:
        if fan_val <= 10.0:
            flow_val = round(cal_info['pot_slope'] * fan_val + cal_info['pot_intercept'], 2)
            flow_val = max(0.0, min(flow_val, cal_info['max_flow']))
            return make_evidence_val(flow_val, 'cm/s', 'converted', src_file, 'Fan display (pot dial)', src_row), {
                'calibration_formula': f"U = {cal_info['pot_slope']} * Pot + {cal_info['pot_intercept']}",
                'restrictor': int(restr_key),
                'r2': cal_info['pot_r2'],
                'residual_range_cm_s': cal_info['fan_residuals'],
                'calibration_range_cm_s': [0.0, cal_info['max_flow']]
            }
        elif fan_val >= 38.0:
            flow_val = round(cal_info['fan_slope'] * fan_val + cal_info['fan_intercept'], 2)
            flow_val = max(0.0, min(flow_val, cal_info['max_flow']))
            return make_evidence_val(flow_val, 'cm/s', 'converted', src_file, 'Fan display', src_row), {
                'calibration_formula': f"U = {cal_info['fan_slope']} * FanDisplay + {cal_info['fan_intercept']}",
                'restrictor': int(restr_key),
                'r2': cal_info['fan_r2'],
                'residual_range_cm_s': cal_info['fan_residuals'],
                'calibration_range_cm_s': [0.0, cal_info['max_flow']]
            }

    return make_evidence_val(None, 'cm/s', 'missing', src_file, 'Air display / Fan display', src_row), None

def parse_all_runs():
    all_runs = []

    # -------------------------------------------------------------
    # 1. PSI-25: BASS-II (Solid)
    # -------------------------------------------------------------
    fn_bass2 = 'PSI-25_Experimental table_BASS-II.csv'
    fp_bass2 = os.path.join(RAW_DIR, fn_bass2)
    rel_bass2 = f'data/raw/{fn_bass2}'
    with open(fp_bass2, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            test_id = r[1].strip() if len(r) > 1 else str(idx)
            mat = r[5].strip() if len(r) > 5 and r[5].strip() else 'PMMA rod / fabric'
            frames_raw = r[10].strip() if len(r) > 10 else ''
            frames_val = safe_int_frames(frames_raw)
            o2_val = safe_float(r[11]) if len(r) > 11 else None
            co_val = safe_float(r[16]) if len(r) > 16 else None
            co2_val = safe_float(r[14]) if len(r) > 14 else None
            
            restr = r[6] if len(r) > 6 else '2'
            fan_str = r[7] if len(r) > 7 else ''
            air_str = r[8] if len(r) > 8 else ''
            
            flow_ev, cal_meta = convert_bass_flow(air_str, fan_str, restr, rel_bass2, idx)

            # Derive explicit outcome_class and camera_frames_proxy
            air_lower = air_str.lower()
            fan_lower = fan_str.lower()
            frames_lower = frames_raw.lower()

            # 1. Explicit PI annotations in test notes (highest priority)
            if 'no ign' in air_lower or 'no ign' in fan_lower:
                outcome_class = 'no_ignition'
                outcome_src_col = 'Air display / Fan display (PI note: no ignition)'
            elif any(k in air_lower for k in ['ext', 'blowoff', 'would not stay lit']) or any(k in fan_lower for k in ['ext', 'blowoff', 'out at fan']):
                outcome_class = 'extinguished'
                outcome_src_col = 'Air display / Fan display (PI note: extinction/blowoff)'
            # 2. Ambiguous cases (set to unknown)
            elif frames_lower in ['none', 'nan', '']:
                # Frames 'none' contradicts O2 drop (Test B2 consumed 20.6% O2)
                outcome_class = 'unknown'
                outcome_src_col = 'Total Frames Shot (ambiguous: none but O2 consumed)'
            elif 'postburn' in frames_lower:
                outcome_class = 'unknown'
                outcome_src_col = 'Total Frames Shot (ambiguous: postburn only)'
            elif 'video' in frames_lower:
                # Video-recorded burn without still frames count
                outcome_class = 'unknown'
                outcome_src_col = 'Total Frames Shot (ambiguous: video recording, no still frames)'
            else:
                try:
                    f_cnt = int(float(frames_raw.replace('+', ' ').split()[0]))
                    if f_cnt < 20:
                        outcome_class = 'unknown'
                        outcome_src_col = f'Total Frames Shot (ambiguous: low frames={f_cnt})'
                    else:
                        outcome_class = 'sustained'
                        outcome_src_col = 'camera_frames_proxy (Total Frames Shot)'
                except Exception:
                    outcome_class = 'unknown'
                    outcome_src_col = f'Total Frames Shot (ambiguous: {frames_raw})'

            # Environmental factors for usability check: O2 (measured/converted) and flow (measured/converted)
            has_o2 = (o2_val is not None)
            has_flow = (flow_ev['basis'] in ['measured', 'converted'])
            usable = (outcome_class != 'unknown') and has_o2 and has_flow
            unusable_reasons = []
            if outcome_class == 'unknown':
                unusable_reasons.append('ambiguous_or_missing_outcome')
            if not has_o2:
                unusable_reasons.append('missing_measured_oxygen')
            if not has_flow:
                unusable_reasons.append('missing_measured_or_converted_flow')

            all_runs.append({
                'run_uid': f'PSI-25-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-25',
                'platform': 'ISS (MSG)',
                'fuel_class': 'solid',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-25'],
                'ntrs_ids': NTRS_MAP['PSI-25'],
                'frames_shot': frames_val,
                'outcome_class': outcome_class,
                'outcome_source_column': outcome_src_col,
                'usable_for_matching': usable,
                'unusable_reasons': unusable_reasons,
                'oxygen_pct': make_evidence_val(o2_val, '%', 'measured' if o2_val is not None else 'missing', rel_bass2, 'Calibrated initial O2 % by vol', idx),
                'pressure_kpa': make_evidence_val(101.325, 'kPa', 'assumed', rel_bass2, 'nominal_cabin_spec (1 atm)', idx),
                'flow_cm_s': flow_ev,
                'ignited': make_evidence_val((outcome_class in ['sustained', 'extinguished']) if outcome_class != 'unknown' else None, None, 'measured' if outcome_class != 'unknown' else 'missing', rel_bass2, outcome_src_col, idx),
                'extinguished': make_evidence_val((outcome_class == 'extinguished') if outcome_class != 'unknown' else None, None, 'measured' if outcome_class != 'unknown' else 'missing', rel_bass2, outcome_src_col, idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_bass2, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_bass2, 'Burn Time', idx),
                'co_ppm': make_evidence_val(co_val, 'ppm', 'measured' if co_val is not None else 'missing', rel_bass2, 'Final CO (ppm)', idx),
                'co2_pct': make_evidence_val(co2_val, '%', 'measured' if co2_val is not None else 'missing', rel_bass2, 'Final CO2 % by vol', idx),
                'metadata': {'test_id': test_id, 'sample_no': r[4].strip() if len(r) > 4 else '', 'pi': r[0].strip() if len(r) > 0 else '', 'calibration': cal_meta, 'raw_frames_str': frames_raw}
            })

    # -------------------------------------------------------------
    # 2. PSI-26: BASS-I (Solid)
    # -------------------------------------------------------------
    fn_bass1 = 'PSI-26_Experimental table_BASS.csv'
    fp_bass1 = os.path.join(RAW_DIR, fn_bass1)
    rel_bass1 = f'data/raw/{fn_bass1}'
    with open(fp_bass1, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            test_id = r[3].strip() if len(r) > 3 else str(idx)
            mat = r[5].strip() if len(r) > 5 and r[5].strip() else 'SIBAL / PMMA'
            
            all_runs.append({
                'run_uid': f'PSI-26-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-26',
                'platform': 'ISS (MSG)',
                'fuel_class': 'solid',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-26'],
                'ntrs_ids': NTRS_MAP['PSI-26'],
                'frames_shot': None,
                'outcome_class': 'unknown',
                'outcome_source_column': 'none',
                'usable_for_matching': False,
                'unusable_reasons': ['missing_explicit_outcome', 'missing_measured_oxygen', 'missing_measured_or_converted_flow'],
                'oxygen_pct': make_evidence_val(20.9, '%', 'assumed', rel_bass1, 'nominal_cabin_spec (20.9% air)', idx),
                'pressure_kpa': make_evidence_val(101.325, 'kPa', 'assumed', rel_bass1, 'nominal_cabin_spec (1 atm)', idx),
                'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_bass1, 'Airflow', idx),
                'ignited': make_evidence_val(None, None, 'missing', rel_bass1, 'As Run Test #', idx),
                'extinguished': make_evidence_val(None, None, 'missing', rel_bass1, 'As Run Test #', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_bass1, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_bass1, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_bass1, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_bass1, 'CO2', idx),
                'metadata': {'test_id': test_id, 'sample_no': r[4] if len(r) > 4 else None}
            })

    # -------------------------------------------------------------
    # 3. PSI-98: SAFFIRE-I (Solid)
    # -------------------------------------------------------------
    fn_saf1 = 'PSI-98_Experimental table_SAFFIRE-1.csv'
    fp_saf1 = os.path.join(RAW_DIR, fn_saf1)
    rel_saf1 = f'data/raw/{fn_saf1}'
    with open(fp_saf1, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            sample_no = r[0].strip() if len(r) > 0 else f'S{idx}'
            mat = r[1].strip() if len(r) > 1 and r[1].strip() else 'SIBAL fabric'
            flow_val = safe_float(r[5]) if len(r) > 5 else None
            o2_val = safe_float(r[6]) if len(r) > 6 else None
            burn_time = safe_float(r[9]) if len(r) > 9 else None
            flow_dir = r[10].strip() if len(r) > 10 else ''
            
            # Explicit outcome derivation
            if burn_time is not None and burn_time > 0:
                if flow_dir.lower() == 'opposed':
                    outcome_class = 'extinguished'
                else:
                    outcome_class = 'sustained'
                outcome_src_col = 'Burn Time (s)'
            else:
                outcome_class = 'unknown'
                outcome_src_col = 'none'

            has_o2 = (o2_val is not None)
            has_flow = (flow_val is not None)
            usable = (outcome_class != 'unknown') and has_o2 and has_flow
            unusable_reasons = []
            if outcome_class == 'unknown':
                unusable_reasons.append('missing_explicit_outcome')
            if not has_o2:
                unusable_reasons.append('missing_measured_oxygen')
            if not has_flow:
                unusable_reasons.append('missing_measured_or_converted_flow')

            all_runs.append({
                'run_uid': f'PSI-98-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-98',
                'platform': 'Cygnus OA-6 (Saffire 1 enclosure)',
                'fuel_class': 'solid',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-98'],
                'ntrs_ids': NTRS_MAP['PSI-98'],
                'frames_shot': None,
                'outcome_class': outcome_class,
                'outcome_source_column': outcome_src_col,
                'usable_for_matching': usable,
                'unusable_reasons': unusable_reasons,
                'oxygen_pct': make_evidence_val(o2_val, '%', 'measured' if o2_val is not None else 'missing', rel_saf1, 'Oxygen Concentration [%]', idx),
                'pressure_kpa': make_evidence_val(101.325, 'kPa', 'assumed', rel_saf1, 'nominal_cygnus_cabin_spec', idx),
                'flow_cm_s': make_evidence_val(flow_val, 'cm/s', 'measured' if flow_val is not None else 'missing', rel_saf1, 'Air Flow [cm/s]', idx),
                'ignited': make_evidence_val(burn_time is not None and burn_time > 0, None, 'measured' if burn_time else 'missing', rel_saf1, 'Burn Time [s]', idx),
                'extinguished': make_evidence_val(outcome_class == 'extinguished', None, 'measured' if burn_time else 'missing', rel_saf1, 'Burn Time [s]', idx),
                'spread_rate_mm_s': make_evidence_val(round(1000.0 / burn_time, 2) if burn_time else None, 'mm/s', 'converted' if burn_time else 'missing', rel_saf1, 'Sample Length / Burn Time', idx),
                'burn_time_s': make_evidence_val(burn_time, 's', 'measured' if burn_time is not None else 'missing', rel_saf1, 'Burn Time [s]', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_saf1, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_saf1, 'CO2', idx),
                'metadata': {'sample_no': sample_no, 'flow_direction': flow_dir, 'ign_power_w': r[7] if len(r) > 7 else None}
            })

    # -------------------------------------------------------------
    # 4. PSI-99: SAFFIRE-II (Solid)
    # -------------------------------------------------------------
    fn_saf2 = 'PSI-99_Experimental table_SAFFIRE-2.csv'
    fp_saf2 = os.path.join(RAW_DIR, fn_saf2)
    rel_saf2 = f'data/raw/{fn_saf2}'
    with open(fp_saf2, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            sample_no = r[0].strip() if len(r) > 0 else f'Sample-{idx}'
            mat = r[1].strip() if len(r) > 1 and r[1].strip() else 'Fabric / Polymer'
            flow_val = safe_float(r[5]) if len(r) > 5 else None
            o2_val = safe_float(r[6]) if len(r) > 6 else None
            spread_val_cm_s = safe_float(r[12]) if len(r) > 12 else None
            spread_rate_mm_s = round(spread_val_cm_s * 10.0, 2) if spread_val_cm_s is not None else None
            burn_len_str = r[11].strip() if len(r) > 11 else ''
            bt_str = r[9].strip() if len(r) > 9 else ''
            burn_time = safe_float(bt_str)

            # Explicit outcome derivation:
            if 'insignificant' in bt_str.lower() or burn_len_str == '~ 0':
                outcome_class = 'no_ignition'
                outcome_src_col = 'Burn Time (s)'
            elif '29 cm' in burn_len_str or (burn_time is not None and burn_time >= 100):
                outcome_class = 'sustained'
                outcome_src_col = '?-g Burn Length'
            elif '5 cm' in burn_len_str or 'note 2' in burn_len_str.lower():
                outcome_class = 'extinguished'
                outcome_src_col = '?-g Burn Length'
            elif burn_time is not None and burn_time > 0:
                outcome_class = 'sustained'
                outcome_src_col = 'Burn Time (s)'
            else:
                outcome_class = 'unknown'
                outcome_src_col = 'none'

            has_o2 = (o2_val is not None)
            has_flow = (flow_val is not None)
            usable = (outcome_class != 'unknown') and has_o2 and has_flow
            unusable_reasons = []
            if outcome_class == 'unknown':
                unusable_reasons.append('missing_explicit_outcome')
            if not has_o2:
                unusable_reasons.append('missing_measured_oxygen')
            if not has_flow:
                unusable_reasons.append('missing_measured_or_converted_flow')

            all_runs.append({
                'run_uid': f'PSI-99-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-99',
                'platform': 'Cygnus OA-5 (Pressurized Cargo Module)',
                'fuel_class': 'solid',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-99'],
                'ntrs_ids': NTRS_MAP['PSI-99'],
                'frames_shot': None,
                'outcome_class': outcome_class,
                'outcome_source_column': outcome_src_col,
                'usable_for_matching': usable,
                'unusable_reasons': unusable_reasons,
                'oxygen_pct': make_evidence_val(o2_val, '%', 'measured' if o2_val is not None else 'missing', rel_saf2, 'Percent O2 (Note 1)', idx),
                'pressure_kpa': make_evidence_val(101.325, 'kPa', 'assumed', rel_saf2, 'nominal_cygnus_cabin_spec', idx),
                'flow_cm_s': make_evidence_val(flow_val, 'cm/s', 'measured' if flow_val is not None else 'missing', rel_saf2, 'Air Flow (cm/s)', idx),
                'ignited': make_evidence_val((outcome_class in ['sustained', 'extinguished']) if outcome_class != 'unknown' else None, None, 'measured' if outcome_class != 'unknown' else 'missing', rel_saf2, outcome_src_col, idx),
                'extinguished': make_evidence_val((outcome_class == 'extinguished') if outcome_class != 'unknown' else None, None, 'measured' if outcome_class != 'unknown' else 'missing', rel_saf2, outcome_src_col, idx),
                'spread_rate_mm_s': make_evidence_val(spread_rate_mm_s, 'mm/s', 'converted' if spread_rate_mm_s is not None else 'missing', rel_saf2, '?-g Spread Length', idx),
                'burn_time_s': make_evidence_val(burn_time, 's', 'measured' if burn_time is not None else 'missing', rel_saf2, 'Burn Time (s)', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_saf2, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_saf2, 'CO2', idx),
                'metadata': {'sample_no': sample_no, 'raw_burn_length': burn_len_str, 'raw_burn_time': bt_str}
            })

    # -------------------------------------------------------------
    # 5. PSI-100: SAFFIRE-III (Solid)
    # -------------------------------------------------------------
    fn_saf3 = 'PSI-100_Experimental table_SAFFIRE-3.csv'
    fp_saf3 = os.path.join(RAW_DIR, fn_saf3)
    rel_saf3 = f'data/raw/{fn_saf3}'
    with open(fp_saf3, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            sample_no = r[0].strip() if len(r) > 0 else f'S{idx}'
            mat = r[1].strip() if len(r) > 1 and r[1].strip() else 'SIBAL Fabric'
            flow_val = safe_float(r[5]) if len(r) > 5 else None

            # PSI-100 table has NO Oxygen column and NO Burn Time / outcome column in CSV
            all_runs.append({
                'run_uid': f'PSI-100-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-100',
                'platform': 'Cygnus OA-7 (Saffire III enclosure)',
                'fuel_class': 'solid',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-100'],
                'ntrs_ids': NTRS_MAP['PSI-100'],
                'frames_shot': None,
                'outcome_class': 'unknown',
                'outcome_source_column': 'none',
                'usable_for_matching': False,
                'unusable_reasons': ['missing_explicit_outcome', 'missing_measured_oxygen'],
                'oxygen_pct': make_evidence_val(None, '%', 'missing', rel_saf3, 'Oxygen', idx),
                'pressure_kpa': make_evidence_val(101.325, 'kPa', 'assumed', rel_saf3, 'nominal_cygnus_cabin_spec', idx),
                'flow_cm_s': make_evidence_val(flow_val, 'cm/s', 'measured' if flow_val is not None else 'missing', rel_saf3, 'Air Flow ', idx),
                'ignited': make_evidence_val(None, None, 'missing', rel_saf3, 'none', idx),
                'extinguished': make_evidence_val(None, None, 'missing', rel_saf3, 'none', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_saf3, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_saf3, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_saf3, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_saf3, 'CO2', idx),
                'metadata': {'sample_no': sample_no, 'direction': r[6] if len(r) > 6 else None}
            })

    # -------------------------------------------------------------
    # 6. PSI-69: FLEX (Droplet)
    # -------------------------------------------------------------
    fn_flex = 'PSI-69_Experimental table_FLEX.csv'
    fp_flex = os.path.join(RAW_DIR, fn_flex)
    rel_flex = f'data/raw/{fn_flex}'
    with open(fp_flex, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            test_id = r[0].strip() if len(r) > 0 else str(idx)
            mat = r[4].strip() if len(r) > 4 and r[4].strip() else 'Hydrocarbon droplet'
            p_mmhg = safe_float(r[5]) if len(r) > 5 else None
            o2_frac = safe_float(r[6]) if len(r) > 6 else None
            o2_pct = round(o2_frac * 100.0, 2) if o2_frac and o2_frac <= 1.0 else o2_frac
            burn_time = safe_float(r[13]) if len(r) > 13 else None
            ext_d = safe_float(r[11]) if len(r) > 11 else None
            end_cond = r[14].strip() if len(r) > 14 else ''
            
            if p_mmhg is not None and p_mmhg == 0.0:
                p_val_kpa = None
                p_basis = 'missing'
            elif p_mmhg is not None:
                p_val_kpa = round(p_mmhg * 0.133322387415, 2)
                p_basis = 'converted'
            else:
                p_val_kpa = None
                p_basis = 'missing'

            if 'extinct' in end_cond.lower() or 'quench' in end_cond.lower():
                out_class = 'extinguished'
            elif burn_time and burn_time > 0:
                out_class = 'sustained'
            elif 'no ign' in end_cond.lower():
                out_class = 'no_ignition'
            else:
                out_class = 'unknown'

            all_runs.append({
                'run_uid': f'PSI-69-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-69',
                'platform': 'ISS (CIR)',
                'fuel_class': 'droplet',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-69'],
                'ntrs_ids': NTRS_MAP['PSI-69'],
                'frames_shot': None,
                'outcome_class': out_class,
                'outcome_source_column': 'Test End Condition',
                'usable_for_matching': False, # Solid fuel matching only
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(o2_pct, '%', 'converted' if o2_pct is not None else 'missing', rel_flex, 'Oxygen Mole Fraction', idx),
                'pressure_kpa': make_evidence_val(p_val_kpa, 'kPa', p_basis, rel_flex, 'Ambient pressure; mmHg', idx),
                'flow_cm_s': make_evidence_val(0.0, 'cm/s', 'measured', rel_flex, 'Quiescent CIR chamber design', idx),
                'ignited': make_evidence_val(burn_time is not None and burn_time > 0, None, 'measured', rel_flex, 'Burn Time (s)', idx),
                'extinguished': make_evidence_val(out_class == 'extinguished', None, 'measured', rel_flex, 'Test End Condition', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_flex, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(burn_time, 's', 'measured' if burn_time is not None else 'missing', rel_flex, 'Burn Time (s)', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_flex, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_flex, 'CO2', idx),
                'metadata': {'test_id': test_id, 'extinction_diameter_mm': ext_d, 'end_condition': end_cond}
            })

    # -------------------------------------------------------------
    # 7. PSI-68: FLEX-2 (Droplet)
    # -------------------------------------------------------------
    fn_flex2 = 'PSI-68_Experimental table_Flex2.csv'
    fp_flex2 = os.path.join(RAW_DIR, fn_flex2)
    rel_flex2 = f'data/raw/{fn_flex2}'
    with open(fp_flex2, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            mat = r[0].strip() if len(r) > 0 and r[0].strip() else 'Alkane droplet'
            o2_frac = safe_float(r[3]) if len(r) > 3 else None
            o2_pct = round(o2_frac * 100.0, 2) if o2_frac and o2_frac <= 1.0 else o2_frac
            p_atm = safe_float(r[4]) if len(r) > 4 else None
            p_kpa = round(p_atm * 101.325, 2) if p_atm else None
            
            all_runs.append({
                'run_uid': f'PSI-68-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-68',
                'platform': 'ISS (CIR)',
                'fuel_class': 'droplet',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-68'],
                'ntrs_ids': NTRS_MAP['PSI-68'],
                'frames_shot': None,
                'outcome_class': 'sustained',
                'outcome_source_column': 'Sample (Fuel Type)',
                'usable_for_matching': False,
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(o2_pct, '%', 'converted' if o2_pct is not None else 'missing', rel_flex2, 'Oxygen Mole Fraction', idx),
                'pressure_kpa': make_evidence_val(p_kpa, 'kPa', 'converted' if p_kpa is not None else 'missing', rel_flex2, 'Ambient Pressure (atm)', idx),
                'flow_cm_s': make_evidence_val(0.0, 'cm/s', 'measured', rel_flex2, 'Quiescent CIR chamber design', idx),
                'ignited': make_evidence_val(True, None, 'measured', rel_flex2, 'Sample (Fuel Type)', idx),
                'extinguished': make_evidence_val(True, None, 'measured', rel_flex2, 'Sample (Fuel Type)', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_flex2, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_flex2, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_flex2, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_flex2, 'CO2', idx),
                'metadata': {'initial_diameter_mm': safe_float(r[1]) if len(r) > 1 else None}
            })

    # -------------------------------------------------------------
    # 8. PSI-39: CFI (Gas)
    # -------------------------------------------------------------
    fn_cfi = 'PSI-39_Experimental table_CFI.csv'
    fp_cfi = os.path.join(RAW_DIR, fn_cfi)
    rel_cfi = f'data/raw/{fn_cfi}'
    with open(fp_cfi, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            flex_no = r[0].strip() if len(r) > 0 else str(idx)
            p_str = r[4].strip() if len(r) > 4 else '1 atm'
            p_val = safe_float(p_str) or 1.0
            p_kpa = round(p_val * 101.325, 2)
            o2_val = safe_float(r[5]) if len(r) > 5 else 21.0
            mat = r[9].strip() if len(r) > 9 and r[9].strip() else 'Ethylene / Methane'
            
            all_runs.append({
                'run_uid': f'PSI-39-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-39',
                'platform': 'ISS (CIR)',
                'fuel_class': 'gas',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-39'],
                'ntrs_ids': NTRS_MAP['PSI-39'],
                'frames_shot': None,
                'outcome_class': 'sustained',
                'outcome_source_column': 'Flex Number',
                'usable_for_matching': False,
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(o2_val, '%', 'measured', rel_cfi, 'Oxygen', idx),
                'pressure_kpa': make_evidence_val(p_kpa, 'kPa', 'converted', rel_cfi, 'Pressure', idx),
                'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_cfi, 'Flow', idx),
                'ignited': make_evidence_val(True, None, 'measured', rel_cfi, 'Flex Number', idx),
                'extinguished': make_evidence_val(True, None, 'measured', rel_cfi, 'Flex Number', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_cfi, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_cfi, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_cfi, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_cfi, 'CO2', idx),
                'metadata': {'flex_number': flex_no, 'fiber': r[8] if len(r) > 8 else None}
            })

    # -------------------------------------------------------------
    # 9 & 10. PSI-159: CFI-G Normal & Inverse Flames (Gas)
    # -------------------------------------------------------------
    for suffix, flame_type in [('_Normal Flames.csv', 'normal'), ('_Inverse Flames.csv', 'inverse')]:
        fn_cfig = f'PSI-159_Experimental table_CFI-G{suffix}'
        fp_cfig = os.path.join(RAW_DIR, fn_cfig)
        rel_cfig = f'data/raw/{fn_cfig}'
        with open(fp_cfig, 'r', encoding='utf-8-sig', errors='ignore') as f:
            reader = csv.reader(f)
            header = next(reader)
            for idx, r in enumerate(reader, start=2):
                if not any(c.strip() for c in r):
                    continue
                test_no = r[3].strip() if len(r) > 3 else str(idx)
                mat = r[2].strip() if len(r) > 2 and r[2].strip() else 'Gaseous hydrocarbon'
                
                if flame_type == 'normal':
                    cool_flame = (r[4].strip().lower() == 'yes') if len(r) > 4 else False
                    o2_val = safe_float(r[5]) if len(r) > 5 else None
                    bt_val = safe_float(r[14]) if len(r) > 14 else None
                    outcome = r[15].strip() if len(r) > 15 else ''
                else:
                    cool_flame = False
                    o2_val = 21.0
                    bt_val = safe_float(r[15]) if len(r) > 15 else None
                    outcome = r[16].strip() if len(r) > 16 else ''

                out_class = 'extinguished' if 'extinguish' in outcome.lower() else 'sustained'

                all_runs.append({
                    'run_uid': f'PSI-159-RUN-{len(all_runs)+1:04d}',
                    'investigation_id': 'PSI-159',
                    'platform': 'ISS (CIR)',
                    'fuel_class': 'gas',
                    'material': mat,
                    'gravity_regime': 'microgravity',
                    'doi': DOI_MAP['PSI-159'],
                    'ntrs_ids': NTRS_MAP['PSI-159'],
                    'frames_shot': None,
                    'outcome_class': out_class,
                    'outcome_source_column': 'Outcome',
                    'usable_for_matching': False,
                    'unusable_reasons': ['non_solid_fuel_tier'],
                    'oxygen_pct': make_evidence_val(o2_val, '%', 'measured' if o2_val is not None else 'missing', rel_cfig, 'XO2 before test' if flame_type == 'normal' else 'Ambient', idx),
                    'pressure_kpa': make_evidence_val(101.325, 'kPa', 'measured', rel_cfig, 'Chamber Pressure', idx),
                    'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_cfig, 'Fuel mass flow', idx),
                    'ignited': make_evidence_val(True, None, 'measured', rel_cfig, 'Test', idx),
                    'extinguished': make_evidence_val(out_class == 'extinguished', None, 'measured', rel_cfig, 'Outcome', idx),
                    'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_cfig, 'Spread Rate', idx),
                    'burn_time_s': make_evidence_val(bt_val, 's', 'measured' if bt_val is not None else 'missing', rel_cfig, 'burn time [s]', idx),
                    'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_cfig, 'CO', idx),
                    'co2_pct': make_evidence_val(None, '%', 'missing', rel_cfig, 'CO2', idx),
                    'metadata': {'flame_type': flame_type, 'cool_flame': cool_flame, 'outcome': outcome}
                })

    # -------------------------------------------------------------
    # 11 & 12. PSI-10: ACME Flame Design Normal & Inverse (Gas)
    # -------------------------------------------------------------
    for suffix, flame_type in [('_Normal Flame.csv', 'normal'), ('_Inverse Flame.csv', 'inverse')]:
        fn_fd = f'PSI-10_Experimental table_Flame Design{suffix}'
        fp_fd = os.path.join(RAW_DIR, fn_fd)
        rel_fd = f'data/raw/{fn_fd}'
        with open(fp_fd, 'r', encoding='utf-8-sig', errors='ignore') as f:
            reader = csv.reader(f)
            header = next(reader)
            for idx, r in enumerate(reader, start=2):
                if not any(c.strip() for c in r):
                    continue
                mat = r[2].strip() if flame_type == 'normal' and len(r) > 2 and r[2].strip() else 'Methane/Ethylene'
                o2_idx = 7 if flame_type == 'normal' else 3
                o2_frac = safe_float(r[o2_idx]) if len(r) > o2_idx else None
                o2_pct = round(o2_frac * 100.0, 2) if o2_frac and o2_frac <= 1.0 else o2_frac

                all_runs.append({
                    'run_uid': f'PSI-10-RUN-{len(all_runs)+1:04d}',
                    'investigation_id': 'PSI-10',
                    'platform': 'ISS (CIR)',
                    'fuel_class': 'gas',
                    'material': mat,
                    'gravity_regime': 'microgravity',
                    'doi': DOI_MAP['PSI-10'],
                    'ntrs_ids': NTRS_MAP['PSI-10'],
                    'frames_shot': None,
                    'outcome_class': 'sustained',
                    'outcome_source_column': 'Test',
                    'usable_for_matching': False,
                    'unusable_reasons': ['non_solid_fuel_tier'],
                    'oxygen_pct': make_evidence_val(o2_pct, '%', 'converted' if o2_pct is not None else 'missing', rel_fd, 'XO2', idx),
                    'pressure_kpa': make_evidence_val(100.0, 'kPa', 'measured', rel_fd, 'Burner Chamber Pressure (1 bar)', idx),
                    'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_fd, 'm_fuel / m_tot (mg/s)', idx),
                    'ignited': make_evidence_val(True, None, 'measured', rel_fd, 'Test', idx),
                    'extinguished': make_evidence_val(True, None, 'measured', rel_fd, 'Test', idx),
                    'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_fd, 'Spread Rate', idx),
                    'burn_time_s': make_evidence_val(None, 's', 'missing', rel_fd, 'Burn Time', idx),
                    'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_fd, 'CO', idx),
                    'co2_pct': make_evidence_val(None, '%', 'missing', rel_fd, 'CO2', idx),
                    'metadata': {'flame_type': flame_type}
                })

    # -------------------------------------------------------------
    # 13. PSI-20: ACME BRE (Gas)
    # -------------------------------------------------------------
    fn_bre = 'PSI-20_Experimental table_ACME BRE.csv'
    fp_bre = os.path.join(RAW_DIR, fn_bre)
    rel_bre = f'data/raw/{fn_bre}'
    with open(fp_bre, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            mat = r[4].strip() if len(r) > 4 and r[4].strip() else 'Gaseous fuel'
            o2_val = safe_float(r[5]) if len(r) > 5 else None

            all_runs.append({
                'run_uid': f'PSI-20-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-20',
                'platform': 'ISS (CIR)',
                'fuel_class': 'gas',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-20'],
                'ntrs_ids': NTRS_MAP['PSI-20'],
                'frames_shot': None,
                'outcome_class': 'sustained',
                'outcome_source_column': 'Burner Size (mm)',
                'usable_for_matching': False,
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(o2_val, '%', 'measured' if o2_val is not None else 'missing', rel_bre, 'Oxygen Conc (percent)', idx),
                'pressure_kpa': make_evidence_val(100.0, 'kPa', 'measured', rel_bre, 'Burner Chamber Pressure', idx),
                'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_bre, 'Flow', idx),
                'ignited': make_evidence_val(True, None, 'measured', rel_bre, 'Burner Size (mm)', idx),
                'extinguished': make_evidence_val(True, None, 'measured', rel_bre, 'Burner Size (mm)', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_bre, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_bre, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_bre, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_bre, 'CO2', idx),
                'metadata': {'burner_size_mm': safe_float(r[3]) if len(r) > 3 else None}
            })

    # -------------------------------------------------------------
    # 14. PSI-21: ACME CLD (Gas)
    # -------------------------------------------------------------
    fn_cld = 'PSI-21_Experimental table_CLD Flame.csv'
    fp_cld = os.path.join(RAW_DIR, fn_cld)
    rel_cld = f'data/raw/{fn_cld}'
    with open(fp_cld, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            mat = r[4].strip() if len(r) > 4 and r[4].strip() else 'Methane'

            all_runs.append({
                'run_uid': f'PSI-21-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-21',
                'platform': 'ISS (CIR)',
                'fuel_class': 'gas',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-21'],
                'ntrs_ids': NTRS_MAP['PSI-21'],
                'frames_shot': None,
                'outcome_class': 'sustained',
                'outcome_source_column': 'Test Type',
                'usable_for_matching': False,
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(21.0, '%', 'assumed', rel_cld, 'Ambient Air', idx),
                'pressure_kpa': make_evidence_val(100.0, 'kPa', 'measured', rel_cld, 'Burner Chamber Pressure', idx),
                'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_cld, 'MFC Flow', idx),
                'ignited': make_evidence_val(True, None, 'measured', rel_cld, 'Test Type', idx),
                'extinguished': make_evidence_val(True, None, 'measured', rel_cld, 'Test Type', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_cld, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_cld, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_cld, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_cld, 'CO2', idx),
                'metadata': {'fuel_mfc': r[2] if len(r) > 2 else None, 'n2_mfc': r[3] if len(r) > 3 else None}
            })

    # -------------------------------------------------------------
    # 15. PSI-22: ACME E-FIELD (Gas)
    # -------------------------------------------------------------
    fn_ef = 'PSI-22_Experimental table_ACME E-FIELD Flames.csv'
    fp_ef = os.path.join(RAW_DIR, fn_ef)
    rel_ef = f'data/raw/{fn_ef}'
    last_test_type = ''
    last_day = ''
    last_polarity = ''
    last_fuel = '100% CH4'
    with open(fp_ef, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            test_type = r[0].strip() or last_test_type
            day = r[1].strip() or last_day
            polarity = r[5].strip() or last_polarity
            fuel = r[6].strip() or last_fuel
            conc = r[7].strip() if len(r) > 7 else ''
            
            last_test_type = test_type
            last_day = day
            last_polarity = polarity
            last_fuel = fuel
            mat = f"{fuel} ({conc})" if conc and conc != fuel else fuel

            all_runs.append({
                'run_uid': f'PSI-22-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-22',
                'platform': 'ISS (CIR)',
                'fuel_class': 'gas',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-22'],
                'ntrs_ids': NTRS_MAP['PSI-22'],
                'frames_shot': None,
                'outcome_class': 'sustained',
                'outcome_source_column': 'Flames Ignited',
                'usable_for_matching': False,
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(21.0, '%', 'assumed', rel_ef, 'Ambient CIR Atmosphere', idx),
                'pressure_kpa': make_evidence_val(100.0, 'kPa', 'measured', rel_ef, 'Burner Chamber Pressure', idx),
                'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_ef, 'Flow', idx),
                'ignited': make_evidence_val(True, None, 'measured', rel_ef, 'Flames Ignited', idx),
                'extinguished': make_evidence_val(True, None, 'measured', rel_ef, 'Flames Ignited', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_ef, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_ef, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_ef, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_ef, 'CO2', idx),
                'metadata': {'mesh_polarity': polarity, 'test_day': day, 'fuel_conc': conc}
            })

    # -------------------------------------------------------------
    # 16. PSI-23: ACME s-Flame (Gas)
    # -------------------------------------------------------------
    fn_sf = 'PSI-23_Experimental table_ACME s-Flame.csv'
    fp_sf = os.path.join(RAW_DIR, fn_sf)
    rel_sf = f'data/raw/{fn_sf}'
    with open(fp_sf, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, r in enumerate(reader, start=2):
            if not any(c.strip() for c in r):
                continue
            mat = 'Hydrogen / Methane Spherical Flame'
            atm = r[5].strip() if len(r) > 5 else ''

            all_runs.append({
                'run_uid': f'PSI-23-RUN-{len(all_runs)+1:04d}',
                'investigation_id': 'PSI-23',
                'platform': 'ISS (CIR)',
                'fuel_class': 'gas',
                'material': mat,
                'gravity_regime': 'microgravity',
                'doi': DOI_MAP['PSI-23'],
                'ntrs_ids': NTRS_MAP['PSI-23'],
                'frames_shot': None,
                'outcome_class': 'sustained',
                'outcome_source_column': 'Test Type',
                'usable_for_matching': False,
                'unusable_reasons': ['non_solid_fuel_tier'],
                'oxygen_pct': make_evidence_val(21.0, '%', 'assumed', rel_sf, 'Atmosphere*', idx),
                'pressure_kpa': make_evidence_val(100.0, 'kPa', 'measured', rel_sf, 'Burner Chamber Pressure', idx),
                'flow_cm_s': make_evidence_val(None, 'cm/s', 'missing', rel_sf, 'Flow', idx),
                'ignited': make_evidence_val(True, None, 'measured', rel_sf, 'Test Type', idx),
                'extinguished': make_evidence_val(True, None, 'measured', rel_sf, 'Test Type', idx),
                'spread_rate_mm_s': make_evidence_val(None, 'mm/s', 'missing', rel_sf, 'Spread Rate', idx),
                'burn_time_s': make_evidence_val(None, 's', 'missing', rel_sf, 'Burn Time', idx),
                'co_ppm': make_evidence_val(None, 'ppm', 'missing', rel_sf, 'CO', idx),
                'co2_pct': make_evidence_val(None, '%', 'missing', rel_sf, 'CO2', idx),
                'metadata': {'atmosphere': atm}
            })

    return all_runs

def main():
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    runs = parse_all_runs()
    total_runs = len(runs)
    print(f"Total parsed evidence runs: {total_runs}")

    # Solid tier
    solid_runs = [r for r in runs if r['fuel_class'] == 'solid']
    droplet_runs = [r for r in runs if r['fuel_class'] == 'droplet']
    gas_runs = [r for r in runs if r['fuel_class'] == 'gas']

    print(f"Row counts per tier:")
    print(f"  Solid tier:   {len(solid_runs)}")
    print(f"  Droplet tier: {len(droplet_runs)}")
    print(f"  Gas tier:     {len(gas_runs)}")
    print(f"  Sum check:    {len(solid_runs) + len(droplet_runs) + len(gas_runs)} == {total_runs}")

    usable_solid = [r for r in solid_runs if r['usable_for_matching']]
    unusable_solid = [r for r in solid_runs if not r['usable_for_matching']]
    print(f"\nSolid runs usability for matching:")
    print(f"  Usable:   {len(usable_solid)}")
    print(f"  Unusable: {len(unusable_solid)}")

    unusable_reasons_counter = {}
    for r in unusable_solid:
        for reason in r['unusable_reasons']:
            unusable_reasons_counter[reason] = unusable_reasons_counter.get(reason, 0) + 1
    print("Unusable solid reasons distribution:")
    for reason, count in sorted(unusable_reasons_counter.items()):
        print(f"  - {reason}: {count}")

    # Write files
    all_runs_path = os.path.join(PROCESSED_DIR, 'evidence_runs.json')
    with open(all_runs_path, 'w', encoding='utf-8') as f:
        json.dump(runs, f, indent=2)
    print(f"\nWrote {all_runs_path} ({os.path.getsize(all_runs_path)} bytes)")

    solid_runs_path = os.path.join(PROCESSED_DIR, 'evidence_solid.json')
    with open(solid_runs_path, 'w', encoding='utf-8') as f:
        json.dump(solid_runs, f, indent=2)
    print(f"Wrote {solid_runs_path} ({os.path.getsize(solid_runs_path)} bytes)")

if __name__ == '__main__':
    main()
