import React, { useState } from 'react';
import { AlertCircle, ShieldCheck, ArrowRight, Zap, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NeuralAnomalyPulse({ activeIncident, onResolve }) {
  const [recoveringStep, setRecoveringStep] = useState(null); // 'amber' -> 'lime' -> null

  const handleResolveClick = () => {
    if (!activeIncident) return;

    // Transition: RED -> AMBER -> LIME -> NORMAL
    setRecoveringStep('amber');
    setTimeout(() => {
      setRecoveringStep('lime');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          colors: ['#C7FF3D', '#38E8FF', '#8B5CFF'],
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }, 500);

    setTimeout(() => {
      setRecoveringStep(null);
      onResolve(activeIncident.id);
    }, 1100);
  };

  if (!activeIncident && !recoveringStep) {
    return (
      <div className="hardware-card anomaly-pulse-panel">
        <div className="explorer-header-row">
          <h2 className="explorer-title">
            <ShieldCheck size={18} color="#42F59B" />
            <span>SYNAPTIC EQUILIBRIUM NOMINAL</span>
          </h2>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#7E8B9B' }}>
            All 184 datasets conform to neural baselines
          </span>
        </div>

        <div style={{ textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(66, 245, 155, 0.08)', marginBottom: '14px' }}>
            <Zap size={28} color="#42F59B" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F4F7FA', marginBottom: '6px' }}>
            No Synaptic Disruptions Detected
          </h3>
          <p style={{ color: '#7E8B9B', fontSize: '0.82rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
            Data streams are circulating cleanly through Kafka, PySpark, Lakehouse tiers, and executive models without variance.
          </p>
        </div>
      </div>
    );
  }

  const blast = activeIncident?.blast_radius;

  // Breadcrumbs
  let failureTrace = ['PRODUCER INGRESS', 'KAFKA TOPIC', 'STREAM WORKER', 'WAREHOUSE MARTS', 'DASHBOARDS'];
  if (activeIncident?.anomaly_type === 'SCHEMA_DRIFT') {
    failureTrace = ['UPSTREAM API', 'Schema Changed', 'Kafka Topic', '❌ orders_clean', 'customer_360', 'Revenue Dashboard'];
  } else if (activeIncident?.anomaly_type === 'VOLUME_ANOMALY') {
    failureTrace = ['MOBILE GATEWAY', 'Connection Collapse', '❌ kafka://orders.events', 'PySpark Worker', 'Daily Close DAG'];
  } else if (activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY') {
    failureTrace = ['PAYMENT SERVICE', 'Connector Stalled', '❌ kafka://payments.v1', 'Stale Lakehouse Partition', 'Looker Dashboard'];
  }

  return (
    <div className={`hardware-card anomaly-pulse-panel ${recoveringStep ? '' : 'critical-pulse'}`}>
      <div className="explorer-header-row">
        <h2 className="explorer-title">
          <AlertCircle size={18} color={recoveringStep === 'lime' ? '#C7FF3D' : (recoveringStep === 'amber' ? '#FFD166' : '#FF4264')} />
          <span>NEURAL ANOMALY PULSE</span>
        </h2>
        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#7E8B9B' }}>
          {recoveringStep ? 'SYNAPSE NORMALIZING...' : 'CORRUPTION SHOCKWAVE ISOLATED'}
        </span>
      </div>

      <div className="pulse-active-box" style={{
        borderColor: recoveringStep === 'lime' ? '#C7FF3D' : (recoveringStep === 'amber' ? '#FFD166' : '#FF4264')
      }}>
        <div className="pulse-badge-header" style={{
          color: recoveringStep === 'lime' ? '#C7FF3D' : (recoveringStep === 'amber' ? '#FFD166' : '#FF4264'),
          borderColor: recoveringStep === 'lime' ? '#C7FF3D' : (recoveringStep === 'amber' ? '#FFD166' : '#FF4264'),
          background: recoveringStep ? 'rgba(199,255,61,0.1)' : 'rgba(255,66,100,0.15)'
        }}>
          <span>{recoveringStep ? 'RECOVERING STATE' : `${activeIncident?.severity || 'CRITICAL'} PULSE`}</span>
        </div>

        <h3 className="pulse-incident-title">{activeIncident?.title}</h3>

        {/* Stats Grid */}
        <div className="pulse-stats-grid">
          <div>
            <span style={{ color: '#7E8B9B', display: 'block', fontSize: '0.65rem' }}>CONFIDENCE</span>
            <span style={{ color: '#F4F7FA', fontWeight: 800 }}>98.4%</span>
          </div>
          <div>
            <span style={{ color: '#7E8B9B', display: 'block', fontSize: '0.65rem' }}>DETECTED</span>
            <span style={{ color: '#F4F7FA', fontWeight: 800 }}>{activeIncident?.detected_at}</span>
          </div>
          <div>
            <span style={{ color: '#7E8B9B', display: 'block', fontSize: '0.65rem' }}>EXPECTED</span>
            <span style={{ color: '#42F59B', fontWeight: 800 }}>{activeIncident?.metric_expected}</span>
          </div>
          <div>
            <span style={{ color: '#7E8B9B', display: 'block', fontSize: '0.65rem' }}>ACTUAL</span>
            <span style={{ color: '#FF4264', fontWeight: 800 }}>{activeIncident?.metric_observed}</span>
          </div>
        </div>

        {/* Failure Trace */}
        <div>
          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#7E8B9B', display: 'block', marginBottom: '8px' }}>
            PROPAGATION TRACE PATH
          </span>
          <div className="synapse-breadcrumb-path">
            {failureTrace.map((node, idx) => (
              <React.Fragment key={idx}>
                <span className={`synapse-node-token ${node.includes('❌') ? 'origin-fault' : ''}`}>
                  {node}
                </span>
                {idx < failureTrace.length - 1 && <span style={{ color: '#7E8B9B' }}>➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mitigation Runbook */}
        <div style={{ background: 'var(--graphite)', borderRadius: '8px', padding: '12px 14px', border: '1px solid rgba(199,255,61,0.2)' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#C7FF3D', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            AUTOMATED MITIGATION RUNBOOK
          </div>
          <div style={{ fontSize: '0.8rem', color: '#F4F7FA', lineHeight: 1.5 }}>
            {blast?.recommended_action || "Restore schema contract alias in PySpark streaming transformer."}
          </div>
        </div>

        {/* Action Button */}
        <button className="recovery-action-btn" onClick={handleResolveClick}>
          <span>RESOLVE & DISSIPATE SHOCKWAVE</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
