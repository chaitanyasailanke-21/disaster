import { 
  SensorNode, 
  SystemState, 
  HazardType, 
  HazardSeverity, 
  ActiveHazard, 
  LoRaPacket, 
  EvidenceItem, 
  EvidenceLedgerEntry,
  LogEntry, 
  NodeId, 
  SensorType,
  DemoStep,
  ConfidenceDataPoint,
  WeatherMode,
  CameraMode,
  MapMode,
  RiskZoneDefinition,
  NodePlacementCandidate,
  VirtualScaleOption,
  RiskLevel
} from '../types/simulation';
import { soundManager } from '../audio/soundEffects';

// LOCAL COMMAND CENTER POSITION in 3D scene (Rugged Workstation with integrated LoRa Transceiver)
export const LOCAL_COMPUTER_POSITION: [number, number, number] = [0, 2.0, 0];

// EXACT PHYSICAL PROTOTYPE ARCHITECTURE: 2 × ESP32-S3 + SX1262 LoRa
export const PROTOTYPE_NODES: SensorNode[] = [
  {
    id: 'NODE-1',
    name: 'Sector 1 — Floodplain Station',
    role: 'River Corridor & Flood / Meteorological Watch',
    hardware: 'ESP32-S3 + SX1262',
    isPhysicalPrototype: true,
    zone: 'RIVER',
    position: [14, 0.6, -6],
    nodeHealth: 'OPERATIONAL',
    overallSensorTrustPct: 95,
    localHazardConfidence: 0.04,
    state: 'NORMAL',
    lastCommunicationTime: Date.now() - 1100,
    samplingRateHz: 1.0,
    batteryPct: 95,
    batteryVoltage: 3.94,
    loraStatus: 'CONNECTED',
    offlineQueue: [],
    isReSensing: false,
    isCorroborating: false,
    sensors: [
      { type: 'WATER_LEVEL_ULTRASONIC', label: 'HC-SR04 Water Level', value: 1.25, unit: 'm', baseline: 1.20, thresholdWatch: 2.80, thresholdWarning: 4.20, thresholdCritical: 5.40, sensorTrustPct: 95, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.40, lastTestedTime: Date.now() },
      { type: 'RAINFALL_OPTICAL', label: 'Optical Rain Sensor', value: 0.0, unit: 'mm/h', baseline: 0.0, thresholdWatch: 22.0, thresholdWarning: 45.0, thresholdCritical: 75.0, sensorTrustPct: 96, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.30, lastTestedTime: Date.now() },
      { type: 'TEMP_BME688', label: 'BME688 Corridor Temp', value: 23.5, unit: '°C', baseline: 23.5, thresholdWatch: 36.0, thresholdWarning: 48.0, thresholdCritical: 60.0, sensorTrustPct: 97, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.15, lastTestedTime: Date.now() },
      { type: 'HUMIDITY_DHT', label: 'DHT22 Floodplain Humidity', value: 68.0, unit: '%', baseline: 68.0, thresholdWatch: 85.0, thresholdWarning: 92.0, thresholdCritical: 98.0, sensorTrustPct: 94, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.15, lastTestedTime: Date.now() }
    ]
  },
  {
    id: 'NODE-2',
    name: 'Sector 2 — Forest Boundary Station',
    role: 'Forest Boundary, Wildfire & Slope Stability Watch',
    hardware: 'ESP32-S3 + SX1262',
    isPhysicalPrototype: true,
    zone: 'FOREST',
    position: [-16, 1.2, -12],
    nodeHealth: 'OPERATIONAL',
    overallSensorTrustPct: 94,
    localHazardConfidence: 0.05,
    state: 'NORMAL',
    lastCommunicationTime: Date.now() - 1400,
    samplingRateHz: 1.0,
    batteryPct: 96,
    batteryVoltage: 3.96,
    loraStatus: 'CONNECTED',
    offlineQueue: [],
    isReSensing: false,
    isCorroborating: false,
    sensors: [
      { type: 'SMOKE_MQ2', label: 'MQ-2 Gas / Smoke Sensor', value: 16.0, unit: 'ppm', baseline: 15.0, thresholdWatch: 55.0, thresholdWarning: 140.0, thresholdCritical: 280.0, sensorTrustPct: 93, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.30, lastTestedTime: Date.now() },
      { type: 'TEMP_BME688', label: 'BME688 Ambient Temp', value: 24.2, unit: '°C', baseline: 24.0, thresholdWatch: 38.0, thresholdWarning: 52.0, thresholdCritical: 68.0, sensorTrustPct: 96, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.25, lastTestedTime: Date.now() },
      { type: 'FLAME_IR', label: 'Optical IR Flame Sensor', value: 0, unit: 'state', baseline: 0, thresholdWatch: 0.5, thresholdWarning: 0.8, thresholdCritical: 1.0, sensorTrustPct: 92, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.20, lastTestedTime: Date.now() },
      { type: 'VIBRATION_GEOPHONE', label: 'Seismic Geophone', value: 0.02, unit: 'g', baseline: 0.02, thresholdWatch: 0.35, thresholdWarning: 0.80, thresholdCritical: 1.50, sensorTrustPct: 94, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.15, lastTestedTime: Date.now() },
      { type: 'GAS_MQ135', label: 'MQ-135 Gas / Air Quality', value: 35.0, unit: 'AQI (Sim)', baseline: 32.0, thresholdWatch: 90.0, thresholdWarning: 180.0, thresholdCritical: 320.0, sensorTrustPct: 91, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.10, lastTestedTime: Date.now() }
    ]
  }
];

// ==========================================
// COST-EFFICIENT RISK-ADAPTIVE DEPLOYMENT DEFINITIONS
// "Do not cover every square meter. Place nodes where they provide the most important environmental evidence."
// ==========================================

export const RISK_ZONES: RiskZoneDefinition[] = [
  {
    id: 'ZONE-FLOOD',
    name: 'River Corridor & Floodplain Basin',
    category: 'FLOODPLAIN',
    riskLevel: 'CRITICAL',
    center: [14, 0.6, -6],
    radius: 11.5,
    colorHex: '#ef4444', // Red
    vulnerabilityFactor: 'Dense settlement directly downstream of bridge constriction and river meander.',
    justification: 'Critical bottleneck: Rapid catchment rise inundates residential access roads.',
    targetNodeCount: 2
  },
  {
    id: 'ZONE-FIRE',
    name: 'Sector Alpha — Forest Reserve Boundary',
    category: 'WILDFIRE',
    riskLevel: 'HIGH',
    center: [-16, 1.2, -12],
    radius: 12.0,
    colorHex: '#f97316', // Orange
    vulnerabilityFactor: 'Dense coniferous timber with prevailing seasonal dry winds toward village.',
    justification: 'High ignition probability: Early perimeter smoke detection halts crown propagation.',
    targetNodeCount: 2
  },
  {
    id: 'ZONE-SLOPE',
    name: 'Western Escarpment Slope & Cut Road',
    category: 'LANDSLIDE',
    riskLevel: 'HIGH',
    center: [-10, 4.2, 14],
    radius: 9.0,
    colorHex: '#f59e0b', // Amber
    vulnerabilityFactor: 'Steep 42° fractured shale escarpment above primary transport corridor.',
    justification: 'Slope saturation triggers sudden soil slip; geophone & tilt sensing provide vital minutes.',
    targetNodeCount: 1
  },
  {
    id: 'ZONE-POLLUTION',
    name: 'Industrial Processing Corridor',
    category: 'POLLUTION',
    riskLevel: 'MEDIUM',
    center: [18, 2.0, 24],
    radius: 7.5,
    colorHex: '#eab308', // Yellow
    vulnerabilityFactor: 'Commercial processing plants with toxic particulate stack potential.',
    justification: 'Downwind tracking across atmospheric corridor into residential valley.',
    targetNodeCount: 1
  },
  {
    id: 'ZONE-BUFFER',
    name: 'Stable Agricultural Open Buffer',
    category: 'LOW_RISK_BUFFER',
    riskLevel: 'LOW',
    center: [-2, 1.0, 4],
    radius: 16.0,
    colorHex: '#10b981', // Green
    vulnerabilityFactor: 'Flat pastureland with natural subterranean drainage and zero slope.',
    justification: 'LOW INFORMATION VALUE: Dense sensor placement here wastes hardware with zero hazard risk.',
    targetNodeCount: 0 // Zero nodes needed!
  }
];

// 50 Procedural Placement Candidates evaluated by the Simulated Information-Value Model
export const PLACEMENT_CANDIDATES: NodePlacementCandidate[] = [
  // 1. Prototype Node 1
  {
    id: 'SITE-01',
    siteName: 'Site 1: Floodplain Bridge Inflow (NODE 01)',
    position: [14, 0.6, -6],
    riskLevel: 'CRITICAL',
    zoneCategory: 'FLOODPLAIN',
    informationValueScore: 98,
    informationValueLabel: 'HIGH',
    recommended: true,
    isPhysicalPrototype: true,
    rationale: 'Direct stream gauge + bridge crossing bottleneck. Maximizes flood warning lead time.',
    populationImpact: 'Protects 340 homes in downstream floodplain',
    terrainFactor: 'River channel constriction at bridge deck',
    corroborationPartner: 'NODE-2 (Rainfall corridor correlation)'
  },
  // 2. Prototype Node 2
  {
    id: 'SITE-02',
    siteName: 'Site 2: Timberland Perimeter Ridge (NODE 02)',
    position: [-16, 1.2, -12],
    riskLevel: 'HIGH',
    zoneCategory: 'WILDFIRE',
    informationValueScore: 94,
    informationValueLabel: 'HIGH',
    recommended: true,
    isPhysicalPrototype: true,
    rationale: 'Upwind perimeter of dense pine woods. Intercepts dry seasonal firefronts before village.',
    populationImpact: 'Direct shield for eastern residential boundary',
    terrainFactor: 'Boundary knoll with unobstructed line-of-sight LoRa',
    corroborationPartner: 'NODE-1 (Regional weather & thermal corroboration)'
  },
  // 3. Virtual Node 3 (Hillside)
  {
    id: 'SITE-03',
    siteName: 'Site 3: Escarpment Shear Plane Toe (Virtual)',
    position: [-10, 4.2, 14],
    riskLevel: 'HIGH',
    zoneCategory: 'LANDSLIDE',
    informationValueScore: 91,
    informationValueLabel: 'HIGH',
    recommended: true,
    isPhysicalPrototype: false,
    rationale: 'Toe of unstable shale slope. Seismic tremor & capacitive soil moisture capture slope liquifaction.',
    populationImpact: 'Protects critical transit road below escarpment',
    terrainFactor: '42° inclination slope with historical creep',
    corroborationPartner: 'NODE-1 & NODE-2'
  },
  // 4. Virtual Node 4 (River Meander)
  {
    id: 'SITE-04',
    siteName: 'Site 4: River Meander Neck (Virtual)',
    position: [16, 0.4, 4],
    riskLevel: 'HIGH',
    zoneCategory: 'FLOODPLAIN',
    informationValueScore: 88,
    informationValueLabel: 'HIGH',
    recommended: true,
    isPhysicalPrototype: false,
    rationale: 'Overbank spillway zone where water breaches farmland prior to entering streets.',
    populationImpact: 'Early surge detection 15 minutes before village flood',
    terrainFactor: 'Natural levee low spot',
    corroborationPartner: 'NODE-1'
  },
  // 5. Virtual Node 5 (Industrial Downwind)
  {
    id: 'SITE-05',
    siteName: 'Site 5: Industrial Emission Corridor (Virtual)',
    position: [18, 2.0, 24],
    riskLevel: 'MEDIUM',
    zoneCategory: 'POLLUTION',
    informationValueScore: 82,
    informationValueLabel: 'HIGH',
    recommended: true,
    isPhysicalPrototype: false,
    rationale: 'Monitors particulate AQI downwind of processing stacks toward school zone.',
    populationImpact: 'Guards school and civic center downwind',
    terrainFactor: 'Valley wind funnel',
    corroborationPartner: 'NODE-2'
  },
  // Generate remaining virtual candidate sites (6-50)
  ...Array.from({ length: 45 }, (_, idx) => {
    const siteNum = idx + 6;
    // Pockets of risk vs buffer
    const isForestPocket = idx < 12;
    const isFloodPocket = idx >= 12 && idx < 24;
    const isSlopePocket = idx >= 24 && idx < 32;
    const isLowRiskOpenField = idx >= 32;

    let pos: [number, number, number];
    let risk: RiskLevel;
    let cat: 'FLOODPLAIN' | 'WILDFIRE' | 'LANDSLIDE' | 'POLLUTION' | 'LOW_RISK_BUFFER';
    let valScore: number;
    let recommended: boolean;

    if (isForestPocket) {
      pos = [-24 + (idx % 4) * 4, 1.4, -18 + Math.floor(idx / 4) * 4];
      risk = 'HIGH';
      cat = 'WILDFIRE';
      valScore = 75 - (idx % 5) * 5;
      recommended = true;
    } else if (isFloodPocket) {
      pos = [11 + (idx % 3) * 3, 0.3, -16 + (idx - 12) * 2.5];
      risk = 'CRITICAL';
      cat = 'FLOODPLAIN';
      valScore = 85 - (idx % 4) * 4;
      recommended = true;
    } else if (isSlopePocket) {
      pos = [-14 + (idx % 3) * 4, 3.8, 8 + (idx - 24) * 2];
      risk = 'HIGH';
      cat = 'LANDSLIDE';
      valScore = 78 - (idx % 4) * 6;
      recommended = true;
    } else {
      // Open buffer pasture: LOW VALUE! Not recommended!
      pos = [-6 + (idx % 4) * 3.5, 0.8, -2 + (idx - 32) * 2];
      risk = 'LOW';
      cat = 'LOW_RISK_BUFFER';
      valScore = 22 - (idx % 3) * 5;
      recommended = false; // REJECTED! Cost-efficient placement skips low risk fields!
    }

    return {
      id: `SITE-${siteNum.toString().padStart(2, '0')}`,
      siteName: `Site ${siteNum}: ${cat === 'LOW_RISK_BUFFER' ? 'Pasture Field (Low Value)' : cat + ' Perimeter'}`,
      position: pos,
      riskLevel: risk,
      zoneCategory: cat,
      informationValueScore: valScore,
      informationValueLabel: valScore > 70 ? 'HIGH' : valScore > 40 ? 'MEDIUM' : 'LOW',
      recommended: recommended,
      isPhysicalPrototype: false,
      rationale: recommended 
        ? 'High vulnerability pocket. Contributes valuable corroboration evidence.' 
        : 'LOW INFORMATION VALUE: Uniform dense placement here wastes budget with no hazard benefit.',
      populationImpact: recommended ? 'Protects localized infrastructure' : 'Minimal human exposure',
      terrainFactor: recommended ? 'Hazard-prone feature' : 'Stable flat terrain'
    } as NodePlacementCandidate;
  })
];

// ==========================================
// 90-SECOND JUDGE DEMO STORYLINE (Refined for SIH 2026)
// Incorporates the Cost-Efficient Targeted Deployment Moment!
// ==========================================
export const JUDGE_DEMO_STEPS: DemoStep[] = [
  {
    stepIndex: 1,
    totalSteps: 9,
    phase: 'NATURAL EQUILIBRIUM',
    title: '1. Natural Daylight Baseline (Forest, River, Village)',
    description: 'Bright realistic daylight across the 3D digital twin. Two physical AEGIS-X field nodes operate at 1.0 Hz baseline telemetry over SX1262 LoRa mesh.',
    technicalDetail: 'Daylight equilibrium. Node 1 ultrasonic water baseline: 1.25m. Node 2 gas baseline: 16 ppm. Sensor trust: 95%. Hazard confidence: 0.05.',
    aegisCallout: 'AEGIS-X: "Wide-area intelligence tells us WHERE to watch. Distributed edge nodes tell us WHAT is happening locally."',
    systemState: 'NORMAL',
    weather: 'CLEAR',
    cameraMode: 'COMMAND_CENTER',
    hazardConfidence: 0.05,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 2,
    totalSteps: 9,
    phase: 'RAIN BEGINS',
    title: '2. Environmental Transition: Rain Commences',
    description: 'Sky transitions to grey/white overcast daylight with high visibility. Rain streaks and road surface puddles appear. River water begins gradual accumulation.',
    technicalDetail: 'Daylight overcast atmosphere. Optical rainfall sensor registers initial precip (28 mm/h). Water level starts rising.',
    aegisCallout: 'Realistic atmospheric rain: High visibility daylight overcast, glistening wet surfaces.',
    systemState: 'NORMAL',
    weather: 'RAIN',
    cameraMode: 'FLOOD_OVERVIEW',
    hazardConfidence: 0.20,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 3,
    totalSteps: 9,
    phase: 'ANOMALY DETECTED',
    title: '3. Node 01: Water Level Anomaly Detected',
    description: 'Node 1 HC-SR04 ultrasonic sensor detects rapid surge (3.45m). Optical rain sensor registers 68 mm/h.',
    technicalDetail: 'Threshold crossed. Conventional systems declare immediate flood alarm. AEGIS-X isolates sensor hardware health before escalating.',
    aegisCallout: 'Single sensor reading ≠ Automatic disaster. Evaluating sensor trust before escalating.',
    systemState: 'WATCH',
    weather: 'HEAVY_RAIN',
    cameraMode: 'NODE_INSPECTION',
    hazardConfidence: 0.38,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 4,
    totalSteps: 9,
    phase: 'ADAPTIVE RE-SENSING',
    title: '4. Local Re-Sensing Triggered (5 Hz Burst)',
    description: 'Node 1 spikes its sampling rate from 1.0 Hz to 5.0 Hz to verify that the water rise is genuine and not momentary wave turbulence or splash.',
    technicalDetail: 'Adaptive burst sampling active. 5 rapid acoustic echo samples confirm sustained elevation (3.62m). Wave splash discarded.',
    aegisCallout: 'Adaptive re-sensing active (5 Hz burst). Persistence confirmed locally at the edge.',
    systemState: 'WATCH',
    weather: 'HEAVY_RAIN',
    cameraMode: 'NODE_INSPECTION',
    hazardConfidence: 0.52,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 5,
    totalSteps: 9,
    phase: 'NEIGHBOUR VERIFICATION',
    title: '5. LoRa Peer Verification: Node 1 ↔ Node 2',
    description: 'Node 1 dispatches a VERIFY_REQUEST packet directly to Node 2 via SX1262 LoRa mesh. Node 2 samples corridor atmospheric sensors.',
    technicalDetail: 'Peer-to-peer LoRa packet travels across the 3D terrain. Node 2 confirms regional storm humidity (96%) and rainfall downpour.',
    aegisCallout: 'EVIDENCE CORROBORATED: Node 2 confirms supporting catchment rainfall.',
    systemState: 'WATCH',
    weather: 'STORM',
    cameraMode: 'NETWORK_VIEW',
    hazardConfidence: 0.68,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 6,
    totalSteps: 9,
    phase: 'EVIDENCE FUSION',
    title: '6. Multi-Source Evidence Fusion & Hazard Escalation',
    description: 'Local Computer receives corroborated evidence packets. Bayesian evidence fusion converges independent observations into verified probability.',
    technicalDetail: 'Ultrasonic rise + optical rainfall + corridor humidity converge. Hazard confidence crosses escalation threshold to 0.82.',
    aegisCallout: 'HAZARD CONFIDENCE ↑: Evidence converged, crossing the mathematical warning threshold.',
    systemState: 'WARNING',
    weather: 'STORM',
    cameraMode: 'COMMAND_CENTER',
    hazardConfidence: 0.82,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 7,
    totalSteps: 9,
    phase: 'FLOOD WARNING',
    title: '7. Floodplain Warning Active — River Surges Into Village',
    description: 'River water breaks bank and visibly inundates low-lying village road. Audible alert chime sounds. Evidence Ledger generates explainable alert certificate.',
    technicalDetail: 'System state: WARNING. Water surface rises to +0.38m overflow. Roads visibly wet with dynamic reflections.',
    aegisCallout: 'Alert threshold crossed: Floodplain WARNING active with explainable audit certificate.',
    systemState: 'WARNING',
    weather: 'STORM',
    cameraMode: 'FLOOD_OVERVIEW',
    hazardConfidence: 0.90,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 8,
    totalSteps: 9,
    phase: 'CHAOS TEST',
    title: '8. Internet Failure: Complete Edge Autonomy',
    description: 'External cloud & internet connectivity severed! Notice that the Local Command Workstation and LoRa mesh continue running with zero downtime.',
    technicalDetail: 'INTERNET OFFLINE · LOCAL LORA ONLINE · LOCAL PROCESSING ONLINE. Complete edge independence without reliance on cloud servers.',
    aegisCallout: 'INTERNET OFFLINE · LOCAL LORA ONLINE: Edge grid operates completely autonomous.',
    systemState: 'WARNING',
    weather: 'STORM',
    cameraMode: 'COMMAND_CENTER',
    hazardConfidence: 0.90,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 9000
  },
  {
    stepIndex: 9,
    totalSteps: 9,
    phase: 'TARGETED DEPLOYMENT',
    title: '9. Targeted Risk-Adaptive Deployment & Validation',
    description: 'Camera pulls back to high aerial view. High-risk zones are highlighted. AEGIS-X places intelligence where risk and information value are highest — not everywhere.',
    technicalDetail: '2-Node Physical Prototype (ESP32-S3 + SX1262) validated. Targeted deployment eliminates wasteful dense grid sensing.',
    aegisCallout: 'AEGIS-X: "Sense where risk is highest. Corroborate where evidence is uncertain. Evidence Before Escalation."',
    systemState: 'WARNING',
    weather: 'CLEAR',
    cameraMode: 'DEPLOYMENT_AERIAL',
    hazardConfidence: 0.90,
    node1Trust: 95,
    node2Trust: 94,
    durationMs: 12000
  }
];

export class SimulationEngine {
  // Prototype nodes: exactly 2 physical ESP32-S3 nodes
  public prototypeNodes: SensorNode[] = JSON.parse(JSON.stringify(PROTOTYPE_NODES));
  public isFutureScaleMode: boolean = false;
  public virtualScaleCount: VirtualScaleOption = 2;
  public futureScaleNodeCount: number = 2;

  public setFutureScaleMode(active: boolean, count?: number) {
    this.isFutureScaleMode = active;
    if (count) {
      this.futureScaleNodeCount = count;
      this.virtualScaleCount = (count as VirtualScaleOption) || 2;
    }
    this.notify();
  }

  // Cost-Efficient Risk-Adaptive Deployment Layer states
  public isRiskHeatmapActive: boolean = false;
  public isNodePlacementActive: boolean = false;
  public isDenseGridComparisonActive: boolean = false;

  public systemState: SystemState = 'NORMAL';
  public activeHazard: ActiveHazard | null = null;
  
  // Dynamic Environment & Camera (Daylight / Overcast high visibility)
  public weatherMode: WeatherMode = 'CLEAR';
  public cameraMode: CameraMode = 'COMMAND_CENTER';
  public mapMode: MapMode = 'SATELLITE_TERRAIN';
  public isInternetOnline: boolean = true;

  // Wind simulation controls
  public windDirectionDeg: number = 45;
  public windSpeedMs: number = 8.5;

  // SEPARATE TRUST & CONFIDENCE
  public aggregatedHazardConfidence: number = 0.05;
  public node1TrustPct: number = 95;
  public node2TrustPct: number = 94;

  public evidencePool: EvidenceItem[] = [];
  public evidenceLedger: EvidenceLedgerEntry[] = [];
  public confidenceHistory: ConfidenceDataPoint[] = [];
  public activePackets: LoRaPacket[] = [];
  public logs: LogEntry[] = [];

  public isPaused: boolean = false;
  public simulationSpeed: number = 1.0;
  public packetSeqCounter: number = 100;
  
  // Scenarios flags
  public activeScenarioName: string = 'NORMAL_NETWORK';
  public isFalseAlarmScenarioActive: boolean = false;
  public falseAlarmBanner: string | null = null;
  public confirmedEventBanner: string | null = null;

  // 90-second judge demo mode
  public isDemoRunning: boolean = false;
  public currentDemoStepIndex: number = 0;
  public demoTimerId: ReturnType<typeof setTimeout> | null = null;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.addLog('SYSTEM', 'AEGIS-X Initialized', '2 × ESP32-S3 Nodes + SX1262 LoRa → Local Computer Station with LoRa Transceiver online.', 'info');
    this.recordConfidencePoint('Initial equilibrium');
  }

  // Returns active nodes based on Virtual Scale Mode (2 = prototype only, 5, 10, 25, 50 = prototype + virtual candidates)
  public get nodes(): SensorNode[] {
    if (this.virtualScaleCount <= 2) {
      return this.prototypeNodes;
    }

    // Generate virtual sensor nodes from top candidates
    const activeCandidates = PLACEMENT_CANDIDATES
      .filter(c => c.recommended && !c.isPhysicalPrototype)
      .slice(0, this.virtualScaleCount - 2);

    const virtualNodes: SensorNode[] = activeCandidates.map((c, idx) => {
      const vId = `V-NODE-${(idx + 3).toString().padStart(2, '0')}`;
      return {
        id: vId,
        name: `${c.siteName} (Virtual)`,
        role: `${c.zoneCategory} Strategic Watchpoint`,
        hardware: 'VIRTUAL_SCALE_NODE',
        isPhysicalPrototype: false,
        zone: c.zoneCategory === 'FLOODPLAIN' ? 'RIVER' : c.zoneCategory === 'WILDFIRE' ? 'FOREST' : 'HILLSIDE',
        position: c.position,
        nodeHealth: 'OPERATIONAL',
        overallSensorTrustPct: 92,
        localHazardConfidence: 0.04,
        state: 'NORMAL',
        lastCommunicationTime: Date.now() - (idx * 400 + 1200),
        samplingRateHz: 1.0,
        batteryPct: 96,
        batteryVoltage: 3.98,
        loraStatus: 'CONNECTED',
        offlineQueue: [],
        isReSensing: false,
        isCorroborating: false,
        sensors: [
          { type: 'TEMP_BME688', label: 'BME688 Ambient', value: 23.8, unit: '°C', baseline: 23.5, thresholdWatch: 38, thresholdWarning: 50, thresholdCritical: 65, sensorTrustPct: 94, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.5, lastTestedTime: Date.now() },
          { type: 'HUMIDITY_DHT', label: 'Regional Humidity', value: 65, unit: '%', baseline: 65, thresholdWatch: 85, thresholdWarning: 92, thresholdCritical: 98, sensorTrustPct: 92, healthStatus: 'OK', isAnomaly: false, reSensingActive: false, weight: 0.5, lastTestedTime: Date.now() }
        ]
      };
    });

    return [...this.prototypeNodes, ...virtualNodes];
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // ==========================================
  // DEPLOYMENT CONTROLLERS
  // ==========================================
  public setVirtualScaleCount(count: VirtualScaleOption) {
    this.virtualScaleCount = count;
    this.isFutureScaleMode = (count > 2);
    this.addLog(
      'DEPLOYMENT', 
      `Virtual Network Scale: ${count} Nodes`, 
      count === 2 
        ? 'Active baseline: Exactly 2 physical ESP32-S3 prototype nodes.' 
        : `VIRTUAL DEPLOYMENT: Expanded to ${count} simulated nodes placed strictly in high-risk zones.`,
      'info'
    );
    this.notify();
  }

  public toggleRiskHeatmap() {
    this.isRiskHeatmapActive = !this.isRiskHeatmapActive;
    this.addLog('DEPLOYMENT', `Risk Heatmap Layer: ${this.isRiskHeatmapActive ? 'ON' : 'OFF'}`, 'Displays spatial vulnerability zones: Floodplain, Wildfire, Slope, and Industrial.', 'info');
    this.notify();
  }

  public toggleNodePlacement() {
    this.isNodePlacementActive = !this.isNodePlacementActive;
    this.addLog('DEPLOYMENT', `Targeted Node Placement Layer: ${this.isNodePlacementActive ? 'ON' : 'OFF'}`, 'Shows strategic node locations vs empty low-risk buffer fields.', 'info');
    this.notify();
  }

  public toggleDenseGridComparison() {
    this.isDenseGridComparisonActive = !this.isDenseGridComparisonActive;
    this.addLog(
      'DEPLOYMENT', 
      `Dense Grid vs Targeted Placement: ${this.isDenseGridComparisonActive ? 'ACTIVE' : 'OFF'}`, 
      'Visually demonstrates AEGIS-X targeted placement vs wasteful uniform dense grid.',
      'info'
    );
    this.notify();
  }

  public openDeploymentAerialView() {
    this.setCameraMode('DEPLOYMENT_AERIAL');
    this.isRiskHeatmapActive = true;
    this.isNodePlacementActive = true;
    this.notify();
  }

  // Environment & Camera
  public setWeather(mode: WeatherMode) {
    this.weatherMode = mode;
    this.addLog('SYSTEM', `Weather State: ${mode}`, `Environmental daylight & overcast atmospheric scattering adjusted to ${mode}.`, 'info');
    this.notify();
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    this.notify();
  }

  public toggleInternet() {
    this.isInternetOnline = !this.isInternetOnline;
    this.addLog(
      'SYSTEM', 
      `Internet Connectivity: ${this.isInternetOnline ? 'ONLINE' : 'OFFLINE'}`, 
      this.isInternetOnline 
        ? 'Cloud link restored. Edge grid continues logging locally.' 
        : 'Cloud link severed! Local Computer & LoRa mesh maintain 100% autonomous operation.', 
      this.isInternetOnline ? 'info' : 'warning'
    );
    this.notify();
  }

  // ==========================================
  // CHAOS & FAULT INJECTION CONTROLLERS
  // ==========================================
  public toggleSensorFault(nodeId: NodeId, sensorType: SensorType) {
    const node = this.prototypeNodes.find(n => n.id === nodeId);
    if (!node) return;
    const sensor = node.sensors.find(s => s.type === sensorType);
    if (!sensor) return;

    if (sensor.healthStatus === 'OK') {
      sensor.healthStatus = 'FAULT';
      sensor.sensorTrustPct = 12;
      this.addLog('CHAOS', `Injected Sensor Fault: ${node.name} - ${sensor.label}`, 'Sensor trust dropped to 12%. Anomaly isolation test initiated.', 'warning', nodeId);
    } else {
      sensor.healthStatus = 'OK';
      sensor.sensorTrustPct = 95;
      this.addLog('CHAOS', `Restored Sensor: ${node.name} - ${sensor.label}`, 'Sensor health normalized to 95% trust.', 'info', nodeId);
    }

    const avgTrust = Math.round(node.sensors.reduce((acc, s) => acc + s.sensorTrustPct, 0) / node.sensors.length);
    node.overallSensorTrustPct = avgTrust;
    if (nodeId === 'NODE-1') this.node1TrustPct = avgTrust;
    if (nodeId === 'NODE-2') this.node2TrustPct = avgTrust;

    this.recomputeEvidenceFusion();
    this.notify();
  }

  public toggleNodeFailure(nodeId: NodeId) {
    const node = this.prototypeNodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.nodeHealth === 'OPERATIONAL') {
      node.nodeHealth = 'FAILED';
      node.loraStatus = 'DISCONNECTED';
      node.batteryPct = 0;
      node.state = 'NORMAL';
      this.addLog('CHAOS', `Simulated Power Loss: ${node.name}`, 'Node dropped offline. Neighbor corroboration unavailable from this unit.', 'critical', nodeId);
    } else {
      node.nodeHealth = 'OPERATIONAL';
      node.loraStatus = 'CONNECTED';
      node.batteryPct = 95;
      this.addLog('CHAOS', `Restored Node Power: ${node.name}`, 'Node booted back online. Heartbeat packet transmitted.', 'info', nodeId);
    }
    this.recomputeEvidenceFusion();
    this.notify();
  }

  public toggleLoRaLink(nodeId: NodeId) {
    const node = this.prototypeNodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.loraStatus === 'CONNECTED') {
      node.loraStatus = 'DISCONNECTED';
      this.addLog('CHAOS', `Simulated RF Link Jam: ${node.name}`, 'SX1262 LoRa transmission blocked. Offline queue active.', 'warning', nodeId);
    } else {
      node.loraStatus = 'CONNECTED';
      this.addLog('CHAOS', `Restored RF Link: ${node.name}`, 'LoRa connection established. Syncing offline telemetry queue.', 'info', nodeId);
    }
    this.notify();
  }

  public triggerFalseAlarmScenario() {
    this.stopJudgeDemo();
    this.clearHazard();
    this.isFalseAlarmScenarioActive = true;
    this.falseAlarmBanner = 'FALSE ALARM REJECTED — UNVERIFIED SINGLE-NODE SPIKE';
    this.activeScenarioName = 'FALSE_ALARM_TEST';

    const node1 = this.prototypeNodes.find(n => n.id === 'NODE-1');
    if (node1) {
      node1.sensors[0].value = 4.8;
      node1.sensors[0].isAnomaly = true;
      node1.sensors[0].sensorTrustPct = 35;
      node1.isReSensing = true;
      node1.samplingRateHz = 5.0;
      node1.state = 'WATCH';
    }

    this.addLog('CHAOS', 'False Alarm Test Triggered', 'Single ultrasonic spike injected. Neighbor corroboration fails to confirm. Warning NOT escalated.', 'warning');
    soundManager.playWatchPing();

    setTimeout(() => {
      this.dispatchLoRaPacket('NODE-1', 'NODE-2', 'VERIFY_REQUEST', { type: 'WATER_SPIKE', val: 4.8 });
      setTimeout(() => {
        this.dispatchLoRaPacket('NODE-2', 'NODE-1', 'VERIFY_RESPONSE', { status: 'CORROBORATION_FAILED_CLEAR_WEATHER', rain: 0 });
        this.addLedgerEntry(
          'DECISION',
          'FALSE ALARM REJECTED: Single anomalous reading failed neighbor corroboration and sensor trust check.',
          'NODE-1',
          35,
          0.35,
          0.12,
          'NORMAL',
          'AEGIS-X evidence cascade prevented false disaster evacuation. Sensor trust was below threshold.'
        );
        this.systemState = 'NORMAL';
        this.aggregatedHazardConfidence = 0.12;
        this.recordConfidencePoint('False alarm rejected');
        this.notify();
      }, 2000);
    }, 1000);

    this.notify();
  }

  public triggerCorroboratedScenario(type: HazardType = 'FLOOD') {
    this.triggerHazard(type, 'HIGH');
  }

  // ==========================================
  // DISASTER ENGINE
  // ==========================================
  public triggerHazard(type: HazardType, severity: HazardSeverity = 'HIGH') {
    this.stopJudgeDemo();
    this.isFalseAlarmScenarioActive = false;
    this.falseAlarmBanner = null;

    let center: [number, number, number] = [0, 0, 0];
    let name = '';
    let zone: 'FOREST' | 'RIVER' | 'HILLSIDE' | 'URBAN' | 'MULTI' = 'FOREST';

    switch (type) {
      case 'FOREST_FIRE':
        center = [-16, 1.2, -12];
        name = 'Sector Alpha Wildfire Outbreak';
        zone = 'FOREST';
        this.setWeather('FIRE_HAZE');
        this.setCameraMode('FOREST_OVERVIEW');
        break;
      case 'FLOOD':
        center = [14, 0.6, -6];
        name = 'River Corridor Flood Inundation';
        zone = 'RIVER';
        this.setWeather('HEAVY_RAIN');
        this.setCameraMode('FLOOD_OVERVIEW');
        break;
      case 'LANDSLIDE':
        center = [-10, 4.2, 14];
        name = 'Escarpment Slope Failure';
        zone = 'HILLSIDE';
        this.setWeather('RAIN');
        this.setCameraMode('HILLSIDE_OVERVIEW');
        break;
      case 'EXTREME_RAIN':
        center = [0, 1.5, 0];
        name = 'Regional Catchment Cloudburst';
        zone = 'MULTI';
        this.setWeather('STORM');
        this.setCameraMode('NETWORK_VIEW');
        break;
      case 'AIR_QUALITY_EVENT':
        center = [-16, 1.2, -12]; // Centered at Node-2 where MQ-2 Smoke and MQ-135 Gas sensors are deployed
        name = 'Dense Air Pollution & Toxic Smoke Plume';
        zone = 'FOREST';
        this.setWeather('FIRE_HAZE');
        this.setCameraMode('NODE_INSPECTION');
        break;
      default:
        this.clearHazard();
        return;
    }

    this.activeHazard = {
      id: `HAZARD-${Date.now().toString().slice(-4)}`,
      type,
      name,
      zone,
      severity,
      center,
      radius: 8.5,
      startTime: Date.now(),
      intensity: severity === 'HIGH' ? 0.85 : severity === 'MEDIUM' ? 0.55 : 0.35,
      spreadRate: 0.4,
      windDirectionDeg: this.windDirectionDeg,
      windSpeedMs: this.windSpeedMs,
      status: 'ACTIVE'
    };

    this.addLog('HAZARD', `Hazard Triggered: ${name}`, `Severity: ${severity}. Simulating local sensor deviation across nodes.`, 'warning');
    soundManager.playWatchPing();
    this.propagateHazardToSensors();
    this.notify();
  }

  public clearHazard() {
    this.activeHazard = null;
    this.activeScenarioName = 'NORMAL_NETWORK';
    this.isFalseAlarmScenarioActive = false;
    this.falseAlarmBanner = null;
    this.confirmedEventBanner = null;
    this.setWeather('CLEAR');
    this.setCameraMode('FREE_CAMERA');
    this.resetSensorsToBaseline();
    this.recomputeEvidenceFusion();
    this.addLog('HAZARD', 'Hazard Cleared', 'System returned to equilibrium.', 'info');
    this.notify();
  }

  public resetSensorsToBaseline() {
    this.prototypeNodes.forEach(node => {
      node.state = 'NORMAL';
      node.isReSensing = false;
      node.isCorroborating = false;
      node.samplingRateHz = 1.0;
      node.localHazardConfidence = 0.05;
      node.sensors.forEach(s => {
        s.value = s.baseline;
        s.isAnomaly = false;
        s.reSensingActive = false;
        s.healthStatus = 'OK';
        s.sensorTrustPct = 95;
      });
    });

    this.aggregatedHazardConfidence = 0.05;
    this.systemState = 'NORMAL';
    this.evidencePool = [];
    this.activePackets = [];
    this.recordConfidencePoint('Reset to baseline');
    this.notify();
  }

  private propagateHazardToSensors() {
    if (!this.activeHazard) return;

    if (this.activeHazard.type === 'FLOOD' || this.activeHazard.type === 'EXTREME_RAIN') {
      const node1 = this.prototypeNodes.find(n => n.id === 'NODE-1');
      if (node1) {
        node1.sensors.forEach(s => {
          if (s.type === 'WATER_LEVEL_ULTRASONIC') {
            s.value = 4.65;
            s.isAnomaly = true;
          }
          if (s.type === 'RAINFALL_OPTICAL') {
            s.value = 65.0;
            s.isAnomaly = true;
          }
        });
        node1.state = 'WATCH';
        node1.localHazardConfidence = 0.58;
        node1.isReSensing = true;
        node1.samplingRateHz = 5.0; // 5Hz Adaptive Re-sensing burst!

        this.addLedgerEntry(
          'ANOMALY', 
          'Node 01 ultrasonic water level threshold breached (4.65m > 4.20m)', 
          'NODE-1', 
          node1.overallSensorTrustPct, 
          0.05, 
          0.58, 
          'WATCH', 
          'Ultrasonic distance drop indicates rapid water level rise. Adaptive re-sensing active.'
        );

        // Transmit LoRa Verify Request to Node 2
        this.dispatchLoRaPacket('NODE-1', 'NODE-2', 'VERIFY_REQUEST', {
          event: 'FLOOD_PRELIM',
          level_m: 4.65,
          rain_mm_h: 65.0
        });
      }

      // Node 2 corroborates rainfall/humidity
      const node2 = this.prototypeNodes.find(n => n.id === 'NODE-2');
      if (node2) {
        node2.sensors.forEach(s => {
          if (s.type === 'HUMIDITY_DHT') {
            s.value = 95.0;
            s.isAnomaly = true;
          }
        });
        node2.isCorroborating = true;
      }
    } else if (this.activeHazard.type === 'FOREST_FIRE') {
      const node2 = this.prototypeNodes.find(n => n.id === 'NODE-2');
      if (node2) {
        node2.sensors.forEach(s => {
          if (s.type === 'SMOKE_MQ2') {
            s.value = 185.0;
            s.isAnomaly = true;
          }
          if (s.type === 'TEMP_BME688') {
            s.value = 49.5;
            s.isAnomaly = true;
          }
          if (s.type === 'FLAME_IR') {
            s.value = 1.0;
            s.isAnomaly = true;
          }
        });
        node2.state = 'WATCH';
        node2.localHazardConfidence = 0.72;
        node2.isReSensing = true;
        node2.samplingRateHz = 5.0;

        this.addLedgerEntry(
          'ANOMALY',
          'Node 02 smoke and thermal threshold breached (185 ppm, 49.5°C)',
          'NODE-2',
          node2.overallSensorTrustPct,
          0.05,
          0.72,
          'WATCH',
          'Optical and electrochemical smoke spike accompanied by rapid ambient temperature climb.'
        );

        this.dispatchLoRaPacket('NODE-2', 'NODE-1', 'VERIFY_REQUEST', {
          event: 'FIRE_PRELIM',
          smoke_ppm: 185.0,
          temp_c: 49.5
        });
      }
    } else if (this.activeHazard.type === 'AIR_QUALITY_EVENT') {
      const node2 = this.prototypeNodes.find(n => n.id === 'NODE-2');
      if (node2) {
        node2.sensors.forEach(s => {
          if (s.type === 'SMOKE_MQ2') {
            s.value = 245.0; // ppm: critical smoke threshold breached
            s.isAnomaly = true;
            s.reSensingActive = true;
          }
          if (s.type === 'GAS_MQ135') {
            s.value = 275.0; // AQI: severe particulate air pollution
            s.isAnomaly = true;
            s.reSensingActive = true;
          }
          if (s.type === 'TEMP_BME688') {
            s.value = 39.0;
            s.isAnomaly = true;
            s.reSensingActive = true;
          }
        });
        node2.state = 'WARNING';
        node2.localHazardConfidence = 0.88;
        node2.isReSensing = true;
        node2.samplingRateHz = 5.0; // 5Hz Adaptive Re-sensing burst for smoke detection

        this.addLedgerEntry(
          'ANOMALY',
          'AIR POLLUTION SMOKE BREACH: Node 02 MQ-2 Smoke (245 ppm) & MQ-135 Gas (275 AQI) detected dense particulate smoke plume',
          'NODE-2',
          node2.overallSensorTrustPct,
          0.05,
          0.88,
          'WARNING',
          'Intake snorkel optical and electrochemical sensors actively detecting heavy smoke. Adaptive 5 Hz burst sampling confirms sustained air pollution density.'
        );

        this.dispatchLoRaPacket('NODE-2', 'NODE-1', 'EVENT_ALERT', {
          event: 'AIR_POLLUTION_SMOKE',
          smoke_ppm: 245.0,
          aqi: 275.0,
          sensor: 'MQ-2_AND_MQ-135'
        });
      }

      // Node-1 corridor station corroborates atmospheric drift
      const node1 = this.prototypeNodes.find(n => n.id === 'NODE-1');
      if (node1) {
        node1.sensors.forEach(s => {
          if (s.type === 'TEMP_BME688') {
            s.value = 29.0;
          }
        });
        node1.isCorroborating = true;
      }
    }

    setTimeout(() => {
      this.recomputeEvidenceFusion();
    }, 1500);
  }

  // ==========================================
  // BAYESIAN EVIDENCE FUSION ENGINE
  // ==========================================
  public recomputeEvidenceFusion() {
    let totalScore = 0;
    const items: EvidenceItem[] = [];

    this.prototypeNodes.forEach(node => {
      node.sensors.forEach(s => {
        if (s.isAnomaly && s.healthStatus !== 'UNTRUSTED') {
          const trustWeight = s.sensorTrustPct / 100.0;
          const score = s.weight * trustWeight * (s.reSensingActive ? 1.2 : 1.0);
          totalScore += score;

          items.push({
            id: `EV-${node.id}-${s.type}`,
            nodeId: node.id,
            sensorType: s.type,
            sensorLabel: s.label,
            hazardType: this.activeHazard?.type || 'NONE',
            detectedValue: s.value,
            unit: s.unit,
            sensorTrustPct: s.sensorTrustPct,
            anomalyScore: score,
            reSensedConfirmed: s.reSensingActive,
            timestamp: Date.now(),
            summary: `${s.label}: ${s.value} ${s.unit} (Trust: ${s.sensorTrustPct}%)`,
            isCorroboratingEvidence: node.isCorroborating,
            status: 'SUPPORTING'
          });
        }
      });
    });

    this.evidencePool = items;
    const previousConfidence = this.aggregatedHazardConfidence;
    this.aggregatedHazardConfidence = Math.min(1.0, Math.max(0.04, totalScore));

    // Determine state
    let nextState: SystemState = 'NORMAL';
    if (this.aggregatedHazardConfidence >= 0.85) {
      nextState = 'CRITICAL';
    } else if (this.aggregatedHazardConfidence >= 0.65) {
      nextState = 'WARNING';
    } else if (this.aggregatedHazardConfidence >= 0.35) {
      nextState = 'WATCH';
    }

    if (nextState !== this.systemState) {
      const prevState = this.systemState;
      this.systemState = nextState;

      if (nextState === 'WARNING' || nextState === 'CRITICAL') {
        soundManager.playCriticalSiren();
      } else if (nextState === 'WATCH') {
        soundManager.playWatchPing();
      }

      this.addLedgerEntry(
        'DECISION',
        `System state escalated to ${nextState} (Confidence: ${(this.aggregatedHazardConfidence * 100).toFixed(0)}%)`,
        undefined,
        undefined,
        previousConfidence,
        this.aggregatedHazardConfidence,
        nextState,
        `Multi-sensor evidence convergence crossed the ${nextState} decision boundary.`
      );
    }

    this.recordConfidencePoint(`Fusion update: ${this.systemState}`);
    this.notify();
  }

  // ==========================================
  // LORA PACKET MANAGEMENT
  // ==========================================
  public dispatchLoRaPacket(
    source: NodeId | 'LOCAL_COMPUTER',
    dest: NodeId | 'LOCAL_COMPUTER' | 'BROADCAST',
    type: LoRaPacket['messageType'],
    measurements: Record<string, string | number>
  ) {
    this.packetSeqCounter++;
    const pktId = `PKT-${this.packetSeqCounter}`;

    const srcNode = this.prototypeNodes.find(n => n.id === source);
    let startPos: [number, number, number] = [0, 2, 0];
    let endPos: [number, number, number] = [0, 2, 0];

    if (source === 'NODE-1') startPos = [14, 2.1, -6];
    else if (source === 'NODE-2') startPos = [-16, 2.3, -12];
    else if (source === 'LOCAL_COMPUTER') startPos = [0, 2.4, 0];

    if (dest === 'NODE-1') endPos = [14, 2.1, -6];
    else if (dest === 'NODE-2') endPos = [-16, 2.3, -12];
    else if (dest === 'LOCAL_COMPUTER') endPos = [0, 2.4, 0];

    const pkt: LoRaPacket = {
      id: pktId,
      sourceNodeId: source,
      destinationNodeId: dest,
      messageType: type,
      timestamp: Date.now(),
      sequenceNumber: this.packetSeqCounter,
      sensorTrustPct: srcNode ? srcNode.overallSensorTrustPct : 95,
      hazardConfidence: this.aggregatedHazardConfidence,
      sensorHealth: 'GOOD',
      measurementSummary: measurements,
      crc: 'VALID',
      messageStatus: 'TRANSMITTING',
      rssi: -82 - Math.floor(Math.random() * 8),
      snr: 7.8 + (Math.random() * 1.5),
      frequencyMHz: 868.1,
      progress: 0,
      startPos,
      endPos
    };

    this.activePackets.push(pkt);
    soundManager.playRadioChirp();

    this.addLog(
      'LORA',
      `LoRa ${type}: ${source} → ${dest}`,
      `Payload: ${JSON.stringify(measurements)} | RSSI: ${pkt.rssi} dBm`,
      'info',
      source === 'LOCAL_COMPUTER' ? undefined : (source as NodeId),
      pktId
    );

    this.notify();
  }

  // ==========================================
  // LEDGER & CONFIDENCE TIMELINE
  // ==========================================
  private addLedgerEntry(
    phase: EvidenceLedgerEntry['phase'],
    action: string,
    nodeId?: NodeId,
    sensorTrustPct?: number,
    confBefore: number = 0.05,
    confAfter: number = 0.05,
    stateAfter: SystemState = 'NORMAL',
    explanation: string = ''
  ) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0').slice(0, 2)}`;

    const entry: EvidenceLedgerEntry = {
      id: `LEDGER-${Date.now().toString().slice(-5)}`,
      eventId: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: Date.now(),
      timeString: timeStr,
      phase,
      action,
      nodeId,
      sensorTrustPct,
      hazardConfidenceBefore: confBefore,
      hazardConfidenceAfter: confAfter,
      systemStateBefore: this.systemState,
      systemStateAfter: stateAfter,
      explanation,
      isEscalationTrigger: confAfter > confBefore && stateAfter !== 'NORMAL'
    };

    this.evidenceLedger.unshift(entry);
    if (this.evidenceLedger.length > 50) this.evidenceLedger.pop();
  }

  public recordConfidencePoint(note?: string) {
    const now = new Date();
    const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.confidenceHistory.push({
      timeString: timeStr,
      timestamp: Date.now(),
      hazardConfidence: this.aggregatedHazardConfidence,
      node1Trust: this.node1TrustPct,
      node2Trust: this.node2TrustPct,
      state: this.systemState,
      eventNote: note
    });
    if (this.confidenceHistory.length > 40) this.confidenceHistory.shift();
  }

  public addLog(
    category: LogEntry['category'],
    title: string,
    description: string,
    level: LogEntry['level'] = 'info',
    nodeId?: NodeId,
    packetId?: string
  ) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const log: LogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
      timestamp: Date.now(),
      timeString: timeStr,
      category,
      title,
      description,
      level,
      nodeId,
      packetId,
      sensorTrustPct: nodeId === 'NODE-1' ? this.node1TrustPct : nodeId === 'NODE-2' ? this.node2TrustPct : undefined,
      hazardConfidence: this.aggregatedHazardConfidence
    };

    this.logs.unshift(log);
    if (this.logs.length > 100) this.logs.pop();
  }

  // ==========================================
  // RUNTIME TICK (Animation, Packets, Demo)
  // ==========================================
  public tick(dt: number) {
    if (this.isPaused) return;

    // Advance active LoRa packets
    for (let i = this.activePackets.length - 1; i >= 0; i--) {
      const pkt = this.activePackets[i];
      pkt.progress = (pkt.progress || 0) + dt * 0.95;
      if (pkt.progress >= 1.0) {
        soundManager.playPacketAck();
        this.activePackets.splice(i, 1);
      }
    }
  }

  // ==========================================
  // 90-SECOND JUDGE DEMO EXECUTION
  // ==========================================
  public startJudgeDemo() {
    this.clearHazard();
    this.isDemoRunning = true;
    this.currentDemoStepIndex = 0;
    this.executeCurrentDemoStep();
    this.notify();
  }

  public stopJudgeDemo() {
    if (this.demoTimerId) {
      clearTimeout(this.demoTimerId);
      this.demoTimerId = null;
    }
    this.isDemoRunning = false;
    this.notify();
  }

  public nextJudgeDemoStep() {
    if (this.currentDemoStepIndex < JUDGE_DEMO_STEPS.length - 1) {
      this.currentDemoStepIndex++;
      this.executeCurrentDemoStep();
    } else {
      this.stopJudgeDemo();
    }
  }

  public prevJudgeDemoStep() {
    if (this.currentDemoStepIndex > 0) {
      this.currentDemoStepIndex--;
      this.executeCurrentDemoStep();
    }
  }

  private executeCurrentDemoStep() {
    if (this.demoTimerId) {
      clearTimeout(this.demoTimerId);
      this.demoTimerId = null;
    }

    const step = JUDGE_DEMO_STEPS[this.currentDemoStepIndex];
    if (!step) return;

    this.systemState = step.systemState;
    this.aggregatedHazardConfidence = step.hazardConfidence;
    this.setWeather(step.weather);
    this.setCameraMode(step.cameraMode);

    if (step.cameraMode === 'DEPLOYMENT_AERIAL') {
      this.isRiskHeatmapActive = true;
      this.isNodePlacementActive = true;
    } else {
      this.isRiskHeatmapActive = false;
    }

    // Trigger step-specific packet transmissions and alerts
    if (step.stepIndex === 3) {
      const node1 = this.prototypeNodes.find(n => n.id === 'NODE-1');
      if (node1) {
        node1.sensors[0].value = 3.45;
        node1.sensors[0].isAnomaly = true;
        node1.state = 'WATCH';
      }
      soundManager.playWatchPing();
    } else if (step.stepIndex === 4) {
      const node1 = this.prototypeNodes.find(n => n.id === 'NODE-1');
      if (node1) {
        node1.isReSensing = true;
        node1.samplingRateHz = 5.0;
        node1.sensors[0].value = 3.62;
      }
    } else if (step.stepIndex === 5) {
      this.dispatchLoRaPacket('NODE-1', 'NODE-2', 'VERIFY_REQUEST', { type: 'WATER_SURGE', val_m: 3.62 });
      setTimeout(() => {
        this.dispatchLoRaPacket('NODE-2', 'NODE-1', 'VERIFY_RESPONSE', { status: 'CONFIRMED_RAIN_SURGE', rain_mm: 68 });
      }, 2500);
    } else if (step.stepIndex === 6) {
      this.dispatchLoRaPacket('NODE-1', 'LOCAL_COMPUTER', 'EVENT_ALERT', { conf: 0.82, state: 'WARNING' });
    } else if (step.stepIndex === 7) {
      soundManager.playCriticalSiren();
    } else if (step.stepIndex === 8) {
      this.isInternetOnline = false;
    } else if (step.stepIndex === 9) {
      this.isInternetOnline = true;
    }

    this.addLog('SYSTEM', `Demo Step ${step.stepIndex}: ${step.title}`, step.description, 'info');
    this.recordConfidencePoint(`Demo: ${step.phase}`);
    this.notify();

    // Auto-advance after step duration
    this.demoTimerId = setTimeout(() => {
      this.nextJudgeDemoStep();
    }, step.durationMs);
  }
}

export const simulationEngine = new SimulationEngine();
