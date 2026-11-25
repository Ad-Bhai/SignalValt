import React from 'react';
import { Sparkles, Activity, ShieldCheck, Database, Zap } from 'lucide-react';
import LiquidSphereCanvas from './LiquidSphereCanvas';

export default function LiquidHero({ summary, activeIncident }) {
  const score = summary?.reliability_score ?? 99.82;
  const totalAssets = summary?.total_monitored_assets ?? 184;

  return (
    <section className="liquid-hero-grid">
      {/* Left: Headline & Scientific Value Proposition */}
      <div className="liquid-surface hero-statement-card">
        <div>
          <div className="hero-eyebrow">
            <Sparkles size={14} color="#8B7CFF" />
            <span>Autonomous Data Reliability Lab</span>
          </div>

          <h1 className="hero-main-headline">
            Know when your data <span className="gradient-text">stops making sense.</span>
          </h1>

          <p className="hero-subheadline">
            SIGNALVAULT continuously observes pipelines, detects anomalies before corruption spreads, and traces downstream blast-radius impact with mathematical precision.
          </p>
        </div>

        {/* Floating translucent metric capsules */}
        <div className="hero-metrics-capsules">
          <div className="metric-pill-card">
            <span className="metric-pill-val" style={{ color: activeIncident ? '#E45858' : '#20B486' }}>
              {score}%
            </span>
            <span className="metric-pill-lbl">Data Trust Index</span>
          </div>

          <div className="metric-pill-card">
            <span className="metric-pill-val">
              184
            </span>
            <span className="metric-pill-lbl">Monitored Datasets</span>
          </div>

          <div className="metric-pill-card">
            <span className="metric-pill-val">
              12
            </span>
            <span className="metric-pill-lbl">Active Pipelines</span>
          </div>

          <div className="metric-pill-card">
            <span className="metric-pill-val" style={{ color: '#8B7CFF' }}>
              18ms
            </span>
            <span className="metric-pill-lbl">Detection Latency</span>
          </div>
        </div>
      </div>

      {/* Right: Transparent 3D Data Sphere */}
      <div className="liquid-surface hero-sphere-card">
        <div className="sphere-header-tag">
          <Activity size={13} color="#65D9E8" />
          <span>LIVING DATA FIELD</span>
        </div>

        <LiquidSphereCanvas activeIncident={activeIncident} />

        <div className="sphere-caption">
          {activeIncident ? (
            <span style={{ color: '#E45858', fontWeight: 600 }}>
              ● Anomaly distortion detected in active data cluster
            </span>
          ) : (
            <span style={{ color: '#74777D' }}>
              ● Smooth organized flow across 550 observable signals
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
