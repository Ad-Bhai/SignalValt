import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function LuxeNavbar({ summary, activeTab, onTabChange, onReset, activeIncident }) {
  const score = summary?.reliability_score ?? 99.82;
  const isHealthy = !activeIncident;
  const tabs = ['OVERVIEW', 'PIPELINES', 'DATASETS', 'LINEAGE', 'INCIDENTS'];

  return (
    <header className="luxe-navbar">
      {/* Brand & Editorial Monogram */}
      <div className="luxe-brand-lockup" onClick={() => onTabChange('OVERVIEW')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* Architectural Vault Enclosure */}
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#B89A63" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="5" stroke="#A6A8AA" strokeWidth="1" strokeDasharray="2,2" />
          {/* S-shaped signal waveform */}
          <path d="M8 9 C8 7, 16 7, 16 10 C16 13, 8 13.5, 8 16 C8 18, 16 18, 16 15" stroke="#F4F1EA" strokeWidth="1.4" strokeLinecap="round" />
        </svg>

        <div className="luxe-brand-title">
          SIGNALVAULT
        </div>

        <div className="luxe-brand-sub">
          Precision Instruments
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="luxe-nav-links">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`luxe-nav-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Telemetry Status & Recalibration */}
      <div className="luxe-nav-actions">
        <div className="luxe-system-pill">
          <span>SYSTEM</span>
          <span>{score}%</span>
          <span className={`status-dot-luxe ${isHealthy ? '' : 'incident'}`}></span>
        </div>

        <button
          className="luxe-recalibrate-btn"
          onClick={onReset}
          title="Restore baseline equilibrium"
        >
          <RotateCcw size={11} />
          <span>RE-CALIBRATE</span>
        </button>
      </div>
    </header>
  );
}
