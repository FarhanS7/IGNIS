import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Database,
  Scale,
  Award,
  Layers,
  FileText,
  Sliders,
  ExternalLink,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../lib/api';
import type { DataSource } from '../types/api';

const DEFAULT_SOURCES: DataSource[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'NASA Physical Sciences Informatics (PSI)',
    source_role: 'primary_scientific',
    registry: 'NASA_PSI',
    url: 'https://psi.nasa.gov',
    description: 'Direct flight logs, thermocouple arrays, and video records for Saffire, BASS, and FLEX investigations.',
    doi: '10.2514/1.B35421',
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'NASA Images and Video Library (CIR / MSG)',
    source_role: 'media',
    registry: 'NASA_OPEN_DATA',
    url: 'https://images.nasa.gov',
    description: 'High-speed optical camera recordings aboard the ISS Combustion Integrated Rack and Microgravity Glovebox.',
    doi: 'NASA-PHOTO-ISS040E089222',
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'NASA Earthdata FIRMS (Active Fire System)',
    source_role: 'earth_observation_context',
    registry: 'NASA_EARTHDATA',
    url: 'https://firms.modaps.eosdis.nasa.gov',
    description: 'MODIS & VIIRS 375m thermal anomaly infrared sensor records utilized for planetary macro comparison.',
    doi: '10.5067/FIRMS/WELD.001',
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'IGNIS Classical Computer Vision Image Pipeline',
    source_role: 'derived_by_ignis',
    registry: 'OTHER_NASA_REPOSITORY',
    url: 'https://github.com/FarhanS7/IGNIS',
    description: 'Reproducible classical OpenCV/NumPy HSV contour segmentation, flame area ratio time-series, and centroid tracking.',
    doi: 'ignis-cv-hsv-v1.0.0',
  },
];

export const AboutPage: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>(DEFAULT_SOURCES);

  useEffect(() => {
    let active = true;
    api.getDataSources()
      .then((data) => {
        if (active && data && data.length > 0) {
          setSources(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch remote NASA data sources, using baseline registry:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="eyebrow-pill mb-2">
          <span>NASA Space Apps Challenge 2026 • Flame in Freefall</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
          Methodology & Provenance Policy
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          How IGNIS transforms four decades of NASA microgravity combustion research into a verifiable evidence network — transparent mathematical weighting, 5-tier provenance tracking, and zero ungrounded physical hallucination.
        </p>
      </div>

      {/* Safety & Non-Operational Certification Notice */}
      <section id="disclaimers" className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Non-Operational Research Notice & PRD v1.1 §1.1 Compliance</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong>IGNIS (Intelligent Guidance from NASA Ignition Studies)</strong> is explicitly an interactive research and educational evidence exploration system. Calculations, similarity ratings, and behavior profiles provided by IGNIS do <strong>NOT</strong> constitute official flight qualification, mission safety clearance, or certified life-support engineering compliance under <strong>NASA-STD-6001B</strong>.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The system never outputs binary "safe / unsafe" verdicts. All combustion analysis is framed as multidimensional empirical evidence. Real spacecraft mission-critical operations must follow designated NASA Flight Safety Review Boards.
        </p>
      </section>

      {/* 5-Level Evidence Hierarchy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            The 5-Tier Evidence Hierarchy (DECISIONS.md D-001)
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          To maintain strict scientific traceability, every metric, data point, and statement in IGNIS carries an explicit authority badge distinguishing directly measured physical telemetry from constrained AI synthesis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Level A: Directly Observed Telemetry</span>
              <EvidenceBadge level="A" size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flight data recorded directly by physical instruments aboard spacecraft, the ISS, or drop towers (e.g., thermocouple readings, optical sensor time-series, pressure transducers). Maximum authority.
            </p>
          </Card>

          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Level B: Normalized Source Tables</span>
              <EvidenceBadge level="B" size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized, unit-converted data tables extracted from published NASA Physical Sciences Informatics (PSI) archives and peer-reviewed journal papers with verified DOIs.
            </p>
          </Card>

          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Level C: Computer Vision Derived Metrics</span>
              <EvidenceBadge level="C" size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quantitative measurements computed from flight optical telemetry by classical computer vision algorithms (e.g., HSV flame boundary contour extraction, centroid tracking, area growth curves). Fully reproducible.
            </p>
          </Card>

          <Card variant="glass" padding="md" className="space-y-2 border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Level D: Mathematical Similarity Inference</span>
              <EvidenceBadge level="D" size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empirical comparability match rankings generated by normalized multi-variable vector scoring with transparent domain weights and gravity transfer penalty caps.
            </p>
          </Card>

          <Card variant="glass" padding="md" className="space-y-2 border-white/10 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Level E: Grounded AI Synthesis</span>
              <EvidenceBadge level="E" size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Natural language explanations generated by retrieval-augmented LLMs. Strictly constrained to retrieved NASA literature chunks with mandatory citation links. Zero ungrounded hallucination.
            </p>
          </Card>
        </div>
      </section>

      {/* The Comparable-Evidence Gate */}
      <section id="method" className="glass-card space-y-5 rounded-2xl border border-white/10 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-white font-bold text-lg sm:text-xl font-['Space_Grotesk',sans-serif]">
          <Scale className="w-5 h-5 text-cyan-400" />
          <span>The Comparable-Evidence Gate (PRD v1.1 §14)</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          In combustion science, naively matching numerical numbers across fundamentally different physical phenomena produces dangerously unscientific conclusions (e.g., declaring a gaseous methane jet 95% similar to solid Nomex fabric simply because oxygen and pressure happen to match).
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          IGNIS enforces a mandatory multi-stage eligibility gate prior to executing similarity algorithms:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">1. Fuel Family Compatibility</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solid sheet fuels (PMMA, cotton) are separated from liquid droplets (FLEX heptane) and gaseous jets. Cross-family matches are strictly excluded.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wide">2. Gravity Transferability</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Matching Lunar (0.16g) or Mars (0.38g) scenarios against 0g orbital data triggers a mandatory caveat warning and caps confidence at Medium.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">3. Dynamic Renormalization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an experiment did not record a specific parameter (e.g., missing flow velocity), it is omitted from scoring and remaining weights re-sum to 1.0.
            </p>
          </div>
        </div>
      </section>

      {/* Similarity Weighting Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Similarity Weighting Engine (PRD v1.1 §15)
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Vector similarity calculations use empirical sensitivity weights derived from NASA microgravity combustion literature:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white/5 text-slate-300 uppercase font-mono text-[11px] border-b border-white/10">
              <tr>
                <th className="p-3 sm:p-4">Parameter</th>
                <th className="p-3 sm:p-4">Weight</th>
                <th className="p-3 sm:p-4">Mathematical Function</th>
                <th className="p-3 sm:p-4">Physical Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-xs">
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Fuel / Material Family</td>
                <td className="p-3 sm:p-4 text-cyan-400 font-bold">30%</td>
                <td>Categorical Exact / Taxonomy Jaccard</td>
                <td className="font-sans text-slate-400">Primary driver of pyrolysis kinetics and limiting oxygen concentration (LOC).</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Oxygen Concentration (O₂)</td>
                <td className="p-3 sm:p-4 text-cyan-400 font-bold">20%</td>
                <td>Bounded Gaussian Decay (σ = 4.0%)</td>
                <td className="font-sans text-slate-400">Directly sets flame chemical reaction rate and radiative heat generation.</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Forced Airflow Velocity</td>
                <td className="p-3 sm:p-4 text-cyan-400 font-bold">20%</td>
                <td>Asymmetric Exponential (v &lt; 0.2 m/s)</td>
                <td className="font-sans text-slate-400">Controls convective oxidizer supply vs aerodynamic convective blowout.</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Cabin Total Pressure</td>
                <td className="p-3 sm:p-4 text-cyan-400 font-bold">15%</td>
                <td>Logarithmic Pressure Distance</td>
                <td className="font-sans text-slate-400">Alters gas density, thermal conductivity, and three-body quenching.</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Scientific Objective</td>
                <td className="p-3 sm:p-4 text-cyan-400 font-bold">10%</td>
                <td>Jaccard Overlap</td>
                <td className="font-sans text-slate-400">Matches target research focus (flame spread vs extinction limits).</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-sans font-semibold text-white">Geometry & Regime</td>
                <td className="p-3 sm:p-4 text-cyan-400 font-bold">5%</td>
                <td>Dimension Ratio Match</td>
                <td className="font-sans text-slate-400">Sample thickness and boundary layer duct dimensions.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Multi-Channel NASA Registries */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            NASA Data Channels & Roles (PRD v1.1 §12)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">NASA PSI</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Primary Ground Truth
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physical Sciences Informatics (PSI) database records: Saffire I–VI Cygnus flights, BASS-I/II glovebox tests, and FLEX droplet investigations.
            </p>
            <a
              href="https://psi.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-white flex items-center gap-1 font-mono pt-1"
            >
              psi.nasa.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">NASA Earthdata</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Comparative Context
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              FIRMS satellite active thermal anomaly sensing of terrestrial wildfires. Used exclusively in the Explore Fire module to contrast macro remote sensing with micro cabin safety.
            </p>
            <a
              href="https://firms.modaps.eosdis.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-400 hover:text-white flex items-center gap-1 font-mono pt-1"
            >
              firms.modaps.eosdis.nasa.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">NASA NTRS / Open Data</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Peer-Reviewed Citations
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NASA Technical Reports Server (NTRS) flight documentation, conference proceedings, and DOI publications linked to individual chunks.
            </p>
            <a
              href="https://ntrs.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-white flex items-center gap-1 font-mono pt-1"
            >
              ntrs.nasa.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Registered NASA Data Sources Catalog (FR-NAS-006 / Task I.5) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">
              Registered NASA Source Catalog & Provenance (FR-NAS-006)
            </h2>
          </div>
          <Badge variant="flame" size="xs">
            {sources.length} REGISTERED SOURCES
          </Badge>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Active data sources registered in the IGNIS evidence catalog with authority tier assignments, verified DOIs, and isolation roles.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-slate-300 uppercase text-[11px] border-b border-white/10 font-sans">
              <tr>
                <th className="p-3.5">Source / Agency</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Description & Provenance Scope</th>
                <th className="p-3.5">Accession / DOI</th>
                <th className="p-3.5">Repository Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-sans font-semibold text-white whitespace-nowrap">
                    <div>{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">{s.registry}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        s.source_role === 'primary_scientific'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : s.source_role === 'earth_observation_context'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : s.source_role === 'derived_by_ignis'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
                      }`}
                    >
                      {s.source_role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-xs text-slate-300 max-w-sm">
                    {s.description}
                  </td>
                  <td className="p-3.5 text-cyan-300 whitespace-nowrap text-[11px]">
                    {s.doi || '—'}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Challenge Attribution & Next Steps */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-cyan-950/40 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold font-mono">
            <Award className="w-4 h-4" />
            <span>NASA Space Apps Challenge 2026</span>
          </div>
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk',sans-serif]">
            Ready to test spacecraft fire scenarios?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Configure cabin oxygen, pressure, and ventilation in the Habitat Builder to evaluate empirical NASA fire behavior.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/build">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Open Habitat Builder
            </Button>
          </Link>
          <Link to="/ask">
            <Button variant="outline" size="md" icon={<FileText className="w-4 h-4" />}>
              Ask IGNIS RAG
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
