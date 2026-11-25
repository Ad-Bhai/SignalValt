import React, { useRef, useEffect, useState } from 'react';

export default function ArchitecturalPipeline({ activeIncident, onSelectNode }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 'api', name: 'INGRESS / API', type: 'Source Gateway', events: '82,491/s', latency: '12ms', avail: '99.99%', x: 80, y: 110 },
    { id: 'kafka', name: 'KAFKA / TOPICS', type: 'Synaptic Broker', events: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,210/s' : '82,100/s', latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '107m' : '18ms', avail: '99.98%', x: 250, y: 110 },
    { id: 'spark', name: 'PYSPARK / JOBS', type: 'Core Processing', events: '81,900/s', latency: '34ms', avail: '99.95%', x: 420, y: 70 },
    { id: 'dbt', name: 'DBT / MODELS', type: 'SQL Transformation', events: '81,500/s', latency: '140ms', avail: '99.90%', x: 420, y: 150 },
    { id: 's3', name: 'S3 / LAKEHOUSE', type: 'Parquet Storage', events: '81,900/s', latency: '52ms', avail: '99.99%', x: 590, y: 110 },
    { id: 'vault', name: 'DATA VAULT', type: 'Curated Gold Layer', events: '81,500/s', latency: '22ms', avail: '99.99%', x: 760, y: 110 },
    { id: 'dashboards', name: 'DASHBOARDS / ML', type: 'Downstream Consumers', events: 'Live', latency: '5ms', avail: '99.99%', x: 930, y: 110 },
  ];

  let faultNodeId = null;
  if (activeIncident) {
    if (activeIncident.anomaly_type === 'VOLUME_ANOMALY' || activeIncident.anomaly_type === 'FRESHNESS_ANOMALY') faultNodeId = 'kafka';
    else if (activeIncident.anomaly_type === 'SCHEMA_DRIFT' || activeIncident.anomaly_type === 'DUPLICATE_EXPLOSION') faultNodeId = 'dbt';
    else if (activeIncident.anomaly_type === 'DISTRIBUTION_ANOMALY') faultNodeId = 'spark';
  }

  // Define architectural connections
  const connections = [
    { from: 0, to: 1 }, // API -> Kafka
    { from: 1, to: 2 }, // Kafka -> Spark
    { from: 1, to: 3 }, // Kafka -> dbt
    { from: 2, to: 4 }, // Spark -> S3
    { from: 3, to: 4 }, // dbt -> S3
    { from: 4, to: 5 }, // S3 -> Vault
    { from: 5, to: 6 }, // Vault -> Dashboards
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = 1020;
    const height = 220;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let tracerProgress = 0;
    let activeConnectionIdx = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle architectural blueprint grid ticks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 1. Draw Architectural Hairline Connections
      connections.forEach((conn) => {
        const p1 = nodes[conn.from];
        const p2 = nodes[conn.to];
        const isFaultConn = faultNodeId && (nodes[conn.from].id === faultNodeId || nodes[conn.to].id === faultNodeId);

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = isFaultConn ? '#8F2525' : '#242629';
        ctx.moveTo(p1.x, p1.y);

        // Clean rectilinear or minimal angled blueprint routing
        if (p1.y === p2.y) {
          ctx.lineTo(p2.x, p2.y);
        } else {
          const midX = (p1.x + p2.x) / 2;
          ctx.lineTo(midX, p1.y);
          ctx.lineTo(midX, p2.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
      });

      // 2. Traveling Signal Point (One small light travels through every few seconds)
      tracerProgress += 0.009;
      if (tracerProgress >= 1) {
        tracerProgress = 0;
        activeConnectionIdx = (activeConnectionIdx + 1) % connections.length;
      }

      const activeConn = connections[activeConnectionIdx];
      const start = nodes[activeConn.from];
      const end = nodes[activeConn.to];
      const t = tracerProgress;

      let tx = start.x + (end.x - start.x) * t;
      let ty = start.y + (end.y - start.y) * t;
      if (start.y !== end.y) {
        const midX = (start.x + end.x) / 2;
        if (t < 0.4) {
          tx = start.x + (midX - start.x) * (t / 0.4);
          ty = start.y;
        } else if (t < 0.7) {
          tx = midX;
          ty = start.y + (end.y - start.y) * ((t - 0.4) / 0.3);
        } else {
          tx = midX + (end.x - midX) * ((t - 0.7) / 0.3);
          ty = end.y;
        }
      }

      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fillStyle = faultNodeId ? '#8F2525' : '#B89A63';
      ctx.fill();

      // 3. Draw Blueprint Nodes
      nodes.forEach((n) => {
        const isFault = n.id === faultNodeId;
        const isHovered = hoveredNode?.id === n.id;

        // Blueprint Crosshair Tick
        ctx.strokeStyle = isFault ? '#8F2525' : '#242629';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(n.x - 10, n.y);
        ctx.lineTo(n.x + 10, n.y);
        ctx.moveTo(n.x, n.y - 10);
        ctx.lineTo(n.x, n.y + 10);
        ctx.stroke();

        // Node Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isFault ? '#8F2525' : '#0D0E0F';
        ctx.strokeStyle = isFault ? '#8F2525' : (isHovered ? '#B89A63' : '#A6A8AA');
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();

        // Node Label
        ctx.font = '500 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = isFault ? '#8F2525' : '#F4F1EA';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y > 100 ? n.y + 22 : n.y - 16);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeIncident, hoveredNode, faultNodeId]);

  return (
    <div className="editorial-panel blueprint-pipeline-panel">
      <div className="section-code">
        <span className="number">02</span>
        <span>/</span>
        <span>ARCHITECTURAL PIPELINE BLUEPRINT</span>
      </div>

      <div className="blueprint-canvas-box">
        <canvas ref={canvasRef} className="blueprint-canvas" />
      </div>

      {/* Swiss Editorial Node Telemetry Cards */}
      <div className="blueprint-nodes-row">
        {nodes.map((n) => {
          const isFault = n.id === faultNodeId;
          return (
            <div
              key={n.id}
              className={`blueprint-node-item ${isFault ? 'fault' : ''}`}
              onMouseEnter={() => setHoveredNode(n)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelectNode && onSelectNode(n)}
            >
              <div className="node-item-type">{n.type}</div>
              <div className="node-item-name" style={{ color: isFault ? '#8F2525' : undefined }}>
                {n.name}
              </div>
              <div className="node-item-metric">
                <span>EVENTS</span>
                <span>{n.events}</span>
              </div>
              <div className="node-item-metric" style={{ marginTop: '2px' }}>
                <span>LATENCY</span>
                <span style={{ color: isFault ? '#8F2525' : '#B89A63' }}>{n.latency}</span>
              </div>
              <div className="node-item-metric" style={{ marginTop: '4px', borderTop: '1px solid #242629', paddingTop: '4px' }}>
                <span>AVAIL</span>
                <span style={{ color: isFault ? '#8F2525' : '#3C705B' }}>
                  {isFault ? 'DISRUPTED' : n.avail}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
