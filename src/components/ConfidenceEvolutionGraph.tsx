import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Activity, Info } from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';

export const ConfidenceEvolutionGraph: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const history = simulationEngine.confidenceHistory;
  const currentConfidence = simulationEngine.aggregatedHazardConfidence;
  const node1Trust = simulationEngine.node1TrustPct;
  const node2Trust = simulationEngine.node2TrustPct;

  // Chart dimensions
  const width = 360;
  const height = 110;
  const padL = 30;
  const padR = 15;
  const padT = 15;
  const padB = 22;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  // Generate SVG path for Hazard Confidence
  const points = history.map((pt, idx) => {
    const x = padL + (idx / Math.max(1, history.length - 1)) * plotW;
    const y = padT + (1 - pt.hazardConfidence) * plotH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylineStr = points.join(' ');
  const areaStr = points.length > 0
    ? `${padL},${padT + plotH} ${polylineStr} ${padL + plotW},${padT + plotH}`
    : '';

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-100 uppercase tracking-wide">
            Confidence Evolution Graph
          </span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          SEPARATE TRUST & CONFIDENCE
        </span>
      </div>

      {/* Two Values Distinct Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Value A: SENSOR TRUST / HEALTH */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[10px] uppercase">SENSOR TRUST</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-slate-400 text-[10px]">Node 1: </span>
              <span className="font-bold text-emerald-400 tabular-nums">{node1Trust}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Node 2: </span>
              <span className="font-bold text-emerald-400 tabular-nums">{node2Trust}%</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            "How much do we trust this sensor?"
          </div>
        </div>

        {/* Value B: HAZARD CONFIDENCE */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[10px] uppercase">HAZARD CONFIDENCE</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sky-400 text-base tabular-nums">
              {(currentConfidence * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400">({currentConfidence.toFixed(2)})</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            "Strength of total evidence"
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative bg-slate-950 rounded-lg border border-slate-800 p-1 flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible select-none">
          {/* Threshold lines */}
          {/* CRITICAL 85% */}
          <line
            x1={padL}
            y1={padT + (1 - 0.85) * plotH}
            x2={padL + plotW}
            y2={padT + (1 - 0.85) * plotH}
            stroke="#f43f5e"
            strokeDasharray="3 3"
            strokeOpacity="0.4"
          />
          <text x={padL - 4} y={padT + (1 - 0.85) * plotH + 3} textAnchor="end" fontSize="8" fill="#f43f5e">
            85%
          </text>

          {/* WARNING 65% */}
          <line
            x1={padL}
            y1={padT + (1 - 0.65) * plotH}
            x2={padL + plotW}
            y2={padT + (1 - 0.65) * plotH}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeOpacity="0.4"
          />
          <text x={padL - 4} y={padT + (1 - 0.65) * plotH + 3} textAnchor="end" fontSize="8" fill="#f59e0b">
            65%
          </text>

          {/* WATCH 35% */}
          <line
            x1={padL}
            y1={padT + (1 - 0.35) * plotH}
            x2={padL + plotW}
            y2={padT + (1 - 0.35) * plotH}
            stroke="#38bdf8"
            strokeDasharray="3 3"
            strokeOpacity="0.4"
          />
          <text x={padL - 4} y={padT + (1 - 0.35) * plotH + 3} textAnchor="end" fontSize="8" fill="#38bdf8">
            35%
          </text>

          {/* Baseline 0% */}
          <line
            x1={padL}
            y1={padT + plotH}
            x2={padL + plotW}
            y2={padT + plotH}
            stroke="#475569"
            strokeOpacity="0.3"
          />

          {/* Gradient area */}
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {areaStr && (
            <polygon points={areaStr} fill="url(#confGrad)" />
          )}

          {polylineStr && (
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current point orb */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="3.5"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      <div className="flex justify-between text-[9px] text-slate-400">
        <span>Timeline Progression</span>
        <span>Simulated Confidence · Live Stream</span>
      </div>
    </div>
  );
};
