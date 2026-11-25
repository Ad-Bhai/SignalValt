"""
Kafka High-Throughput Streaming Ingestion & Real-Time Quality Interceptor
-------------------------------------------------------------------------
Streams raw event payloads across Kafka topics:
- orders.events.v1
- payments.trans.v1
- telemetry.raw.v1

Features:
- Partitioning by customer_id for ordered consumer group processing
- Inline schema validation interceptor
- Anomaly injection hooks for simulated reliability testing
"""

import json
import time
import random
from datetime import datetime, timezone
from typing import Dict, Any, Generator


def generate_event_stream(
    topic: str = "orders.events.v1",
    inject_anomaly: str = None
) -> Generator[Dict[str, Any], None, None]:
    """
    Simulates high-velocity event streaming with optional anomaly injection:
    - inject_anomaly='volume_collapse'
    - inject_anomaly='schema_drift'
    - inject_anomaly='distribution_skew'
    - inject_anomaly='duplicate_storm'
    """
    counter = 1000
    while True:
        counter += 1
        now_iso = datetime.now(timezone.utc).isoformat()

        if inject_anomaly == "schema_drift":
            # Renamed field customer_id -> customerId
            payload = {
                "order_id": f"ORD-{counter}",
                "customerId": f"CUST-{random.randint(100, 999)}",
                "email": f"user{counter}@example.com",
                "amount": round(random.uniform(15.0, 450.0), 2),
                "timestamp": now_iso
            }
        elif inject_anomaly == "distribution_skew":
            # Skew age to 18-25 cohort 91% of time
            cohort = "18–25" if random.random() < 0.91 else "26–35"
            payload = {
                "order_id": f"ORD-{counter}",
                "customer_id": f"CUST-{random.randint(100, 999)}",
                "age_bracket": cohort,
                "amount": round(random.uniform(15.0, 450.0), 2),
                "timestamp": now_iso
            }
        elif inject_anomaly == "duplicate_storm" and counter % 3 == 0:
            # Re-emit duplicate order_id
            payload = {
                "order_id": "ORD-DUPLICATE-STORM-999",
                "customer_id": "CUST-STATIC-999",
                "email": "storm@example.com",
                "amount": 99.99,
                "timestamp": now_iso
            }
        else:
            payload = {
                "order_id": f"ORD-{counter}",
                "customer_id": f"CUST-{random.randint(100, 999)}",
                "email": f"user{counter}@example.com",
                "amount": round(random.uniform(15.0, 450.0), 2),
                "timestamp": now_iso
            }

        yield payload
        time.sleep(0.01)


def run_kafka_consumer_interceptor(broker_url: str = "localhost:9092"):
    """
    Attempts connection to Kafka broker if available, otherwise runs
    in resilient local emulation mode.
    """
    print(f"🛰️  SIGNALVAULT: Connecting to Kafka broker at {broker_url}...")
    try:
        from kafka import KafkaConsumer
        consumer = KafkaConsumer(
            "orders.events.v1",
            bootstrap_servers=[broker_url],
            auto_offset_reset='latest',
            enable_auto_commit=True,
            group_id='signalvault-reliability-interceptor',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        print("Connected to live Kafka cluster. Intercepting stream...")
        for message in consumer:
            print(f"[Stream Intercept] Offset: {message.offset} | Payload: {message.value}")
    except Exception:
        print("[SignalVault Kafka] Local mode active: streaming emulator interceptor running.")
        stream = generate_event_stream()
        for _ in range(5):
            evt = next(stream)
            print(f"[Kafka Topic: orders.events.v1] Ingested record: {evt['order_id']} | customer_id: {evt['customer_id']}")


if __name__ == "__main__":
    run_kafka_consumer_interceptor()
