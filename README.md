# AEGIS-X: Adaptive Cooperative Edge Intelligence & Safety Grid

> **"Evidence Before Escalation"**
>
> *Distributed environmental monitoring network built on 2 × ESP32-S3 edge nodes, SX1262 LoRa mesh, and a Local Computer USB Gateway.*
>
> **SIMULATION — NOT A FIELD-VALIDATED PREDICTION SYSTEM**

---

## 1. Core Philosophy & Innovation

Conventional disaster warning systems operate on a naive linear loop:
$$\text{SENSE} \longrightarrow \text{SEND} \longrightarrow \text{ALERT}$$

This results in high false-alarm rates caused by momentary electrical noise, sunlight glare on optical IR detectors, or localized non-hazardous spikes.

**AEGIS-X replaces this with the Evidence Cascade:**
$$\begin{aligned}
\text{SENSE} &\longrightarrow \text{VALIDATE} \longrightarrow \text{CHECK SENSOR TRUST} \longrightarrow \text{DETECT ANOMALY} \\
&\longrightarrow \text{ESTIMATE HAZARD CONFIDENCE} \longrightarrow \text{IF UNCERTAIN: RE-SENSE (Adaptive 5Hz)} \\
&\longrightarrow \text{REQUEST NEIGHBOUR CORROBORATION} \longrightarrow \text{FUSE EVIDENCE} \\
&\longrightarrow \text{DECIDE} \longrightarrow \text{WARN (NORMAL / WATCH / WARNING / CRITICAL)}
\end{aligned}$$

### Key Principle
> **"ONE SENSOR READING ≠ AUTOMATIC DISASTER"**
>
> AEGIS-X does not blindly trust a single sensor. It evaluates transducer health, initiates high-frequency adaptive re-sensing, requests corroborating evidence from adjacent nodes over LoRa, fuses the independent evidence, and escalates only when evidence justifies the decision.

---

## 2. Real Physical Prototype Architecture

The primary hardware architecture matches the physical AEGIS-X demonstrator:

* **NODE 1 (Sector Alpha)**:
  * **Controller**: ESP32-S3 Dual-Core Xtensa microcontroller
  * **RF Transceiver**: Semtech SX1262 LoRa (868.1 MHz, +22 dBm)
  * **Sensors**: MQ-2 Gas/Smoke, BME688 Air Temperature, Optical IR Flame, DHT22 Humidity
  * **Autonomous Logic**: Sanity checks, local anomaly scoring, adaptive burst sampling (1 Hz → 5 Hz)
* **NODE 2 (Sector Bravo)**:
  * **Controller**: ESP32-S3 Dual-Core Xtensa microcontroller
  * **RF Transceiver**: Semtech SX1262 LoRa (868.1 MHz)
  * **Sensors**: HC-SR04 Ultrasonic Water Level, Optical Rain Gauge, Corridor Temperature, Humidity
  * **Autonomous Logic**: Secondary corroboration responder, flood line monitoring
* **COMMUNICATION TOPOLOGY**:
  * **Peer-to-Peer**: $\text{Node 1} \xleftrightarrow{\text{LoRa}} \text{Node 2}$ for direct edge corroboration requests (`VERIFY_REQUEST` / `VERIFY_RESPONSE`)
  * **Uplink**: $\text{Node 1 \& 2} \xrightarrow{\text{LoRa}} \text{USB LoRa Receiver Dongle} \xrightarrow{\text{Serial}} \text{Local Computer}$
* **LOCAL COMPUTER WORKSTATION**:
  * Local Gateway service, Bayesian multi-source evidence fusion engine, offline SQLite-style event ledger, offline GIS/HMI dashboard

*(Note: Raspberry Pi is NOT used as the primary gateway; Arduino UNO is NOT used. The physical prototype is strictly 2 × ESP32-S3 nodes + USB LoRa Gateway).*

---

## 3. Sensor Trust vs Hazard Confidence

AEGIS-X enforces a strict separation between two independent values:

| Metric | Question It Answers | Example Values | Range |
| :--- | :--- | :--- | :--- |
| **A. Sensor Trust / Health** | *"How much do we trust this transducer?"* | Smoke = 38% (Degraded), Temp = 96% (OK) | 0% – 100% |
| **B. Hazard Confidence** | *"How strong is the total corroborated evidence that a hazard is occurring?"* | 0.15 (Baseline), 0.48 (Watch), 0.86 (Critical) | 0.00 – 1.00 |

### Crucial Scenario: False Alarm Suppression
If Node 1's Smoke Sensor has a **Sensor Trust of 38%** and reads HIGH:
1. System enters **WATCH** (does *not* jump to Critical).
2. Node 1 executes **Adaptive Re-sensing** at 5 Hz.
3. Node 1 broadcasts `VERIFY_REQUEST` to Node 2.
4. Node 2 samples its ambient temperature and humidity: both report **NORMAL**.
5. Evidence conflict detected! System refuses to escalate and displays:
   $$\text{"INSUFFICIENT CORROBORATION — NO ESCALATION"}$$

---

## 4. Evidence Ledger & Explainable Decisions

Every state change creates an immutable **Evidence Ledger** entry answering:
* **WHAT HAPPENED?**
* **WHERE?**
* **WHY?**
* **WHAT EVIDENCE?**
* **HOW MANY NODES CORROBORATED?**
* **SENSOR TRUST?**
* **WHAT CAUSED ESCALATION?**

---

## 5. Chaos & Resilience Testing

The simulation provides a dedicated **Chaos Suite**:
1. **Sensor Fault**: Force any sensor to `FAULT` (Sensor Trust drops to 0%). Demonstrates **"Missing Data ≠ Zero"**; the system discards untrusted readings rather than miscalculating.
2. **LoRa Link Severed**: Cutting the link between a node and the Gateway triggers the internal **OFFLINE QUEUE** (store-and-forward in SPI flash). When reconnected, a `SYNC_QUEUE` burst synchronizes historical records.
3. **Node 1 Power Failure**: Node 2 detects a missed heartbeat. Gateway displays `NODE 1 OFFLINE` and maintains safety awareness via **Graceful Degradation**.

---

## 6. Future Network Scale (Concept Mode)

While the physical prototype is strictly 2 nodes, AEGIS-X includes an optional **FUTURE SCALE** toggle:
* **2 Nodes**: Primary physical prototype
* **10 Nodes**: Campus / Village corridor
* **50 Nodes**: Forest boundary & river basin
* **100+ Nodes**: Regional district mesh
* **Simulated Risk-Adaptive Deployment**: Visualizes higher virtual node allocation in elevated wildfire and flood corridors.

---

## 7. 90-Second Judge Demo Mode

Click **"RUN 90-SEC JUDGE DEMO"** in the top navigation bar to automatically execute the full 15-step narrative with self-explanatory callouts:
1. *Baseline Equilibrium*
2. *Single reading is insufficient.*
3. *Sensor trust checked.*
4. *Adaptive re-sensing active (5 Hz).*
5. *EVENT_ALERT broadcast.*
6. *Additional evidence requested.*
7. *Neighbour corroboration received.*
8. *Evidence converged.*
9. *Alert threshold crossed.*
10. *Critical flame confirmation.*
11. *Chaos fault test: Missing data ≠ Zero.*
12. *LoRa link severed: Packets buffered in offline queue.*
13. *Link restored: SYNC_QUEUE burst.*
14. *Hazard cleared & evidence decay.*
15. *Final Screen: "Evidence Before Escalation".*

---

## 8. Technical Transparency & Assumptions

* **Simulated**: Numerical transducer values, radio time-of-flight animation, Bayesian aggregation weights, visual smoke/fire/water meshes, LiFePO4 battery curve.
* **Proposed Architecture**: Edge rule engine, peer LoRa corroboration, store-and-forward queuing, offline GIS dashboard.
* **Hardware Concept**: ESP32-S3 Dual-Core, Semtech SX1262 LoRa, BME688, MQ-2, optical IR flame, HC-SR04 ultrasonic.
* **No Fake AI**: Decision logic is deterministic evidence fusion. No fabricated machine learning models, fictitious training datasets, or hallucinated 99% accuracy figures are claimed.
