import React, { useState } from 'react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';

export default function LuxeIncidentPanel({ activeIncident, onResolve }) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = () => {
    if (!activeIncident) return;
    setResolving(true);
    setTimeout(() => {
      onResolve(activeIncident.id);
      setResolving(false);
    }, 450);
  };

  if (!activeIncident) {
    return (
      <div className="editorial-panel">
        <div className="section-code">
          <span className="number">03</span>
          <span>/</span>
          <span>SYSTEM INTEGRITY STATUS</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--warm-ivory)' }}>
              Equilibrium Nominal
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--platinum)', marginTop: '4px' }}>
              All 184 datasets and 12 pipelines conform to statistical contracts without deviation.
            </p>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--healthy-forest)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot-luxe"></span>
            <span>VERIFIED BY SIGNAL ENGINE</span>
          </div>
        </div>
      </div>
    );
  }

  const blast = activeIncident.blast_radius;

  // Render precision diff comparison based on incident type
  let diffContent = (
    <>
      <span style={{ color: 'var(--text-muted)' }}>EXPECTED CONTRACT:</span>
      <span style={{ color: 'var(--warm-ivory)' }}>{activeIncident.metric_expected}</span>
      <span style={{ color: 'var(--critical-burgundy)', margin: '2px 0' }}>      ↓</span>
      <span style={{ color: 'var(--text-muted)' }}>OBSERVED VALUE:</span>
      <span style={{ color: 'var(--critical-burgundy)' }}>{activeIncident.metric_observed}</span>
    </>
  );

  if (activeIncident.anomaly_type === 'SCHEMA_DRIFT') {
    diffContent = (
      <>
        <span style={{ color: 'var(--platinum)' }}>`customer_id: string`</span>
        <span style={{ color: 'var(--critical-burgundy)', margin: '2px 0' }}>      ↓  (field rename detected)</span>
        <span style={{ color: 'var(--critical-burgundy)' }}>`customerId: string`</span>
      </>
    );
  } else if (activeIncident.anomaly_type === 'VOLUME_ANOMALY') {
    diffContent = (
      <>
        <span style={{ color: 'var(--platinum)' }}>84,200 events/hr (expected baseline)</span>
        <span style={{ color: 'var(--critical-burgundy)', margin: '2px 0' }}>      ↓  (-94.9% collapse)</span>
        <span style={{ color: 'var(--critical-burgundy)' }}>4,210 events/hr (abnormal deviation)</span>
      </>
    );
  }

  return (
    <div className="editorial-panel incident-luxe-panel">
      <div className="section-code" style={{ color: 'var(--critical-burgundy)' }}>
        <span className="number" style={{ color: 'var(--critical-burgundy)' }}>03</span>
        <span>/</span>
        <span>ACTIVE INCIDENT REPORT</span>
      </div>

      <div className="incident-luxe-layout">
        {/* Left: Incident Title & Visual Diff */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--platinum)', textTransform: 'uppercase' }}>
            {activeIncident.id} // {activeIncident.severity}
          </div>

          <h2 className="incident-title-text">
            {activeIncident.title}
          </h2>

          <div className="incident-diff-box">
            {diffContent}
          </div>

          {/* Blast Radius Counts */}
          <div className="incident-impact-stats">
            <div>
              <span className="hero-stat-label">AFFECTED DATASETS</span>
              <span className="hero-stat-value" style={{ fontSize: '1.15rem' }}>
                {blast?.impacted_datasets?.length ? `0${blast.impacted_datasets.length}` : '08'}
              </span>
            </div>
            <div>
              <span className="hero-stat-label">PIPELINES</span>
              <span className="hero-stat-value" style={{ fontSize: '1.15rem' }}>04</span>
            </div>
            <div>
              <span className="hero-stat-label">DASHBOARDS</span>
              <span className="hero-stat-value" style={{ fontSize: '1.15rem' }}>02</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Telemetry & Remediation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="hero-stat-label">DETECTED AT</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--warm-ivory)', marginTop: '4px' }}>
              {activeIncident.detected_at}
            </div>
          </div>

          <div>
            <span className="hero-stat-label">CONFIDENCE SCORE</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--champagne-gold)', marginTop: '4px' }}>
              97.4% (Z-Score &gt; 3.8σ)
            </div>
          </div>

          <div>
            <span className="hero-stat-label">RECOMMENDED ACTION</span>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--platinum)', marginTop: '4px', lineHeight: 1.5 }}>
              {blast?.recommended_action || "Deploy schema alias compatibility shim in PySpark consumer."}
            </div>
          </div>

          <button
            className="incident-action-btn"
            onClick={handleResolve}
            disabled={resolving}
          >
            <span>{resolving ? 'RESTORING EQUILIBRIUM...' : 'EXECUTE REMEDIATION RUNBOOK'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
