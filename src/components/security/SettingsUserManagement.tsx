'use client';

import React, { useState } from 'react';
import {
  Settings,
  Users,
  ShieldCheck,
  Key,
  Server,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Lock,
  Radio,
  Sparkles,
  Info,
} from 'lucide-react';

interface SettingsUserManagementProps {
  currentRole: 'Admin' | 'Lead Investigator' | 'Forensic Analyst' | 'Field Agent';
  onRoleChange: (role: 'Admin' | 'Lead Investigator' | 'Forensic Analyst' | 'Field Agent') => void;
  isBackendConnected: boolean;
  onToggleDemoMode: () => void;
}

export const SettingsUserManagement: React.FC<SettingsUserManagementProps> = ({
  currentRole,
  onRoleChange,
  isBackendConnected,
  onToggleDemoMode,
}) => {
  const [apiKey, setApiKey] = useState('sk-ant-live-demo-synthetic-key');
  const [fastApiEndpoint, setFastApiEndpoint] = useState('http://localhost:8000');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const users = [
    {
      id: 'USR-01',
      name: 'Special Agent S. Chen',
      email: 's.chen@fincen.treas.gov',
      role: 'Lead Investigator',
      clearance: 'TOP SECRET // SI-TK',
      agency: 'FinCEN Joint Illicit Finance Task Force',
      status: 'Active',
    },
    {
      id: 'USR-02',
      name: 'Marcus Davies',
      email: 'm.davies@interpol.int',
      role: 'Forensic Analyst',
      clearance: 'SECRET // NOFORN',
      agency: 'Interpol Cyber Directorate',
      status: 'Active',
    },
    {
      id: 'USR-03',
      name: 'Inspector R. Kowalski',
      email: 'r.kowalski@europol.europa.eu',
      role: 'Field Agent',
      clearance: 'CONFIDENTIAL // LES',
      agency: 'Europol Financial Crimes Unit',
      status: 'Active',
    },
    {
      id: 'USR-04',
      name: 'Director Eleanor Vance',
      email: 'admin.vance@justice.gov',
      role: 'Admin',
      clearance: 'TOP SECRET // NOFORN',
      agency: 'Department of Justice Special Operations',
      status: 'Active',
    },
  ];

  const permissions = [
    { permission: 'View Classified Network Graphs', admin: true, lead: true, analyst: true, agent: true },
    { permission: 'Execute Centrality & Community Graph ML', admin: true, lead: true, analyst: true, agent: false },
    { permission: 'Create & Modify Investigation Taskforces', admin: true, lead: true, analyst: false, agent: false },
    { permission: 'Approve & Indict Target Subpoenas', admin: true, lead: true, analyst: false, agent: false },
    { permission: 'Ingest Raw External CSV/JSON Data Feeds', admin: true, lead: true, analyst: true, agent: false },
    { permission: 'Manage Analytical Roles & Access Permissions', admin: true, lead: false, analyst: false, agent: false },
    { permission: 'Export Legal Evidence Packets (Courtroom Certified)', admin: true, lead: true, analyst: false, agent: false },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#231f1a] pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-800 dark:text-[#dfd5bf] uppercase tracking-wider font-semibold">
            <Settings className="w-4 h-4 text-amber-700 dark:text-[#dfd5bf]" /> Access Governance &amp; Configuration
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">
            System Settings &amp; Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#8f8270] mt-1">
            Configure system endpoints, review authorized personnel clearances, and manage cryptographic API keys.
          </p>
        </div>

        {/* Current Active Role Pill */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#231f1a] text-xs font-mono">
          <span className="text-slate-500 dark:text-[#8f8270]">Current Session Role:</span>
          <span className="text-amber-900 dark:text-[#dfd5bf] font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-[#1f1b16] border border-amber-200 dark:border-[#383127]">
            {currentRole}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Backend & AI Engine Settings */}
        <div className="space-y-6">
          {/* Server Engine Configuration */}
          <div className="p-5 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#231f1a]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1] font-mono flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-700 dark:text-[#dfd5bf]" /> Backend Service Connection
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-[#8f8270] font-mono mb-1">FastAPI Backend Endpoint</label>
                <input
                  type="text"
                  value={fastApiEndpoint}
                  onChange={(e) => setFastApiEndpoint(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c0b09] border border-slate-300 dark:border-[#231f1a] rounded-lg px-3 py-1.5 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-[#dfd5bf] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-[#8f8270] font-mono mb-1">AI Service API Key (Optional)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c0b09] border border-slate-300 dark:border-[#231f1a] rounded-lg px-3 py-1.5 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-[#dfd5bf] focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-[#8f8270] font-mono mt-1 block">
                  When empty, local rule-based graph reasoning engine is automatically engaged.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-[#231f1a]">
                <button
                  type="button"
                  onClick={onToggleDemoMode}
                  className="text-xs font-mono text-amber-800 dark:text-[#dfd5bf] hover:underline flex items-center gap-1"
                >
                  <Radio className="w-3 h-3" />
                  {isBackendConnected ? 'Switch to Local Analytics' : 'Connect to FastAPI'}
                </button>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-[#dfd5bf] dark:text-[#080706] dark:hover:bg-[#e8dec8] font-bold font-mono transition"
                >
                  Save Configuration
                </button>
              </div>

              {saveSuccess && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configuration updated successfully.
                </div>
              )}
            </form>
          </div>

          {/* Responsible AI Guidelines Card */}
          <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#231f1a]">
            <h3 className="text-xs font-mono uppercase text-amber-800 dark:text-[#dfd5bf] font-semibold tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Responsible AI Principles
            </h3>
            <ul className="text-xs text-slate-600 dark:text-[#d4c5a9] space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-700 dark:text-[#dfd5bf] font-bold">•</span>
                <span><strong>No Automatic Guilt:</strong> Network presence does not establish criminal complicity.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-700 dark:text-[#dfd5bf] font-bold">•</span>
                <span><strong>Observed vs Predicted:</strong> Real evidence is strictly isolated from AI-predicted link hypotheses.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-700 dark:text-[#dfd5bf] font-bold">•</span>
                <span><strong>Human-in-the-Loop:</strong> All intelligence recommendations require human investigator review before action.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: User Clearances & RBAC Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Accounts Table */}
          <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#231f1a]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700 dark:text-[#dfd5bf]" /> Authorized Taskforce Personnel
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">4 Active Operatives</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#231f1a] bg-slate-50 dark:bg-[#100f0d] text-[10px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">
                    <th className="py-2.5 px-3">Investigator</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Clearance</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3 text-right">Switch Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#231f1a] font-mono">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#181512] transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-[#f4ede1]">{u.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#8f8270]">{u.email}</div>
                      </td>
                      <td className="py-2.5 px-3 text-amber-800 dark:text-[#dfd5bf] font-bold">{u.role}</td>
                      <td className="py-2.5 px-3 text-red-600 dark:text-red-400 text-[10px]">{u.clearance}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-[#8f8270] text-[11px]">{u.agency}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onRoleChange(u.role as any)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            currentRole === u.role
                              ? 'bg-cyan-600 text-white dark:bg-[#dfd5bf] dark:text-[#080706]'
                              : 'bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#1f1b16] dark:text-[#d4c5a9] dark:hover:text-[#f4ede1] dark:border dark:border-[#2f2a23]'
                          }`}
                        >
                          {currentRole === u.role ? 'Active' : 'Assume Role'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RBAC Permissions Matrix */}
          <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#231f1a]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f4ede1] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Role-Based Access Control Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#231f1a] bg-slate-50 dark:bg-[#100f0d] text-[10px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">
                    <th className="py-2.5 px-3">System Capability</th>
                    <th className="py-2.5 px-2 text-center">Admin</th>
                    <th className="py-2.5 px-2 text-center">Lead Inv</th>
                    <th className="py-2.5 px-2 text-center">Analyst</th>
                    <th className="py-2.5 px-2 text-center">Field Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#231f1a] font-mono text-[11px]">
                  {permissions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#181512]">
                      <td className="py-2 px-3 text-slate-700 dark:text-[#d4c5a9] font-sans">{p.permission}</td>
                      <td className="py-2 px-2 text-center">
                        {p.admin ? <span className="text-emerald-500 dark:text-emerald-400">✓</span> : <span className="text-slate-300 dark:text-[#383127]">✕</span>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {p.lead ? <span className="text-emerald-500 dark:text-emerald-400">✓</span> : <span className="text-slate-300 dark:text-[#383127]">✕</span>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {p.analyst ? <span className="text-emerald-500 dark:text-emerald-400">✓</span> : <span className="text-slate-300 dark:text-[#383127]">✕</span>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {p.agent ? <span className="text-emerald-500 dark:text-emerald-400">✓</span> : <span className="text-slate-300 dark:text-[#383127]">✕</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
