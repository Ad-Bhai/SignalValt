import pytest
from datetime import datetime, timezone, timedelta
from backend.engine.detectors import (
    VolumeAnomalyDetector,
    SchemaDriftDetector,
    DistributionAnomalyDetector,
    FreshnessAnomalyDetector,
    DuplicateExplosionDetector,
)
from backend.models import AnomalyType, Severity


def test_volume_anomaly_detection():
    detector = VolumeAnomalyDetector(deviation_threshold_pct=40.0)
    history = [82000, 85000, 81000, 84000]  # average = 83000

    # Normal count
    assert detector.evaluate("orders", 83500, history) is None

    # Collapse scenario from prompt: 83k -> 4,200 (94.9% drop)
    res = detector.evaluate("orders", 4200, history)
    assert res is not None
    assert res["anomaly_type"] == AnomalyType.VOLUME_ANOMALY
    assert res["severity"] == Severity.CRITICAL
    assert res["deviation_pct"] < -90.0


def test_schema_drift_detection():
    detector = SchemaDriftDetector()
    prev_schema = {
        "customer_id": "string",
        "email": "string",
        "amount": "float",
        "timestamp": "timestamp"
    }
    # Prompt scenario: customer_id renamed to customerId
    curr_schema = {
        "customerId": "string",
        "email": "string",
        "amount": "float",
        "timestamp": "timestamp"
    }

    report = detector.evaluate("orders_clean", prev_schema, curr_schema)
    assert report is not None
    assert "customer_id" in report.removed_fields
    assert "customerId" in report.added_fields
    assert len(report.renamed_suspects) == 1
    assert report.renamed_suspects[0]["from"] == "customer_id"
    assert report.renamed_suspects[0]["to"] == "customerId"


def test_distribution_anomaly_detection():
    detector = DistributionAnomalyDetector(psi_threshold=0.25)
    baseline = {
        "18–25": 0.31,
        "26–35": 0.38,
        "36–50": 0.21,
        "50+": 0.10
    }
    # Prompt scenario: 18-25 jumps to 91%
    skewed = {
        "18–25": 0.91,
        "26–35": 0.04,
        "36–50": 0.03,
        "50+": 0.02
    }

    is_anomalous, report = detector.evaluate("user_demographics.age", baseline, skewed)
    assert is_anomalous is True
    assert report.psi_score > 1.0  # Massive distribution shift
    assert report.status == "CRITICAL_DRIFT"


def test_freshness_anomaly_detection():
    detector = FreshnessAnomalyDetector()
    now = datetime.now(timezone.utc)
    # Stalled 1 hour 47 minutes (107 minutes ago)
    stalled_ts = now - timedelta(hours=1, minutes=47)

    # Expected every 10 min (600s), SLA 15 min (900s)
    breached, report = detector.evaluate(
        "payments_stream",
        expected_cadence_seconds=600,
        sla_seconds=900,
        last_arrival_timestamp=stalled_ts,
        current_timestamp=now
    )
    assert breached is True
    assert report.lag_seconds >= 6400  # > 100 minutes
    assert report.sla_breached is True


def test_duplicate_explosion_detection():
    detector = DuplicateExplosionDetector(baseline_rate_pct=0.2, threshold_pct=5.0)

    # Normal: 0.2%
    breached, report = detector.evaluate("orders", 100000, 200)
    assert breached is False

    # Explosion scenario: 31.8% duplicates
    breached, report = detector.evaluate("orders", 100000, 31800)
    assert breached is True
    assert report.duplicate_rate_pct == 31.8
