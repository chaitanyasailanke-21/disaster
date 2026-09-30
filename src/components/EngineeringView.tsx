import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Radio, 
  Laptop, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Globe,
  WifiOff,
  Layers,
  Database
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';

export const EngineeringView: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const node1 = simulationEngine.prototypeNodes[0];
  const node2 = simulationEngine.prototypeNodes[1];
  const currentConfidence = simulationEngine.aggregatedHazardConfidence;
  const systemState = simulationEngine.systemState;
  const isInternetOnline = simulationEngine.isInternetOnline;

  return (
    <div className="w-full h-full bg-slate-50 p-6 overflow-y-auto font-sans text-xs select-text text-slate-800">
      {/* Title Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <span>AEGIS-X Engineering &amp; Physical Architecture</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Physical hardware configuration: 2 × ESP32-S3 Field Nodes + Semtech SX1262 LoRa → Local Computer Command Center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold font-mono">
            PHYSICAL PROTOTYPE MAPPING
          </span>
        </div>
      </div>

      {/* 3-Column Hardware Topology Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Hardware Block 1: NODE 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-bold text-sm text-slate-900">AEGIS-X NODE 01</span>
              </div>
              <span className="text-[11px] text-sky-700 font-mono font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                ESP32-S3
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono">MICROCONTROLLER:</span>
                <span className="font-semibold text-slate-900">ESP32-S3 Dual-Core Xtensa LX7 (240MHz)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono">RF TRANSCEIVER:</span>
                <span className="font-semibold text-sky-700">Semtech SX1262 LoRa (868.1 MHz, +22 dBm)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono mb-1">TRANSDUCER SUITE:</span>
                <div className="space-y-1 font-mono text-[11px]">
                  {node1.sensors.map(s => (
                    <div key={s.type} className="flex justify-between">
                      <span className="text-slate-700">{s.label}:</span>
                      <span className="text-emerald-700 font-semibold">{s.sensorTrustPct}% Trust</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Sampling: {node1.samplingRateHz.toFixed(1)} Hz</span>
            <span className="text-emerald-700 font-bold">Trust: {node1.overallSensorTrustPct}%</span>
          </div>
        </div>

        {/* Hardware Block 2: LOCAL COMPUTER + LORA TRANSCEIVER */}
        <div className="bg-white border-2 border-sky-400 rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-sky-600" />
                <span className="font-bold text-sm text-sky-950">LOCAL COMPUTER</span>
              </div>
              <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-bold font-mono">
                COMMAND STATION
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-sky-50/70 p-2.5 rounded-xl border border-sky-200">
                <span className="text-sky-900 text-[10px] block font-bold font-mono">INTEGRATED LoRa TRANSCEIVER:</span>
                <span className="font-semibold text-slate-900">SX1262 LoRa Concentrator / Receiver Module</span>
                <div className="text-[10px] text-slate-500">USB/UART direct association to local workstation</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono">EVIDENCE FUSION:</span>
                <span className="font-semibold text-slate-900">Bayesian Multi-Hypothesis Evidence Combiner</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono">LOCAL EVENT STORE:</span>
                <span className="font-semibold text-slate-900">Local SQLite Ledger &amp; Explainable Audit Trail</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block font-mono">NETWORK RESILIENCE:</span>
                  <span className="font-semibold text-slate-900">
                    {isInternetOnline ? 'Internet Uplink Online + LoRa Active' : 'Internet Offline (100% Autonomous LoRa)'}
                  </span>
                </div>
                {isInternetOnline ? (
                  <Globe className="w-4 h-4 text-emerald-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-600" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600">State: <strong className="text-slate-900">{systemState}</strong></span>
            <span className="text-sky-700 font-bold">Confidence: {(currentConfidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Hardware Block 3: NODE 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-bold text-sm text-slate-900">AEGIS-X NODE 02</span>
              </div>
              <span className="text-[11px] text-amber-800 font-mono font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ESP32-S3
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono">MICROCONTROLLER:</span>
                <span className="font-semibold text-slate-900">ESP32-S3 Dual-Core Xtensa LX7 (240MHz)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono">RF TRANSCEIVER:</span>
                <span className="font-semibold text-sky-700">Semtech SX1262 LoRa (868.1 MHz, +22 dBm)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-mono mb-1">TRANSDUCER SUITE:</span>
                <div className="space-y-1 font-mono text-[11px]">
                  {node2.sensors.map(s => (
                    <div key={s.type} className="flex justify-between">
                      <span className="text-slate-700">{s.label}:</span>
                      <span className="text-emerald-700 font-semibold">{s.sensorTrustPct}% Trust</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Sampling: {node2.samplingRateHz.toFixed(1)} Hz</span>
            <span className="text-emerald-700 font-bold">Trust: {node2.overallSensorTrustPct}%</span>
          </div>
        </div>
      </div>

      {/* Decision Pipeline Flowchart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Deterministic Decision Cascade (Evidence Before Escalation)</span>
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-slate-400 uppercase">STEP 1</div>
            <div className="font-bold text-slate-800">SENSOR SENSE</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-slate-400 uppercase">STEP 2</div>
            <div className="font-bold text-slate-800">VALIDATE</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-purple-700 uppercase">STEP 3</div>
            <div className="font-bold text-purple-900">SENSOR TRUST</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-amber-700 uppercase">STEP 4</div>
            <div className="font-bold text-amber-900">ANOMALY</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-blue-700 uppercase">STEP 5</div>
            <div className="font-bold text-blue-900">RE-SENSE (5Hz)</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-indigo-700 uppercase">STEP 6</div>
            <div className="font-bold text-indigo-900">PEER VERIFY</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-emerald-700 uppercase">STEP 7</div>
            <div className="font-bold text-emerald-900">FUSION</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
            <div className="text-[9px] text-rose-700 uppercase">STEP 8</div>
            <div className="font-bold text-rose-900">DECIDE &amp; WARN</div>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="text-[11px] text-slate-500 text-center border-t border-slate-200 pt-3 font-mono">
        SMART INDIA HACKATHON 2026 — 2 × PHYSICAL ESP32-S3 FIELD NODES WITH SX1262 LORA TO LOCAL COMMAND COMPUTER
      </div>
    </div>
  );
};
