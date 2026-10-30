from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import RelationshipModel
from app.schemas.schemas import RelationshipResponse, RelationshipCreate
from app.services.auth_service import require_role

router = APIRouter(prefix="/relationships", tags=["Relationships & Graph Edges"])

@router.get("", response_model=List[RelationshipResponse])
def get_relationships(
    type: Optional[str] = None,
    source_id: Optional[str] = None,
    target_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RelationshipModel)
    if type and type != "all":
        query = query.filter(RelationshipModel.type == type)
    if source_id:
        query = query.filter(RelationshipModel.source_id == source_id)
    if target_id:
        query = query.filter(RelationshipModel.target_id == target_id)
    return query.all()

@router.post("", response_model=RelationshipResponse, dependencies=[Depends(require_role(["Admin", "Lead Investigator", "Analyst"]))])
def create_relationship(rel_in: RelationshipCreate, db: Session = Depends(get_db)):
    existing = db.query(RelationshipModel).filter(RelationshipModel.id == rel_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Relationship ID '{rel_in.id}' already exists")

    new_rel = RelationshipModel(**rel_in.dict())
    db.add(new_rel)
    db.commit()
    db.refresh(new_rel)
    return new_rel
