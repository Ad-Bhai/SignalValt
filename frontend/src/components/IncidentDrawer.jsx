import React from 'react';
import { X, ShieldAlert, CheckCircle, Terminal, Layers, ArrowDownRight, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function IncidentDrawer({ incident, onClose, onResolve }) {
  if (!incident) return null;

  const blast = incident.blast_radius;
  const isResolved = incident.status === 'RESOLVED';

  const handleResolveClick = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onResolve(incident.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: incident.severity === 'CRITICAL' ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 183, 3, 0.2)',
                  color: incident.severity === 'CRITICAL' ? '#FF5A87' : '#FFD166'
                }}
              >
                {incident.severity} INCIDENT
              </span>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94A3B8' }}>
                Detected at {incident.detected_at}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
              {incident.title}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Root Cause Card */}
        <div className="action-box" style={{ borderLeft: '4px solid #FF0055' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldAlert size={18} color="#FF0055" />
            <span style={{ fontWeight: 800, color: '#FF5A87', fontSize: '0.88rem' }}>ROOT CAUSE IDENTIFICATION</span>
          </div>
          <p style={{ color: '#F8FAFC', fontSize: '0.92rem', fontWeight: 600 }}>
            {incident.root_cause}
          </p>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94A3B8' }}>
            Origin Node: <code style={{ color: '#00F2FE' }}>{blast?.root_cause_node_id}</code>
          </div>
        </div>

        {/* Blast Radius & Downstream Impact Card */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>
            Downstream Blast Radius Assessment
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>AFFECTED PIPELINES</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFB703' }}>
                {blast?.affected_pipelines?.length || 0}
              </span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>AFFECTED DATASETS</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFB703' }}>
                {blast?.affected_datasets?.length || 0}
              </span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>DOWNSTREAM DASHBOARDS</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FF5A87' }}>
                {blast?.affected_dashboards?.length || 0}
              </span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>RECORDS AT RISK</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00F2FE' }}>
                {(blast?.records_potentially_affected || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Impact Chain */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ color: '#64748B', fontSize: '0.72rem', display: 'block', marginBottom: '8px' }}>
              TOPOLOGICAL IMPACT PROPAGATION PATH
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {(blast?.impact_chain || []).map((nodeId, idx) => (
                <React.Fragment key={nodeId}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: idx === 0 ? 'rgba(255,0,85,0.2)' : 'rgba(0,242,254,0.1)',
                      color: idx === 0 ? '#FF5A87' : '#00F2FE',
                      border: idx === 0 ? '1px solid #FF0055' : '1px solid rgba(0,242,254,0.3)'
                    }}
                  >
                    {nodeId}
                  </span>
                  {idx < (blast?.impact_chain?.length || 0) - 1 && (
                    <ArrowDownRight size={12} color="#64748B" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Action & Runbook */}
        <div className="action-box" style={{ borderLeft: '4px solid #06D6A0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Terminal size={18} color="#06D6A0" />
            <span style={{ fontWeight: 800, color: '#06D6A0', fontSize: '0.88rem' }}>
              RECOMMENDED ENGINEERING ACTION
            </span>
          </div>
          <p style={{ color: '#F8FAFC', fontSize: '0.85rem' }}>
            {blast?.recommended_action}
          </p>
        </div>

        {/* Action Button */}
        {!isResolved ? (
          <button className="resolve-btn" onClick={handleResolveClick}>
            <CheckCircle size={18} />
            <span>Acknowledge & Triage Incident</span>
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: '#06D6A0', fontWeight: 600, fontSize: '0.9rem' }}>
            ✓ Incident Resolved & Pipeline Lineage Restored
          </div>
        )}
      </div>
    </div>
  );
}
