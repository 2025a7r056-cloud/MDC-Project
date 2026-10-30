'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { NetworkGraph } from '@/components/graph/NetworkGraph';
import { AIAnalysisModule } from '@/components/ai/AIAnalysisModule';
import { EntityExplorer } from '@/components/entities/EntityExplorer';
import { TransactionAnalysis } from '@/components/analytics/TransactionAnalysis';
import { CaseManagement } from '@/components/cases/CaseManagement';
import { AlertsFindings } from '@/components/analytics/AlertsFindings';
import { DataImportExport } from '@/components/importer/DataImportExport';
import { AuditLogViewer } from '@/components/security/AuditLogViewer';
import { SettingsUserManagement } from '@/components/security/SettingsUserManagement';
import { InvestigationAssistant } from '@/components/ai/InvestigationAssistant';
import { GuidedDemoController } from '@/components/demo/GuidedDemoController';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { HelpCenterModal } from '@/components/help/HelpCenterModal';

import {
  INITIAL_ENTITIES,
  INITIAL_RELATIONSHIPS,
  INITIAL_CASES,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_AUDIT_LOGS,
} from '@/data/mockIntelligenceData';
import { Entity, Relationship, Case, TimelineEvent, AuditLogEntry } from '@/types/intelligence';

export default function CrimeGraphAIApp() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // Guided Demo & College Viva Presentation Mode State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Help Center & Onboarding Tutorial State (User can open via Help button in navbar)
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Active Selections
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string>('CASE-2026-089A');
  const [userRole, setUserRole] = useState<'Admin' | 'Lead Investigator' | 'Forensic Analyst' | 'Field Agent'>('Lead Investigator');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // In-Memory Intelligence Store
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [relationships, setRelationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  const [cases, setCases] = useState<Case[]>(INITIAL_CASES);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Keyboard shortcut Ctrl+K to open AI Assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsAssistantOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for cross-component navigation
  const handleSelectEntity = (id: string | null) => {
    setSelectedEntityId(id);
    if (id) {
      // Add audit log entry
      const newAudit: AuditLogEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        user: `Special Agent S. Chen`,
        userRole: userRole as any,
        action: 'VIEW_DOSSIER',
        targetId: id,
        details: `Inspected classified target dossier for entity ${id}`,
        classificationLevel: 'CONFIDENTIAL // LES',
        ipHash: 'e3b0c44298fc1c149afbf4c8996fb924',
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleNavigateToGraph = (entityId?: string) => {
    if (entityId) {
      setSelectedEntityId(entityId);
    }
    setCurrentTab('network');
  };

  const handleCreateCase = (newCase: Case) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);

    // Audit log
    const newAudit: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      user: `Special Agent S. Chen`,
      userRole: userRole as any,
      action: 'UPDATE_STATUS',
      targetId: newCase.id,
      details: `Registered new taskforce investigation: ${newCase.codeName}`,
      classificationLevel: newCase.classification,
      ipHash: 'f482a091b21901429402914102941049',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleUpdateCase = (updatedCase: Case) => {
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
  };

  const handleImportEntities = (newEntities: Entity[]) => {
    setEntities((prev) => [...prev, ...newEntities]);
  };

  const handleImportRelationships = (newRelationships: Relationship[]) => {
    setRelationships((prev) => [...prev, ...newRelationships]);
  };

  // Stats for sidebar and headers
  const stats = {
    entityCount: entities.length,
    relationCount: relationships.length,
    alertCount: 5,
    activeCasesCount: cases.filter((c) => c.status === 'active_investigation' || c.status === 'open').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#080706] text-slate-900 dark:text-[#f4ede1] selection:bg-[#dfd5bf]/30 selection:text-[#14120f] dark:selection:text-[#f4ede1]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onRoleChange={setUserRole}
        entities={entities}
        cases={cases}
        onSelectEntity={handleSelectEntity}
        onSelectCase={(id) => {
          setActiveCaseId(id);
          setCurrentTab('cases');
        }}
        activeCaseId={activeCaseId}
        isBackendConnected={isBackendConnected}
        onStartDemo={() => setIsDemoActive(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace with Sidebar and Content Area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Collapsible Tactical Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          stats={stats}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto tactical-bg h-[calc(100vh-4rem)]">
          {currentTab === 'dashboard' && (
            <OverviewDashboard
              entities={entities}
              relationships={relationships}
              cases={cases}
              timelineEvents={timelineEvents}
              onNavigate={setCurrentTab}
              onSelectEntity={handleSelectEntity}
              onSelectCase={(id) => {
                setActiveCaseId(id);
                setCurrentTab('cases');
              }}
              onStartDemo={() => setIsDemoActive(true)}
              onStartPresentationMode={() => {
                setIsDemoActive(true);
                setIsPresentationMode(true);
              }}
            />
          )}

          {currentTab === 'network' && (
            <NetworkGraph
              entities={entities}
              relationships={relationships}
              selectedEntityId={selectedEntityId}
              onSelectEntity={handleSelectEntity}
            />
          )}

          {currentTab === 'ai' && (
            <AIAnalysisModule
              entities={entities}
              relationships={relationships}
              onSelectEntity={handleSelectEntity}
              onNavigateToGraph={handleNavigateToGraph}
            />
          )}

          {currentTab === 'entities' && (
            <EntityExplorer
              entities={entities}
              relationships={relationships}
              cases={cases}
              selectedEntityId={selectedEntityId}
              onSelectEntity={handleSelectEntity}
              onNavigateToGraph={handleNavigateToGraph}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionAnalysis
              entities={entities}
              relationships={relationships}
              onSelectEntity={handleSelectEntity}
              onNavigateToGraph={handleNavigateToGraph}
            />
          )}

          {currentTab === 'cases' && (
            <CaseManagement
              cases={cases}
              entities={entities}
              timelineEvents={timelineEvents}
              onSelectEntity={handleSelectEntity}
              onNavigateToGraph={handleNavigateToGraph}
              onCreateCase={handleCreateCase}
              onUpdateCase={handleUpdateCase}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsFindings
              entities={entities}
              relationships={relationships}
              onSelectEntity={handleSelectEntity}
              onNavigateToGraph={handleNavigateToGraph}
            />
          )}

          {currentTab === 'import-export' && (
            <DataImportExport
              entities={entities}
              relationships={relationships}
              onImportEntities={handleImportEntities}
              onImportRelationships={handleImportRelationships}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLogViewer logs={auditLogs} />
          )}

          {currentTab === 'settings' && (
            <SettingsUserManagement
              currentRole={userRole}
              onRoleChange={setUserRole}
              isBackendConnected={isBackendConnected}
              onToggleDemoMode={() => setIsBackendConnected(!isBackendConnected)}
            />
          )}
        </main>
      </div>

      {/* AI Natural Language Investigation Assistant Modal / Slide-in */}
      <InvestigationAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        entities={entities}
        relationships={relationships}
        cases={cases}
        onSelectEntity={handleSelectEntity}
        onNavigateToGraph={handleNavigateToGraph}
      />

      {/* Interactive 11-Step Guided Demo & Viva Presentation Mode HUD */}
      <GuidedDemoController
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSelectEntity={handleSelectEntity}
        onSelectCase={(id) => {
          setActiveCaseId(id);
          setCurrentTab('cases');
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        entities={entities}
        relationships={relationships}
        cases={cases}
        isDemoActive={isDemoActive}
        onCloseDemo={() => setIsDemoActive(false)}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
      />

      {/* First-Time Guided Onboarding Tutorial Modal */}
      <OnboardingTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateTab={setCurrentTab}
      />

      {/* Persistent Help Center & Symbology Modal */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onLaunchTutorial={() => {
          setIsHelpOpen(false);
          setIsTutorialOpen(true);
        }}
        onNavigateTab={setCurrentTab}
      />
    </div>
  );
}
