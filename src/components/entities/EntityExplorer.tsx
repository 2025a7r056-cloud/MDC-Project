'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  User,
  Smartphone,
  Wallet,
  Landmark,
  MapPin,
  Ship,
  Eye,
  Share2,
  ShieldAlert,
  ShieldCheck,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Entity, Relationship, Case, EntityType, VerificationStatus } from '@/types/intelligence';
import { EntityDrawer } from './EntityDrawer';

interface EntityExplorerProps {
  entities: Entity[];
  relationships: Relationship[];
  cases: Case[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onNavigateToGraph: (id: string) => void;
}

export const EntityExplorer: React.FC<EntityExplorerProps> = ({
  entities,
  relationships,
  cases,
  selectedEntityId,
  onSelectEntity,
  onNavigateToGraph,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'degree' | 'name' | 'recent'>('risk');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [drawerEntityId, setDrawerEntityId] = useState<string | null>(selectedEntityId);

  // Sync external selection
  React.useEffect(() => {
    if (selectedEntityId) {
      setDrawerEntityId(selectedEntityId);
    }
  }, [selectedEntityId]);

  // Filter and Sort
  const filteredEntities = useMemo(() => {
    return entities
      .filter((e) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            e.name.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q) ||
            e.role.toLowerCase().includes(q) ||
            e.jurisdiction.toLowerCase().includes(q) ||
            e.aliases.some((a) => a.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (selectedType !== 'all' && e.type !== selectedType) return false;
        if (selectedStatus !== 'all' && e.verificationStatus !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'risk') return b.metrics.riskScore - a.metrics.riskScore;
        if (sortBy === 'degree') return b.metrics.degreeCentrality - a.metrics.degreeCentrality;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'recent') return b.lastSeen.localeCompare(a.lastSeen);
        return 0;
      });
  }, [entities, search, selectedType, selectedStatus, sortBy]);

  const activeDrawerEntity = entities.find((e) => e.id === drawerEntityId) || null;

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <User className="w-3.5 h-3.5 text-cyan-bright" />;
      case 'corporation': return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'crypto_wallet': return <Wallet className="w-3.5 h-3.5 text-amber-400" />;
      case 'burner_phone': return <Smartphone className="w-3.5 h-3.5 text-pink-400" />;
      case 'bank_account': return <Landmark className="w-3.5 h-3.5 text-emerald-400" />;
      case 'location': return <MapPin className="w-3.5 h-3.5 text-purple-400" />;
      case 'vessel': return <Ship className="w-3.5 h-3.5 text-cyan" />;
      default: return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-[#f4ede1]">Entities</h2>
          <p className="text-xs text-slate-600 dark:text-[#b8ad99] mt-1">
            Browse, filter, and inspect targets, accounts, and organizations.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-[#161412] p-1 rounded-lg border border-slate-200 dark:border-[#2f2a23] shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${
                viewMode === 'table' ? 'bg-white dark:bg-[#231f1a] text-sky-700 dark:text-[#dfd5bf] shadow-xs border border-slate-200 dark:border-[#42392e]' : 'text-slate-500 dark:text-[#8f8270] hover:text-slate-900 dark:hover:text-[#f4ede1]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition ${
                viewMode === 'grid' ? 'bg-white dark:bg-[#231f1a] text-sky-700 dark:text-[#dfd5bf] shadow-xs border border-slate-200 dark:border-[#42392e]' : 'text-slate-500 dark:text-[#8f8270] hover:text-slate-900 dark:hover:text-[#f4ede1]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#12100e] p-4 rounded-xl border border-slate-200 dark:border-[#2f2a23] shadow-sm backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#8f8270] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by entity name, ID, alias, jurisdiction, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] placeholder-slate-400 dark:placeholder-[#8f8270] focus:outline-none focus:border-cyan dark:focus:border-[#dfd5bf] font-mono"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-cyan dark:focus:border-[#dfd5bf]"
          >
            <option value="all">All Types</option>
            <option value="person">Persons</option>
            <option value="corporation">Corporations</option>
            <option value="crypto_wallet">Crypto Wallets</option>
            <option value="burner_phone">Burner Phones</option>
            <option value="bank_account">Bank Accounts</option>
            <option value="location">Locations</option>
            <option value="vessel">Vessels</option>
          </select>
        </div>

        {/* Verification Status */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-cyan dark:focus:border-[#dfd5bf]"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Facts</option>
            <option value="allegation">Allegations</option>
            <option value="hypothesis">Hypotheses</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-[#161412] border border-slate-300 dark:border-[#383127] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#f4ede1] font-mono focus:outline-none focus:border-cyan dark:focus:border-[#dfd5bf]"
          >
            <option value="risk">Risk Score (High → Low)</option>
            <option value="degree">Centrality Degree</option>
            <option value="name">Entity Name</option>
            <option value="recent">Recently Seen</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#8f8270]">
        <span>Showing {filteredEntities.length} of {entities.length} entities</span>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-cyan-600 dark:text-[#dfd5bf] hover:underline text-xs font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="rounded-xl glass-panel overflow-hidden border border-slate-200 dark:border-[#2f2a23] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12100e] text-[11px] font-mono uppercase text-slate-500 dark:text-[#b8ad99] tracking-wider">
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Name &amp; Role</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Risk Score</th>
                  <th className="py-3 px-4 text-center">Connections</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredEntities.map((entity) => (
                  <tr
                    key={entity.id}
                    onClick={() => {
                      setDrawerEntityId(entity.id);
                      onSelectEntity(entity.id);
                    }}
                    className="hover:bg-slate-100/70 dark:hover:bg-[#1a1714] cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-cyan-600 dark:text-[#dfd5bf]">
                      {entity.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-[#f4ede1]">{entity.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8f8270] truncate max-w-xs">{entity.role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161412] text-slate-700 dark:text-[#d4c5a9] border dark:border-[#2f2a23] font-mono capitalize">
                        {getEntityIcon(entity.type)}
                        {entity.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-[#d4c5a9]">{entity.jurisdiction}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                          entity.verificationStatus === 'verified'
                            ? 'bg-cyan-100 dark:bg-[#1f1b16] text-cyan-700 dark:text-[#dfd5bf] border border-cyan-300 dark:border-[#42392e]'
                            : entity.verificationStatus === 'allegation'
                            ? 'bg-amber-100 dark:bg-[#1f1b16] text-amber-700 dark:text-[#d4af37] border border-amber-300 dark:border-[#d4af37]/30'
                            : 'bg-purple-100 dark:bg-[#1f1b16] text-purple-700 dark:text-[#c5b497] border border-purple-300 dark:border-[#c5b497]/30'
                        }`}
                      >
                        {entity.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          entity.riskLevel === 'critical'
                            ? 'bg-red-100 dark:bg-[#201413] text-red-700 dark:text-[#c27d78] border border-red-300 dark:border-[#c27d78]/30'
                            : entity.riskLevel === 'high'
                            ? 'bg-amber-100 dark:bg-[#1f1b16] text-amber-700 dark:text-[#d4af37] border border-amber-300 dark:border-[#d4af37]/30'
                            : 'bg-slate-100 dark:bg-[#161412] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#2f2a23]'
                        }`}
                      >
                        {entity.metrics.riskScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-[#dfd5bf]">
                      {entity.metrics.degreeCentrality} links
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setDrawerEntityId(entity.id);
                            onSelectEntity(entity.id);
                          }}
                          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-[#1f1b16] text-slate-400 hover:text-cyan-600 dark:hover:text-[#dfd5bf] transition"
                          title="Open Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigateToGraph(entity.id)}
                          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-[#1f1b16] text-slate-400 hover:text-cyan-600 dark:hover:text-[#dfd5bf] transition"
                          title="Focus in Graph"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => {
                setDrawerEntityId(entity.id);
                onSelectEntity(entity.id);
              }}
              className="p-4 rounded-xl glass-panel glass-panel-hover cursor-pointer space-y-3 border border-slate-200 dark:border-[#2f2a23] dark:hover:border-[#dfd5bf]/40 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-600 dark:text-[#dfd5bf] font-bold">{entity.id}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      entity.riskLevel === 'critical'
                        ? 'bg-red-100 dark:bg-[#201413] text-red-700 dark:text-[#c27d78] border border-red-300 dark:border-[#c27d78]/30'
                        : entity.riskLevel === 'high'
                        ? 'bg-amber-100 dark:bg-[#1f1b16] text-amber-700 dark:text-[#d4af37] border border-amber-300 dark:border-[#d4af37]/30'
                        : 'bg-slate-100 dark:bg-[#161412] text-slate-700 dark:text-[#dfd5bf] border dark:border-[#2f2a23]'
                    }`}
                  >
                    Risk: {entity.metrics.riskScore}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#161412] border border-slate-200 dark:border-[#2f2a23] flex items-center justify-center shrink-0">
                    {getEntityIcon(entity.type)}
                  </div>
                  <div className="truncate">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-[#f4ede1] truncate">{entity.name}</h3>
                    <div className="text-[11px] text-slate-500 dark:text-[#8f8270] truncate">{entity.role}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#cfc1ab] mt-2 line-clamp-2">{entity.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8f8270]">
                <span>{entity.jurisdiction}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToGraph(entity.id);
                  }}
                  className="text-cyan-600 dark:text-[#dfd5bf] hover:text-cyan-500 dark:hover:text-[#f4ede1] flex items-center gap-1 font-semibold"
                >
                  Graph <Share2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Entity Dossier Drawer */}
      <EntityDrawer
        entity={activeDrawerEntity}
        onClose={() => {
          setDrawerEntityId(null);
          onSelectEntity(null);
        }}
        relationships={relationships}
        cases={cases}
        onSelectEntity={(id) => {
          setDrawerEntityId(id);
          onSelectEntity(id);
        }}
        onNavigateToGraph={onNavigateToGraph}
      />
    </div>
  );
};
