import React, { useState } from 'react';
import { TrendingDown, GitBranch, BarChart3, Clock, Copy } from 'lucide-react';

export default function AnalyticsSection({
  volumeData,
  schemaData,
  distributionData,
  freshnessData,
  duplicateData,
  activeIncident
}) {
  const [activeTab, setActiveTab] = useState('volume');

  return (
    <div className="analytics-panel">
      <div className="section-title-bar" style={{ marginBottom: '14px' }}>
        <h2 className="section-heading">
          <BarChart3 size={15} color="#E7B85C" />
          <span>ANALYTICS & RELIABILITY METRICS</span>
        </h2>
        <span className="section-caption">Telemetry signals & statistical distributions</span>
      </div>

      {/* Tabs */}
      <div className="tab-selector">
        <button
          className={`obs-tab ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          Data Volume
        </button>
        <button
          className={`obs-tab ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Schema Contract
        </button>
        <button
          className={`obs-tab ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          Distribution (PSI)
        </button>
        <button
          className={`obs-tab ${activeTab === 'freshness' ? 'active' : ''}`}
          onClick={() => setActiveTab('freshness')}
        >
          Freshness SLA
        </button>
        <button
          className={`obs-tab ${activeTab === 'duplicate' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicate')}
        >
          Duplicate Storm
        </button>
      </div>

      {/* Tab 1: Data Volume */}
      {activeTab === 'volume' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#8B9299' }}>
              TARGET: kafka://orders.events.v1 (EVENTS / HOUR)
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#E7B85C' }}>
              EXPECTED: ~83,000 / HR
            </span>
          </div>

          <div className="clean-chart-container">
            <svg className="chart-svg" viewBox="0 0 600 200">
              {/* Minimal Axis & Baseline Grid */}
              <line x1="40" y1="20" x2="40" y2="170" className="chart-axis-line" />
              <line x1="40" y1="170" x2="580" y2="170" className="chart-axis-line" />
              
              {/* Expected Baseline Reference Line */}
              <line x1="40" y1="55" x2="580" y2="55" stroke="#E7B85C" strokeDasharray="3, 4" strokeOpacity="0.35" strokeWidth="1" />
              <text x="45" y="48" fill="#E7B85C" fontSize="9" fontFamily="monospace" opacity="0.6">
                BASELINE ~83K
              </text>

              {/* Minimal Axis Labels */}
              <text x="32" y="58" fill="#575D65" fontSize="8" fontFamily="monospace" textAnchor="end">83k</text>
              <text x="32" y="110" fill="#575D65" fontSize="8" fontFamily="monospace" textAnchor="end">40k</text>
              <text x="32" y="170" fill="#575D65" fontSize="8" fontFamily="monospace" textAnchor="end">0</text>

              {/* Plot Clean Trend Line */}
              {(() => {
                const points = volumeData || [];
                if (points.length < 2) return null;
                const plotWidth = 520;
                const startX = 50;
                const maxVal = 100000;

                const coords = points.map((p, idx) => {
                  const x = startX + (idx / (points.length - 1)) * plotWidth;
                  const y = 170 - (p.value / maxVal) * 140;
                  return { x, y, val: p.value, ts: p.timestamp };
                });

                const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

                return (
                  <>
                    <path d={pathD} className="chart-trend-line" />
                    {coords.map((c, i) => {
                      const isAnomaly = c.val < 10000;
                      return (
                        <g key={i}>
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isAnomaly ? 5 : 2}
                            fill={isAnomaly ? "#EF4444" : "#E7B85C"}
                            stroke={isAnomaly ? "#FFFFFF" : "none"}
                            strokeWidth={isAnomaly ? 1.5 : 0}
                            className={isAnomaly ? "chart-anomaly-point" : ""}
                          />
                          {isAnomaly && (
                            <text
                              x={c.x}
                              y={c.y - 10}
                              fill="#EF4444"
                              fontSize="9"
                              fontWeight="700"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              4,200 (-94.9%)
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

      {/* Tab 2: Schema Contract Diff */}
      {activeTab === 'schema' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#8B9299' }}>
              CONTRACT VERSION: {schemaData?.previous_version} ➔ {schemaData?.current_version}
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: schemaData?.drift_detected ? '#EF4444' : '#39C98A' }}>
              {schemaData?.drift_detected ? 'DRIFT FLAGGED' : 'CONTRACT INTACT'}
            </span>
          </div>

          <div className="technical-diff">
            <span className="diff-row same">@@ Contract definition for orders_clean @@</span>
            {schemaData?.drift_detected ? (
              <>
                <span className="diff-row del">- customer_id: string  /* REMOVED - Downstream breaking change */</span>
                <span className="diff-row add">+ customerId: string   /* ADDED - Non-canonical identifier */</span>
                <span className="diff-row same">  email: string</span>
                <span className="diff-row same">  amount: float</span>
                <span className="diff-row same">  timestamp: timestamp</span>
              </>
            ) : (
              <>
                <span className="diff-row same">  customer_id: string</span>
                <span className="diff-row same">  email: string</span>
                <span className="diff-row same">  amount: float</span>
                <span className="diff-row same">  timestamp: timestamp</span>
                <span className="diff-row same">/* Schema strictly matches registered specification */</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Distribution (PSI) */}
      {activeTab === 'distribution' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#8B9299' }}>
              DIMENSION: user_demographics.age
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: distributionData?.is_anomalous ? '#EF4444' : '#39C98A' }}>
              PSI: {distributionData?.report?.psi_score ?? 0.04} ({distributionData?.report?.status ?? 'STABLE'})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(distributionData?.report?.categories || []).map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#F5F5F0' }}>Cohort: {cat.cohort}</span>
                  <span style={{ color: cat.current_pct > 80 ? '#EF4444' : '#8B9299' }}>
                    Baseline: {cat.baseline_pct}% | Current: <strong style={{ color: cat.current_pct > 80 ? '#EF4444' : '#F5F5F0' }}>{cat.current_pct}%</strong>
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-graphite)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.current_pct}%`,
                      background: cat.current_pct > 80 ? '#EF4444' : '#E7B85C'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Freshness SLA */}
      {activeTab === 'freshness' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#8B9299' }}>
              TOPIC: kafka://payments.trans.v1
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: freshnessData?.sla_breached ? '#EF4444' : '#39C98A' }}>
              {freshnessData?.sla_breached ? 'SLA VIOLATION' : 'NOMINAL FRESHNESS'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>CONTRACT ARRIVAL</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace', color: '#F5F5F0' }}>Every 10 min</span>
            </div>
            <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>CURRENT LAG</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', color: freshnessData?.sla_breached ? '#EF4444' : '#39C98A' }}>
                {freshnessData?.sla_breached ? '1h 47m (107m)' : '4 min'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Duplicate Storm */}
      {activeTab === 'duplicate' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#8B9299' }}>
              PRIMARY KEY: orders_clean (order_id)
            </span>
            <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: duplicateData?.breached ? '#EF4444' : '#39C98A' }}>
              {duplicateData?.breached ? 'DUPLICATE STORM' : 'DEDUP NOMINAL'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>NORMAL BASELINE</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace', color: '#F5F5F0' }}>0.20%</span>
            </div>
            <div style={{ background: 'var(--bg-graphite)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#575D65', display: 'block' }}>DETECTED DUPLICATES</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', color: duplicateData?.breached ? '#EF4444' : '#39C98A' }}>
                {duplicateData?.report?.duplicate_rate_pct ?? 0.20}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
