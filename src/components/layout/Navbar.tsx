'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  ChevronDown, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  Laptop,
  Play,
  HelpCircle,
} from 'lucide-react';
import { Entity, Case } from '@/types/intelligence';
import { useTheme, Theme } from '@/lib/themeContext';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: 'Admin' | 'Lead Investigator' | 'Forensic Analyst' | 'Field Agent';
  onRoleChange: (role: 'Admin' | 'Lead Investigator' | 'Forensic Analyst' | 'Field Agent') => void;
  entities: Entity[];
  cases: Case[];
  onSelectEntity: (entityId: string) => void;
  onSelectCase: (caseId: string) => void;
  activeCaseId: string;
  isBackendConnected: boolean;
  onStartDemo?: () => void;
  onOpenHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onRoleChange,
  entities,
  cases,
  onSelectEntity,
  onSelectCase,
  activeCaseId,
  isBackendConnected,
  onStartDemo,
  onOpenHelp,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Filter entities and cases based on search
  const filteredEntities = searchQuery.trim()
    ? entities.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
          e.role.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredCases = searchQuery.trim()
    ? cases.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  const themeOptions: { id: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dark', label: 'Dark Mode (Default)', icon: Moon },
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'system', label: 'System Default', icon: Laptop },
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-navy-900/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between transition-colors duration-200 shadow-sm dark:shadow-none">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onSelectTab('dashboard')}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-50 dark:bg-[#1a1714] border border-sky-200 dark:border-[#3d352a] text-sky-600 dark:text-[#dfd5bf] shadow-xs">
            <Shield className="w-4 h-4 text-sky-600 dark:text-[#dfd5bf]" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wider text-slate-900 dark:text-[#f4ede1] flex items-center gap-1 font-mono">
              CRIME<span className="text-sky-600 dark:text-[#dfd5bf]">GRAPH</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100/70 dark:bg-[#24201a] border border-sky-300/80 dark:border-[#4d4233] text-sky-800 dark:text-[#f4ede1] font-bold">
                AI
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Global Investigation Search */}
      <div className="relative flex-1 max-w-md mx-4 hidden md:block" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search targets, cases, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="w-full bg-slate-100/80 dark:bg-navy-950 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {searchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
            {filteredEntities.length === 0 && filteredCases.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                No matching target entities or cases found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntities.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono tracking-wider text-cyan-700 dark:text-cyan uppercase px-2 py-1 font-semibold">
                      Target Entities ({filteredEntities.length})
                    </div>
                    {filteredEntities.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          onSelectEntity(e.id);
                          setSearchFocused(false);
                          setSearchQuery('');
                          onSelectTab('entities');
                        }}
                        className="px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-600 dark:text-cyan-bright font-medium">{e.id}</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{e.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                            {e.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                            e.riskLevel === 'critical'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                              : e.riskLevel === 'high'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Risk: {e.metrics.riskScore}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredCases.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-mono tracking-wider text-purple-600 dark:text-purple-400 uppercase px-2 py-1 font-semibold">
                      Investigations ({filteredCases.length})
                    </div>
                    {filteredCases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCase(c.id);
                          setSearchFocused(false);
                          setSearchQuery('');
                          onSelectTab('cases');
                        }}
                        className="px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">{c.codeName}</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{c.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                          {c.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Theme Toggle, Engine Status, Notifications, RBAC Profile */}
      <div className="flex items-center gap-2.5">
        {/* Start Guided Demo Launch Button */}
        {onStartDemo && (
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-[#dfd5bf] dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs transition shadow-sm"
            title="Launch 11-Step Interactive Viva & College Evaluation Tour"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono">Start Demo</span>
          </button>
        )}

        {/* Persistent Help & Tutorial Center Button */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/90 dark:bg-[#1a1714] border border-slate-200 dark:border-[#383127] hover:border-amber-400 dark:hover:border-[#524638] text-slate-700 dark:text-[#dfd5bf] hover:text-slate-900 dark:hover:text-white transition shadow-xs text-xs font-mono"
            title="Open Help Center, Onboarding Tutorial & Symbology Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#dfd5bf]" />
            <span className="hidden md:inline font-bold">Help</span>
          </button>
        )}

        {/* ============================================================ */}
        {/* THEME TOGGLE (Dark / Light / System) */}
        {/* ============================================================ */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/90 dark:bg-[#1a1714] border border-slate-200 dark:border-[#383127] hover:border-sky-400 dark:hover:border-[#524638] text-slate-700 dark:text-[#dfd5bf] hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            title="Toggle Theme (Dark / Light / System)"
            aria-label="Toggle Theme"
          >
            {theme === 'system' ? (
              <Laptop className="w-3.5 h-3.5 text-sky-600 dark:text-[#dfd5bf]" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-[#dfd5bf]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="text-xs font-mono capitalize hidden lg:inline">
              {theme === 'system' ? 'System' : theme}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#847c6d]" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#12100e] border border-slate-200 dark:border-[#332c23] rounded-lg shadow-xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 dark:text-[#847c6d] font-semibold border-b border-slate-100 dark:border-[#241f18] mb-1">
                Display Theme
              </div>
              {themeOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-[#221d18] text-sky-800 dark:text-[#f4ede1] font-medium'
                        : 'text-slate-700 dark:text-[#a89f8d] hover:bg-slate-50 dark:hover:bg-[#1a1714] dark:hover:text-[#f4ede1]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-3.5 h-3.5 ${
                        opt.id === 'light' ? 'text-amber-500' : opt.id === 'dark' ? 'text-[#dfd5bf]' : 'text-slate-500'
                      }`} />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-[#dfd5bf]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications / High-Risk Triage */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
            title="Intelligence Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
              5
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> High-Risk Intelligence Alerts
                </span>
                <span className="text-[10px] text-slate-400 font-mono">5 Unreviewed</span>
              </div>
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                <div 
                  onClick={() => { setShowNotifications(false); onSelectTab('alerts'); }}
                  className="p-2 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-950/60 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-red-800 dark:text-red-300">
                    <span>Unusual Wire Velocity</span>
                    <span className="text-[9px] font-mono text-red-600 dark:text-red-400 uppercase">Critical</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    Shell conduit ENT-003 routed $14.2M across 4 offshore accounts in under 12 hours.
                  </p>
                </div>
                <div 
                  onClick={() => { setShowNotifications(false); onSelectTab('alerts'); }}
                  className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    <span>Crypto Mixer Peeling Chain</span>
                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 uppercase">High</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    Burner wallet ENT-008 peeling 45 BTC into multiple unhosted wallets.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowNotifications(false); onSelectTab('alerts'); }}
                className="w-full mt-2 py-1.5 text-center text-[11px] font-mono text-cyan-600 dark:text-cyan hover:underline border-t border-slate-200 dark:border-slate-800 block"
              >
                View All Intelligence Findings →
              </button>
            </div>
          )}
        </div>

        {/* User Role & RBAC Selector */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition text-left shadow-sm"
          >
            <div className="w-7 h-7 rounded bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-bright font-bold text-xs">
              {userRole[0]}
            </div>
            <div className="hidden xl:block">
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                Special Agent S. Chen
              </div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-bright font-mono">
                {userRole}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Special Agent S. Chen</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">FinCEN Joint Illicit Finance Task Force</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <ShieldCheck className="w-3 h-3" /> Security Clearance: TOP SECRET // SI-TK
                </div>
              </div>

              <div className="p-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-1 mb-1">
                  Active Access Role (RBAC):
                </div>
                {(['Admin', 'Lead Investigator', 'Forensic Analyst', 'Field Agent'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition ${
                      userRole === role
                        ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-bright font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{role}</span>
                    {userRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-bright" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 px-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSelectTab('settings');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  System Settings & Credentials
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSelectTab('audit');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  Forensic Audit Trail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
