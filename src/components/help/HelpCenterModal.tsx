'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Share2,
  BrainCircuit,
  Command,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTutorial: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  onLaunchTutorial,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'legend' | 'faq' | 'shortcuts'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#12100e] border border-slate-200 dark:border-[#2e2820] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#25201a] flex items-center justify-between bg-slate-50/50 dark:bg-[#161411]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-[#221c15] border border-sky-300 dark:border-[#42392e] flex items-center justify-center text-sky-700 dark:text-[#dfd5bf]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#f4ede1]">
                CrimeGraph AI Help Center &amp; Reference Guide
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-[#8f8270] font-mono">
                Guidance for investigators, students, and analysts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#25201a] px-5 bg-slate-50/30 dark:bg-[#14120f] text-xs font-mono">
          {[
            { id: 'quickstart', label: 'Quick Start' },
            { id: 'legend', label: 'Visual Legend' },
            { id: 'faq', label: 'Investigative FAQ' },
            { id: 'shortcuts', label: 'Shortcuts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-medium transition ${
                activeTab === tab.id
                  ? 'border-sky-600 dark:border-[#dfd5bf] text-sky-700 dark:text-[#dfd5bf]'
                  : 'border-transparent text-slate-500 dark:text-[#8f8270] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-[#181512] border border-sky-200 dark:border-[#383127] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-[#f4ede1] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-[#dfd5bf]" />
                    Interactive Onboarding Tutorial
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      onLaunchTutorial();
                    }}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold font-mono text-xs transition flex items-center gap-1"
                  >
                    <span>Show Tutorial Again</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 dark:text-[#b8ad99] text-xs leading-relaxed">
                  Take a 6-step guided walkthrough explaining entities, relationships, graph navigation, AML transaction tracing, and AI findings.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-[#8f8270] tracking-wider">
                  Recommended Workflow for Beginners
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => {
                      onClose();
                      onNavigateTab('network');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] hover:border-sky-300 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition"
                  >
                    <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center justify-between">
                      <span>1. Explore Network</span>
                      <Share2 className="w-4 h-4 text-sky-600 dark:text-[#dfd5bf]" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8f8270] mt-1">
                      Click any entity node to inspect connections, view first/last seen dates, and run shortest path tracing.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      onClose();
                      onNavigateTab('transactions');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] hover:border-amber-300 dark:hover:border-[#d4af37]/40 cursor-pointer transition"
                  >
                    <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center justify-between">
                      <span>2. Trace Transactions</span>
                      <ChevronRight className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8f8270] mt-1">
                      Pick a source and destination account to uncover multi-hop fund routing and structured smurfing patterns.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      onClose();
                      onNavigateTab('ai');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] hover:border-indigo-300 dark:hover:border-[#c5b497]/40 cursor-pointer transition"
                  >
                    <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center justify-between">
                      <span>3. AI Graph Reasoner</span>
                      <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-[#c5b497]" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8f8270] mt-1">
                      Examine Betweenness Centrality, PageRank, and community clusters to identify covert broker nodes.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      onClose();
                      onNavigateTab('cases');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] hover:border-blue-300 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition"
                  >
                    <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center justify-between">
                      <span>4. Case Management</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#7a9a83]" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8f8270] mt-1">
                      Attach targets to operational case files, follow evidence timelines, and track grand jury indictment readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legend' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-[#8f8270] tracking-wider">
                  Entity Node Types &amp; Visual Shapes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { type: 'Person', shape: 'Ellipse', desc: 'Suspect, broker, straw man, or front nominee', color: 'bg-[#c5b497]' },
                    { type: 'Corporation', shape: 'Round Rectangle', desc: 'Shell LLC, holding entity, or commercial front', color: 'bg-[#8f8270]' },
                    { type: 'Bank Account', shape: 'Diamond', desc: 'Correspondent clearing or offshore depository account', color: 'bg-[#6b8a75]' },
                    { type: 'Crypto Wallet', shape: 'Hexagon', desc: 'Mixer contract, peeling chain, or darknet escrow address', color: 'bg-[#c79d5e]' },
                    { type: 'Burner Phone', shape: 'Barrel / Rounded', desc: 'Disposable encrypted communication device or IMEI', color: 'bg-[#b86b65]' },
                    { type: 'Vessel / Maritime', shape: 'Pentagon', desc: 'Cargo carrier, container ship, or contraband conduit', color: 'bg-[#6d8a94]' },
                    { type: 'Location', shape: 'Triangle', desc: 'Port terminal, safehouse, or jurisdiction boundary', color: 'bg-[#937896]' },
                  ].map((item) => (
                    <div key={item.type} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] flex items-start gap-2.5">
                      <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${item.color}`}></span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-[#f4ede1]">{item.type} <span className="font-normal text-slate-400 font-mono text-[10px]">({item.shape})</span></div>
                        <div className="text-slate-500 dark:text-[#8f8270] text-[10px]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#25201a]">
                <h4 className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-[#8f8270] tracking-wider">
                  Relationship Edge Line Styles
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a]">
                    <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-emerald-500"></span> Verified Fact (A1/B2)
                    </div>
                    <div className="text-slate-500 dark:text-[#8f8270] text-[10px] mt-0.5">
                      Subpoenaed bank wire, notary deed, or lawful wiretap transcript.
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a]">
                    <div className="font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center gap-2">
                      <span className="w-6 border-b-2 border-dashed border-amber-500"></span> Inferred / Predicted
                    </div>
                    <div className="text-slate-500 dark:text-[#8f8270] text-[10px] mt-0.5">
                      Analytical link prediction based on Jaccard triadic closure (unverified).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              {[
                {
                  q: 'What is an Admiralty Intelligence Code (e.g. A1, B2, C3)?',
                  a: 'The Admiralty System (or NATO intelligence evaluation rating) rates reliability of the source (A: Completely Reliable to F: Cannot Be Judged) and credibility of the information (1: Confirmed by other sources to 6: Cannot Be Judged). A1 means a completely reliable verified fact; C3 represents an unconfirmed analytical lead.',
                },
                {
                  q: 'Why does Betweenness Centrality matter more than Degree in crime syndicates?',
                  a: 'High-ranking criminals avoid having many direct connections to reduce exposure. Degree only counts direct connections. Betweenness measures how often a node falls on the shortest path between all other pairs, uncovering the shadow brokers and money laundering gateways holding the network together.',
                },
                {
                  q: 'Does a flagged transaction mean the account holder is guilty?',
                  a: 'No. Flagged transactions reflect automated rule triggers (such as single transfers over $1M or structured smurfing). Under legal intelligence standards, flagged transactions serve as investigative leads requiring human corroboration, subpoenas, and court orders.',
                },
                {
                  q: 'Is my data stored securely or sent to external servers?',
                  a: 'This demonstration runs locally within your browser session memory. No private banking data or live law-enforcement records are accessed. Fictional synthetic scenarios are used for academic and demonstration rigor.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-[#f4ede1]">{item.q}</div>
                  <div className="text-slate-600 dark:text-[#cfc1ab] leading-relaxed text-[11px]">{item.a}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-2.5">
              <h4 className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-[#8f8270] tracking-wider">
                Keyboard Shortcuts &amp; Canvas Navigation
              </h4>

              <div className="space-y-1.5 font-mono text-[11px]">
                {[
                  { key: 'Ctrl + K  /  ⌘ + K', desc: 'Toggle AI Investigation Assistant modal' },
                  { key: 'Mouse Wheel / Pinch', desc: 'Zoom in and zoom out of graph canvas' },
                  { key: 'Click + Drag Background', desc: 'Pan around the criminal network graph' },
                  { key: 'Click Node', desc: 'Select entity, highlight neighbors, and open dossier drawer' },
                  { key: 'Click Edge', desc: 'Inspect relationship details, wire amounts, and provenance' },
                  { key: 'Escape', desc: 'Close any open drawer, modal, or inspector' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161411] border border-slate-200 dark:border-[#25201a] flex items-center justify-between">
                    <span className="text-slate-600 dark:text-[#cfc1ab]">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-[#201c17] border border-slate-300 dark:border-[#42392e] text-slate-800 dark:text-[#dfd5bf] font-bold text-[10px]">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#25201a] bg-slate-50/50 dark:bg-[#161411] flex items-center justify-between">
          <div className="text-[10px] text-slate-400 font-mono">
            CrimeGraph AI • Authorized Investigative Decision Support Prototype
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1f1b16] hover:dark:bg-[#28221b] border border-slate-300 dark:border-[#42392e] text-slate-800 dark:text-[#dfd5bf] font-mono text-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
