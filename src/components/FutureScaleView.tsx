import React, { useState } from 'react';
import { Layers, MapPin, ShieldAlert, Cpu, ArrowRight, Eye, Radio } from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';

export const FutureScaleView: React.FC = () => {
  const [scaleLevel, setScaleLevel] = useState<number>(simulationEngine.futureScaleNodeCount);
  const isFutureMode = simulationEngine.isFutureScaleMode;

  const handleToggleFutureScale = (count: number) => {
    setScaleLevel(count);
    if (count === 2) {
      simulationEngine.setFutureScaleMode(false, 2);
    } else {
      simulationEngine.setFutureScaleMode(true, count);
    }
  };

  const getScopeLabel = (count: number) => {
    switch (count) {
      case 2: return 'Primary Physical Prototype (2 × ESP32-S3)';
      case 10: return 'Campus / Village Corridor (10 Virtual Nodes)';
      case 50: return 'Forest Boundary & River Basin (50 Virtual Nodes)';
      case 100: return 'Regional District Safety Mesh (100+ Virtual Nodes)';
      default: return 'Custom Virtual Deployment';
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-purple-500/40 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-100 uppercase tracking-wide">
            Risk-Adaptive Deployment & Future Scale
          </span>
        </div>
        <span className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
          FUTURE DEPLOYMENT CONCEPT
        </span>
      </div>

      {/* Prototype vs Scale Disclaimer */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white">Physical Prototype Boundary:</span>
          <span className="text-emerald-400 font-bold">2 × ESP32-S3 Nodes</span>
        </div>
        <div className="text-[10px] text-slate-400">
          The physical hardware prototype consists of exactly 2 ESP32-S3 nodes with SX1262 LoRa transceivers and a USB receiver. Larger networks below demonstrate conceptual risk-adaptive scalability.
        </div>
      </div>

      {/* Scale Switcher Tabs */}
      <div>
        <label className="text-slate-400 text-[10px] block mb-1.5 uppercase tracking-wider">
          Select Deployment Scale:
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[2, 10, 50, 100].map(cnt => (
            <button
              key={cnt}
              onClick={() => handleToggleFutureScale(cnt)}
              className={`py-2 px-1 text-center rounded border transition-colors ${
                scaleLevel === cnt
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-sm font-bold tabular-nums">{cnt === 100 ? '100+' : cnt}</div>
              <div className="text-[9px] truncate">{cnt === 2 ? 'PROTOTYPE' : 'VIRTUAL'}</div>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-purple-300 font-semibold mt-1.5 text-center">
          {getScopeLabel(scaleLevel)}
        </div>
      </div>

      {/* Simulated Risk Map & Node Placement Matrix */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-slate-200 uppercase">Simulated Risk-Adaptive Heatmap:</span>
          <span className="text-purple-400 font-semibold">Priority Allocation</span>
        </div>

        {/* 4 Geographic sectors with density distribution */}
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded border border-slate-850">
            <span className="text-amber-300 font-medium">Forest Boundary (Wildfire Zone):</span>
            <span className="text-slate-300 font-bold tabular-nums">
              {scaleLevel === 2 ? '1 Node (Node 1)' : `${Math.round(scaleLevel * 0.40)} Nodes (High Density)`}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded border border-slate-850">
            <span className="text-blue-300 font-medium">River Lowland Basin (Flood Zone):</span>
            <span className="text-slate-300 font-bold tabular-nums">
              {scaleLevel === 2 ? '1 Node (Node 2)' : `${Math.round(scaleLevel * 0.30)} Nodes (Med-High Density)`}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded border border-slate-850">
            <span className="text-emerald-300 font-medium">Hillside Slopes (Landslide):</span>
            <span className="text-slate-300 font-bold tabular-nums">
              {scaleLevel === 2 ? '0 Nodes (Future)' : `${Math.round(scaleLevel * 0.18)} Nodes (Sloped Contour)`}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded border border-slate-850">
            <span className="text-purple-300 font-medium">Urban & Village Buffer:</span>
            <span className="text-slate-300 font-bold tabular-nums">
              {scaleLevel === 2 ? '0 Nodes (Future)' : `${Math.round(scaleLevel * 0.12)} Nodes (Perimeter)`}
            </span>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="text-[10px] text-slate-400 text-center border-t border-slate-800 pt-2">
        SIMULATED RISK-ADAPTIVE DEPLOYMENT — FUTURE NETWORK SCALE
      </div>
    </div>
  );
};
