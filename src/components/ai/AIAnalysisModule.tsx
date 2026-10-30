'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  Network,
  Users2,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Search,
  ExternalLink,
  ChevronRight,
  Clock,
  HelpCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Entity, Relationship } from '@/types/intelligence';
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  detectCommunities,
  findConnectedComponents,
  computeNetworkMetrics,
  calculatePageRank,
  predictCandidateLinks,
} from '@/lib/graphAnalytics';

interface AIAnalysisModuleProps {
  entities: Entity[];
  relationships: Relationship[];
  onSelectEntity: (id: string) => void;
  onNavigateToGraph: (entityId?: string) => void;
}

export const AIAnalysisModule: React.FC<AIAnalysisModuleProps> = ({
  entities,
  relationships,
  onSelectEntity,
  onNavigateToGraph,
}) => {
  const [activeTab, setActiveTab] = useState<'centrality' | 'communities' | 'anomalies' | 'link_prediction' | 'insights'>('insights');
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const toggleInsight = (id: string) => {
    setExpandedInsights((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute graph analytics metrics
  const degreeMap = calculateDegreeCentrality(entities, relationships);
  const betweennessMap = calculateBetweennessCentrality(entities, relationships);
  const pageRankMap = calculatePageRank(entities, relationships);
  const communityMap = detectCommunities(entities, relationships);
  const networkMetrics = computeNetworkMetrics(entities, relationships);
  const candidateLinks = predictCandidateLinks(entities, relationships);

  // Group entities by community
  const communityGroups: Record<number, Entity[]> = {};
  entities.forEach((e) => {
    const cId = communityMap.get(e.id) || e.metrics.clusterId || 1;
    if (!communityGroups[cId]) communityGroups[cId] = [];
    communityGroups[cId].push(e);
  });

  // Top Betweenness Nodes (Brokers / Gatekeepers)
  const sortedBetweenness = [...entities].sort((a, b) => {
    const bB = betweennessMap.get(b.id) || b.metrics.betweennessCentrality;
    const aB = betweennessMap.get(a.id) || a.metrics.betweennessCentrality;
    return bB - aB;
  });

  // Top Degree Nodes (Hubs)
  const sortedDegree = [...entities].sort((a, b) => {
    const bD = degreeMap.get(b.id)?.totalDegree || b.metrics.degreeCentrality;
    const aD = degreeMap.get(a.id)?.totalDegree || a.metrics.degreeCentrality;
    return bD - aD;
  });

  // Top PageRank Nodes (Structural Influence)
  const sortedPageRank = [...entities].sort((a, b) => {
    const bP = pageRankMap.get(b.id) || 0;
    const aP = pageRankMap.get(a.id) || 0;
    return bP - aP;
  });

  // High-Confidence Explainable AI Insights Dataset
  const AI_INSIGHTS = [
    {
      id: 'AI-INSIGHT-01',
      title: 'Hidden Broker Between Maritime Smuggling & Cyprus Shells',
      category: 'Centrality & Topology',
      confidenceScore: 0.92,
      riskLevel: 'critical',
      summary: 'Entity ENT-005 (Helena Vance) exhibits high betweenness centrality (0.482) despite low media profile, bridging the Greek maritime conduit directly into Cyprus nominee accounts.',
      supportingEntities: ['ENT-005', 'ENT-004', 'ENT-003', 'ENT-001'],
      evidenceBasis: 'Wiretap INT-2026-081 + Bank Subpoena SUB-CY-8819',
      reasonForAlert: 'Classic broker topology: removing this node increases path length between syndicate leadership and money laundering infrastructure by 300%.',
      suggestedNextSteps: [
        'Issue targeted FinCEN 314(a) information request for Vance Legal Advisory accounts',
        'Verify corporate registry beneficial ownership of offshore nominee shields',
        'Place telecommunication intercept on newly detected encrypted burner line',
      ],
      disclaimer: 'Statistical graph centrality indicates potential structural brokerage. Does not constitute proof of criminal intent.',
    },
    {
      id: 'AI-INSIGHT-02',
      title: 'Structured Smurfing Pattern Below Reporting Thresholds',
      category: 'Anomaly Detection',
      confidenceScore: 0.88,
      riskLevel: 'high',
      summary: '14 consecutive wire transfers of $9,800 to $9,950 executed within 48 hours between Cyprus shell entities and Eastern European accounts, systematically evading the $10,000 CTR threshold.',
      supportingEntities: ['ENT-003', 'ENT-006', 'ENT-007'],
      evidenceBasis: 'SWIFT wire audit SWIFT-2026-CY-9921',
      reasonForAlert: 'Statistical variance test flags a 99.4% probability of deliberate structuring rather than standard commercial invoicing patterns.',
      suggestedNextSteps: [
        'File Suspicious Activity Report (SAR) with FinCEN and Europol Financial Intelligence',
        'Subpoena intermediary correspondent bank transaction logs for originator IP addresses',
      ],
      disclaimer: 'Pattern identified via threshold clustering algorithm. Requires financial forensic examination of legitimate commercial invoices.',
    },
    {
      id: 'AI-INSIGHT-03',
      title: 'Candidate Hidden Association: Peeling Chain Convergence',
      category: 'Link Prediction',
      confidenceScore: 0.81,
      riskLevel: 'high',
      summary: 'Adamic-Adar link prediction algorithm predicts an unobserved direct connection between Burner Phone ENT-010 and Luxury Yacht ENT-015 based on shared cell tower pings in Limassol Harbor.',
      supportingEntities: ['ENT-010', 'ENT-015', 'ENT-014'],
      evidenceBasis: 'Cell site location data (CSLI) dated 2026-08-14 to 2026-08-16',
      reasonForAlert: 'Entity was located within 50 meters of target vessel during bunkering operations prior to Mediterranean departure.',
      suggestedNextSteps: [
        'Request harbor master manifest logs and AIS transponder records for Port of Limassol',
        'Cross-reference CCTV footage of the marina berth during bunkering hours',
      ],
      disclaimer: 'Link prediction represents mathematical likelihood derived from spatial-temporal proximity. Human surveillance review required.',
    },
    {
      id: 'AI-INSIGHT-04',
      title: 'Circular Round-Tripping Flow Detected',
      category: 'Graph ML Pattern',
      confidenceScore: 0.86,
      riskLevel: 'medium',
      summary: 'Cyclic graph cycle detected: ENT-003 → ENT-007 → ENT-012 → ENT-003 totaling $4.2M returning to originator disguised as international loan repayment.',
      supportingEntities: ['ENT-003', 'ENT-007', 'ENT-012'],
      evidenceBasis: 'Bank Subpoena SUB-CH-2026-004 & Corporate Registry loan filings',
      reasonForAlert: 'Directed cycle in transaction graph with zero net value change, characteristic of synthetic equity justification.',
      suggestedNextSteps: [
        'Request auditor working papers for fictitious loan capitalization agreement',
        'Interview registered nominee directors regarding loan disbursement authorization',
      ],
      disclaimer: 'Round-tripping loop identified using Tarjan strongly connected components algorithm.',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-600 dark:text-[#dfd5bf] uppercase tracking-wider font-semibold">
            <BrainCircuit className="w-4 h-4 text-purple-500 dark:text-[#dfd5bf]" /> AI Insights
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">AI Insights</h2>
          <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1">
            Discover key middlemen, communication hubs, and unusual financial flows across the network.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-[#161412] p-1 rounded-lg border border-slate-200 dark:border-[#2f2a23] text-xs font-mono shadow-xs">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'insights'
                ? 'bg-white dark:bg-[#231f1a] text-indigo-700 dark:text-[#dfd5bf] border border-slate-200 dark:border-[#42392e] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#b8ad99] hover:text-slate-900 dark:hover:text-[#f4ede1]'
            }`}
          >
            AI Insights ({AI_INSIGHTS.length})
          </button>
          <button
            onClick={() => setActiveTab('centrality')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'centrality'
                ? 'bg-white dark:bg-[#231f1a] text-sky-700 dark:text-[#dfd5bf] border border-slate-200 dark:border-[#42392e] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#b8ad99] hover:text-slate-900 dark:hover:text-[#f4ede1]'
            }`}
          >
            Brokers &amp; Hubs
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'communities'
                ? 'bg-white dark:bg-[#231f1a] text-sky-700 dark:text-[#dfd5bf] border border-slate-200 dark:border-[#42392e] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#b8ad99] hover:text-slate-900 dark:hover:text-[#f4ede1]'
            }`}
          >
            Suspect Groups
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'anomalies'
                ? 'bg-white dark:bg-[#231f1a] text-rose-700 dark:text-[#c27d78] border border-slate-200 dark:border-[#42392e] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#b8ad99] hover:text-slate-900 dark:hover:text-[#f4ede1]'
            }`}
          >
            Anomalies
          </button>
          <button
            onClick={() => setActiveTab('link_prediction')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'link_prediction'
                ? 'bg-white dark:bg-[#231f1a] text-amber-700 dark:text-[#d4af37] border border-slate-200 dark:border-[#42392e] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-[#b8ad99] hover:text-slate-900 dark:hover:text-[#f4ede1]'
            }`}
          >
            Predicted Links
          </button>
        </div>
      </div>

      {/* Tab 1: AI Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_INSIGHTS.map((insight) => {
              const isExpanded = !!expandedInsights[insight.id];

              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23] hover:border-purple-500/50 dark:hover:border-[#dfd5bf]/40 transition flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-[#1f1b16] border border-purple-300 dark:border-[#42392e] text-purple-700 dark:text-[#dfd5bf] font-semibold">
                        {insight.category}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-slate-500 dark:text-[#8f8270]">Confidence:</span>
                        <span className="text-emerald-600 dark:text-[#7a9a83] font-bold">
                          {(insight.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#f4ede1]">{insight.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-[#cfc1ab] leading-relaxed">{insight.summary}</p>

                    {/* Supporting Entities */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400 dark:text-[#8f8270] uppercase mb-1">
                        Involved Targets:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {insight.supportingEntities.map((entId) => {
                          const ent = entities.find((e) => e.id === entId);
                          return (
                            <button
                              key={entId}
                              onClick={() => onSelectEntity(entId)}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] hover:border-cyan dark:hover:border-[#dfd5bf] text-[11px] font-mono text-cyan-700 dark:text-[#dfd5bf] transition flex items-center gap-1 font-semibold"
                            >
                              <span>{entId}</span>
                              {ent && <span className="text-slate-600 dark:text-[#b8ad99] text-[10px]">({ent.name})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Collapsible Evidence & Recommended Actions */}
                    {isExpanded && (
                      <div className="pt-2.5 space-y-2 animate-in fade-in duration-150">
                        <div className="p-2.5 rounded bg-slate-100/90 dark:bg-[#100f0d] border border-slate-200 dark:border-[#2d2822] text-[11px] font-mono space-y-1">
                          <div className="text-purple-700 dark:text-[#dfd5bf]">
                            <strong>Evidence:</strong> {insight.evidenceBasis}
                          </div>
                          <div className="text-slate-600 dark:text-[#8f8270]">
                            <strong>Reason:</strong> {insight.reasonForAlert}
                          </div>
                        </div>

                        {/* Suggested Next Steps */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-[#8f8270] font-semibold">
                            Next Steps:
                          </div>
                          {insight.suggestedNextSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-[#cfc1ab]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan dark:text-[#dfd5bf] shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <button
                      onClick={() => toggleInsight(insight.id)}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1a1714] hover:bg-slate-200 dark:hover:bg-[#25201a] text-slate-700 dark:text-[#dfd5bf] border border-slate-300 dark:border-[#383127] text-xs font-mono flex items-center gap-1 transition font-semibold"
                    >
                      <span>{isExpanded ? 'Hide' : 'View Evidence'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                      onClick={() => onNavigateToGraph(insight.supportingEntities[0])}
                      className="text-cyan-600 dark:text-[#dfd5bf] hover:text-cyan-500 dark:hover:text-[#f4ede1] flex items-center gap-1 font-bold text-xs"
                    >
                      View in Graph <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Centrality Analysis */}
      {activeTab === 'centrality' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Betweenness Nodes (Brokers) */}
          <div className="p-5 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                  Key Brokers &amp; Middlemen
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8f8270]">
                  Targets that bridge otherwise separate criminal groups and channels.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-[#1f1b16] border border-purple-300 dark:border-[#42392e] text-purple-700 dark:text-[#dfd5bf] font-semibold">
                BRIDGE BROKERS
              </span>
            </div>

            <div className="space-y-2">
              {sortedBetweenness.slice(0, 5).map((e) => {
                const bScore = betweennessMap.get(e.id) || e.metrics.betweennessCentrality;
                return (
                  <div
                    key={e.id}
                    onClick={() => onSelectEntity(e.id)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#110f0d] border border-slate-200 dark:border-[#2f2a23] hover:border-purple-500/50 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-100 dark:bg-[#1f1b16] border border-purple-300 dark:border-[#42392e] flex items-center justify-center font-mono font-bold text-xs text-purple-700 dark:text-[#dfd5bf]">
                        {bScore}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-[#f4ede1] group-hover:text-purple-600 dark:group-hover:text-[#dfd5bf] transition truncate max-w-[120px]">
                          {e.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#8f8270] font-mono truncate max-w-[120px]">
                          {e.id} • {e.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-[#dfd5bf] block font-semibold">
                        Deg: {degreeMap.get(e.id)?.totalDegree || e.metrics.degreeCentrality}
                      </span>
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          onNavigateToGraph(e.id);
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-cyan-600 dark:hover:text-[#dfd5bf] flex items-center gap-0.5 mt-0.5"
                      >
                        Locate <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Degree Nodes (Hubs) */}
          <div className="p-5 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                  High-Activity Hubs
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8f8270]">
                  Targets with the greatest number of direct contacts and wire transfers.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-[#1f1b16] border border-cyan-300 dark:border-[#42392e] text-cyan-700 dark:text-[#dfd5bf] font-semibold">
                CENTRAL HUBS
              </span>
            </div>

            <div className="space-y-2">
              {sortedDegree.slice(0, 5).map((e) => {
                const deg = degreeMap.get(e.id)?.totalDegree || e.metrics.degreeCentrality;
                return (
                  <div
                    key={e.id}
                    onClick={() => onSelectEntity(e.id)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#110f0d] border border-slate-200 dark:border-[#2f2a23] hover:border-cyan-500/50 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cyan-100 dark:bg-[#1f1b16] border border-cyan-300 dark:border-[#42392e] flex items-center justify-center font-mono font-bold text-xs text-cyan-700 dark:text-[#dfd5bf]">
                        {deg}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-[#f4ede1] group-hover:text-cyan-600 dark:group-hover:text-[#dfd5bf] transition truncate max-w-[120px]">
                          {e.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#8f8270] font-mono truncate max-w-[120px]">
                          {e.id} • {e.jurisdiction}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-amber-600 dark:text-[#d4af37] block font-semibold">
                        Risk: {e.metrics.riskScore}
                      </span>
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          onNavigateToGraph(e.id);
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-cyan-600 dark:hover:text-[#dfd5bf] flex items-center gap-0.5 mt-0.5"
                      >
                        Locate <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top PageRank Nodes (Structural Influence) */}
          <div className="p-5 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                  Network Influence
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8f8270]">
                  Key decision-makers linked to other influential targets in the network.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-[#1f1b16] border border-amber-300 dark:border-[#42392e] text-amber-700 dark:text-[#d4af37] font-semibold">
                TOP INFLUENCE
              </span>
            </div>

            <div className="space-y-2">
              {sortedPageRank.slice(0, 5).map((e) => {
                const pr = pageRankMap.get(e.id) || 0;
                return (
                  <div
                    key={e.id}
                    onClick={() => onSelectEntity(e.id)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#110f0d] border border-slate-200 dark:border-[#2f2a23] hover:border-amber-500/50 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-amber-100 dark:bg-[#1f1b16] border border-amber-300 dark:border-[#42392e] flex items-center justify-center font-mono font-bold text-xs text-amber-700 dark:text-[#d4af37]">
                        {pr}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-[#f4ede1] group-hover:text-amber-600 dark:group-hover:text-[#dfd5bf] transition truncate max-w-[120px]">
                          {e.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#8f8270] font-mono truncate max-w-[120px]">
                          {e.id} • {e.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-[#dfd5bf] block font-semibold">
                        Rank: {pr}
                      </span>
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          onNavigateToGraph(e.id);
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-cyan-600 dark:hover:text-[#dfd5bf] flex items-center gap-0.5 mt-0.5"
                      >
                        Locate <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Communities */}
      {activeTab === 'communities' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-panel space-y-1 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
              Network Communities via Label Propagation (LPA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8f8270]">
              Identifies functional modular criminal cells based on density of communication and transaction links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(communityGroups).map(([clusterId, members]) => {
              const clusterLabel =
                clusterId === '1'
                  ? 'Cyprus Shell & Banking Syndicate'
                  : clusterId === '2'
                  ? 'Eastern European Cyber & Crypto Layer'
                  : 'Maritime Smuggling & Port Logistics';

              return (
                <div key={clusterId} className="p-4 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#dfd5bf]">
                      Cell Cluster #{clusterId}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1f1b16] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#42392e] font-semibold">
                      {members.length} Entities
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 dark:text-[#f4ede1]">{clusterLabel}</div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onSelectEntity(m.id)}
                        className="p-2 rounded bg-slate-50 dark:bg-[#110f0d] border border-slate-200 dark:border-[#25201a] hover:border-cyan dark:hover:border-[#dfd5bf] text-xs cursor-pointer transition flex items-center justify-between"
                      >
                        <span className="text-slate-800 dark:text-[#d4c5a9] truncate max-w-[150px]">{m.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-[#8f8270]">{m.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Anomalies */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-panel space-y-2 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-[#d4af37]" /> Statistical Anomaly Detection
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8f8270]">
              Highlights transaction spikes, structured smurfing batches, and unusual communication bursts deviating beyond 2.5 standard deviations from baseline.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] border-l-4 border-l-amber-500 dark:border-l-[#d4af37] space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-[#f4ede1]">Smurfing Cluster (Structuring Alert)</span>
                <span className="text-amber-600 dark:text-[#d4af37] font-mono text-[11px] font-bold">Z-Score: +3.82</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-[#cfc1ab]">
                14 outgoing wires originating from Aethelgard Holdings Ltd between October 10 and October 12, each bounded between $9,800 and $9,950.
              </p>
              <div className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">
                Target Accounts: ENT-006 (Cyprus Commercial Bank) → ENT-007 (Zurich Private Bank)
              </div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] border-l-4 border-l-red-500 dark:border-l-[#c27d78] space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-[#f4ede1]">Burst Communication Ahead of Contraband Port Call</span>
                <span className="text-red-600 dark:text-[#c27d78] font-mono text-[11px] font-bold">Z-Score: +4.10</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-[#cfc1ab]">
                Encrypted burner phone ENT-010 engaged in 38 voice calls with Dutch warehouse manager ENT-013 within 6 hours of M/V Poseidon Horizon docking in Rotterdam.
              </p>
              <div className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">
                Evidence: Intercept log INT-2026-088 (Dutch National Police Wiretap)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Link Prediction */}
      {activeTab === 'link_prediction' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-panel space-y-1 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                Topological Link Prediction (Triadic Closure &amp; Jaccard Similarity)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-[#201810] border border-amber-300 dark:border-[#594228] text-amber-800 dark:text-[#dfd5bf] font-bold">
                PREDICTED — NOT OBSERVED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8f8270]">
              Evaluates common neighborhood structure to predict unobserved associations between non-adjacent nodes. Strictly labeled as hypothetical intelligence candidate leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidateLinks.map((link, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl glass-panel space-y-3 border-2 border-dashed border-amber-300 dark:border-[#dfd5bf]/40 shadow-sm relative overflow-hidden"
              >
                {/* Prominent Badge Required by Prompt */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 dark:bg-[#dfd5bf]/10 border border-amber-500/30 dark:border-[#dfd5bf]/30 text-amber-700 dark:text-[#dfd5bf] font-bold tracking-wider uppercase">
                    PREDICTED — NOT OBSERVED
                  </span>
                  <span className="text-emerald-600 dark:text-[#7a9a83] font-mono font-bold text-xs">
                    Confidence: {link.confidencePercent}%
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-[#f4ede1]">
                  Hypothesis #{idx + 1}: {link.sourceName} ⟷ {link.targetName}
                </div>

                <p className="text-xs text-slate-700 dark:text-[#cfc1ab] leading-relaxed">
                  {link.rationale}
                </p>

                {/* Evidence & Technical Details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                  <div>
                    <span className="text-slate-500 block">Calculation Method:</span>
                    <span className="text-slate-700 dark:text-[#dfd5bf] font-semibold">{link.method}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mutual Connections:</span>
                    <span className="text-slate-700 dark:text-[#dfd5bf] font-semibold">{link.mutualCount} Common Nodes</span>
                  </div>
                </div>

                {/* Recommended Next Step for Human Review */}
                <div className="text-[11px] bg-slate-100 dark:bg-[#15120e] p-2.5 rounded border border-slate-200 dark:border-[#2d2822]">
                  <strong className="text-slate-800 dark:text-[#dfd5bf] block text-[10px] uppercase font-mono mb-0.5">
                    Recommended Human Review Step:
                  </strong>
                  <span className="text-slate-600 dark:text-[#b8ad99]">
                    Cross-reference telecommunications intercepts with corporate registry filings of shared intermediary conduits before initiating surveillance.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-[#8f8270] flex justify-between items-center">
                  <span>Jaccard Index: {link.jaccardScore}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigateToGraph(link.sourceId)}
                      className="text-cyan-600 dark:text-[#dfd5bf] hover:underline font-semibold"
                    >
                      Locate {link.sourceId} →
                    </button>
                    <button
                      onClick={() => onNavigateToGraph(link.targetId)}
                      className="text-cyan-600 dark:text-[#dfd5bf] hover:underline font-semibold"
                    >
                      Locate {link.targetId} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
