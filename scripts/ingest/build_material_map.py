"""Builds comprehensive material_map.json for all solid fuel flight runs.

Maps every distinct raw material string to:
- family: PMMA | SIBAL | Nomex | Silicone | Wax | Fabric/Polymer | Other
- geometry: flat | rod | sphere | cylinder
- thickness_mm: float | null
- guessed: bool (True if inferred from test matrix context rather than stated verbatim)
- basis_notes: explanation of mapping
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOLID_PATH = ROOT / "data" / "processed" / "evidence_solid.json"
OUTPUT_PATH = ROOT / "data" / "processed" / "material_map.json"

with open(SOLID_PATH, "r", encoding="utf-8") as f:
    runs = json.load(f)

raw_materials = sorted(list(set(r["material"] for r in runs if r.get("material"))))

material_map = {}
guessed_list = []

for raw in raw_materials:
    s = raw.lower().strip()
    guessed = False
    notes = []

    # 1. Family
    if "sibal" in s or "cotton-fiberglass" in s or "cotton" in s:
        family = "SIBAL"
        notes.append("SIBAL cotton-fiberglass blend")
    elif "nomex" in s:
        if "pmma" in s:
            family = "PMMA & Nomex"
            notes.append("Dual material PMMA & Nomex composite (Saffire-II)")
        else:
            family = "Nomex"
            notes.append("Nomex III aramid fabric")
    elif "silicone" in s:
        family = "Silicone"
        notes.append("Silicone rubber sheet")
    elif "wax" in s or "candle" in s:
        family = "Wax"
        notes.append("Japan Wax / Paraffin candle")
    elif "fabric / polymer" in s or "fabric" in s:
        family = "Fabric/Polymer"
        notes.append("Saffire composite fabric/polymer blend")
    elif any(k in s for k in ["pmma", "acrylic", "plexiglas"]):
        family = "PMMA"
        notes.append("PMMA (acrylic) polymer")
    elif any(k in s for k in ["rod", "slab", "film", "spherical", "micron"]):
        family = "PMMA"
        guessed = True
        notes.append("PMMA inferred from BASS-II sample manifest / PI test matrix")
    else:
        family = "Other"
        guessed = True
        notes.append("Unknown material family")

    # 2. Geometry
    if "rod" in s:
        geometry = "rod"
    elif "spherical" in s or "sphere" in s:
        geometry = "sphere"
    elif "candle" in s:
        geometry = "cylinder"
    else:
        geometry = "flat"  # film, slab, fabric, sheet

    # 3. Thickness (mm)
    thickness_mm = None
    if geometry == "rod":
        if "1/4" in s or "0.25" in s:
            thickness_mm = 6.35
        elif "3/8" in s or "0.375" in s:
            thickness_mm = 9.525
        elif "1/2" in s or "0.5" in s:
            thickness_mm = 12.7
    elif geometry == "sphere":
        thickness_mm = 40.0
    elif geometry == "flat":
        # Check microns
        m_mic = re.search(r"(\d+)\s*micron", s)
        m_mm_thick = re.search(r"(\d+(?:\.\d+)?)\s*mm\s*thick", s)
        m_mm_val = re.search(r"(\d+(?:\.\d+)?)\s*mm", s)
        if m_mic:
            thickness_mm = round(float(m_mic.group(1)) / 1000.0, 3)
        elif m_mm_thick:
            thickness_mm = round(float(m_mm_thick.group(1)), 3)
        elif "0.1 mm" in s:
            thickness_mm = 0.1
        elif "0.2 mm" in s:
            thickness_mm = 0.2
        elif "0.4 mm" in s:
            thickness_mm = 0.4
        elif m_mm_val:
            thickness_mm = round(float(m_mm_val.group(1)), 3)
        elif "sibal fabric" in s or raw == "SIBAL Fabric":
            thickness_mm = 3.7  # Saffire-I SIBAL is 0.37 cm
        elif "cotton-fiberglass (sibal)" in s:
            thickness_mm = 0.4  # Saffire-II 2-5
        elif "1 cm sibal" in s or "2 cm sibal" in s:
            thickness_mm = 0.3  # BASS-II SIBAL fabric strip (~0.3 mm)
            guessed = True
            notes.append("SIBAL fabric thickness ~0.3 mm inferred from textile spec")

    if guessed:
        guessed_list.append((raw, family, geometry, thickness_mm, "; ".join(notes)))

    material_map[raw] = {
        "raw_material": raw,
        "family": family,
        "geometry": geometry,
        "thickness_mm": thickness_mm,
        "guessed": guessed,
        "notes": "; ".join(notes),
    }

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(material_map, f, indent=2)

print(f"Successfully generated {OUTPUT_PATH}")
print(f"Total mapped material strings: {len(material_map)}")
print(f"Total strings with guessed attributes: {len(guessed_list)}")
print("\n--- Guessed Material Strings List ---")
for g in guessed_list:
    print(f" - {repr(g[0])} -> Family: {g[1]}, Geom: {g[2]}, Thick: {g[3]} mm ({g[4]})")

# Verify all usable runs map
usable = [r for r in runs if r.get("usable_for_matching")]
for r in usable:
    mat = r["material"]
    assert mat in material_map, f"Missing material mapping for usable run {r['run_uid']}: {mat}"
print(f"\nAssertion PASSED: All {len(usable)} usable runs mapped in material_map.json!")
