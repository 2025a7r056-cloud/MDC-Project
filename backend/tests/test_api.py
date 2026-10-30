import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import Base, engine, SessionLocal
from seed_data import seed

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    # Seed test database
    seed()
    yield

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE // ALL SYSTEMS NOMINAL"
    assert "CrimeGraph AI" in data["system"]

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_entities():
    response = client.get("/api/entities")
    assert response.status_code == 200
    entities = response.json()
    assert len(entities) >= 10
    assert any(e["id"] == "ENT-001" for e in entities)

def test_entity_search_and_filter():
    response = client.get("/api/entities?type=corporation")
    assert response.status_code == 200
    corps = response.json()
    assert len(corps) >= 2
    assert all(c["type"] == "corporation" for c in corps)

def test_get_relationships():
    response = client.get("/api/relationships")
    assert response.status_code == 200
    relationships = response.json()
    assert len(relationships) >= 8

def test_graph_network_metrics():
    response = client.get("/api/graph/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert metrics["node_count"] >= 10
    assert metrics["edge_count"] >= 8
    assert metrics["density"] > 0
    assert "top_betweenness_nodes" in metrics
    assert len(metrics["communities"]) >= 1

def test_shortest_path_tracer():
    payload = {
        "source_id": "ENT-001",
        "target_id": "ENT-007"
    }
    response = client.post("/api/graph/shortest-path", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source_id"] == "ENT-001"
    assert data["target_id"] == "ENT-007"
    assert len(data["path"]) >= 2
    assert data["total_flow_usd"] > 0

def test_ai_investigative_query():
    payload = {
        "prompt": "Which nodes have the highest betweenness centrality?"
    }
    response = client.post("/api/ai/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Betweenness" in data["response"]
    assert len(data["grounded_citations"]) > 0

def test_transaction_anomalies():
    response = client.get("/api/transactions/anomalies")
    assert response.status_code == 200
    anomalies = response.json()
    assert len(anomalies) >= 3
    assert all(a["is_flagged"] is True for a in anomalies)

def test_cases_retrieval():
    response = client.get("/api/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 2
    assert any(c["id"] == "CASE-2026-089A" for c in cases)
