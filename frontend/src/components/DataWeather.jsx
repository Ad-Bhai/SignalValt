import React from 'react';
import { CloudRain, Wind, Activity, Eye, Zap } from 'lucide-react';

export default function DataWeather({ activeIncident, summary }) {
  const isAnomaly = Boolean(activeIncident);
  const visibility = summary?.reliability_score ?? 99.82;

  const weatherState = isAnomaly ? 'TURBULENT STORM' : 'CLEAR';
  const volatility = isAnomaly ? 'HIGH VOLATILITY' : 'LOW';
  const pressure = isAnomaly ? 'ELEVATED' : 'NOMINAL';
  const clouds = isAnomaly ? '01 STORM CELL' : '00 DETECTED';

  return (
    <div className={`hardware-card data-weather-card ${isAnomaly ? 'critical-pulse' : ''}`}>
      {/* 1. Atmospheric Condition */}
      <div className="weather-state-block">
        <span className="weather-tag">DATA WEATHER</span>
        <div className={`weather-condition-text ${isAnomaly ? 'turbulent' : 'clear'}`}>
          {weatherState}
        </div>
        <div className={`weather-bar-meter ${isAnomaly ? 'turbulent' : ''}`}>
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      {/* 2. Volatility */}
      <div className="weather-state-block">
        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#7E8B9B' }}>VOLATILITY</span>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'monospace', color: isAnomaly ? '#FFD166' : '#F4F7FA' }}>
          {volatility}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#4B5563', fontFamily: 'monospace' }}>
          {isAnomaly ? 'Variance > 3.2σ' : 'Deviation < 0.2σ'}
        </span>
      </div>

      {/* 3. Pipeline Pressure */}
      <div className="weather-state-block">
        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#7E8B9B' }}>PIPELINE PRESSURE</span>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'monospace', color: isAnomaly ? '#FF4264' : '#C7FF3D' }}>
          {pressure}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#4B5563', fontFamily: 'monospace' }}>
          {isAnomaly ? 'Consumer lag surge' : 'Buffer usage 12%'}
        </span>
      </div>

      {/* 4. Anomaly Clouds */}
      <div className="weather-state-block">
        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#7E8B9B' }}>ANOMALY CLOUDS</span>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'monospace', color: isAnomaly ? '#FF4264' : '#42F59B' }}>
          {clouds}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#4B5563', fontFamily: 'monospace' }}>
          {isAnomaly ? 'Cluster disruption' : 'Atmosphere stable'}
        </span>
      </div>

      {/* 5. System Visibility */}
      <div className="weather-state-block">
        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#7E8B9B' }}>GRID VISIBILITY</span>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: isAnomaly ? '#FFD166' : '#38E8FF' }}>
          {visibility}%
        </div>
        <span style={{ fontSize: '0.72rem', color: '#4B5563', fontFamily: 'monospace' }}>
          184 Datasets in telemetry
        </span>
      </div>
    </div>
  );
}
