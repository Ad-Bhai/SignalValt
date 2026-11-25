import React from 'react';
import { Activity, Clock, Database, Zap } from 'lucide-react';

export default function SystemHealthHero({ summary, incidents }) {
  const score = summary?.reliability_score ?? 99.42;
  const criticalCount = summary?.critical_incidents_count ?? 0;
  const totalIncidents = summary?.active_incidents_count ?? 0;
  const warningCount = totalIncidents - criticalCount;

  let healthColorClass = 'healthy';
  if (score < 80) healthColorClass = 'warning';
  if (score < 60 || criticalCount > 0) healthColorClass = 'critical';

  return (
    <section className="status-hero">
      {/* Primary Hero: System Health with Huge Typography */}
      <div className={`observatory-card ${criticalCount > 0 ? 'critical-border' : ''}`}>
        <div className="card-label">
          <span>System Health</span>
          <Activity size={14} color={healthColorClass === 'healthy' ? '#39C98A' : '#EF4444'} />
        </div>

        <div className="health-number-row">
          <span className={`huge-health-number ${healthColorClass}`}>
            {score}%
          </span>
        </div>

        <div className="health-breakdown-list">
          <div className="breakdown-item green">
            <span>●</span> 184 Datasets
          </div>
          <div className="breakdown-item green">
            <span>●</span> 12 Pipelines
          </div>
          <div className={`breakdown-item ${warningCount > 0 ? 'amber' : ''}`}>
            <span>●</span> {warningCount > 0 ? `${warningCount} Warnings` : '0 Warnings'}
          </div>
          <div className={`breakdown-item ${criticalCount > 0 ? 'red' : ''}`}>
            <span>●</span> {criticalCount > 0 ? `${criticalCount} Critical` : '0 Critical'}
          </div>
        </div>
      </div>

      {/* Card 2: 24h Ingested Events */}
      <div className="observatory-card">
        <div className="card-label">
          <span>Telemetry Throughput</span>
          <Database size={14} color="#8B9299" />
        </div>
        <div className="stat-number">
          {((summary?.total_events_processed_24h ?? 19842100) / 1000000).toFixed(1)}M
        </div>
        <div className="stat-footer">
          Streaming events verified past 24h across Kafka & S3 partitions
        </div>
      </div>

      {/* Card 3: Freshness SLA */}
      <div className="observatory-card">
        <div className="card-label">
          <span>Freshness SLA</span>
          <Clock size={14} color="#8B9299" />
        </div>
        <div className="stat-number">
          {summary?.freshness_sla_compliance_pct ?? 99.4}%
        </div>
        <div className="stat-footer">
          Target max arrival latency: &lt; 15 mins (Nominal)
        </div>
      </div>

      {/* Card 4: Detection Latency */}
      <div className="observatory-card">
        <div className="card-label">
          <span>Detection Latency</span>
          <Zap size={14} color="#E7B85C" />
        </div>
        <div className="stat-number" style={{ color: '#E7B85C' }}>
          {summary?.avg_detection_latency_ms ?? 184} ms
        </div>
        <div className="stat-footer">
          Autonomous real-time edge assertion engine
        </div>
      </div>
    </section>
  );
}
