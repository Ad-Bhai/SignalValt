import React, { useState } from 'react';
import { AreaChart, Compass, GitCommit, Sliders, Layers } from 'lucide-react';

export default function LiquidAnalytics({
  volumeData,
  schemaData,
  distributionData,
  freshnessData,
  duplicateData,
  activeIncident
}) {
  const [activeTab, setActiveTab] = useState('volume');

  return (
    <div className="liquid-surface analytics-panel-liquid">
      <div className="section-head-row">
        <h2 className="section-title-liquid">
          <Compass size={18} color="#65D9E8" />
          <span>Scientific Instrumentation</span>
        </h2>
        <span className="section-desc-liquid">Empirical telemetry models and statistical orbital dials</span>
      </div>

      {/* Tabs */}
      <div className="tab-selector-capsules">
        <button
          className={`sci-tab-btn ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          Flowing Volume Area
        </button>

        <button
          className={`sci-tab-btn ${activeTab === 'freshness' ? 'active' : ''}`}
          onClick={() => setActiveTab('freshness')}
        >
          Orbital Freshness Dial
        </button>

        <button
          className={`sci-tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Node-Difference Schema
        </button>

        <button
          className={`sci-tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          Distribution (PSI)
        </button>

        <button
          className={`sci-tab-btn ${activeTab === 'duplicate' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicate')}
        >
          Duplicate Ratio
        </button>
      </div>

      {/* 1. Flowing Area Graph */}
      {activeTab === 'volume' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'monospace', color: '#74777D', marginBottom: '8px' }}>
            <span>DATA STREAM DISCHARGE (HOURLY INGESTION)</span>
            <span style={{ color: '#8B7CFF' }}>BASELINE: ~83,000 / HR</span>
          </div>

          <div className="flowing-area-chart">
            <svg className="chart-svg-liquid" viewBox="0 0 600 180">
              <defs>
                <linearGradient id="liquid-flow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#65D9E8" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#8B7CFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C3B8FF" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Baseline reference curve */}
              <line x1="30" y1="50" x2="570" y2="50" stroke="#8B7CFF" strokeDasharray="3,4" strokeOpacity="0.3" strokeWidth="1" />

              {(() => {
                const points = volumeData || [];
                if (points.length < 2) return null;
                const plotWidth = 520;
                const startX = 40;
                const maxVal = 100000;

                const coords = points.map((p, idx) => {
                  const x = startX + (idx / (points.length - 1)) * plotWidth;
                  const y = 160 - (p.value / maxVal) * 130;
                  return { x, y, val: p.value, ts: p.timestamp };
                });

                const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                const areaD = `${lineD} L ${coords[coords.length - 1].x} 160 L ${coords[0].x} 160 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#liquid-flow-grad)" />
                    <path d={lineD} fill="none" stroke="#8B7CFF" strokeWidth="2.2" />

                    {coords.map((c, i) => {
                      const isAnomaly = c.val < 10000;
                      return (
                        <g key={i}>
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isAnomaly ? 5 : 2.5}
                            fill={isAnomaly ? "#E45858" : "#65D9E8"}
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                          {isAnomaly && (
                            <text
                              x={c.x}
                              y={c.y - 12}
                              fill="#E45858"
                              fontSize="9.5"
                              fontWeight="700"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              4,200 (Drop)
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

      {/* 2. Circular Orbital Freshness Dial */}
      {activeTab === 'freshness' && (
        <div className="orbital-dial-box">
          <div style={{ width: '130px', height: '130px', position: 'relative' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              {/* Outer track */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(24,25,27,0.08)" strokeWidth="6" />
              {/* Orbital progress */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={freshnessData?.sla_breached ? "#E45858" : "#20B486"}
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset={freshnessData?.sla_breached ? "40" : "210"}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <circle cx="50" cy="50" r="4" fill="#18191B" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#74777D' }}>
              ORBITAL INGESTION CADENCE
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: freshnessData?.sla_breached ? '#E45858' : '#20B486', fontFamily: 'monospace' }}>
              {freshnessData?.sla_breached ? '1h 47m Latency (Breach)' : '4m Latency (Nominal)'}
            </span>
            <p style={{ color: '#74777D', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Contractual target: Fresh data arrival &lt; 15 minutes on topic <code>kafka://payments.trans.v1</code>.
            </p>
          </div>
        </div>
      )}

      {/* 3. Node-Difference Schema View */}
      {activeTab === 'schema' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'monospace', color: '#74777D', marginBottom: '8px' }}>
            <span>STRUCTURAL CONTRACT DIFF</span>
            <span style={{ color: schemaData?.drift_detected ? '#E45858' : '#20B486' }}>
              {schemaData?.drift_detected ? 'MUTATION DETECTED' : 'SPEC INTACT'}
            </span>
          </div>

          <div className="node-diff-box">
            <span style={{ color: '#74777D' }}>@@ Entity: orders_clean (v1.4.0 ➔ {schemaData?.current_version}) @@</span>
            {schemaData?.drift_detected ? (
              <>
                <span className="diff-tag removed">- customer_id: string  (Field dropped by upstream producer)</span>
                <span className="diff-tag added">+ customerId: string   (Field introduced without canonical mapping)</span>
                <span style={{ color: '#74777D', display: 'block' }}>  email: string</span>
                <span style={{ color: '#74777D', display: 'block' }}>  amount: float</span>
                <span style={{ color: '#74777D', display: 'block' }}>  timestamp: timestamp</span>
              </>
            ) : (
              <>
                <span style={{ color: '#74777D', display: 'block' }}>  customer_id: string</span>
                <span style={{ color: '#74777D', display: 'block' }}>  email: string</span>
                <span style={{ color: '#74777D', display: 'block' }}>  amount: float</span>
                <span style={{ color: '#74777D', display: 'block' }}>  timestamp: timestamp</span>
                <span style={{ color: '#20B486', marginTop: '6px', display: 'block' }}>✓ Schema strictly verified against lakehouse catalog</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Distribution PSI Spectrum */}
      {activeTab === 'distribution' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'monospace', color: '#74777D', marginBottom: '8px' }}>
            <span>POPULATION STABILITY SPECTRUM (PSI)</span>
            <span style={{ color: distributionData?.is_anomalous ? '#E45858' : '#20B486', fontWeight: 700 }}>
              PSI: {distributionData?.report?.psi_score ?? 0.04}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(distributionData?.report?.categories || []).map((cat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#18191B', fontWeight: 600 }}>Cohort: {cat.cohort}</span>
                  <span style={{ color: cat.current_pct > 80 ? '#E45858' : '#74777D' }}>
                    Baseline: {cat.baseline_pct}% | Current: <strong style={{ color: cat.current_pct > 80 ? '#E45858' : '#18191B' }}>{cat.current_pct}%</strong>
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(24,25,27,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.current_pct}%`,
                      background: cat.current_pct > 80 ? '#E45858' : 'linear-gradient(90deg, #65D9E8, #8B7CFF)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Duplicate Ratio */}
      {activeTab === 'duplicate' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'monospace', color: '#74777D', marginBottom: '8px' }}>
            <span>KEY COLLISION DENSITY (order_id)</span>
            <span style={{ color: duplicateData?.breached ? '#E45858' : '#20B486', fontWeight: 700 }}>
              RATE: {duplicateData?.report?.duplicate_rate_pct ?? 0.2}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '14px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#74777D', display: 'block' }}>NORMAL BASELINE</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: '#18191B' }}>0.20%</span>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '14px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#74777D', display: 'block' }}>DETECTED SPIKE</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: duplicateData?.breached ? '#E45858' : '#20B486' }}>
                {duplicateData?.report?.duplicate_rate_pct ?? 0.20}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
