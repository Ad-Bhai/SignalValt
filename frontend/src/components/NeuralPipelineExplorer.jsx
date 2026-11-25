import React, { useRef, useEffect, useState } from 'react';
import { Network, Activity } from 'lucide-react';

export default function NeuralPipelineExplorer({ activeIncident, onSelectNode }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 'api', name: 'API / EDGE', type: 'Ingress Stream', events: '82,491/s', latency: '12ms', avail: '99.99%', x: 80, y: 125, baseY: 125 },
    { id: 'kafka', name: 'KAFKA / TOPICS', type: 'Synaptic Broker', events: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,210/s' : '82,100/s', latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '107m' : '18ms', avail: '99.98%', x: 240, y: 125, baseY: 125 },
    { id: 'spark', name: 'PYSPARK / CORE', type: 'Distributed Neural Job', events: '81,900/s', latency: '34ms', avail: '99.95%', x: 400, y: 125, baseY: 125 },
    { id: 's3', name: 'S3 / LAKEHOUSE', type: 'Bronze Synapse Store', events: '81,900/s', latency: '52ms', avail: '99.99%', x: 560, y: 125, baseY: 125 },
    { id: 'dbt', name: 'DBT / MODELS', type: 'Transformation Synapse', events: '81,500/s', latency: '140ms', avail: '99.90%', x: 720, y: 125, baseY: 125 },
    { id: 'vault', name: 'DATA VAULT', type: 'Curated Gold Mart', events: '81,500/s', latency: '22ms', avail: '99.99%', x: 880, y: 125, baseY: 125 },
    { id: 'dashboards', name: 'DASHBOARDS / ML', type: 'Executive Presentation', events: 'Live Stream', latency: '5ms', avail: '99.99%', x: 1040, y: 125, baseY: 125 }
  ];

  let faultIndex = -1;
  if (activeIncident) {
    if (activeIncident.anomaly_type === 'VOLUME_ANOMALY' || activeIncident.anomaly_type === 'FRESHNESS_ANOMALY') faultIndex = 1;
    else if (activeIncident.anomaly_type === 'SCHEMA_DRIFT' || activeIncident.anomaly_type === 'DUPLICATE_EXPLOSION') faultIndex = 4;
    else if (activeIncident.anomaly_type === 'DISTRIBUTION_ANOMALY') faultIndex = 3;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = 1120;
    const height = 250;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        segment: Math.floor(Math.random() * (nodes.length - 1)),
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.009,
        size: 1.5 + Math.random() * 2
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.03;

      // Gently float nodes
      nodes.forEach((n, idx) => {
        n.y = n.baseY + Math.sin(time + idx * 0.8) * 6;
      });

      // 1. Draw Synaptic Connection Lines
      for (let i = 0; i < nodes.length - 1; i++) {
        const start = nodes[i];
        const end = nodes[i + 1];
        const isImpacted = faultIndex !== -1 && i >= faultIndex;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        const midX = (start.x + end.x) / 2;
        const waveY = (start.y + end.y) / 2 + (i % 2 === 0 ? 15 : -15);
        ctx.quadraticCurveTo(midX, waveY, end.x, end.y);

        ctx.strokeStyle = isImpacted ? 'rgba(255, 66, 100, 0.45)' : 'rgba(56, 232, 255, 0.2)';
        ctx.lineWidth = isImpacted ? 2.5 : 1.5;
        if (isImpacted) ctx.setLineDash([6, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 2. Draw Moving Light Particles (Electric Lime / Neural Cyan, Red on anomaly)
      particles.forEach((p) => {
        const isFaulted = faultIndex !== -1 && p.segment >= faultIndex;
        let speed = p.speed;
        if (faultIndex !== -1 && p.segment === faultIndex) speed *= 0.35; // slows down
        p.progress += speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.segment = (p.segment + 1) % (nodes.length - 1);
        }

        const s = nodes[p.segment];
        const e = nodes[p.segment + 1];
        const t = p.progress;
        const midX = (s.x + e.x) / 2;
        const waveY = (s.y + e.y) / 2 + (p.segment % 2 === 0 ? 15 : -15);

        const px = (1 - t) * (1 - t) * s.x + 2 * (1 - t) * t * midX + t * t * e.x;
        const py = (1 - t) * (1 - t) * s.y + 2 * (1 - t) * t * waveY + t * t * e.y;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        if (isFaulted) {
          ctx.fillStyle = '#FF4264';
          ctx.shadowColor = '#FF4264';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = t > 0.5 ? '#38E8FF' : '#C7FF3D';
          ctx.shadowColor = '#C7FF3D';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw Nodes (Constellation galaxy anchors)
      nodes.forEach((n, i) => {
        const isFault = faultIndex === i;
        const isDownstream = faultIndex !== -1 && i > faultIndex;

        // Outer halo
        ctx.beginPath();
        ctx.arc(n.x, n.y, isFault ? 18 : 14, 0, Math.PI * 2);
        ctx.fillStyle = isFault ? 'rgba(255, 66, 100, 0.15)' : 'rgba(21, 26, 33, 0.9)';
        ctx.strokeStyle = isFault ? '#FF4264' : (isDownstream ? '#FFD166' : 'rgba(56, 232, 255, 0.4)');
        ctx.lineWidth = isFault ? 2.5 : 1.5;
        if (isFault) {
          ctx.shadowColor = '#FF4264';
          ctx.shadowBlur = 12;
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner nucleus
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isFault ? '#FF4264' : (isDownstream ? '#FFD166' : '#C7FF3D');
        ctx.fill();

        // Node Title
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = isFault ? '#FF4264' : '#F4F7FA';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y - 24);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeIncident]);

  return (
    <div className="hardware-card pipeline-explorer-panel">
      <div className="explorer-header-row">
        <h2 className="explorer-title">
          <Network size={18} color="#C7FF3D" />
          <span>NEURAL PIPELINE GALAXY</span>
        </h2>
        <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#7E8B9B' }}>
          Interconnected synaptic data dependencies & live particle transmission
        </span>
      </div>

      <div className="explorer-canvas-box">
        <canvas ref={canvasRef} className="explorer-interactive-canvas" />
      </div>

      {/* Floating Node Telemetry Grid */}
      <div className="pipeline-nodes-telemetry-grid">
        {nodes.map((n, i) => {
          const isFault = faultIndex === i;
          const isDownstream = faultIndex !== -1 && i > faultIndex;

          return (
            <div
              key={n.id}
              className={`node-neural-card ${isFault ? 'failing' : ''} ${isDownstream ? 'impacted' : ''}`}
              onMouseEnter={() => setHoveredNode(n)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelectNode && onSelectNode(n)}
            >
              <div className="card-node-type">{n.type}</div>
              <div className="card-node-name" style={{ color: isFault ? '#FF4264' : undefined }}>
                {n.name}
              </div>
              <div className="card-node-metric-row">
                <span>EVENTS</span>
                <span style={{ color: '#F4F7FA' }}>{n.events}</span>
              </div>
              <div className="card-node-metric-row" style={{ marginTop: '2px' }}>
                <span>LATENCY</span>
                <span style={{ color: isFault ? '#FF4264' : '#C7FF3D', fontWeight: 700 }}>{n.latency}</span>
              </div>
              <div className="card-node-metric-row" style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }}>
                <span style={{ fontSize: '0.65rem' }}>STATUS</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isFault ? '#FF4264' : (isDownstream ? '#FFD166' : '#42F59B') }}>
                  {isFault ? '● ANOMALY' : (isDownstream ? '● IMPACTED' : '● HEALTHY')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
