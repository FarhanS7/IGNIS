import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Atom,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useTrustLedger } from '../context/TrustLedgerContext';
import { TrustLedgerBar } from '../components/common/TrustLedgerBar';
import { Fact } from '../components/common/Fact';
import evidenceRunsData from '../data/evidence_runs.json';

interface FactorVal {
  value: number | string | null;
  unit: string | null;
  basis: 'measured' | 'converted' | 'assumed';
  source_file: string;
  source_column: string;
  source_row: number;
}

interface EvidenceRunRaw {
  run_uid: string;
  investigation_id: string;
  platform: string;
  fuel_class: 'solid' | 'droplet' | 'gas';
  material: string;
  gravity_regime: string;
  doi: string;
  ntrs_ids: string[];
  frames_shot: number | null;
  outcome_class: string;
  outcome_source_column: string;
  usable_for_matching: boolean;
  unusable_reasons: string[];
  oxygen_pct: FactorVal | null;
  pressure_kpa: FactorVal | null;
  flow_cm_s: FactorVal | null;
  ignited: boolean | null;
  extinguished: boolean | null;
  spread_rate_mm_s?: FactorVal | null;
  burn_time_s?: FactorVal | null;
  co_ppm?: FactorVal | null;
  co2_pct?: FactorVal | null;
  metadata?: Record<string, any>;
}

const ALL_RUNS = evidenceRunsData as unknown as EvidenceRunRaw[];

const INVESTIGATIONS_CATALOG = [
  { id: 'PSI-25', name: 'BASS-II (Burning & Suppression of Solids II)', tier: 'solid', platform: 'ISS MSG', doi: '10.60555/4qc4-de67' },
  { id: 'PSI-26', name: 'BASS (Burning & Suppression of Solids)', tier: 'solid', platform: 'ISS MSG', doi: '10.60555/58h4-dy80' },
  { id: 'PSI-98', name: 'Saffire-I (Spacecraft Fire Experiment I)', tier: 'solid', platform: 'Cygnus OA-6', doi: '10.60555/0t15-1z43' },
  { id: 'PSI-99', name: 'Saffire-II (Spacecraft Fire Experiment II)', tier: 'solid', platform: 'Cygnus OA-5', doi: '10.60555/2chp-m469' },
  { id: 'PSI-100', name: 'Saffire-III (Spacecraft Fire Experiment III)', tier: 'solid', platform: 'Cygnus OA-7', doi: '10.60555/040q-4h36' },
  { id: 'PSI-69', name: 'FLEX (Flame Extinction Experiment)', tier: 'droplet', platform: 'ISS CIR', doi: '10.60555/mbq8-0451' },
  { id: 'PSI-68', name: 'FLEX-2 (Flame Extinction Experiment 2)', tier: 'droplet', platform: 'ISS CIR', doi: '10.60555/byp8-h018' },
  { id: 'PSI-10', name: 'Flame Design (Spherical/Inverse Diffusion)', tier: 'gas', platform: 'ISS CIR', doi: '10.60555/w4zy-bt45' },
  { id: 'PSI-20', name: 'ACME BRE (Burning Rate Emulator)', tier: 'gas', platform: 'ISS CIR', doi: '10.60555/vb93-3y72' },
  { id: 'PSI-21', name: 'ACME CLD (Coflow Laminar Diffusion)', tier: 'gas', platform: 'ISS CIR', doi: '10.60555/23e1-9950' },
  { id: 'PSI-22', name: 'ACME E-FIELD (Electric-Field Flames)', tier: 'gas', platform: 'ISS CIR', doi: '10.60555/se5a-8c73' },
  { id: 'PSI-23', name: 'ACME s-Flame (Spherical Flames)', tier: 'gas', platform: 'ISS CIR', doi: '10.60555/k57n-p030' },
  { id: 'PSI-39', name: 'CFI (Confined Combustion - Flat)', tier: 'gas', platform: 'ISS MSG', doi: '10.60555/m6pj-a914' },
  { id: 'PSI-159', name: 'CFI-G (Confined Combustion - Normal/Inverse)', tier: 'gas', platform: 'ISS MSG', doi: '10.60555/cyt1-kh64' },
];

export const ExperimentExplorerPage: React.FC = () => {
  const { openDrawer } = useTrustLedger();

  // Primary Tabs: Habitat (Solid) vs Fundamental Science (Droplet & Gas) vs All
  const [activeTab, setActiveTab] = useState<'habitat' | 'fundamental' | 'all'>('habitat');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvestigation, setSelectedInvestigation] = useState<string>('all');
  const [selectedFuelClass, setSelectedFuelClass] = useState<string>('all');
  const [selectedUsability, setSelectedUsability] = useState<string>('all'); // all, usable, unusable
  const [selectedBasis, setSelectedBasis] = useState<string>('all'); // all, measured, converted, assumed

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 50;

  // Filter runs
  const filteredRuns = useMemo(() => {
    return ALL_RUNS.filter((run) => {
      // Tab filter
      if (activeTab === 'habitat' && run.fuel_class !== 'solid') {
        return false;
      }
      if (activeTab === 'fundamental' && run.fuel_class === 'solid') {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUid = run.run_uid.toLowerCase().includes(q);
        const matchesMat = (run.material || '').toLowerCase().includes(q);
        const matchesInv = run.investigation_id.toLowerCase().includes(q);
        const matchesPlat = (run.platform || '').toLowerCase().includes(q);
        if (!matchesUid && !matchesMat && !matchesInv && !matchesPlat) {
          return false;
        }
      }

      // Investigation filter
      if (selectedInvestigation !== 'all' && run.investigation_id !== selectedInvestigation) {
        return false;
      }

      // Fuel class filter
      if (selectedFuelClass !== 'all' && run.fuel_class !== selectedFuelClass) {
        return false;
      }

      // Usability filter
      if (selectedUsability === 'usable' && !run.usable_for_matching) {
        return false;
      }
      if (selectedUsability === 'unusable' && run.usable_for_matching) {
        return false;
      }

      // Basis filter
      if (selectedBasis !== 'all') {
        const matchesAnyBasis =
          run.oxygen_pct?.basis === selectedBasis ||
          run.flow_cm_s?.basis === selectedBasis ||
          run.pressure_kpa?.basis === selectedBasis;
        if (!matchesAnyBasis) return false;
      }

      return true;
    });
  }, [activeTab, searchQuery, selectedInvestigation, selectedFuelClass, selectedUsability, selectedBasis]);

  // Paginated runs
  const totalPages = Math.ceil(filteredRuns.length / pageSize) || 1;
  const paginatedRuns = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRuns.slice(start, start + pageSize);
  }, [filteredRuns, page]);

  // Outcome label renderer
  const formatOutcome = (run: EvidenceRunRaw) => {
    if (run.outcome_class === 'frames_recorded') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
          title="Frame count includes post-burn images (BASS-II ReadMe)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Photographed burn: frames recorded ({run.frames_shot ?? 'N/A'})
        </span>
      );
    }
    if (run.outcome_class === 'extinguished') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-amber-950/80 text-amber-300 border border-amber-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          PI-noted extinction
        </span>
      );
    }
    if (run.outcome_class === 'no_ignition') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-purple-950/80 text-purple-300 border border-purple-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          PI-noted no ignition
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        {run.outcome_class || 'Observation recorded'}
      </span>
    );
  };

  // CSV Download handler
  const handleDownloadCSV = () => {
    const headers = [
      'run_uid',
      'investigation_id',
      'platform',
      'fuel_class',
      'material',
      'gravity_regime',
      'doi',
      'usable_for_matching',
      'outcome_class',
      'frames_shot',
      'oxygen_pct_value',
      'oxygen_pct_basis',
      'flow_cm_s_value',
      'flow_cm_s_basis',
      'pressure_kpa_value',
      'pressure_kpa_basis',
    ];

    const rows = filteredRuns.map((r) => [
      r.run_uid,
      r.investigation_id,
      r.platform,
      r.fuel_class,
      `"${(r.material || '').replace(/"/g, '""')}"`,
      r.gravity_regime,
      r.doi,
      r.usable_for_matching,
      r.outcome_class,
      r.frames_shot ?? '',
      r.oxygen_pct?.value ?? '',
      r.oxygen_pct?.basis ?? '',
      r.flow_cm_s?.value ?? '',
      r.flow_cm_s?.basis ?? '',
      r.pressure_kpa?.value ?? '',
      r.pressure_kpa?.basis ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ignis_evidence_runs_${activeTab}_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(filteredRuns, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ignis_evidence_runs_${activeTab}_filtered.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openRunAudit = (run: EvidenceRunRaw) => {
    openDrawer({
      id: run.run_uid,
      label: `Flight Run ${run.run_uid} (${run.material})`,
      value: `${run.material} [${run.outcome_class}]`,
      basis: run.oxygen_pct?.basis || 'measured',
      sourceFile: run.oxygen_pct?.source_file || 'NASA PSI Table',
      sourceColumn: run.outcome_source_column || 'Outcome Record',
      sourceRow: run.oxygen_pct?.source_row || 1,
      doi: run.doi,
      investigationId: run.investigation_id,
      notes: run.usable_for_matching
        ? 'Verified usable solid flight run with complete telemetry.'
        : `Excluded from similarity matcher: ${run.unusable_reasons.join('; ')}`,
      rawRecord: run as unknown as Record<string, any>,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Mission Mandate */}
        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold tracking-tight text-zinc-100">NASA Flight Evidence Explorer</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
                  1,401 Total Ingested Flight Runs
                </span>
              </div>
              <p className="text-sm text-zinc-400 font-mono mt-1">
                Full epistemic ledger across 14 NASA Physical Sciences Informatics (PSI) flight investigations.
              </p>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-zinc-900 border border-zinc-700 hover:border-cyan-500 text-zinc-300 hover:text-cyan-300 transition-colors"
                title="Download full JSON dataset"
              >
                <Download className="w-3.5 h-3.5" />
                Download evidence_runs.json
              </button>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-300 hover:text-emerald-300 transition-colors"
                title="Download CSV table of filtered runs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Trust Ledger Bar */}
        <TrustLedgerBar />

        {/* Primary Tabs: Habitat Tool vs Fundamental Science */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => {
              setActiveTab('habitat');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'habitat'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Habitat Fire Safety (Solid Fuels: 272 runs • 132 usable)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('fundamental');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'fundamental'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Atom className="w-4 h-4 text-cyan-400" />
            <span>Fundamental Science (FLEX / ACME / CFI: 1,129 droplet & gas runs)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('all');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>All Flight Runs (1,401)</span>
          </button>
        </div>

        {/* Separation Notice for Fundamental Science */}
        {activeTab === 'fundamental' && (
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 flex items-start gap-3">
            <Atom className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-zinc-100 font-semibold mb-1">
                Fundamental Microgravity Combustion Domain
              </strong>
              These 1,129 runs examine droplet evaporation/combustion (FLEX, FLEX-2) and gaseous diffusion flames (ACME, CFI, Flame Design).
              Because spacecraft habitat flammability involves solid structural materials and fabrics, these experiments are maintained for fundamental physics reference and are strictly partitioned from the solid-material habitat similarity matcher.
            </div>
          </div>
        )}

        {/* Filters Grid */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search run UID, material, platform..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Investigation Filter */}
            <div>
              <select
                value={selectedInvestigation}
                onChange={(e) => {
                  setSelectedInvestigation(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Invs (14)</option>
                {INVESTIGATIONS_CATALOG.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id}: {inv.name.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Tier Filter */}
            <div>
              <select
                value={selectedFuelClass}
                onChange={(e) => {
                  setSelectedFuelClass(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Fuel: All Tiers</option>
                <option value="solid">Solid (Habitats)</option>
                <option value="droplet">Droplet (FLEX)</option>
                <option value="gas">Gas (ACME/CFI)</option>
              </select>
            </div>

            {/* Usability Filter */}
            <div>
              <select
                value={selectedUsability}
                onChange={(e) => {
                  setSelectedUsability(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Usability: All</option>
                <option value="usable">Usable Only (132)</option>
                <option value="unusable">Excluded/Untenable</option>
              </select>
            </div>

            {/* Basis Filter */}
            <div>
              <select
                value={selectedBasis}
                onChange={(e) => {
                  setSelectedBasis(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Basis: All</option>
                <option value="measured">Measured</option>
                <option value="converted">Converted</option>
                <option value="assumed">Assumed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
            <span>
              Showing {filteredRuns.length} matching flight records (Page {page} of {totalPages})
            </span>
            {(searchQuery || selectedInvestigation !== 'all' || selectedFuelClass !== 'all' || selectedUsability !== 'all' || selectedBasis !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedInvestigation('all');
                  setSelectedFuelClass('all');
                  setSelectedUsability('all');
                  setSelectedBasis('all');
                  setPage(1);
                }}
                className="text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Evidence Table */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Run UID & Platform</th>
                  <th className="py-3 px-4">Investigation & DOI</th>
                  <th className="py-3 px-4">Fuel & Tier</th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span>O₂ Conc.</span>
                      <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                        meas
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span>Airflow</span>
                      <span className="px-1 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                        conv
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span>Pressure</span>
                      <span className="px-1 py-0.2 rounded text-[9px] bg-amber-950 text-amber-400 border border-amber-800">
                        assumed
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4">Observed Flight Outcome</th>
                  <th className="py-3 px-4">Matcher Status</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {paginatedRuns.map((run) => (
                  <tr
                    key={run.run_uid}
                    onClick={() => openRunAudit(run)}
                    className="hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                  >
                    {/* UID & Platform */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-cyan-300 group-hover:text-cyan-200">
                        {run.run_uid}
                      </div>
                      <div className="text-[10px] text-zinc-500">{run.platform}</div>
                    </td>

                    {/* Investigation & DOI */}
                    <td className="py-3 px-4">
                      <div className="text-zinc-200 font-medium">{run.investigation_id}</div>
                      <a
                        href={`https://doi.org/${run.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-zinc-500 hover:text-cyan-400 flex items-center gap-1"
                      >
                        {run.doi}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    {/* Fuel & Tier */}
                    <td className="py-3 px-4">
                      <div className="text-zinc-200 font-medium truncate max-w-[150px]" title={run.material}>
                        {run.material || 'N/A'}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold ${
                          run.fuel_class === 'solid'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : run.fuel_class === 'droplet'
                            ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                            : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                        }`}
                      >
                        {run.fuel_class}
                      </span>
                    </td>

                    {/* O2 Conc */}
                    <td className="py-3 px-4">
                      {run.oxygen_pct ? (
                        <Fact
                          value={`${run.oxygen_pct.value}%`}
                          basis={run.oxygen_pct.basis}
                          sourceFile={run.oxygen_pct.source_file}
                          sourceColumn={run.oxygen_pct.source_column}
                          sourceRow={run.oxygen_pct.source_row}
                          doi={run.doi}
                          investigationId={run.investigation_id}
                          showBasisBadge
                        />
                      ) : (
                        <span className="text-zinc-600">N/A</span>
                      )}
                    </td>

                    {/* Airflow */}
                    <td className="py-3 px-4">
                      {run.flow_cm_s ? (
                        <Fact
                          value={`${run.flow_cm_s.value} cm/s`}
                          basis={run.flow_cm_s.basis}
                          sourceFile={run.flow_cm_s.source_file}
                          sourceColumn={run.flow_cm_s.source_column}
                          sourceRow={run.flow_cm_s.source_row}
                          doi={run.doi}
                          investigationId={run.investigation_id}
                          showBasisBadge
                        />
                      ) : (
                        <span className="text-zinc-600">0 cm/s (quiescent)</span>
                      )}
                    </td>

                    {/* Pressure */}
                    <td className="py-3 px-4">
                      {run.pressure_kpa ? (
                        <Fact
                          value={`${run.pressure_kpa.value} kPa`}
                          basis={run.pressure_kpa.basis}
                          sourceFile={run.pressure_kpa.source_file}
                          sourceColumn={run.pressure_kpa.source_column}
                          sourceRow={run.pressure_kpa.source_row}
                          doi={run.doi}
                          investigationId={run.investigation_id}
                          showBasisBadge
                        />
                      ) : run.fuel_class === 'solid' ? (
                        <Fact
                          value="101.3 kPa"
                          basis="assumed"
                          sourceFile={run.oxygen_pct?.source_file || 'PSI-25_Science Documents_BASS-II_ReadMe.docx'}
                          sourceColumn="Assumed nominal atmospheric pressure"
                          sourceRow={run.oxygen_pct?.source_row || 1}
                          doi={run.doi}
                          investigationId={run.investigation_id}
                          label="Chamber Pressure (Assumed)"
                          notes="No solid-fuel combustion flight experiment measured chamber pressure; standard 101.3 kPa nominal cabin atmosphere is assumed across all runs."
                          showBasisBadge
                        />
                      ) : (
                        <span className="text-zinc-600">N/A</span>
                      )}
                    </td>

                    {/* Observed Outcome */}
                    <td className="py-3 px-4">
                      {formatOutcome(run)}
                    </td>

                    {/* Matcher Status */}
                    <td className="py-3 px-4">
                      {run.usable_for_matching ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Usable
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono"
                          title={run.unusable_reasons.join(', ')}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
                          {run.fuel_class !== 'solid' ? 'Fundamental science' : 'Excluded'}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRunAudit(run);
                        }}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-[11px] font-mono transition-colors"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between p-4 bg-zinc-900/60 border-t border-zinc-800 text-xs font-mono">
            <span className="text-zinc-400">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredRuns.length)} of {filteredRuns.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-zinc-300 px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
