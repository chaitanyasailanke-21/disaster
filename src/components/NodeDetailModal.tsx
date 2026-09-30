import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Battery, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Droplets, 
  Activity, 
  Wind,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { NodeId, SensorNode } from '../types/simulation';

interface NodeDetailModalProps {
  nodeId: NodeId | null;
  onClose: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  nodeId,
  onClose
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  if (!nodeId) return null;
  const node = simulationEngine.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950 text-base">{node.id}</span>
                <span className="text-[10px] bg-slate-100 text-sky-800 font-mono px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
                  {node.hardware}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                  {node.zone} SECTOR
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">{node.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-md font-bold font-mono">
              PROTOTYPE HARDWARE
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block mb-0.5 font-mono uppercase">AGGREGATE TRUST</span>
            <div className="font-bold text-emerald-700 text-base flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{node.overallSensorTrustPct}%</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block mb-0.5 font-mono uppercase">SX1262 LoRa LINK</span>
            <div className={`font-semibold flex items-center gap-1 ${
              node.loraStatus === 'CONNECTED' ? 'text-sky-700' : 'text-rose-700'
            }`}>
              {node.loraStatus === 'CONNECTED' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{node.loraStatus}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block mb-0.5 font-mono uppercase">SAMPLING RATE</span>
            <div className={`font-semibold ${node.isReSensing ? 'text-amber-800 font-bold' : 'text-slate-800'}`}>
              {node.samplingRateHz.toFixed(1)} Hz {node.isReSensing ? '(Adaptive 5Hz)' : ''}
            </div>
          </div>
        </div>

        {/* Offline Queue Notice */}
        {node.loraStatus === 'DISCONNECTED' && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 flex items-center justify-between text-amber-950">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-xs">LoRa Severed · Offline Flash Buffer Active</div>
                <div className="text-[11px] text-amber-800">
                  {node.offlineQueue.length} packets buffered locally. Will flush via SYNC_QUEUE upon reconnection.
                </div>
              </div>
            </div>
            <button
              onClick={() => simulationEngine.toggleLoRaLink(node.id)}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 border border-amber-400 text-amber-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Restore &amp; Flush
            </button>
          </div>
        )}

        {/* Sensors Telemetry Table */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 uppercase text-xs">
              Transducer Telemetry &amp; Sensor Trust
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              “Missing Data ≠ Zero”
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px]">
                <tr>
                  <th className="p-2.5">Sensor</th>
                  <th className="p-2.5">Reading</th>
                  <th className="p-2.5">Sensor Trust</th>
                  <th className="p-2.5 text-right">Fault Injection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {node.sensors.map(sensor => {
                  const isFaulty = sensor.healthStatus === 'FAULT';
                  const isUntrusted = sensor.healthStatus === 'UNTRUSTED';

                  return (
                    <tr key={sensor.type} className={isFaulty ? 'bg-rose-50/70' : isUntrusted ? 'bg-amber-50/70' : ''}>
                      <td className="p-2.5 font-medium">
                        <div className="text-slate-900">{sensor.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sensor.type}</div>
                      </td>
                      <td className="p-2.5 font-mono">
                        {isFaulty ? (
                          <span className="text-rose-700 font-bold">FAULT (Missing)</span>
                        ) : (
                          <span className={`font-semibold ${sensor.isAnomaly ? 'text-amber-800' : 'text-slate-800'}`}>
                            {sensor.value.toFixed(2)} {sensor.unit}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono">
                        <span className={`font-bold ${
                          sensor.sensorTrustPct >= 80 ? 'text-emerald-700' : sensor.sensorTrustPct > 30 ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {sensor.sensorTrustPct}% ({sensor.healthStatus})
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        <button
                          onClick={() => simulationEngine.toggleSensorFault(node.id, sensor.type)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                            isFaulty
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                          }`}
                        >
                          {isFaulty ? 'Restore (95%)' : 'Fail (Drop 12%)'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            onClick={() => simulationEngine.toggleLoRaLink(node.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              node.loraStatus === 'CONNECTED'
                ? 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {node.loraStatus === 'CONNECTED' ? 'Sever LoRa Link' : 'Restore LoRa Link'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
