import React, { useState, useEffect } from 'react';
import { TrendingDown, GitBranch, BarChart3, Clock, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MetricDeepDive({
  volumeData,
  schemaData,
  distributionData,
  freshnessData,
  duplicateData,
  activeIncident
}) {
  const [activeTab, setActiveTab] = useState('volume');

  // Automatically switch tab if an incident of that type is active
  useEffect(() => {
    if (activeIncident) {
      if (activeIncident.anomaly_type === 'VOLUME_ANOMALY') setActiveTab('volume');
      else if (activeIncident.anomaly_type === 'SCHEMA_DRIFT') setActiveTab('schema');
      else if (activeIncident.anomaly_type === 'DISTRIBUTION_ANOMALY') setActiveTab('distribution');
      else if (activeIncident.anomaly_type === 'FRESHNESS_ANOMALY') setActiveTab('freshness');
      else if (activeIncident.anomaly_type === 'DUPLICATE_EXPLOSION') setActiveTab('duplicate');
    }
  }, [activeIncident]);

  return (
    <div className="glass-panel deepdive-section">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2 className="section-title">
            <BarChart3 size={20} color="#00F2FE" />
            <span>Telemetry & Statistical Anomaly Deep Dive</span>
          </h2>
          <p className="section-subtitle">Real-time inspection across the 5 core data reliability dimensions.</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          <TrendingDown size={15} />
          <span>1. Volume Profile</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          <GitBranch size={15} />
          <span>2. Schema Drift Contract</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          <BarChart3 size={15} />
          <span>3. Distribution Shift (PSI)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'freshness' ? 'active' : ''}`}
          onClick={() => setActiveTab('freshness')}
        >
          <Clock size={15} />
          <span>4. Freshness & SLA</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'duplicate' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicate')}
        >
          <Copy size={15} />
          <span>5. Duplicate Storm</span>
        </button>
      </div>

      {/* Tab 1: Volume */}
      {activeTab === 'volume' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                Hourly Event Volume Trend vs Dynamic Baseline
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Target: orders.events.v1 | Normal range: 75K - 90K events/hr
              </p>
            </div>
            {volumeData?.some(v => v.value < 10000) && (
              <div className="live-beacon critical">
                <span>COLLAPSE DETECTED: 4,200 EVENTS (-94.9%)</span>
              </div>
            )}
          </div>

          {/* SVG Line Chart */}
          <div style={{ height: '240px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="vol-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Baseline Band */}
              <rect x="50" y="30" width="700" height="50" fill="rgba(0, 242, 254, 0.05)" rx="4" />
              <line x1="50" y1="55" x2="750" y2="55" stroke="#00F2FE" strokeDasharray="4,4" strokeOpacity="0.4" />

              {/* Data points */}
              {(() => {
                const points = volumeData || [];
                if (points.length < 2) return null;
                const maxVal = 100000;
                const minVal = 0;
                const plotWidth = 700;
                const plotHeight = 150;
                const startX = 50;
                const startY = 170;

                const coords = points.map((pt, i) => {
                  const x = startX + (i / (points.length - 1)) * plotWidth;
                  const y = startY - (pt.value / maxVal) * plotHeight;
                  return { x, y, pt };
                });

                const pathStr = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

                return (
                  <>
                    <path d={pathStr} fill="none" stroke="#00F2FE" strokeWidth="2.5" />
                    {coords.map((c, i) => {
                      const isAnomaly = c.pt.value < 10000;
                      return (
                        <g key={i}>
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isAnomaly ? 6 : 3.5}
                            fill={isAnomaly ? '#FF0055' : '#00F2FE'}
                            stroke={isAnomaly ? '#FFFFFF' : 'none'}
                            strokeWidth={isAnomaly ? 2 : 0}
                          />
                          <text
                            x={c.x}
                            y={190}
                            textAnchor="middle"
                            fill="#64748B"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {c.pt.timestamp}
                          </text>
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

      {/* Tab 2: Schema Drift */}
      {activeTab === 'schema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                Schema Contract Diff: orders_clean ({schemaData?.previous_version} ➔ {schemaData?.current_version})
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Continuous DDL & serialization contract inspection
              </p>
            </div>
            {schemaData?.drift_detected && (
              <div className="live-beacon critical">
                <span>CRITICAL SCHEMA DRIFT FLAGGED</span>
              </div>
            )}
          </div>

          <div className="diff-container">
            <span className="diff-line unchanged">@@ Contract version {schemaData?.previous_version} ➔ {schemaData?.current_version} @@</span>
            {schemaData?.drift_detected ? (
              <>
                <span className="diff-line removed">- customer_id: string  /* REMOVED: Breaking change for 4 downstream models */</span>
                <span className="diff-line added">+ customerId: string   /* ADDED: Non-canonical camelCase identifier */</span>
                <span className="diff-line unchanged">  email: string</span>
                <span className="diff-line unchanged">  amount: float</span>
                <span className="diff-line unchanged">  timestamp: timestamp</span>
              </>
            ) : (
              <>
                <span className="diff-line unchanged">  customer_id: string</span>
                <span className="diff-line unchanged">  email: string</span>
                <span className="diff-line unchanged">  amount: float</span>
                <span className="diff-line unchanged">  timestamp: timestamp</span>
                <span className="diff-line unchanged">/* Schema matches registered enterprise contract */</span>
              </>
            )}
          </div>

          {schemaData?.drift_detected && (
            <div className="action-box" style={{ borderLeft: '4px solid #9D4EDD' }}>
              <div style={{ fontWeight: 700, color: '#9D4EDD', marginBottom: '4px' }}>
                Automated Fuzzy Rename Identification
              </div>
              <div style={{ color: '#E2E8F0' }}>
                Detected column alias rename: <code style={{ color: '#FF5A87' }}>customer_id</code> ➔ <code style={{ color: '#4EEDB2' }}>customerId</code> (95% Confidence).
              </div>
              <div style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.78rem' }}>
                Potential Downstream Blast Radius: 7 datasets, 3 pipelines, 2 dashboards.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Distribution Anomaly */}
      {activeTab === 'distribution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                Population Stability Index (PSI): user_demographics.age
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Drift threshold: PSI &lt; 0.10 (Stable) | PSI &gt; 0.25 (Significant Shift)
              </p>
            </div>
            <div
              className={`live-beacon ${distributionData?.is_anomalous ? 'critical' : ''}`}
            >
              <span>PSI: {distributionData?.report?.psi_score ?? 0.04} ({distributionData?.report?.status ?? 'STABLE'})</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(distributionData?.report?.categories || []).map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#F8FAFC', fontWeight: 600 }}>Cohort: {cat.cohort}</span>
                  <span>
                    Baseline: <span style={{ color: '#00F2FE' }}>{cat.baseline_pct}%</span> | Current:{' '}
                    <span style={{ color: cat.current_pct > 80 ? '#FF0055' : '#06D6A0', fontWeight: 700 }}>
                      {cat.current_pct}%
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${cat.current_pct}%`,
                      background: cat.current_pct > 80 ? 'linear-gradient(90deg, #FF0055, #FF5A87)' : 'linear-gradient(90deg, #00F2FE, #4FACFE)',
                      transition: 'width 0.5s ease'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                Partition Freshness & Ingestion SLA Monitoring
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Target: kafka://payments.trans.v1 | Contractual Arrival: Every 10 mins
              </p>
            </div>
            <div className={`live-beacon ${freshnessData?.sla_breached ? 'critical' : ''}`}>
              <span>{freshnessData?.sla_breached ? 'SLA BREACHED (1h 47m LAG)' : 'SLA COMPLIANT (4m LAG)'}</span>
            </div>
          </div>

          <div className="action-box" style={{ borderLeft: freshnessData?.sla_breached ? '4px solid #FF0055' : '4px solid #06D6A0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>CONTRACT CADENCE</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00F2FE' }}>Every 10 min</span>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>MAX SLA THRESHOLD</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94A3B8' }}>15 min (900s)</span>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>CURRENT LAG</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: freshnessData?.sla_breached ? '#FF0055' : '#06D6A0' }}>
                  {freshnessData?.sla_breached ? '1 hr 47 mins (107m)' : '4 mins'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>PIPELINE STATUS</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: freshnessData?.sla_breached ? '#FF0055' : '#06D6A0' }}>
                  {freshnessData?.sla_breached ? 'STALLED' : 'HEALTHY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Duplicate Storm */}
      {activeTab === 'duplicate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                Primary Key Uniqueness & Deduplication Ratio
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Target: orders_clean (Key: order_id) | Normal duplicate rate: 0.2%
              </p>
            </div>
            <div className={`live-beacon ${duplicateData?.breached ? 'critical' : ''}`}>
              <span>{duplicateData?.breached ? 'DUPLICATE EXPLOSION: 31.8%' : 'DUPLICATE RATE: 0.2% (NOMINAL)'}</span>
            </div>
          </div>

          <div className="action-box" style={{ borderLeft: duplicateData?.breached ? '4px solid #FF0055' : '4px solid #06D6A0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>ANALYZED SAMPLE</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {(duplicateData?.report?.total_records || 100000).toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>DUPLICATE RECORDS</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: duplicateData?.breached ? '#FF0055' : '#06D6A0' }}>
                  {(duplicateData?.report?.duplicate_records || 200).toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>DUPLICATE RATE</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: duplicateData?.breached ? '#FF0055' : '#06D6A0' }}>
                  {duplicateData?.report?.duplicate_rate_pct ?? 0.2}%
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>ALERT THRESHOLD</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94A3B8' }}>
                  &gt; 5.0%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
