from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# User & Auth
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "Analyst"
    clearance: Optional[str] = "CONFIDENTIAL // LES"
    agency: Optional[str] = "FinCEN Joint Illicit Finance Task Force"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    clearance: str
    agency: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Entity Schemas
class EntityBase(BaseModel):
    name: str
    aliases: List[str] = []
    type: str # person, corporation, crypto_wallet, burner_phone, bank_account, location, vessel
    role: str
    jurisdiction: str
    status: Optional[str] = "active_target"
    verification_status: Optional[str] = "verified"
    risk_level: Optional[str] = "medium"
    risk_score: Optional[int] = 50
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    identification: Optional[Dict[str, Any]] = {}
    summary: str
    provenance_doc: Optional[str] = "Intelligence Dossier"
    admiralty_code: Optional[str] = "A1"
    collector_agency: Optional[str] = "FinCEN"

class EntityCreate(EntityBase):
    id: str

class EntityResponse(EntityBase):
    id: str

    class Config:
        from_attributes = True

# Relationship Schemas
class RelationshipBase(BaseModel):
    source_id: str
    target_id: str
    type: str # financial_flow, ownership, communication, association, kinship, logistics
    label: str
    verification_status: Optional[str] = "verified"
    amount_usd: Optional[float] = None
    frequency: Optional[int] = None
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    description: str
    provenance_doc: Optional[str] = "Wiretap / Bank Subpoena"
    admiralty_code: Optional[str] = "A1"

class RelationshipCreate(RelationshipBase):
    id: str

class RelationshipResponse(RelationshipBase):
    id: str

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionResponse(BaseModel):
    id: str
    source_id: str
    target_id: str
    amount_usd: float
    timestamp: str
    status: str
    is_flagged: bool
    flag_reason: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Case Schemas
class CaseBase(BaseModel):
    code_name: str
    title: str
    status: Optional[str] = "open"
    classification: Optional[str] = "CONFIDENTIAL // LES"
    priority: Optional[str] = "high"
    lead_investigator: str
    assigned_agency: str
    date_opened: str
    last_updated: str
    target_entities: List[str] = []
    summary: str
    total_laundered_usd: Optional[float] = 0.0

class CaseCreate(CaseBase):
    id: str

class CaseResponse(CaseBase):
    id: str

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogCreate(BaseModel):
    user: str
    user_role: str
    action: str
    target_id: Optional[str] = None
    details: str
    classification_level: Optional[str] = "CONFIDENTIAL // LES"

class AuditLogResponse(BaseModel):
    id: str
    timestamp: str
    user: str
    user_role: str
    action: str
    target_id: Optional[str] = None
    details: str
    classification_level: str
    ip_hash: str

    class Config:
        from_attributes = True

# Graph Analytics Requests / Responses
class ShortestPathRequest(BaseModel):
    source_id: str
    target_id: str

class ShortestPathResponse(BaseModel):
    source_id: str
    target_id: str
    path: List[str]
    hops: int
    edges: List[Dict[str, Any]]
    total_flow_usd: float

class NetworkMetricsResponse(BaseModel):
    node_count: int
    edge_count: int
    density: float
    average_degree: float
    connected_components: int
    top_betweenness_nodes: List[Dict[str, Any]]
    top_degree_nodes: List[Dict[str, Any]]
    communities: List[Dict[str, Any]]

# AI Assistant Query
class AIQueryRequest(BaseModel):
    prompt: str
    focus_entity_id: Optional[str] = None

class AIQueryResponse(BaseModel):
    prompt: str
    timestamp: str
    response: str
    grounded_citations: List[Dict[str, Any]]
    disclaimer: str
