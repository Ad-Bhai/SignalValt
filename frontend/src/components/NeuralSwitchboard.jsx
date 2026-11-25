import React from 'react';
import { Sliders, RefreshCw, Activity, Terminal, GitBranch, Clock, Copy, TrendingDown } from 'lucide-react';

export default function NeuralSwitchboard({ onInject, onReset, activeScenario, loading }) {
  const switches = [
    { id: 'volume_collapse', label: 'VOLUME COLLAPSE (83K ➔ 4.2K)', icon: TrendingDown },
    { id: 'schema_drift', label: 'SCHEMA MUTATION (customer_id)', icon: GitBranch },
    { id: 'distribution_skew', label: 'DISTRIBUTION SKEW (18-25: 91%)', icon: Activity },
    { id: 'freshness_breach', label: 'FRESHNESS SLA (1h 47m)', icon: Clock },
    { id: 'duplicate_spike', label: 'DUPLICATE STORM (31.8%)', icon: Copy },
  ];

  return (
    <section className="hardware-card switchboard-neural-panel">
      <div className="switchboard-title-text">
        <Terminal size={14} color="#38E8FF" />
        <span>SYNAPSE DISRUPTION INJECTOR</span>
      </div>

      <div className="switchboard-btns-cluster">
        {switches.map((sw) => {
          const Icon = sw.icon;
          const isActive = activeScenario === sw.id;
          return (
            <button
              key={sw.id}
              className={`neural-control-btn ${isActive ? 'active' : ''}`}
              onClick={() => onInject(sw.id)}
              disabled={loading}
              title={`Simulate ${sw.label}`}
            >
              <Icon size={12} color={isActive ? '#C7FF3D' : '#7E8B9B'} />
              <span>{sw.label}</span>
            </button>
          );
        })}

        <button
          className="neural-control-btn stabilize"
          onClick={onReset}
          disabled={loading}
          title="Stabilize & Normalize Neural Pathways"
        >
          <RefreshCw size={12} />
          <span>STABILIZE GRID</span>
        </button>
      </div>
    </section>
  );
}
