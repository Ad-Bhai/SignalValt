import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, ArrowUpRight, Filter, Search } from 'lucide-react';

export default function PipelineRegistry({ activeIncident, onSelectPipeline }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const pipelines = [
    {
      id: 'pipe-01',
      name: 'kafka://orders.events.v1',
      layer: 'Streaming Ingestion',
      engine: 'Apache Kafka 3.7',
      rate: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,200 rec/hr' : '280,000 rec/hr',
      latency: '14 ms',
      sla: 'SLA < 15m (Compliant)',
      status: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? 'ANOMALY' : 'HEALTHY',
      owner: 'Streaming Infra'
    },
    {
      id: 'pipe-02',
      name: 'kafka://payments.trans.v1',
      layer: 'Transactional Stream',
      engine: 'Apache Kafka 3.7',
      rate: '95,000 rec/hr',
      latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '1h 47m' : '18 ms',
      sla: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? 'SLA Breached (>15m)' : 'SLA < 15m (Compliant)',
      status: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? 'ANOMALY' : 'HEALTHY',
      owner: 'Payments Core'
    },
    {
      id: 'pipe-03',
      name: 'pyspark_streaming_job',
      layer: 'Distributed Normalizer',
      engine: 'PySpark 3.5 / Delta',
      rate: '280,000 rec/hr',
      latency: '24 ms',
      sla: 'Continuous Micro-batch',
      status: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? 'IMPACTED' : 'HEALTHY',
      owner: 'Data Engineering'
    },
    {
      id: 'pipe-04',
      name: 's3://lakehouse/bronze/orders',
      layer: 'Storage Bronze',
      engine: 'AWS S3 / Parquet',
      rate: '280,000 rec/hr',
      latency: '45 ms',
      sla: 'Partitioned by date',
      status: 'HEALTHY',
      owner: 'Lakehouse Team'
    },
    {
      id: 'pipe-05',
      name: 'dbt_run_revenue_models',
      layer: 'Analytics Transformation',
      engine: 'dbt Core 1.8',
      rate: '275,000 rec/hr',
      latency: '180 ms',
      sla: 'Every 15 min run',
      status: activeIncident?.anomaly_type === 'SCHEMA_DRIFT' || activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION' ? 'ANOMALY' : 'HEALTHY',
      owner: 'Analytics Eng'
    },
    {
      id: 'pipe-06',
      name: 'dbt_run_user_segments',
      layer: 'ML Feature Pipeline',
      engine: 'dbt Core 1.8',
      rate: '140,000 rec/hr',
      latency: '140 ms',
      sla: 'Every 30 min run',
      status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'IMPACTED' : 'HEALTHY',
      owner: 'Analytics Eng'
    },
    {
      id: 'pipe-07',
      name: 'orders_clean',
      layer: 'Lakehouse Silver',
      engine: 'Delta Lake',
      rate: '275,000 rec/hr',
      latency: '22 ms',
      sla: 'Deduplicated & Validated',
      status: activeIncident?.anomaly_type === 'SCHEMA_DRIFT' || activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION' ? 'ANOMALY' : 'HEALTHY',
      owner: 'Data Engineering'
    },
    {
      id: 'pipe-08',
      name: 'customer_360',
      layer: 'Lakehouse Silver',
      engine: 'Delta Lake',
      rate: '140,000 rec/hr',
      latency: '18 ms',
      sla: 'Unified Dimension',
      status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'ANOMALY' : 'HEALTHY',
      owner: 'Customer Analytics'
    },
    {
      id: 'pipe-09',
      name: 'revenue_model',
      layer: 'Lakehouse Gold',
      engine: 'PostgreSQL / Iceberg',
      rate: '275,000 rec/hr',
      latency: '30 ms',
      sla: 'C-Suite Billing Tier',
      status: activeIncident ? 'IMPACTED' : 'HEALTHY',
      owner: 'Finance BI'
    },
    {
      id: 'pipe-10',
      name: 'segmentation',
      layer: 'Lakehouse Gold',
      engine: 'PostgreSQL / Iceberg',
      rate: '140,000 rec/hr',
      latency: '25 ms',
      sla: 'Cohort Feature Store',
      status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'IMPACTED' : 'HEALTHY',
      owner: 'Growth BI'
    },
    {
      id: 'pipe-11',
      name: 'airflow://dag_daily_financial_close',
      layer: 'Orchestration Batch',
      engine: 'Apache Airflow 2.9',
      rate: 'Daily Close Trigger',
      latency: '4.2 min run',
      sla: 'Scheduled @ 00:00 UTC',
      status: activeIncident ? 'IMPACTED' : 'HEALTHY',
      owner: 'Financial Ops'
    },
    {
      id: 'pipe-12',
      name: 'airflow://dag_ml_churn_scoring',
      layer: 'MLOps Pipeline',
      engine: 'Apache Airflow 2.9',
      rate: 'Hourly Inference',
      latency: '2.1 min run',
      sla: 'Scheduled @ 00 * * * *',
      status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'IMPACTED' : 'HEALTHY',
      owner: 'MLOps'
    }
  ];

  const filtered = pipelines.filter(p => {
    if (filter === 'ANOMALOUS' && p.status === 'HEALTHY') return false;
    if (filter === 'HEALTHY' && p.status !== 'HEALTHY') return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.layer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="liquid-surface" style={{ padding: '28px' }}>
      <div className="section-head-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="section-title-liquid">
            <Layers size={18} color="#8B7CFF" />
            <span>Pipeline Infrastructure Registry (12 Core Engines)</span>
          </h2>
          <span className="section-desc-liquid">
            Real-time status, execution latency, throughput volume, and contractual SLAs across all orchestrated data pipelines.
          </span>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`sci-tab-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All (12)
          </button>
          <button
            className={`sci-tab-btn ${filter === 'HEALTHY' ? 'active' : ''}`}
            onClick={() => setFilter('HEALTHY')}
          >
            Healthy
          </button>
          <button
            className={`sci-tab-btn ${filter === 'ANOMALOUS' ? 'active' : ''}`}
            onClick={() => setFilter('ANOMALOUS')}
          >
            Anomalous / Impacted
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: '#74777D', fontSize: '0.72rem' }}>
              <th style={{ padding: '12px 16px' }}>PIPELINE ASSET</th>
              <th style={{ padding: '12px 16px' }}>TIER / LAYER</th>
              <th style={{ padding: '12px 16px' }}>ENGINE</th>
              <th style={{ padding: '12px 16px' }}>THROUGHPUT</th>
              <th style={{ padding: '12px 16px' }}>LATENCY</th>
              <th style={{ padding: '12px 16px' }}>SLA / CADENCE</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((pipe) => {
              const isAnomaly = pipe.status === 'ANOMALY';
              const isImpacted = pipe.status === 'IMPACTED';

              return (
                <tr
                  key={pipe.id}
                  style={{
                    borderBottom: '1px solid rgba(24, 25, 27, 0.04)',
                    background: isAnomaly ? 'rgba(228, 88, 88, 0.04)' : (isImpacted ? 'rgba(231, 168, 59, 0.03)' : 'transparent'),
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: isAnomaly ? '#E45858' : '#18191B' }}>
                    {pipe.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#74777D' }}>
                    {pipe.layer}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#8B7CFF' }}>
                    {pipe.engine}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#18191B' }}>
                    {pipe.rate}
                  </td>
                  <td style={{ padding: '14px 16px', color: isAnomaly ? '#E45858' : '#20B486', fontWeight: 600 }}>
                    {pipe.latency}
                  </td>
                  <td style={{ padding: '14px 16px', color: isAnomaly ? '#E45858' : '#74777D' }}>
                    {pipe.sla}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isAnomaly ? 'rgba(228, 88, 88, 0.12)' : (isImpacted ? 'rgba(231, 168, 59, 0.12)' : 'rgba(32, 180, 134, 0.1)'),
                        color: isAnomaly ? '#E45858' : (isImpacted ? '#E7A83B' : '#20B486'),
                        border: `1px solid ${isAnomaly ? 'rgba(228, 88, 88, 0.3)' : (isImpacted ? 'rgba(231, 168, 59, 0.3)' : 'rgba(32, 180, 134, 0.25)')}`
                      }}
                    >
                      {pipe.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
