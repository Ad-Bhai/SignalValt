import math
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from backend.models import (
    AnomalyType,
    Severity,
    Incident,
    BlastRadius,
    SchemaDriftReport,
    DistributionReport,
    DistributionCategory,
    FreshnessReport,
    DuplicateReport,
)


class VolumeAnomalyDetector:
    """
    Detects sudden drops or surges in ingested/processed event volume.
    Uses rolling baseline comparison and dynamic percentage deviation.
    """
    def __init__(self, deviation_threshold_pct: float = 40.0, min_expected_volume: int = 100):
        self.deviation_threshold_pct = deviation_threshold_pct
        self.min_expected_volume = min_expected_volume

    def evaluate(
        self,
        asset_name: str,
        current_volume: int,
        historical_volumes: List[int],
        timestamp: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        if not historical_volumes:
            expected_volume = current_volume
        else:
            # Baseline is rolling average of historical periods
            expected_volume = int(sum(historical_volumes) / len(historical_volumes))

        if expected_volume < self.min_expected_volume:
            return None

        deviation_pct = ((current_volume - expected_volume) / expected_volume) * 100.0

        # Check for volume drop (e.g., 83k -> 4.2k is -94.9% deviation)
        # or massive abnormal spike
        if deviation_pct <= -self.deviation_threshold_pct or deviation_pct >= 200.0:
            severity = Severity.CRITICAL if deviation_pct <= -80.0 else Severity.HIGH
            return {
                "anomaly_type": AnomalyType.VOLUME_ANOMALY,
                "asset_name": asset_name,
                "severity": severity,
                "metric_observed": f"{current_volume:,} events",
                "metric_expected": f"~{expected_volume:,} events",
                "deviation_pct": round(deviation_pct, 1),
                "timestamp": timestamp or datetime.now(timezone.utc).isoformat(),
                "details": {
                    "current_volume": current_volume,
                    "expected_volume": expected_volume,
                    "historical_sample_size": len(historical_volumes),
                    "deviation_pct": round(deviation_pct, 1),
                    "summary": f"Volume deviation {round(deviation_pct, 1)}% detected on {asset_name}."
                }
            }
        return None


class SchemaDriftDetector:
    """
    Tracks schema modifications across streaming and batch contracts.
    Detects dropped columns, added columns, data type mutations,
    and intelligently recognizes renamed fields (e.g. customer_id -> customerId).
    """
    def _normalize_name(self, name: str) -> str:
        # Normalize snake_case, camelCase, PascalCase for fuzzy rename matching
        return re.sub(r"[_\-\s]", "", name).lower()

    def evaluate(
        self,
        asset_name: str,
        previous_schema: Dict[str, str],  # {field_name: type}
        current_schema: Dict[str, str],
        previous_version: str = "v1.4.0",
        current_version: str = "v1.5.0"
    ) -> Optional[SchemaDriftReport]:
        prev_fields = set(previous_schema.keys())
        curr_fields = set(current_schema.keys())

        removed_fields = sorted(list(prev_fields - curr_fields))
        added_fields = sorted(list(curr_fields - prev_fields))
        modified_fields = []

        for common in prev_fields.intersection(curr_fields):
            if previous_schema[common] != current_schema[common]:
                modified_fields.append({
                    "field": common,
                    "previous_type": previous_schema[common],
                    "current_type": current_schema[common]
                })

        # Detect suspected renames (e.g., customer_id -> customerId)
        renamed_suspects = []
        for r_field in removed_fields:
            r_norm = self._normalize_name(r_field)
            for a_field in added_fields:
                a_norm = self._normalize_name(a_field)
                if r_norm == a_norm:
                    renamed_suspects.append({
                        "from": r_field,
                        "to": a_field,
                        "confidence": 0.95
                    })

        if removed_fields or added_fields or modified_fields:
            summary_parts = []
            if removed_fields:
                summary_parts.append(f"Removed: {', '.join(removed_fields)}")
            if added_fields:
                summary_parts.append(f"Added: {', '.join(added_fields)}")
            if renamed_suspects:
                renames = [f"{s['from']} ➔ {s['to']}" for s in renamed_suspects]
                summary_parts.append(f"Suspected renames: {', '.join(renames)}")
            if modified_fields:
                mods = [f"{m['field']} ({m['previous_type']} ➔ {m['current_type']})" for m in modified_fields]
                summary_parts.append(f"Type changes: {', '.join(mods)}")

            return SchemaDriftReport(
                asset_name=asset_name,
                previous_version=previous_version,
                current_version=current_version,
                removed_fields=removed_fields,
                added_fields=added_fields,
                modified_fields=modified_fields,
                renamed_suspects=renamed_suspects,
                downstream_impact_summary="; ".join(summary_parts)
            )
        return None


class DistributionAnomalyDetector:
    """
    Evaluates categorical and numerical feature distributions.
    Calculates Population Stability Index (PSI):
        PSI = SUM( (Actual% - Expected%) * ln(Actual% / Expected%) )
    Standard threshold:
        PSI < 0.1   => Stable (no drift)
        0.1 <= PSI < 0.25 => Moderate shift
        PSI >= 0.25 => Significant anomaly / drift
    """
    def __init__(self, psi_threshold: float = 0.25):
        self.psi_threshold = psi_threshold

    def evaluate(
        self,
        feature_name: str,
        baseline_distribution: Dict[str, float],  # {category: percentage} e.g. {"18-25": 0.31, ...}
        current_distribution: Dict[str, float],
        epsilon: float = 0.0001
    ) -> Tuple[bool, DistributionReport]:
        all_keys = sorted(list(set(baseline_distribution.keys()).union(set(current_distribution.keys()))))
        psi = 0.0
        categories = []

        for key in all_keys:
            base_p = max(baseline_distribution.get(key, 0.0), epsilon)
            curr_p = max(current_distribution.get(key, 0.0), epsilon)

            # PSI formula component
            psi_component = (curr_p - base_p) * math.log(curr_p / base_p)
            psi += psi_component

            categories.append(DistributionCategory(
                cohort=key,
                baseline_pct=round(base_p * 100.0, 1),
                current_pct=round(curr_p * 100.0, 1),
                shift_pct=round((curr_p - base_p) * 100.0, 1)
            ))

        is_anomalous = psi >= self.psi_threshold
        status = "CRITICAL_DRIFT" if psi >= 0.5 else ("MODERATE_DRIFT" if is_anomalous else "HEALTHY")

        report = DistributionReport(
            feature_name=feature_name,
            psi_score=round(psi, 3),
            status=status,
            categories=categories
        )
        return is_anomalous, report


class FreshnessAnomalyDetector:
    """
    Monitors data arrival cadence against contractual SLAs.
    Detects stalled ingestion pipes, silent source failures, and connector hangs.
    """
    def evaluate(
        self,
        asset_name: str,
        expected_cadence_seconds: int,
        sla_seconds: int,
        last_arrival_timestamp: datetime,
        current_timestamp: Optional[datetime] = None
    ) -> Tuple[bool, FreshnessReport]:
        now = current_timestamp or datetime.now(timezone.utc)
        if last_arrival_timestamp.tzinfo is None:
            last_arrival_timestamp = last_arrival_timestamp.replace(tzinfo=timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)

        lag_seconds = int((now - last_arrival_timestamp).total_seconds())
        sla_breached = lag_seconds > sla_seconds

        report = FreshnessReport(
            asset_name=asset_name,
            expected_cadence_seconds=expected_cadence_seconds,
            last_arrival_timestamp=last_arrival_timestamp.isoformat(),
            lag_seconds=max(0, lag_seconds),
            sla_seconds=sla_seconds,
            sla_breached=sla_breached
        )
        return sla_breached, report


class DuplicateExplosionDetector:
    """
    Monitors duplicate rates on primary keys, idempotency keys, or composite identifiers.
    Identifies retry storms, bad producer logic, or broken stream deduplication.
    """
    def __init__(self, baseline_rate_pct: float = 0.2, threshold_pct: float = 5.0):
        self.baseline_rate_pct = baseline_rate_pct
        self.threshold_pct = threshold_pct

    def evaluate(
        self,
        asset_name: str,
        total_records: int,
        duplicate_records: int
    ) -> Tuple[bool, DuplicateReport]:
        if total_records == 0:
            rate = 0.0
        else:
            rate = (duplicate_records / total_records) * 100.0

        breached = rate > self.threshold_pct

        report = DuplicateReport(
            asset_name=asset_name,
            total_records=total_records,
            duplicate_records=duplicate_records,
            duplicate_rate_pct=round(rate, 2),
            baseline_rate_pct=self.baseline_rate_pct,
            threshold_pct=self.threshold_pct,
            breached=breached
        )
        return breached, report
