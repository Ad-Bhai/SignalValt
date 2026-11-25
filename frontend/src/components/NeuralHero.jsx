import React from 'react';
import { Radio, Zap } from 'lucide-react';
import NeuralCoreCanvas from './NeuralCoreCanvas';

export default function NeuralHero({ summary, activeIncident }) {
  const score = summary?.reliability_score ?? 99.82;
  const isHealthy = !activeIncident && score >= 90;

  return (
    <section className="hero-neural-grid">
      {/* Left: Statement & Live Telemetry */}
      <div className="hardware-card hero-pulse-card">
        <div>
          <div className="eyebrow-tech">
            <Radio size={13} color="#38E8FF" />
            <span>NEURAL DATA OBSERVABILITY PLATFORM // 2035 CORE</span>
          </div>

          <h1 className="hero-pulse-headline">
            YOUR DATA <br />
            <span className="lime-accent">HAS A PULSE.</span>
          </h1>

          <p className="hero-statement-text">
            SIGNALVAULT observes every synaptic signal, detects abnormal behavior before corruption propagates, and traces its impact across your entire data infrastructure.
          </p>
        </div>

        {/* Telemetry Strip with Large Monospace Numbers */}
        <div className="telemetry-strip-row">
          <div className="telemetry-cell">
            <span className="telemetry-cell-label">EVENTS / SEC</span>
            <span className="telemetry-cell-value" style={{ color: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '#FF4264' : '#C7FF3D' }}>
              {activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,210' : '82,491'}
            </span>
          </div>

          <div className="telemetry-cell">
            <span className="telemetry-cell-label">PIPELINE LATENCY</span>
            <span className="telemetry-cell-value" style={{ color: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '#FF4264' : '#38E8FF' }}>
              {activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '107m' : '42ms'}
            </span>
          </div>

          <div className="telemetry-cell">
            <span className="telemetry-cell-label">FRESHNESS SLA</span>
            <span className="telemetry-cell-value">
              {summary?.freshness_sla_compliance_pct ?? 99.7}%
            </span>
          </div>

          <div className="telemetry-cell">
            <span className="telemetry-cell-label">ANOMALIES</span>
            <span className="telemetry-cell-value" style={{ color: activeIncident ? '#FF4264' : '#42F59B' }}>
              {activeIncident ? '01 CRITICAL' : '00 NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: 3D Data Core Sphere */}
      <div className="hardware-card datacore-card">
        <div className="core-label-header">
          <Zap size={13} color="#C7FF3D" />
          <span>3D NEURAL DATA CORE</span>
        </div>

        <NeuralCoreCanvas activeIncident={activeIncident} />

        <div className="core-footer-status">
          <span style={{ color: isHealthy ? '#42F59B' : '#FF4264' }}>●</span>
          <span>{isHealthy ? 'SYNAPSE EQUILIBRIUM NOMINAL' : 'ANOMALY SHOCKWAVE ACTIVE'}</span>
        </div>
      </div>
    </section>
  );
}
