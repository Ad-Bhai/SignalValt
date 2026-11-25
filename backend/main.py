import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    Incident,
    IncidentStatus,
    LineageNode,
    LineageEdge,
    SystemSummary,
    MetricDataPoint,
    SchemaDriftReport,
    DistributionReport,
    FreshnessReport,
    DuplicateReport,
)
from backend.engine.simulator import SimulatorEngine

app = FastAPI(
    title="SIGNALVAULT API",
    description="Real-Time Data Reliability & Anomaly Intelligence Platform API",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SimulatorEngine()
active_websockets: List[WebSocket] = []


async def broadcast_alert(payload: dict):
    """Broadcasts live incident updates to all connected web dashboards."""
    disconnected = []
    for ws in active_websockets:
        try:
            await ws.send_json(payload)
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        if ws in active_websockets:
            active_websockets.remove(ws)


@app.get("/api/health")
def get_health():
    return {"status": "ok", "service": "SIGNALVAULT Engine", "version": "1.0.0"}


@app.get("/api/summary", response_model=SystemSummary)
def get_system_summary():
    return engine.get_summary()


@app.get("/api/incidents", response_model=List[Incident])
def get_incidents(status: Optional[IncidentStatus] = None):
    incidents = list(engine.incidents.values())
    if status:
        incidents = [inc for inc in incidents if inc.status == status]
    return sorted(incidents, key=lambda x: x.detected_at, reverse=True)


@app.get("/api/incidents/{incident_id}", response_model=Incident)
def get_incident_by_id(incident_id: str):
    inc = engine.incidents.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@app.post("/api/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    inc = engine.incidents.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = IncidentStatus.RESOLVED

    # Clear impacted node highlights in lineage
    for nid in inc.blast_radius.impact_chain:
        engine.lineage.set_node_status(nid, "HEALTHY")

    await broadcast_alert({"event": "INCIDENT_RESOLVED", "incident_id": incident_id})
    return {"status": "resolved", "incident_id": incident_id}


@app.get("/api/lineage")
def get_lineage():
    return {
        "nodes": list(engine.lineage.nodes.values()),
        "edges": [edge.model_dump() for edge in engine.lineage.edges]
    }


@app.get("/api/lineage/blast-radius/{incident_id}")
def get_incident_blast_radius(incident_id: str):
    inc = engine.incidents.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc.blast_radius


@app.get("/api/metrics/volume", response_model=List[MetricDataPoint])
def get_volume_metrics():
    return engine.volume_history


@app.get("/api/metrics/schema")
def get_schema_metrics():
    drift_report = engine.schema_detector.evaluate(
        asset_name="orders_clean",
        previous_schema=engine.base_schema,
        current_schema=engine.current_schema,
        previous_version="v1.4.0",
        current_version=engine.schema_version
    )
    return {
        "previous_version": "v1.4.0",
        "current_version": engine.schema_version,
        "previous_schema": engine.base_schema,
        "current_schema": engine.current_schema,
        "drift_detected": drift_report is not None,
        "report": drift_report.model_dump() if drift_report else None
    }


@app.get("/api/metrics/distribution")
def get_distribution_metrics():
    is_anomalous, report = engine.distribution_detector.evaluate(
        feature_name="user_demographics.age",
        baseline_distribution=engine.base_distribution,
        current_distribution=engine.current_distribution
    )
    return {
        "is_anomalous": is_anomalous,
        "report": report.model_dump()
    }


@app.get("/api/metrics/freshness")
def get_freshness_metrics():
    sla_breached, report = engine.freshness_detector.evaluate(
        asset_name="kafka://payments.trans.v1",
        expected_cadence_seconds=600,
        sla_seconds=900,
        last_arrival_timestamp=engine.last_payment_arrival
    )
    return {
        "sla_breached": sla_breached,
        "report": report.model_dump()
    }


@app.get("/api/metrics/duplicates")
def get_duplicate_metrics():
    total = engine.total_records_sample
    dup_count = int(total * (engine.duplicate_rate_pct / 100.0))
    breached, report = engine.duplicate_detector.evaluate("orders_clean", total, dup_count)
    return {
        "breached": breached,
        "report": report.model_dump()
    }


@app.post("/api/simulator/inject/{scenario_name}")
async def inject_scenario(scenario_name: str):
    scenario_map = {
        "volume_collapse": engine.inject_volume_collapse,
        "volume_drop": engine.inject_volume_collapse,
        "schema_drift": engine.inject_schema_drift,
        "distribution_skew": engine.inject_distribution_skew,
        "distribution_shift": engine.inject_distribution_skew,
        "freshness_breach": engine.inject_freshness_breach,
        "freshness_sla": engine.inject_freshness_breach,
        "duplicate_spike": engine.inject_duplicate_spike,
        "duplicate_storm": engine.inject_duplicate_spike,
    }

    func = scenario_map.get(scenario_name)
    if not func:
        raise HTTPException(status_code=400, detail=f"Invalid scenario '{scenario_name}'. Available: {list(scenario_map.keys())}")

    incident = func()
    await broadcast_alert({"event": "NEW_INCIDENT", "incident": incident.model_dump()})
    return {"status": "injected", "scenario": scenario_name, "incident": incident}


@app.post("/api/simulator/reset")
async def reset_simulator():
    engine.reset_all()
    await broadcast_alert({"event": "SYSTEM_RESET"})
    return {"status": "system_reset_complete"}


@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            # Keep connection open and accept ping/pong
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
