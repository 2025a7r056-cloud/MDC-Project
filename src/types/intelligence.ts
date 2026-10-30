// ==============================================================================
// CRIMEGRAPH AI - Type Definitions
// Transnational Criminal Network Intelligence Platform
// ==============================================================================

export type EntityType = 
  | 'person' 
  | 'corporation' 
  | 'crypto_wallet' 
  | 'burner_phone' 
  | 'bank_account' 
  | 'location' 
  | 'vessel';

export type VerificationStatus = 'verified' | 'verified_fact' | 'allegation' | 'hypothesis';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type RelationshipType = 
  | 'financial_flow' 
  | 'ownership' 
  | 'communication' 
  | 'association' 
  | 'kinship' 
  | 'logistics';

export type AdmiraltyReliability = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type AdmiraltyCredibility = '1' | '2' | '3' | '4' | '5' | '6';
export type AdmiraltyRating = `${AdmiraltyReliability}${AdmiraltyCredibility}`;

export interface ProvenanceRecord {
  sourceDocument: string;
  sourceType: 'wiretap' | 'bank_subpoena' | 'surveillance' | 'humint' | 'open_source' | 'customs_manifest' | 'blockchain_ledger';
  admiraltyCode: AdmiraltyRating;
  referenceId: string;
  dateCollected: string;
  collectorAgency: string;
  confidenceScore: number; // 0 to 1.0
  verifiedBy?: string;
  verificationDate?: string;
  notes: string;
}

export interface EntityMetrics {
  degreeCentrality: number;
  inDegree: number;
  outDegree: number;
  betweennessCentrality: number;
  closenessCentrality: number;
  clusterId: number;
  clusterLabel: string;
  totalFlowVolumeUSD: number;
  transactionCount: number;
  riskScore: number; // 0 to 100
  explainableRiskFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
}

export interface Entity {
  id: string;
  name: string;
  aliases: string[];
  type: EntityType;
  role: string;
  avatarUrl?: string;
  jurisdiction: string;
  status: 'active_target' | 'surveillance' | 'indicted' | 'flagged' | 'cleared';
  verificationStatus: VerificationStatus;
  riskLevel: RiskLevel;
  firstSeen: string; // ISO date YYYY-MM-DD
  lastSeen: string;
  identification: {
    passport?: string;
    taxId?: string;
    imei?: string;
    walletAddress?: string;
    iban?: string;
    imoNumber?: string;
    registrationNumber?: string;
  };
  metrics: EntityMetrics;
  provenance: ProvenanceRecord;
  summary: string;
  caseIds: string[];
  tags: string[];
  notes?: string[];
  // Graph coordinate positions (optional or computed)
  x?: number;
  y?: number;
}

export interface Relationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationshipType;
  label: string;
  verificationStatus: VerificationStatus;
  amountUSD?: number;
  frequency?: number;
  firstSeen: string;
  lastSeen: string;
  firstObserved?: string;
  lastObserved?: string;
  bidirectional?: boolean;
  provenance: ProvenanceRecord;
  description: string;
  admiraltyCode?: string;
  collectorAgency?: string;
  transactionCount?: number;
}

export interface CaseTask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
}

export interface Case {
  id: string;
  codeName: string;
  title: string;
  status: 'open' | 'active_investigation' | 'indictment_ready' | 'closed' | 'under_review' | 'pending_evidence';
  classification: 'TOP SECRET // NOFORN' | 'SECRET // SI-TK' | 'CONFIDENTIAL // LES' | 'UNCLASSIFIED';
  priority: 'critical' | 'high' | 'medium';
  leadInvestigator: string;
  assignedAgency: string;
  dateOpened: string;
  lastUpdated: string;
  targetEntities: string[]; // Entity IDs
  summary: string;
  totalLaunderedUSD: number;
  evidenceItemsCount: number;
  hypothesesCount: number;
  tags: string[];
  notes?: string[];
  followUpTasks?: CaseTask[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  entityIds: string[];
  category: 
    | 'wire_transfer' 
    | 'crypto_transaction' 
    | 'intercepted_call' 
    | 'border_crossing' 
    | 'meeting' 
    | 'incorporation' 
    | 'surveillance_sighting' 
    | 'seizure';
  title: string;
  description: string;
  location: string;
  amountUSD?: number;
  verificationStatus: VerificationStatus;
  admiraltyCode: AdmiraltyRating;
  evidenceRef: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: 'Analyst' | 'Lead Investigator' | 'Forensic Auditor' | 'Field Agent' | 'Admin';
  action: 'QUERY_GRAPH' | 'VIEW_DOSSIER' | 'EXPORT_REPORT' | 'UPDATE_STATUS' | 'VERIFY_EVIDENCE' | 'IMPORT_DATA' | 'AI_REASONING_PROMPT';
  targetId?: string;
  details: string;
  classificationLevel: string;
  ipHash: string;
}

export interface GraphFilterState {
  searchQuery: string;
  selectedEntityTypes: EntityType[];
  selectedRelationshipTypes: RelationshipType[];
  selectedVerificationStatuses: VerificationStatus[];
  minRiskScore: number;
  dateRange: [string, string]; // [minDate, maxDate]
  activeCommunityCluster: number | 'all';
  focusEntityId: string | null;
  pathFinding: {
    sourceId: string | null;
    targetId: string | null;
    active: boolean;
  };
}

export interface AIAnalysisResponse {
  query: string;
  timestamp: string;
  summary: string;
  reasoningSteps: string[];
  keyTargetsIdentified: {
    entityId: string;
    entityName: string;
    role: string;
    riskScore: number;
    analyticalRationale: string;
  }[];
  criticalConduits: {
    sourceId: string;
    targetId: string;
    description: string;
    flowUSD?: number;
  }[];
  hypotheses: {
    id: string;
    claim: string;
    confidence: number;
    investigativeLeads: string[];
    potentialSubpoenas: string[];
  }[];
  evidentiaryCaveats: string[];
  disclaimer: string;
}
