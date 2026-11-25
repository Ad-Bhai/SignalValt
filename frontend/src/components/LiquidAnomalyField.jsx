import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LiquidAnomalyField({ activeIncident, onResolve }) {
  const [resolvingState, setResolvingState] = useState(null); // 'recovering-amber' -> 'recovering-cyan' -> null

  const handleResolveClick = () => {
    if (!activeIncident) return;

    // Smooth recovery sequence: RED -> AMBER -> CYAN -> NORMAL
    setResolvingState('amber');
    setTimeout(() => {
      setResolvingState('cyan');
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }, 600);

    setTimeout(() => {
      setResolvingState(null);
      onResolve(activeIncident.id);
    }, 1200);
  };

  if (!activeIncident && !resolvingState) {
    return (
      <div className="liquid-surface anomaly-field-panel">
        <div className="section-head-row">
          <h2 className="section-title-liquid">
            <ShieldCheck size={18} color="#20B486" />
            <span>Data Field Equilibrium</span>
          </h2>
          <span className="section-desc-liquid">Continuous micro-sampling across ingestion partitions</span>
        </div>

        {/* Normal Data Field Representation */}
        <div className="field-representation-wrap">
          <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#74777D', marginBottom: '8px' }}>
            ORGANIZED DATA FIELD HARMONY (UNIFORM DENSITY)
          </div>
          <div className="field-grid-dots">
            <div>• • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •</div>
            <div> • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • </div>
            <div>• • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •</div>
            <div> • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#18191B' }}>
            Zero Field Disruptions Observed
          </span>
          <p style={{ color: '#74777D', fontSize: '0.8rem', marginTop: '4px' }}>
            All 184 datasets conform to strict statistical baselines and structural schema contracts.
          </p>
        </div>
      </div>
    );
  }

  const blast = activeIncident?.blast_radius;

  // Breadcrumbs
  let failureTrace = ['UPSTREAM PRODUCER', 'KAFKA TOPIC', 'STREAM NORMALIZER', 'DATABASE MARTS', 'DASHBOARDS'];
  if (activeIncident?.anomaly_type === 'SCHEMA_DRIFT') {
    failureTrace = ['UPSTREAM API', 'Schema Changed', 'Kafka Topic', '❌ orders_clean', 'customer_360', 'Revenue Dashboard'];
  } else if (activeIncident?.anomaly_type === 'VOLUME_ANOMALY') {
    failureTrace = ['MOBILE CLIENT', 'Telemetry Gateway', '❌ Kafka Ingest', 'PySpark Worker', 'Finance Airflow DAG'];
  } else if (activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY') {
    failureTrace = ['PAYMENT GATEWAY', 'Offset Delay', '❌ kafka://payments.v1', 'Stale S3 Partition', 'Executive Board'];
  }

  return (
    <div className={`liquid-surface anomaly-field-panel ${resolvingState ? '' : 'critical-threat'}`}>
      <div className="section-head-row">
        <h2 className="section-title-liquid">
          <AlertTriangle size={18} color={resolvingState ? '#65D9E8' : '#E45858'} />
          <span>Anomaly Disruption Detected</span>
        </h2>
        <span className="section-desc-liquid">
          {resolvingState ? 'Restoring fluid field equilibrium...' : 'Localized structural disruption in pipeline flow'}
        </span>
      </div>

      {/* Break in Data Field Graphic */}
      <div className="field-representation-wrap">
        <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#74777D', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>DISRUPTED DATA FIELD</span>
          <span style={{ color: resolvingState ? '#65D9E8' : '#E45858', fontWeight: 700 }}>
            {resolvingState ? 'RECOVERING...' : 'LOCALIZED FIELD DISRUPTION'}
          </span>
        </div>
        <div className="field-grid-dots">
          <div>• • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •</div>
          <div> • • • • • • • • • • • • • • • • &nbsp;&nbsp;&nbsp;&nbsp;<span className="distorted">● ● ●</span> • • • • • • • • • • • • • • • • </div>
          <div>• • • • • • • • • • • • • • • &nbsp;&nbsp;<span className="distorted">● ● ● ●</span> • • • • • • • • • • • • • • • • •</div>
          <div> • • • • • • • • • • • • • • • • &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• • • • • • • • • • • • • • • • </div>
        </div>
      </div>

      {/* Main Anomaly Card */}
      <div className="anomaly-alert-card">
        <div className="alert-top-pill" style={{
          background: resolvingState === 'amber' ? 'rgba(231,168,59,0.1)' : (resolvingState === 'cyan' ? 'rgba(101,217,232,0.1)' : undefined),
          color: resolvingState === 'amber' ? '#E7A83B' : (resolvingState === 'cyan' ? '#0E9CAE' : undefined)
        }}>
          <span>{resolvingState ? 'TRANSITIONING STATE' : `${activeIncident?.severity || 'CRITICAL'} ANOMALY`}</span>
        </div>

        <h3 className="alert-headline">{activeIncident?.title}</h3>

        {/* Technical metrics */}
        <div className="alert-metrics-table">
          <div>
            <span style={{ color: '#74777D', display: 'block', fontSize: '0.68rem' }}>CONFIDENCE</span>
            <span style={{ fontWeight: 700, color: '#18191B' }}>99.8%</span>
          </div>
          <div>
            <span style={{ color: '#74777D', display: 'block', fontSize: '0.68rem' }}>FIRST DETECTED</span>
            <span style={{ fontWeight: 700, color: '#18191B' }}>{activeIncident?.detected_at}</span>
          </div>
          <div>
            <span style={{ color: '#74777D', display: 'block', fontSize: '0.68rem' }}>EXPECTED</span>
            <span style={{ fontWeight: 700, color: '#20B486' }}>{activeIncident?.metric_expected}</span>
          </div>
          <div>
            <span style={{ color: '#74777D', display: 'block', fontSize: '0.68rem' }}>ACTUAL</span>
            <span style={{ fontWeight: 700, color: '#E45858' }}>{activeIncident?.metric_observed}</span>
          </div>
        </div>

        {/* Downstream Impact Trace */}
        <div>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#74777D', display: 'block', marginBottom: '8px' }}>
            FAILURE TRACE & BLAST RADIUS
          </span>
          <div className="trace-flow-capsules">
            {failureTrace.map((node, i) => (
              <React.Fragment key={i}>
                <span className={`trace-capsule ${node.includes('❌') ? 'failed' : ''}`}>
                  {node}
                </span>
                {i < failureTrace.length - 1 && <span style={{ color: '#9EA3AB' }}>➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Runbook */}
        <div className="runbook-callout">
          <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Actionable Mitigation Runbook
          </strong>
          <div>{blast?.recommended_action || "Restore schema contract mapping or rollback producer payload changes."}</div>
        </div>

        {/* Resolve Button */}
        <button
          className="liquid-btn"
          style={{
            background: 'linear-gradient(135deg, #18191B 0%, #2B3137 100%)',
            color: '#FFFFFF',
            justifyContent: 'center',
            padding: '10px 20px',
            fontSize: '0.82rem'
          }}
          onClick={handleResolveClick}
        >
          <span>Resolve & Smooth Flow</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
