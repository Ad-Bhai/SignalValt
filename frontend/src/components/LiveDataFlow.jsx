import React, { useState } from 'react';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

export default function LiveDataFlow({ activeIncident, onSelectNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // The 7 canonical stages from the brief:
  // API ➔ KAFKA ➔ SPARK ➔ S3 ➔ DBT ➔ WAREHOUSE ➔ DASHBOARDS
  const nodes = [
    {
      id: 'api_gateway',
      name: 'API GATEWAY',
      type: 'PRODUCER',
      status: 'NORMAL',
      lastUpdate: '2s ago',
      recordsProcessed: '425,000 / hr',
      latency: '8 ms',
      x: 60,
      y: 90
    },
    {
      id: 'kafka_stream',
      name: 'KAFKA',
      type: 'STREAM BROKER',
      status: activeIncident?.source_asset?.includes('kafka') ? 'FAILING' : 'NORMAL',
      lastUpdate: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '1h 47m ago' : '1s ago',
      recordsProcessed: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,200 / hr' : '420,000 / hr',
      latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '107m' : '14 ms',
      x: 230,
      y: 90
    },
    {
      id: 'spark_normalizer',
      name: 'SPARK',
      type: 'STREAM ENGINE',
      status: 'NORMAL',
      lastUpdate: '3s ago',
      recordsProcessed: '418,000 / hr',
      latency: '24 ms',
      x: 400,
      y: 90
    },
    {
      id: 's3_lakehouse',
      name: 'S3 LAKEHOUSE',
      type: 'STORAGE BRONZE',
      status: 'NORMAL',
      lastUpdate: '15s ago',
      recordsProcessed: '418,000 / hr',
      latency: '45 ms',
      x: 570,
      y: 90
    },
    {
      id: 'dbt_transforms',
      name: 'DBT',
      type: 'ANALYTICS TRANSFORM',
      status: (activeIncident?.anomaly_type === 'SCHEMA_DRIFT' || activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION') ? 'FAILING' : 'NORMAL',
      lastUpdate: '1m ago',
      recordsProcessed: '415,000 / hr',
      latency: '180 ms',
      x: 740,
      y: 90
    },
    {
      id: 'warehouse_marts',
      name: 'WAREHOUSE',
      type: 'GOLD MART',
      status: activeIncident ? 'IMPACTED' : 'NORMAL',
      lastUpdate: '2m ago',
      recordsProcessed: '415,000 / hr',
      latency: '60 ms',
      x: 910,
      y: 90
    },
    {
      id: 'dashboards',
      name: 'DASHBOARDS',
      type: 'PRESENTATION',
      status: activeIncident ? 'IMPACTED' : 'NORMAL',
      lastUpdate: 'Now',
      recordsProcessed: 'Live BI Feed',
      latency: '3 ms',
      x: 1080,
      y: 90
    }
  ];

  // Determine failing stage index if an incident is active
  let failureIndex = -1;
  if (activeIncident) {
    if (activeIncident.anomaly_type === 'VOLUME_ANOMALY' || activeIncident.anomaly_type === 'FRESHNESS_ANOMALY') {
      failureIndex = 1; // Kafka
    } else if (activeIncident.anomaly_type === 'SCHEMA_DRIFT' || activeIncident.anomaly_type === 'DUPLICATE_EXPLOSION') {
      failureIndex = 4; // dbt
    } else if (activeIncident.anomaly_type === 'DISTRIBUTION_ANOMALY') {
      failureIndex = 3; // S3 / Silver
    }
  }

  return (
    <div className="topology-container">
      <div className="section-title-bar">
        <h2 className="section-heading">
          <Activity size={15} color="#E7B85C" />
          <span>LIVE DATA FLOW TOPOLOGY</span>
        </h2>
        <span className="section-caption">
          Signals moving continuously through ingestion, lakehouse partitions, and executive models.
        </span>
      </div>

      <div className="flow-viewport">
        {/* SVG Pipeline Canvas with Travelling Signal Particles */}
        <svg className="flow-svg-canvas" viewBox="0 0 1140 180">
          <defs>
            {/* Amber signal glow */}
            <filter id="signal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E7B85C" floodOpacity="0.8" />
            </filter>
            {/* Red critical glow */}
            <filter id="incident-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EF4444" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Connectors with Moving Signals */}
          {nodes.slice(0, -1).map((node, i) => {
            const nextNode = nodes[i + 1];
            const isImpactedSegment = failureIndex !== -1 && i >= failureIndex;
            const wireClass = isImpactedSegment ? "signal-wire impacted" : "signal-wire";
            const wireId = `wire-${i}`;

            return (
              <g key={wireId}>
                <path
                  id={wireId}
                  d={`M ${node.x} ${node.y} L ${nextNode.x} ${nextNode.y}`}
                  className={wireClass}
                />
                
                {/* Moving Signal Particle */}
                <circle r={isImpactedSegment ? 3.5 : 2.5} className="signal-particle" fill={isImpactedSegment ? "#EF4444" : "#E7B85C"}>
                  <animateMotion
                    path={`M ${node.x} ${node.y} L ${nextNode.x} ${nextNode.y}`}
                    dur={isImpactedSegment ? "1.8s" : "2.4s"}
                    repeatCount="indefinite"
                    begin={`${i * 0.35}s`}
                  />
                </circle>
              </g>
            );
          })}

          {/* Node Anchors */}
          {nodes.map((node, i) => {
            const isFailing = failureIndex === i;
            const isDownstreamImpacted = failureIndex !== -1 && i > failureIndex;

            let circleFill = "#15191D";
            let circleStroke = "#252A2F";
            let centerFill = "#E7B85C";

            if (isFailing) {
              circleFill = "#241014";
              circleStroke = "#EF4444";
              centerFill = "#EF4444";
            } else if (isDownstreamImpacted) {
              circleFill = "#1A1713";
              circleStroke = "#F59E0B";
              centerFill = "#F59E0B";
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
              >
                {/* Pulsing halo if failing */}
                {isFailing && (
                  <circle r="18" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle
                  r="12"
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth="1.5"
                  filter={isFailing ? "url(#incident-glow)" : undefined}
                />
                <circle cx="0" cy="0" r="3.5" fill={centerFill} />

                {/* Node Text */}
                <text
                  x="0"
                  y="-20"
                  textAnchor="middle"
                  fill={isFailing ? "#EF4444" : (isDownstreamImpacted ? "#F59E0B" : "#F5F5F0")}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="0.05em"
                >
                  {node.name}
                </text>
                <text
                  x="0"
                  y="26"
                  textAnchor="middle"
                  fill="#575D65"
                  fontSize="8.5"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {node.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Node Metrics Cards Grid directly below pipeline */}
        <div className="pipeline-node-grid">
          {nodes.map((node, i) => {
            const isFailing = failureIndex === i;
            const isImpacted = failureIndex !== -1 && i > failureIndex;

            return (
              <div
                key={`card-${node.id}`}
                className={`pipeline-node-card ${isFailing ? 'failing' : ''}`}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
              >
                <div className="node-type-label">{node.type}</div>
                <div className="node-name" style={{ color: isFailing ? '#EF4444' : undefined }}>
                  {node.name}
                </div>
                <div className="node-metrics-row">
                  <span>Latency</span>
                  <span style={{ color: isFailing ? '#EF4444' : '#F5F5F0' }}>{node.latency}</span>
                </div>
                <div className="node-metrics-row" style={{ marginTop: '2px' }}>
                  <span>Volume</span>
                  <span style={{ color: '#8B9299' }}>{node.recordsProcessed}</span>
                </div>
                <div className="node-metrics-row" style={{ marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '4px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#575D65' }}>Status</span>
                  <span style={{ fontSize: '0.68rem', color: isFailing ? '#EF4444' : (isImpacted ? '#F59E0B' : '#39C98A'), fontWeight: 600 }}>
                    {isFailing ? '● FAILING' : (isImpacted ? '● IMPACTED' : '● HEALTHY')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
