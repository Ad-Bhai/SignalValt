import React from 'react';
import { SlidersHorizontal, RefreshCw, TrendingDown, GitBranch, BarChart2, Clock, Copy } from 'lucide-react';

export default function LiquidSwitchboard({ onInject, onReset, activeScenario, loading }) {
  const scenarios = [
    { id: 'volume_collapse', name: 'Volume Drop (83K ➔ 4.2K)', icon: TrendingDown },
    { id: 'schema_drift', name: 'Schema Drift (customer_id ➔ customerId)', icon: GitBranch },
    { id: 'distribution_skew', name: 'Distribution Skew (18-25: 91%)', icon: BarChart2 },
    { id: 'freshness_breach', name: 'Freshness SLA (1h 47m Lag)', icon: Clock },
    { id: 'duplicate_spike', name: 'Duplicate Storm (31.8%)', icon: Copy },
  ];

  return (
    <section className="liquid-surface liquid-switchboard">
      <div className="switchboard-intro">
        <SlidersHorizontal size={16} color="#8B7CFF" />
        <span className="switchboard-label">Anomaly Injection Controls</span>
      </div>

      <div className="switchboard-grid-btns">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              className={`liquid-btn ${isActive ? 'active' : ''}`}
              onClick={() => onInject(sc.id)}
              disabled={loading}
              title={`Simulate ${sc.name}`}
            >
              <Icon size={13} color={isActive ? '#8B7CFF' : '#74777D'} />
              <span>{sc.name}</span>
            </button>
          );
        })}

        <button
          className="liquid-btn heal-btn"
          onClick={onReset}
          disabled={loading}
          title="Restore Nominal Pipeline Health"
        >
          <RefreshCw size={13} />
          <span>Heal & Restore Flow</span>
        </button>
      </div>
    </section>
  );
}
