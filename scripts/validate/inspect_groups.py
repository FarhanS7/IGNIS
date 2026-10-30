import json
from collections import Counter

with open("data/processed/evidence_solid.json", "r", encoding="utf-8") as f:
    runs = [r for r in json.load(f) if r.get("usable_for_matching")]

print(f"Total usable runs: {len(runs)}")
groups = []

for r in runs:
    inv = r["investigation_id"]
    meta = r.get("metadata") or {}
    sample_no = str(meta.get("sample_no", "")).strip()
    test_id = str(meta.get("test_id", "")).strip()
    
    if sample_no:
        clean_sample = sample_no.lower().replace("m", "").replace("l", "").strip()
        group_id = f"{inv}_sample_{clean_sample}"
    elif test_id:
        group_id = f"{inv}_test_{test_id}"
    else:
        group_id = f"{inv}_{r['run_uid']}"
    groups.append(group_id)

c = Counter(groups)
print(f"Total unique physical sample groups: {len(c)}")
print("Group size distribution (number of runs per group):", sorted(Counter(c.values()).items()))
print("\nTop 15 most tested sample hardware groups:")
for g, cnt in c.most_common(15):
    print(f"  {g}: {cnt} runs")
