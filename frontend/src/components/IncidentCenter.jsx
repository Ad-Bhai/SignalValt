import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Terminal, Layers } from 'lucide-react';

export default function IncidentCenter({ activeIncident, onResolve }) {
  if (!activeIncident) {
    return (
      <div className="incident-panel">
        <div className="section-title-bar" style={{ marginBottom: '16px' }}>
          <h2 className="section-heading">
            <ShieldCheck size={16} color="#39C98A" />
            <span>INCIDENT CENTER</span>
          </h2>
          <span className="section-caption">Real-time root cause & downstream blast analysis</span>
        </div>

        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(57, 201, 138, 0.08)', marginBottom: '14px' }}>
            <CheckCircle2 size={28} color="#39C98A" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F5F5F0', marginBottom: '6px' }}>
            System Observation Nominal
          </h3>
          <p style={{ color: '#8B9299', fontSize: '0.8rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
            No active incidents detected. Volume moving within IQR bounds, schema contracts intact, zero freshness breaches.
          </p>
          <span style={{ display: 'inline-block', marginTop: '16px', fontSize: '0.74rem', fontFamily: 'monospace', color: '#575D65' }}>
            SIGNALVAULT AUTOMATED MONITORING ACTIVE
          </span>
        </div>
      </div>
    );
  }

  const blast = activeIncident.blast_radius;

  // Visual Root Cause breadcrumbs matching the user's prompt specification
  let rootCauseTrace = [];
  if (activeIncident.anomaly_type === 'SCHEMA_DRIFT') {
    rootCauseTrace = [
      { label: 'UPSTREAM API', type: 'source' },
      { label: 'Schema Changed', type: 'mutation' },
      { label: 'Kafka', type: 'broker' },
      { label: 'Transformation', type: 'engine' },
      { label: '❌ Customer Dataset', type: 'failure' },
      { label: 'Revenue Dashboard', type: 'impact' }
    ];
  } else if (activeIncident.anomaly_type === 'VOLUME_ANOMALY') {
    rootCauseTrace = [
      { label: 'MOBILE GATEWAY', type: 'source' },
      { label: 'Connection Dropped', type: 'mutation' },
      { label: 'Kafka orders.events.v1', type: 'broker' },
      { label: '❌ PySpark Ingestion', type: 'failure' },
      { label: 'Financial Batch DAG', type: 'impact' }
    ];
  } else if (activeIncident.anomaly_type === 'FRESHNESS_ANOMALY') {
    rootCauseTrace = [
      { label: 'PAYMENTS SERVICE', type: 'source' },
      { label: 'Connector Thread Hang', type: 'mutation' },
      { label: '❌ kafka://payments.trans.v1', type: 'failure' },
      { label: 'orders_clean', type: 'impact' },
      { label: 'Executive KPI Portal', type: 'impact' }
    ];
  } else if (activeIncident.anomaly_type === 'DISTRIBUTION_ANOMALY') {
    rootCauseTrace = [
      { label: 'CLIENT APP', type: 'source' },
      { label: 'Default Cohort Bug', type: 'mutation' },
      { label: '❌ customer_360', type: 'failure' },
      { label: 'ML Segmentation Model', type: 'impact' }
    ];
  } else {
    rootCauseTrace = [
      { label: 'PRODUCER RETRY', type: 'source' },
      { label: 'No Idempotency Token', type: 'mutation' },
      { label: '❌ orders_clean', type: 'failure' },
      { label: 'Revenue Aggregator', type: 'impact' }
    ];
  }

  return (
    <div className="incident-panel active-threat">
      <div className="section-title-bar" style={{ marginBottom: '14px' }}>
        <h2 className="section-heading">
          <AlertCircle size={16} color="#EF4444" />
          <span>INCIDENT CENTER</span>
        </h2>
        <span className="section-caption">Autonomous failure isolation active</span>
      </div>

      <div className="incident-header-badge">
        <span className="signal-dot" style={{ background: '#EF4444' }}></span>
        <span>{activeIncident.severity} INCIDENT</span>
      </div>

      <h3 className="incident-title">{activeIncident.title}</h3>

      {/* Meta Strip */}
      <div className="incident-meta-strip">
        <div className="meta-block">
          <span>Detected</span>
          <strong style={{ color: '#F5F5F0' }}>{activeIncident.detected_at}</strong>
        </div>
        <div className="meta-block">
          <span>Observed</span>
          <strong style={{ color: '#EF4444' }}>{activeIncident.metric_observed}</strong>
        </div>
        <div className="meta-block">
          <span>Expected</span>
          <strong style={{ color: '#39C98A' }}>{activeIncident.metric_expected}</strong>
        </div>
        <div className="meta-block">
          <span>Records At Risk</span>
          <strong style={{ color: '#E7B85C' }}>
            {(blast?.records_potentially_affected || 1842391).toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Visual ROOT CAUSE failure trace */}
      <div className="root-cause-trace">
        <div className="trace-title">ROOT CAUSE PROPAGATION TRACE</div>
        <div className="trace-path">
          {rootCauseTrace.map((step, idx) => (
            <React.Fragment key={idx}>
              <span className={`trace-node ${step.type === 'failure' ? 'failure-origin' : ''}`}>
                {step.label}
              </span>
              {idx < rootCauseTrace.length - 1 && (
                <span className="trace-arrow">➔</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Downstream Blast Radius Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>AFFECTED PIPELINES</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace', color: '#F5F5F0' }}>
            {blast?.affected_pipelines?.length || 4}
          </span>
        </div>
        <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>AFFECTED DATASETS</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace', color: '#F5F5F0' }}>
            {blast?.affected_datasets?.length || 8}
          </span>
        </div>
        <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>AFFECTED DASHBOARDS</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace', color: '#EF4444' }}>
            {blast?.affected_dashboards?.length || 2}
          </span>
        </div>
      </div>

      {/* Actionable Runbook */}
      <div className="runbook-box">
        <div className="runbook-title">RECOMMENDED ENGINEERING ACTION</div>
        <div>{blast?.recommended_action || "Restore customer_id mapping in ingestion schema transformer."}</div>
      </div>

      {/* Triage Button */}
      <button 
        className="btn-primary"
        onClick={() => onResolve && onResolve(activeIncident.id)}
      >
        <span>Acknowledge & Triage Incident</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
