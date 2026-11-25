import React, { useState } from 'react';

export default function LuxeInstruments({
  volumeData,
  schemaData,
  distributionData,
  freshnessData,
  duplicateData,
  activeIncident
}) {
  const [activeTab, setActiveTab] = useState('volume');

  return (
    <div className="editorial-panel">
      <div className="section-code">
        <span className="number">04</span>
        <span>/</span>
        <span>SCIENTIFIC INSTRUMENTS & TELEMETRY</span>
      </div>

      {/* Tabs */}
      <div className="instruments-tabs">
        <button
          className={`instrument-tab-btn ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          DATA VOLUME
        </button>

        <button
          className={`instrument-tab-btn ${activeTab === 'freshness' ? 'active' : ''}`}
          onClick={() => setActiveTab('freshness')}
        >
          WATERMARK LAG
        </button>

        <button
          className={`instrument-tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          SCHEMA AST
        </button>

        <button
          className={`instrument-tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          STABILITY (PSI)
        </button>

        <button
          className={`instrument-tab-btn ${activeTab === 'duplicate' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicate')}
        >
          COLLISION DENSITY
        </button>
      </div>

      {/* 1. DATA VOLUME OSCILLOSCOPE */}
      {activeTab === 'volume' && (
        <div className="chart-viewport-luxe">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>TARGET: kafka://orders.events.v1 (HOURLY INGRESS)</span>
            <span style={{ color: 'var(--champagne-gold)' }}>BASELINE: ~83,000 EVENTS/HR</span>
          </div>

          <svg viewBox="0 0 700 180" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Minimalist Axis & Hairline Grids */}
            <line x1="40" y1="30" x2="680" y2="30" stroke="#1E2024" strokeWidth="1" strokeDasharray="2,4" />
            <line x1="40" y1="80" x2="680" y2="80" stroke="#1E2024" strokeWidth="1" strokeDasharray="2,4" />
            <line x1="40" y1="130" x2="680" y2="130" stroke="#242629" strokeWidth="1" />

            {/* Y-axis Labels */}
            <text x="32" y="34" fill="#75797E" fontSize="9" fontFamily="monospace" textAnchor="end">100k</text>
            <text x="32" y="84" fill="#75797E" fontSize="9" fontFamily="monospace" textAnchor="end">50k</text>
            <text x="32" y="134" fill="#75797E" fontSize="9" fontFamily="monospace" textAnchor="end">0</text>

            {(() => {
              const points = volumeData || [];
              if (points.length < 2) return null;
              const plotWidth = 620;
              const startX = 50;
              const maxVal = 100000;

              const coords = points.map((p, idx) => {
                const x = startX + (idx / (points.length - 1)) * plotWidth;
                const y = 130 - (p.value / maxVal) * 100;
                return { x, y, val: p.value, ts: p.timestamp };
              });

              const lineD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

              return (
                <>
                  {/* Clean Ivory Vector Line */}
                  <path d={lineD} fill="none" stroke="#F4F1EA" strokeWidth="1.4" />

                  {/* Data Point Beads */}
                  {coords.map((c, i) => {
                    const isAnomaly = c.val < 10000;
                    return (
                      <g key={i}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={isAnomaly ? 4 : 2}
                          fill={isAnomaly ? '#8F2525' : '#B89A63'}
                          stroke={isAnomaly ? '#FFFFFF' : 'none'}
                          strokeWidth={isAnomaly ? 1.5 : 0}
                        />

                        {/* Quiet Editorial Anomaly Annotation */}
                        {isAnomaly && (
                          <g>
                            <line x1={c.x} y1={c.y + 6} x2={c.x} y2={c.y + 24} stroke="#8F2525" strokeWidth="1" />
                            <circle cx={c.x} cy={c.y + 24} r="2" fill="#8F2525" />
                            <text
                              x={c.x}
                              y={c.y - 10}
                              fill="#8F2525"
                              fontSize="10"
                              fontWeight="600"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              DEVIATION: 4,210 (-94.9%)
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* 2. WATERMARK LAG (FRESHNESS) */}
      {activeTab === 'freshness' && (
        <div className="chart-viewport-luxe">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>PARTITION: s3://lakehouse/bronze/payments (WATERMARK SLA)</span>
            <span style={{ color: freshnessData?.current_lag_minutes > 15 ? '#8F2525' : 'var(--healthy-forest)' }}>
              {freshnessData?.current_lag_minutes > 15 ? 'CRITICAL SLA BREACH' : 'SLA COMPLIANT'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '14px 0' }}>
            <div style={{ background: '#0D0E0F', padding: '16px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">CURRENT WATERMARK LAG</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: freshnessData?.current_lag_minutes > 15 ? '#8F2525' : '#F4F1EA', marginTop: '6px' }}>
                {freshnessData?.current_lag_minutes ?? 1.2} min
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '16px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">MAX CONTRACT SLA</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: '#B89A63', marginTop: '6px' }}>
                15.0 min
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '16px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">INGRESS CADENCE</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: '#F4F1EA', marginTop: '6px' }}>
                Continuous Micro-Batch
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCHEMA AST LEDGER */}
      {activeTab === 'schema' && (
        <div className="chart-viewport-luxe">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>TARGET: kafka://orders.events.v1 (STRUCTURAL CONTRACT DIFF)</span>
            <span style={{ color: schemaData?.status === 'DEVIATION' ? '#8F2525' : 'var(--champagne-gold)' }}>
              {schemaData?.status === 'DEVIATION' ? 'BREAKING CHANGE DETECTED' : 'CONTRACT IN EQUILIBRIUM'}
            </span>
          </div>

          <table className="luxe-table">
            <thead>
              <tr>
                <th>FIELD NAME</th>
                <th>BASELINE TYPE</th>
                <th>OBSERVED TYPE</th>
                <th>NULLABILITY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)' }}>order_id</td>
                <td>STRING</td>
                <td>STRING</td>
                <td>NON_NULL</td>
                <td style={{ color: 'var(--healthy-forest)' }}>MATCH</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: schemaData?.status === 'DEVIATION' ? '#8F2525' : undefined }}>
                  {schemaData?.status === 'DEVIATION' ? 'customer_id ➔ customerId' : 'customer_id'}
                </td>
                <td>STRING</td>
                <td style={{ color: schemaData?.status === 'DEVIATION' ? '#8F2525' : undefined }}>
                  {schemaData?.status === 'DEVIATION' ? 'MISSING / RENAMED' : 'STRING'}
                </td>
                <td>NON_NULL</td>
                <td style={{ color: schemaData?.status === 'DEVIATION' ? '#8F2525' : 'var(--healthy-forest)', fontWeight: 600 }}>
                  {schemaData?.status === 'DEVIATION' ? 'FIELD DRIFT' : 'MATCH'}
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)' }}>amount_cents</td>
                <td>INT64</td>
                <td>INT64</td>
                <td>NON_NULL</td>
                <td style={{ color: 'var(--healthy-forest)' }}>MATCH</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)' }}>event_timestamp</td>
                <td>TIMESTAMP</td>
                <td>TIMESTAMP</td>
                <td>NON_NULL</td>
                <td style={{ color: 'var(--healthy-forest)' }}>MATCH</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 4. POPULATION STABILITY (PSI) */}
      {activeTab === 'distribution' && (
        <div className="chart-viewport-luxe">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>METRIC: order_amount_distribution (POPULATION STABILITY INDEX)</span>
            <span style={{ color: distributionData?.psi_score > 0.25 ? '#8F2525' : 'var(--healthy-forest)' }}>
              PSI = {distributionData?.psi_score ?? 0.04} ({distributionData?.psi_score > 0.25 ? 'SIGNIFICANT SHIFT' : 'NO SHIFT'})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', margin: '14px 0' }}>
            <div style={{ background: '#0D0E0F', padding: '14px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">TIER 1 (0–$25)</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#F4F1EA', marginTop: '4px' }}>
                45.2% vs 44.8%
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '14px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">TIER 2 ($25–$100)</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#F4F1EA', marginTop: '4px' }}>
                38.1% vs 37.9%
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '14px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">TIER 3 ($100–$500)</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: distributionData?.psi_score > 0.25 ? '#8F2525' : '#F4F1EA', marginTop: '4px' }}>
                {distributionData?.psi_score > 0.25 ? '4.1% (COLLAPSED)' : '14.2% vs 14.5%'}
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '14px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">TIER 4 (&gt;$500)</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#F4F1EA', marginTop: '4px' }}>
                2.5% vs 2.8%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. COLLISION DENSITY (DUPLICATE STORM) */}
      {activeTab === 'duplicate' && (
        <div className="chart-viewport-luxe">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>METRIC: idempotency_key_collision_rate (EVENT DE-DUPLICATION ENGINE)</span>
            <span style={{ color: duplicateData?.collision_rate_pct > 5 ? '#8F2525' : 'var(--healthy-forest)' }}>
              COLLISION RATE: {duplicateData?.collision_rate_pct ?? 0.02}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '14px 0' }}>
            <div style={{ background: '#0D0E0F', padding: '16px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">OBSERVED COLLISIONS</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: duplicateData?.collision_rate_pct > 5 ? '#8F2525' : '#F4F1EA', marginTop: '6px' }}>
                {duplicateData?.collision_rate_pct > 5 ? '39,420 events' : '14 events'}
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '16px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">EXCESS RATIO</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: duplicateData?.collision_rate_pct > 5 ? '#8F2525' : '#B89A63', marginTop: '6px' }}>
                {duplicateData?.collision_rate_pct > 5 ? '48.2%' : '<0.05%'}
              </div>
            </div>
            <div style={{ background: '#0D0E0F', padding: '16px', border: '1px solid #242629' }}>
              <span className="hero-stat-label">DE-DUPLICATION BUFFER</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: '#F4F1EA', marginTop: '6px' }}>
                100% Intercepted
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
