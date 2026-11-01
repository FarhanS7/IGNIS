"""Circularity Audit and Grouped CV under Three Conditions:
(a) As-is (all 132 runs)
(b) Excluding circular BASS-II rows (where outcome and flow both derive from Air/Fan notes)
(c) Flow masked for circular rows (flow set to None / zero weight, renormalizing weights)
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.api.app.matching.real_solid import RealSolidMatcher
from scripts.validate.grouped_loocv import run_grouped_validation, print_grouped_cv_report

def main():
    matcher = RealSolidMatcher()
    usable_runs = matcher.usable_runs

    # Identify circular runs
    circular_uids = set()
    circular_details = []
    for r in usable_runs:
        if r.get("investigation_id") == "PSI-25":
            out_col = r.get("outcome_source_column") or ""
            flow_col = (r.get("flow_cm_s") or {}).get("source_column") or ""
            outcome = r.get("outcome_class")
            if outcome in ["extinguished", "no_ignition"]:
                if any(t in out_col.lower() for t in ["air display", "fan display"]):
                    if any(t in flow_col.lower() for t in ["air display", "fan display"]):
                        circular_uids.add(r["run_uid"])
                        circular_details.append(r)

    print("=" * 80)
    print(f"BASS-II CIRCULARITY AUDIT: {len(circular_details)} POTENTIALLY CIRCULAR ROWS FOUND")
    print("=" * 80)
    for r in circular_details:
        uid = r["run_uid"]
        tid = r.get("metadata", {}).get("test_id", "")
        flow = r["flow_cm_s"]["value"]
        flow_col = r["flow_cm_s"]["source_column"]
        out = r["outcome_class"]
        out_col = r["outcome_source_column"]
        print(f"[{uid}] (Test {tid:5s}) Outcome={out} (from {out_col}) | Flow={flow} cm/s (from {flow_col})")

    # (a) As is
    print("\n" + "#" * 80)
    print("CONDITION (a): AS-IS (ALL 132 RUNS)")
    print("#" * 80)
    res_a = run_grouped_validation(custom_runs=usable_runs)
    print_grouped_cv_report(res_a)

    # (b) Excluding circular rows
    runs_b = [r for r in usable_runs if r["run_uid"] not in circular_uids]
    print("\n" + "#" * 80)
    print(f"CONDITION (b): EXCLUDING CIRCULAR ROWS ({len(runs_b)} RUNS)")
    print("#" * 80)
    res_b = run_grouped_validation(custom_runs=runs_b)
    print_grouped_cv_report(res_b)

    # (c) Masking flow for circular rows
    runs_c = []
    for r in usable_runs:
        r_c = json.loads(json.dumps(r))
        if r_c["run_uid"] in circular_uids:
            # Set flow to None so weight dynamically renormalizes to material, oxygen, geometry
            r_c["flow_cm_s"] = None
        runs_c.append(r_c)
    print("\n" + "#" * 80)
    print(f"CONDITION (c): FLOW MASKED FOR CIRCULAR ROWS ({len(runs_c)} RUNS)")
    print("#" * 80)
    res_c = run_grouped_validation(custom_runs=runs_c)
    print_grouped_cv_report(res_c)

    # Comparative Summary Table
    print("\n" + "=" * 80)
    print("COMPARATIVE SUMMARY ACROSS THE THREE CONDITIONS")
    print("=" * 80)
    print(f"{'Condition':<35} | {'N':<4} | {'Groups':<6} | {'Full k=5 Acc':<13} | {'O2-Rule Acc':<11} | {'Diff [95% CI]':<20} | {'Full k=5 Ext Recall'}")
    print("-" * 120)
    for name, res in [
        ("(a) As-is (all 132 runs)", res_a),
        ("(b) Excl circular (107 runs)", res_b),
        ("(c) Mask flow circular (132 runs)", res_c),
    ]:
        k5_acc = res["results"]["Full IGNIS (k=5)"]["accuracy"] * 100
        o2_acc = res["results"]["O2-Threshold Rule"]["accuracy"] * 100
        ext_rec = res["results"]["Full IGNIS (k=5)"]["per_class"].get("extinguished", {}).get("recall", 0.0) * 100
        diff_info = res["k5_vs_o2_threshold_rule"]["metrics"]["accuracy"]
        diff_pct = diff_info[0] * 100
        ci_str = f"[{diff_info[1]*100:+.1f}%, {diff_info[2]*100:+.1f}%]"
        print(f"{name:<35} | {res['n_samples']:<4} | {res['n_groups']:<6} | {k5_acc:6.2f}%       | {o2_acc:6.2f}%     | {diff_pct:+5.2f}% {ci_str:<14} | {ext_rec:6.2f}%")

if __name__ == "__main__":
    main()
