import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_api_summary_baseline():
    client.post("/api/simulator/reset")
    response = client.get("/api/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["reliability_score"] >= 95.0
    assert data["active_incidents_count"] == 0


def test_api_scenario_injection_and_resolution():
    # Inject volume collapse
    resp = client.post("/api/simulator/inject/volume_collapse")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "injected"
    incident = data["incident"]
    assert incident["anomaly_type"] == "VOLUME_ANOMALY"
    assert incident["severity"] == "CRITICAL"

    # Query active incidents
    resp_inc = client.get("/api/incidents")
    assert resp_inc.status_code == 200
    incidents = resp_inc.json()
    assert len(incidents) >= 1

    # Check lineage with impacted node
    resp_lineage = client.get("/api/lineage")
    assert resp_lineage.status_code == 200
    assert len(resp_lineage.json()["nodes"]) > 0

    # Resolve incident
    inc_id = incident["id"]
    resp_res = client.post(f"/api/incidents/{inc_id}/resolve")
    assert resp_res.status_code == 200

    # Reset
    resp_reset = client.post("/api/simulator/reset")
    assert resp_reset.status_code == 200
