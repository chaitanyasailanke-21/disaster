import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Battery, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Droplets, 
  Activity, 
  Wind,
  Zap,
  ArrowRight
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { NodeId, SensorNode } from '../types/simulation';

interface NodeMatrixProps {
  onSelectNode: (nodeId: NodeId) => void;
  selectedNodeId: NodeId | null;
}

export const NodeMatrix: React.FC<NodeMatrixProps> = ({
  onSelectNode,
  selectedNodeId
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const getNodeIcon = (zone: SensorNode['zone']) => {
    switch (zone) {
      case 'FOREST': return <Flame className="w-3.5 h-3.5 text-amber-600" />;
      case 'RIVER': return <Droplets className="w-3.5 h-3.5 text-blue-600" />;
      case 'HILLSIDE': return <Activity className="w-3.5 h-3.5 text-emerald-600" />;
      case 'URBAN': return <Wind className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const stateColors = {
    NORMAL: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    WATCH: 'bg-sky-50 text-sky-800 border-sky-300',
    WARNING: 'bg-amber-50 text-amber-900 border-amber-300',
    CRITICAL: 'bg-rose-50 text-rose-900 border-rose-300'
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 font-sans text-xs text-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-900 uppercase tracking-wide">
            ESP32-S3 Physical Edge Nodes Telemetry
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md font-mono">
          PROTOTYPE HARDWARE: 2 × ESP32-S3
        </span>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {simulationEngine.prototypeNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-50/90 border-sky-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {/* Node Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white border border-slate-200">
                    {getNodeIcon(node.zone)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{node.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-normal">({node.hardware})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{node.role}</div>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${stateColors[node.state]}`}>
                  {node.state}
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-slate-200 text-[10px] font-mono mb-2">
                <div>
                  <span className="text-slate-400">Trust: </span>
                  <strong className="text-emerald-700">{node.overallSensorTrustPct}%</strong>
                </div>
                <div>
                  <span className="text-slate-400">Sample: </span>
                  <strong className={node.isReSensing ? 'text-sky-700 font-bold' : 'text-slate-700'}>
                    {node.samplingRateHz.toFixed(1)} Hz
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Vbat: </span>
                  <strong className="text-slate-700">{node.batteryVoltage.toFixed(2)}V</strong>
                </div>
              </div>

              {/* Sensor Readings Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {node.sensors.map((sensor) => (
                  <div
                    key={sensor.type}
                    className={`p-1.5 rounded-lg border text-[10px] font-mono ${
                      sensor.isAnomaly
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="truncate text-slate-500 text-[9px]">{sensor.label}</div>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="font-bold text-slate-900">
                        {sensor.value.toFixed(1)} {sensor.unit}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {sensor.sensorTrustPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
