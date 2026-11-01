import json
import math

def calculate_gap_metrics(missions_file="data/missions.json", runs_file="data/processed/evidence_runs.json", mat_map_file="data/processed/material_map.json", radius=0.25):
    runs = json.load(open(runs_file, encoding='utf-8'))
    usable = [r for r in runs if r.get('fuel_class') == 'solid' and r.get('usable_for_matching')]
    mm = json.load(open(mat_map_file, encoding='utf-8'))

    def get_family(m):
        entry = mm.get(m, {})
        return entry.get('family', 'Other') if isinstance(entry, dict) else 'Other'

    for r in usable:
        r['family'] = get_family(r.get('material', ''))

    missions_data = json.load(open(missions_file, encoding='utf-8'))
    results = []

    for m in missions_data.get('scenarios', []):
        s_o2 = m['parameters']['oxygen_pct']['value']
        s_flow = m['parameters']['flow_cm_s']['value']
        s_pressure = m['parameters']['pressure_kpa']['value']
        s_g = m['parameters']['gravity_g']['value']
        s_mat = m['parameters']['material_family']['value']

        dists = []
        same_mat_count = 0

        for r in usable:
            o2_val = r['oxygen_pct']['value']
            flow_val = r['flow_cm_s']['value']
            if o2_val is None or flow_val is None:
                continue
            # Normalized Euclidean distance in (O2/20, Flow/40)
            d = math.sqrt(((s_o2 - o2_val) / 20.0) ** 2 + ((s_flow - flow_val) / 40.0) ** 2)
            dists.append((d, r))
            if r['family'] == s_mat and d <= radius:
                same_mat_count += 1

        dists.sort(key=lambda x: x[0])
        min_d = dists[0][0] if dists else 999.0
        nearest_run = dists[0][1] if dists else None

        # Components
        proximity_score = max(0.0, 1.0 - min_d)
        density_score = min(1.0, same_mat_count / 5.0)
        p_matches_1atm = abs(s_pressure - 101.325) < 5.0
        g_matches_microgravity = s_g == 0.0

        # Weights: 40% proximity, 30% local material density, 15% pressure regime match, 15% gravity match
        evidence_coverage_pct = round(
            (0.40 * proximity_score +
             0.30 * density_score +
             0.15 * (1.0 if p_matches_1atm else 0.0) +
             0.15 * (1.0 if g_matches_microgravity else 0.0)) * 100,
            1
        )

        # Templated gap recommendation
        gap_statements = []
        if min_d > 0.15:
            gap_statements.append(f"Requires microgravity burn at {s_o2}% O2 / {s_flow} cm/s (tested nearest: {nearest_run['oxygen_pct']['value']}% O2, {nearest_run['flow_cm_s']['value']} cm/s)")
        if not p_matches_1atm:
            gap_statements.append(f"Requires flight burn with active pressure transducer at {s_pressure} kPa (tested record only measured at nominal 1 atm)")
        if not g_matches_microgravity:
            gap_statements.append(f"Requires partial-gravity centrifuge flight test or drop-tower / parabolic campaign at {s_g} g (tested record microgravity-only)")
        if same_mat_count < 3:
            gap_statements.append(f"Requires repeat burn campaign for material family '{s_mat}' in this velocity regime (found {same_mat_count} runs within radius {radius})")

        if not gap_statements:
            gap_recommendation = "Tested flight record provides dense baseline data; recommended experiment is fine-grained flammability boundary mapping."
        else:
            gap_recommendation = " | ".join(gap_statements)

        results.append({
            'scenario_id': m['id'],
            'title': m['title'],
            'evidence_coverage_pct': evidence_coverage_pct,
            'normalized_distance_to_nearest': round(min_d, 4),
            'nearest_run_uid': nearest_run['run_uid'] if nearest_run else None,
            'nearest_run_o2': nearest_run['oxygen_pct']['value'] if nearest_run else None,
            'nearest_run_flow': nearest_run['flow_cm_s']['value'] if nearest_run else None,
            'nearest_run_family': nearest_run['family'] if nearest_run else None,
            'same_material_runs_in_radius': same_mat_count,
            'radius': radius,
            'pressure_measured': False,  # Always False in tested flight solid runs
            'pressure_extrapolation': not p_matches_1atm,
            'gravity_matches': g_matches_microgravity,
            'gap_recommendation': gap_recommendation,
            'gap_statements': gap_statements
        })

    # Rank by evidence coverage descending
    results.sort(key=lambda x: -x['evidence_coverage_pct'])
    for idx, r in enumerate(results, start=1):
        r['rank'] = idx

    return results

if __name__ == "__main__":
    import sys
    res = calculate_gap_metrics()
    for r in res:
        print(f"Rank {r['rank']}: {r['title']} - Coverage: {r['evidence_coverage_pct']}% | Min Dist: {r['normalized_distance_to_nearest']} | Same-mat: {r['same_material_runs_in_radius']} | P_meas: {r['pressure_measured']} | G_match: {r['gravity_matches']}")
        print(f"   Gap experiment: {r['gap_recommendation']}")
