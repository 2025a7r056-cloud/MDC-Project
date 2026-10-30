'use client';

import React, { useState } from 'react';
import {
  Users,
  Share2,
  Briefcase,
  AlertTriangle,
  Activity,
  ShieldAlert,
  TrendingUp,
  BrainCircuit,
  FileUp,
  ArrowRight,
  Play,
  Award,
  HelpCircle,
  X,
  Sparkles,
  ExternalLink,
  CircleDollarSign,
  Bot,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Entity, Relationship, Case, TimelineEvent } from '@/types/intelligence';
import { useTheme } from '@/lib/themeContext';

interface OverviewDashboardProps {
  entities: Entity[];
  relationships: Relationship[];
  cases: Case[];
  timelineEvents: TimelineEvent[];
  onNavigate: (tab: string) => void;
  onSelectEntity: (id: string) => void;
  onSelectCase: (id: string) => void;
  onOpenAssistant?: () => void;
  onStartDemo?: () => void;
  onStartPresentationMode?: () => void;
  onLaunchTutorial?: () => void;
}

interface KpiDetail {
  id: string;
  name: string;
  value: string | number;
  badge: string;
  measures: string;
  formula: string;
  calculation: string;
  investigativeImportance: string;
  targetTab: string;
  targetTabLabel: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  entities,
  relationships,
  cases,
  timelineEvents,
  onNavigate,
  onSelectEntity,
  onSelectCase,
  onOpenAssistant,
  onStartDemo,
  onStartPresentationMode,
  onLaunchTutorial,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [inspectedKpi, setInspectedKpi] = useState<KpiDetail | null>(null);

  // Compute Key Metrics
  const totalEntities = entities.length;
  const totalRelationships = relationships.length;
  const activeCases = cases.filter((c) => c.status === 'active_investigation' || c.status === 'open');
  const flaggedTransactions = relationships.filter(
    (r) => r.type === 'financial_flow' && (r.amountUSD || 0) > 1000000
  );
  const highRiskEntities = entities.filter(
    (e) => e.riskLevel === 'critical' || e.riskLevel === 'high'
  );
  const networkDensity =
    totalEntities > 1
      ? ((2 * totalRelationships) / (totalEntities * (totalEntities - 1))).toFixed(3)
      : '0.000';

  // Entity Type Distribution Data for Chart
  const typeCounts: Record<string, number> = {};
  entities.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });
  const entityTypeData = Object.entries(typeCounts).map(([type, count]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    value: count,
  }));

  // Synthetic Network Activity Over Time Data
  const activityData = [
    { month: 'May', transactions: 12, intercepts: 8, entitiesDetected: 4 },
    { month: 'Jun', transactions: 18, intercepts: 14, entitiesDetected: 6 },
    { month: 'Jul', transactions: 24, intercepts: 21, entitiesDetected: 7 },
    { month: 'Aug', transactions: 31, intercepts: 29, entitiesDetected: 11 },
    { month: 'Sep', transactions: 45, intercepts: 38, entitiesDetected: 15 },
    { month: 'Oct', transactions: 62, intercepts: 54, entitiesDetected: 18 },
  ];

  const TYPE_COLORS: Record<string, string> = {
    PERSON: isDark ? '#dfd5bf' : '#0284c7',
    CORPORATION: isDark ? '#c5b497' : '#4f46e5',
    CRYPTO_WALLET: isDark ? '#d4af37' : '#d97706',
    BURNER_PHONE: isDark ? '#c27d78' : '#e11d48',
    BANK_ACCOUNT: isDark ? '#7a9a83' : '#059669',
    LOCATION: isDark ? '#9e8e78' : '#7c3aed',
    VESSEL: isDark ? '#8a9ea7' : '#0d9488',
  };

  const chartTooltipStyle = {
    backgroundColor: isDark ? '#14120f' : '#ffffff',
    borderColor: isDark ? '#2e2820' : '#e2e8f0',
    borderRadius: '8px',
    fontSize: '11px',
    color: isDark ? '#f4ede1' : '#0f172a',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.08)',
  };

  const axisStroke = isDark ? '#736b5d' : '#94a3b8';

  // Plain-English analytical explanations for each KPI metric
  const kpiDetails: Record<string, KpiDetail> = {
    entities: {
      id: 'entities',
      name: 'Targets & Entities',
      value: totalEntities,
      badge: '18 Active Targets',
      measures: 'People, shell companies, crypto wallets, burner phones, bank accounts, and vessels tracked in this case.',
      formula: 'Count of all active targets',
      calculation: '18 active entities across 7 intelligence categories.',
      investigativeImportance: 'Represents every person of interest, offshore company, and digital endpoint under active review.',
      targetTab: 'entities',
      targetTabLabel: 'View in Entity Explorer',
    },
    relationships: {
      id: 'relationships',
      name: 'Network Connections',
      value: totalRelationships,
      badge: '26 Verified Links',
      measures: 'Direct links between entities: wire transfers, corporate ownership, burner calls, and cargo movements.',
      formula: 'Count of verified links',
      calculation: '26 connections linking 18 entities, totaling over $42.5M in tracked capital.',
      investigativeImportance: 'Reveals hidden relationships between seemingly legitimate businesses and criminal syndicates.',
      targetTab: 'network',
      targetTabLabel: 'Explore in Network Graph',
    },
    cases: {
      id: 'cases',
      name: 'Active Cases',
      value: activeCases.length,
      badge: '3 Ongoing Cases',
      measures: 'Multi-agency operational taskforce files currently open and coordinating intelligence.',
      formula: 'Count of open and active cases',
      calculation: '3 active cases: Operation Blackthorn, Hydra-Vanguard, and Blue Leviathan.',
      investigativeImportance: 'Organizes evidence, suspects, and warrants for courtroom indictment readiness.',
      targetTab: 'cases',
      targetTabLabel: 'Manage Investigation Cases',
    },
    transactions: {
      id: 'transactions',
      name: 'Flagged Money Flows',
      value: flaggedTransactions.length,
      badge: '5 High-Value Transfers',
      measures: 'Large financial transfers exceeding $1,000,000 USD or exhibiting suspicious smurfing patterns.',
      formula: 'Transfers > $1,000,000 USD',
      calculation: '5 flagged transactions totaling $19.5M USD across 5 primary accounts.',
      investigativeImportance: 'Follows the money trail to uncover beneficial owners and support asset forfeiture.',
      targetTab: 'transactions',
      targetTabLabel: 'Inspect in Money Flows',
    },
    density: {
      id: 'density',
      name: 'Network Connectivity',
      value: `${(parseFloat(networkDensity) * 100).toFixed(0)}%`,
      badge: '17% Connected',
      measures: 'The percentage of possible connections that actually exist between targets in this network.',
      formula: 'Actual Links ÷ Total Possible Links',
      calculation: '52 connections out of 306 possible (17.0% connectivity).',
      investigativeImportance: 'A low percentage confirms a compartmentalized syndicate designed to isolate compromised cells.',
      targetTab: 'ai',
      targetTabLabel: 'Analyze in AI Engine',
    },
    high_risk: {
      id: 'high_risk',
      name: 'High-Risk Suspects',
      value: highRiskEntities.length,
      badge: '5 Priority Targets',
      measures: 'Suspects and entities with the highest risk scores based on transaction volume and criminal ties.',
      formula: 'Entities with High or Critical Risk',
      calculation: '5 key targets requiring immediate investigative priority.',
      investigativeImportance: 'Helps analysts prioritize surveillance and subpoenas on syndicate leadership first.',
      targetTab: 'entities',
      targetTabLabel: 'View High-Risk Dossiers',
    },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ============================================================ */}
      {/* 1. Clean Executive Hero Banner */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2f2a23] bg-gradient-to-r from-slate-50 via-sky-50/20 to-slate-50 dark:from-[#110f0d] dark:via-[#161411] dark:to-[#110f0d] p-6 sm:p-7 shadow-xs transition-colors duration-200">
        <div className="absolute -right-8 -top-8 w-56 h-56 bg-[#dfd5bf]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-[11px] text-sky-700 dark:text-[#dfd5bf] tracking-wider uppercase font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Investigation Command Center
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#f4ede1] tracking-tight">
              Understand Connections. Trace Transactions. Investigate Patterns.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#b8ad99] leading-relaxed">
              Explore suspect relationships, follow financial trails, and surface criminal network patterns.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onStartDemo && (
              <button
                onClick={onStartDemo}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-[#dfd5bf] dark:text-[#080706] hover:dark:bg-[#e8dec8] font-semibold text-xs transition flex items-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Guided Demo</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('network')}
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#1a1714] hover:bg-slate-50 dark:hover:bg-[#231f1a] border border-slate-300 dark:border-[#383127] text-slate-800 dark:text-[#dfd5bf] font-medium text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-[#dfd5bf]" />
              <span>Explore Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Primary Navigation Cards (Clean & Minimalist) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Network Graph */}
        <div
          onClick={() => onNavigate('network')}
          className="group p-4 rounded-xl glass-panel glass-panel-hover cursor-pointer border border-slate-200 dark:border-[#2f2a23] space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-[#1f1b16] border border-sky-300 dark:border-[#42392e] flex items-center justify-center text-sky-700 dark:text-[#dfd5bf]">
              <Share2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-[#dfd5bf] group-hover:translate-x-0.5 transition" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
              Network Graph
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8f8270] mt-0.5">
              Visualize targets and connected relationships.
            </p>
          </div>
        </div>

        {/* Card 2: Money Flows */}
        <div
          onClick={() => onNavigate('transactions')}
          className="group p-4 rounded-xl glass-panel glass-panel-hover cursor-pointer border border-slate-200 dark:border-[#2f2a23] space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-[#201c14] border border-amber-300 dark:border-[#473b22] flex items-center justify-center text-amber-700 dark:text-[#d4af37]">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
              Money Flows
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8f8270] mt-0.5">
              Trace transfers and multi-hop account routes.
            </p>
          </div>
        </div>

        {/* Card 3: AI Assistant */}
        <div
          onClick={() => {
            if (onOpenAssistant) {
              onOpenAssistant();
            } else {
              onNavigate('ai');
            }
          }}
          className="group p-4 rounded-xl glass-panel glass-panel-hover cursor-pointer border border-slate-200 dark:border-[#2f2a23] space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-[#1f1b1a] border border-indigo-300 dark:border-[#4a3b35] flex items-center justify-center text-indigo-700 dark:text-[#dfd5bf]">
              <Bot className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-[#dfd5bf] group-hover:translate-x-0.5 transition" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
              AI Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8f8270] mt-0.5">
              Ask questions in plain English (Ctrl+K).
            </p>
          </div>
        </div>

        {/* Card 4: Active Cases */}
        <div
          onClick={() => onNavigate('cases')}
          className="group p-4 rounded-xl glass-panel glass-panel-hover cursor-pointer border border-slate-200 dark:border-[#2f2a23] space-y-2 transition shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-[#1b211d] border border-emerald-300 dark:border-[#38483d] flex items-center justify-center text-emerald-700 dark:text-[#7a9a83]">
              <Briefcase className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-[#7a9a83] group-hover:translate-x-0.5 transition" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
              Cases &amp; Tasks
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8f8270] mt-0.5">
              Manage evidence, taskforces, and warrants.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Key Metrics Summary */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total Entities */}
        <div 
          onClick={() => setInspectedKpi(kpiDetails.entities)}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover cursor-pointer group border border-slate-200 dark:border-[#2f2a23] hover:border-sky-400 dark:hover:border-[#dfd5bf]/50 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8f8270] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Targets</span>
            <Users className="w-3.5 h-3.5 text-sky-600 dark:text-[#dfd5bf]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f4ede1]">{totalEntities}</div>
          <div className="text-[10px] text-slate-400 dark:text-[#8f8270] mt-0.5">Tracked suspects</div>
        </div>

        {/* Identified Connections */}
        <div 
          onClick={() => setInspectedKpi(kpiDetails.relationships)}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover cursor-pointer group border border-slate-200 dark:border-[#2f2a23] hover:border-indigo-400 dark:hover:border-[#dfd5bf]/50 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8f8270] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Connections</span>
            <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-[#c5b497]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f4ede1]">{totalRelationships}</div>
          <div className="text-[10px] text-slate-400 dark:text-[#8f8270] mt-0.5">Verified links</div>
        </div>

        {/* Active Investigations */}
        <div 
          onClick={() => setInspectedKpi(kpiDetails.cases)}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover cursor-pointer group border border-slate-200 dark:border-[#2f2a23] hover:border-blue-400 dark:hover:border-[#dfd5bf]/50 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8f8270] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Cases</span>
            <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-[#dfd5bf]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f4ede1]">{activeCases.length}</div>
          <div className="text-[10px] text-slate-400 dark:text-[#8f8270] mt-0.5">Open operations</div>
        </div>

        {/* Flagged Transactions */}
        <div 
          onClick={() => setInspectedKpi(kpiDetails.transactions)}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover cursor-pointer group border border-slate-200 dark:border-[#2f2a23] hover:border-amber-400 dark:hover:border-[#dfd5bf]/50 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8f8270] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Flagged Money</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-[#d4af37]">$19.5M</div>
          <div className="text-[10px] text-slate-400 dark:text-[#8f8270] mt-0.5">{flaggedTransactions.length} major wires</div>
        </div>

        {/* Network Density */}
        <div 
          onClick={() => setInspectedKpi(kpiDetails.density)}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover cursor-pointer group border border-slate-200 dark:border-[#2f2a23] hover:border-teal-400 dark:hover:border-[#dfd5bf]/50 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8f8270] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Density</span>
            <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-[#c5b497]" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-700 dark:text-[#dfd5bf]">17%</div>
          <div className="text-[10px] text-slate-400 dark:text-[#8f8270] mt-0.5">Compartmentalized</div>
        </div>

        {/* High-Risk Targets */}
        <div 
          onClick={() => setInspectedKpi(kpiDetails.high_risk)}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover cursor-pointer group border border-slate-200 dark:border-[#2f2a23] hover:border-rose-400 dark:hover:border-[#dfd5bf]/50 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8f8270] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-[#c27d78]" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-[#c27d78]">
            {highRiskEntities.length}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-[#8f8270] mt-0.5">Priority review</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Visual Charts Row */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Network Activity Over Time */}
        <div className="lg:col-span-2 p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
              Activity Over Time
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8f8270]">Last 6 Months</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="transColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#dfd5bf' : '#06b6d4'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isDark ? '#dfd5bf' : '#06b6d4'} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="interceptColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#c5b497' : '#8b5cf6'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isDark ? '#c5b497' : '#8b5cf6'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke={isDark ? '#dfd5bf' : '#0891b2'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#transColor)"
                />
                <Area
                  type="monotone"
                  dataKey="intercepts"
                  name="Communications"
                  stroke={isDark ? '#c5b497' : '#8b5cf6'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#interceptColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entity Type Distribution */}
        <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">Target Types</h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8f8270]">{totalEntities} Total</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={entityTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {entityTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TYPE_COLORS[entry.name.replace(' ', '_')] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
            {entityTypeData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: TYPE_COLORS[item.name.replace(' ', '_')] || '#64748b',
                  }}
                ></span>
                <span className="text-slate-500 dark:text-[#8f8270] truncate">{item.name}:</span>
                <span className="text-slate-800 dark:text-[#dfd5bf] font-bold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. Clean Operational Lists: Active Cases & Priority Targets */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Investigations */}
        <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-600 dark:text-[#dfd5bf]" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">Active Cases</h3>
            </div>
            <button
              onClick={() => onNavigate('cases')}
              className="text-xs text-sky-700 dark:text-[#dfd5bf] hover:underline font-mono flex items-center gap-1"
            >
              View All ({cases.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {cases.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#12100e] border border-slate-200 dark:border-[#25201a] hover:border-sky-300 dark:hover:border-[#dfd5bf]/30 cursor-pointer transition flex items-center justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-700 dark:text-[#dfd5bf]">
                      {c.codeName}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                        c.priority === 'critical'
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-[#c27d78]'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-[#d4af37]'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5">{c.title}</div>
                </div>

                <div className="text-right text-[11px] font-mono">
                  <span className="text-amber-600 dark:text-[#d4af37] font-semibold block">
                    ${(c.totalLaunderedUSD / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-slate-400 text-[10px]">Tracked</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Risk Entities Requiring Review */}
        <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-[#c27d78]" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1]">
                High-Risk Suspects
              </h3>
            </div>
            <button
              onClick={() => onNavigate('entities')}
              className="text-xs text-sky-700 dark:text-[#dfd5bf] hover:underline font-mono flex items-center gap-1"
            >
              All Suspects <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {highRiskEntities.slice(0, 4).map((entity) => (
              <div
                key={entity.id}
                onClick={() => onSelectEntity(entity.id)}
                className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-[#12100e] border border-slate-200 dark:border-[#25201a] hover:border-rose-300 dark:hover:border-[#c27d78]/30 cursor-pointer transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-[#c27d78]/30 flex items-center justify-center font-mono text-xs font-bold text-rose-700 dark:text-[#c27d78]">
                    {entity.metrics.riskScore}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-[#dfd5bf] transition">
                      {entity.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#8f8270] font-mono">
                      <span className="capitalize">{entity.type.replace('_', ' ')}</span> • {entity.jurisdiction}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-sky-600 dark:text-[#dfd5bf] group-hover:underline flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. KPI Explanation Modal (Clean & Plain English) */}
      {/* ============================================================ */}
      {inspectedKpi && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#25201a]">
              <div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-[#1f1b16] border border-sky-300 dark:border-[#42392e] text-sky-800 dark:text-[#dfd5bf]">
                  {inspectedKpi.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-2">
                  {inspectedKpi.name}: <span className="text-sky-600 dark:text-[#dfd5bf] font-mono">{inspectedKpi.value}</span>
                </h3>
              </div>
              <button
                onClick={() => setInspectedKpi(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-[#dfd5bf]">
                  What this means
                </div>
                <p className="text-slate-600 dark:text-[#cfc1ab] leading-relaxed">
                  {inspectedKpi.measures}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-50/50 dark:bg-[#171410] border border-sky-200/60 dark:border-[#383127] space-y-1.5">
                <div className="text-[11px] font-semibold text-sky-800 dark:text-[#dfd5bf] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Why it matters for investigators
                </div>
                <p className="text-slate-700 dark:text-[#e4dac8] leading-relaxed">
                  {inspectedKpi.investigativeImportance}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#25201a] flex items-center justify-between">
              <button
                onClick={() => setInspectedKpi(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#b8ad99] border dark:border-[#383127] text-xs hover:bg-slate-200 dark:hover:bg-[#25201a] transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tab = inspectedKpi.targetTab;
                  setInspectedKpi(null);
                  onNavigate(tab);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>{inspectedKpi.targetTabLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
