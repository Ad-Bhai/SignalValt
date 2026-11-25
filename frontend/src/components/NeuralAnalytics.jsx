import React, { useState } from 'react';
import { AreaChart, Compass, GitCommit, Sliders, Layers } from 'lucide-react';

export default function NeuralAnalytics({
  volumeData,
  schemaData,
  distributionData,
  freshnessData,
  duplicateData,
  activeIncident
}) {
  const [tab, setTab] = useState('volume');

  return (
    <div className="hardware-card neural-analytics-panel">
      <div className="explorer-header-row">
        <h2 className="explorer-title">
          <Compass size={18} color="#38E8FF" />
          <span>SYNAPTIC TELEMETRY INSTRUMENTS</span>
        </h2>
        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#7E8B9B' }}>
          Real-time statistical distributions & crosshair metrics
        </span>
      </div>

      {/* Tabs */}
      <div className="analytics-tab-buttons">
        <button
          className={`ana-tab-btn ${tab === 'volume' ? 'active' : ''}`}
          onClick={() => setTab('volume')}
        >
          VOLUME OSCILLOSCOPE
        </button>

        <button
          className={`ana-tab-btn ${tab === 'freshness' ? 'active' : ''}`}
          onClick={() => setTab('freshness')}
        >
          ORBITAL FRESHNESS SLA
        </button>

        <button
          className={`ana-tab-btn ${tab === 'schema' ? 'active' : ''}`}
          onClick={() => setTab('schema')}
        >
          SCHEMA AST CONTRACT
        </button>

        <button
          className={`ana-tab-btn ${tab === 'distribution' ? 'active' : ''}`}
          onClick={() => setTab('distribution')}
        >
          POPULATION STABILITY (PSI)
        </button>

        <button
          className={`ana-tab-btn ${tab === 'duplicate' ? 'active' : ''}`}
          onClick={() => setTab('duplicate')}
        >
          COLLISION DENSITY
        </button>
      </div>

      {/* 1. Volume Oscilloscope */}
      {tab === 'volume' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontFamily: 'monospace', color: '#7E8B9B', marginBottom: '8px' }}>
            <span>TARGET: kafka://orders.events.v1 (EVENTS / HOUR)</span>
            <span style={{ color: '#C7FF3D' }}>EXPECTED RANGE: ~83,000 / HR</span>
          </div>

          <div className="luminous-chart-viewport">
            <svg className="luminous-chart-svg" viewBox="0 0 600 170">
              <defs>
                <linearGradient id="neural-line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38E8FF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38E8FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Minimalist Grid Lines */}
              <line x1="30" y1="40" x2="570" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
              <line x1="30" y1="90" x2="570" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
              <line x1="30" y1="140" x2="570" y2="140" stroke="rgba(255,255,255,0.06)" />

              {(() => {
                const points = volumeData || [];
                if (points.length < 2) return null;
                const plotWidth = 520;
                const startX = 40;
                const maxVal = 100000;

                const coords = points.map((p, idx) => {
                  const x = startX + (idx / (points.length - 1)) * plotWidth;
                  const y = 140 - (p.value / maxVal) * 110;
                  return { x, y, val: p.value, ts: p.timestamp };
                });

                const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                const areaD = `${lineD} L ${coords[coords.length - 1].x} 140 L ${coords[0].x} 140 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#neural-line-grad)" />
                    <path d={lineD} fill="none" stroke="#38E8FF" strokeWidth="2" />
                    {coords.map((c, i) => {
                      const isAnomaly = c.val < 10000;
                      return (
                        <g key={i}>
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isAnomaly ? 5 : 2}
                            fill={isAnomaly ? '#FF4264' : '#C7FF3D'}
                            stroke={isAnomaly ? '#FFFFFF' : 'none'}
                            strokeWidth={isAnomaly ? 2 : 0}
                          />
                          {isAnomaly && (
                            <text
                              x={c.x}
                              y={c.y - 10}
                              fill="#FF4264"
                              fontSize="9.5"
                              fontWeight="800"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              4,210 (-94.9%)
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* 2. Orbital Freshness SLA */}
      {tab === 'freshness' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'var(--carbon)', border: '1px solid var(--border-hardware)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ width: '120px', height: '120px', position: 'relative' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={freshnessData?.sla_breached ? "#FF4264" : "#C7FF3D"}
                strokeWidth="5"
                strokeDasharray="251"
                strokeDashoffset={freshnessData?.sla_breached ? "30" : "200"}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <circle cx="50" cy="50" r="4" fill="#38E8FF" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#7E8B9B' }}>TOPIC WATERMARK DRIFT</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: freshnessData?.sla_breached ? '#FF4264' : '#C7FF3D', fontFamily: 'monospace' }}>
              {freshnessData?.sla_breached ? '1h 47m DELAY (BREACH)' : '4m DELAY (HEALTHY)'}
            </span>
            <p style={{ color: '#7E8B9B', fontSize: '0.78rem', lineHeight: 1.4 }}>
              Target: Ingestion watermark arrival &lt; 15 mins on <code>kafka://payments.trans.v1</code>.
            </p>
          </div>
        </div>
      )}

      {/* 3. Schema Contract AST */}
      {tab === 'schema' && (
        <div style={{ background: 'var(--carbon)', border: '1px solid var(--border-hardware)', borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.8 }}>
          <span style={{ color: '#7E8B9B' }}>// Entity: orders_clean (Contract: v1.4.0 ➔ {schemaData?.current_version})</span>
          {schemaData?.drift_detected ? (
            <>
              <div style={{ color: '#FF4264', background: 'rgba(255,66,100,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                - customer_id: string  /* REMOVED: Breaking downstream dbt models */
              </div>
              <div style={{ color: '#C7FF3D', background: 'rgba(199,255,61,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                + customerId: string   /* ADDED: Non-canonical camelCase identifier */
              </div>
              <div style={{ color: '#7E8B9B' }}>  email: string</div>
              <div style={{ color: '#7E8B9B' }}>  amount: float</div>
              <div style={{ color: '#7E8B9B' }}>  timestamp: timestamp</div>
            </>
          ) : (
            <>
              <div style={{ color: '#7E8B9B' }}>  customer_id: string</div>
              <div style={{ color: '#7E8B9B' }}>  email: string</div>
              <div style={{ color: '#7E8B9B' }}>  amount: float</div>
              <div style={{ color: '#7E8B9B' }}>  timestamp: timestamp</div>
              <div style={{ color: '#42F59B', marginTop: '6px' }}>✓ Schema strictly verified against enterprise registry</div>
            </>
          )}
        </div>
      )}

      {/* 4. Distribution PSI */}
      {tab === 'distribution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontFamily: 'monospace', color: '#7E8B9B' }}>
            <span>POPULATION STABILITY INDEX (PSI)</span>
            <span style={{ color: distributionData?.is_anomalous ? '#FF4264' : '#C7FF3D', fontWeight: 800 }}>
              PSI: {distributionData?.report?.psi_score ?? 0.04}
            </span>
          </div>

          {(distributionData?.report?.categories || []).map((c, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                <span style={{ color: '#F4F7FA' }}>{c.cohort}</span>
                <span style={{ color: c.current_pct > 80 ? '#FF4264' : '#7E8B9B' }}>
                  Base: {c.baseline_pct}% | Current: <strong style={{ color: c.current_pct > 80 ? '#FF4264' : '#F4F7FA' }}>{c.current_pct}%</strong>
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.current_pct}%`, background: c.current_pct > 80 ? '#FF4264' : '#C7FF3D' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Duplicate Collision */}
      {tab === 'duplicate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--carbon)', border: '1px solid var(--border-hardware)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#7E8B9B', display: 'block' }}>BASELINE COLLISION</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'monospace', color: '#F4F7FA' }}>0.20%</span>
          </div>
          <div style={{ background: 'var(--carbon)', border: '1px solid var(--border-hardware)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#7E8B9B', display: 'block' }}>DETECTED COLLISION</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'monospace', color: duplicateData?.breached ? '#FF4264' : '#C7FF3D' }}>
              {duplicateData?.report?.duplicate_rate_pct ?? 0.20}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
