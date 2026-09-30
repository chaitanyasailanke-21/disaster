import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Droplets, 
  Activity, 
  CloudRain, 
  Wind, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertOctagon, 
  WifiOff, 
  Wifi, 
  Radio, 
  Sliders, 
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { HazardType, HazardSeverity, NodeId, SensorType } from '../types/simulation';

export const ControlPanel: React.FC = () => {
  const [, setTick] = useState(0);
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('FOREST_FIRE');
  const [selectedSeverity, setSelectedSeverity] = useState<HazardSeverity>('MEDIUM');
  const [chaosNode, setChaosNode] = useState<NodeId>('NODE-1');
  const [chaosSensor, setChaosSensor] = useState<SensorType>('FLAME_IR');

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
      if (simulationEngine.activeHazard) {
        setSelectedHazard(simulationEngine.activeHazard.type);
        setSelectedSeverity(simulationEngine.activeHazard.severity);
      }
    });
  }, []);

  const activeHazard = simulationEngine.activeHazard;
  const currentNode = simulationEngine.nodes.find(n => n.id === chaosNode);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-4 text-xs font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-100 uppercase tracking-wide">
            Disaster Simulation Engine
          </span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          SIMULATED ENGINE
        </span>
      </div>

      {/* CORE INNOVATION SHOWCASE BUTTONS: FALSE ALARM vs CORROBORATED */}
      <div className="space-y-1.5">
        <label className="text-amber-300 font-bold block text-[10px] uppercase tracking-wider">
          Decision Cascade Showcases:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => simulationEngine.triggerFalseAlarmScenario()}
            className="p-2.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/50 rounded-lg text-left transition-colors"
          >
            <div className="font-bold text-amber-300 text-[11px]">FALSE ALARM SCENARIO</div>
            <div className="text-[9px] text-slate-400 leading-tight mt-0.5">
              Low trust (38%) + Node 2 counter-evidence → No escalation!
            </div>
          </button>

          <button
            onClick={() => simulationEngine.triggerCorroboratedScenario()}
            className="p-2.5 bg-sky-950/30 hover:bg-sky-950/50 border border-sky-500/50 rounded-lg text-left transition-colors"
          >
            <div className="font-bold text-sky-300 text-[11px]">CORROBORATED SCENARIO</div>
            <div className="text-[9px] text-slate-400 leading-tight mt-0.5">
              Re-sense + Node 2 corroboration → Escalates to CRITICAL.
            </div>
          </button>
        </div>
      </div>

      {/* Hazard Selector Matrix */}
      <div>
        <label className="text-slate-400 block mb-1.5 uppercase text-[10px] tracking-wider">
          Trigger Hazard Scenario:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          <button
            onClick={() => { setSelectedHazard('FOREST_FIRE'); simulationEngine.triggerHazard('FOREST_FIRE', selectedSeverity); }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-colors ${
              activeHazard?.type === 'FOREST_FIRE'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <div>Forest Fire</div>
              <div className="text-[9px] text-slate-400">Node 1 (ESP32-S3)</div>
            </div>
          </button>

          <button
            onClick={() => { setSelectedHazard('FLOOD'); simulationEngine.triggerHazard('FLOOD', selectedSeverity); }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-colors ${
              activeHazard?.type === 'FLOOD'
                ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="truncate">
              <div>River Flood</div>
              <div className="text-[9px] text-slate-400">Node 2 (ESP32-S3)</div>
            </div>
          </button>

          <button
            onClick={() => { setSelectedHazard('LANDSLIDE'); simulationEngine.triggerHazard('LANDSLIDE', selectedSeverity); }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-colors ${
              activeHazard?.type === 'LANDSLIDE'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div>Landslide</div>
              <div className="text-[9px] text-slate-400">Slope Geophone</div>
            </div>
          </button>

          <button
            onClick={() => { setSelectedHazard('EXTREME_RAIN'); simulationEngine.triggerHazard('EXTREME_RAIN', selectedSeverity); }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-colors ${
              activeHazard?.type === 'EXTREME_RAIN'
                ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="truncate">
              <div>Extreme Rain</div>
              <div className="text-[9px] text-slate-400">Corridor Wide</div>
            </div>
          </button>

          <button
            onClick={() => { setSelectedHazard('AIR_QUALITY_EVENT'); simulationEngine.triggerHazard('AIR_QUALITY_EVENT', selectedSeverity); }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-colors ${
              activeHazard?.type === 'AIR_QUALITY_EVENT'
                ? 'bg-amber-500/25 border-amber-500/70 text-amber-300 font-semibold ring-1 ring-amber-500/40 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-700/60 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <div className="truncate">
              <div>Air Pollution</div>
              <div className="text-[9px] text-amber-400/90 font-semibold">Smoke Detection</div>
            </div>
          </button>

          <button
            onClick={() => { setSelectedHazard('MULTI_HAZARD'); simulationEngine.triggerHazard('MULTI_HAZARD', selectedSeverity); }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-colors ${
              activeHazard?.type === 'MULTI_HAZARD'
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="truncate">
              <div>Multi-Hazard</div>
              <div className="text-[9px] text-slate-400">Compound Risk</div>
            </div>
          </button>
        </div>
      </div>

      {/* Severity & Speed Rows */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">
            Severity:
          </label>
          <div className="flex rounded-md bg-slate-950 p-1 border border-slate-800">
            {(['LOW', 'MEDIUM', 'HIGH'] as HazardSeverity[]).map(sev => (
              <button
                key={sev}
                onClick={() => {
                  setSelectedSeverity(sev);
                  if (activeHazard) simulationEngine.triggerHazard(activeHazard.type, sev);
                }}
                className={`flex-1 py-1 text-center rounded transition-colors text-[11px] ${
                  selectedSeverity === sev
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">
            Simulation Speed:
          </label>
          <div className="flex rounded-md bg-slate-950 p-1 border border-slate-800">
            {[1.0, 2.0, 5.0].map(spd => (
              <button
                key={spd}
                onClick={() => { simulationEngine.simulationSpeed = spd; setTick(t => t + 1); }}
                className={`flex-1 py-1 text-center rounded transition-colors text-[11px] ${
                  simulationEngine.simulationSpeed === spd
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => simulationEngine.triggerHazard(selectedHazard, selectedSeverity)}
          className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>START HAZARD</span>
        </button>

        <button
          onClick={() => { simulationEngine.isPaused = !simulationEngine.isPaused; setTick(t => t + 1); }}
          className={`px-3 py-2 border rounded-lg flex items-center justify-center gap-1 transition-colors ${
            simulationEngine.isPaused
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white'
          }`}
        >
          <Pause className="w-3.5 h-3.5" />
          <span>{simulationEngine.isPaused ? 'RESUME' : 'PAUSE'}</span>
        </button>

        <button
          onClick={() => simulationEngine.clearHazard()}
          className="px-3 py-2 border border-slate-800 bg-slate-950 hover:bg-rose-950/40 hover:border-rose-800 text-slate-300 hover:text-rose-300 rounded-lg flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CLEAR</span>
        </button>
      </div>

      {/* QUICK FAULT INJECTION */}
      <div className="border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>QUICK SENSOR FAULT INJECTION</span>
          </div>
          <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
            TRUST TEST
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={chaosNode}
            onChange={e => {
              const nid = e.target.value as NodeId;
              setChaosNode(nid);
              const n = simulationEngine.nodes.find(node => node.id === nid);
              if (n && n.sensors[0]) setChaosSensor(n.sensors[0].type);
            }}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px]"
          >
            {simulationEngine.nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.id} ({n.hardware})
              </option>
            ))}
          </select>

          <select
            value={chaosSensor}
            onChange={e => setChaosSensor(e.target.value as SensorType)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px]"
          >
            {currentNode?.sensors.map(s => (
              <option key={s.type} value={s.type}>
                {s.label} ({s.healthStatus})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => simulationEngine.toggleSensorFault(chaosNode, chaosSensor)}
          className={`w-full py-1.5 rounded-lg border text-[11px] flex items-center justify-center gap-1 font-semibold transition-colors ${
            currentNode?.sensors.find(s => s.type === chaosSensor)?.healthStatus === 'FAULT'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
          <span>
            {currentNode?.sensors.find(s => s.type === chaosSensor)?.healthStatus === 'FAULT'
              ? 'RESTORE SENSOR HEALTH (100% TRUST)'
              : 'FAIL SENSOR (DROP TRUST TO 0%)'}
          </span>
        </button>
      </div>
    </div>
  );
};
