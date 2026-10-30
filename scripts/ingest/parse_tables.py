"""Analyze raw NASA PSI CSV tables, generate cleaned CSVs, and produce DATA_INVENTORY.md."""

import os
import glob
import json
import csv
import re
from collections import defaultdict, Counter

BASE_DIR = r'e:\IGNIS'
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')
DOCS_DIR = os.path.join(BASE_DIR, 'docs')
INVENTORY_MD = os.path.join(DOCS_DIR, 'DATA_INVENTORY.md')

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

TABLE_FILES = sorted([f for f in os.listdir(RAW_DIR) if f.endswith('.csv') and 'Experimental table' in f])
TELEMETRY_CSV = os.path.join(RAW_DIR, 'PSI-100_Raw Data_Raw telemetry file.csv')

def parse_csv_file(filepath):
    # Try utf-8-sig, fallback to latin1
    for enc in ['utf-8-sig', 'utf-8', 'latin1', 'cp1252']:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                reader = csv.reader(f)
                rows = [r for r in reader]
                if rows:
                    return rows, enc
        except Exception:
            continue
    raise RuntimeError(f"Could not decode {filepath}")

def analyze_table(filename):
    filepath = os.path.join(RAW_DIR, filename)
    rows, encoding = parse_csv_file(filepath)
    if not rows:
        return None

    header = rows[0]
    data_rows = rows[1:]

    # Remove completely empty rows if any
    data_rows = [r for r in data_rows if any(cell.strip() for cell in r)]
    row_count = len(data_rows)
    col_count = len(header)

    col_stats = []
    for col_idx, col_name in enumerate(header):
        values = []
        for r in data_rows:
            if col_idx < len(r):
                values.append(r[col_idx].strip())
            else:
                values.append('')
        
        non_empty = [v for v in values if v != '']
        null_count = row_count - len(non_empty)
        null_rate = (null_count / row_count * 100) if row_count > 0 else 0
        uniques = sorted(list(set(non_empty)))

        # Attempt numeric conversion
        numeric_vals = []
        for v in non_empty:
            # clean comma or percentage
            clean_v = v.replace('%', '').replace(',', '').strip()
            try:
                numeric_vals.append(float(clean_v))
            except ValueError:
                pass

        min_val = min(numeric_vals) if numeric_vals else (uniques[0] if uniques else None)
        max_val = max(numeric_vals) if numeric_vals else (uniques[-1] if uniques else None)

        col_stats.append({
            'index': col_idx,
            'name': col_name,
            'null_count': null_count,
            'null_rate': null_rate,
            'unique_count': len(uniques),
            'unique_sample': uniques[:10],
            'is_numeric': len(numeric_vals) == len(non_empty) and len(non_empty) > 0,
            'min': min_val,
            'max': max_val
        })

    return {
        'filename': filename,
        'encoding': encoding,
        'row_count': row_count,
        'col_count': col_count,
        'header': header,
        'data_rows': data_rows,
        'col_stats': col_stats
    }

def main():
    table_analyses = []
    total_rows = 0

    print("Analyzing experimental CSV tables...")
    for tf in TABLE_FILES:
        res = analyze_table(tf)
        if res:
            table_analyses.append(res)
            total_rows += res['row_count']
            print(f"  {tf}: {res['row_count']} rows, {res['col_count']} cols ({res['encoding']})")

    # Also analyze telemetry file if needed
    if os.path.exists(TELEMETRY_CSV):
        telem_res = analyze_table(os.path.basename(TELEMETRY_CSV))
        print(f"  Telemetry CSV: {telem_res['row_count']} rows, {telem_res['col_count']} cols")

    # Generate cleaned CSVs for each experimental table
    for t in table_analyses:
        clean_fn = t['filename'].replace('Experimental table_', 'clean_').replace(' ', '_').replace('-', '_')
        clean_path = os.path.join(PROCESSED_DIR, clean_fn)
        with open(clean_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(t['header'])
            writer.writerows(t['data_rows'])
        print(f"  Cleaned CSV written: {clean_fn}")

    # Collect publications / NTRS citations from metadata
    meta_files = sorted(glob.glob(os.path.join(RAW_DIR, '*_metadata.json')))
    citations = []
    for mf in meta_files:
        with open(mf, 'r', encoding='utf-8') as f:
            meta = json.load(f)
        acc = meta.get('accession')
        title = meta.get('title')
        pubs = meta.get('publications', [])
        for p in pubs:
            c_title = p.get('title') or p.get('comments', [{}])[0].get('value') if p.get('comments') else ''
            c_doi = p.get('doi')
            c_author = p.get('authorList')
            c_year = p.get('year') or ''
            citations.append({
                'investigation_id': acc,
                'investigation_title': title,
                'author': c_author,
                'title': c_title,
                'year': c_year,
                'doi': c_doi
            })

    print(f"\nExtracted {len(citations)} citations from investigation metadata.")
    print(f"Total experimental table rows: {total_rows}")

if __name__ == '__main__':
    main()
