import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Database,
  Scale,
  Layers,
  Sliders,
  ExternalLink,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

const PSI_INVESTIGATIONS = [
  { id: 'PSI-25', name: 'BASS-II (Burning and Suppression of Solids II)', tier: 'Solid Fuel (Habitat)', platform: 'ISS MSG', doi: '10.60555/4qc4-de67', runs: 129 },
  { id: 'PSI-26', name: 'BASS (Burning and Suppression of Solids)', tier: 'Solid Fuel (Habitat)', platform: 'ISS MSG', doi: '10.60555/58h4-dy80', runs: 122 },
  { id: 'PSI-98', name: 'Saffire-I (Spacecraft Fire Experiment I)', tier: 'Solid Fuel (Habitat)', platform: 'Cygnus OA-6', doi: '10.60555/0t15-1z43', runs: 4 },
  { id: 'PSI-99', name: 'Saffire-II (Spacecraft Fire Experiment II)', tier: 'Solid Fuel (Habitat)', platform: 'Cygnus OA-5', doi: '10.60555/2chp-m469', runs: 15 },
  { id: 'PSI-100', name: 'Saffire-III (Spacecraft Fire Experiment III)', tier: 'Solid Fuel (Habitat)', platform: 'Cygnus OA-7', doi: '10.60555/040q-4h36', runs: 2 },
  { id: 'PSI-69', name: 'FLEX (Flame Extinction Experiment)', tier: 'Droplet (Fundamental)', platform: 'ISS CIR', doi: '10.60555/mbq8-0451', runs: 274 },
  { id: 'PSI-68', name: 'FLEX-2 (Flame Extinction Experiment 2)', tier: 'Droplet (Fundamental)', platform: 'ISS CIR', doi: '10.60555/byp8-h018', runs: 8 },
  { id: 'PSI-10', name: 'Flame Design (Spherical/Inverse Diffusion)', tier: 'Gas Flame (Fundamental)', platform: 'ISS CIR', doi: '10.60555/w4zy-bt45', runs: 327 },
  { id: 'PSI-20', name: 'ACME BRE (Burning Rate Emulator)', tier: 'Gas Flame (Fundamental)', platform: 'ISS CIR', doi: '10.60555/vb93-3y72', runs: 18 },
  { id: 'PSI-21', name: 'ACME CLD (Coflow Laminar Diffusion)', tier: 'Gas Flame (Fundamental)', platform: 'ISS CIR', doi: '10.60555/23e1-9950', runs: 32 },
  { id: 'PSI-22', name: 'ACME E-FIELD (Electric-Field Flames)', tier: 'Gas Flame (Fundamental)', platform: 'ISS CIR', doi: '10.60555/se5a-8c73', runs: 32 },
  { id: 'PSI-23', name: 'ACME s-Flame (Spherical Flames)', tier: 'Gas Flame (Fundamental)', platform: 'ISS CIR', doi: '10.60555/k57n-p030', runs: 18 },
  { id: 'PSI-39', name: 'CFI (Confined Combustion - Flat)', tier: 'Gas Flame (Fundamental)', platform: 'ISS MSG', doi: '10.60555/m6pj-a914', runs: 87 },
  { id: 'PSI-159', name: 'CFI-G (Confined Combustion - Normal/Inverse)', tier: 'Gas Flame (Fundamental)', platform: 'ISS MSG', doi: '10.60555/cyt1-kh64', runs: 333 },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-16 px-4 sm:px-6">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-3">
          NASA Space Apps Challenge 2026 • Flame in Freefall
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
          Methodology, Provenance & Validation Policy
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          IGNIS indexes 1,401 flight combustion records from 14 NASA Physical Sciences Informatics (PSI) investigations.
          We provide transparent mathematical k-nearest-neighbor retrieval, column-level basis auditing, and zero ungrounded claims.
        </p>
      </div>

      {/* Non-Operational Certification Notice */}
      <section id="disclaimers" className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Non-Operational Research Notice</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong>IGNIS (Intelligent Guidance from NASA Ignition Studies)</strong> is an interactive research and educational evidence exploration system. Calculations, similarity ratings, and flight records provided by IGNIS do <strong>NOT</strong> constitute official flight qualification, mission safety clearance, or certified life-support engineering compliance under <strong>NASA-STD-6001B</strong>.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The system never outputs binary verdicts or numerical clearance scores. All combustion analysis is presented strictly as empirical historical flight observations. Spacecraft mission-critical operations must follow designated NASA Flight Safety Review Boards.
        </p>
      </section>

      {/* Verified Dataset Scope: 1,401 Total vs 132 Usable Solid Runs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Verified Flight Dataset Scope & Inclusion Criteria
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="text-2xl font-bold text-cyan-400 font-mono">1,401</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider">Total Flight Runs Ingested</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracted directly from 14 official NASA PSI data tables and calibrated telemetry archives across orbital missions and Cygnus cargo vehicles.
            </p>
          </Card>

          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="text-2xl font-bold text-amber-400 font-mono">272</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider">Solid Fuel Runs (BASS & Saffire)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flight runs testing solid polymers (PMMA acrylic, SIBAL cotton-fiberglass blend, Nomex flight suit fabric, silicone).
            </p>
          </Card>

          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="text-2xl font-bold text-emerald-400 font-mono">132</div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider">Usable for Similarity Matcher</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solid runs with complete measured oxygen %, physical airflow conversions, and unambiguous material identification without sensor drift failure.
            </p>
          </Card>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2">
          <strong className="block text-white font-semibold">Why are 140 solid runs excluded from similarity matching?</strong>
          <p>
            Of the 272 solid flight runs, 140 were excluded from the mathematical kNN matcher for explicit, documented reasons:
            (1) Test B2 and four other BASS-II runs experienced extreme initial-to-final oxygen deltas (|ΔO₂| &gt; 5%), which BASS-II ReadMe paragraph 22 explains were caused by uncalibrated paramagnetics drift or telemetry loss rather than fuel combustion;
            (2) Runs without recorded forced flow velocity dial settings; and
            (3) Runs with unverified or proprietary composite blends outside published taxonomy.
          </p>
        </div>
      </section>

      {/* The 14 Ingested NASA PSI Investigations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
              Catalog of 14 Ingested NASA PSI Flight Investigations
            </h2>
          </div>
          <Badge variant="neutral" size="xs">
            14 PEER-REVIEWED INVESTIGATIONS
          </Badge>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Every record in IGNIS traces to one of these 14 primary physical investigations in the NASA Physical Sciences Informatics repository:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-slate-300 uppercase text-[11px] border-b border-white/10 font-sans">
              <tr>
                <th className="p-3.5">Investigation</th>
                <th className="p-3.5">Title & Platform</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Runs</th>
                <th className="p-3.5">DOI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {PSI_INVESTIGATIONS.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-sans font-semibold text-white whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="text-slate-100">{inv.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.platform}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {inv.tier}
                    </span>
                  </td>
                  <td className="p-3.5 text-cyan-300 font-bold whitespace-nowrap">
                    {inv.runs}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <a
                      href={`https://doi.org/${inv.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      <span>{inv.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assumptions: Pressure & Gravity */}
      <section className="glass-card space-y-4 rounded-2xl border border-white/10 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg sm:text-xl font-['Space_Grotesk',sans-serif]">
          <Scale className="w-5 h-5 text-cyan-400" />
          <span>Physical Assumptions & Epistemic Boundaries</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase font-mono">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Pressure Assumption (Untested in Flight)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No solid-fuel flight combustion experiment (BASS, BASS-II, Saffire) measured chamber pressure during flight runs.
              All solid flight runs were conducted within nominal 1 atm (101.325 kPa) cabin environments.
              Consequently, cabin pressure is marked as <code>assumed</code> across the entire dataset and excluded from mathematical distance calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold uppercase font-mono">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>Gravitational Transfer Boundary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              100% of matched flight runs were conducted in orbital microgravity (~0 g).
              Transferring microgravity empirical data to partial gravity environments such as the Moon (0.16 g) or Mars (0.38 g) is physically untested.
              IGNIS displays a persistent warning whenever partial gravity is selected, noting that buoyant natural convection re-emerges at partial gravity.
            </p>
          </div>
        </div>
      </section>

      {/* Grouped Cross-Validation & Validation Limits */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Validation Summary & Statistical Limits
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          To evaluate whether multi-factor similarity matching provides predictive utility over simple rules, we conducted grouped leave-one-out cross-validation (Grouped LOOCV) grouped by fuel material and sample geometry (110 independent test groups across 132 usable solid runs), benchmarked against a baseline single-parameter oxygen threshold rule:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead className="bg-white/5 text-slate-300 uppercase text-[11px] border-b border-white/10">
              <tr>
                <th className="p-3 sm:p-4">Metric</th>
                <th className="p-3 sm:p-4">Full Matcher (k=5)</th>
                <th className="p-3 sm:p-4">O₂ Threshold Rule</th>
                <th className="p-3 sm:p-4">Difference (95% Bootstrap CI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Overall Accuracy</td>
                <td className="p-3 sm:p-4 text-cyan-400">80.30% (106/132)</td>
                <td className="p-3 sm:p-4 text-slate-300">79.55% (105/132)</td>
                <td className="p-3 sm:p-4 text-slate-400">+0.76% [-4.55%, +6.82%] (p=1.000)</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Balanced Accuracy</td>
                <td className="p-3 sm:p-4 text-cyan-400">46.72%</td>
                <td className="p-3 sm:p-4 text-slate-300">44.38%</td>
                <td className="p-3 sm:p-4 text-slate-400">+2.34% [-5.88%, +10.85%]</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Extinction Recall</td>
                <td className="p-3 sm:p-4 text-cyan-400">48.00% (12/25)</td>
                <td className="p-3 sm:p-4 text-slate-300">40.00% (10/25)</td>
                <td className="p-3 sm:p-4 text-slate-400">+8.00% [-16.67%, +33.33%]</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-2">
          <strong className="block text-cyan-300 font-semibold">Honest Epistemic Finding & Retraction:</strong>
          <p>
            Under strict grouped leave-one-group-out cross-validation across all 110 independent hardware groups, the multi-factor kNN matcher achieves <strong>80.30% overall accuracy (106/132)</strong>, <strong>46.72% balanced accuracy</strong>, and <strong>48.00% extinction recall (12/25)</strong>. Because every 95% bootstrap confidence interval for the performance difference spans zero and exact McNemar test yields p = 1.0000, multi-factor matching demonstrates <strong>no statistically validated performance advantage</strong> over a single oxygen threshold rule.
          </p>
          <p className="text-slate-400">
            <strong>Retraction of Ungrouped Figures:</strong> Earlier development snapshots reported 92.42% overall accuracy, 87.89% balanced accuracy, and 84.00% extinction recall. As proven in our validation audit (<code>docs/VALIDATION.md</code>), those figures were an artifact of ungrouped sample-level cross-validation, where repeated burns of identical physical samples leaked between training and test folds.
          </p>
          <p>
            The system's true purpose and value is therefore not outcome forecasting, but <strong>epistemic provenance retrieval</strong>: instantly providing astronautical engineers with the raw flight records, physical test conditions, DOI citations, and primary data tables from real NASA missions.
          </p>
        </div>
      </section>

      {/* Fire Response Console Methodology */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Fire Response & Smoke Containment Simulation
        </h2>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 space-y-3">
          <p>
            The <strong>Fire Response Console</strong> (<code>/response</code>) demonstrates emergency response containment, multi-sensor alarm discrimination, and ventilation isolation in microgravity habitats.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Transport Modeling:</strong> Microgravity smoke transport along duct networks is grounded in qualitative findings from NASA SAME (NTRS-20130000422). Absence of buoyant convection means smoke disperses via forced ventilation and duct mixing rather than rising.</li>
            <li><strong>Multi-Channel Heuristic Fusion:</strong> Evaluates coincident obscuration, carbon monoxide (ppm), and thermal rate-of-rise over a sustained persistence window to reject transient non-fire dust and cleaning aerosols.</li>
            <li><strong>Emergency Sequencing:</strong> Progression follows NASA ISS procedures (NTRS-20030053429) and water mist extinguishing research (NTRS-20130011664). In crewed mode, fire suppression agent discharge strictly requires human verification to safeguard cabin breathing volumes.</li>
          </ul>

          {/* 4-Row Epistemic Transparency Table: Real-Data Trained vs Simulated */}
          <div className="pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono mb-2">
              Epistemic Audit: Real-Data Trained vs. Simulated Components
            </h3>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Subsystem</th>
                    <th className="py-2 px-3">Implementation</th>
                    <th className="py-2 px-3">Grounding / Training Source</th>
                    <th className="py-2 px-3">Operational Boundary & Caveats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-cyan-300">Detector Fusion (M2)</td>
                    <td className="py-2.5 px-3">L2 Logistic Classifier + Conformal Abstention</td>
                    <td className="py-2.5 px-3">Ground EN54 room & industrial hall (DOIs: 10.17632/npk2zcm85h.2, 10.17632/yghykzm4km.1)</td>
                    <td className="py-2.5 px-3 text-amber-300">Trained on Earth-gravity data. Not validated in microgravity. Evaluates behavioral consistency on simulated streams.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-cyan-300">Detector Response (M1)</td>
                    <td className="py-2.5 px-3">Calibrated Response Curve + Domain Check</td>
                    <td className="py-2.5 px-3">130 NASA SAME / SAME-R flight runs on ISS (PSI-101/102, PMC7918997)</td>
                    <td className="py-2.5 px-3 text-slate-400">Calibrated on microgravity flight tests. Abstains outside empirical particle size range [0.035, 1.07] µm.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-cyan-300">Extinction Boundary (M4)</td>
                    <td className="py-2.5 px-3">Conformal Logistic Extinction Classifier</td>
                    <td className="py-2.5 px-3">274 NASA FLEX / FLEX-2 droplet burns on ISS (PSI-69/68)</td>
                    <td className="py-2.5 px-3 text-amber-300">Droplet flames in ISS microgravity (FLEX). Not cabin solid fuels. Informs physical boundaries; never auto-triggers.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-cyan-300">Transport & Sequencer</td>
                    <td className="py-2.5 px-3">1D Advection-Dispersion Compartment Network</td>
                    <td className="py-2.5 px-3">Qualitative transport from NASA SAME (NTRS-20130000422) & ISS Procedures (NTRS-20030053429)</td>
                    <td className="py-2.5 px-3 text-slate-400">Simulated sensor data. Not flight software. Assumes well-mixed zone compartments.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-2">
            <Link
              to="/response"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors text-xs"
            >
              <span>Explore Fire Response Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
