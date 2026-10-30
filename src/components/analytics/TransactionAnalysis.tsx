'use client';

import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  Calendar,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Wallet,
  Landmark,
  ArrowDownRight,
  Info,
  Clock,
  Layers,
  SlidersHorizontal,
  Route,
  Download,
  FileText,
  CheckCircle2,
  Share2,
  HelpCircle,
  Sparkles,
  CornerDownRight,
  Save,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Entity, Relationship } from '@/types/intelligence';
import { traceShortestPath } from '@/lib/graphAnalytics';
import { useTheme } from '@/lib/themeContext';

interface TransactionAnalysisProps {
  entities: Entity[];
  relationships: Relationship[];
  onSelectEntity: (id: string) => void;
  onNavigateToGraph: (id: string) => void;
}

export const TransactionAnalysis: React.FC<TransactionAnalysisProps> = ({
  entities,
  relationships,
  onSelectEntity,
  onNavigateToGraph,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Active View Tab: Guided Path Tracer vs AML Monitoring
  const [activeTab, setActiveTab] = useState<'tracer' | 'monitoring'>('tracer');

  // Guided Path Tracer State
  const [traceSource, setTraceSource] = useState<string>('ENT-001'); // Victor Vance default
  const [traceTarget, setTraceTarget] = useState<string>('ENT-005'); // Lucian Drake default
  const [traceMaxHops, setTraceMaxHops] = useState<number>(3);
  const [traceStartDate, setTraceStartDate] = useState<string>('2023-01-01');
  const [traceEndDate, setTraceEndDate] = useState<string>('2026-12-31');
  const [traceChannel, setTraceChannel] = useState<'all' | 'financial' | 'corporate'>('all');
  const [hasTraced, setHasTraced] = useState<boolean>(true);
  const [savedCaseMessage, setSavedCaseMessage] = useState<string | null>(null);

  // AML Monitoring & Ledger State
  const [minAmount, setMinAmount] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [flagFilter, setFlagFilter] = useState<'all' | 'flagged' | 'normal'>('all');

  // Configurable Detection Thresholds
  const [highVolumeThreshold, setHighVolumeThreshold] = useState<number>(5000000);
  const [smurfingCeiling, setSmurfingCeiling] = useState<number>(10000);
  const [startDate, setStartDate] = useState<string>('2023-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [explainFlagTx, setExplainFlagTx] = useState<any | null>(null);

  // Extract financial transactions from relationships
  const transactions = useMemo(() => {
    return relationships
      .filter((r) => r.type === 'financial_flow')
      .map((r) => {
        const sourceEntity = entities.find((e) => e.id === r.source);
        const targetEntity = entities.find((e) => e.id === r.target);
        const amount = r.amountUSD || 500000;
        const isSmurfing = amount >= smurfingCeiling * 0.9 && amount < smurfingCeiling;
        const isHighVolume = amount >= highVolumeThreshold;
        const isFlagged = isSmurfing || isHighVolume || r.verificationStatus === 'allegation';

        let flagReason = '';
        if (isSmurfing) {
          flagReason = `Structured transfer ($${amount.toLocaleString()}) below $${smurfingCeiling.toLocaleString()} reporting ceiling (Potential Smurfing)`;
        } else if (isHighVolume) {
          flagReason = `Bulk high-velocity offshore transfer ($${amount.toLocaleString()}) exceeding configured threshold ($${highVolumeThreshold.toLocaleString()})`;
        } else if (r.verificationStatus === 'allegation') {
          flagReason = 'Unverified wire flagged by European Financial Intelligence Unit';
        }

        return {
          id: `TX-${r.id}`,
          relId: r.id,
          sourceId: r.source,
          sourceName: sourceEntity ? sourceEntity.name : r.source,
          targetId: r.target,
          targetName: targetEntity ? targetEntity.name : r.target,
          amountUSD: amount,
          date: r.firstSeen,
          status: r.verificationStatus,
          isFlagged,
          flagReason,
          provenance: r.provenance,
          description: r.description,
        };
      });
  }, [relationships, entities, highVolumeThreshold, smurfingCeiling]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.amountUSD < minAmount) return false;
      if (flagFilter === 'flagged' && !t.isFlagged) return false;
      if (flagFilter === 'normal' && t.isFlagged) return false;
      if (t.date && (t.date < startDate || t.date > endDate)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          t.sourceName.toLowerCase().includes(q) ||
          t.targetName.toLowerCase().includes(q) ||
          t.sourceId.toLowerCase().includes(q) ||
          t.targetId.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [transactions, minAmount, flagFilter, startDate, endDate, search]);

  // Daily / Monthly aggregate volume chart
  const volumeChartData = [
    { period: '2023 Q2', volumeM: 14.5, count: 8 },
    { period: '2023 Q3', volumeM: 22.8, count: 12 },
    { period: '2023 Q4', volumeM: 19.4, count: 11 },
    { period: '2024 Q1', volumeM: 35.1, count: 19 },
    { period: '2024 Q2', volumeM: 48.6, count: 24 },
    { period: '2024 Q3', volumeM: 42.0, count: 21 },
    { period: '2024 Q4', volumeM: 58.4, count: 28 },
    { period: '2025 Q1', volumeM: 64.8, count: 32 },
  ];

  // Guided Path Tracer computation
  const tracedPathData = useMemo(() => {
    if (!hasTraced || !traceSource || !traceTarget) return null;

    if (traceSource === traceTarget) {
      const e = entities.find((ent) => ent.id === traceSource);
      return {
        isSelf: true,
        sourceEntity: e,
        targetEntity: e,
        path: [traceSource],
        edges: [] as Relationship[],
        totalAmountUSD: 0,
        hopsCount: 0,
        intermediariesCount: 0,
        avgHopDays: 0,
        highestRiskNode: e,
      };
    }

    // Filter candidate relationships by channel and date window
    const eligibleRels = relationships.filter((r) => {
      if (traceChannel === 'financial' && r.type !== 'financial_flow') return false;
      if (traceChannel === 'corporate' && r.type !== 'ownership' && r.type !== 'association') return false;
      if (r.firstSeen && (r.firstSeen < traceStartDate || r.firstSeen > traceEndDate)) return false;
      return true;
    });

    // BFS search bounded by traceMaxHops
    const adj = new Map<string, { neighbor: string; edge: Relationship }[]>();
    entities.forEach((ent) => adj.set(ent.id, []));

    eligibleRels.forEach((r) => {
      adj.get(r.source)?.push({ neighbor: r.target, edge: r });
      adj.get(r.target)?.push({ neighbor: r.source, edge: r });
    });

    const queue: { id: string; depth: number }[] = [{ id: traceSource, depth: 0 }];
    const visited = new Set<string>([traceSource]);
    const parent = new Map<string, { prev: string; edge: Relationship }>();
    let found = false;

    while (queue.length > 0) {
      const { id: cur, depth } = queue.shift()!;
      if (cur === traceTarget) {
        found = true;
        break;
      }
      if (depth >= traceMaxHops) continue;

      for (const { neighbor, edge } of adj.get(cur) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, { prev: cur, edge });
          queue.push({ id: neighbor, depth: depth + 1 });
        }
      }
    }

    if (!found) {
      // Find closest neighbors for both entities to give helpful guidance
      const sourceDirect = relationships
        .filter((r) => r.source === traceSource || r.target === traceSource)
        .map((r) => (r.source === traceSource ? r.target : r.source));
      const targetDirect = relationships
        .filter((r) => r.source === traceTarget || r.target === traceTarget)
        .map((r) => (r.source === traceTarget ? r.target : r.source));

      const sourceNeighbors = entities.filter((e) => sourceDirect.includes(e.id));
      const targetNeighbors = entities.filter((e) => targetDirect.includes(e.id));

      return {
        notFound: true,
        sourceEntity: entities.find((e) => e.id === traceSource),
        targetEntity: entities.find((e) => e.id === traceTarget),
        sourceNeighbors,
        targetNeighbors,
      };
    }

    // Reconstruct path
    const path: string[] = [];
    const edges: Relationship[] = [];
    let curr: string | undefined = traceTarget;
    let totalAmount = 0;

    while (curr && curr !== traceSource) {
      path.unshift(curr);
      const p = parent.get(curr);
      if (p) {
        edges.unshift(p.edge);
        if (p.edge.amountUSD) {
          totalAmount += p.edge.amountUSD;
        }
        curr = p.prev;
      } else {
        break;
      }
    }
    path.unshift(traceSource);

    const pathEntities = path.map((id) => entities.find((e) => e.id === id)!);
    const highestRiskNode = [...pathEntities].sort(
      (a, b) => (b?.metrics.riskScore || 0) - (a?.metrics.riskScore || 0)
    )[0];

    return {
      notFound: false,
      isSelf: false,
      sourceEntity: pathEntities[0],
      targetEntity: pathEntities[pathEntities.length - 1],
      path,
      pathEntities,
      edges,
      totalAmountUSD: totalAmount,
      hopsCount: edges.length,
      intermediariesCount: Math.max(0, path.length - 2),
      avgHopDays: Math.round(18 + Math.random() * 6), // illustrative transit latency
      highestRiskNode,
    };
  }, [hasTraced, traceSource, traceTarget, traceMaxHops, traceStartDate, traceEndDate, traceChannel, entities, relationships]);

  // Export Trace as CSV
  const handleExportTraceCSV = () => {
    if (!tracedPathData || tracedPathData.notFound || !tracedPathData.edges) return;
    const rows = [
      ['Hop', 'Source ID', 'Source Name', 'Target ID', 'Target Name', 'Channel', 'Amount USD', 'Date', 'Verification', 'Admiralty Code'],
      ...tracedPathData.edges.map((edge, idx) => {
        const s = entities.find((e) => e.id === edge.source);
        const t = entities.find((e) => e.id === edge.target);
        return [
          idx + 1,
          edge.source,
          s?.name || edge.source,
          edge.target,
          t?.name || edge.target,
          edge.type,
          edge.amountUSD || 0,
          edge.firstSeen || '',
          edge.verificationStatus,
          edge.admiraltyCode || 'B2',
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crimegraph-trace-${traceSource}-to-${traceTarget}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Trace as JSON
  const handleExportTraceJSON = () => {
    if (!tracedPathData || tracedPathData.notFound) return;
    const blob = new Blob([JSON.stringify(tracedPathData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crimegraph-path-trace-${traceSource}-${traceTarget}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save to active case
  const handleSaveToCase = () => {
    setSavedCaseMessage('Trace conduit attached to Active Dossier #CG-2026-904 (Operation Black Pearl).');
    setTimeout(() => setSavedCaseMessage(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1]">Transaction Analysis</h2>
          <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1">
            Trace financial routes between accounts and detect unusual activity.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-[#15120e] border border-slate-300 dark:border-[#2f2a23] rounded-xl">
          <button
            onClick={() => setActiveTab('tracer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'tracer'
                ? 'bg-white dark:bg-[#dfd5bf] text-slate-950 dark:text-[#080706] shadow-sm'
                : 'text-slate-600 dark:text-[#9e907d] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Path Tracer</span>
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'monitoring'
                ? 'bg-white dark:bg-[#dfd5bf] text-slate-950 dark:text-[#080706] shadow-sm'
                : 'text-slate-600 dark:text-[#9e907d] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>Transaction Ledger</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: GUIDED TRANSACTION PATH TRACER
      ========================================================================= */}
      {activeTab === 'tracer' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Preset Demonstrations Row */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23] rounded-xl text-xs font-mono">
            <span className="text-slate-500 dark:text-[#8f8270] flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-[#dfd5bf]" /> Quick Scenarios:
            </span>
            <button
              onClick={() => {
                setTraceSource('ENT-001');
                setTraceTarget('ENT-005');
                setTraceMaxHops(3);
                setHasTraced(true);
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#1e1a14] border border-slate-300 dark:border-[#383127] text-slate-700 dark:text-[#dfd5bf] hover:border-amber-500 transition text-[11px]"
            >
              Vance ➔ Drake
            </button>
            <button
              onClick={() => {
                setTraceSource('ENT-004');
                setTraceTarget('ENT-007');
                setTraceMaxHops(4);
                setHasTraced(true);
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#1e1a14] border border-slate-300 dark:border-[#383127] text-slate-700 dark:text-[#dfd5bf] hover:border-amber-500 transition text-[11px]"
            >
              Cipher Capital ➔ Golden Horizon
            </button>
            <button
              onClick={() => {
                setTraceSource('ENT-003');
                setTraceTarget('ENT-006');
                setTraceMaxHops(3);
                setHasTraced(true);
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#1e1a14] border border-slate-300 dark:border-[#383127] text-slate-700 dark:text-[#dfd5bf] hover:border-amber-500 transition text-[11px]"
            >
              Blackwood ➔ Swiss Private Bank
            </button>
          </div>

          {/* Interactive Configuration Panel */}
          <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-800 dark:text-[#f4ede1] flex items-center gap-2">
                <Route className="w-4 h-4 text-amber-500 dark:text-[#dfd5bf]" />
                Find Route Between Accounts
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">
                Shortest Path
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              {/* Step 1: Source */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-[#dfd5bf] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-[#dfd5bf] flex items-center justify-center text-[10px]">1</span>
                  Source Account
                </label>
                <select
                  value={traceSource}
                  onChange={(e) => setTraceSource(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-amber-400 dark:focus:border-[#dfd5bf]"
                >
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.name} ({e.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Destination */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-[#dfd5bf] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-[#dfd5bf] flex items-center justify-center text-[10px]">2</span>
                  Target Account
                </label>
                <select
                  value={traceTarget}
                  onChange={(e) => setTraceTarget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-amber-400 dark:focus:border-[#dfd5bf]"
                >
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.name} ({e.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Filters (Hops & Channels) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-[#dfd5bf] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-[#dfd5bf] flex items-center justify-center text-[10px]">3</span>
                  Max Hops &amp; Type
                </label>
                <div className="flex gap-2">
                  <select
                    value={traceMaxHops}
                    onChange={(e) => setTraceMaxHops(Number(e.target.value))}
                    className="w-1/2 bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2 py-2 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
                  >
                    <option value="1">1 Hop</option>
                    <option value="2">2 Hops</option>
                    <option value="3">3 Hops</option>
                    <option value="4">4 Hops</option>
                    <option value="5">5 Hops</option>
                  </select>
                  <select
                    value={traceChannel}
                    onChange={(e) => setTraceChannel(e.target.value as any)}
                    className="w-1/2 bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2 py-2 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="financial">Financial Only</option>
                    <option value="corporate">Corporate Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  onClick={() => setHasTraced(true)}
                  className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Route className="w-4 h-4" />
                  <span>Trace Route</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 5: Trace Results View */}
          {hasTraced && tracedPathData && (
            <div className="space-y-6">
              {tracedPathData.notFound ? (
                /* Clear Disconnected Notice & Bridge Suggestions */
                <div className="p-6 rounded-xl bg-amber-50/70 dark:bg-[#18140f] border border-amber-300/60 dark:border-[#42392e] space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                        No Direct or Intermediary Transaction Conduit Discovered
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-[#cfc1ab] mt-1 leading-relaxed">
                        No continuous path exists between <strong>{tracedPathData.sourceEntity?.name}</strong> and{' '}
                        <strong>{tracedPathData.targetEntity?.name}</strong> within the current limit of {traceMaxHops}{' '}
                        hops and selected channel filters.
                      </p>
                    </div>
                  </div>

                  {/* Suggest Closest Related Entities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-200 dark:border-[#383127] text-xs font-mono">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-[#dfd5bf] block mb-1">
                        Closest Contacts of {tracedPathData.sourceEntity?.name}:
                      </span>
                      <div className="space-y-1">
                        {tracedPathData.sourceNeighbors?.slice(0, 3).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setTraceSource(n.id);
                              setHasTraced(true);
                            }}
                            className="p-2 rounded bg-white dark:bg-[#12100e] border border-amber-200 dark:border-[#2f2a23] hover:border-amber-500 cursor-pointer flex justify-between items-center"
                          >
                            <span>{n.name}</span>
                            <span className="text-[10px] text-amber-600 dark:text-[#dfd5bf]">Set as Source ➔</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-[#dfd5bf] block mb-1">
                        Closest Contacts of {tracedPathData.targetEntity?.name}:
                      </span>
                      <div className="space-y-1">
                        {tracedPathData.targetNeighbors?.slice(0, 3).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setTraceTarget(n.id);
                              setHasTraced(true);
                            }}
                            className="p-2 rounded bg-white dark:bg-[#12100e] border border-amber-200 dark:border-[#2f2a23] hover:border-amber-500 cursor-pointer flex justify-between items-center"
                          >
                            <span>{n.name}</span>
                            <span className="text-[10px] text-amber-600 dark:text-[#dfd5bf]">Set as Target ➔</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setTraceMaxHops(5);
                        setTraceChannel('all');
                        setHasTraced(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-mono text-xs font-bold shadow-xs hover:bg-amber-500"
                    >
                      Expand to 5 Hops &amp; All Channels
                    </button>
                  </div>
                </div>
              ) : (
                /* Success Results: KPI Summary, Visual Flow, Forensic Table, and Export */
                <>
                  {/* Summary Metric KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
                      <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Total Transferred</div>
                      <div className="text-2xl font-bold font-mono text-amber-600 dark:text-[#d4af37] mt-1">
                        ${((tracedPathData.totalAmountUSD || 0) / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">Across all route hops</div>
                    </div>

                    <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
                      <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Route Distance</div>
                      <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f4ede1] mt-1">
                        {tracedPathData.hopsCount} Hops
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">
                        {tracedPathData.intermediariesCount} intermediaries
                      </div>
                    </div>

                    <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
                      <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Avg Transfer Latency</div>
                      <div className="text-2xl font-bold font-mono text-sky-600 dark:text-[#dfd5bf] mt-1">
                        ~{tracedPathData.avgHopDays} Days
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">Estimated transfer window</div>
                    </div>

                    <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
                      <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Highest Risk Target</div>
                      <div className="text-sm font-bold font-mono text-red-500 dark:text-red-400 mt-1 truncate">
                        {tracedPathData.highestRiskNode?.name || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">
                        Risk Score: {tracedPathData.highestRiskNode?.metrics.riskScore}/100
                      </div>
                    </div>
                  </div>

                  {/* Visual Path Flow Diagram */}
                  <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1] font-mono uppercase tracking-wider flex items-center gap-2">
                        <Route className="w-4 h-4 text-amber-500 dark:text-[#dfd5bf]" />
                        Visual Route Flow
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-600/30">
                        PATH FOUND
                      </span>
                    </div>

                    {/* Flow chain cards */}
                    <div className="flex flex-col md:flex-row items-center gap-3 overflow-x-auto py-2">
                      {tracedPathData.pathEntities?.map((entity, idx) => {
                        const edgeAfter = tracedPathData.edges?.[idx];
                        const isStart = idx === 0;
                        const isEnd = idx === tracedPathData.pathEntities!.length - 1;

                        return (
                          <React.Fragment key={entity.id}>
                            <div
                              onClick={() => onSelectEntity(entity.id)}
                              className={`p-3 rounded-xl border transition cursor-pointer min-w-[180px] flex-1 ${
                                isStart
                                  ? 'bg-amber-50/80 dark:bg-[#1a1714] border-amber-400 dark:border-[#d4af37]'
                                  : isEnd
                                  ? 'bg-sky-50/80 dark:bg-[#14181c] border-sky-400 dark:border-sky-600'
                                  : 'bg-white dark:bg-[#110f0d] border-slate-300 dark:border-[#2f2a23]'
                              } hover:shadow-md`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-[#25201a] text-slate-700 dark:text-[#dfd5bf]">
                                  {isStart ? 'ORIGIN' : isEnd ? 'TARGET' : `HOP #${idx}`}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-red-500">
                                  {entity.metrics.riskScore}/100
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-[#f4ede1] mt-1.5 truncate">
                                {entity.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-[#8f8270] capitalize">
                                {entity.type.replace('_', ' ')}
                              </p>
                              <div className="mt-2 pt-1 border-t border-slate-200 dark:border-[#25201a] flex justify-between text-[10px] font-mono text-cyan-600 dark:text-cyan-bright">
                                <span>Inspect Node</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>

                            {/* Arrow connecting to next node */}
                            {edgeAfter && (
                              <div className="flex flex-col items-center justify-center shrink-0 px-1 py-2">
                                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-[#d4af37]">
                                  {edgeAfter.amountUSD ? `$${(edgeAfter.amountUSD / 1000).toLocaleString()}k` : edgeAfter.label}
                                </span>
                                <ArrowRight className="w-5 h-5 text-amber-500 dark:text-[#dfd5bf]" />
                                <span className="text-[9px] font-mono text-slate-400 capitalize">
                                  {edgeAfter.type.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step-by-Step Transaction Table */}
                  <div className="rounded-xl glass-panel overflow-hidden border border-slate-200 dark:border-[#2f2a23] shadow-sm space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                          Route Steps
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-[#8f8270]">
                          Sequential transfers along this connection
                        </p>
                      </div>

                      {/* Export Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportTraceCSV}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1a1714] border border-slate-300 dark:border-[#383127] text-slate-700 dark:text-[#dfd5bf] hover:text-slate-900 dark:hover:text-white text-xs font-mono transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          onClick={handleExportTraceJSON}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1a1714] border border-slate-300 dark:border-[#383127] text-slate-700 dark:text-[#dfd5bf] hover:text-slate-900 dark:hover:text-white text-xs font-mono transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export JSON</span>
                        </button>
                        <button
                          onClick={handleSaveToCase}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:bg-slate-800 text-xs font-mono font-bold transition shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save to Case</span>
                        </button>
                      </div>
                    </div>

                    {/* Saved Case Notification */}
                    {savedCaseMessage && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{savedCaseMessage}</span>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-[#2f2a23] bg-slate-50/50 dark:bg-[#12100e] text-slate-500 dark:text-[#8f8270] font-mono text-[11px] uppercase">
                            <th className="py-2.5 px-3">Hop #</th>
                            <th className="py-2.5 px-3">Origin Entity</th>
                            <th className="py-2.5 px-3">Target Entity</th>
                            <th className="py-2.5 px-3">Channel / Type</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Amount (USD)</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Provenance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#221d17]">
                          {tracedPathData.edges?.map((edge, idx) => {
                            const source = entities.find((e) => e.id === edge.source);
                            const target = entities.find((e) => e.id === edge.target);
                            return (
                              <tr key={edge.id} className="hover:bg-slate-50/50 dark:hover:bg-[#161411]">
                                <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-[#dfd5bf]">
                                  #{idx + 1}
                                </td>
                                <td className="py-2.5 px-3">
                                  <button
                                    onClick={() => onSelectEntity(edge.source)}
                                    className="font-bold text-slate-800 dark:text-[#f4ede1] hover:underline text-left block"
                                  >
                                    {source?.name || edge.source}
                                  </button>
                                  <span className="text-[10px] text-slate-400 font-mono">{edge.source}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <button
                                    onClick={() => onSelectEntity(edge.target)}
                                    className="font-bold text-slate-800 dark:text-[#f4ede1] hover:underline text-left block"
                                  >
                                    {target?.name || edge.target}
                                  </button>
                                  <span className="text-[10px] text-slate-400 font-mono">{edge.target}</span>
                                </td>
                                <td className="py-2.5 px-3 font-mono capitalize text-slate-600 dark:text-[#b8ad99]">
                                  {edge.type.replace('_', ' ')}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-[#8f8270]">
                                  {edge.firstSeen || '2024-04-12'}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-[#d4af37]">
                                  {edge.amountUSD ? `$${edge.amountUSD.toLocaleString()}` : '—'}
                                </td>
                                <td className="py-2.5 px-3 font-mono">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                                      edge.verificationStatus === 'verified' || edge.verificationStatus === 'verified_fact'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                    }`}
                                  >
                                    {edge.verificationStatus.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[10px] text-cyan-600 dark:text-cyan-bright">
                                  {edge.admiraltyCode || 'B2 (Reliable)'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: AML FLOW MONITORING & RADAR
      ========================================================================= */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Analytics KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Total Volume</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f4ede1] mt-1">
                ${(transactions.reduce((acc, t) => acc + t.amountUSD, 0) / 1000000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">{transactions.length} recorded transfers</div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Flagged Transfers</div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-[#d4af37] mt-1">
                {transactions.filter((t) => t.isFlagged).length}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">Exceeds threshold or structured</div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Avg Transfer Value</div>
              <div className="text-2xl font-bold font-mono text-sky-600 dark:text-[#dfd5bf] mt-1">
                $
                {(
                  transactions.reduce((acc, t) => acc + t.amountUSD, 0) /
                  (transactions.length || 1) /
                  1000
                ).toFixed(0)}
                k
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">Average transfer size</div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-xs">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Currencies Tracked</div>
              <div className="text-lg font-bold font-mono text-indigo-700 dark:text-[#dfd5bf] mt-1">USD • EUR • BTC • USDT</div>
              <div className="text-[10px] text-slate-500 dark:text-[#8f8270] mt-1">Fiat &amp; crypto assets</div>
            </div>
          </div>

          {/* Transaction Volume Chart */}
          <div className="p-5 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                  Quarterly Transaction Volume
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8f8270]">
                  Aggregated transfer volume across accounts by quarter
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-[#1f1b16] border border-amber-300 dark:border-[#42392e] text-amber-700 dark:text-[#dfd5bf] font-semibold">
                FLOWS
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="period" stroke={isDark ? '#736b5d' : '#94a3b8'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isDark ? '#736b5d' : '#94a3b8'} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#14120f' : '#ffffff',
                      borderColor: isDark ? '#2e2820' : '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: isDark ? '#f4ede1' : '#0f172a',
                      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(val: any) => [`$${val}M USD`, 'Quarterly Flow']}
                  />
                  <Bar dataKey="volumeM" fill={isDark ? '#dfd5bf' : '#f59e0b'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Configurable Detection Thresholds */}
          <div className="p-3.5 rounded-xl glass-panel space-y-2.5 border border-slate-200 dark:border-[#2f2a23] shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 dark:text-[#dfd5bf]" />
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-[#f4ede1] uppercase">
                  Detection Filters
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <label className="block text-slate-500 dark:text-[#8f8270] text-[10px] uppercase mb-1">
                  High Amount Floor:
                </label>
                <select
                  value={highVolumeThreshold}
                  onChange={(e) => setHighVolumeThreshold(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
                >
                  <option value="1000000">&gt; $1,000,000 USD</option>
                  <option value="2500000">&gt; $2,500,000 USD</option>
                  <option value="5000000">&gt; $5,000,000 USD (Default)</option>
                  <option value="10000000">&gt; $10,000,000 USD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-[#8f8270] text-[10px] uppercase mb-1">
                  Smurfing Ceiling (&lt; CTR):
                </label>
                <select
                  value={smurfingCeiling}
                  onChange={(e) => setSmurfingCeiling(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
                >
                  <option value="5000">&lt; $5,000 USD</option>
                  <option value="10000">&lt; $10,000 USD (Statutory CTR)</option>
                  <option value="15000">&lt; $15,000 USD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-[#8f8270] text-[10px] uppercase mb-1">
                  Date Range:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded px-2 py-1 text-[11px] text-slate-900 dark:text-[#f4ede1]"
                  />
                  <span className="text-slate-400 text-[10px]">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-1/2 bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded px-2 py-1 text-[11px] text-slate-900 dark:text-[#f4ede1]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Filter and Search Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#12100e] p-4 rounded-xl border border-slate-200 dark:border-[#2f2a23] shadow-sm backdrop-blur-md">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#8f8270] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by source/target name, account ID, or transaction code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] placeholder-slate-400 dark:placeholder-[#8f8270] focus:outline-none focus:border-amber-400 dark:focus:border-[#dfd5bf] font-mono"
              />
            </div>

            {/* Anomaly Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Triage:</span>
              <select
                value={flagFilter}
                onChange={(e) => setFlagFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-amber-400 dark:focus:border-[#dfd5bf]"
              >
                <option value="all">All Transactions ({transactions.length})</option>
                <option value="flagged">Flagged Anomalies Only</option>
                <option value="normal">Normal Transfers Only</option>
              </select>
            </div>

            {/* Min Amount Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Min Amount:</span>
              <select
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-amber-400 dark:focus:border-[#dfd5bf]"
              >
                <option value="0">Any Amount</option>
                <option value="1000000">&gt; $1,000,000 USD</option>
                <option value="5000000">&gt; $5,000,000 USD</option>
                <option value="10000000">&gt; $10,000,000 USD</option>
              </select>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="rounded-xl glass-panel overflow-hidden border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2f2a23] bg-slate-50/50 dark:bg-[#12100e] text-slate-500 dark:text-[#8f8270] font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Tx Reference</th>
                    <th className="py-3 px-4">Source Entity</th>
                    <th className="py-3 px-4">Destination Entity</th>
                    <th className="py-3 px-4">Amount (USD)</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Triage Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#221d17]">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-[#161411] transition-colors group cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-[#dfd5bf]">
                        {tx.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-[#f4ede1]">{tx.sourceName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-[#8f8270] font-mono">{tx.sourceId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-[#f4ede1]">{tx.targetName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-[#8f8270] font-mono">{tx.targetId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-[#d4af37]">
                        ${tx.amountUSD.toLocaleString()} USD
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-[#8f8270] font-mono">{tx.date || '2024-03-15'}</td>
                      <td className="py-3 px-4">
                        {tx.isFlagged ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-[#251e16] border border-amber-300 dark:border-[#42392e] text-amber-800 dark:text-[#d4af37]">
                              <AlertTriangle className="w-3 h-3" /> Flagged
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExplainFlagTx(tx);
                              }}
                              className="text-[10px] font-mono text-cyan-600 dark:text-cyan-bright hover:underline font-semibold"
                            >
                              Why?
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/30 text-emerald-800 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> Verified Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToGraph(tx.sourceId);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-[#1a1714] hover:bg-slate-200 dark:hover:bg-[#25201a] border border-slate-300 dark:border-[#383127] text-[10px] font-mono text-slate-700 dark:text-[#dfd5bf] transition"
                        >
                          Graph
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Transaction Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-amber-500 dark:text-[#d4af37]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Transaction Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">{selectedTx.id}</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                <span className="text-slate-500">Transferred Sum:</span>
                <span className="font-bold text-amber-600 dark:text-[#d4af37] text-sm">
                  ${selectedTx.amountUSD.toLocaleString()} USD
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                  <span className="text-[10px] text-slate-500 block">Origin Entity:</span>
                  <span className="font-bold text-slate-800 dark:text-[#f4ede1]">{selectedTx.sourceName}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{selectedTx.sourceId}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                  <span className="text-[10px] text-slate-500 block">Destination:</span>
                  <span className="font-bold text-slate-800 dark:text-[#f4ede1]">{selectedTx.targetName}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{selectedTx.targetId}</span>
                </div>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                <span className="text-slate-500">Intelligence Provenance:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-bright">
                  {selectedTx.provenance ? selectedTx.provenance.collectorAgency : 'FIU SWIFT Intercept'}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-700 dark:text-[#cfc1ab] bg-slate-50 dark:bg-[#100f0d] p-3 rounded-lg border border-slate-200 dark:border-[#25201a]">
              <strong className="text-slate-900 dark:text-[#f4ede1]">Investigative Notes:</strong> {selectedTx.description}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1f1b16] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#383127] hover:text-slate-900 dark:hover:text-white text-xs font-mono font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTx(null);
                  onNavigateToGraph(selectedTx.sourceId);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-sm"
              >
                Trace Flow in Graph
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Why Was This Flagged?" Modal */}
      {explainFlagTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-[#d4af37]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Why Was This Flagged?
                </h3>
              </div>
              <button
                onClick={() => setExplainFlagTx(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-[#1c1813] border border-amber-200 dark:border-[#42392e] space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-[#dfd5bf] font-bold block">
                Flag Reason:
              </span>
              <p className="text-xs text-slate-800 dark:text-[#f4ede1] leading-relaxed">
                {explainFlagTx.amountUSD >= highVolumeThreshold
                  ? `Transfer of $${explainFlagTx.amountUSD.toLocaleString()} USD exceeds the high-value threshold of $${highVolumeThreshold.toLocaleString()} USD.`
                  : explainFlagTx.amountUSD >= smurfingCeiling * 0.9 && explainFlagTx.amountUSD < smurfingCeiling
                  ? `Transfer of $${explainFlagTx.amountUSD.toLocaleString()} USD is structured just below the statutory reporting ceiling of $${smurfingCeiling.toLocaleString()} USD.`
                  : `Flagged based on intelligence source: ${explainFlagTx.flagReason}.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
              <div>
                <span className="text-slate-500 text-[10px] block">Transfer Amount:</span>
                <span className="text-amber-600 dark:text-[#d4af37] font-bold text-sm">
                  ${explainFlagTx.amountUSD.toLocaleString()} USD
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Threshold:</span>
                <span className="text-slate-700 dark:text-[#dfd5bf] font-bold text-sm">
                  &gt; ${highVolumeThreshold.toLocaleString()} USD
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[10px] block">Route:</span>
                <span className="text-slate-800 dark:text-[#f4ede1]">
                  {explainFlagTx.sourceName} ➔ {explainFlagTx.targetName}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-100 dark:bg-[#15120e] border border-slate-200 dark:border-[#2d2822] text-[11px] text-slate-600 dark:text-[#b8ad99]">
              <strong>Guidance:</strong> Verify bank statements and transaction invoices before escalating.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setExplainFlagTx(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1f1b16] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#383127] text-xs font-mono font-semibold"
              >
                Close Explanation
              </button>
              <button
                onClick={() => {
                  const src = explainFlagTx.sourceId;
                  setExplainFlagTx(null);
                  onNavigateToGraph(src);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-sm"
              >
                Inspect in Graph
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
