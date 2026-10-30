import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Analyst") # Admin, Lead Investigator, Analyst, Field Agent
    clearance = Column(String(100), default="CONFIDENTIAL // LES")
    agency = Column(String(150), default="FinCEN Joint Illicit Finance Task Force")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EntityModel(Base):
    __tablename__ = "entities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    aliases = Column(JSON, default=list) # list of string aliases
    type = Column(String(50), index=True, nullable=False) # person, corporation, crypto_wallet, etc.
    role = Column(String(150), nullable=False)
    jurisdiction = Column(String(100), index=True, nullable=False)
    status = Column(String(50), default="active_target")
    verification_status = Column(String(50), default="verified") # verified, allegation, hypothesis
    risk_level = Column(String(20), default="medium") # critical, high, medium, low
    risk_score = Column(Integer, default=50) # 0 to 100
    first_seen = Column(String(50), nullable=True)
    last_seen = Column(String(50), nullable=True)
    identification = Column(JSON, default=dict)
    summary = Column(Text, nullable=False)
    provenance_doc = Column(String(200), default="Declassified Dossier")
    admiralty_code = Column(String(10), default="A1")
    collector_agency = Column(String(100), default="FinCEN")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RelationshipModel(Base):
    __tablename__ = "relationships"

    id = Column(String(50), primary_key=True, index=True)
    source_id = Column(String(50), ForeignKey("entities.id"), index=True, nullable=False)
    target_id = Column(String(50), ForeignKey("entities.id"), index=True, nullable=False)
    type = Column(String(50), index=True, nullable=False) # financial_flow, ownership, communication, etc.
    label = Column(String(100), nullable=False)
    verification_status = Column(String(50), default="verified")
    amount_usd = Column(Float, nullable=True)
    frequency = Column(Integer, nullable=True)
    first_seen = Column(String(50), nullable=True)
    last_seen = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    provenance_doc = Column(String(200), default="Forensic Wiretap Record")
    admiralty_code = Column(String(10), default="A1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, index=True)
    source_id = Column(String(50), ForeignKey("entities.id"), index=True, nullable=False)
    target_id = Column(String(50), ForeignKey("entities.id"), index=True, nullable=False)
    amount_usd = Column(Float, nullable=False)
    timestamp = Column(String(50), nullable=False)
    status = Column(String(50), default="completed")
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(String(50), primary_key=True, index=True)
    code_name = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="open") # open, active_investigation, indictment_ready, closed
    classification = Column(String(100), default="CONFIDENTIAL // LES")
    priority = Column(String(50), default="high") # critical, high, medium
    lead_investigator = Column(String(150), nullable=False)
    assigned_agency = Column(String(150), nullable=False)
    date_opened = Column(String(50), nullable=False)
    last_updated = Column(String(50), nullable=False)
    target_entities = Column(JSON, default=list) # List of Entity IDs
    summary = Column(Text, nullable=False)
    total_laundered_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True)
    timestamp = Column(String(50), nullable=False)
    user = Column(String(150), nullable=False)
    user_role = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    target_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=False)
    classification_level = Column(String(100), default="CONFIDENTIAL // LES")
    ip_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
