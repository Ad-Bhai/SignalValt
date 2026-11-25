import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function IncidentFeed({ incidents, onSelectIncident, onResolveIncident }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="glass-panel incidents-section" style={{ textAlign: 'center', padding: '40px' }}>
        <CheckCircle2 size={42} color="#06D6A0" style={{ margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>All Monitored Pipelines Nominal</h3>
        <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '6px' }}>
          No volume anomalies, schema drift, distribution skew, SLA breaches, or duplicate storms detected.
        </p>
        <span style={{ fontSize: '0.78rem', color: '#00F2FE', marginTop: '12px', display: 'inline-block' }}>
          Tip: Trigger a scenario above to test autonomous detection.
        </span>
      </div>
    );
  }

  return (
    <div className="glass-panel incidents-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <ShieldAlert size={20} color="#FF0055" />
            <span>Active Reliability Incidents ({incidents.length})</span>
          </h2>
          <p className="section-subtitle">Real-time alerts with blast-radius analysis and root cause diagnostics.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {incidents.map((incident) => {
          const isResolved = incident.status === 'RESOLVED';
          const blast = incident.blast_radius;

          return (
            <div
              key={incident.id}
              className={`incident-card ${incident.severity} ${incident.status}`}
              onClick={() => onSelectIncident(incident)}
            >
              <div className="incident-top">
                <div className="incident-type-tag">
                  <span style={{ color: incident.severity === 'CRITICAL' ? '#FF0055' : '#FFB703' }}>●</span>
                  <span>{incident.anomaly_type.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8' }}>
                    {incident.detected_at}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: incident.severity === 'CRITICAL' ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 183, 3, 0.2)',
                      color: incident.severity === 'CRITICAL' ? '#FF5A87' : '#FFD166'
                    }}
                  >
                    {incident.severity}
                  </span>
                </div>
              </div>

              <div className="incident-title">{incident.title}</div>

              <div className="incident-metrics">
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>SOURCE ASSET</span>
                  <span style={{ color: '#00F2FE' }}>{incident.source_asset}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>OBSERVED</span>
                  <span style={{ color: '#FF5A87', fontWeight: 600 }}>{incident.metric_observed}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>EXPECTED</span>
                  <span style={{ color: '#06D6A0' }}>{incident.metric_expected}</span>
                </div>
              </div>

              <div className="incident-footer">
                <span>
                  Blast Impact: <strong>{blast?.affected_pipelines?.length || 0} pipelines</strong>,{' '}
                  <strong>{blast?.affected_dashboards?.length || 0} dashboards</strong>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="sim-btn"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(incident);
                    }}
                  >
                    Inspect Blast Radius <ArrowRight size={12} />
                  </button>
                  {!isResolved && (
                    <button
                      className="sim-btn reset"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolveIncident(incident.id);
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
