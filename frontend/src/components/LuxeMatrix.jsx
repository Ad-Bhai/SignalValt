import React, { useState } from 'react';

export default function LuxeMatrix({ activeIncident, onSelectPipeline }) {
  const [filter, setFilter] = useState('ALL');

  const inventory = [
    { id: 'sig-prod-kafka-01', name: 'kafka://orders.events.v1', type: 'Ingress Stream', latency: '12ms', fresh: '99.9%', status: activeIncident?.anomaly_type === 'VOLUME_ANOMALY' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'sig-prod-kafka-02', name: 'kafka://payments.v1', type: 'Ingress Stream', latency: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '107m' : '18ms', fresh: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? '74.2%' : '99.8%', status: activeIncident?.anomaly_type === 'FRESHNESS_ANOMALY' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'sig-prod-spark-01', name: 'spark.stream.orders_clean', type: 'PySpark Worker', latency: '34ms', fresh: '99.9%', status: activeIncident?.anomaly_type === 'DISTRIBUTION_ANOMALY' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'sig-prod-s3-01', name: 's3://lakehouse/bronze/orders', type: 'Bronze Lakehouse', latency: '52ms', fresh: '99.9%', status: 'HEALTHY' },
    { id: 'sig-prod-dbt-01', name: 'dbt.marts.stg_orders', type: 'dbt Staging', latency: '140ms', fresh: '99.9%', status: activeIncident?.anomaly_type === 'SCHEMA_DRIFT' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'sig-prod-dbt-02', name: 'dbt.marts.fct_revenue', type: 'dbt Gold Mart', latency: '110ms', fresh: '99.9%', status: activeIncident ? 'IMPACTED' : 'HEALTHY' },
    { id: 'sig-prod-dbt-03', name: 'dbt.marts.customer_360', type: 'dbt Gold Mart', latency: '95ms', fresh: '99.9%', status: activeIncident?.anomaly_type === 'DUPLICATE_EXPLOSION' ? 'ANOMALY' : 'HEALTHY' },
    { id: 'sig-prod-vault-01', name: 'vault.curated.executive_kpis', type: 'Curated Gold', latency: '22ms', fresh: '99.9%', status: activeIncident ? 'IMPACTED' : 'HEALTHY' },
  ];

  const filtered = filter === 'ALL' ? inventory : inventory.filter(i => i.type.includes(filter));

  return (
    <div className="editorial-panel">
      <div className="section-code">
        <span className="number">05</span>
        <span>/</span>
        <span>INFRASTRUCTURE INVENTORY & DIRECTORY</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'Stream', 'PySpark', 'dbt', 'Lakehouse'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'var(--graphite-hover)' : 'transparent',
                border: '1px solid var(--graphite)',
                color: filter === f ? 'var(--champagne-gold)' : 'var(--platinum)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                padding: '6px 12px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          SHOWING {filtered.length} OF 184 ARTIFACTS
        </span>
      </div>

      <div className="luxe-table-wrap">
        <table className="luxe-table">
          <thead>
            <tr>
              <th>RESOURCE IDENTIFIER</th>
              <th>DATASET / TOPIC URI</th>
              <th>TIER TYPE</th>
              <th>LATENCY</th>
              <th>FRESHNESS</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isAnomaly = item.status === 'ANOMALY';
              const isImpacted = item.status === 'IMPACTED';

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectPipeline && onSelectPipeline(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', color: isAnomaly ? '#8F2525' : 'var(--platinum)' }}>
                    {item.id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{item.type}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: isAnomaly ? '#8F2525' : 'var(--champagne-gold)' }}>
                    {item.latency}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.fresh}</td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: isAnomaly ? '#8F2525' : (isImpacted ? '#B89A63' : '#3C705B')
                    }}>
                      ● {item.status}
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
