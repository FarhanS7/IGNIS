"""Sanity check and summary reporter for ingested NASA PSI real microgravity data."""

import os
import glob
import csv
import json

BASE_DIR = r'e:\IGNIS'
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')
MANIFEST_PATH = os.path.join(BASE_DIR, 'data', 'provenance', 'manifest.json')
ERROR_LOG = os.path.join(RAW_DIR, '_errors.log')

def run_sanity_check():
    # 1. Total manifest entries
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    print(f"Total manifest entries: {len(manifest['files'])}")
    
    # 2. Count rows per investigation across all experimental tables
    table_files = [
        ('PSI-25', 'BASS-II', 'PSI-25_Experimental table_BASS-II.csv'),
        ('PSI-26', 'BASS', 'PSI-26_Experimental table_BASS.csv'),
        ('PSI-69', 'FLEX', 'PSI-69_Experimental table_FLEX.csv'),
        ('PSI-68', 'FLEX-2', 'PSI-68_Experimental table_Flex2.csv'),
        ('PSI-98', 'SAFFIRE-I', 'PSI-98_Experimental table_SAFFIRE-1.csv'),
        ('PSI-99', 'SAFFIRE-II', 'PSI-99_Experimental table_SAFFIRE-2.csv'),
        ('PSI-100', 'SAFFIRE-III', 'PSI-100_Experimental table_SAFFIRE-3.csv'),
        ('PSI-39', 'CFI', 'PSI-39_Experimental table_CFI.csv'),
        ('PSI-10', 'ACME Flame Design', 'PSI-10_Experimental table_Flame Design_Normal Flame.csv'),
        ('PSI-10', 'ACME Flame Design (Inverse)', 'PSI-10_Experimental table_Flame Design_Inverse Flame.csv'),
        ('PSI-20', 'ACME BRE', 'PSI-20_Experimental table_ACME BRE.csv'),
        ('PSI-21', 'ACME CLD Flame', 'PSI-21_Experimental table_CLD Flame.csv'),
        ('PSI-22', 'ACME E-FIELD Flames', 'PSI-22_Experimental table_ACME E-FIELD Flames.csv'),
        ('PSI-23', 'ACME s-Flame', 'PSI-23_Experimental table_ACME s-Flame.csv'),
        ('PSI-159', 'ACME CFI-G', 'PSI-159_Experimental table_CFI-G_Normal Flames.csv'),
        ('PSI-159', 'ACME CFI-G (Inverse)', 'PSI-159_Experimental table_CFI-G_Inverse Flames.csv'),
    ]

    total_rows = 0
    inv_rows = {}

    for inv, name, fn in table_files:
        fp = os.path.join(RAW_DIR, fn)
        with open(fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = [r for r in reader if any(c.strip() for c in r)]
            count = len(rows)
            inv_rows[f"{inv} ({name})"] = count
            total_rows += count

    print(f"\nTotal real experimental rows ingested: {total_rows}")
    print("\nRows per investigation table:")
    for k, v in inv_rows.items():
        print(f"  {k}: {v} rows")

    # Plus telemetry file
    telem_fp = os.path.join(RAW_DIR, 'PSI-100_Raw Data_Raw telemetry file.csv')
    if os.path.exists(telem_fp):
        with open(telem_fp, 'r', encoding='utf-8-sig', errors='ignore') as f:
            telem_rows = sum(1 for line in f) - 1
        print(f"\nCalibrated high-frequency telemetry rows (PSI-100 SAFFIRE-III): {telem_rows} rows")

    # Check errors
    print("\nFailures in data/raw/_errors.log:")
    if os.path.exists(ERROR_LOG):
        with open(ERROR_LOG, 'r', encoding='utf-8') as f:
            for l in f:
                print(" ", l.strip())
    else:
        print("  None")

if __name__ == '__main__':
    run_sanity_check()
