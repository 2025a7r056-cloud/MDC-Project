'use client';

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  User,
  Clock,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { AuditLogEntry } from '@/types/intelligence';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (selectedRole !== 'all' && log.userRole !== selectedRole) return false;
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.user.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#231f1a] pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-800 dark:text-[#dfd5bf] uppercase tracking-wider font-semibold">
            <Lock className="w-4 h-4 text-amber-700 dark:text-[#dfd5bf]" /> Cryptographic Integrity &amp; Chain of Custody
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">Forensic Audit Log Trail</h2>
          <p className="text-xs text-slate-600 dark:text-[#8f8270] mt-1">
            Immutable non-repudiation event ledger logging queries, dossier accesses, status alterations, and evidence modifications.
          </p>
        </div>

        {/* Audit Status Badge */}
        <div className="bg-slate-50 dark:bg-[#100f0d] p-2.5 rounded-lg border border-slate-200 dark:border-[#231f1a] text-xs font-mono text-slate-700 dark:text-[#dfd5bf] flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Hashing Engine: SHA-256 Merkle Provenance Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#14120f] p-4 rounded-xl border border-slate-200 dark:border-[#231f1a] shadow-sm backdrop-blur-md">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by investigator, action, dossier target, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0c0b09] border border-slate-300 dark:border-[#231f1a] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] placeholder-slate-400 dark:placeholder-[#8f8270] focus:outline-none focus:border-[#dfd5bf] font-mono"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 dark:bg-[#0c0b09] border border-slate-300 dark:border-[#231f1a] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#dfd5bf] font-mono focus:outline-none focus:border-[#dfd5bf]"
          >
            <option value="all">All Roles</option>
            <option value="Lead Investigator">Lead Investigator</option>
            <option value="Analyst">Forensic Analyst</option>
            <option value="Field Agent">Field Agent</option>
            <option value="Forensic Auditor">Forensic Auditor</option>
            <option value="Admin">Administrator</option>
          </select>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-50 dark:bg-[#0c0b09] border border-slate-300 dark:border-[#231f1a] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#dfd5bf] font-mono focus:outline-none focus:border-[#dfd5bf]"
          >
            <option value="all">All Actions</option>
            <option value="QUERY_GRAPH">QUERY_GRAPH</option>
            <option value="VIEW_DOSSIER">VIEW_DOSSIER</option>
            <option value="VERIFY_EVIDENCE">VERIFY_EVIDENCE</option>
            <option value="EXPORT_REPORT">EXPORT_REPORT</option>
            <option value="AI_REASONING_PROMPT">AI_REASONING_PROMPT</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl glass-panel overflow-hidden border border-slate-200 dark:border-[#231f1a] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#231f1a] bg-slate-50 dark:bg-[#100f0d] text-[11px] uppercase text-slate-500 dark:text-[#8f8270] tracking-wider">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Authorized User &amp; Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Ref</th>
                <th className="py-3 px-4">Event Narrative</th>
                <th className="py-3 px-4 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#231f1a]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-100/70 dark:hover:bg-[#181512] transition">
                  <td className="py-3 px-4 font-bold text-amber-800 dark:text-[#dfd5bf]">{log.id}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-[#8f8270]">{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900 dark:text-[#f4ede1] font-bold">{log.user}</div>
                    <div className="text-[10px] text-amber-800 dark:text-[#dfd5bf]">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        log.action === 'EXPORT_REPORT'
                          ? 'bg-red-100 dark:bg-[#201010] text-red-700 dark:text-[#e09090] border border-red-300 dark:border-[#4d2424]'
                          : log.action === 'VERIFY_EVIDENCE'
                          ? 'bg-emerald-100 dark:bg-[#121f15] text-emerald-700 dark:text-[#a0c4ab] border border-emerald-300 dark:border-[#304535]'
                          : 'bg-slate-100 dark:bg-[#100f0d] text-slate-700 dark:text-[#dfd5bf] border border-slate-300 dark:border-[#231f1a]'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-amber-800 dark:text-[#dfd5bf] font-bold">
                    {log.targetId || '—'}
                  </td>
                  <td className="py-3 px-4 font-sans text-xs text-slate-700 dark:text-[#d4c5a9] max-w-sm">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right text-[10px] text-slate-400 dark:text-[#736b5d] font-mono">
                    {log.ipHash.slice(0, 12)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
