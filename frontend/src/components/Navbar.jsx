import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Navbar({ summary, activeTab, onTabChange, onReset }) {
  const score = summary?.reliability_score ?? 99.82;
  const criticalCount = summary?.critical_incidents_count ?? 0;
  const isHealthy = criticalCount === 0 && score >= 90;

  const tabs = ['OVERVIEW', 'PIPELINES', 'DATASETS', 'LINEAGE', 'INCIDENTS', 'INTELLIGENCE'];

  return (
    <header className="neural-nav hardware-card">
      <div className="nav-brand-group">
        <div className="brand-glyph-vault">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {/* Minimalist vault enclosure */}
            <path d="M4 8 L12 3 L20 8 L20 18 L12 21 L4 18 Z" stroke="#C7FF3D" strokeWidth="1.5" strokeLinejoin="round" />
            {/* S-shaped signal waveform */}
            <path d="M9 10 C9 8, 15 8, 15 11 C15 13, 9 13.5, 9 16 C9 18, 15 18, 15 16" stroke="#F4F7FA" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <div className="brand-title-main">
          SIGNAL<span className="lime">VAULT</span>
        </div>
      </div>

      <nav className="nav-menu-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`neural-tab-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="nav-status-telemetry">
        <div className={`neural-status-pill ${isHealthy ? '' : 'critical'}`}>
          <span className="beacon-pulse-dot"></span>
          <span>{score}% {isHealthy ? 'OPERATIONAL' : 'ANOMALY ALERT'}</span>
        </div>

        <button
          className="reset-hardware-btn"
          onClick={onReset}
          title="Stabilize & Restore Neural Grid"
        >
          <RefreshCw size={12} />
          <span>STABILIZE</span>
        </button>
      </div>
    </header>
  );
}
