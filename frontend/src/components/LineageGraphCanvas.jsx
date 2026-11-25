import React, { useState } from 'react';
import { Network, AlertCircle, CheckCircle, Info, Database, Layers, Radio, Cpu } from 'lucide-react';

export default function LineageGraphCanvas({ lineageData, activeIncident, onSelectNode }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Position mapping by layer for clean layout
  const layerXMap = {
    source: 70,
    streaming: 240,
    bronze: 400,
    pipeline: 560,
    silver: 720,
    gold: 880,
    presentation: 1040
  };

  // Group nodes by layer to compute Y offsets
  const layerGroups = {};
  (lineageData?.nodes || []).forEach(node => {
    const l = node.layer || 'silver';
    if (!layerGroups[l]) layerGroups[l] = [];
    layerGroups[l].push(node);
  });

  const nodePositions = {};
  Object.keys(layerGroups).forEach(layer => {
    const nodesInLayer = layerGroups[layer];
    const total = nodesInLayer.length;
    const height = 440;
    const spacing = height / (total + 1);

    nodesInLayer.forEach((node, idx) => {
      nodePositions[node.id] = {
        x: layerXMap[layer] || 500,
        y: (idx + 1) * spacing + 20,
        node
      };
    });
  });

  // Calculate blast radius impact
  const impactChain = new Set(activeIncident?.blast_radius?.impact_chain || []);
  const rootCauseId = activeIncident?.blast_radius?.root_cause_node_id;

  return (
    <div className="glass-panel lineage-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Network size={20} color="#00F2FE" />
            <span>Interactive Data Lineage & Blast Radius Topology</span>
          </h2>
          <p className="section-subtitle">
            Dynamic DAG tracing upstream data sources through Kafka, PySpark, S3, dbt, and C-Suite dashboards.
          </p>
        </div>
        {activeIncident && (
          <div className="live-beacon critical">
            <span className="pulse-dot"></span>
            <span>BLAST RADIUS ACTIVE: {impactChain.size} NODES IMPACTED</span>
          </div>
        )}
      </div>

      <div className="lineage-canvas-container">
        <svg className="lineage-canvas-svg" viewBox="0 0 1140 480">
          <defs>
            <linearGradient id="edge-normal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4FACFE" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="edge-impacted" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF0055" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFB703" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FF0055" floodOpacity="0.9" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00F2FE" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Render Edges */}
          {(lineageData?.edges || []).map((edge, idx) => {
            const srcPos = nodePositions[edge.source];
            const tgtPos = nodePositions[edge.target];
            if (!srcPos || !tgtPos) return null;

            const isImpactedEdge = impactChain.has(edge.source) && impactChain.has(edge.target);
            const midX = (srcPos.x + tgtPos.x) / 2;

            return (
              <path
                key={`edge-${idx}`}
                d={`M ${srcPos.x} ${srcPos.y} C ${midX} ${srcPos.y}, ${midX} ${tgtPos.y}, ${tgtPos.x} ${tgtPos.y}`}
                fill="none"
                stroke={isImpactedEdge ? "url(#edge-impacted)" : "url(#edge-normal)"}
                strokeWidth={isImpactedEdge ? 2.8 : 1.5}
                strokeDasharray={isImpactedEdge ? "6, 4" : "none"}
                className={isImpactedEdge ? "pulsing-edge" : ""}
              />
            );
          })}

          {/* Render Nodes */}
          {Object.entries(nodePositions).map(([id, pos]) => {
            const isRootCause = id === rootCauseId;
            const isImpacted = impactChain.has(id);
            const isHovered = hoveredNode?.id === id;

            let fillBadge = "#162033";
            let strokeBadge = "rgba(255, 255, 255, 0.15)";
            let textColor = "#94A3B8";

            if (isRootCause) {
              fillBadge = "#360A18";
              strokeBadge = "#FF0055";
              textColor = "#FF5A87";
            } else if (isImpacted) {
              fillBadge = "#2E1C08";
              strokeBadge = "#FFB703";
              textColor = "#FFD166";
            } else if (isHovered) {
              strokeBadge = "#00F2FE";
              textColor = "#FFFFFF";
            }

            return (
              <g
                key={id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(pos.node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectNode && onSelectNode(pos.node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer halo for root cause */}
                {isRootCause && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#FF0055"
                    strokeWidth="2"
                    opacity="0.8"
                    filter="url(#glow-red)"
                  >
                    <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  r="16"
                  fill={fillBadge}
                  stroke={strokeBadge}
                  strokeWidth={isRootCause || isImpacted ? 2.5 : 1.5}
                  filter={isRootCause ? "url(#glow-red)" : (isHovered ? "url(#glow-cyan)" : undefined)}
                />

                {/* Status indicator dot */}
                <circle
                  cx="11"
                  cy="-11"
                  r="4.5"
                  fill={isRootCause ? "#FF0055" : (isImpacted ? "#FFB703" : "#06D6A0")}
                />

                {/* Node Label */}
                <text
                  x="0"
                  y="30"
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="10.5"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={isRootCause || isImpacted ? "700" : "500"}
                >
                  {pos.node.name.length > 18 ? pos.node.name.substring(0, 16) + '..' : pos.node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredNode && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              background: 'rgba(13, 19, 31, 0.95)',
              border: '1px solid #00F2FE',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
              maxWidth: '320px',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{ color: '#00F2FE', fontWeight: 'bold', marginBottom: '4px' }}>
              {hoveredNode.name}
            </div>
            <div style={{ color: '#94A3B8', marginBottom: '2px' }}>
              Layer: <span style={{ color: '#F8FAFC' }}>{hoveredNode.layer.toUpperCase()}</span>
            </div>
            <div style={{ color: '#94A3B8', marginBottom: '2px' }}>
              Owner: <span style={{ color: '#F8FAFC' }}>{hoveredNode.owner}</span>
            </div>
            <div style={{ color: '#94A3B8', marginBottom: '4px' }}>
              Throughput: <span style={{ color: '#06D6A0' }}>{(hoveredNode.records_per_hour || 0).toLocaleString()} rec/hr</span>
            </div>
            <div style={{ color: '#64748B', fontSize: '0.72rem', fontStyle: 'italic' }}>
              {hoveredNode.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
