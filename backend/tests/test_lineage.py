import pytest
from backend.engine.lineage import LineageGraph
from backend.models import AnomalyType, LineageNodeType


def test_lineage_graph_initialization():
    graph = LineageGraph()
    assert len(graph.nodes) > 10
    assert len(graph.edges) > 10
    assert "orders_clean" in graph.nodes
    assert "revenue_dashboard" in graph.nodes


def test_lineage_downstream_traversal():
    graph = LineageGraph()
    # Downstream of orders_clean should include dbt_revenue_pipeline, revenue_model, revenue_dashboard
    downstream = graph.get_downstream_subgraph("orders_clean")
    assert "dbt_revenue_pipeline" in downstream
    assert "revenue_model" in downstream
    assert "revenue_dashboard" in downstream


def test_blast_radius_schema_drift():
    graph = LineageGraph()
    blast = graph.compute_blast_radius(
        incident_id="test-sch",
        origin_node_id="orders_clean",
        anomaly_type=AnomalyType.SCHEMA_DRIFT
    )

    assert blast.incident_id == "test-sch"
    assert blast.root_cause_node_id == "orders_clean"
    assert len(blast.affected_pipelines) >= 1
    assert len(blast.affected_dashboards) >= 1
    assert blast.records_potentially_affected >= 1000000
    assert "customer_id" in blast.recommended_action
