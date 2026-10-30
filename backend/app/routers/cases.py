from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import CaseModel
from app.schemas.schemas import CaseResponse, CaseCreate
from app.services.auth_service import require_role

router = APIRouter(prefix="/cases", tags=["Investigations & Taskforce Cases"])

@router.get("", response_model=List[CaseResponse])
def get_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CaseModel)
    if status and status != "all":
        query = query.filter(CaseModel.status == status)
    if priority and priority != "all":
        query = query.filter(CaseModel.priority == priority)
    return query.all()

@router.get("/{case_id}", response_model=CaseResponse)
def get_case_by_id(case_id: str, db: Session = Depends(get_db)):
    case_item = db.query(CaseModel).filter(CaseModel.id == case_id).first()
    if not case_item:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    return case_item

@router.post("", response_model=CaseResponse, dependencies=[Depends(require_role(["Admin", "Lead Investigator"]))])
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    existing = db.query(CaseModel).filter(CaseModel.id == case_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Case ID '{case_in.id}' already exists")

    new_case = CaseModel(**case_in.dict())
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return new_case
