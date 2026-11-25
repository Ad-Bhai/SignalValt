import random
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
from backend.models import (
    AnomalyType,
    Severity,
    Incident,
    IncidentStatus,
    MetricDataPoint,
    SchemaDriftReport,
    DistributionReport,
    FreshnessReport,
    DuplicateReport,
    SystemSummary,
)
from backend.engine.detectors import (
    VolumeAnomalyDetector,
    SchemaDriftDetector,
    DistributionAnomalyDetector,
    FreshnessAnomalyDetector,
    DuplicateExplosionDetector,
)
from backend.engine.lineage import LineageGraph


class SimulatorEngine:
    """
    State manager and incident injection simulator for SignalVault.
    Produces real-time data streams, handles pre-configured anomaly scenarios,
    and runs the 5 detection algorithms with blast radius computations.
    """
    def __init__(self):
        self.lineage = LineageGraph()
        self.volume_detector = VolumeAnomalyDetector()
        self.schema_detector = SchemaDriftDetector()
        self.distribution_detector = DistributionAnomalyDetector()
        self.freshness_detector = FreshnessAnomalyDetector()
        self.duplicate_detector = DuplicateExplosionDetector()

        self.incidents: Dict[str, Incident] = {}
        self.active_scenarios: set = set()

        # Schema state
        self.base_schema = {
            "customer_id": "string",
            "email": "string",
            "amount": "float",
            "timestamp": "timestamp"
        }
        self.current_schema = dict(self.base_schema)
        self.schema_version = "v1.4.0"

        # Distribution baseline
        self.base_distribution = {
            "18–25": 0.31,
            "26–35": 0.38,
            "36–50": 0.21,
            "50+": 0.10
        }
        self.current_distribution = dict(self.base_distribution)

        # Freshness state
        self.last_payment_arrival = datetime.now(timezone.utc) - timedelta(minutes=6)

        # Duplicate state
        self.duplicate_rate_pct = 0.2
        self.total_records_sample = 100000

        # Generate realistic baseline volume history
        self.volume_history: List[MetricDataPoint] = []
        self._seed_baseline_volume_history()

    def _seed_baseline_volume_history(self):
        now = datetime.now(timezone.utc)
        self.volume_history.clear()
        # 12 hours of normal traffic around 82k-85k
        normal_benchmarks = [82400, 84100, 83200, 85000, 81900, 83600, 84800, 82900, 83500, 82000, 85200, 81800]
        for i, count in enumerate(normal_benchmarks):
            ts = (now - timedelta(hours=12 - i)).strftime("%H:00")
            self.volume_history.append(MetricDataPoint(
                timestamp=ts,
                value=count,
                expected=83000,
                upper_bound=95000,
                lower_bound=70000
            ))

    def get_summary(self) -> SystemSummary:
        active_incidents = [inc for inc in self.incidents.values() if inc.status == IncidentStatus.ACTIVE]
        critical_count = sum(1 for inc in active_incidents if inc.severity == Severity.CRITICAL)

        # Dynamic Reliability Score calculation
        base_score = 99.8
        score_penalty = (critical_count * 15.2) + (len(active_incidents) * 5.4)
        reliability_score = max(38.5, round(base_score - score_penalty, 1))

        return SystemSummary(
            reliability_score=reliability_score,
            active_incidents_count=len(active_incidents),
            critical_incidents_count=critical_count,
            total_monitored_assets=len(self.lineage.nodes),
            freshness_sla_compliance_pct=64.2 if "freshness_breach" in self.active_scenarios else 99.4,
            avg_detection_latency_ms=184,
            total_events_processed_24h=19842100
        )

    def inject_volume_collapse(self) -> Incident:
        """Scenario 1: Volume Anomaly (Expected ~83k, Received 4.2k)"""
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%H:%M:%S")
        ts_label = now.strftime("%H:00")

        hist_counts = [int(p.value) for p in self.volume_history[-5:]] or [83000, 82000, 85000]
        observed = 4200

        result = self.volume_detector.evaluate("kafka://orders.events.v1", observed, hist_counts)
        inc_id = "inc-vol-949"

        blast_radius = self.lineage.compute_blast_radius(
            incident_id=inc_id,
            origin_node_id="kafka_orders_topic",
            anomaly_type=AnomalyType.VOLUME_ANOMALY,
            custom_root_cause="Sudden 95% traffic drop from Mobile & Web telemetry gateway"
        )

        incident = Incident(
            id=inc_id,
            anomaly_type=AnomalyType.VOLUME_ANOMALY,
            title="Severe Volume Anomaly: Ingestion Collapse",
            severity=Severity.CRITICAL,
            status=IncidentStatus.ACTIVE,
            source_asset="kafka://orders.events.v1",
            metric_observed="4,200 events",
            metric_expected="~83,000 events",
            deviation_pct=-94.9,
            detected_at=now_str,
            root_cause="Telemetry gateway socket disconnection on upstream ingestion broker",
            blast_radius=blast_radius,
            details={
                "expected": 83000,
                "received": 4200,
                "deviation_pct": -94.9,
                "affected_pipelines": len(blast_radius.affected_pipelines),
                "affected_datasets": len(blast_radius.affected_datasets)
            }
        )

        self.incidents[inc_id] = incident
        self.active_scenarios.add("volume_collapse")

        # Update node status in lineage
        for nid in blast_radius.impact_chain:
            self.lineage.set_node_status(nid, "CRITICAL" if nid == "kafka_orders_topic" else "WARNING")

        # Append anomaly point to volume history
        self.volume_history.append(MetricDataPoint(
            timestamp=f"{ts_label} (ANOMALY)",
            value=4200,
            expected=83000,
            upper_bound=95000,
            lower_bound=70000
        ))
        return incident

    def inject_schema_drift(self) -> Incident:
        """Scenario 2: Schema Drift (customer_id dropped, customerId added)"""
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%H:%M:%S")

        prev_schema = dict(self.base_schema)
        # Mutate schema
        drifted_schema = {
            "customerId": "string",  # Renamed from customer_id
            "email": "string",
            "amount": "float",
            "timestamp": "timestamp"
        }
        self.current_schema = drifted_schema
        self.schema_version = "v1.5.0"

        report = self.schema_detector.evaluate(
            "orders_clean",
            prev_schema,
            drifted_schema,
            previous_version="v1.4.0",
            current_version="v1.5.0"
        )

        inc_id = "inc-sch-102"
        blast_radius = self.lineage.compute_blast_radius(
            incident_id=inc_id,
            origin_node_id="orders_clean",
            anomaly_type=AnomalyType.SCHEMA_DRIFT,
            custom_root_cause="Upstream schema modification without backward compatibility"
        )

        incident = Incident(
            id=inc_id,
            anomaly_type=AnomalyType.SCHEMA_DRIFT,
            title="Critical Schema Drift: Breaking Column Rename Detected",
            severity=Severity.CRITICAL,
            status=IncidentStatus.ACTIVE,
            source_asset="orders_clean",
            metric_observed="customer_id removed, customerId added",
            metric_expected="customer_id required",
            deviation_pct=None,
            detected_at=now_str,
            root_cause="Upstream schema modification on ingestion contract",
            blast_radius=blast_radius,
            details={
                "removed_fields": report.removed_fields,
                "added_fields": report.added_fields,
                "renamed_suspects": report.renamed_suspects,
                "affected_pipelines_count": len(blast_radius.affected_pipelines),
                "affected_datasets_count": len(blast_radius.affected_datasets),
                "affected_dashboards_count": len(blast_radius.affected_dashboards),
                "records_impacted": blast_radius.records_potentially_affected
            }
        )

        self.incidents[inc_id] = incident
        self.active_scenarios.add("schema_drift")

        for nid in blast_radius.impact_chain:
            self.lineage.set_node_status(nid, "CRITICAL" if nid == "orders_clean" else "WARNING")

        return incident

    def inject_distribution_skew(self) -> Incident:
        """Scenario 3: Distribution Shift (Age 18–25 surges to 91%)"""
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%H:%M:%S")

        skewed_dist = {
            "18–25": 0.91,
            "26–35": 0.04,
            "36–50": 0.03,
            "50+": 0.02
        }
        self.current_distribution = skewed_dist

        _, report = self.distribution_detector.evaluate(
            "user_demographics.age",
            self.base_distribution,
            skewed_dist
        )

        inc_id = "inc-dist-304"
        blast_radius = self.lineage.compute_blast_radius(
            incident_id=inc_id,
            origin_node_id="customer_360",
            anomaly_type=AnomalyType.DISTRIBUTION_ANOMALY,
            custom_root_cause="Demographic distribution collapse (PSI = 1.84)"
        )

        incident = Incident(
            id=inc_id,
            anomaly_type=AnomalyType.DISTRIBUTION_ANOMALY,
            title="Distribution Anomaly: Severe Demographic Skew",
            severity=Severity.HIGH,
            status=IncidentStatus.ACTIVE,
            source_asset="customer_360",
            metric_observed="18–25: 91% (Normal: 31%)",
            metric_expected="Normal distribution (PSI < 0.25)",
            deviation_pct=193.5,
            detected_at=now_str,
            root_cause="Automated bot registration burst / default client form value leak",
            blast_radius=blast_radius,
            details={
                "psi_score": report.psi_score,
                "categories": [c.model_dump() for c in report.categories],
                "affected_pipelines": blast_radius.affected_pipelines,
                "recommended_action": blast_radius.recommended_action
            }
        )

        self.incidents[inc_id] = incident
        self.active_scenarios.add("distribution_skew")

        for nid in blast_radius.impact_chain:
            self.lineage.set_node_status(nid, "CRITICAL" if nid == "customer_360" else "WARNING")

        return incident

    def inject_freshness_breach(self) -> Incident:
        """Scenario 4: Freshness Anomaly (Expected 10m, Last arrival 1h 47m ago)"""
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%H:%M:%S")

        # Stalled 1 hour and 47 minutes (107 mins)
        stalled_time = now - timedelta(hours=1, minutes=47)
        self.last_payment_arrival = stalled_time

        _, report = self.freshness_detector.evaluate(
            "kafka://payments.trans.v1",
            expected_cadence_seconds=600,  # 10 mins
            sla_seconds=900,  # 15 mins max SLA
            last_arrival_timestamp=stalled_time,
            current_timestamp=now
        )

        inc_id = "inc-fresh-405"
        blast_radius = self.lineage.compute_blast_radius(
            incident_id=inc_id,
            origin_node_id="kafka_payments_topic",
            anomaly_type=AnomalyType.FRESHNESS_ANOMALY,
            custom_root_cause="Payments ingestion stalled for 1h 47m (SLA: 10m)"
        )

        incident = Incident(
            id=inc_id,
            anomaly_type=AnomalyType.FRESHNESS_ANOMALY,
            title="Freshness Anomaly: Critical Pipeline SLA Breach",
            severity=Severity.CRITICAL,
            status=IncidentStatus.ACTIVE,
            source_asset="kafka://payments.trans.v1",
            metric_observed="Last update 1h 47m ago",
            metric_expected="Data arrival every 10m",
            deviation_pct=970.0,
            detected_at=now_str,
            root_cause="Stalled Kafka connector consumer group; broker offset lag deadlock",
            blast_radius=blast_radius,
            details={
                "expected_cadence_mins": 10,
                "actual_lag_mins": 107,
                "sla_seconds": 900,
                "affected_pipelines": blast_radius.affected_pipelines,
                "affected_dashboards": blast_radius.affected_dashboards
            }
        )

        self.incidents[inc_id] = incident
        self.active_scenarios.add("freshness_breach")

        for nid in blast_radius.impact_chain:
            self.lineage.set_node_status(nid, "CRITICAL" if nid == "kafka_payments_topic" else "WARNING")

        return incident

    def inject_duplicate_spike(self) -> Incident:
        """Scenario 5: Duplicate Explosion (Normal 0.2% -> 31.8% duplicates)"""
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%H:%M:%S")

        self.duplicate_rate_pct = 31.8
        total_sample = 250000
        dup_count = int(total_sample * 0.318)

        _, report = self.duplicate_detector.evaluate("orders_clean", total_sample, dup_count)

        inc_id = "inc-dup-506"
        blast_radius = self.lineage.compute_blast_radius(
            incident_id=inc_id,
            origin_node_id="orders_clean",
            anomaly_type=AnomalyType.DUPLICATE_EXPLOSION,
            custom_root_cause="Duplicate explosion (31.8% vs normal 0.2%)"
        )

        incident = Incident(
            id=inc_id,
            anomaly_type=AnomalyType.DUPLICATE_EXPLOSION,
            title="Duplicate Explosion: High-Risk Key Collision Storm",
            severity=Severity.CRITICAL,
            status=IncidentStatus.ACTIVE,
            source_asset="orders_clean",
            metric_observed="31.8% duplicate records",
            metric_expected="< 0.5% duplicates",
            deviation_pct=15800.0,
            detected_at=now_str,
            root_cause="Producer retry storm without idempotency token causing duplicate order_id events",
            blast_radius=blast_radius,
            details={
                "total_records_analyzed": total_sample,
                "duplicate_records_found": dup_count,
                "duplicate_rate_pct": 31.8,
                "baseline_rate_pct": 0.2,
                "impacted_records": blast_radius.records_potentially_affected
            }
        )

        self.incidents[inc_id] = incident
        self.active_scenarios.add("duplicate_spike")

        for nid in blast_radius.impact_chain:
            self.lineage.set_node_status(nid, "CRITICAL" if nid == "orders_clean" else "WARNING")

        return incident

    def reset_all(self):
        """Restores healthy baseline status, clears incidents, and resets lineage."""
        self.incidents.clear()
        self.active_scenarios.clear()
        self.current_schema = dict(self.base_schema)
        self.schema_version = "v1.4.0"
        self.current_distribution = dict(self.base_distribution)
        self.last_payment_arrival = datetime.now(timezone.utc) - timedelta(minutes=4)
        self.duplicate_rate_pct = 0.2
        self.lineage.reset_all_node_statuses()
        self._seed_baseline_volume_history()
