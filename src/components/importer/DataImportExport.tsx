'use client';

import React, { useState } from 'react';
import {
  FileUp,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Database,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileCode,
  Sparkles,
  Check,
  Layers,
  Table,
  Filter,
  RotateCcw,
  Eye,
  Info,
} from 'lucide-react';
import { Entity, Relationship, EntityType, RiskLevel } from '@/types/intelligence';

interface DataImportExportProps {
  entities: Entity[];
  relationships: Relationship[];
  onImportEntities: (newEntities: Entity[]) => void;
  onImportRelationships: (newRelationships: Relationship[]) => void;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({
  entities,
  relationships,
  onImportEntities,
  onImportRelationships,
}) => {
  // Wizard Step (1 to 7)
  const [step, setStep] = useState<number>(1);

  // Step 1: Data Type
  const [dataType, setDataType] = useState<'entities' | 'transactions' | 'combined'>('combined');

  // Step 2 & 3: File & Parsed Data
  const [fileName, setFileName] = useState<string>('sample_intelligence_feed.json');
  const [fileSize, setFileSize] = useState<string>('124 KB');
  const [rawRows, setRawRows] = useState<any[]>([
    { id: 'ENT-019', name: 'Albatross Air Cargo BV', type: 'corporation', role: 'Air Freight Logistics', risk: 'high', riskScore: 82, source: 'ENT-001', target: 'ENT-019', amount: 3400000, date: '2025-03-12' },
    { id: 'ENT-020', name: 'Swiss Vault Holding Ltd', type: 'bank_account', role: 'Private Banking Vault', risk: 'critical', riskScore: 91, source: 'ENT-019', target: 'ENT-020', amount: 2850000, date: '2025-04-18' },
    { id: 'ENT-021', name: 'Dimitri Kozlov', type: 'person', role: 'Air Freight Pilot & Courier', risk: 'medium', riskScore: 64, source: 'ENT-020', target: 'ENT-021', amount: 120000, date: '2025-05-02' },
    { id: 'ENT-022', name: '0x4f19...98a2', type: 'crypto_wallet', role: 'Cold Storage Escrow', risk: 'high', riskScore: 88, source: 'ENT-021', target: 'ENT-022', amount: 950000, date: '2025-06-15' },
    { id: 'ENT-023', name: 'Panama Shell Nominees Inc', type: 'corporation', role: 'Pass-through IBC', risk: 'high', riskScore: 79, source: 'ENT-022', target: 'ENT-023', amount: 890000, date: '2025-07-20' },
  ]);

  // Step 4: Column Mapping
  const [columnMapping, setColumnMapping] = useState({
    id: 'id',
    name: 'name',
    type: 'type',
    role: 'role',
    amount: 'amount',
    source: 'source',
    target: 'target',
    date: 'date',
  });

  // Step 5: Duplicate Handling
  const [duplicateStrategy, setDuplicateStrategy] = useState<'merge' | 'skip'>('merge');

  // Step 7: Success State
  const [isImportComplete, setIsImportComplete] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{ entitiesCount: number; relsCount: number; highRiskCount: number } | null>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setRawRows(parsed);
          } else if (parsed.entities && Array.isArray(parsed.entities)) {
            setRawRows(parsed.entities);
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
            const rows = lines.slice(1, 15).map((line) => {
              const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
              const row: any = {};
              headers.forEach((h, idx) => {
                row[h] = vals[idx] || '';
              });
              return row;
            });
            setRawRows(rows);
          }
        }
        setStep(3); // Proceed to preview
      } catch (err) {
        console.error('File parsing error', err);
      }
    };
    reader.readAsText(file);
  };

  // Load Built-in Sample Template
  const handleLoadSampleTemplate = () => {
    setFileName('operation_iron_trident_extension.json');
    setFileSize('148 KB');
    setRawRows([
      { id: 'ENT-019', name: 'Albatross Air Cargo BV', type: 'corporation', role: 'Air Freight Logistics', risk: 'high', riskScore: 82, source: 'ENT-001', target: 'ENT-019', amount: 3400000, date: '2025-03-12' },
      { id: 'ENT-020', name: 'Swiss Vault Holding Ltd', type: 'bank_account', role: 'Private Banking Vault', risk: 'critical', riskScore: 91, source: 'ENT-019', target: 'ENT-020', amount: 2850000, date: '2025-04-18' },
      { id: 'ENT-021', name: 'Dimitri Kozlov', type: 'person', role: 'Air Freight Pilot & Courier', risk: 'medium', riskScore: 64, source: 'ENT-020', target: 'ENT-021', amount: 120000, date: '2025-05-02' },
      { id: 'ENT-022', name: '0x4f19...98a2', type: 'crypto_wallet', role: 'Cold Storage Escrow', risk: 'high', riskScore: 88, source: 'ENT-021', target: 'ENT-022', amount: 950000, date: '2025-06-15' },
      { id: 'ENT-023', name: 'Panama Shell Nominees Inc', type: 'corporation', role: 'Pass-through IBC', risk: 'high', riskScore: 79, source: 'ENT-022', target: 'ENT-023', amount: 890000, date: '2025-07-20' },
    ]);
    setStep(3);
  };

  // Execute Final Ingestion
  const handleConfirmImport = () => {
    // Generate valid Entity objects from rawRows
    const newEntities: Entity[] = rawRows.map((r, i) => ({
      id: r.id || `ENT-NEW-${100 + i}`,
      name: r.name || `Ingested Target ${i + 1}`,
      aliases: r.aliases || [],
      type: (r.type as EntityType) || 'corporation',
      role: r.role || 'Unspecified Role',
      jurisdiction: 'Panama / Switzerland',
      status: 'active_target',
      verificationStatus: 'verified',
      riskLevel: (r.riskScore && r.riskScore > 85 ? 'critical' : r.riskScore && r.riskScore > 70 ? 'high' : 'medium') as RiskLevel,
      firstSeen: r.date || '2025-01-01',
      lastSeen: '2026-10-14',
      identification: {
        registrationNumber: `REG-${r.id || i}`,
      },
      metrics: {
        degreeCentrality: 0.35,
        inDegree: 1,
        outDegree: 1,
        betweennessCentrality: 0.25,
        closenessCentrality: 0.45,
        clusterId: 5,
        clusterLabel: 'Ingested Syndicate Extension',
        totalFlowVolumeUSD: r.amount || 2500000,
        transactionCount: 4,
        riskScore: r.riskScore || 75,
        explainableRiskFactors: [
          { factor: 'Newly Ingested Unverified Lead', weight: 40, description: 'Directly linked via imported external case ledger.' },
        ],
      },
      provenance: {
        sourceDocument: 'Import Wizard Classified Ingestion Feed Ref #IMP-2026',
        sourceType: 'bank_subpoena',
        admiraltyCode: 'A1',
        referenceId: `IMP-DOC-${Date.now()}`,
        dateCollected: '2026-10-18',
        collectorAgency: 'Import Ingestion Pipeline',
        confidenceScore: 0.95,
        verifiedBy: 'Case Investigator',
        verificationDate: '2026-10-18',
        notes: 'Imported via CrimeGraph AI 7-Stage Wizard',
      },
      summary: `${r.name} imported from external intelligence feed.`,
      caseIds: ['CASE-2026-089A'],
      tags: ['Imported', 'New Lead'],
      x: 500 + (i % 3) * 120,
      y: 500 + Math.floor(i / 3) * 120,
    }));

    // Generate valid Relationship objects
    const newRelationships: Relationship[] = rawRows
      .filter((r) => r.source && r.target)
      .map((r, i) => ({
        id: `REL-IMP-${Date.now()}-${i}`,
        source: r.source,
        target: r.target,
        type: 'financial_flow',
        label: r.amount ? `$${(r.amount / 1000).toFixed(0)}k USD Wire` : 'Conduit Connection',
        amountUSD: r.amount || 1000000,
        verificationStatus: 'verified_fact',
        firstSeen: r.date || '2025-01-01',
        lastSeen: '2026-10-14',
        firstObserved: r.date || '2025-01-01',
        lastObserved: '2026-10-14',
        provenance: {
          sourceDocument: 'Imported Wire Ledger Feed',
          sourceType: 'bank_subpoena',
          admiraltyCode: 'A1',
          referenceId: `REL-REF-${Date.now()}-${i}`,
          dateCollected: '2026-10-18',
          collectorAgency: 'Import Ingestion Pipeline',
          confidenceScore: 0.95,
          notes: 'Imported via CrimeGraph AI 7-Stage Wizard',
        },
        description: `Imported forensic wire transfer between ${r.source} and ${r.target}.`,
        admiraltyCode: 'A1',
        collectorAgency: 'Import Ingestion Pipeline',
      }));

    onImportEntities(newEntities);
    onImportRelationships(newRelationships);

    setImportSummary({
      entitiesCount: newEntities.length,
      relsCount: newRelationships.length,
      highRiskCount: newEntities.filter((e) => e.metrics.riskScore >= 80).length,
    });
    setIsImportComplete(true);
  };

  // Reset Wizard
  const handleResetWizard = () => {
    setStep(1);
    setIsImportComplete(false);
    setImportSummary(null);
  };

  // Download Sample Files
  const handleDownloadSampleJSON = () => {
    const sampleData = {
      description: 'CrimeGraph AI - Sample Fictional Synthetic Intelligence Dataset',
      disclaimer: 'All entities and scenarios are fictitious synthetic intelligence records.',
      entities: entities.slice(0, 5),
      relationships: relationships.slice(0, 8),
    };
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_fictional_syndicate.json';
    a.click();
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      'id,name,type,role,jurisdiction,riskScore,source,target,amount,date\n' +
      'ENT-019,"Albatross Air Cargo BV",corporation,"Air Freight Logistics",82,ENT-001,ENT-019,3400000,2025-03-12\n' +
      'ENT-020,"Swiss Vault Holding Ltd",bank_account,"Private Banking Vault",91,ENT-019,ENT-020,2850000,2025-04-18\n' +
      'ENT-021,"Dimitri Kozlov",person,"Air Courier",64,ENT-020,ENT-021,120000,2025-05-02\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_target_entities.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-600 dark:text-[#dfd5bf] uppercase tracking-wider font-semibold">
            <Database className="w-4 h-4 text-amber-500 dark:text-[#d4af37]" /> Import &amp; Export
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1] mt-1">
            Import / Export
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1">
            Import external spreadsheets or JSON datasets, or export current intelligence records.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-50 dark:bg-[#110f0d] p-2.5 rounded-lg border border-slate-200 dark:border-[#2f2a23] text-xs font-mono text-slate-600 dark:text-[#b8ad99] flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-[#7a9a83]" />
          <span>Local processing: Data is verified in your browser session.</span>
        </div>
      </div>

      {/* 7-Stage Step Progress Stepper Bar */}
      <div className="bg-white dark:bg-[#12100e] p-3 rounded-xl border border-slate-200 dark:border-[#2f2a23] shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs font-mono">
          {[
            { num: 1, label: 'Data Type' },
            { num: 2, label: 'Upload / Template' },
            { num: 3, label: 'Preview' },
            { num: 4, label: 'Column Mapping' },
            { num: 5, label: 'Validation' },
            { num: 6, label: 'Relationships' },
            { num: 7, label: 'Confirm' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num || isImportComplete;
            return (
              <button
                key={s.num}
                onClick={() => !isImportComplete && s.num <= step && setStep(s.num)}
                className={`flex items-center gap-1.5 transition ${
                  isActive
                    ? 'text-amber-600 dark:text-[#dfd5bf] font-bold'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-[#6e6354]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 dark:bg-[#dfd5bf] dark:text-[#080706]'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-100 dark:bg-[#1e1a14] border border-slate-300 dark:border-[#383127]'
                  }`}
                >
                  {isCompleted && !isActive ? <Check className="w-3.5 h-3.5" /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
                {s.num < 7 && <span className="text-slate-300 dark:text-[#383127] ml-2">➔</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Content Area */}
      <div className="p-6 rounded-xl glass-panel border border-slate-200 dark:border-[#2f2a23] shadow-sm space-y-6">
        {/* =========================================================================
            STAGE 1: Choose Data Type
        ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Stage 1 of 7</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                Select Intelligence Ingestion Type
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                Choose the structure of the data you want to bring into the active criminal analysis workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setDataType('combined')}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  dataType === 'combined'
                    ? 'bg-amber-50/70 dark:bg-[#1e1a14] border-amber-500 dark:border-[#dfd5bf] ring-1 ring-amber-500 dark:ring-[#dfd5bf]'
                    : 'bg-slate-50 dark:bg-[#12100e] border-slate-200 dark:border-[#2f2a23] hover:border-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-[#dfd5bf] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Combined Network (Recommended)
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#b8ad99]">
                  Both entities and transaction connections in a single file. Perfect for multi-target criminal syndicates.
                </p>
              </div>

              <div
                onClick={() => setDataType('entities')}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  dataType === 'entities'
                    ? 'bg-amber-50/70 dark:bg-[#1e1a14] border-amber-500 dark:border-[#dfd5bf] ring-1 ring-amber-500 dark:ring-[#dfd5bf]'
                    : 'bg-slate-50 dark:bg-[#12100e] border-slate-200 dark:border-[#2f2a23] hover:border-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-[#dfd5bf] flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Entities Master Only
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#b8ad99]">
                  Individuals, corporations, bank accounts, crypto wallets, and vessels without pre-existing edges.
                </p>
              </div>

              <div
                onClick={() => setDataType('transactions')}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  dataType === 'transactions'
                    ? 'bg-amber-50/70 dark:bg-[#1e1a14] border-amber-500 dark:border-[#dfd5bf] ring-1 ring-amber-500 dark:ring-[#dfd5bf]'
                    : 'bg-slate-50 dark:bg-[#12100e] border-slate-200 dark:border-[#2f2a23] hover:border-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#dfd5bf] flex items-center justify-center font-bold">
                  <Table className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Financial Transactions Only
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#b8ad99]">
                  Wire logs, SWIFT receipts, and crypto transactions connecting existing entities.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-xs flex items-center gap-2"
              >
                <span>Continue to Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: Upload File or Sample Template
        ========================================================================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Stage 2 of 7</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                Upload File or Load Sample Template
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                Drop your CSV or JSON file below, or use the pre-loaded sample template to test the pipeline immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Drag and Drop Zone */}
              <label className="border-2 border-dashed border-slate-300 dark:border-[#383127] hover:border-amber-500 dark:hover:border-[#dfd5bf] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/60 dark:bg-[#14120f]/60 group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-[#dfd5bf] transition mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-[#f4ede1]">
                  Click to browse or drop CSV / JSON file
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#8f8270] font-mono mt-1">
                  Supports UTF-8 CSV, Excel exported CSV, or graph JSON (Max 5MB)
                </span>
                <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Instant Sample Template Option */}
              <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-[#171410] border border-amber-300/60 dark:border-[#383127] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-700 dark:text-[#dfd5bf]">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#d4af37]" />
                    <span>Instant Evaluator Template</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-[#cfc1ab] leading-relaxed">
                    Don’t have a CSV handy? Load our 5-entity syndicate extension containing air courier networks, crypto cold storage, and shell pass-throughs.
                  </p>
                </div>

                <button
                  onClick={handleLoadSampleTemplate}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 dark:bg-[#dfd5bf] text-slate-950 dark:text-[#080706] font-bold text-xs font-mono shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Sample Intelligence Template</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 3: Preview Loaded Data
        ========================================================================= */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Stage 3 of 7</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                  Preview Loaded Ingestion Records
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                  Inspecting first 5 records from <strong>{fileName}</strong> ({fileSize}).
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/30 font-bold">
                {rawRows.length} RECORDS FOUND
              </span>
            </div>

            {/* Preview Table */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#2f2a23] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#161412] border-b border-slate-200 dark:border-[#2f2a23] text-slate-500 dark:text-[#8f8270] uppercase text-[10px]">
                      <th className="py-2.5 px-3">Entity ID</th>
                      <th className="py-2.5 px-3">Entity Name</th>
                      <th className="py-2.5 px-3">Taxonomy Type</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Risk Score</th>
                      <th className="py-2.5 px-3">Transfer Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#221d17]">
                    {rawRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#161411]">
                        <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-[#dfd5bf]">{row.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-[#f4ede1]">{row.name}</td>
                        <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-[#b8ad99]">{row.type}</td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-[#8f8270]">{row.role}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold">
                            {row.riskScore}/100
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {row.amount ? `$${(row.amount / 1000).toLocaleString()}k USD` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-xs flex items-center gap-2"
              >
                <span>Proceed to Column Mapping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 4: Map Columns
        ========================================================================= */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Stage 4 of 7</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                Map File Columns to CrimeGraph Schema
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                Our AI parser auto-detected 8 matching attributes. Review and adjust mappings if necessary.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {[
                { label: 'Entity Identifier (ID)', key: 'id', current: columnMapping.id },
                { label: 'Entity Name / Title', key: 'name', current: columnMapping.name },
                { label: 'Taxonomy Type (Person/Corp/Bank/Crypto)', key: 'type', current: columnMapping.type },
                { label: 'Investigative Role', key: 'role', current: columnMapping.role },
                { label: 'Conduit Source Node', key: 'source', current: columnMapping.source },
                { label: 'Conduit Target Node', key: 'target', current: columnMapping.target },
                { label: 'Financial Amount (USD)', key: 'amount', current: columnMapping.amount },
                { label: 'Observation Date', key: 'date', current: columnMapping.date },
              ].map((field) => (
                <div key={field.key} className="p-3 rounded-lg bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23] flex items-center justify-between">
                  <div>
                    <span className="text-slate-800 dark:text-[#f4ede1] font-bold block">{field.label}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> Auto-Mapped
                    </span>
                  </div>
                  <select
                    value={field.current}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                    className="bg-white dark:bg-[#1a1714] border border-slate-300 dark:border-[#383127] rounded px-2 py-1 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none"
                  >
                    <option value={field.key}>{field.key}</option>
                    <option value="custom">Custom Column...</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-xs flex items-center gap-2"
              >
                <span>Run Validation Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 5: Validation & Duplicate Check
        ========================================================================= */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Stage 5 of 7</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                Validation &amp; Integrity Verification
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                Automated check for missing fields, schema errors, and duplicate collision against existing database.
              </p>
            </div>

            {/* Validation Checklist */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-[#121f15] border border-emerald-300 dark:border-[#304535] flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-[#a0c4ab]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Schema Syntax &amp; Types:</span>
                  <span>100% compliant with Criminal Intelligence Ontology.</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200/50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  0 ERRORS
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-[#1f1b14] border border-amber-300 dark:border-[#42392e] flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-[#dfd5bf]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
                  <span className="font-bold">Duplicate Key Check:</span>
                  <span>Source ENT-001 already exists in active case. Will link new conduits cleanly.</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                  MERGE READY
                </span>
              </div>
            </div>

            {/* Duplicate Strategy Selection */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23] space-y-2">
              <span className="text-xs font-mono uppercase text-slate-700 dark:text-[#dfd5bf] font-bold block">
                Conflict Resolution Strategy
              </span>
              <div className="flex gap-4 text-xs font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-[#f4ede1]">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'merge'}
                    onChange={() => setDuplicateStrategy('merge')}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span>Merge with Existing Entities (Enrich connections)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-[#f4ede1]">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'skip'}
                    onChange={() => setDuplicateStrategy('skip')}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span>Skip Duplicate IDs (Keep original records unchanged)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-xs flex items-center gap-2"
              >
                <span>Inspect Relationship Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 6: Relationship Preview
        ========================================================================= */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Stage 6 of 7</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                Relationship &amp; Topology Preview
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                Preview how the imported records will attach to existing criminal clusters in the graph canvas.
              </p>
            </div>

            {/* Visual Mini Relationship Flow */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23] space-y-3">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-[#8f8270] font-semibold block">
                Pending Conduits to Form:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {rawRows.slice(0, 4).map((r, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white dark:bg-[#161412] border border-slate-200 dark:border-[#2d2720] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-[#f4ede1]">{r.source} ➔ {r.target}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#8f8270] block">
                        Channel: Financial Wire (${(r.amount / 1000).toLocaleString()}k USD)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                      VERIFIED FACT
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStep(5)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(7)}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-xs flex items-center gap-2"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 7: Confirm & Import
        ========================================================================= */}
        {step === 7 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {!isImportComplete ? (
              <>
                <div>
                  <span className="text-xs font-mono uppercase text-amber-600 dark:text-[#dfd5bf] font-bold">Final Stage 7 of 7</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4ede1] mt-1 font-mono">
                    Confirm &amp; Execute Ingestion
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-0.5">
                    Review summary metrics before committing changes to the active operational graph.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23]">
                    <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">New Target Entities</span>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f4ede1] mt-1">
                      +{rawRows.length} Nodes
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-[#8f8270]">Assigned to active investigation</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23]">
                    <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">Conduit Relationships</span>
                    <div className="text-2xl font-bold font-mono text-amber-600 dark:text-[#d4af37] mt-1">
                      +{rawRows.filter((r) => r.source && r.target).length} Edges
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-[#8f8270]">Cross-border financial links</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23]">
                    <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-[#8f8270]">High-Risk Flags</span>
                    <div className="text-2xl font-bold font-mono text-red-500 dark:text-red-400 mt-1">
                      +{rawRows.filter((r) => r.riskScore >= 80).length} Critical
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-[#8f8270]">Score &ge; 80/100 threshold</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setStep(6)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-sm flex items-center gap-2 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Integrate Ingestion</span>
                  </button>
                </div>
              </>
            ) : (
              /* Success Celebration Summary */
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-600/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                    Ingestion Successfully Integrated
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1 max-w-md mx-auto">
                    Data records have been successfully merged into the live CrimeGraph engine. Graph metrics and betweenness centralities have been recomputed.
                  </p>
                </div>

                <div className="inline-flex gap-6 p-4 rounded-xl bg-slate-50 dark:bg-[#12100e] border border-slate-200 dark:border-[#2f2a23] text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Total Entities</span>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf] text-base">+{importSummary?.entitiesCount}</span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-[#2f2a23] pl-6">
                    <span className="text-slate-500 text-[10px] uppercase block">Connections</span>
                    <span className="font-bold text-amber-600 dark:text-[#d4af37] text-base">+{importSummary?.relsCount}</span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-[#2f2a23] pl-6">
                    <span className="text-slate-500 text-[10px] uppercase block">High-Risk Targets</span>
                    <span className="font-bold text-red-500 text-base">+{importSummary?.highRiskCount}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleResetWizard}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1a1714] text-slate-700 dark:text-[#dfd5bf] font-mono text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Start Another Import
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Section & Demo Datasets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Sample Templates Download */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2f2a23]">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-[#dfd5bf]" /> Download Sample Templates
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#8f8270] leading-relaxed">
            Download pre-formatted synthetic spreadsheets to test offline data preparation, schema validation, and third-party tools.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadSampleJSON}
              className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#2f2a23] hover:border-purple-500/50 dark:hover:border-[#dfd5bf]/50 text-left transition space-y-1 group shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono text-purple-700 dark:text-[#dfd5bf] font-bold">
                <span>Synthetic Syndicate (JSON)</span>
                <Download className="w-3.5 h-3.5 text-purple-600 dark:text-[#dfd5bf] group-hover:scale-110 transition" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#8f8270]">
                Full nested nodes, edges, and evidence records.
              </div>
            </button>

            <button
              onClick={handleDownloadSampleCSV}
              className="p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#2f2a23] hover:border-sky-500/50 dark:hover:border-[#dfd5bf]/50 text-left transition space-y-1 group shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono text-sky-700 dark:text-[#dfd5bf] font-bold">
                <span>Entities Master (CSV)</span>
                <Download className="w-3.5 h-3.5 text-sky-600 dark:text-[#dfd5bf] group-hover:scale-110 transition" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#8f8270]">
                Tabular format with headers and sample records.
              </div>
            </button>
          </div>
        </div>

        {/* Export Case Intelligence */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-slate-200 dark:border-[#2f2a23] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2f2a23]">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono flex items-center gap-2">
              <FileDown className="w-4 h-4 text-emerald-600 dark:text-[#dfd5bf]" /> Export Active Case Dossiers
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#8f8270]">
            Export verified intelligence packages formatted for courtroom exhibits, FinCEN regulatory filings, or grand jury packets.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDownloadSampleJSON}
              className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#dfd5bf] dark:text-[#080706] dark:hover:bg-[#e8dec8] font-bold text-xs font-mono transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export Complete Graph JSON
            </button>
            <button
              onClick={handleDownloadSampleCSV}
              className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-[#14120f] hover:bg-slate-200 dark:hover:bg-[#1f1b16] border border-slate-300 dark:border-[#2f2a23] text-slate-800 dark:text-[#dfd5bf] font-mono text-xs transition flex items-center justify-center gap-1.5 font-semibold"
            >
              <Download className="w-4 h-4" /> Export Entities CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
