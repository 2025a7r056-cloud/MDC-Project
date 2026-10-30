import datetime, hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import AuditLogModel
from app.schemas.schemas import AuditLogResponse, AuditLogCreate

router = APIRouter(prefix="/audit", tags=["Forensic Audit Log Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    user_role: Optional[str] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLogModel)
    if user_role and user_role != "all":
        query = query.filter(AuditLogModel.user_role == user_role)
    if action and action != "all":
        query = query.filter(AuditLogModel.action == action)
    return query.order_by(AuditLogModel.created_at.desc()).all()

@router.post("", response_model=AuditLogResponse)
def log_audit_event(event_in: AuditLogCreate, db: Session = Depends(get_db)):
    timestamp_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    raw_hash = f"{event_in.user}-{event_in.action}-{timestamp_str}-{event_in.details}"
    ip_hash = hashlib.sha256(raw_hash.encode()).hexdigest()

    log_entry = AuditLogModel(
        id=f"AUD-{db.query(AuditLogModel).count() + 101}",
        timestamp=timestamp_str,
        user=event_in.user,
        user_role=event_in.user_role,
        action=event_in.action,
        target_id=event_in.target_id,
        details=event_in.details,
        classification_level=event_in.classification_level or "CONFIDENTIAL // LES",
        ip_hash=ip_hash,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
