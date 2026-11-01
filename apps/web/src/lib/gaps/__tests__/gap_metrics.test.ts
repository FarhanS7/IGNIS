import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getDefaultMissions,
  rankMissionsByCoverage,
  computeScenarioGapMetrics,
} from '../gap_metrics.ts';

describe('Research Gap Metrics and Mission Ranking', () => {
  it('loads all 5 mission scenarios from missions.json', () => {
    const missions = getDefaultMissions();
    assert.strictEqual(missions.length, 5);
    const ids = missions.map((m) => m.id);
    assert.ok(ids.includes('iss_cabin'));
    assert.ok(ids.includes('gateway_like'));
    assert.ok(ids.includes('exploration_atmosphere'));
    assert.ok(ids.includes('lunar_surface_habitat'));
    assert.ok(ids.includes('mars_surface_habitat'));
  });

  it('verifies that pressure_measured is always false for all scenarios', () => {
    const missions = getDefaultMissions();
    const ranked = rankMissionsByCoverage(missions, 0.25);
    for (const r of ranked) {
      assert.strictEqual(
        r.pressure_measured,
        false,
        `Scenario ${r.scenario_id} must have pressure_measured=false`
      );
    }
  });

  it('ranks ISS Cabin highest due to dense matching flight records', () => {
    const missions = getDefaultMissions();
    const ranked = rankMissionsByCoverage(missions, 0.25);
    assert.strictEqual(ranked[0].scenario_id, 'iss_cabin');
    assert.ok(ranked[0].evidence_coverage_pct >= 90.0);
    assert.ok(ranked[0].same_material_runs_in_radius > 50);
    assert.strictEqual(ranked[0].gravity_matches, true);
    assert.strictEqual(ranked[0].pressure_extrapolation, false);
  });

  it('identifies gravity mismatch and pressure extrapolation on Lunar and Mars habitats', () => {
    const missions = getDefaultMissions();
    const ranked = rankMissionsByCoverage(missions, 0.25);
    const lunar = ranked.find((r) => r.scenario_id === 'lunar_surface_habitat');
    const mars = ranked.find((r) => r.scenario_id === 'mars_surface_habitat');

    assert.ok(lunar);
    assert.strictEqual(lunar.gravity_matches, false);
    assert.strictEqual(lunar.pressure_extrapolation, true);
    assert.ok(
      lunar.gap_recommendations.some((rec) =>
        rec.includes('partial-gravity centrifuge')
      )
    );

    assert.ok(mars);
    assert.strictEqual(mars.gravity_matches, false);
    assert.strictEqual(mars.pressure_extrapolation, true);
    assert.ok(
      mars.gap_recommendations.some((rec) =>
        rec.includes('0.38 g')
      )
    );
  });

  it('allows configurable radius to modulate same_material_runs_in_radius', () => {
    const missions = getDefaultMissions();
    const rankedSmall = rankMissionsByCoverage(missions, 0.05);
    const rankedLarge = rankMissionsByCoverage(missions, 0.40);

    const issSmall = rankedSmall.find((r) => r.scenario_id === 'iss_cabin');
    const issLarge = rankedLarge.find((r) => r.scenario_id === 'iss_cabin');

    assert.ok(issSmall && issLarge);
    assert.ok(issLarge.same_material_runs_in_radius >= issSmall.same_material_runs_in_radius);
  });
});
