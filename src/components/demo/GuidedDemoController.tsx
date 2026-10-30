'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen,
  Award,
  Shield,
  Eye,
  EyeOff,
  Edit2,
  Save,
  Check,
} from 'lucide-react';
import { Entity, Relationship, Case } from '@/types/intelligence';

export interface GuidedDemoControllerProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSelectEntity: (id: string) => void;
  onSelectCase: (id: string) => void;
  onOpenAssistant: () => void;
  entities: Entity[];
  relationships: Relationship[];
  cases: Case[];
  isDemoActive: boolean;
  onCloseDemo: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

interface StepDefinition {
  stepNumber: number;
  id: string;
  tab: string;
  title: string;
  badge: string;
  tagline: string;
  whatYouAreSeeing: string;
  whatTheSystemDoes: string;
  whyItMatters: string;
  defaultScript: string;
  presenterTips: string[];
  interactiveAction?: {
    label: string;
    action: () => void;
  };
}

export const GuidedDemoController: React.FC<GuidedDemoControllerProps> = ({
  currentTab,
  onSelectTab,
  onSelectEntity,
  onSelectCase,
  onOpenAssistant,
  entities,
  relationships,
  cases,
  isDemoActive,
  onCloseDemo,
  isPresentationMode,
  onTogglePresentationMode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showScript, setShowScript] = useState<boolean>(true);
  const [showPresenterNotes, setShowPresenterNotes] = useState<boolean>(false);
  const [isEditingScript, setIsEditingScript] = useState<boolean>(false);
  const [customScripts, setCustomScripts] = useState<Record<number, string>>({});
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showVivaModal, setShowVivaModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 11 Comprehensive Demonstration Steps matching prompt specifications
  const STEPS: StepDefinition[] = [
    {
      stepNumber: 1,
      id: 'intro',
      tab: 'dashboard',
      title: 'Welcome to CrimeGraph AI',
      badge: 'PROJECT ORIENTATION',
      tagline: 'Connecting Evidence. Revealing Patterns. Supporting Investigations.',
      whatYouAreSeeing:
        'The primary intelligence command center orientation screen. A prototype system designed to help authorized investigators navigate complex transnational criminal networks.',
      whatTheSystemDoes:
        'Integrates graph database structures, graph analytics, and transaction monitoring to synthesize fragmented evidence across multiple jurisdictions into an interactive decision-support platform.',
      whyItMatters:
        'Modern transnational syndicates deliberately disperse assets and communications across nominee shell entities and encrypted conduits. Manual spreadsheet analysis fails to reveal multi-hop conduits.',
      defaultScript:
        'Good day, respected evaluator. I am presenting CrimeGraph AI — an AI-powered criminal network analysis platform developed as my final-year project. Our mission is to transform disconnected criminal intelligence records into actionable visual graphs and explainable analytical insights to support authorized law enforcement analysts.',
      presenterTips: [
        'State clearly that this is an academic decision-support prototype using synthetic demo data.',
        'Highlight the 3 learning objectives: Visualizing relationships, Identifying graph patterns, and Organizing evidence for human review.',
      ],
      interactiveAction: {
        label: 'Open Welcome Dossier',
        action: () => onSelectTab('dashboard'),
      },
    },
    {
      stepNumber: 2,
      id: 'dashboard',
      tab: 'dashboard',
      title: 'Dashboard Overview & Intelligence Telemetry',
      badge: 'SITUATIONAL AWARENESS',
      tagline: 'Instant situational metrics calculated dynamically from synthetic graph data.',
      whatYouAreSeeing:
        'Six primary tactical KPI metrics (Total Entities: 18, Connections: 26, Active Cases: 3, Flagged Transactions: 12, Density: 0.170, High-Risk Items: 5), quarterly flow trajectories, and entity distribution charts.',
      whatTheSystemDoes:
        'Dynamically parses the loaded synthetic dataset to compute real-time graph density, threat distribution, and chronological transaction volume over fiscal quarters.',
      whyItMatters:
        'Commanders require instant situational briefings to prioritize investigative resources on critical bottlenecks rather than drowning in raw data.',
      defaultScript:
        'Here on the Command Dashboard, the system displays key intelligence indicators. Notice that every figure — from the 18 analyzed entities to the network density of 0.170 — is computed in real time directly from our loaded dataset. Clicking any statistic reveals an explainability card showing its mathematical definition and investigative context.',
      presenterTips: [
        'Point out the "SIMULATED DEMO DATA" label to demonstrate research integrity.',
        'Click on "Network Density" on the dashboard to show the evaluator the live explanation card.',
      ],
      interactiveAction: {
        label: 'Highlight High-Risk Conduits',
        action: () => onSelectTab('dashboard'),
      },
    },
    {
      stepNumber: 3,
      id: 'network',
      tab: 'network',
      title: 'Interactive Network Explorer',
      badge: 'TOPOLOGY VISUALIZATION',
      tagline: 'Cytoscape.js interactive graph with multi-modal entity inspection & connection explainer.',
      whatYouAreSeeing:
        'A full-screen interactive relationship graph representing people, corporations, bank accounts, burner phones, vessels, and locations connected by directed, colored edges.',
      whatTheSystemDoes:
        'Provides zoom, pan, layout switching (CoSE, concentric, circular), entity search, multi-type filtering, shortest-path calculation, and a dedicated "Explain This Connection" modal.',
      whyItMatters:
        'Visual spatial layouts immediately expose intermediaries and conduits that are hidden inside relational database tables.',
      defaultScript:
        'This is the heart of the platform: the Interactive Network Explorer. Built on Cytoscape.js, each node represents an entity with distinct accessible colors. When I select Anton "The Bishop" Vance, the right drawer displays his full dossier, degree metrics, Admiralty provenance, and all connected entities. Clicking "Explain This Connection" generates a transparent, non-prejudicial explanation based strictly on dataset records.',
      presenterTips: [
        'Click "Explain First Link" or "Explain This Connection" in the right drawer to show the transparent explanation.',
        'Demonstrate dragging nodes, searching "Anton", or tracing the shortest path between Anton Vance and M/V Poseidon Shadow.',
      ],
      interactiveAction: {
        label: 'Inspect Anton Vance Dossier',
        action: () => {
          onSelectTab('network');
          onSelectEntity('ENT-001');
        },
      },
    },
    {
      stepNumber: 4,
      id: 'analytics',
      tab: 'ai',
      title: 'Demonstrate Graph Analytics & Link Prediction',
      badge: 'NETWORK SCIENCE',
      tagline: 'Computed Degree, Betweenness (Brandes), PageRank, LPA Communities & Candidate Links.',
      whatYouAreSeeing:
        'Real computed results for Degree Centrality, Brandes Betweenness Centrality, PageRank Centrality, Label Propagation (LPA) Community Detection, and Candidate Link Prediction.',
      whatTheSystemDoes:
        'Executes graph algorithms to identify communication hubs, gatekeeper nodes bridging isolated cells, operational functional clusters, and potential unobserved associations.',
      whyItMatters:
        'Syndicate kingpins often keep low degree centrality to avoid detection. Betweenness centrality exposes the critical brokers through whom all capital and logistics must pass.',
      defaultScript:
        'Under AI Analysis, we implement deterministic network science algorithms. Betweenness centrality calculated via Brandes algorithm reveals hidden gatekeepers like Helena Vance who bridge command with offshore shells. Notice our Link Prediction tab: candidate links are derived via Jaccard topological similarity and triadic closure, and are explicitly styled with dashed borders and labeled "PREDICTED — NOT OBSERVED" to uphold responsible AI standards.',
      presenterTips: [
        'Switch between the Centrality, Communities, Anomalies, and Link Prediction tabs.',
        'Emphasize to the teacher that predicted links are clearly labeled and never claimed as legal proof.',
      ],
      interactiveAction: {
        label: 'View Predicted Links Tab',
        action: () => onSelectTab('ai'),
      },
    },
    {
      stepNumber: 5,
      id: 'transactions',
      tab: 'transactions',
      title: 'Transaction Analysis & Anomaly Detection',
      badge: 'FINANCIAL INTELLIGENCE',
      tagline: 'Forensic transaction ledger with configurable live detection thresholds & explainable flags.',
      whatYouAreSeeing:
        'Financial transaction ledger, capital velocity trajectory BarChart, configurable threshold controls, and "Why Was This Flagged?" drill-down panels.',
      whatTheSystemDoes:
        'Monitors high-value velocity transfers (> $5M USD) and structured smurfing batches (< $10k USD CTR ceiling), allowing analysts to adjust thresholds in real time.',
      whyItMatters:
        'Money launderers intentionally structure transfers under statutory limits. Algorithmic velocity analysis alerts investigators before illicit funds disperse to offshore secrecy havens.',
      defaultScript:
        'The Transaction Analysis module demonstrates financial flow tracking. Notice the configurable detection thresholds bar at the top: when an analyst adjusts the high-velocity threshold or smurfing ceiling, the ledger recalculates instantly. Clicking "Why Flagged?" opens an explanation panel detailing the exact mathematical condition that triggered the alert, alongside supporting entities and review guidance.',
      presenterTips: [
        'Change the "Bulk High-Velocity Threshold" dropdown to see the table react dynamically.',
        'Click the "Why Flagged?" button on any flagged row to show the plain-language explanation modal.',
      ],
      interactiveAction: {
        label: 'Inspect Flagged Wire Conduit',
        action: () => onSelectTab('transactions'),
      },
    },
    {
      stepNumber: 6,
      id: 'cases',
      tab: 'cases',
      title: 'Investigation Case Management & Evidence Timeline',
      badge: 'CASEWORK REPOSITORY',
      tagline: 'Multi-agency operation dossiers, chronological evidence exhibits, and indictment tracking.',
      whatYouAreSeeing:
        'Active taskforce operations (Operation Iron Trident, Operation Black Sparrow), attached target entities, chronological evidence events, and case registration forms.',
      whatTheSystemDoes:
        'Coordinates investigative evidence, maintains Admiralty evaluation ratings (A1 to F6), tracks follow-up tasks, and persists updates using session-persistent in-memory demo storage.',
      whyItMatters:
        'Analytical discoveries must be cataloged into a secure, chronological chain of custody suitable for judicial subpoenas, FinCEN filings, and courtroom exhibits.',
      defaultScript:
        'Case Management bridges analytical intelligence with courtroom prosecution. Here we manage active operations, attach target entities, review evidence chronologies, and assign investigative tasks. Notice the explicit "IN-MEMORY DEMO STORAGE" notice: we maintain complete academic honesty by clarifying that in this local evaluation session, state is preserved without pretending a remote cloud write occurred.',
      presenterTips: [
        'Click "Open New Case File" to demonstrate the form validation and case registration.',
        'Review the chronological evidence timeline showing wiretaps, customs seizures, and subpoenas.',
      ],
      interactiveAction: {
        label: 'Select Operation Iron Trident',
        action: () => {
          onSelectTab('cases');
          onSelectCase('CASE-2026-089A');
        },
      },
    },
    {
      stepNumber: 7,
      id: 'entities',
      tab: 'entities',
      title: 'Entity Explorer & Registry Directory',
      badge: 'INTELLIGENCE DIRECTORY',
      tagline: 'Searchable master target database with filtering, verification badges, and graph navigation.',
      whatYouAreSeeing:
        'Multi-column master table of all synthetic entities with type icons, aliases, jurisdictions, risk levels, Admiralty verification codes, and one-click graph locate actions.',
      whatTheSystemDoes:
        'Filters, sorts, and paginates target entities, displaying aliases, tax IDs, passport codes, and degree metrics with seamless bi-directional navigation to the network graph.',
      whyItMatters:
        'Field agents starting with a single lead (e.g., an offshore IBAN or burner phone) need instant screening capability across the entire target registry.',
      defaultScript:
        'The Entity Explorer provides a searchable master directory. Analysts can filter across entity types and risk tiers, search aliases and passports, and review Admiralty codes. Clicking "Locate in Graph" transports the user directly to that node in the network view, preserving context across views.',
      presenterTips: [
        'Type "Panama" or "Vance" in the search box to demonstrate instant client-side filtering.',
        'Click "Locate in Graph" to demonstrate cross-module navigation.',
      ],
      interactiveAction: {
        label: 'Search Registry for Shell Entities',
        action: () => onSelectTab('entities'),
      },
    },
    {
      stepNumber: 8,
      id: 'assistant',
      tab: 'entities',
      title: 'Global Investigation Assistant (Rule-Based Q&A)',
      badge: 'AI COPILOT',
      tagline: 'Natural language analytical assistant grounded directly in the loaded intelligence graph.',
      whatYouAreSeeing:
        'Slide-in tactical AI assistant with suggested investigative prompt chips, contextual responses, and source citations.',
      whatTheSystemDoes:
        'Parses analytical queries, traverses the network graph and transaction history, and returns explainable summaries with citations to specific entity IDs and evidence exhibits without hallucinations.',
      whyItMatters:
        'Investigators need immediate answers during critical operations without needing to write complex Cypher or SQL graph database queries.',
      defaultScript:
        'The Global Investigation Assistant acts as an investigative copilot. Notice these clickable prompts: when I click "Summarize this fictional network" or "Which entities have the most connections?", the assistant queries our live data structures and returns factual summaries with citations. If an external LLM API key is absent, the system gracefully engages a local rule-based analytical engine.',
      presenterTips: [
        'Click on the prompt chip "Summarize this fictional network" or "Find the shortest path between two entities".',
        'Highlight that the assistant never invents synthetic entities or transactions.',
      ],
      interactiveAction: {
        label: 'Open AI Assistant Drawer',
        action: () => onOpenAssistant(),
      },
    },
    {
      stepNumber: 9,
      id: 'import_export',
      tab: 'import-export',
      title: 'Data Ingestion & Certified Export',
      badge: 'DATA INTEGRITY',
      tagline: 'Safe schema validation, file preview dropzone, and downloadable synthetic benchmarks.',
      whatYouAreSeeing:
        'Ingestion drag-and-drop zone with safe client-side CSV/JSON parsing, preview validation table, and downloadable fictional demo benchmarks.',
      whatTheSystemDoes:
        'Enforces schema validation, column mapping, and duplicate detection without executing untrusted code, and provides one-click export of complete graph JSON and CSV summaries.',
      whyItMatters:
        'Intelligence platforms must ingest heterogeneous bulk feeds from customs, FIUs, and financial registries while preserving strict data sanitation and evidence standards.',
      defaultScript:
        'In Data Import and Export, evaluators can download our fictional benchmark datasets to inspect offline in Gephi or Neo4j. Inbound datasets undergo schema validation and record previews before staging in memory. Export options produce courtroom-certified intelligence dossiers for FinCEN regulatory filings.',
      presenterTips: [
        'Click "Download Fictional Demo Datasets" to show the evaluator the raw synthetic data format.',
        'Mention the client-side safe parser that prevents malicious script injection.',
      ],
      interactiveAction: {
        label: 'View Downloadable Datasets',
        action: () => onSelectTab('import-export'),
      },
    },
    {
      stepNumber: 10,
      id: 'security_governance',
      tab: 'settings',
      title: 'Security, RBAC & Responsible AI Governance',
      badge: 'GOVERNANCE & ETHICS',
      tagline: 'Multi-tier clearance governance, SHA-256 audit logging, and strict ethical AI guidelines.',
      whatYouAreSeeing:
        'Role-Based Access Control (RBAC) capability matrix, SHA-256 Merkle audit trail, and Responsible AI Principles charter.',
      whatTheSystemDoes:
        'Enforces separation of duties across 4 clearance tiers (Admin, Lead Investigator, Forensic Analyst, Field Agent), logs every query with SHA-256 hashes, and mandates human review.',
      whyItMatters:
        'Law enforcement platforms require strict chain of custody and ethical safeguards to prevent unauthorized surveillance, procedural bias, and courtroom inadmissibility.',
      defaultScript:
        'Security and ethics are central to our design. The RBAC matrix restricts sensitive actions — like approving subpoenas or ingesting external data — by clearance tier. Every query is logged in an immutable SHA-256 forensic audit trail. Furthermore, our Responsible AI charter strictly states: network presence does not establish guilt, predictions are separated from observed facts, and all recommendations require human review.',
      presenterTips: [
        'Switch roles using the "Assume Role" buttons in the RBAC table to demonstrate permission gating.',
        'Review the Audit Log tab to show the non-repudiation ledger.',
      ],
      interactiveAction: {
        label: 'Inspect RBAC Permissions Matrix',
        action: () => onSelectTab('settings'),
      },
    },
    {
      stepNumber: 11,
      id: 'summary_viva',
      tab: 'dashboard',
      title: 'Project Defense Summary & Viva Q&A Guide',
      badge: 'FINAL EVALUATION',
      tagline: 'Comprehensive problem-solution summary, limitation disclosures, and model viva answers.',
      whatYouAreSeeing:
        'Final evaluation defense briefing, technical architecture review, honest implementation matrix, and interactive viva examination preparation.',
      whatTheSystemDoes:
        'Presents the complete engineering contribution: combining Next.js 14, Cytoscape.js, NetworkX algorithms, and explainable AI for law enforcement decision support.',
      whyItMatters:
        'Demonstrates mastery of full-stack engineering, algorithmic complexity, ethical AI constraints, and practical investigative intelligence workflows.',
      defaultScript:
        'In conclusion, CrimeGraph AI demonstrates how graph analytics and interactive visualization empower investigators to unravel complex transnational networks. We have implemented Brandes betweenness, PageRank, Label Propagation, and Jaccard link prediction with full explainability and ethical human-in-the-loop governance. I welcome any questions from the examination committee.',
      presenterTips: [
        'Click "Open Viva Q&A Preparation" to view the 8 common professor questions and model answers.',
        'Review the Implemented vs Simulated table to showcase full academic transparency.',
      ],
      interactiveAction: {
        label: 'Open Viva Q&A Guide',
        action: () => setShowVivaModal(true),
      },
    },
  ];

  const currentStep = STEPS[currentStepIndex];

  // Navigate to step and switch tab
  const goToStep = (index: number) => {
    if (index >= 0 && index < STEPS.length) {
      setCurrentStepIndex(index);
      onSelectTab(STEPS[index].tab);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleRestart = () => {
    goToStep(0);
  };

  // Get current active script (custom or default)
  const activeScript = customScripts[currentStepIndex] !== undefined
    ? customScripts[currentStepIndex]
    : currentStep.defaultScript;

  const handleSaveScript = (newText: string) => {
    setCustomScripts((prev) => ({ ...prev, [currentStepIndex]: newText }));
    setIsEditingScript(false);
  };

  const handleResetScript = () => {
    setCustomScripts((prev) => {
      const updated = { ...prev };
      delete updated[currentStepIndex];
      return updated;
    });
    setIsEditingScript(false);
  };

  if (!isDemoActive) return null;

  return (
    <>
      {/* Floating Guided Demo HUD / Docked Control Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-all duration-300">
        {isMinimized ? (
          /* Sleek Minimized Presenter Toolbar */
          <div className="bg-[#12100e]/95 dark:bg-[#100f0d]/95 backdrop-blur-md border border-[#dfd5bf]/30 rounded-xl shadow-2xl p-2.5 px-4 text-[#f4ede1] flex items-center justify-between gap-3 font-mono text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-amber-300 dark:text-[#dfd5bf]">
                Step {currentStep.stepNumber}/{STEPS.length}:
              </span>
              <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-xs">{currentStep.title}</span>
            </div>

            <div className="flex items-center gap-2">
              {currentStep.interactiveAction && (
                <button
                  onClick={currentStep.interactiveAction.action}
                  className="px-2.5 py-1 rounded-lg bg-[#dfd5bf]/20 hover:bg-[#dfd5bf]/30 text-[#dfd5bf] border border-[#dfd5bf]/40 text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">{currentStep.interactiveAction.label}</span>
                </button>
              )}

              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-2 py-1 rounded bg-[#25201a] hover:bg-[#332b22] disabled:opacity-40 text-slate-300 hover:text-white border border-[#383127] text-xs transition"
                title="Previous Step"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIndex === STEPS.length - 1}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 dark:bg-[#dfd5bf] text-[#080706] disabled:opacity-40 font-bold text-xs transition flex items-center gap-1"
                title="Next Step"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 rounded bg-[#25201a] hover:bg-[#332b22] text-[#dfd5bf] border border-[#383127] transition"
                title="Expand Full Briefing HUD"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              <button
                onClick={onCloseDemo}
                className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition"
                title="Exit Demo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Guided HUD */
          <div className="bg-[#12100e]/95 dark:bg-[#100f0d]/95 backdrop-blur-md border border-[#dfd5bf]/30 rounded-2xl shadow-2xl p-4 text-[#f4ede1] space-y-3 animate-in fade-in duration-150">
            {/* Top Row: Progress Bar & Mode Badges */}
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-amber-300 dark:text-[#dfd5bf] uppercase tracking-wider">
                  {isPresentationMode ? '🎓 TEACHER PRESENTATION' : '🚀 GUIDED DEMO'}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">
                  Step {currentStep.stepNumber} of {STEPS.length}: <strong className="text-white">{currentStep.title}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowVivaModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#25201a] hover:bg-[#332b22] text-[#dfd5bf] border border-[#dfd5bf]/30 transition text-[11px] flex items-center gap-1 font-semibold"
                  title="Open Viva Questions & Answers"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Viva Q&amp;A
                </button>

                <button
                  onClick={onTogglePresentationMode}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 border ${
                    isPresentationMode
                      ? 'bg-[#dfd5bf] text-[#080706] border-[#dfd5bf]'
                      : 'bg-[#1e1a15] text-[#dfd5bf] border-[#383127] hover:bg-[#28231c]'
                  }`}
                  title="Toggle Teacher Presentation Mode"
                >
                  <Award className="w-3.5 h-3.5" />
                  {isPresentationMode ? 'Standard' : 'Teacher'}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-1 rounded-lg bg-[#25201a] hover:bg-[#332b22] text-[#dfd5bf] border border-[#383127] transition"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-lg bg-[#25201a] hover:bg-[#332b22] text-[#dfd5bf] border border-[#383127] transition"
                  title="Minimize HUD to slim toolbar"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onCloseDemo}
                  className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition"
                  title="Exit Demo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full bg-[#25201a] h-1.5 rounded-full overflow-hidden flex">
              {STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className={`h-full flex-1 transition-all duration-300 cursor-pointer ${
                    idx < currentStepIndex
                      ? 'bg-emerald-500'
                      : idx === currentStepIndex
                      ? 'bg-amber-400 dark:bg-[#dfd5bf]'
                      : 'bg-transparent border-r border-[#100f0d]'
                  }`}
                  title={`Step ${idx + 1}: ${step.title}`}
                />
              ))}
            </div>

            {/* Main Content Box: 3 Clean Pedagogical Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-0.5">
              {/* 1. What You Are Seeing */}
              <div className="bg-[#181410] p-2.5 rounded-xl border border-[#2d251d] space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-300 dark:text-[#dfd5bf] font-bold block flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" /> 1. Visual Overview
                </span>
                <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                  {currentStep.whatYouAreSeeing}
                </p>
              </div>

              {/* 2. What The System Does */}
              <div className="bg-[#181410] p-2.5 rounded-xl border border-[#2d251d] space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-300 dark:text-[#dfd5bf] font-bold block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" /> 2. System Logic
                </span>
                <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                  {currentStep.whatTheSystemDoes}
                </p>
              </div>

              {/* 3. Why It Matters */}
              <div className="bg-[#181410] p-2.5 rounded-xl border border-[#2d251d] space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-300 dark:text-[#7a9a83] font-bold block flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> 3. Investigative Impact
                </span>
                <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                  {currentStep.whyItMatters}
                </p>
              </div>
            </div>

            {/* Presenter Speech Script Bar */}
            {showScript && (
              <div className="bg-[#1c1813] p-2.5 rounded-xl border border-[#383127] space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 dark:text-[#dfd5bf] font-bold flex items-center gap-1 text-[11px]">
                    <FileText className="w-3 h-3" /> Presenter Script:
                  </span>
                  <div className="flex items-center gap-2">
                    {customScripts[currentStepIndex] !== undefined && (
                      <button
                        onClick={handleResetScript}
                        className="text-[10px] text-slate-400 hover:text-white underline"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditingScript(!isEditingScript)}
                      className="text-[10px] text-[#dfd5bf] hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> {isEditingScript ? 'Done' : 'Edit Script'}
                    </button>
                    <button
                      onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                      className="text-[10px] text-slate-400 hover:text-[#dfd5bf] flex items-center gap-1"
                    >
                      {showPresenterNotes ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                      {showPresenterNotes ? 'Hide Tips' : 'Tips'}
                    </button>
                  </div>
                </div>

                {isEditingScript ? (
                  <div className="space-y-1.5">
                    <textarea
                      defaultValue={activeScript}
                      id="custom-script-textarea"
                      rows={2}
                      className="w-full bg-[#100f0d] border border-[#dfd5bf]/40 rounded-lg p-2 text-xs font-sans text-white focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const el = document.getElementById('custom-script-textarea') as HTMLTextAreaElement;
                          if (el) handleSaveScript(el.value);
                        }}
                        className="px-2.5 py-1 rounded bg-[#dfd5bf] text-[#080706] font-bold text-xs font-mono flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save Script
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-100/90 dark:text-[#f4ede1] font-sans italic leading-relaxed bg-[#100f0d]/60 p-2 rounded-lg border border-[#25201a]">
                    &ldquo;{activeScript}&rdquo;
                  </p>
                )}

                {/* Presenter Private Notes / Tips */}
                {showPresenterNotes && (
                  <div className="text-[11px] font-mono text-emerald-300 dark:text-[#a0c4ab] bg-[#121f15]/80 p-2 rounded border border-[#304535] space-y-1">
                    <span className="font-bold uppercase block text-[10px]">Defense Tips:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {currentStep.presenterTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation & Live Interactive Trigger Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#25201a]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="px-2.5 py-1 rounded-lg bg-[#1f1b16] hover:bg-[#2b251e] text-slate-300 hover:text-white border border-[#383127] text-xs font-mono transition flex items-center gap-1"
                  title="Restart Demonstration"
                >
                  <RotateCcw className="w-3 h-3" /> Restart
                </button>

                <button
                  onClick={() => setShowScript(!showScript)}
                  className="px-2.5 py-1 rounded-lg bg-[#1f1b16] hover:bg-[#2b251e] text-slate-300 hover:text-white border border-[#383127] text-xs font-mono transition flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" /> {showScript ? 'Hide Script' : 'Show Script'}
                </button>

                {currentStep.interactiveAction && (
                  <button
                    onClick={currentStep.interactiveAction.action}
                    className="px-3 py-1 rounded-lg bg-[#dfd5bf]/20 hover:bg-[#dfd5bf]/30 text-[#dfd5bf] border border-[#dfd5bf]/40 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {currentStep.interactiveAction.label}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#1f1b16] hover:bg-[#2b251e] disabled:opacity-40 text-slate-300 hover:text-white border border-[#383127] text-xs font-mono transition flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStepIndex === STEPS.length - 1}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 dark:bg-[#dfd5bf] text-[#080706] hover:dark:bg-[#e8dec8] disabled:opacity-40 text-xs font-mono font-bold transition flex items-center gap-1 shadow-sm"
                >
                  {currentStepIndex === STEPS.length - 1 ? 'Finish Demo' : 'Next Step'} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viva Preparation & Professor FAQ Examination Modal */}
      {showVivaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-[#14120f] border border-[#dfd5bf]/40 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-[#f4ede1] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2822]">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-400 dark:text-[#dfd5bf]" />
                <div>
                  <h3 className="text-lg font-bold font-mono text-[#f4ede1]">
                    Final-Year Viva Defense &amp; Professor FAQs
                  </h3>
                  <p className="text-xs text-[#b8ad99]">
                    Prepared answers to frequently asked faculty evaluation questions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVivaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#231f1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Architecture Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#100f0d] border border-[#28221b] space-y-1">
                <span className="text-amber-400 dark:text-[#dfd5bf] font-bold block">
                  1. Problem Addressed
                </span>
                <p className="text-slate-300 font-sans text-xs">
                  Information fragmentation in transnational criminal investigations where suspects hide behind layered shell companies, multiple jurisdictions, and crypto mixers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#100f0d] border border-[#28221b] space-y-1">
                <span className="text-cyan-400 dark:text-[#dfd5bf] font-bold block">
                  2. Core Algorithmic Contribution
                </span>
                <p className="text-slate-300 font-sans text-xs">
                  Graph analytics (Brandes Betweenness, PageRank, Label Propagation Community Detection) and Triadic Closure Link Prediction with explainable risk narratives.
                </p>
              </div>
            </div>

            {/* Implemented vs Simulated Honesty Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#dfd5bf] tracking-wider">
                System Implementation Honesty Matrix (Academic Rigor):
              </h4>
              <div className="overflow-x-auto rounded-xl border border-[#28221b]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#1a1612] text-slate-400 border-b border-[#28221b]">
                    <tr>
                      <th className="py-2 px-3">System Module</th>
                      <th className="py-2 px-3">Execution Mechanism</th>
                      <th className="py-2 px-3">Academic Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#28221b] text-[11px]">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#f4ede1]">Interactive Network Graph</td>
                      <td className="py-2 px-3 text-emerald-400">Cytoscape.js force-directed CoSE layout engine</td>
                      <td className="py-2 px-3 text-[#dfd5bf]">Fully Implemented (Client Engine)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#f4ede1]">Centrality (Brandes &amp; PageRank)</td>
                      <td className="py-2 px-3 text-emerald-400">Pure mathematical TypeScript &amp; Python NetworkX</td>
                      <td className="py-2 px-3 text-[#dfd5bf]">Fully Computed Algorithms</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#f4ede1]">Link Prediction</td>
                      <td className="py-2 px-3 text-emerald-400">Jaccard Topological Similarity &amp; Triadic Closure</td>
                      <td className="py-2 px-3 text-[#dfd5bf]">Calculated Hypothesis (Non-observed)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#f4ede1]">Financial Smurfing Detection</td>
                      <td className="py-2 px-3 text-emerald-400">Real-time Z-Score &amp; CTR threshold rule filtering</td>
                      <td className="py-2 px-3 text-[#dfd5bf]">Fully Functional Detection Logic</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#f4ede1]">Intelligence Records &amp; Entities</td>
                      <td className="py-2 px-3 text-amber-400">Fictional synthetic scenario (Operation Iron Trident)</td>
                      <td className="py-2 px-3 text-amber-300">Simulated Benchmarks (Privacy Preserving)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#f4ede1]">Persistence Layer</td>
                      <td className="py-2 px-3 text-cyan-400">In-memory session state + FastAPI PostgreSQL endpoint</td>
                      <td className="py-2 px-3 text-cyan-300">Hybrid Local / Remote Architecture</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 4 Viva Questions & Answers */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-[#dfd5bf] tracking-wider">
                Top 4 Faculty Defense Questions &amp; Model Answers:
              </h4>

              <div className="p-3 rounded-xl bg-[#100f0d] border border-[#28221b] space-y-1">
                <span className="text-xs font-bold text-amber-300 dark:text-[#dfd5bf]">
                  Q1: &ldquo;Why did you choose Betweenness Centrality over simple Degree Centrality?&rdquo;
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong>Answer:</strong> Degree centrality only counts direct neighbors. In sophisticated criminal organizations, kingpins deliberately minimize their direct calls or wire transfers to avoid detection. Betweenness centrality (computed via Brandes algorithm) measures how often a node sits on the shortest path between all other entity pairs. This exposes the strategic brokers, lawyers, and nominee directors who bridge disconnected cells, making them the true structural vulnerabilities of the network.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#100f0d] border border-[#28221b] space-y-1">
                <span className="text-xs font-bold text-amber-300 dark:text-[#dfd5bf]">
                  Q2: &ldquo;How does your system prevent algorithmic bias and false accusations?&rdquo;
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong>Answer:</strong> We enforce Responsible AI principles: first, candidate link predictions are explicitly labeled &ldquo;PREDICTED — NOT OBSERVED&rdquo; with dashed edges to strictly isolate evidence from speculation. Second, our explanations explicitly emphasize that network presence does not establish criminal complicity. Third, every alert requires human-in-the-loop validation, and demographic or protected characteristics are excluded from analytics.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#100f0d] border border-[#28221b] space-y-1">
                <span className="text-xs font-bold text-amber-300 dark:text-[#dfd5bf]">
                  Q3: &ldquo;What are the technical limitations of your current implementation?&rdquo;
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong>Answer:</strong> Our prototype currently operates on an in-memory graph optimized for sub-second client-side interaction (up to several thousand entities). For enterprise national law enforcement scales with millions of nodes, the graph computation would migrate entirely to a distributed graph database like Neo4j or Amazon Neptune with GraphX/NetworkX background workers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#100f0d] border border-[#28221b] space-y-1">
                <span className="text-xs font-bold text-amber-300 dark:text-[#dfd5bf]">
                  Q4: &ldquo;How does the system calculate financial smurfing?&rdquo;
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong>Answer:</strong> We monitor the statutory Currency Transaction Reporting (CTR) ceiling (default $10,000 USD). Smurfing is flagged when consecutive transfers fall between 90% and 99.9% of that threshold within a short temporal window across common originating or destination corporate accounts, signaling deliberate structuring to avoid anti-money laundering reporting.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#2d2822] flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Final-Year Project Examination Reference Packet</span>
              <button
                onClick={() => setShowVivaModal(false)}
                className="px-4 py-2 rounded-lg bg-[#dfd5bf] text-[#080706] font-bold hover:bg-[#e8dec8] transition shadow-sm"
              >
                Close Viva Packet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
