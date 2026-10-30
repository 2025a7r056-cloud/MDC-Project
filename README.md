# CrimeGraph AI — AI-Powered Criminal Network Analysis System

> **Tagline:** *Connecting Evidence. Revealing Patterns. Supporting Investigations.*

[![System Status](https://img.shields.io/badge/System-ONLINE-06b6d4?style=flat-square)](#)
[![Classification](https://img.shields.io/badge/Classification-CONFIDENTIAL%20%2F%2F%20LES-f43f5e?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20FastAPI%20%7C%20NetworkX%20%7C%20Cytoscape-8b5cf6?style=flat-square)](#)
[![Integrity](https://img.shields.io/badge/Provenance-Admiralty%20A1%20Verified-10b981?style=flat-square)](#)

---

## 1. Executive Summary & Analytical Mission

**CrimeGraph AI** is a state-of-the-art criminal intelligence and graph analysis platform designed to support authorized law enforcement investigators, forensic financial auditors, and cyber intelligence analysts. 

Modern transnational criminal syndicates intentionally fragment operations across offshore corporate hierarchies, darknet cryptocurrency mixer peeling chains, nominee directors, and encrypted maritime communications to evade detection. **CrimeGraph AI** bridges these silos by fusing graph theory, network science (NetworkX), and explainable artificial intelligence into an interactive cyber-intelligence command center.

All scenarios, identities, corporate entities, and transactions provided within the default system represent **realistic, high-fidelity synthetic data** designed for academic demonstrations, investigative training, and security research.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CRIMEGRAPH AI CLIENT (NEXT.JS 14)                     │
│  ┌───────────────────────┬─────────────────────────┬──────────────────────┐ │
│  │ Interactive Cytoscape │ Recharts Flow Telemetry │ Natural Language Q&A │ │
│  │ Relationship Canvas   │ Financial Anomalies     │ AI Assistant Modal   │ │
│  └───────────────────────┴─────────────────────────┴──────────────────────┘ │
│        │                                                          ▲         │
│        ▼ REST / WebSocket JSON                                    │         │
└────────┼──────────────────────────────────────────────────────────┼─────────┘
         │                                                          │
┌────────┼──────────────────────────────────────────────────────────┼─────────┐
│        ▼              FASTAPI ANALYTICAL ENGINE                   │         │
│  ┌─────────────────────────────────────────────────────────────┐  │         │
│  │ RESTful Routers: /auth, /entities, /relationships, /graph,  │  │         │
│  │                  /transactions, /cases, /ai, /audit         │  │         │
│  └─────────────────────────────────────────────────────────────┘  │         │
│        │                                                          │         │
│        ├─────────────────────────────┬────────────────────────────┤         │
│        ▼                             ▼                            ▼         │
│  ┌──────────────────────┐  ┌────────────────────────┐  ┌──────────────────┐ │
│  │ NetworkX Algorithms  │  │ SQLAlchemy ORM Engine  │  │ Explainable AI   │ │
│  │ • Brandes Betweenness│  │ • PostgreSQL (Prod)    │  │ Grounded Graph   │ │
│  │ • Degree Centrality  │  │ • SQLite (Local / Demo)│  │ Reasoner Service │ │
│  │ • Community Detection│  └────────────────────────┘  └──────────────────┘ │
│  │ • Shortest Conduit   │                                                   │
│  │ • Adamic-Adar Links  │                                                   │
│  └──────────────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Functional Capabilities

### A. Main Dashboard & Tactical Telemetry
- Real-time KPI monitors: Total entities analyzed, identified graph edges, active taskforce investigations, flagged financial transfers, and global network density.
- Recharts visualizations: Activity timeline trajectory, entity taxonomy breakdown (Pie), and risk tier distribution (Critical, High, Medium, Low).
- Operational widgets for high-risk targets requiring urgent human review.

### B. Interactive Criminal Network Graph (Cytoscape.js)
- Full-screen canvas supporting 7 entity domains: **Person, Corporation, Crypto Wallet, Burner Phone, Bank Account, Location, and Vessel**.
- Dynamic physics layout engines: Compound Spring Embedder (`cose`), Concentric Rings, Circular Topology, and Hierarchical Tree (`breadthfirst`).
- Interactive shortest-path money flow tracer calculating total hops and accumulated USD capital flow.
- Triage filters: Multi-select entity types, relationship types, minimum risk sliders, and Admiralty verification status toggles.
- Node detail drawer with Admiralty provenance ratings (A1–F6), risk breakdown, and neighboring subgraph expansion.
- One-click dataset export to authorized JSON and CSV formats.

### C. AI Graph Analytics Engine (NetworkX)
- **Centrality & Brokerage Detection:** Calculates betweenness centrality via Brandes algorithm to pinpoint covert mediators and gatekeepers who connect isolated syndicate cells.
- **Community Detection:** Algorithmically partitions network into operational cells (Cyprus nominee shells, crypto peeling chains, maritime logistics).
- **Statistical Anomaly Detection:** Automatically flags structuring (smurfing) batches bounded between \$9,800 and \$9,950, communication bursts, and circular round-tripping loops.
- **Link Prediction:** Employs Adamic-Adar common neighborhood indices to predict unobserved associations warranting subpoenas.
- **Explainable AI Insight Cards:** Displays supporting nodes, evidentiary basis, confidence scores, and recommended next steps for human analysts.

### D. Entity Explorer & Classified Dossiers
- Searchable registry filtering by jurisdiction, verification status, and risk tier.
- Switchable tabular spreadsheet and visual card views.
- Deep dossiers showcasing aliases, identifiers (passports, IBANs, IMEIs, wallet addresses), and linked taskforces.

### E. Financial Flow & Transaction Analysis
- Quarterly transaction volume trends.
- Automated anomaly detection flagging structuring, high-velocity offshore wires, and peeling chains.
- Modal drill-down displaying SWIFT / blockchain evidence provenance.

### F. Case Management & Evidence Timeline
- Case files with status tracking: `Open`, `Active Investigation`, `Indictment Ready`, and `Closed`.
- Security classification markers: `TOP SECRET // NOFORN`, `SECRET // SI-TK`, `CONFIDENTIAL // LES`.
- Chronological investigation timeline logging wire intercepts, border crossings, and corporate formations.
- Add and edit new taskforce cases with automatic audit trail generation.

### G. AI Investigation Assistant (Natural Language Graph Q&A)
- Grounded query engine supporting prompts like:
  - *"Which nodes have the highest betweenness centrality?"*
  - *"Find the shortest path between ENT-001 and ENT-007."*
  - *"Summarize the connections in this fictional network."*
  - *"Explain why the recent transaction patterns were flagged."*
  - *"Show entities directly connected to ENT-004."*
- Cites exact graph entities, Admiralty evidentiary ratings, and algorithm outputs.

### H. Data Ingestion & Sanitization (CSV / JSON)
- Client-side sandbox parsing and schema validation up to 5MB.
- Column mapping preview before ingestion into the live graph.
- Downloadable synthetic sample datasets (`sample_fictional_syndicate.json`, `sample_target_entities.csv`).

### I. Forensic Audit Trail & Non-Repudiation
- Immutable audit log tracking dossier views, graph queries, status alterations, and evidence exports.
- SHA-256 cryptographic hashes guaranteeing chain of custody.

### J. Role-Based Access Control (RBAC)
- Live role switching between **Admin**, **Lead Investigator**, **Forensic Analyst**, and **Field Agent (Viewer)**.
- Enforced permissions matrix protecting classified actions.

---

## 4. Responsible AI & Legal Evidentiary Ethics

CrimeGraph AI is explicitly designed as an **investigative decision-support system**, not an automated judge:
1. **Presumption of Innocence:** An entity's structural presence in a network does not constitute proof of criminal guilt.
2. **Fact vs Hypothesis Separation:** Real observed facts (Admiralty A1) are strictly demarcated from machine-generated link predictions.
3. **No Demographic Bias:** Risk scoring is derived strictly from observable financial velocity, cryptographic flows, and court-authorized wire intercepts.
4. **Mandatory Human Review:** All AI recommendations include human verification checklists and procedural caveats.

---

## 5. Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (or `uv` package manager)

### A. Run the Frontend (Next.js 14)
```bash
# Navigate to project root
cd crimegraph-ai

# Start the Next.js development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The frontend operates fully out-of-the-box with complete interactive state, graph analytics, and synthetic data!

To build for production:
```bash
npm run build
npm start
```

### B. Run the Backend (FastAPI + NetworkX)
```bash
# Navigate to backend directory
cd crimegraph-ai/backend

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Seed database with fictional intelligence network
python seed_data.py

# Launch FastAPI server with Uvicorn
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: **[http://localhost:8000/docs](http://localhost:8000/docs)**
- Redoc OpenAPI Documentation: **[http://localhost:8000/redoc](http://localhost:8000/redoc)**

### C. Run Backend Automated Test Suite
```bash
cd crimegraph-ai/backend
pytest tests/test_api.py -v
```

---

## 6. API Endpoint Summary

| Method | Endpoint | Description | Clearance Required |
|---|---|---|---|
| `GET` | `/` | System root health and mission status | Public |
| `POST` | `/api/auth/login` | Authenticate investigator and issue JWT | Public |
| `GET` | `/api/entities` | List / search target entities with filters | Viewer+ |
| `GET` | `/api/entities/{id}` | Retrieve classified dossier for target | Viewer+ |
| `GET` | `/api/relationships` | Retrieve all verified network edges | Viewer+ |
| `GET` | `/api/graph/metrics` | Compute global NetworkX graph metrics | Analyst+ |
| `POST` | `/api/graph/shortest-path` | Trace shortest money conduit between nodes | Analyst+ |
| `GET` | `/api/graph/centralities` | Calculate degree, betweenness, PageRank | Analyst+ |
| `GET` | `/api/graph/communities` | Detect functional network cells (LPA) | Analyst+ |
| `GET` | `/api/transactions` | Query financial transactions & flows | Viewer+ |
| `GET` | `/api/transactions/anomalies` | Retrieve structured smurfing alerts | Analyst+ |
| `GET` | `/api/cases` | List active taskforces and investigations | Viewer+ |
| `POST` | `/api/cases` | Register new investigation case file | Lead Investigator+ |
| `POST` | `/api/ai/query` | Natural language grounded graph Q&A | Viewer+ |
| `GET` | `/api/audit` | Chronological non-repudiation audit trail | Admin+ |

---

## 7. License & Academic Demonstration Notice

Developed as a capstone demonstration system. All entities, telephone numbers, corporate names, crypto addresses, and scenarios are synthetic and fictitious. Any resemblance to real persons or actual ongoing investigations is purely coincidental.
