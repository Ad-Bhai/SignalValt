import React, { useRef, useEffect, useState } from 'react';
import { Network, Sparkles, AlertCircle } from 'lucide-react';

export default function LiquidDataFlow({ activeIncident, onSelectNode }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    {
      id: 'api',
      name: 'API Gateway',
      type: 'Ingestion Source',
      eventsPerSec: '82,491',
      latency: '12ms',
      lastAnomaly: 'None',
      x: 80,
      y: 110
    },
    {
      id: 'kafka',
      name: 'Kafka Broker',
      type: 'Streaming Topic',
      eventsPerSec: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,200' : '82,100',
      latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '1h 47m' : '18ms',
      lastAnomaly: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? 'SLA Breach' : (activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? 'Volume Drop' : 'None'),
      x: 240,
      y: 110
    },
    {
      id: 'spark',
      name: 'PySpark Stream',
      type: 'Distributed Compute',
      eventsPerSec: '81,900',
      latency: '34ms',
      lastAnomaly: 'None',
      x: 400,
      y: 110
    },
    {
      id: 's3',
      name: 'S3 Lakehouse',
      type: 'Bronze Partitions',
      eventsPerSec: '81,900',
      latency: '52ms',
      lastAnomaly: 'None',
      x: 560,
      y: 110
    },
    {
      id: 'dbt',
      name: 'dbt Transforms',
      type: 'Analytics Engine',
      eventsPerSec: '81,500',
      latency: '140ms',
      lastAnomaly: activeIncident?.anomaly_type === 'SCHEMA_DRIFT' ? 'customer_id dropped' : (activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION' ? '31.8% duplicate rate' : 'None'),
      x: 720,
      y: 110
    },
    {
      id: 'vault',
      name: 'Data Vault',
      type: 'Curated Gold Mart',
      eventsPerSec: '81,500',
      latency: '22ms',
      lastAnomaly: activeIncident ? 'Downstream blast alert' : 'None',
      x: 880,
      y: 110
    },
    {
      id: 'dashboards',
      name: 'Dashboards & ML',
      type: 'Consumer Presentation',
      eventsPerSec: 'Real-time Feed',
      latency: '5ms',
      lastAnomaly: activeIncident ? 'Stale partition' : 'None',
      x: 1040,
      y: 110
    }
  ];

  // Determine failing stage index
  let failureIndex = -1;
  if (activeIncident) {
    if (activeIncident.anomaly_type === 'VOLUME_ANOMALY' || activeIncident.anomaly_type === 'FRESHNESS_ANOMALY') {
      failureIndex = 1; // Kafka
    } else if (activeIncident.anomaly_type === 'SCHEMA_DRIFT' || activeIncident.anomaly_type === 'DUPLICATE_EXPLOSION') {
      failureIndex = 4; // dbt
    } else if (activeIncident.anomaly_type === 'DISTRIBUTION_ANOMALY') {
      failureIndex = 3; // S3
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const width = 1120;
    const height = 220;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Initialize 60 flowing liquid particles along the pipeline segments
    const particleCount = 70;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        segment: Math.floor(Math.random() * (nodes.length - 1)),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
        offsetY: (Math.random() - 0.5) * 14,
        size: 1.5 + Math.random() * 2.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw smooth fluid tracks connecting nodes
      for (let i = 0; i < nodes.length - 1; i++) {
        const start = nodes[i];
        const end = nodes[i + 1];
        const isImpacted = failureIndex !== -1 && i >= failureIndex;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        // Smooth bezier wave
        const cp1x = (start.x + end.x) / 2;
        const cp1y = start.y + (i % 2 === 0 ? 12 : -12);
        ctx.quadraticCurveTo(cp1x, cp1y, end.x, end.y);

        ctx.strokeStyle = isImpacted ? 'rgba(228, 88, 88, 0.45)' : 'rgba(139, 124, 255, 0.22)';
        ctx.lineWidth = isImpacted ? 2.5 : 1.8;
        if (isImpacted) {
          ctx.setLineDash([5, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // 2. Update and draw flowing liquid particles
      particles.forEach((p) => {
        const isPastFailure = failureIndex !== -1 && p.segment >= failureIndex;
        const isAtFailure = failureIndex !== -1 && p.segment === failureIndex;

        // Anomaly physics: particles slow down and cluster near failure
        let currentSpeed = p.speed;
        if (isAtFailure) {
          currentSpeed *= 0.35; // flow slows
        }

        p.progress += currentSpeed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.segment = (p.segment + 1) % (nodes.length - 1);
        }

        const start = nodes[p.segment];
        const end = nodes[p.segment + 1];

        const t = p.progress;
        const cp1x = (start.x + end.x) / 2;
        const cp1y = start.y + (p.segment % 2 === 0 ? 12 : -12);

        // Quadratic bezier formula
        const px = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cp1x + t * t * end.x;
        const py = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cp1y + t * t * end.y + p.offsetY;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);

        if (isAtFailure) {
          // Particles cluster & turn amber/red
          ctx.fillStyle = 'rgba(231, 168, 59, 0.9)';
          ctx.shadowColor = '#E7A83B';
          ctx.shadowBlur = 6;
        } else if (isPastFailure) {
          ctx.fillStyle = 'rgba(228, 88, 88, 0.8)';
          ctx.shadowColor = '#E45858';
          ctx.shadowBlur = 4;
        } else {
          // Healthy: Cyan -> Violet gradient
          const color = t > 0.5 ? '139, 124, 255' : '101, 217, 232';
          ctx.fillStyle = `rgba(${color}, 0.85)`;
          ctx.shadowColor = '#65D9E8';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw nodes on canvas
      nodes.forEach((node, i) => {
        const isFailing = failureIndex === i;
        const isImpacted = failureIndex !== -1 && i > failureIndex;

        // Outer halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = isFailing ? '#E45858' : (isImpacted ? '#E7A83B' : '#8B7CFF');
        ctx.lineWidth = isFailing ? 2.5 : 1.5;
        ctx.shadowColor = isFailing ? 'rgba(228, 88, 88, 0.4)' : 'rgba(139, 124, 255, 0.2)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = isFailing ? '#E45858' : (isImpacted ? '#E7A83B' : '#20B486');
        ctx.fill();

        // Node Title
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillStyle = isFailing ? '#E45858' : '#18191B';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y - 24);

        // Node layer tag
        ctx.font = '500 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#74777D';
        ctx.fillText(node.type, node.x, node.y + 30);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [activeIncident]);

  return (
    <div className="liquid-surface liquid-flow-section">
      <div className="section-head-row">
        <div>
          <h2 className="section-title-liquid">
            <Network size={18} color="#8B7CFF" />
            <span>Liquid Data Flow & Particle Topology</span>
          </h2>
          <span className="section-desc-liquid">
            Information flowing continuously as particles through streaming, distributed transformations, and data marts.
          </span>
        </div>

        {activeIncident && (
          <div className="alert-top-pill">
            <span className="status-dot critical"></span>
            <span>Flow Disruption Detected</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flow-canvas-container">
        <canvas ref={canvasRef} className="flow-canvas-interactive" />
      </div>

      {/* Node expansion card grid */}
      <div className="flow-node-cards-strip">
        {nodes.map((node, i) => {
          const isFailing = failureIndex === i;
          const isImpacted = failureIndex !== -1 && i > failureIndex;
          const isHovered = hoveredNode?.id === node.id;

          return (
            <div
              key={node.id}
              className={`liquid-node-card ${isFailing ? 'failing' : ''} ${isImpacted ? 'impacted' : ''}`}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelectNode && onSelectNode(node)}
            >
              <div className="node-layer-badge">{node.type}</div>
              <div className="node-title-bold" style={{ color: isFailing ? '#E45858' : undefined }}>
                {node.name}
              </div>
              <div className="node-subtext-metric">
                <span>Rate</span>
                <span style={{ color: '#18191B', fontWeight: 600 }}>{node.eventsPerSec}/s</span>
              </div>
              <div className="node-subtext-metric" style={{ marginTop: '2px' }}>
                <span>Latency</span>
                <span style={{ color: isFailing ? '#E45858' : '#20B486', fontWeight: 600 }}>{node.latency}</span>
              </div>
              <div className="node-subtext-metric" style={{ marginTop: '4px', borderTop: '1px solid rgba(24,25,27,0.06)', paddingTop: '4px' }}>
                <span style={{ fontSize: '0.65rem' }}>Status</span>
                <span style={{ fontSize: '0.65rem', color: isFailing ? '#E45858' : (isImpacted ? '#E7A83B' : '#20B486'), fontWeight: 700 }}>
                  {isFailing ? '● Anomaly' : (isImpacted ? '● Impacted' : '● Healthy')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
