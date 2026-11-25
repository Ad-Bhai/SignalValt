from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


class AnomalyType(str, Enum):
    VOLUME_ANOMALY = "VOLUME_ANOMALY"
    SCHEMA_DRIFT = "SCHEMA_DRIFT"
    DISTRIBUTION_ANOMALY = "DISTRIBUTION_ANOMALY"
    FRESHNESS_ANOMALY = "FRESHNESS_ANOMALY"
    DUPLICATE_EXPLOSION = "DUPLICATE_EXPLOSION"


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class IncidentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class LineageNodeType(str, Enum):
    DATA_SOURCE = "DATA_SOURCE"
    STREAM_TOPIC = "STREAM_TOPIC"
    LAKEHOUSE_BRONZE = "LAKEHOUSE_BRONZE"
    LAKEHOUSE_SILVER = "LAKEHOUSE_SILVER"
    LAKEHOUSE_GOLD = "LAKEHOUSE_GOLD"
    PIPELINE = "PIPELINE"
    DASHBOARD = "DASHBOARD"


class LineageNode(BaseModel):
    id: str
    name: str
    type: LineageNodeType
    layer: str  # source, streaming, bronze, silver, gold, presentation
    description: str
    owner: str
    status: str = "HEALTHY"  # HEALTHY, WARNING, CRITICAL
    records_per_hour: Optional[int] = None


class LineageEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None


class BlastRadius(BaseModel):
    incident_id: str
    root_cause_node_id: str
    root_cause_summary: str
    affected_pipelines: List[str] = Field(default_factory=list)
    affected_datasets: List[str] = Field(default_factory=list)
    affected_dashboards: List[str] = Field(default_factory=list)
    records_potentially_affected: int = 0
    impact_chain: List[str] = Field(default_factory=list)
    recommended_action: str


class Incident(BaseModel):
    id: str
    anomaly_type: AnomalyType
    title: str
    severity: Severity
    status: IncidentStatus = IncidentStatus.ACTIVE
    source_asset: str
    metric_observed: str
    metric_expected: str
    deviation_pct: Optional[float] = None
    detected_at: str
    resolved_at: Optional[str] = None
    root_cause: str
    blast_radius: BlastRadius
    details: Dict[str, Any] = Field(default_factory=dict)


class MetricDataPoint(BaseModel):
    timestamp: str
    value: float
    expected: Optional[float] = None
    upper_bound: Optional[float] = None
    lower_bound: Optional[float] = None


class SchemaField(BaseModel):
    name: str
    type: str
    nullable: bool = True


class SchemaDriftReport(BaseModel):
    asset_name: str
    previous_version: str
    current_version: str
    removed_fields: List[str] = Field(default_factory=list)
    added_fields: List[str] = Field(default_factory=list)
    modified_fields: List[Dict[str, Any]] = Field(default_factory=list)
    renamed_suspects: List[Dict[str, Any]] = Field(default_factory=list)
    downstream_impact_summary: str


class DistributionCategory(BaseModel):
    cohort: str
    baseline_pct: float
    current_pct: float
    shift_pct: float


class DistributionReport(BaseModel):
    feature_name: str
    psi_score: float  # Population Stability Index
    status: str
    categories: List[DistributionCategory]


class FreshnessReport(BaseModel):
    asset_name: str
    expected_cadence_seconds: int
    last_arrival_timestamp: str
    lag_seconds: int
    sla_seconds: int
    sla_breached: bool


class DuplicateReport(BaseModel):
    asset_name: str
    total_records: int
    duplicate_records: int
    duplicate_rate_pct: float
    baseline_rate_pct: float
    threshold_pct: float
    breached: bool


class SystemSummary(BaseModel):
    reliability_score: float
    active_incidents_count: int
    critical_incidents_count: int
    total_monitored_assets: int
    freshness_sla_compliance_pct: float
    avg_detection_latency_ms: int
    total_events_processed_24h: int
