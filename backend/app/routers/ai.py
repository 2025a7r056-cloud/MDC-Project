from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import EntityModel, RelationshipModel
from app.schemas.schemas import AIQueryRequest, AIQueryResponse
from app.services.ai_assistant import AIAssistantService

router = APIRouter(prefix="/ai", tags=["AI Investigation Assistant & Reasoning"])

@router.post("/query", response_model=AIQueryResponse)
def query_ai_assistant(req: AIQueryRequest, db: Session = Depends(get_db)):
    entities = db.query(EntityModel).all()
    relationships = db.query(RelationshipModel).all()
    assistant = AIAssistantService(entities, relationships)
    return assistant.answer_investigative_query(req.prompt, req.focus_entity_id)
