'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  Eye,
  Info,
  Scale,
  Sparkles,
  X,
  FileText,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { Entity, Relationship } from '@/types/intelligence';

interface AlertsFindingsProps {
  entities: Entity[];
  relationships: Relationship[];
  onSelectEntity: (id: string) => void;
  onNavigateToGraph: (id: string) => void;
}

export type AlertReviewStatus = 'unreviewed' | 'investigating' | 'verified' | 'dismissed';

interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'financial_velocity' | 'crypto_peeling' | 'comms_burst' | 'broker_vulnerability' | 'sanctions_match';
  targetEntityId: string;
  targetEntityName: string;
  detectedAt: string;
  status: AlertReviewStatus;
  ruleTriggered: string;
  evidenceRef: string;
  admiraltyCode: string;
  explanation: string;
  dataLimitations: string;
  recommendation: string;
}

export const AlertsFindings: React.FC<AlertsFindingsProps> = ({
  entities,
  relationships,
  onSelectEntity,
  onNavigateToGraph,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-901',
      title: 'High-Velocity Smurfing Wires Below $10k Reporting Threshold',
      severity: 'critical',
      category: 'financial_velocity',
      targetEntityId: 'ENT-003',
      targetEntityName: 'Aethelgard Holdings Ltd',
      detectedAt: '2026-10-15 08:30:12 UTC',
      status: 'unreviewed',
      ruleTriggered: 'Structuring: 14 transactions under $10,000 threshold within 48 hours (CTR evasion)',
      evidenceRef: 'SWIFT wire audit SWIFT-2026-CY-9921 / Subpoena #SUB-2024-0012',
      admiraltyCode: 'A1 (Completely Reliable / Confirmed Truth)',
      explanation: 'Account initiated 14 consecutive wire transfers calibrated precisely between $9,800 and $9,950 to pass under statutory FinCEN Currency Transaction Report (CTR) ceilings.',
      dataLimitations: 'Based exclusively on subpoenaed correspondent wire records; does not account for physical cash couriers or hawala settlements.',
      recommendation: 'Issue provisional asset freeze application with Cyprus MOKAS and serve MLAT discovery warrant to clearing agent.',
    },
    {
      id: 'ALT-902',
      title: 'Darknet Crypto Mixer Peeling Chain Activated',
      severity: 'high',
      category: 'crypto_peeling',
      targetEntityId: 'ENT-008',
      targetEntityName: '0x9b2f...81e2 (Mixer Deposit Conduit)',
      detectedAt: '2026-10-14 21:15:44 UTC',
      status: 'investigating',
      ruleTriggered: 'Peeling Chain: Rapid multi-hop output dispersion to >15 unhosted addresses within 10 blocks',
      evidenceRef: 'Blockchain ledger transaction hash 0x7b2a991b8201... / TRM Labs cluster tag',
      admiraltyCode: 'A2 (Reliable Source / Probably True)',
      explanation: 'Observed automated splitting of 45 BTC and 120 ETH into micro-outputs designed to defeat conventional wallet clustering heuristics following ransomware payoff.',
      dataLimitations: 'On-chain addresses reflect public ledger state; true off-chain beneficial owners require subpoenaed exchange KYC or private key seizure.',
      recommendation: 'Coordinate with exchange compliance teams for wallet address blacklisting under OFAC cyber sanctions.',
    },
    {
      id: 'ALT-903',
      title: 'Supreme Structural Bridge Node Connecting Logistics & Offshore Banking',
      severity: 'high',
      category: 'broker_vulnerability',
      targetEntityId: 'ENT-004',
      targetEntityName: 'Phoenix Maritime Logistics SA',
      detectedAt: '2026-10-13 14:02:19 UTC',
      status: 'verified',
      ruleTriggered: 'Betweenness Centrality Bottleneck: Score >= 0.80 bridging 3 disconnected sub-graphs',
      evidenceRef: 'Brandes Network Centrality Algorithm (Score: 0.82) / Rotterdam Customs Manifest',
      admiraltyCode: 'A1 (Completely Reliable / Confirmed Truth)',
      explanation: 'Identified as the single physical mediation node bridging European container port operations with Caribbean shell banking conduits. Removing this node causes maximum network disruption.',
      dataLimitations: 'Graph metrics reflect observed records in loaded intelligence dataset; unmapped corporate entities could provide alternate covert routes.',
      recommendation: 'Target for multi-agency port inspection, cargo hold scanning, and digital forensics triage.',
    },
    {
      id: 'ALT-904',
      title: 'Encrypted Telecommunication Surge Pre-Port Arrival',
      severity: 'medium',
      category: 'comms_burst',
      targetEntityId: 'ENT-010',
      targetEntityName: 'Burner IMEI-8692019482019 (EncroChat Node)',
      detectedAt: '2026-10-12 17:45:00 UTC',
      status: 'investigating',
      ruleTriggered: 'Burst Velocity: Communication frequency spike >300% during 6-hour docking window',
      evidenceRef: 'Dutch National Police Wiretap INT-2026-088 / French Gendarmerie decrypt logs',
      admiraltyCode: 'A1 (Completely Reliable / Confirmed Truth)',
      explanation: '38 voice calls and encrypted burst data packets exchanged with Rotterdam terminal logistics coordinates exactly as MV Poseidon Sea entered port waters.',
      dataLimitations: 'Radio telemetry and cell tower triangulation; partial content encrypted with proprietary end-to-end cypher.',
      recommendation: 'Deploy physical tactical surveillance on Rotterdam Berth 42 and correlate terminal access badge swipes.',
    },
    {
      id: 'ALT-905',
      title: 'Circular Round-Tripping Flow Identified',
      severity: 'medium',
      category: 'financial_velocity',
      targetEntityId: 'ENT-001',
      targetEntityName: 'Anton "The Bishop" Vance',
      detectedAt: '2026-10-11 11:20:30 UTC',
      status: 'unreviewed',
      ruleTriggered: 'Round-Tripping: Funds cycle back to originator disguised as foreign direct investment or loan',
      evidenceRef: 'Swiss Federal Banking Commission Audit SBC-2026-90 / FinCEN SAR #88192-A',
      admiraltyCode: 'B1 (Fairly Reliable / Confirmed Truth)',
      explanation: 'Closed loop cycle: $4.2M departed Cyprus shell account and returned to Swiss trust vault disguised as an international commercial loan facility.',
      dataLimitations: 'Foreign trust disclosures are subject to Swiss bank confidentiality laws; full beneficial transparency pending MLAT approval.',
      recommendation: 'Request Mutual Legal Assistance Treaty (MLAT) disclosure from Swiss Federal Department of Justice.',
    },
  ]);

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [explainingRiskEntity, setExplainingRiskEntity] = useState<Entity | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const mediumCount = alerts.filter((a) => a.severity === 'medium').length;
  const verifiedCount = alerts.filter((a) => a.status === 'verified').length;

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        a.title.toLowerCase().includes(q) ||
        a.targetEntityName.toLowerCase().includes(q) ||
        a.targetEntityId.toLowerCase().includes(q) ||
        a.ruleTriggered.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  const handleUpdateStatus = (alertId: string, newStatus: AlertReviewStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-600 dark:text-[#dfd5bf] uppercase tracking-wider font-semibold">
            <AlertOctagon className="w-4 h-4 text-amber-500 dark:text-[#d4af37]" /> Automated Pattern Alerts
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">
            Intelligence Alerts &amp; Findings
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1">
            Suspicious activity flags detected across financial transfers, communication bursts, and network links.
          </p>
        </div>

        {/* Severity Metrics Strip */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-[#201413] border border-rose-200 dark:border-[#c27d78]/30 text-rose-700 dark:text-[#c27d78] font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{criticalCount} Critical</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-[#1f1b16] border border-amber-200 dark:border-[#d4af37]/30 text-amber-700 dark:text-[#d4af37] font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{highCount} High</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-[#161412] border border-sky-200 dark:border-[#dfd5bf]/30 text-sky-700 dark:text-[#dfd5bf] font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>{mediumCount} Medium</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-[#131a15] border border-emerald-200 dark:border-[#7a9a83]/30 text-emerald-700 dark:text-[#7a9a83] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{verifiedCount} Verified</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#12100e] p-3.5 rounded-xl border border-slate-200 dark:border-[#2f2a23] shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by title, entity ID, or rule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-amber-400 dark:focus:border-[#dfd5bf]"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-[#8f8270]">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
          </select>
        </div>

        {/* Review Status Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-[#8f8270]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="unreviewed">Unreviewed Only</option>
            <option value="investigating">Investigating Only</option>
            <option value="verified">Verified Only</option>
            <option value="dismissed">Dismissed Only</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => {
          const targetEntity = entities.find((e) => e.id === alert.targetEntityId);
          const isExpanded = !!expandedAlerts[alert.id];

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border glass-panel space-y-3 transition duration-150 shadow-xs ${
                alert.severity === 'critical'
                  ? 'border-rose-200 dark:border-[#c27d78]/40 bg-rose-50/15 dark:bg-[#201413]/25'
                  : alert.severity === 'high'
                  ? 'border-amber-200 dark:border-[#d4af37]/40 bg-amber-50/15 dark:bg-[#1f1a14]/25'
                  : 'border-slate-200 dark:border-[#2f2a23]'
              }`}
            >
              {/* Alert Header Row: Compact & Scannable */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-slate-500 dark:text-[#8f8270] font-bold">{alert.id}</span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 dark:bg-[#201413] text-rose-700 dark:text-[#c27d78] border border-rose-300 dark:border-[#c27d78]/30'
                        : alert.severity === 'high'
                        ? 'bg-amber-100 dark:bg-[#1f1b16] text-amber-700 dark:text-[#d4af37] border border-amber-300 dark:border-[#d4af37]/30'
                        : 'bg-sky-100 dark:bg-[#161412] text-sky-700 dark:text-[#dfd5bf] border border-sky-300 dark:border-[#dfd5bf]/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161412] text-slate-700 dark:text-[#d4c5a9] capitalize font-medium border border-slate-200 dark:border-[#2f2a23]">
                    {alert.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alert.detectedAt.split(' ')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-slate-400 text-[11px]">Target:</span>
                  <button
                    onClick={() => onSelectEntity(alert.targetEntityId)}
                    className="font-bold text-sky-700 dark:text-[#dfd5bf] hover:underline flex items-center gap-1 text-xs"
                  >
                    {alert.targetEntityName}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  {targetEntity && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] border border-slate-200 dark:border-[#383127]">
                      Risk {targetEntity.metrics.riskScore}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Explanation */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f4ede1]">{alert.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1 leading-relaxed">
                  {alert.explanation}
                </p>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2 animate-in fade-in duration-150 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                      <span className="text-[10px] uppercase text-slate-400 dark:text-[#8f8270] font-semibold block mb-0.5">
                        Evidence Reference:
                      </span>
                      <p className="text-slate-700 dark:text-[#dfd5bf] font-mono text-[11px]">
                        {alert.evidenceRef}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                      <span className="text-[10px] uppercase text-slate-400 dark:text-[#8f8270] font-semibold block mb-0.5">
                        Suggested Action:
                      </span>
                      <p className="text-slate-700 dark:text-[#dfd5bf] text-xs">
                        {alert.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar & Review Status Selector */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60">
                {/* 4-State Review Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-500 dark:text-[#8f8270] mr-1 text-[11px]">Review:</span>
                  {(['unreviewed', 'investigating', 'verified', 'dismissed'] as AlertReviewStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(alert.id, st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold capitalize transition ${
                        alert.status === st
                          ? st === 'verified'
                            ? 'bg-emerald-600 text-white dark:bg-[#dfd5bf] dark:text-[#080706]'
                            : st === 'investigating'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : st === 'dismissed'
                            ? 'bg-slate-300 dark:bg-[#383127] text-slate-800 dark:text-slate-300'
                            : 'bg-slate-900 text-white dark:bg-[#1e1a14] dark:text-[#dfd5bf] border dark:border-[#383127]'
                          : 'bg-slate-100 dark:bg-[#14120f] text-slate-600 dark:text-[#8f8270] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(alert.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1a1714] hover:bg-slate-200 dark:hover:bg-[#25201a] text-slate-700 dark:text-[#dfd5bf] border border-slate-300 dark:border-[#383127] text-xs font-mono flex items-center gap-1 transition font-semibold"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Details & Evidence'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => onNavigateToGraph(alert.targetEntityId)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono flex items-center gap-1 transition shadow-xs"
                  >
                    Locate <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Score Explainer Modal */}
      {explainingRiskEntity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 dark:text-[#d4af37]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Risk Score Breakdown: {explainingRiskEntity.name}
                </h3>
              </div>
              <button
                onClick={() => setExplainingRiskEntity(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score Badge */}
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-[#201010] border border-red-200 dark:border-[#4d2424] flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] uppercase text-red-700 dark:text-red-400 block font-bold">Composite Forensic Risk</span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">{explainingRiskEntity.metrics.riskScore} / 100</span>
              </div>
              <span className="px-2 py-1 rounded bg-red-200/50 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold uppercase">
                {explainingRiskEntity.riskLevel}
              </span>
            </div>

            {/* Contributing Factors with Weights */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-[#8f8270] font-bold block">
                Algorithmic Risk Contributing Factors:
              </span>
              <div className="space-y-2 font-mono text-xs">
                {explainingRiskEntity.metrics.explainableRiskFactors?.map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                    <div className="flex justify-between text-slate-800 dark:text-[#dfd5bf] font-bold">
                      <span>{factor.factor}</span>
                      <span className="text-red-500">+{factor.weight}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8f8270] mt-0.5 leading-relaxed">
                      {factor.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setExplainingRiskEntity(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-[#dfd5bf] text-white dark:text-[#080706] font-bold text-xs font-mono shadow-xs"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
