'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Building2,
  User,
  Smartphone,
  Wallet,
  Landmark,
  MapPin,
  Ship,
  Calendar,
  ExternalLink,
  Share2,
  FileText,
  Briefcase,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Entity, Relationship, Case } from '@/types/intelligence';

interface EntityDrawerProps {
  entity: Entity | null;
  onClose: () => void;
  relationships: Relationship[];
  cases: Case[];
  onSelectEntity: (id: string) => void;
  onNavigateToGraph: (id: string) => void;
}

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  entity,
  onClose,
  relationships,
  cases,
  onSelectEntity,
  onNavigateToGraph,
}) => {
  if (!entity) return null;

  // Filter connected relationships
  const connectedRels = relationships.filter(
    (r) => r.source === entity.id || r.target === entity.id
  );

  // Filter linked cases
  const linkedCases = cases.filter((c) =>
    entity.caseIds?.includes(c.id) || c.targetEntities?.includes(entity.id)
  );

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <User className="w-4 h-4 text-cyan-bright" />;
      case 'corporation': return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'crypto_wallet': return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'burner_phone': return <Smartphone className="w-4 h-4 text-pink-400" />;
      case 'bank_account': return <Landmark className="w-4 h-4 text-emerald-400" />;
      case 'location': return <MapPin className="w-4 h-4 text-purple-400" />;
      case 'vessel': return <Ship className="w-4 h-4 text-cyan" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#100f0d] border-l border-slate-200 dark:border-[#2f2a23] z-50 shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-250 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-[#2f2a23] sticky top-0 bg-white/95 dark:bg-[#100f0d]/95 backdrop-blur-md z-10 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#161412] border border-slate-200 dark:border-[#2f2a23] flex items-center justify-center shrink-0">
            {getEntityIcon(entity.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-[#1f1b16] border border-cyan-300 dark:border-[#42392e] text-cyan-700 dark:text-[#dfd5bf] font-semibold">
                {entity.id}
              </span>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161412] text-slate-600 dark:text-[#d4c5a9] border dark:border-[#2f2a23] font-semibold">
                {entity.type.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">{entity.name}</h2>
            <div className="text-xs text-slate-500 dark:text-[#8f8270] mt-0.5 flex items-center gap-2">
              <span>{entity.role}</span>
              <span>•</span>
              <span>{entity.jurisdiction}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1f1b16] hover:bg-slate-200 dark:hover:bg-[#25201a] text-slate-500 dark:text-[#dfd5bf] border dark:border-[#383127] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Risk & Verification Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#14120f] border border-slate-200 dark:border-[#25201a] shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8f8270] uppercase tracking-wider block">
              Risk Level &amp; Score
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold font-mono text-red-500 dark:text-[#c27d78] capitalize">
                {entity.riskLevel}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-[#201413] border border-red-300 dark:border-[#c27d78]/30 text-red-700 dark:text-[#c27d78]">
                {entity.metrics.riskScore} / 100
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#14120f] border border-slate-200 dark:border-[#25201a] shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8f8270] uppercase tracking-wider block">
              Intelligence Status
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold font-mono text-cyan-600 dark:text-[#dfd5bf] capitalize">
                {entity.verificationStatus}
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-[#7a9a83] flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Admiralty {entity.provenance.admiraltyCode}
              </span>
            </div>
          </div>
        </div>

        {/* Graph Quick Action */}
        <button
          onClick={() => {
            onClose();
            onNavigateToGraph(entity.id);
          }}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Share2 className="w-4 h-4" /> Focus and Expand in Network Graph
        </button>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-slate-500 dark:text-[#8f8270] font-semibold tracking-wider">
            Investigative Intelligence Dossier
          </h3>
          <p className="text-xs text-slate-700 dark:text-[#cfc1ab] leading-relaxed bg-slate-50 dark:bg-[#14120f] p-3.5 rounded-xl border border-slate-200 dark:border-[#25201a]">
            {entity.summary}
          </p>
        </div>

        {/* Identification & Provenance */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-slate-500 dark:text-[#8f8270] font-semibold tracking-wider">
            Identifiers &amp; Provenance
          </h3>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#14120f] border border-slate-200 dark:border-[#25201a] text-xs font-mono space-y-2">
            {entity.identification.passport && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#8f8270]">Passport / ID:</span>
                <span className="text-slate-800 dark:text-[#dfd5bf] font-medium">{entity.identification.passport}</span>
              </div>
            )}
            {entity.identification.walletAddress && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#8f8270]">Crypto Wallet:</span>
                <span className="text-amber-600 dark:text-[#d4af37] truncate max-w-[220px] font-medium">
                  {entity.identification.walletAddress}
                </span>
              </div>
            )}
            {entity.identification.iban && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#8f8270]">IBAN / Account:</span>
                <span className="text-slate-800 dark:text-[#dfd5bf] font-medium">{entity.identification.iban}</span>
              </div>
            )}
            {entity.identification.imei && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#8f8270]">IMEI:</span>
                <span className="text-slate-800 dark:text-[#dfd5bf] font-medium">{entity.identification.imei}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-[#25201a] text-slate-600 dark:text-[#8f8270]">
              <span>Source Doc:</span>
              <span className="text-slate-800 dark:text-[#dfd5bf] font-medium">{entity.provenance.sourceDocument}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-[#8f8270]">
              <span>Collecting Agency:</span>
              <span className="text-slate-800 dark:text-[#dfd5bf] font-medium">{entity.provenance.collectorAgency}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-[#8f8270]">
              <span>First / Last Seen:</span>
              <span className="text-cyan-600 dark:text-[#dfd5bf] font-semibold">{entity.firstSeen} → {entity.lastSeen}</span>
            </div>
          </div>
        </div>

        {/* Known Relationships */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-slate-500 dark:text-[#8f8270] font-semibold tracking-wider">
              Connected Relationships ({connectedRels.length})
            </h3>
          </div>

          <div className="space-y-2">
            {connectedRels.map((rel) => {
              const otherId = rel.source === entity.id ? rel.target : rel.source;
              const isOutgoing = rel.source === entity.id;

              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectEntity(otherId)}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-[#14120f] border border-slate-200 dark:border-[#25201a] hover:border-cyan-500/50 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition flex items-center justify-between group shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-[#8f8270] font-mono text-[10px]">
                        {isOutgoing ? 'OUTGOING →' : '← INCOMING'}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-[#dfd5bf] group-hover:text-cyan-600 dark:group-hover:text-[#f4ede1] transition">
                        {otherId}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1a1714] text-slate-600 dark:text-[#d4c5a9] border dark:border-[#2f2a23] capitalize">
                        {rel.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-[#8f8270] mt-1">{rel.description}</div>
                  </div>

                  {rel.amountUSD && (
                    <span className="text-xs font-mono text-amber-600 dark:text-[#d4af37] font-bold">
                      ${(rel.amountUSD / 1000).toLocaleString()}k
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Linked Investigations */}
        {linkedCases.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-slate-500 dark:text-[#8f8270] font-semibold tracking-wider">
              Linked Taskforce Cases ({linkedCases.length})
            </h3>
            <div className="space-y-2">
              {linkedCases.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-[#14120f] border border-slate-200 dark:border-[#25201a] text-xs space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-cyan-600 dark:text-[#dfd5bf] font-bold">{c.codeName}</span>
                    <span className="text-[10px] uppercase text-purple-600 dark:text-[#c5b497] font-semibold">{c.priority}</span>
                  </div>
                  <div className="text-slate-800 dark:text-[#cfc1ab] font-medium">{c.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
