import React from 'react';
import { Sliders, RefreshCw, AlertCircle } from 'lucide-react';

export default function SimulatorControlBar({ onInject, onReset, loadingScenario, activeScenario }) {
  return (
    <section className="switchboard-bar">
      <div className="switchboard-header">
        <Sliders size={14} color="#E7B85C" />
        <span>SIGNAL INJECTION SWITCHBOARD</span>
      </div>

      <div className="switchboard-buttons">
        <button
          className={`switch-btn ${activeScenario === 'volume_collapse' ? 'active' : ''}`}
          onClick={() => onInject('volume_collapse')}
          disabled={loadingScenario}
        >
          <span>Volume Drop (83K ➔ 4.2K)</span>
        </button>

        <button
          className={`switch-btn ${activeScenario === 'schema_drift' ? 'active' : ''}`}
          onClick={() => onInject('schema_drift')}
          disabled={loadingScenario}
        >
          <span>Schema Drift (customer_id ➔ customerId)</span>
        </button>

        <button
          className={`switch-btn ${activeScenario === 'distribution_skew' ? 'active' : ''}`}
          onClick={() => onInject('distribution_skew')}
          disabled={loadingScenario}
        >
          <span>Distribution Skew (18-25: 91%)</span>
        </button>

        <button
          className={`switch-btn ${activeScenario === 'freshness_breach' ? 'active' : ''}`}
          onClick={() => onInject('freshness_breach')}
          disabled={loadingScenario}
        >
          <span>Freshness SLA (1h 47m Lag)</span>
        </button>

        <button
          className={`switch-btn ${activeScenario === 'duplicate_spike' ? 'active' : ''}`}
          onClick={() => onInject('duplicate_spike')}
          disabled={loadingScenario}
        >
          <span>Duplicate Storm (31.8%)</span>
        </button>

        <button
          className="switch-btn reset"
          onClick={onReset}
          disabled={loadingScenario}
        >
          <RefreshCw size={11} />
          <span>Heal System</span>
        </button>
      </div>
    </section>
  );
}
