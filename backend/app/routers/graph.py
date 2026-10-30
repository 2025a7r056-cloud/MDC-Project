from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import EntityModel, RelationshipModel
from app.schemas.schemas import NetworkMetricsResponse, ShortestPathRequest, ShortestPathResponse
from app.services.graph_engine import GraphAnalyticsEngine

router = APIRouter(prefix="/graph", tags=["NetworkX Graph Analytics Engine"])

def get_graph_engine(db: Session = Depends(get_db)) -> GraphAnalyticsEngine:
    entities = db.query(EntityModel).all()
    relationships = db.query(RelationshipModel).all()
    return GraphAnalyticsEngine(entities, relationships)

@router.get("/metrics", response_model=NetworkMetricsResponse)
def get_network_metrics(engine: GraphAnalyticsEngine = Depends(get_graph_engine)):
    return engine.compute_network_metrics()

@router.post("/shortest-path", response_model=ShortestPathResponse)
def compute_shortest_path(req: ShortestPathRequest, engine: GraphAnalyticsEngine = Depends(get_graph_engine)):
    res = engine.trace_shortest_path(req.source_id, req.target_id)
    if not res:
        raise HTTPException(
            status_code=404,
            detail=f"No connected path found between '{req.source_id}' and '{req.target_id}' in current graph."
        )
    return res

@router.get("/centralities")
def get_graph_centralities(engine: GraphAnalyticsEngine = Depends(get_graph_engine)):
    return engine.calculate_centralities()

@router.get("/communities")
def get_graph_communities(engine: GraphAnalyticsEngine = Depends(get_graph_engine)):
    return engine.detect_communities()

@router.get("/link-predictions")
def get_link_predictions(engine: GraphAnalyticsEngine = Depends(get_graph_engine)):
    return engine.predict_candidate_links()
