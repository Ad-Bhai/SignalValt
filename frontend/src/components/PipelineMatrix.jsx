import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, ArrowUpRight, Search } from 'lucide-react';

export default function PipelineMatrix({ activeIncident, onSelectPipeline }) {
  const [filter, setFilter] = useState('ALL');

  const pipelines = [
    { id: 'p1', name: 'kafka://orders.events.v1', tier: 'Streaming Ingress', engine: 'Kafka 3.7', rate: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? '4,210/s' : '82,491/s', latency: '14ms', status: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'p2', name: 'kafka://payments.trans.v1', tier: 'Transactional Synapse', engine: 'Kafka 3.7', rate: '28,100/s', latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '107m' : '18ms', status: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'p3', name: 'pyspark_streaming_job', tier: 'Distributed Normalizer', engine: 'PySpark 3.5 / Delta', rate: '81,900/s', latency: '34ms', status: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? 'IMPACTED' : 'HEALTHY' },
    { id: 'p4', name: 's3://lakehouse/bronze/orders', tier: 'Bronze Lakehouse', engine: 'AWS S3 / Parquet', rate: '81,900/s', latency: '52ms', status: 'HEALTHY' },
    { id: 'p5', name: 'dbt_run_revenue_models', tier: 'Analytics Transformation', engine: 'dbt Core 1.8', rate: '81,500/s', latency: '140ms', status: activeIncident?.anomaly_type === 'SCHEMA_DRIFT' || activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'p6', name: 'dbt_run_user_segments', tier: 'ML Synaptic Pipeline', engine: 'dbt Core 1.8', rate: '42,000/s', latency: '140ms', status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'IMPACTED' : 'HEALTHY' },
    { id: 'p7', name: 'orders_clean', tier: 'Lakehouse Silver', engine: 'Delta Lake', rate: '81,500/s', latency: '22ms', status: activeIncident?.anomaly_type === 'SCHEMA_DRIFT' || activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'p8', name: 'customer_360', tier: 'Dimension Feature Store', engine: 'Delta Lake', rate: '42,000/s', latency: '18ms', status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'p9', name: 'revenue_model', tier: 'Lakehouse Gold', engine: 'PostgreSQL / Iceberg', rate: '81,500/s', latency: '30ms', status: activeIncident ? 'IMPACTED' : 'HEALTHY' },
    { id: 'p10', name: 'segmentation', tier: 'Lakehouse Gold', engine: 'PostgreSQL / Iceberg', rate: '42,000/s', latency: '25ms', status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'IMPACTED' : 'HEALTHY' },
    { id: 'p11', name: 'airflow://dag_daily_financial_close', tier: 'Batch Orchestration', engine: 'Airflow 2.9', rate: 'Scheduled UTC', latency: '4.2m', status: activeIncident ? 'IMPACTED' : 'HEALTHY' },
    { id: 'p12', name: 'airflow://dag_ml_churn_scoring', tier: 'MLOps Pipeline', engine: 'Airflow 2.9', rate: 'Hourly', latency: '2.1m', status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'IMPACTED' : 'HEALTHY' },
  ];

  const filtered = pipelines.filter(p => {
    if (filter === 'HEALTHY' && p.status !== 'HEALTHY') return false;
    if (filter === 'ANOMALOUS' && p.status === 'HEALTHY') return false;
    return true;
  });

  return (
    <div className="hardware-card" style={{ padding: '26px' }}>
      <div className="explorer-header-row" style={{ marginBottom: '18px' }}>
        <div>
          <h2 className="explorer-title">
            <Layers size={18} color="#C7FF3D" />
            <span>NEURAL PIPELINE DIRECTORY (12 ENGINES // 184 DATASETS)</span>
          </h2>
          <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#7E8B9B' }}>
            Telemetry status, execution latency, and SLA contracts across all synchronized pipelines
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`ana-tab-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            ALL (12)
          </button>
          <button
            className={`ana-tab-btn ${filter === 'HEALTHY' ? 'active' : ''}`}
            onClick={() => setFilter('HEALTHY')}
          >
            HEALTHY
          </button>
          <button
            className={`ana-tab-btn ${filter === 'ANOMALOUS' ? 'active' : ''}`}
            onClick={() => setFilter('ANOMALOUS')}
          >
            ANOMALOUS
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-hardware)', textAlign: 'left', color: '#7E8B9B', fontSize: '0.7rem' }}>
              <th style={{ padding: '12px 14px' }}>PIPELINE ASSET</th>
              <th style={{ padding: '12px 14px' }}>TIER</th>
              <th style={{ padding: '12px 14px' }}>ENGINE</th>
              <th style={{ padding: '12px 14px' }}>THROUGHPUT</th>
              <th style={{ padding: '12px 14px' }}>LATENCY</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isAnomaly = p.status === 'ANOMALY';
              const isImpacted = p.status === 'IMPACTED';

              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: isAnomaly ? 'rgba(255,66,100,0.06)' : (isImpacted ? 'rgba(255,209,102,0.03)' : 'transparent')
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: isAnomaly ? '#FF4264' : '#F4F7FA' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#7E8B9B' }}>{p.tier}</td>
                  <td style={{ padding: '12px 14px', color: '#38E8FF' }}>{p.engine}</td>
                  <td style={{ padding: '12px 14px', color: '#F4F7FA' }}>{p.rate}</td>
                  <td style={{ padding: '12px 14px', color: isAnomaly ? '#FF4264' : '#C7FF3D', fontWeight: 700 }}>{p.latency}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: isAnomaly ? 'rgba(255,66,100,0.15)' : (isImpacted ? 'rgba(255,209,102,0.12)' : 'rgba(66,245,155,0.1)'),
                        color: isAnomaly ? '#FF4264' : (isImpacted ? '#FFD166' : '#42F59B'),
                        border: `1px solid ${isAnomaly ? 'rgba(255,66,100,0.4)' : (isImpacted ? 'rgba(255,209,102,0.4)' : 'rgba(66,245,155,0.3)')}`
                      }}
                    >
                      {p.status}
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
