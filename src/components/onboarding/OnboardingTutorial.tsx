'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Share2,
  CircleDollarSign,
  BrainCircuit,
  Briefcase,
  ShieldAlert,
  Search,
  Sparkles,
  Info,
  BookOpen,
} from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface TutorialStep {
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  badge: string;
  description: string;
  keyPoints: { label: string; text: string }[];
  actionSuggestion?: { label: string; tab: string };
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps: TutorialStep[] = [
    {
      title: 'Welcome to CrimeGraph AI',
      subtitle: 'Criminal Network & Financial Analysis',
      icon: Sparkles,
      badge: 'Step 1 of 6 • Overview',
      description:
        'Explore relationships, trace fund movements, and investigate network patterns with AI-assisted analysis.',
      keyPoints: [
        {
          label: 'Visual Network',
          text: 'Connect people, companies, bank accounts, crypto wallets, and assets.',
        },
        {
          label: 'Transaction Tracing',
          text: 'Follow fund transfers and automatically flag unusual amounts.',
        },
        {
          label: 'Decision Support',
          text: 'AI detects patterns to help human investigators make informed decisions.',
        },
      ],
      actionSuggestion: { label: 'Explore Dashboard', tab: 'dashboard' },
    },
    {
      title: 'Entities & Connections',
      subtitle: 'How the Network Is Built',
      icon: Share2,
      badge: 'Step 2 of 6 • Core Concepts',
      description:
        'The investigation is displayed as an interactive graph of entities (nodes) and connections (edges).',
      keyPoints: [
        {
          label: 'Entity Types',
          text: 'Color-coded nodes for people, corporations, bank accounts, and wallets.',
        },
        {
          label: 'Relationships',
          text: 'Directional arrows showing financial transfers, ownership, or communications.',
        },
        {
          label: 'Evidence Status',
          text: 'Solid lines indicate verified facts; dashed lines indicate analytical hypotheses.',
        },
      ],
      actionSuggestion: { label: 'View Entities', tab: 'entities' },
    },
    {
      title: 'Network Explorer',
      subtitle: 'Visual Graph Navigation',
      icon: BrainCircuit,
      badge: 'Step 3 of 6 • Graph Explorer',
      description:
        'Navigate the visual graph to inspect suspects, expand connections, and discover hidden bridges.',
      keyPoints: [
        {
          label: 'Zoom & Pan',
          text: 'Scroll to zoom, drag the canvas to pan, and move nodes to rearrange clusters.',
        },
        {
          label: 'Degrees of Separation',
          text: 'Click any entity to highlight its direct contacts (1 hop) or wider network (2-3 hops).',
        },
        {
          label: 'Shortest Path',
          text: 'Select two entities to instantly calculate the connection path between them.',
        },
      ],
      actionSuggestion: { label: 'Open Network Explorer', tab: 'network' },
    },
    {
      title: 'Transaction Tracing',
      subtitle: 'Following the Money Trail',
      icon: CircleDollarSign,
      badge: 'Step 4 of 6 • Financial Flows',
      description:
        'Trace money through multi-hop accounts, corporate entities, and crypto wallets with automated anomaly checks.',
      keyPoints: [
        {
          label: 'Route Tracing',
          text: 'Select source and target accounts to see intermediate conduit accounts.',
        },
        {
          label: 'Threshold Alerts',
          text: 'Flags high-value wires and structuring patterns just below reporting limits.',
        },
        {
          label: 'Flexible Filters',
          text: 'Filter by transfer amount, date range, and transaction type.',
        },
      ],
      actionSuggestion: { label: 'Open Transaction Analysis', tab: 'transactions' },
    },
    {
      title: 'Alerts & Findings',
      subtitle: 'Pattern Detection',
      icon: ShieldAlert,
      badge: 'Step 5 of 6 • Findings',
      description:
        'Review automated pattern detections grounded strictly in recorded evidence.',
      keyPoints: [
        {
          label: 'Evidence Grounding',
          text: 'Every alert references concrete transactions and recorded associations.',
        },
        {
          label: 'Suggested Actions',
          text: 'Clear recommendations for next investigative steps and verification.',
        },
        {
          label: 'Priority Scoring',
          text: 'Risk scores help focus attention on high-priority network nodes.',
        },
      ],
      actionSuggestion: { label: 'View Alerts & Findings', tab: 'alerts' },
    },
    {
      title: 'Managing Cases',
      subtitle: 'Organizing Investigations',
      icon: Briefcase,
      badge: 'Step 6 of 6 • Case Management',
      description:
        'Organize targets, evidence trails, and investigative action items into structured case dossiers.',
      keyPoints: [
        {
          label: 'Case Files',
          text: 'Track priority, assigned targets, and case notes in one place.',
        },
        {
          label: 'Checklists',
          text: 'Track operational tasks, subpoenas, and document requests.',
        },
        {
          label: 'Active Workspace',
          text: 'Your updates remain accessible throughout your current session.',
        },
      ],
      actionSuggestion: { label: 'View Cases', tab: 'cases' },
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('crimegraph_onboarding_completed', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12100e] border border-slate-200 dark:border-[#2e2820] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-[#25201a] flex items-center justify-between bg-slate-50/50 dark:bg-[#161411]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-[#221c15] border border-sky-300 dark:border-[#42392e] flex items-center justify-center text-sky-700 dark:text-[#dfd5bf]">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-700 dark:text-[#dfd5bf]">
                {step.badge}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#f4ede1]">{step.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f1b16] transition"
            title="Close Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5 px-6 pt-4">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-10 bg-sky-600 dark:bg-[#dfd5bf]'
                  : idx < currentStep
                  ? 'w-4 bg-sky-300 dark:bg-[#736a5c]'
                  : 'w-4 bg-slate-200 dark:bg-[#25201a]'
              }`}
              title={`Go to Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <p className="text-slate-600 dark:text-[#b8ad99] leading-relaxed text-sm">
            {step.description}
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-[#8f8270] tracking-wider">
              Key Concepts to Remember
            </div>
            {step.keyPoints.map((point, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#181512] border border-slate-200 dark:border-[#25201a] space-y-0.5"
              >
                <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[#dfd5bf]"></span>
                  {point.label}
                </div>
                <div className="text-slate-600 dark:text-[#cfc1ab] pl-3 leading-relaxed">
                  {point.text}
                </div>
              </div>
            ))}
          </div>

          {step.actionSuggestion && onNavigateTab && (
            <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-sky-50/70 dark:bg-[#1a1713] border border-sky-200/80 dark:border-[#383127]">
              <span className="text-slate-700 dark:text-[#d4c5a9] font-medium text-[11px]">
                Want to try this feature immediately?
              </span>
              <button
                onClick={() => {
                  onNavigateTab(step.actionSuggestion!.tab);
                  onClose();
                }}
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 dark:bg-[#dfd5bf] dark:text-[#080706] hover:dark:bg-[#e8dec8] text-white font-semibold font-mono text-[11px] transition flex items-center gap-1"
              >
                <span>{step.actionSuggestion.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-[#25201a] bg-slate-50/50 dark:bg-[#161411] flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-500 dark:text-[#8f8270]">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 dark:border-[#383127] text-sky-600 dark:text-[#dfd5bf] focus:ring-0"
            />
            <span>Don&apos;t show automatically on startup</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-[#a89f8d] hover:bg-slate-100 dark:hover:bg-[#1f1b16] font-mono text-xs transition"
            >
              Skip Tutorial
            </button>

            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1f1b16] border border-slate-300 dark:border-[#383127] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs transition flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-[#25201a]"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold font-mono text-xs transition flex items-center gap-1 shadow-sm"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
