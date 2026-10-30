"""Script to verify all claims and 'top facts' against raw CSV rows and columns."""

import os
import csv
import json

BASE_DIR = r'e:\IGNIS'
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')

def check_fact_1_bass_o2():
    # ~14.5% O2 BASS-II threshold: check rows near that boundary and their outcomes
    fp = os.path.join(RAW_DIR, 'PSI-25_Experimental table_BASS-II.csv')
    with open(fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print("=== FACT 1: BASS-II O2 Values and Extinction / Burn Rows ===")
    print(f"Header: {header}")
    # Calibrated initial O2 % by vol is col 11
    # Calibrated final O2 % by vol is col 12
    # Total Frames Shot is col 10
    # Fuel Sample Material is col 5
    matched_rows = []
    for idx, r in enumerate(rows, start=2): # 1-based line number in CSV (line 1 is header)
        if len(r) > 12:
            init_o2 = r[11].strip()
            final_o2 = r[12].strip()
            mat = r[5].strip()
            frames = r[10].strip()
            test_no = r[1].strip()
            try:
                val = float(init_o2)
                if val <= 16.0:
                    matched_rows.append((idx, test_no, mat, val, final_o2, frames))
            except ValueError:
                pass
    
    for row_num, test_no, mat, val, final_o2, frames in sorted(matched_rows, key=lambda x: x[3]):
        print(f"Row {row_num} (Test {test_no}): Material='{mat}', Initial O2={val}%, Final O2={final_o2}%, Frames='{frames}'")

def check_fact_2_and_8_saffire_1():
    # Saffire-I 420s and 70s claims: which test, which file?
    fp = os.path.join(RAW_DIR, 'PSI-98_Experimental table_SAFFIRE-1.csv')
    with open(fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print("\n=== FACT 2 & 8: Saffire-I Burn Times and Flow Directions ===")
    for idx, r in enumerate(rows, start=2):
        print(f"Row {idx}: Sample={r[0]}, Material={r[1]}, AirFlow={r[5]} cm/s, O2={r[6]}, Power={r[7]} W, IgnTime={r[8]} s, BurnTime={r[9]} s, FlowDir={r[10]}")

def check_fact_3_saffire_2_nomex():
    # Saffire-II Nomex claim
    fp = os.path.join(RAW_DIR, 'PSI-99_Experimental table_SAFFIRE-2.csv')
    with open(fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print("\n=== FACT 3: Saffire-II Nomex Burn ===")
    for idx, r in enumerate(rows, start=2):
        mat = r[1].strip()
        if 'nomex' in mat.lower():
            print(f"Row {idx}: Sample={r[0]}, Material={mat}, BurnLength='{r[11]}', SpreadRate='{r[12]}', 1gBurn='{r[13]}', 1gSpread='{r[14]}'")

def check_fact_6_bass_co():
    # 107 ppm CO figure: which column, which row?
    fp = os.path.join(RAW_DIR, 'PSI-25_Experimental table_BASS-II.csv')
    with open(fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print("\n=== FACT 6: BASS-II 107 ppm CO ===")
    for idx, r in enumerate(rows, start=2):
        if len(r) > 16:
            co_final = r[16].strip()
            co_init = r[15].strip()
            if '107' in co_final or '107' in co_init:
                print(f"Row {idx} (Test {r[1]}): Material='{r[5]}', Initial CO={co_init} ppm, Final CO={co_final} ppm")

def check_fact_4_and_5_flex():
    # FLEX extinction diameters and pressure burn times
    fp = os.path.join(RAW_DIR, 'PSI-69_Experimental table_FLEX.csv')
    with open(fp, 'r', encoding='latin1', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print("\n=== FACT 4 & 5: FLEX Extinction & Pressure ===")
    pressures = []
    burn_times = []
    ext_diameters = []
    end_conditions = Counter()

    for idx, r in enumerate(rows, start=2):
        if len(r) >= 15:
            p = r[5].strip()
            o2 = r[6].strip()
            ext_d = r[11].strip()
            bt = r[13].strip()
            end = r[14].strip()
            end_conditions[end] += 1
            try:
                p_val = float(p)
                pressures.append((idx, p_val))
            except ValueError:
                pass
            try:
                bt_val = float(bt)
                burn_times.append((idx, bt_val))
            except ValueError:
                pass
            try:
                ext_val = float(ext_d)
                if ext_val > 0:
                    ext_diameters.append((idx, ext_val))
            except ValueError:
                pass

    print(f"Total rows analyzed: {len(rows)}")
    print(f"End conditions distribution: {dict(end_conditions)}")
    if ext_diameters:
        min_ext = min(ext_diameters, key=lambda x: x[1])
        max_ext = max(ext_diameters, key=lambda x: x[1])
        print(f"Extinction diameter range: {min_ext[1]} mm (Row {min_ext[0]}) to {max_ext[1]} mm (Row {max_ext[0]})")
    if pressures:
        min_p = min(pressures, key=lambda x: x[1])
        max_p = max(pressures, key=lambda x: x[1])
        print(f"Pressure range: {min_p[1]} mmHg (Row {min_p[0]}) to {max_p[1]} mmHg (Row {max_p[0]})")
    if burn_times:
        min_bt = min(burn_times, key=lambda x: x[1])
        max_bt = max(burn_times, key=lambda x: x[1])
        print(f"Burn time range: {min_bt[1]} s (Row {min_bt[0]}) to {max_bt[1]} s (Row {max_bt[0]})")

def check_acme_claims():
    # Any claim mentioning ACME
    print("\n=== ACME CLAIMS CHECK ===")
    for fn in ['PSI-10_Experimental table_Flame Design_Normal Flame.csv',
               'PSI-10_Experimental table_Flame Design_Inverse Flame.csv',
               'PSI-159_Experimental table_CFI-G_Normal Flames.csv']:
        fp = os.path.join(RAW_DIR, fn)
        with open(fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
            reader = csv.reader(f)
            header = next(reader)
            print(f"\nFile: {fn}")
            print(f"Columns: {header}")
            rows = list(reader)
            print(f"Sample Row 2: {rows[0] if rows else 'empty'}")

if __name__ == '__main__':
    from collections import Counter
    check_fact_1_bass_o2()
    check_fact_2_and_8_saffire_1()
    check_fact_3_saffire_2_nomex()
    check_fact_6_bass_co()
    check_fact_4_and_5_flex()
    check_acme_claims()
