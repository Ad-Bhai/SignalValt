import React, { useState, useEffect, useCallback } from 'react';
import LuxeNavbar from './components/LuxeNavbar';
import HorizonLine from './components/HorizonLine';
import LuxeScenarioSwitch from './components/LuxeScenarioSwitch';
import VaultHero from './components/VaultHero';
import ArchitecturalPipeline from './components/ArchitecturalPipeline';
import LuxeIncidentPanel from './components/LuxeIncidentPanel';
import LuxeInstruments from './components/LuxeInstruments';
import LuxeMatrix from './components/LuxeMatrix';
import LuxeFooter from './components/LuxeFooter';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [volumeMetrics, setVolumeMetrics] = useState([]);
  const [schemaMetrics, setSchemaMetrics] = useState(null);
  const [distributionMetrics, setDistributionMetrics] = useState(null);
  const [freshnessMetrics, setFreshnessMetrics] = useState(null);
  const [duplicateMetrics, setDuplicateMetrics] = useState(null);

  const [activeScenario, setActiveScenario] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Fetch telemetry state from FastAPI backend
  const fetchAllData = useCallback(async () => {
    try {
      const [
        sumRes,
        incRes,
        volRes,
        schRes,
        distRes,
        freshRes,
        dupRes
      ] = await Promise.all([
        fetch(`${API_BASE}/api/summary`).then(r => r.json()),
        fetch(`${API_BASE}/api/incidents`).then(r => r.json()),
        fetch(`${API_BASE}/api/metrics/volume`).then(r => r.json()),
        fetch(`${API_BASE}/api/metrics/schema`).then(r => r.json()),
        fetch(`${API_BASE}/api/metrics/distribution`).then(r => r.json()),
        fetch(`${API_BASE}/api/metrics/freshness`).then(r => r.json()),
        fetch(`${API_BASE}/api/metrics/duplicates`).then(r => r.json()),
      ]);

      setSummary(sumRes);
      setIncidents(incRes);
      setVolumeMetrics(volRes);
      setSchemaMetrics(schRes);
      setDistributionMetrics(distRes);
      setFreshnessMetrics(freshRes);
      setDuplicateMetrics(dupRes);
    } catch (err) {
      console.warn('[SignalVault Noir Luxe] Observatory telemetry link:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Live WebSocket alerts
  useEffect(() => {
    let ws;
    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/alerts');
        ws.onmessage = () => {
          fetchAllData();
        };
        ws.onclose = () => {
          setTimeout(connect, 4000);
        };
      } catch (e) {}
    };
    connect();
    return () => {
      if (ws) ws.close();
    };
  }, [fetchAllData]);

  // Systematic scenario injector
  const handleInjectScenario = async (scenarioName) => {
    setLoadingScenario(true);
    setActiveScenario(scenarioName);
    try {
      await fetch(`${API_BASE}/api/simulator/inject/${scenarioName}`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to inject scenario:', err);
    } finally {
      setLoadingScenario(false);
    }
  };

  // Systematic Stabilize Vault (Reset)
  const handleReset = async () => {
    setLoadingScenario(true);
    setActiveScenario(null);
    try {
      await fetch(`${API_BASE}/api/simulator/reset`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to reset system:', err);
    } finally {
      setLoadingScenario(false);
    }
  };

  // Systematic incident resolution
  const handleResolveIncident = async (incidentId) => {
    try {
      await fetch(`${API_BASE}/api/incidents/${incidentId}/resolve`, { method: 'POST' });
      await fetchAllData();
      setActiveScenario(null);
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    }
  };

  const activeIncident = incidents.find(i => i.status === 'ACTIVE');

  return (
    <div className="luxe-shell">
      {/* 1. Swiss Editorial Minimalist Header */}
      <LuxeNavbar
        summary={summary}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onReset={handleReset}
        activeIncident={activeIncident}
      />

      {/* 2. Continuous Horizon Line (Futuristic behavioral precision) */}
      <HorizonLine activeIncident={activeIncident} />

      {/* 3. Systematic Calibration Switchboard */}
      <LuxeScenarioSwitch
        onInject={handleInjectScenario}
        onReset={handleReset}
        activeScenario={activeScenario}
        loading={loadingScenario}
      />

      {/* 4. Systematic Navigation Routing */}

      {/* TAB: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <>
          <VaultHero
            summary={summary}
            activeIncident={activeIncident}
          />

          <LuxeIncidentPanel
            activeIncident={activeIncident}
            onResolve={handleResolveIncident}
          />

          <ArchitecturalPipeline
            activeIncident={activeIncident}
            onSelectNode={(node) => console.log('Selected node:', node)}
          />

          <LuxeInstruments
            volumeData={volumeMetrics}
            schemaData={schemaMetrics}
            distributionData={distributionMetrics}
            freshnessData={freshnessMetrics}
            duplicateData={duplicateMetrics}
            activeIncident={activeIncident}
          />
        </>
      )}

      {/* TAB: PIPELINES */}
      {activeTab === 'PIPELINES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <ArchitecturalPipeline
            activeIncident={activeIncident}
            onSelectNode={(node) => console.log('Selected pipeline node:', node)}
          />

          <LuxeMatrix
            activeIncident={activeIncident}
            onSelectPipeline={(p) => console.log('Selected pipeline:', p)}
          />
        </div>
      )}

      {/* TAB: DATASETS */}
      {activeTab === 'DATASETS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <LuxeMatrix
            activeIncident={activeIncident}
            onSelectPipeline={(p) => console.log('Selected dataset:', p)}
          />

          <LuxeInstruments
            volumeData={volumeMetrics}
            schemaData={schemaMetrics}
            distributionData={distributionMetrics}
            freshnessData={freshnessMetrics}
            duplicateData={duplicateMetrics}
            activeIncident={activeIncident}
          />
        </div>
      )}

      {/* TAB: LINEAGE */}
      {activeTab === 'LINEAGE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <ArchitecturalPipeline
            activeIncident={activeIncident}
            onSelectNode={(node) => console.log('Selected lineage node:', node)}
          />

          <LuxeIncidentPanel
            activeIncident={activeIncident}
            onResolve={handleResolveIncident}
          />
        </div>
      )}

      {/* TAB: INCIDENTS */}
      {activeTab === 'INCIDENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <LuxeIncidentPanel
            activeIncident={activeIncident}
            onResolve={handleResolveIncident}
          />

          <LuxeInstruments
            volumeData={volumeMetrics}
            schemaData={schemaMetrics}
            distributionData={distributionMetrics}
            freshnessData={freshnessMetrics}
            duplicateData={duplicateMetrics}
            activeIncident={activeIncident}
          />

          <ArchitecturalPipeline
            activeIncident={activeIncident}
            onSelectNode={(node) => console.log('Selected node:', node)}
          />
        </div>
      )}

      {/* 5. Minimal Centered Luxury Brand Statement */}
      <LuxeFooter />
    </div>
  );
}
