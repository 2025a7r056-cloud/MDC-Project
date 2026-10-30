'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  FileText,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  Edit3,
  Calendar,
  Lock,
  Check,
  X,
  ListTodo,
} from 'lucide-react';
import { Case, Entity, TimelineEvent, CaseTask } from '@/types/intelligence';

interface CaseManagementProps {
  cases: Case[];
  entities: Entity[];
  timelineEvents: TimelineEvent[];
  onSelectEntity: (id: string) => void;
  onNavigateToGraph: (id?: string) => void;
  onCreateCase: (newCase: Case) => void;
  onUpdateCase: (updatedCase: Case) => void;
}

export const CaseManagement: React.FC<CaseManagementProps> = ({
  cases,
  entities,
  timelineEvents,
  onSelectEntity,
  onNavigateToGraph,
  onCreateCase,
  onUpdateCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Active Case
  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Create Form State
  const [createFormData, setCreateFormData] = useState({
    codeName: '',
    title: '',
    status: 'open' as Case['status'],
    classification: 'CONFIDENTIAL // LES' as Case['classification'],
    priority: 'high' as Case['priority'],
    leadInvestigator: 'Special Agent S. Chen',
    assignedAgency: 'FinCEN Joint Illicit Finance Task Force',
    summary: '',
    totalLaunderedUSD: 10000000,
    targetEntities: ['ENT-001', 'ENT-003'],
    notesText: '',
    tasksText: '',
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState<{
    id: string;
    codeName: string;
    title: string;
    status: Case['status'];
    classification: Case['classification'];
    priority: Case['priority'];
    leadInvestigator: string;
    assignedAgency: string;
    summary: string;
    totalLaunderedUSD: number;
    targetEntities: string[];
    notesText: string;
    tasksText: string;
  } | null>(null);

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.codeName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.leadInvestigator.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Target entities linked to active case
  const targetEntities = entities.filter(
    (e) => activeCase?.targetEntities?.includes(e.id)
  );

  // Form Validator
  const validateForm = (data: { codeName: string; title: string; summary: string; leadInvestigator: string }) => {
    const errors: Record<string, string> = {};
    if (!data.codeName || data.codeName.trim().length < 3) {
      errors.codeName = 'Code name is required (e.g., OPERATION CERBERUS, at least 3 chars)';
    }
    if (!data.title || data.title.trim().length < 4) {
      errors.title = 'Case title is required (minimum 4 characters)';
    }
    if (!data.summary || data.summary.trim().length < 10) {
      errors.summary = 'Summary briefing is required (minimum 10 characters)';
    }
    if (!data.leadInvestigator || data.leadInvestigator.trim().length < 3) {
      errors.leadInvestigator = 'Assigned lead investigator is required';
    }
    return errors;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(createFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const notes = createFormData.notesText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    const tasks: CaseTask[] = createFormData.tasksText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((taskTitle, idx) => ({
        id: `TSK-NEW-${idx + 1}`,
        title: taskTitle,
        completed: false,
        assignedTo: createFormData.leadInvestigator,
        priority: createFormData.priority,
      }));

    const newCase: Case = {
      id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      codeName: createFormData.codeName.toUpperCase(),
      title: createFormData.title,
      status: createFormData.status,
      classification: createFormData.classification,
      priority: createFormData.priority,
      leadInvestigator: createFormData.leadInvestigator,
      assignedAgency: createFormData.assignedAgency,
      dateOpened: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      targetEntities: createFormData.targetEntities.length > 0 ? createFormData.targetEntities : ['ENT-001'],
      summary: createFormData.summary,
      totalLaunderedUSD: createFormData.totalLaunderedUSD,
      evidenceItemsCount: 1,
      hypothesesCount: 1,
      tags: ['Illicit Finance', 'Network Analysis'],
      notes: notes.length > 0 ? notes : [`Initial case registration by ${createFormData.leadInvestigator}.`],
      followUpTasks: tasks.length > 0 ? tasks : [
        { id: 'TSK-01', title: 'Issue formal subpoena for target corporate records', completed: false, assignedTo: createFormData.leadInvestigator, priority: 'high' }
      ],
    };

    onCreateCase(newCase);
    setSelectedCaseId(newCase.id);
    setShowCreateModal(false);
    setFormErrors({});
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    const errors = validateForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const notes = editFormData.notesText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    const existingTasks = activeCase?.followUpTasks || [];
    const newTasks: CaseTask[] = editFormData.tasksText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((taskTitle, idx) => {
        const found = existingTasks.find((et) => et.title === taskTitle);
        return (
          found || {
            id: `TSK-ED-${idx + 1}`,
            title: taskTitle,
            completed: false,
            assignedTo: editFormData.leadInvestigator,
            priority: editFormData.priority,
          }
        );
      });

    const updated: Case = {
      ...activeCase,
      codeName: editFormData.codeName.toUpperCase(),
      title: editFormData.title,
      status: editFormData.status,
      classification: editFormData.classification,
      priority: editFormData.priority,
      leadInvestigator: editFormData.leadInvestigator,
      assignedAgency: editFormData.assignedAgency,
      summary: editFormData.summary,
      totalLaunderedUSD: editFormData.totalLaunderedUSD,
      targetEntities: editFormData.targetEntities,
      notes: notes,
      followUpTasks: newTasks,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onUpdateCase(updated);
    setShowEditModal(false);
    setFormErrors({});
  };

  const handleToggleTask = (taskId: string) => {
    if (!activeCase) return;
    const updatedTasks = (activeCase.followUpTasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updated = {
      ...activeCase,
      followUpTasks: updatedTasks,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onUpdateCase(updated);
  };

  const toggleEntityInList = (
    currentList: string[],
    entityId: string,
    setList: (newList: string[]) => void
  ) => {
    if (currentList.includes(entityId)) {
      setList(currentList.filter((id) => id !== entityId));
    } else {
      setList([...currentList, entityId]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-blue-600 dark:text-[#dfd5bf] uppercase tracking-wider font-semibold">
            <Briefcase className="w-4 h-4 text-blue-500 dark:text-[#dfd5bf]" /> Cases
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">
            Cases ({cases.length})
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1">
            Manage active investigation files, evidence, and operational tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setFormErrors({});
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Selector & List */}
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#8f8270] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search cases, lead agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] placeholder-slate-400 dark:placeholder-[#8f8270] focus:outline-none focus:border-cyan dark:focus:border-[#dfd5bf] font-mono"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[11px] font-mono pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'open', label: 'Open' },
                { id: 'active_investigation', label: 'Active' },
                { id: 'under_review', label: 'Under Review' },
                { id: 'pending_evidence', label: 'Pending Evidence' },
                { id: 'indictment_ready', label: 'Indictment' },
                { id: 'closed', label: 'Closed' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded capitalize whitespace-nowrap transition ${
                    statusFilter === st.id
                      ? 'bg-white dark:bg-[#1f1b16] text-sky-700 dark:text-[#dfd5bf] border border-slate-200 dark:border-[#42392e] font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-[#161412] border border-slate-200 dark:border-[#2f2a23] text-slate-600 dark:text-[#b8ad99] hover:text-slate-900 dark:hover:text-[#f4ede1]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === activeCase?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-xs space-y-2 shadow-xs ${
                    isSelected
                      ? 'bg-sky-50/70 dark:bg-[#1f1b16] border-sky-300 dark:border-[#dfd5bf]/40 shadow-xs'
                      : 'bg-white dark:bg-[#12100e] border-slate-200 dark:border-[#25201a] hover:border-slate-300 dark:hover:border-[#383127]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-600 dark:text-[#dfd5bf]">{c.codeName}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        c.priority === 'critical'
                          ? 'bg-red-100 dark:bg-[#201413] text-red-700 dark:text-[#c27d78] border border-red-300 dark:border-[#c27d78]/30'
                          : 'bg-amber-100 dark:bg-[#1f1b16] text-amber-700 dark:text-[#d4af37] border border-amber-300 dark:border-[#d4af37]/30'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-[#f4ede1]">{c.title}</h3>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8f8270] pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="capitalize">{c.status.replace(/_/g, ' ')}</span>
                    <span className="text-amber-600 dark:text-[#d4af37] font-bold">
                      ${(c.totalLaunderedUSD / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Case Detailed Dossier & Evidence Timeline */}
        {activeCase && (
          <div className="lg:col-span-2 space-y-5">
            {/* Case Dossier Banner */}
            <div className="p-6 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-100 dark:bg-[#1f1b16] border border-blue-300 dark:border-[#42392e] text-blue-700 dark:text-[#dfd5bf] font-bold">
                    {activeCase.id}
                  </span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-red-100 dark:bg-[#201413] border border-red-300 dark:border-[#c27d78]/30 text-red-700 dark:text-[#c27d78] flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3" /> {activeCase.classification}
                  </span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-sky-100 dark:bg-[#191612] text-sky-800 dark:text-[#dfd5bf] border border-sky-200 dark:border-[#383127] font-semibold">
                    Status: {activeCase.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-emerald-600 dark:text-[#7a9a83] flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Opened: {activeCase.dateOpened} (Updated: {activeCase.lastUpdated})
                  </span>

                  {/* Edit Case File Button */}
                  <button
                    onClick={() => {
                      setEditFormData({
                        id: activeCase.id,
                        codeName: activeCase.codeName,
                        title: activeCase.title,
                        status: activeCase.status,
                        classification: activeCase.classification,
                        priority: activeCase.priority,
                        leadInvestigator: activeCase.leadInvestigator,
                        assignedAgency: activeCase.assignedAgency,
                        summary: activeCase.summary,
                        totalLaunderedUSD: activeCase.totalLaunderedUSD,
                        targetEntities: activeCase.targetEntities || [],
                        notesText: (activeCase.notes || []).join('\n'),
                        tasksText: (activeCase.followUpTasks || []).map((t) => t.title).join('\n'),
                      });
                      setFormErrors({});
                      setShowEditModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1f1b16] hover:dark:bg-[#28221b] border border-slate-300 dark:border-[#42392e] text-slate-800 dark:text-[#dfd5bf] font-mono text-xs flex items-center gap-1.5 transition font-semibold"
                    title="Edit Case Details, Status, Entities, and Tasks"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Case File
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#f4ede1]">{activeCase.title}</h2>
                <div className="text-xs font-mono text-cyan-700 dark:text-[#dfd5bf] mt-1 font-semibold flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead: {activeCase.leadInvestigator}</span>
                  <span>•</span>
                  <span>{activeCase.assignedAgency}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-[#cfc1ab] mt-3 leading-relaxed bg-slate-50 dark:bg-[#100f0d] p-4 rounded-xl border border-slate-200 dark:border-[#25201a]">
                  {activeCase.summary}
                </p>
              </div>

              {/* Case Metrics Row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] text-center shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Total Laundered</span>
                  <div className="text-base font-bold font-mono text-amber-600 dark:text-[#d4af37] mt-0.5">
                    ${(activeCase.totalLaunderedUSD / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] text-center shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Target Entities</span>
                  <div className="text-base font-bold font-mono text-cyan-600 dark:text-[#dfd5bf] mt-0.5">
                    {activeCase.targetEntities?.length || 0} Nodes
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] text-center shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Evidence Items</span>
                  <div className="text-base font-bold font-mono text-purple-600 dark:text-[#c5b497] mt-0.5">
                    {activeCase.evidenceItemsCount} Exhibits
                  </div>
                </div>
              </div>
            </div>

            {/* Target Entities Subgraph */}
            <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-slate-700 dark:text-[#dfd5bf] font-semibold tracking-wider">
                  Attached Target Entities ({targetEntities.length})
                </h3>
                <button
                  onClick={() => onNavigateToGraph(targetEntities[0]?.id)}
                  className="text-xs text-cyan-600 dark:text-[#dfd5bf] hover:text-cyan-500 dark:hover:text-[#f4ede1] font-mono flex items-center gap-1 font-semibold"
                >
                  Explore Subgraph in Canvas <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {targetEntities.slice(0, 6).map((ent) => (
                  <div
                    key={ent.id}
                    onClick={() => onSelectEntity(ent.id)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] hover:border-cyan-500/50 dark:hover:border-[#dfd5bf]/40 cursor-pointer transition flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-[#f4ede1]">{ent.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-[#8f8270] font-mono">
                        {ent.id} • {ent.role}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        ent.riskLevel === 'critical'
                          ? 'bg-red-100 dark:bg-[#201413] text-red-700 dark:text-[#c27d78]'
                          : 'bg-amber-100 dark:bg-[#1f1b16] text-amber-700 dark:text-[#d4af37]'
                      }`}
                    >
                      {ent.metrics.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Follow-Up Tasks Checklist */}
            <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-slate-700 dark:text-[#dfd5bf] font-semibold tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-emerald-600 dark:text-[#7a9a83]" />
                  <span>Next Follow-Up Tasks</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#8f8270] lowercase">
                    ({activeCase.followUpTasks?.filter((t) => t.completed).length || 0}/{(activeCase.followUpTasks || []).length} completed)
                  </span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Click task to toggle status</span>
              </div>

              <div className="space-y-2">
                {(activeCase.followUpTasks || []).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] hover:border-slate-300 dark:hover:border-[#383127] cursor-pointer transition flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded border-slate-300 text-sky-600 focus:ring-0 dark:bg-[#191612] dark:border-[#383127] cursor-pointer"
                      />
                      <span
                        className={`font-medium ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-[#736a5c]'
                            : 'text-slate-800 dark:text-[#f4ede1]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-[#8f8270]">
                      <span>{task.assignedTo?.split(' (')[0]?.split(' ')?.[0] || 'Investigator'}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                          task.priority === 'critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-[#201413] dark:text-[#c27d78]'
                            : 'bg-slate-100 text-slate-700 dark:bg-[#1f1b16] dark:text-[#dfd5bf]'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}

                {(!activeCase.followUpTasks || activeCase.followUpTasks.length === 0) && (
                  <p className="text-xs text-slate-400 font-mono italic">No operational follow-up tasks currently assigned.</p>
                )}
              </div>
            </div>

            {/* Classified Investigator Notes */}
            <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
              <h3 className="text-xs font-mono uppercase text-slate-700 dark:text-[#dfd5bf] font-semibold tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Classified Investigation Notes ({activeCase.notes?.length || 0})</span>
              </h3>

              <div className="space-y-2">
                {(activeCase.notes || []).map((note, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] text-xs font-mono text-slate-700 dark:text-[#cfc1ab] flex items-start gap-2"
                  >
                    <span className="text-sky-600 dark:text-[#dfd5bf] font-bold shrink-0">•</span>
                    <span>{note}</span>
                  </div>
                ))}

                {(!activeCase.notes || activeCase.notes.length === 0) && (
                  <p className="text-xs text-slate-400 font-mono italic">No investigator notes recorded.</p>
                )}
              </div>
            </div>

            {/* Chronological Evidence Timeline */}
            <div className="p-5 rounded-xl glass-panel space-y-3 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
              <h3 className="text-xs font-mono uppercase text-slate-700 dark:text-[#dfd5bf] font-semibold tracking-wider">
                Chronological Investigation Timeline &amp; Evidence Exhibits
              </h3>

              <div className="relative pl-6 space-y-4 border-l border-slate-200 dark:border-slate-800 mt-2">
                {timelineEvents.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="relative group">
                    <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-[#dfd5bf] border-2 border-white dark:border-[#100f0d] group-hover:scale-125 transition"></span>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-cyan-600 dark:text-[#dfd5bf] font-bold">{evt.timestamp}</span>
                        <span className="text-slate-500 dark:text-[#8f8270]">{evt.location}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-[#f4ede1]">{evt.title}</h4>
                      <p className="text-slate-600 dark:text-[#cfc1ab] text-[11px]">{evt.description}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#8f8270]">
                        <span>Ref: {evt.evidenceRef}</span>
                        <span className="text-emerald-600 dark:text-[#7a9a83] font-semibold">Admiralty {evt.admiraltyCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Open New Case */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan dark:text-[#dfd5bf]" /> Register New Taskforce Case
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8f8270] font-mono mt-0.5">
                  Stored in memory for demonstration purposes.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* Code Name */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Operation Code Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. OPERATION CERBERUS SHIELD"
                  value={createFormData.codeName}
                  onChange={(e) => setCreateFormData({ ...createFormData, codeName: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                    formErrors.codeName ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                  } rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] uppercase font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none`}
                />
                {formErrors.codeName && <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.codeName}</span>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Investigation Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bulk Cash Layering & Offshore BVI Front Network"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                    formErrors.title ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                  } rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none`}
                />
                {formErrors.title && <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.title}</span>}
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">Status *</label>
                  <select
                    value={createFormData.status}
                    onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="active_investigation">Active Investigation</option>
                    <option value="under_review">Under Review</option>
                    <option value="pending_evidence">Pending Evidence</option>
                    <option value="indictment_ready">Indictment Ready</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">Priority *</label>
                  <select
                    value={createFormData.priority}
                    onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              {/* Assigned User & Classification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                    Assigned User / Lead Investigator *
                  </label>
                  <input
                    type="text"
                    value={createFormData.leadInvestigator}
                    onChange={(e) => setCreateFormData({ ...createFormData, leadInvestigator: e.target.value })}
                    className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                      formErrors.leadInvestigator ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                    } rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none`}
                  />
                  {formErrors.leadInvestigator && (
                    <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.leadInvestigator}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">Classification *</label>
                  <select
                    value={createFormData.classification}
                    onChange={(e) => setCreateFormData({ ...createFormData, classification: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none"
                  >
                    <option value="CONFIDENTIAL // LES">CONFIDENTIAL // LES</option>
                    <option value="SECRET // SI-TK">SECRET // SI-TK</option>
                    <option value="TOP SECRET // NOFORN">TOP SECRET // NOFORN</option>
                  </select>
                </div>
              </div>

              {/* Related Target Entities */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Related Target Entities (Click to attach/detach)
                </label>
                <div className="max-h-24 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex flex-wrap gap-1.5">
                  {entities.slice(0, 12).map((ent) => {
                    const isAttached = createFormData.targetEntities.includes(ent.id);
                    return (
                      <button
                        type="button"
                        key={ent.id}
                        onClick={() =>
                          toggleEntityInList(createFormData.targetEntities, ent.id, (newList) =>
                            setCreateFormData({ ...createFormData, targetEntities: newList })
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition flex items-center gap-1 ${
                          isAttached
                            ? 'bg-sky-600 text-white dark:bg-[#dfd5bf] dark:text-[#080706] font-bold'
                            : 'bg-slate-200 text-slate-700 dark:bg-[#1f1b16] dark:text-[#8f8270]'
                        }`}
                      >
                        {isAttached && <Check className="w-2.5 h-2.5" />}
                        <span>{ent.name.split(' (')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Summary Briefing *
                </label>
                <textarea
                  rows={2}
                  placeholder="State intelligence context, preliminary subpoenas, and jurisdictional nexus..."
                  value={createFormData.summary}
                  onChange={(e) => setCreateFormData({ ...createFormData, summary: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                    formErrors.summary ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                  } rounded-lg p-2.5 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none resize-none`}
                />
                {formErrors.summary && <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.summary}</span>}
              </div>

              {/* Follow-up Tasks */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Follow-Up Tasks (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Issue SWIFT transaction subpoenas&#10;Coordinate with maritime customs unit"
                  value={createFormData.tasksText}
                  onChange={(e) => setCreateFormData({ ...createFormData, tasksText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg p-2 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1f1b16] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#383127] font-mono hover:bg-slate-200 dark:hover:bg-[#25201a] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold font-mono shadow-sm"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Case */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan dark:text-[#dfd5bf]" /> Edit Taskforce Case: {editFormData.id}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8f8270] font-mono mt-0.5">
                  Update investigation status, classification, notes, and tasks.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              {/* Code Name */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Operation Code Name *
                </label>
                <input
                  type="text"
                  value={editFormData.codeName}
                  onChange={(e) => setEditFormData({ ...editFormData, codeName: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                    formErrors.codeName ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                  } rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] uppercase font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none`}
                />
                {formErrors.codeName && <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.codeName}</span>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Investigation Title *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                    formErrors.title ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                  } rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none`}
                />
                {formErrors.title && <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.title}</span>}
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="active_investigation">Active Investigation</option>
                    <option value="under_review">Under Review</option>
                    <option value="pending_evidence">Pending Evidence</option>
                    <option value="indictment_ready">Indictment Ready</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">Priority *</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              {/* Assigned User & Classification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                    Assigned User / Lead Investigator *
                  </label>
                  <input
                    type="text"
                    value={editFormData.leadInvestigator}
                    onChange={(e) => setEditFormData({ ...editFormData, leadInvestigator: e.target.value })}
                    className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                      formErrors.leadInvestigator ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                    } rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none`}
                  />
                  {formErrors.leadInvestigator && (
                    <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.leadInvestigator}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">Classification *</label>
                  <select
                    value={editFormData.classification}
                    onChange={(e) => setEditFormData({ ...editFormData, classification: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-3 py-2 text-slate-900 dark:text-[#f4ede1] font-mono focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none"
                  >
                    <option value="CONFIDENTIAL // LES">CONFIDENTIAL // LES</option>
                    <option value="SECRET // SI-TK">SECRET // SI-TK</option>
                    <option value="TOP SECRET // NOFORN">TOP SECRET // NOFORN</option>
                  </select>
                </div>
              </div>

              {/* Related Target Entities */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Related Target Entities (Click to attach/detach)
                </label>
                <div className="max-h-24 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex flex-wrap gap-1.5">
                  {entities.map((ent) => {
                    const isAttached = editFormData.targetEntities.includes(ent.id);
                    return (
                      <button
                        type="button"
                        key={ent.id}
                        onClick={() =>
                          toggleEntityInList(editFormData.targetEntities, ent.id, (newList) =>
                            setEditFormData({ ...editFormData, targetEntities: newList })
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition flex items-center gap-1 ${
                          isAttached
                            ? 'bg-sky-600 text-white dark:bg-[#dfd5bf] dark:text-[#080706] font-bold'
                            : 'bg-slate-200 text-slate-700 dark:bg-[#1f1b16] dark:text-[#8f8270]'
                        }`}
                      >
                        {isAttached && <Check className="w-2.5 h-2.5" />}
                        <span>{ent.name.split(' (')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Summary Briefing *
                </label>
                <textarea
                  rows={2}
                  value={editFormData.summary}
                  onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-[#161412] border ${
                    formErrors.summary ? 'border-red-500' : 'border-slate-300 dark:border-[#383127]'
                  } rounded-lg p-2.5 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none resize-none`}
                />
                {formErrors.summary && <span className="text-[10px] text-red-500 font-mono mt-1 block">{formErrors.summary}</span>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Investigator Notes (One per line)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.notesText}
                  onChange={(e) => setEditFormData({ ...editFormData, notesText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg p-2 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none resize-none font-mono text-[11px]"
                />
              </div>

              {/* Follow-up Tasks */}
              <div>
                <label className="block text-slate-600 dark:text-[#b8ad99] font-mono mb-1 font-semibold">
                  Follow-Up Tasks (One per line)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.tasksText}
                  onChange={(e) => setEditFormData({ ...editFormData, tasksText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg p-2 text-slate-900 dark:text-[#f4ede1] focus:border-cyan dark:focus:border-[#dfd5bf] focus:outline-none resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1f1b16] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#383127] font-mono hover:bg-slate-200 dark:hover:bg-[#25201a] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold font-mono shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
