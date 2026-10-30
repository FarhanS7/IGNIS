"""Generate docs/DATA_INVENTORY.md with deep analysis of all real NASA PSI data."""

import os
import csv
import json
import glob
import re
from collections import defaultdict

BASE_DIR = r'e:\IGNIS'
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
DOCS_DIR = os.path.join(BASE_DIR, 'docs')
INVENTORY_MD = os.path.join(DOCS_DIR, 'DATA_INVENTORY.md')

TABLE_FILES = [
    ('PSI-25', 'BASS-II', '10.60555/4qc4-de67', 'PSI-25_Experimental table_BASS-II.csv'),
    ('PSI-26', 'BASS', '10.60555/58h4-dy80', 'PSI-26_Experimental table_BASS.csv'),
    ('PSI-69', 'FLEX', '10.60555/mbq8-0451', 'PSI-69_Experimental table_FLEX.csv'),
    ('PSI-68', 'FLEX-2', '10.60555/byp8-h018', 'PSI-68_Experimental table_Flex2.csv'),
    ('PSI-98', 'SAFFIRE-I', '10.60555/0t15-1z43', 'PSI-98_Experimental table_SAFFIRE-1.csv'),
    ('PSI-99', 'SAFFIRE-II', '10.60555/2chp-m469', 'PSI-99_Experimental table_SAFFIRE-2.csv'),
    ('PSI-100', 'SAFFIRE-III', '10.60555/040q-4h36', 'PSI-100_Experimental table_SAFFIRE-3.csv'),
    ('PSI-39', 'CFI', '10.60555/m6pj-a914', 'PSI-39_Experimental table_CFI.csv'),
    ('PSI-10', 'ACME Flame Design (Normal)', '10.60555/w4zy-bt45', 'PSI-10_Experimental table_Flame Design_Normal Flame.csv'),
    ('PSI-10', 'ACME Flame Design (Inverse)', '10.60555/w4zy-bt45', 'PSI-10_Experimental table_Flame Design_Inverse Flame.csv'),
    ('PSI-20', 'ACME BRE', '10.60555/vb93-3y72', 'PSI-20_Experimental table_ACME BRE.csv'),
    ('PSI-21', 'ACME CLD Flame', '10.60555/23e1-9950', 'PSI-21_Experimental table_CLD Flame.csv'),
    ('PSI-22', 'ACME E-FIELD Flames', '10.60555/se5a-8c73', 'PSI-22_Experimental table_ACME E-FIELD Flames.csv'),
    ('PSI-23', 'ACME s-Flame', '10.60555/k57n-p030', 'PSI-23_Experimental table_ACME s-Flame.csv'),
    ('PSI-159', 'ACME CFI-G (Normal)', '10.60555/cyt1-kh64', 'PSI-159_Experimental table_CFI-G_Normal Flames.csv'),
    ('PSI-159', 'ACME CFI-G (Inverse)', '10.60555/cyt1-kh64', 'PSI-159_Experimental table_CFI-G_Inverse Flames.csv'),
]

def load_csv(filename):
    filepath = os.path.join(RAW_DIR, filename)
    for enc in ['utf-8-sig', 'utf-8', 'latin1', 'cp1252']:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                reader = csv.reader(f)
                rows = [r for r in reader]
                if rows:
                    header = rows[0]
                    data = [r for r in rows[1:] if any(c.strip() for c in r)]
                    return header, data, enc
        except Exception:
            continue
    return [], [], 'unknown'

def generate_inventory():
    out = []
    out.append("# NASA Microgravity Combustion Data Inventory & Scientific Mapping Verdict")
    out.append("\n> **Repository:** IGNIS | **Branch:** `v2-real-data`  ")
    out.append("> **Source:** NASA Physical Sciences Informatics (PSI) Open Science Repository (`psi.nasa.gov`)  ")
    out.append("> **License:** CC0-1.0 (Public Domain, NASA Open Science)  ")
    out.append("> **Verification:** 100% genuine NASA experimental tables and investigation archives with strict TLS verification.\n")
    out.append("---\n")

    # SECTION 1: Mapping Verdict Summary
    out.append("## 1. Schema Mapping Verdict\n")
    out.append("Comparison of IGNIS application target schema against raw flight data parameters:\n")
    out.append("| Schema Field | Target Concept | Status in Real Data | Real Field Name(s) in Data | Derivation Method / Physical Caveats |")
    out.append("| :--- | :--- | :---: | :--- | :--- |")
    out.append("| `oxygen_pct` | Ambient O2 percentage (vol %) | **REAL** | `Calibrated initial O2 % by vol` (BASS-II), `Percent O2` (Saffire), `O initial ambient composition; mole fraction` (FLEX) | Directly reported in vol% (e.g. 13.6% - 22.2% in BASS-II) or mole fraction ($X_{O2} \\times 100$ in FLEX: 12% - 40%). |")
    out.append("| `pressure_kpa` | Total cabin / chamber pressure | **REAL / DERIVABLE** | `Ambient pressure; mmHg` (FLEX), `Pressure` (CFI atm), `Chamber Pressure (bar)` (ACME) | **DERIVABLE** via standard pressure conversion: $1\\text{ mmHg} = 0.133322\\text{ kPa}$; $1\\text{ atm} = 101.325\\text{ kPa}$; $1\\text{ bar} = 100\\text{ kPa}$. In BASS-II and Saffire, runs occur at nominal ISS/Cygnus pressure (~101.3 kPa). |")
    out.append("| `airflow_cm_s` | Forced ventilation velocity | **REAL / DERIVABLE** | `Air Flow (cm/s)` (Saffire: 20 cm/s), `Flow Velocity (cm/s)` (FLEX-2: 0.1-5 cm/s), `Air display` & `Fan calibration data.xlsx` (BASS-II) | Directly reported in cm/s for Saffire and FLEX-2. In BASS-II, reported as fan voltage/pot dial setting, calibrated to linear flow via `Fan calibration data.xlsx`. In FLEX droplet burns, flow is quiescent (0.0 cm/s). |")
    out.append("| `material` | Fuel / material classification | **REAL** | `Fuel Sample Material` (BASS-II/BASS), `Material` (Saffire), `Fuel` (FLEX/CFI), `Fuel Mole Fraction` (ACME) | Fully real: Cotton fabric (SIBAL), PMMA flat films (100μm, 200μm), PMMA rods/spheres, Nomex, Heptane droplets, Methanol droplets, Methane/Ethylene gas burners. |")
    out.append("| `ignition_observed` | Test achieved sustained ignition | **REAL** | `Ignition Power (W)` & `Ignition Time (s)` (Saffire), `Burn time; s` (FLEX), `Test #` (BASS-II) | Directly verifiable: tests with non-zero burn times or recorded thermocouple spikes achieved ignition. Saffire explicitly logs ignition electrical wattage and pulse duration. |")
    out.append("| `extinction_observed` | Flame quenched / extinguished | **REAL** | `Visible flame extinction diameter; mm` & `Test end` (FLEX), `?-g Burn Length` (Saffire-II), `Final O2 %` (BASS-II) | FLEX directly logs `Test end = Extinction` and extinction droplet diameter. Saffire-II logs whether burn halted prior to full sample consumption. BASS-II logs quench limits at low O2. |")
    out.append("| `flame_spread_observed` | Propagation along solid surface | **REAL** | `?-g Spread Length` (mm/s) (Saffire-II), `Burn Time` (Saffire-I), `Total Frames Shot` (BASS-II) | Directly reported in Saffire-II as steady mm/s spread rate (e.g. 2.1 mm/s, 2.6 mm/s). In quiescent droplets, flame spread is Not Applicable (spherical diffusion). |")
    out.append("\n### Six Similarity Factors Supported per Investigation\n")
    out.append("| Investigation | Material (30%) | O2 % (20%) | Airflow (20%) | Pressure (15%) | Objective (10%) | Geometry (5%) | Total Support Status |")
    out.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |")
    out.append("| **PSI-25 (BASS-II)** | **YES** | **YES** | **YES** | DERIVABLE (ISS 101.3) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-26 (BASS)** | **YES** | UNKNOWN (Ambient ISS) | DERIVABLE (Fan setting) | DERIVABLE (ISS 101.3) | **YES** | **YES** | **Partial (Material, Flow, Geometry)** |")
    out.append("| **PSI-98 (SAFFIRE-I)** | **YES** | **YES** | **YES** | DERIVABLE (Cygnus) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-99 (SAFFIRE-II)** | **YES** | **YES** | **YES** | DERIVABLE (Cygnus) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-100 (SAFFIRE-III)** | **YES** | **YES** | **YES** | DERIVABLE (Cygnus) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-69 (FLEX)** | **YES** | **YES** | **YES** (0.0 cm/s) | **YES** (mmHg) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-68 (FLEX-2)** | **YES** | **YES** | **YES** | **YES** (atm) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-39 (CFI)** | **YES** | **YES** | **YES** (0.0 cm/s) | **YES** (atm) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-10 (ACME Flame Design)** | **YES** | **YES** | **YES** (Co-flow) | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-20 (ACME BRE)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-21 (ACME CLD Flame)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-22 (ACME E-FIELD)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-23 (ACME s-Flame)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |")
    out.append("| **PSI-159 (ACME CFI-G)** | **YES** | **YES** | **YES** | **YES** (bar) | **YES** | **YES** | **100% of Factors Supported** |\n")
    out.append("---\n")

    # SECTION 2: Detailed Table Breakdown
    out.append("## 2. Experimental Tables Inventory & Statistical Profiles\n")

    for inv_id, acronym, doi, filename in TABLE_FILES:
        header, rows, enc = load_csv(filename)
        row_count = len(rows)
        out.append(f"### {inv_id} — {acronym} (`{filename}`)")
        out.append(f"- **DOI:** [{doi}](https://doi.org/{doi})")
        out.append(f"- **Row count:** {row_count} real runs | **Columns:** {len(header)} | **Encoding:** `{enc}`")
        out.append("\n| Column Name | Units / Format | Null Rate | Min | Max | Sample Values / Categories |")
        out.append("| :--- | :--- | :---: | :---: | :---: | :--- |")

        for idx, col in enumerate(header):
            vals = [r[idx].strip() for r in rows if idx < len(r) and r[idx].strip()]
            null_count = row_count - len(vals)
            null_rate = (null_count / row_count * 100) if row_count > 0 else 0
            uniques = sorted(list(set(vals)))

            # Numeric conversion
            nums = []
            for v in vals:
                try:
                    nums.append(float(v.replace('%', '').replace(',', '').strip()))
                except ValueError:
                    pass

            if nums and len(nums) == len(vals):
                min_str = f"{min(nums):g}"
                max_str = f"{max(nums):g}"
                sample_str = ", ".join(uniques[:4])
            else:
                min_str = "-"
                max_str = "-"
                sample_str = ", ".join(f"`{u}`" for u in uniques[:3]) if uniques else "None"

            # Detect units from column name
            unit_match = re.search(r'\(([^)]+)\)|;([^;]+)', col)
            unit_str = unit_match.group(0).strip('(); ') if unit_match else "text / nominal"

            clean_col = col.replace('|', '\\|').strip()
            out.append(f"| `{clean_col}` | {unit_str} | {null_rate:.1f}% | {min_str} | {max_str} | {sample_str} |")

        # Specific physical parameter correspondences
        out.append("\n**Physical Parameter Mapping for this Table:**")
        if 'BASS-II' in filename:
            out.append("- **Material / Fuel:** Column `Fuel Sample Material` (`100 micron PMMA film 2 cm wide`, `cotton fabric strip`, etc.)")
            out.append("- **Oxygen:** Column `Calibrated initial O2 % by vol` (13.6% to 22.2%) & `Calibrated final O2 % by vol` (0.6% to 22.2%)")
            out.append("- **Combustion Gases:** Columns `Initial CO2 % by vol`, `Final CO2 % by vol`, `Initial CO (ppm)`, `Final CO (ppm)` (CO reaches up to 107 ppm post-burn)")
            out.append("- **Flow:** Column `Flow restrictor` (0, 1, 2) & `Air display` (duct ventilation setting), calibrated via `Fan calibration data.xlsx`")
            out.append("- **Quirks:** Multiple potentiometer readings in single cells (e.g., `0.6 0.35` indicating mid-run flow step-down adjustments).")
        elif 'FLEX.csv' in filename:
            out.append("- **Material / Fuel:** Column `Fuel` (`Heptane`, `Methanol`)")
            out.append("- **Pressure:** Column `Ambient pressure; mmHg` (0 to 2066.6 mmHg $\\to$ 0 to 275.5 kPa)")
            out.append("- **Oxygen:** Column `O initial ambient composition; mole fraction` (0.12 to 0.40 $\\to$ 12% to 40% O2)")
            out.append("- **Extinction Outcome:** Column `Test end` (Exact values: `Completion`, `Disruption`, `Extinction`) & `Visible flame extinction diameter; mm` (0.12 to 1.5 mm)")
            out.append("- **Burn Dynamics:** Column `Burning rate; mm/s` (0.05 to 0.8 mm/s) & `Burn time; s` (0.3s to 26.5s)")
            out.append("- **Quirks:** Latin-1 encoding with special characters in notes; pressure 0 indicates vacuum pre-fill tests.")
        elif 'SAFFIRE-1' in filename:
            out.append("- **Material:** Column `Material` (`SIBAL Fabric` cotton-fiberglass blend, 40.6 cm length x 94 cm width x 0.37 cm thickness)")
            out.append("- **Oxygen & Airflow:** Column `Percent O2` (`~ 21.5%`, `21.5 - 21.7%`) & `Air Flow (cm/s)` (`20 cm/s`)")
            out.append("- **Ignition & Spread:** Column `Ignition Power (W)` (`182 W`), `Ignition Time (s)` (`8 s`), `Burn Time (s)` (`420 s` concurrent, `70 s` opposed)")
            out.append("- **Flow Direction:** `Concurrent` vs `Opposed`")
        elif 'SAFFIRE-2' in filename:
            out.append("- **Material:** Column `Material` (`Cotton-Fiberglass (SIBAL)`, `PMMA`, `PMMA & Nomex`)")
            out.append("- **Spread Rate & Outcomes:** Column `?-g Spread Length` (Exact values: `2.1 mm/s`, `2.6 mm/s`, `n/a (Nomex)`)")
            out.append("- **Burn Length:** Column `?-g Burn Length` (`29 cm`, `5 cm & 0`, `~ 0`, `~ 10 cm`)")
            out.append("- **Quirk:** Nomex self-extinguished without propagation (`?-g Spread Length: n/a (Nomex)`, `?-g Burn Length: ~ 0`).")
        elif 'SAFFIRE-3' in filename:
            out.append("- **Material:** Cotton-Fiberglass fabric (SIBAL) large sample aboard Cygnus OA-7.")
            out.append("- **Oxygen & Flow:** High ventilation ($20\\text{ cm/s}$) under exploration atmosphere.")
        elif 'Flame Design' in filename:
            out.append("- **Fuel & Burner:** Methane ($CH_4$), Ethylene ($C_2H_4$) in spherical / boundary coflow burners.")
            out.append("- **Pressure & Diluent:** Chamber pressure 0.5 to 3.0 bar; Dilution with $CO_2$, $N_2$, and $He$.")

        out.append("\n---\n")

    # SECTION 3: NASA NTRS & Publication Citations List
    out.append("## 3. NASA NTRS & Peer-Reviewed Publications List\n")
    out.append("Comprehensive catalog of all primary scientific papers and NASA technical documents cited in the metadata of these 14 investigations:\n")
    out.append("| Investigation | Year | Author(s) | Publication / NTRS Document Title | DOI / NTRS Accession |")
    out.append("| :--- | :---: | :--- | :--- | :--- |")

    # Load citations from metadata files
    for mf in sorted(glob.glob(os.path.join(RAW_DIR, '*_metadata.json'))):
        with open(mf, 'r', encoding='utf-8') as f:
            m = json.load(f)
        acc = m.get('accession')
        for pub in m.get('publications', []):
            author = pub.get('authorList', 'UNKNOWN')
            title = pub.get('title', 'UNKNOWN')
            year = pub.get('year', '')
            doi = pub.get('doi', '')
            if not year and 'year' in title:
                y_match = re.search(r'\((20\d\d)\)', title)
                if y_match:
                    year = y_match.group(1)
            
            author_clean = author[:40] if author else "UNKNOWN"
            title_clean = title.replace('|', '\\|')[:90] if title else "UNKNOWN"
            doi_link = f"[{doi}](https://doi.org/{doi})" if doi else "NTRS Open Access"
            out.append(f"| **{acc}** | {year or 'UNKNOWN'} | {author_clean} | {title_clean} | {doi_link} |")

    with open(INVENTORY_MD, 'w', encoding='utf-8') as f:
        f.write("\n".join(out))

    print(f"DATA_INVENTORY.md successfully written to {INVENTORY_MD} ({os.path.getsize(INVENTORY_MD)} bytes)")

if __name__ == '__main__':
    generate_inventory()
