import React, { useState, useEffect } from 'react';
import { 
  Network, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { EvidenceItem } from '../types/simulation';

export const EvidenceFusionPanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const evidenceList = simulationEngine.evidencePool;
  const currentConfidence = simulationEngine.aggregatedHazardConfidence;
  const systemState = simulationEngine.systemState;
  const contributingNodes = Array.from(new Set(evidenceList.filter(e => e.status === 'SUPPORTING').map(e => e.nodeId)));

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-100 uppercase tracking-wide">
            Network-as-a-Sensor: Evidence Fusion
          </span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          BAYESIAN FUSION
        </span>
      </div>

      {/* Decision Cascade Principle */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white uppercase text-[10px]">Evidence Cascade:</span>
          <span className="text-amber-300 font-semibold text-[10px]">
            {contributingNodes.length >= 2 ? 'Multi-Node Consensus' : contributingNodes.length === 1 ? 'Single Source (Unverified)' : 'Equilibrium Standby'}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          "One sensor reading ≠ Automatic disaster. Sensor trust is checked, anomaly re-sensed, and neighbour evidence required before escalation."
        </div>
      </div>

      {/* Hazard Confidence Meter */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[11px]">
          <span className="text-slate-400">Aggregated Hazard Confidence:</span>
          <span className="font-bold text-slate-100 tabular-nums text-sm">
            {(currentConfidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
          {/* Threshold marker lines */}
          <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-slate-700/80 z-10" title="WATCH (35%)" />
          <div className="absolute top-0 bottom-0 left-[65%] w-0.5 bg-slate-700/80 z-10" title="WARNING (65%)" />
          <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-slate-700/80 z-10" title="CRITICAL (85%)" />

          <div 
            className={`h-full transition-all duration-300 ${
              systemState === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' :
              systemState === 'WARNING' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
              systemState === 'WATCH' ? 'bg-sky-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${currentConfidence * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
          <span>NORMAL (0%)</span>
          <span className="pl-4">WATCH (35%)</span>
          <span className="pl-4">WARNING (65%)</span>
          <span>CRITICAL (85%)</span>
        </div>
      </div>

      {/* Peer Corroboration Synergy Status */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded border text-center ${
          contributingNodes.includes('NODE-1')
            ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
            : 'bg-slate-950 border-slate-850 text-slate-500'
        }`}>
          <div className="font-bold text-[10px]">NODE 1 (ESP32-S3)</div>
          <div className="text-[9px]">
            {contributingNodes.includes('NODE-1') ? 'Primary Evidence Active' : 'Baseline Standby'}
          </div>
        </div>

        <div className={`p-2 rounded border text-center ${
          contributingNodes.includes('NODE-2')
            ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
            : 'bg-slate-950 border-slate-850 text-slate-500'
        }`}>
          <div className="font-bold text-[10px]">NODE 2 (ESP32-S3)</div>
          <div className="text-[9px]">
            {contributingNodes.includes('NODE-2') ? 'Corroborating Evidence' : 'Standby / Counter-Evidence'}
          </div>
        </div>
      </div>

      {/* Corroboration Pool Table */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
          <span>Active Evidence Pool:</span>
          <span>{evidenceList.length} items</span>
        </div>

        {evidenceList.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-center text-slate-400 text-[11px]">
            No anomalies currently corroborated. Network operating at baseline equilibrium.
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {evidenceList.map(ev => (
              <div 
                key={ev.id}
                className={`bg-slate-950 border rounded p-2 flex items-center justify-between text-[11px] ${
                  ev.status === 'UNTRUSTED' ? 'border-amber-900/60 opacity-60' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    ev.status === 'SUPPORTING' ? 'bg-sky-400' : 'bg-amber-400'
                  }`} />
                  <div>
                    <span className="font-semibold text-slate-200">{ev.nodeId}</span>
                    <span className="text-slate-400 ml-1.5">{ev.summary}</span>
                  </div>
                </div>

                <div className="text-right text-[10px]">
                  <div className="font-semibold text-emerald-400">Trust: {ev.sensorTrustPct}%</div>
                  <div className="text-[9px] text-slate-400">Score: {(ev.anomalyScore * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>Simulated Bayesian evidence fusion. Untrusted transducers are discarded to avoid false alarms.</span>
      </div>
    </div>
  );
};
