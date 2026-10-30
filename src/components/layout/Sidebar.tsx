'use client';

import React from 'react';
import {
  LayoutDashboard,
  Share2,
  BrainCircuit,
  Users,
  CircleDollarSign,
  Briefcase,
  AlertOctagon,
  FileUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAssistant: () => void;
  stats: {
    entityCount: number;
    relationCount: number;
    alertCount: number;
    activeCasesCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenAssistant,
  stats,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'network',
      label: 'Network Graph',
      shortLabel: 'Graph',
      icon: Share2,
      badge: `${stats.relationCount}`,
    },
    {
      id: 'ai',
      label: 'AI Insights',
      shortLabel: 'AI',
      icon: BrainCircuit,
      badge: null,
      highlight: true,
    },
    {
      id: 'entities',
      label: 'Entities',
      shortLabel: 'Entities',
      icon: Users,
      badge: `${stats.entityCount}`,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      shortLabel: 'Transactions',
      icon: CircleDollarSign,
      badge: null,
    },
    {
      id: 'cases',
      label: 'Cases',
      shortLabel: 'Cases',
      icon: Briefcase,
      badge: `${stats.activeCasesCount}`,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      shortLabel: 'Alerts',
      icon: AlertOctagon,
      badge: `${stats.alertCount}`,
      badgeColor: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40 font-bold',
    },
    {
      id: 'import-export',
      label: 'Import / Export',
      shortLabel: 'Import',
      icon: FileUp,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      shortLabel: 'Audit',
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/95 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-sky-50/90 dark:bg-[#1f1b16] text-sky-800 dark:text-[#f4ede1] border border-sky-200/80 dark:border-[#42392e] font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-[#a89f8d] hover:text-slate-900 dark:hover:text-[#f4ede1] hover:bg-slate-100/70 dark:hover:bg-[#1a1714]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition ${
                  isActive ? 'text-sky-600 dark:text-[#dfd5bf]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-[#ded0bc]'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        item.badgeColor ||
                        (isActive
                          ? 'bg-sky-100 dark:bg-[#28231c] text-sky-800 dark:text-[#f4ede1] border-sky-200 dark:border-[#524638]'
                          : 'bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-[#968d7c] border-slate-200 dark:border-navy-750')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Active Indicator Bar on Left */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-sky-600 dark:bg-[#d4c5a9] rounded-r"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Investigation Assistant Quick Launcher */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onOpenAssistant}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#14120f] hover:bg-sky-50/50 dark:hover:bg-[#1a1714] border border-slate-200 dark:border-[#2f2922] hover:border-sky-300 dark:hover:border-[#524638] transition group shadow-xs ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
          title="Open AI Investigation Assistant (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-[#dfd5bf] group-hover:text-sky-600 dark:group-hover:text-[#f4ede1] transition" />
            {!collapsed && (
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-900 dark:text-[#f4ede1] flex items-center gap-1 font-mono">
                  AI ASSISTANT <Sparkles className="w-2.5 h-2.5 text-sky-600 dark:text-[#dfd5bf]" />
                </div>
                <div className="text-[9px] text-slate-500 dark:text-[#847c6d]">Ask questions in plain English</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-indigo-50 dark:bg-[#24201a] text-indigo-700 dark:text-[#dfd5bf] border border-indigo-200 dark:border-[#4d4233]">
              Ctrl+K
            </span>
          )}
        </button>
      </div>

      {/* Sleek System Status (When expanded) */}
      {!collapsed && (
        <div className="px-3 py-2 mx-2 mb-2 rounded-lg bg-slate-50 dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2922] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#a89f8d]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700 dark:text-[#dfd5bf]">System Ready</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-[#847c6d]">
            {stats.entityCount} targets
          </span>
        </div>
      )}

      {/* Collapse / Expand Toggle Button */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
