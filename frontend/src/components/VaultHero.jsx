import React, { useRef, useEffect } from 'react';

export default function VaultHero({ summary, activeIncident }) {
  const canvasRef = useRef(null);
  const score = summary?.reliability_score ?? 99.82;
  const isAnomaly = Boolean(activeIncident);

  // Animate the circular Vault rings with watchmaker precision
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const size = 300;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let angleOuter = 0;
    let angleInner = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Ultra-slow watchmaker escapement rotation
      angleOuter += 0.0018;
      angleInner -= 0.0012;

      // 1. Outermost Architectural Perimeter Circle
      ctx.beginPath();
      ctx.arc(cx, cy, 138, 0, Math.PI * 2);
      ctx.strokeStyle = '#242629';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Outer Ring: 12 Pipeline Sectors & Escapement Ticks
      const pipelineCount = 12;
      for (let i = 0; i < pipelineCount; i++) {
        const theta = angleOuter + (i / pipelineCount) * Math.PI * 2;
        const x1 = cx + Math.cos(theta) * 128;
        const y1 = cy + Math.sin(theta) * 128;
        const x2 = cx + Math.cos(theta) * 136;
        const y2 = cy + Math.sin(theta) * 136;

        const isAffectedSector = isAnomaly && i === 3; // Section that changes to Burgundy

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isAffectedSector ? '#8F2525' : (i % 3 === 0 ? '#B89A63' : '#4B4E53');
        ctx.lineWidth = isAffectedSector ? 2 : 1;
        ctx.stroke();
      }

      // 3. Middle Ring: Arc Segment
      ctx.beginPath();
      ctx.arc(cx, cy, 118, angleOuter, angleOuter + Math.PI * 1.6);
      ctx.strokeStyle = 'rgba(184, 154, 99, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. Inner Ring: Critical Datasets (Fine gear teeth)
      const datasetCount = 36;
      for (let j = 0; j < datasetCount; j++) {
        const theta = angleInner + (j / datasetCount) * Math.PI * 2;
        const rStart = 96;
        const rEnd = j % 3 === 0 ? 104 : 100;
        const x1 = cx + Math.cos(theta) * rStart;
        const y1 = cy + Math.sin(theta) * rStart;
        const x2 = cx + Math.cos(theta) * rEnd;
        const y2 = cy + Math.sin(theta) * rEnd;

        const isDisrupted = isAnomaly && (j >= 8 && j <= 11);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isDisrupted ? '#8F2525' : '#242629';
        ctx.lineWidth = isDisrupted ? 1.5 : 1;
        ctx.stroke();
      }

      // 5. Innermost Circle (Dial core)
      ctx.beginPath();
      ctx.arc(cx, cy, 84, 0, Math.PI * 2);
      ctx.strokeStyle = isAnomaly ? 'rgba(143, 37, 37, 0.4)' : '#242629';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle jewel marker at 12 o'clock
      ctx.beginPath();
      ctx.arc(cx, cy - 84, 2, 0, Math.PI * 2);
      ctx.fillStyle = isAnomaly ? '#8F2525' : '#B89A63';
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isAnomaly]);

  return (
    <section className="editorial-panel vault-hero-layout">
      {/* Left: Typography & Live Telemetry */}
      <div className="hero-typography-block">
        <div className="section-code">
          <span className="number">01</span>
          <span>/</span>
          <span>SYSTEM OBSERVATORY & INTEGRITY</span>
        </div>

        <h1 className="hero-primary-headline">
          SIGNALVAULT
        </h1>

        <div style={{ fontSize: '1.75rem', fontWeight: 400, color: 'var(--warm-ivory)', letterSpacing: '-0.02em', marginTop: '-12px' }}>
          Data Reliability & Anomaly Intelligence
        </div>

        <p className="hero-editorial-subtitle">
          “Observe every signal. Understand every deviation.”
        </p>

        {/* Precision Telemetry Row */}
        <div className="hero-telemetry-row">
          <div className="hero-stat-cell">
            <span className="hero-stat-label">EVENTS / SEC</span>
            <span className="hero-stat-value">
              {activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? (
                <span className="burgundy">4,210</span>
              ) : (
                '82,491'
              )}
            </span>
            <span className="hero-stat-delta">{activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '-94.9%' : '+1.2%'}</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">PIPELINE LATENCY</span>
            <span className="hero-stat-value">
              {activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? (
                <span className="burgundy">107m</span>
              ) : (
                '42ms'
              )}
            </span>
            <span className="hero-stat-delta">p99 threshold</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">FRESHNESS SLA</span>
            <span className="hero-stat-value gold">
              {summary?.freshness_sla_compliance_pct ?? 99.7}%
            </span>
            <span className="hero-stat-delta">15m max lag</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">SYSTEM STATE</span>
            <span className={`hero-stat-value ${isAnomaly ? 'burgundy' : ''}`} style={{ fontSize: '1.15rem' }}>
              {isAnomaly ? 'DEVIATION' : 'NOMINAL'}
            </span>
            <span className="hero-stat-delta">{isAnomaly ? '1 active incident' : '0 incidents'}</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">DATASETS</span>
            <span className="hero-stat-value">184</span>
            <span className="hero-stat-delta">12 pipelines</span>
          </div>
        </div>
      </div>

      {/* Right: The Signature Architectural Vault */}
      <div className="vault-circular-panel">
        <div className="vault-svg-container">
          <canvas ref={canvasRef} style={{ width: 300, height: 300 }} />

          <div className="vault-center-readout">
            <div className={`vault-center-percentage ${isAnomaly ? 'burgundy' : ''}`}>
              {isAnomaly ? '94.10%' : `${score}%`}
            </div>
            <div className="vault-center-label">
              SYSTEM INTEGRITY
            </div>
            <div className="vault-center-delta">
              {isAnomaly ? 'Deviation detected in sector 04' : '+0.42% vs previous 24h'}
            </div>
          </div>
        </div>

        <div className="vault-footer-telemetry">
          <span>OUTER: 12 PIPELINES</span>
          <span>INNER: 36 CRITICAL ASSETS</span>
          <span style={{ color: isAnomaly ? '#8F2525' : '#B89A63' }}>
            {isAnomaly ? '● SECTOR DISRUPTION' : '● STABLE ESCAPEMENT'}
          </span>
        </div>
      </div>
    </section>
  );
}
