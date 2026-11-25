import React from 'react';
import { ShieldAlert, Database, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function KPIBar({ summary }) {
  const score = summary?.reliability_score ?? 99.8;
  const activeCount = summary?.active_incidents_count ?? 0;
  const criticalCount = summary?.critical_incidents_count ?? 0;
  const monitoredCount = summary?.total_monitored_assets ?? 16;
  const slaCompliance = summary?.freshness_sla_compliance_pct ?? 99.4;

  let scoreClass = 'healthy';
  if (score < 80) scoreClass = 'warning';
  if (score < 60) scoreClass = 'critical';

  return (
    <section className="kpi-grid">
      {/* KPI 1: Reliability Score */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Reliability Score</span>
          <CheckCircle2 size={16} color={scoreClass === 'healthy' ? '#06D6A0' : '#FF0055'} />
        </div>
        <div className="kpi-value-row">
          <span className={`kpi-value ${scoreClass}`}>{score}%</span>
        </div>
        <span className="kpi-subtext">
          {score >= 90 ? 'Platform state nominal' : `${criticalCount} critical incident(s) active`}
        </span>
      </div>

      {/* KPI 2: Active Incidents */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Active Incidents</span>
          <ShieldAlert size={16} color={activeCount > 0 ? '#FF0055' : '#06D6A0'} />
        </div>
        <div className="kpi-value-row">
          <span className={`kpi-value ${activeCount > 0 ? 'critical' : 'healthy'}`}>
            {activeCount}
          </span>
        </div>
        <span className="kpi-subtext">
          {criticalCount} Critical | {activeCount - criticalCount} Warning
        </span>
      </div>

      {/* KPI 3: Monitored Assets */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Monitored Assets</span>
          <Database size={16} color="#00F2FE" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value healthy">{monitoredCount}</span>
        </div>
        <span className="kpi-subtext">Topics, Lakehouse, dbt & Dashboards</span>
      </div>

      {/* KPI 4: SLA Freshness */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Freshness SLA</span>
          <Clock size={16} color={slaCompliance > 90 ? '#06D6A0' : '#FFB703'} />
        </div>
        <div className="kpi-value-row">
          <span className={`kpi-value ${slaCompliance > 90 ? 'healthy' : 'warning'}`}>
            {slaCompliance}%
          </span>
        </div>
        <span className="kpi-subtext">Max acceptable latency: 15 mins</span>
      </div>

      {/* KPI 5: Detection Latency */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Detection Latency</span>
          <Zap size={16} color="#9D4EDD" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value healthy">184 ms</span>
        </div>
        <span className="kpi-subtext">Automated real-time anomaly engine</span>
      </div>
    </section>
  );
}
