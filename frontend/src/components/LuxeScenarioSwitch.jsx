import React from 'react';
import { Play, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function LuxeScenarioSwitch({ onInject, onReset, activeScenario, loading }) {
  const scenarios = [
    { id: 'volume_drop', code: '01', label: 'VOLUME COLLAPSE', desc: '82k ➔ 4.2k events/hr (IQR Outlier)' },
    { id: 'schema_drift', code: '02', label: 'SCHEMA DRIFT', desc: 'customer_id ➔ customerId (AST Diff)' },
    { id: 'distribution_shift', code: '03', label: 'DISTRIBUTION SHIFT', desc: 'PSI score = 0.42 > 0.25 (Drift)' },
    { id: 'freshness_sla', code: '04', label: 'FRESHNESS SLA LAG', desc: 'Watermark lag 107m > 15m (Stall)' },
    { id: 'duplicate_spike', code: '05', label: 'DUPLICATE STORM', desc: '48.2% Collision Rate (Hash Storm)' },
  ];

  return (
    <div className="luxe-switchboard-strip">
      <div className="switchboard-header">
        <div className="switchboard-title">
          <span>CALIBRATION SUITE // SIMULATE SYSTEM DEVIATION</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          SYSTEMATIC ENGINE INTERCEPTOR
        </span>
      </div>

      <div className="switchboard-buttons-row">
        {scenarios.map((sc) => {
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              className={`luxe-scenario-btn ${isActive ? 'active' : ''}`}
              onClick={() => onInject(sc.id)}
              disabled={loading}
              title={sc.desc}
            >
              <span style={{ color: isActive ? '#8F2525' : '#B89A63' }}>[{sc.code}]</span>
              <span>{sc.label}</span>
              {isActive && <AlertTriangle size={12} color="#8F2525" />}
            </button>
          );
        })}

        <button
          className="luxe-scenario-btn stabilize"
          onClick={onReset}
          disabled={loading}
          title="Restore baseline equilibrium across all 184 datasets"
        >
          <RotateCcw size={12} />
          <span>STABILIZE VAULT</span>
        </button>
      </div>
    </div>
  );
}
