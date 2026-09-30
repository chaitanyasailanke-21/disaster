import React, { useState, useEffect } from 'react';
import { 
  Network, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Sliders, 
  Eye, 
  Layers, 
  Info, 
  CheckCircle2, 
  XCircle,
  TrendingDown,
  Cpu,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  simulationEngine, 
  RISK_ZONES, 
  PLACEMENT_CANDIDATES 
} from '../engine/simulationEngine';
import { VirtualScaleOption, RiskLevel } from '../types/simulation';

export const DeploymentPanel: React.FC = () => {
  const [, setTick] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('SITE-01');

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const scaleOptions: VirtualScaleOption[] = [2, 5, 10, 25, 50];
  const selectedCandidate = PLACEMENT_CANDIDATES.find(c => c.id === selectedCandidateId) || PLACEMENT_CANDIDATES[0];

  const riskBadgeColors: Record<RiskLevel, string> = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-300',
    HIGH: 'bg-amber-50 text-amber-800 border-amber-300',
    MEDIUM: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-xs text-slate-800 select-none">
      {/* 1. Core Architectural Principle Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sky-950 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-xs text-sky-900 mb-1">
          <Network className="w-4 h-4 text-sky-600" />
          <span>RISK-ADAPTIVE TARGETED DEPLOYMENT</span>
        </div>
        <p className="text-xs text-sky-900 leading-relaxed font-sans">
          <strong>“Don't sense everywhere. Sense where it matters.”</strong><br />
          Targeted deployment eliminates wasteful sensor density by concentrating nodes strictly where risk and information value are highest, using neighbouring nodes for cooperative corroboration.
        </p>
      </div>

      {/* 2. Interactive Map Layer Toggles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>3D Map Overlays</span>
          <button
            onClick={() => simulationEngine.openDeploymentAerialView()}
            className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Aerial View</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Risk Heatmap Layer */}
          <button
            onClick={() => simulationEngine.toggleRiskHeatmap()}
            className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-colors cursor-pointer ${
              simulationEngine.isRiskHeatmapActive
                ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-[11px]">Risk Zones</div>
              <div className="text-[10px] text-slate-500">Critical corridors</div>
            </div>
          </button>

          {/* Targeted Sites Layer */}
          <button
            onClick={() => simulationEngine.toggleNodePlacement()}
            className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-colors cursor-pointer ${
              simulationEngine.isNodePlacementActive
                ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-[11px]">Targeted Sites</div>
              <div className="text-[10px] text-slate-500">High information value</div>
            </div>
          </button>
        </div>

        {/* Dense Grid Comparison Toggle */}
        <button
          onClick={() => simulationEngine.toggleDenseGridComparison()}
          className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
            simulationEngine.isDenseGridComparisonActive
              ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px]">Compare: Uniform 100-Node Dense Grid</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
            {simulationEngine.isDenseGridComparisonActive ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* 3. Cost & Value Comparison Metric Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Deployment Economics Analysis
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Uniform Dense Grid */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Uniform Grid</div>
            <div className="text-slate-800 font-bold">100 Nodes</div>
            <div className="text-slate-500 text-[10px]">Blanket 50m spacing</div>
            <div className="mt-1 text-rose-700 font-semibold text-[10px]">₹ 4,80,000 capital</div>
            <div className="text-slate-400 text-[9px]">Wasted in low-risk pastures</div>
          </div>

          {/* AEGIS-X Targeted Grid */}
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300">
            <div className="text-[10px] text-emerald-800 font-bold uppercase mb-0.5">AEGIS-X Plan</div>
            <div className="text-emerald-950 font-bold">12 Targeted Nodes</div>
            <div className="text-emerald-800 text-[10px]">Bottleneck corridors only</div>
            <div className="mt-1 text-emerald-700 font-bold text-[10px]">₹ 57,600 capital</div>
            <div className="text-emerald-800 font-semibold text-[9px]">Saves 88% hardware cost</div>
          </div>
        </div>
      </div>

      {/* 4. Scalability Slider */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-700">Simulate Grid Scale:</span>
          <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            {simulationEngine.virtualScaleCount} Nodes
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {scaleOptions.map(opt => (
            <button
              key={opt}
              onClick={() => simulationEngine.setVirtualScaleCount(opt)}
              className={`py-1.5 rounded-lg border text-center text-xs font-mono font-bold transition-colors cursor-pointer ${
                simulationEngine.virtualScaleCount === opt
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
