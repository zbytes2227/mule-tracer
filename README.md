 # 🚨 MuleTrace — Graph-Based Money Muling Detection Engine

> Autonomous financial crime intelligence for exposing mule chains, circular layering, and coordinated ring behavior in transaction networks.

Built for **RIFT 2026 — Money Muling Detection Challenge**
 

## 🧠 Problem Statement

Money muling networks use layered, multi-hop transactions to obscure the origin of illicit funds. Traditional rule-based systems fail to detect these graph-based laundering patterns.

**MuleTrace** solves this using graph theory to automatically detect:

* Circular fund routing (cycles)
* Smurfing aggregation/distribution
* Layered shell account chains

---

## ✨ Key Features

✅ CSV upload (exact hackathon format)
✅ Directed transaction graph visualization
✅ Automatic fraud ring detection
✅ Suspicious account scoring (0–100)
✅ Interactive node inspection
✅ Ring highlight on click
✅ Downloadable JSON (exact required schema)
✅ Optimized for ≤30s processing (10K txns)

---

## 🏗️ System Architecture

```
CSV Upload
   ↓
Graph Builder
   ↓
Detection Engines
   ├── Cycle Detector (3–5 length)
   ├── Smurf Detector (fan-in/out + time window)
   └── Shell Chain Detector
   ↓
Scoring Engine
   ↓
JSON Output + Interactive Graph
```

---

## 🔍 Detection Methodology

### 1️⃣ Circular Fund Routing (Cycles)

* Depth-bounded DFS
* Detects cycles of length **3–5**
* Groups accounts into fraud rings
* High-confidence mule behavior

**Complexity:** O(V + E) per traversal (bounded depth)

---

### 2️⃣ Smurfing Detection

**Fan-in pattern**

* ≥10 senders → 1 receiver
* Within **72-hour window**

**Fan-out pattern**

* 1 sender → ≥10 receivers
* Within **72-hour window**

Includes temporal clustering to reduce false positives.

---

### 3️⃣ Layered Shell Chains

Detects transaction paths where:

* Chain length ≥ 3
* Intermediate accounts have very low activity (2–3 txns)
* Indicates laundering through burner accounts

---

## 🎯 Suspicion Scoring

Each account receives a **0–100 risk score** based on:

* Cycle participation (highest weight)
* Smurfing involvement
* Shell-chain presence
* Behavioral risk signals

Scores are sorted descending as required.

---

## 📥 Input Format (STRICT)

Upload CSV with **exact columns**:

| Column         | Type                |
| -------------- | ------------------- |
| transaction_id | String              |
| sender_id      | String              |
| receiver_id    | String              |
| amount         | Float               |
| timestamp      | YYYY-MM-DD HH:MM:SS |

---

## 📤 Output Format (STRICT)

The system generates downloadable JSON:

```json
{
  "suspicious_accounts": [...],
  "fraud_rings": [...],
  "graph_edges": [...],
  "summary": {...}
}
```

✔ Fully compliant with RIFT evaluation requirements
✔ Line-by-line deterministic formatting

---

## 🖥️ Tech Stack

**Frontend**

* Next.js 14
* React
* Cytoscape.js (graph visualization)
* Tailwind CSS

**Backend**

* Node.js
* Express
* Streaming CSV parser
* Custom graph engine

---

## ⚡ Performance Optimizations

* Depth-bounded cycle search
* Adjacency list graph structure
* Streaming CSV ingestion
* Early pruning in detectors
* Modular scoring pipeline

✅ Designed to meet **≤30s for 10K transactions**

---

## 🚀 Local Setup

### 1️⃣ Clone repo

```bash
git clone <your-repo-url>
cd muletrace
```

---

### 2️⃣ Backend setup

```bash
cd mule-backend-main
npm install
node server.js
```

Runs on:

```
http://localhost:6969/analyze
```

---

### 3️⃣ Frontend setup

```bash
cd mule-frontend-main
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🧪 Usage

1. Open web app
2. Upload CSV
3. Click **Run Detection Engine**
4. Explore interactive graph
5. Click rings to highlight accounts
6. Download JSON output

---

## 🎥 Demo Video

👉 https://drive.google.com/file/d/1rSr9Vrun2IpAiZj3AMuPitZcgcZM7Kgz/view?usp=sharing

---

## ⚠️ Known Limitations

* Extremely dense graphs may require layout tuning
* Very large datasets (>50K txns) may need worker threads
* Rule-based scoring (future: ML enhancement)

---

## 🚀 Future Improvements

* Graph embeddings + ML ranking
* Real-time streaming detection
* Merchant/payroll whitelist model
* WebGL graph rendering for massive scale
* GPU-accelerated analytics

---

## 👥 Team

**Team Name:** Xninjas
 
 
