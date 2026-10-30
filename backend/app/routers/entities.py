from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import EntityModel
from app.schemas.schemas import EntityResponse, EntityCreate
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/entities", tags=["Entities & Dossiers"])

@router.get("", response_model=List[EntityResponse])
def get_entities(
    type: Optional[str] = None,
    status: Optional[str] = None,
    min_risk: Optional[int] = 0,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(EntityModel)
    if type and type != "all":
        query = query.filter(EntityModel.type == type)
    if status and status != "all":
        query = query.filter(EntityModel.verification_status == status)
    if min_risk and min_risk > 0:
        query = query.filter(EntityModel.risk_score >= min_risk)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (EntityModel.name.ilike(search_filter)) |
            (EntityModel.id.ilike(search_filter)) |
            (EntityModel.jurisdiction.ilike(search_filter)) |
            (EntityModel.role.ilike(search_filter))
        )
    return query.all()

@router.get("/{entity_id}", response_model=EntityResponse)
def get_entity_by_id(entity_id: str, db: Session = Depends(get_db)):
    entity = db.query(EntityModel).filter(EntityModel.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found in registry")
    return entity

@router.post("", response_model=EntityResponse, dependencies=[Depends(require_role(["Admin", "Lead Investigator", "Analyst"]))])
def create_entity(entity_in: EntityCreate, db: Session = Depends(get_db)):
    existing = db.query(EntityModel).filter(EntityModel.id == entity_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Entity ID '{entity_in.id}' already exists")
    
    new_entity = EntityModel(**entity_in.dict())
    db.add(new_entity)
    db.commit()
    db.refresh(new_entity)
    return new_entity
