# 🛰️ SIGNALVAULT — Real-Time Data Reliability & Anomaly Intelligence Platform

> **"Can we trust today's data?"**  
> SIGNALVAULT continuously watches data streams and lakehouse pipelines to detect when something looks wrong — **before downstream consumers, ML models, and executive dashboards trust corrupted data.**

---

## 📌 Resume Overview & Highlights

```text
SIGNALVAULT – Data Reliability & Anomaly Intelligence Platform (GitHub)
Description: Built a data reliability platform for monitoring data pipelines and detecting anomalies across streaming and batch workflows.
Key Features: Volume anomaly detection, schema drift, freshness monitoring, duplicate detection, data lineage, and root-cause analysis.
Technologies Used: Kafka, PySpark, Airflow, dbt, AWS S3, PostgreSQL, FastAPI, React, Python, SQL, Docker.
Outcome: Automated data-quality monitoring and identified downstream pipeline impact from critical data incidents.
```

---

## 🏛️ End-to-End Architecture

```text
             DATA SOURCES (Mobile, Web, APIs, Payments, IoT)
                                    │
                                    ▼
                         Apache Kafka Topics
                     (orders.events.v1, payments.v1)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            PySpark Streaming             AWS S3 Lakehouse
         (Distributed Asserter)           (Bronze Raw Data)
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                          SIGNALVAULT ENGINE
                    ┌───────────────────────────────┐
                    │  1. Volume Drop (IQR/Z-Score) │
                    │  2. Schema Drift Detector     │
                    │  3. PSI Distribution Skew     │
                    │  4. Freshness SLA Heartbeat   │
                    │  5. Duplicate Explosion Hash  │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    Lineage & Blast Radius Engine (DAG)
                 (Calculates Impact Radius & Root Causes)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
               dbt Models                     FastAPI Engine
          (stg_orders, fct_rev)              (REST & WebSockets)
                    │                               │
                    ▼                               ▼
           Airflow Orchestration           React Observability UI
         (Continuous Sensor DAG)         (Mission Control Center)
```

---

## 🔥 The 5 Data Incident Detectors

| Incident Type | Baseline Behavior | Anomaly Trigger | Detection Algorithm |
| :--- | :--- | :--- | :--- |
| **1. Volume Collapse** | ~83,000 events/hr | Sudden drop to 4,200 events (-94.9%) | Moving median & Interquartile Range (IQR) dynamic bounds |
| **2. Schema Drift** | `customer_id` canonical | `customer_id` removed, `customerId` added | Normalized token matching & AST structural diff |
| **3. Distribution Shift** | Age 18–25 = 31% | Age 18–25 surges to 91% | Population Stability Index (PSI = 1.84 >> 0.25) |
| **4. Freshness SLA Breach** | Arrival every 10 min | Stalled for 1 hr 47 min | Watermark timestamp lag vs Contractual SLA threshold |
| **5. Duplicate Storm** | 0.2% duplicate rate | Explodes to 31.8% duplicates | Rolling window hash collision on primary/composite keys |

---

## 🧠 Root Cause & Lineage Blast Radius Engine

When an upstream anomaly occurs, SIGNALVAULT traces the Directed Acyclic Graph (DAG) to isolate the **Root Cause** and project the **Blast Radius**:

```text
                          INCIDENT
                             │
                             ▼
                    Critical Schema Drift
                             │
                             ▼
                  customer_id changed
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
              orders_clean        customer_360
                   │                   │
                   ▼                   ▼
             revenue_model        segmentation
                   │                   │
                   └─────────┬─────────┘
                             ▼
                     Revenue Dashboard
```

### Automated Diagnosis & Actionable Runbook
```text
🔴 CRITICAL INCIDENT DETECTED
Root Cause: Upstream schema modification on ingestion contract
Origin: orders_clean
Affected Entities: 4 pipelines, 8 datasets, 2 dashboards
Records Potentially Impacted: 1,842,391
Detection Latency: 184ms
Recommended Action:
Restore 'customer_id' column alias in PySpark streaming transformer
or update downstream dbt models to ingest 'customerId'.
```

---

## 🚀 Quickstart: Running SIGNALVAULT Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### Method 1: Dual-Mode One-Click Launcher (Recommended for Windows)
Double-click `start.bat` or execute in PowerShell:
```powershell
.\start.ps1
```

This will automatically launch:
1. **FastAPI Engine**: `http://localhost:8000` (API & WebSockets)
2. **Interactive Swagger Docs**: `http://localhost:8000/docs`
3. **React Mission Control**: `http://localhost:5173`

---

### Method 2: Manual Terminal Execution

#### 1. Start Backend
```bash
# In repository root
.\venv\Scripts\activate
set PYTHONPATH=.
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start Frontend
```bash
cd frontend
npm run dev
```

#### 3. Run Automated Tests
```bash
pytest -v
```

---

## 🐳 Docker Cluster Mode (Production Deployment)

SIGNALVAULT comes with a multi-container Docker Compose definition:
```bash
docker compose up -d
```
Services spun up:
- **Zookeeper & Apache Kafka**: `localhost:9092`
- **PostgreSQL (Metadata Store)**: `localhost:5432`
- **MinIO (S3-Compatible Object Lakehouse)**: `localhost:9000` (Console: `9001`)
- **SIGNALVAULT Backend**: `localhost:8000`
- **SIGNALVAULT Frontend**: `localhost:5173`

---

## 🎯 How to Ace Your Data Engineering Interview with SIGNALVAULT

When interviewers ask: *"Tell me about a complex project you built,"* use this 3-minute pitch:

> *"Most data engineering portfolios show standard ETL: pulling data from an API, writing SQL, and building a dashboard. For SIGNALVAULT, I wanted to address the real problem senior data teams face: **data silent failure and reliability**.*
>
> *I designed a real-time data reliability and anomaly intelligence system that continuously monitors streaming Kafka topics and PySpark/Lakehouse tables.*
>
> *The system monitors five distinct failure modes:*
> 1. *Volume collapses using dynamic IQR bounds.*
> 2. *Schema drift with fuzzy rename detection (e.g. `customer_id` mutating to `customerId`).*
> 3. *Data distribution shifts using Population Stability Index (PSI).*
> 4. *Freshness SLA breaches by tracking partition arrival watermarks.*
> 5. *Duplicate key explosions caused by producer retry storms.*
>
> *When an anomaly is detected, instead of just sending a raw alert, the platform computes the **downstream blast radius** across a dependency DAG. It tells data engineers exactly which dbt models, Airflow batch runs, and C-Suite dashboards are compromised, estimated records at risk, and auto-generates the remediation runbook."*

### Key Technical Talking Points
- **Why PSI over simple mean/std?** PSI captures full distributional shifts and works on categorical cohorts (like demographics), ignoring mild variance while flagging true structural population shifts.
- **Why in-memory DAG for blast radius?** Upstream/downstream BFS graph traversal takes `< 2ms`, allowing real-time blast-radius calculation during live streaming ingestion.
- **Handling False Positives**: Dynamic moving-window percentiles and configurable severity thresholds prevent alert fatigue.

---

## 📂 Repository Structure

```text
Signal Vault/
├── backend/
│   ├── engine/
│   │   ├── detectors.py           # 5 anomaly detection modules
│   │   ├── lineage.py             # Enterprise lineage graph & blast radius
│   │   └── simulator.py           # Real-time traffic stream & incident injector
│   ├── models.py                  # Pydantic schema contracts
│   ├── main.py                    # FastAPI REST & WebSocket endpoints
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Backend container definition
│   └── tests/                     # Pytest automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/            # React UI components (Lineage, KPIs, Deep Dive)
│   │   ├── App.jsx                # Main application coordinator
│   │   └── index.css              # Cyber-observability design system
│   ├── package.json               # Node dependencies
│   └── Dockerfile                 # Frontend production container
├── data_pipelines/
│   ├── pyspark/                   # PySpark distributed quality inspection job
│   ├── airflow/dags/              # Airflow orchestration DAG with SLA sensors
│   ├── dbt_signalvault/           # dbt project, staging/marts models & tests
│   └── kafka/                     # Kafka streaming producer/consumer pipeline
├── docker-compose.yml             # Full-cluster orchestration
├── start.bat / start.ps1          # One-click Windows launch
└── README.md                      # Comprehensive project documentation
```

---

## ⚖️ License
MIT License. Built for High-Impact Data Engineering Portfolios.
