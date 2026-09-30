import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  WifiOff, 
  Wifi, 
  AlertOctagon, 
  ServerCrash, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Globe
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { soundManager } from '../audio/soundEffects';

export const ChaosTestPanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const node1 = simulationEngine.prototypeNodes[0];
  const node2 = simulationEngine.prototypeNodes[1];

  const flameFault = node1.sensors.find(s => s.type === 'FLAME_IR')?.healthStatus === 'FAULT';
  const smokeUntrusted = node1.sensors.find(s => s.type === 'SMOKE_MQ2')?.healthStatus === 'UNTRUSTED';
  const waterFault = node2.sensors.find(s => s.type === 'WATER_LEVEL_ULTRASONIC')?.healthStatus === 'FAULT';
  const node1Failed = node1.nodeHealth === 'FAILED';
  const node1Severed = node1.loraStatus === 'DISCONNECTED';

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 font-sans text-xs text-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-slate-900 uppercase tracking-wide">
            Chaos &amp; Resilience Testing
          </span>
        </div>
        <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
          CHAOS SUITE
        </span>
      </div>

      {/* Resilience Thesis Banner */}
      <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-900">Graceful Edge Degradation: </strong>
          <span>
            Broken cloud cables or corrupted sensor pins must never trigger phantom alarms or freeze the edge network.
          </span>
        </div>
      </div>

      {/* 1. Internet Sever Chaos Injection */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900 text-xs">External Internet Link</div>
          <div className="text-[11px] text-slate-500">
            {simulationEngine.isInternetOnline ? 'Cloud uplink active' : 'INTERNET CUT — Local mesh runs autonomous'}
          </div>
        </div>
        <button
          onClick={() => {
            soundManager.playPacketAck();
            simulationEngine.toggleInternet();
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
            simulationEngine.isInternetOnline
              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          {simulationEngine.isInternetOnline ? 'Sever Internet' : 'Restore Internet'}
        </button>
      </div>

      {/* 2. Sensor Hardware Failure Injections */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Inject Hardware Transducer Faults:
        </div>

        {/* Node 1 Ultrasonic Splash/Spike Fault */}
        <button
          onClick={() => {
            soundManager.playPacketAck();
            simulationEngine.toggleSensorFault('NODE-1', 'WATER_LEVEL_ULTRASONIC');
          }}
          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors cursor-pointer"
        >
          <div>
            <div className="font-medium text-slate-800 text-xs">Node 1: Corrupt Ultrasonic Depth</div>
            <div className="text-[10px] text-slate-500">Simulate acoustic transducer hardware failure</div>
          </div>
          <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            Toggle Fault
          </span>
        </button>

        {/* Node 2 Smoke Sensor Degradation */}
        <button
          onClick={() => {
            soundManager.playPacketAck();
            simulationEngine.toggleSensorFault('NODE-2', 'SMOKE_MQ2');
          }}
          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors cursor-pointer"
        >
          <div>
            <div className="font-medium text-slate-800 text-xs">Node 2: Gas Sensor Thermal Drift</div>
            <div className="text-[10px] text-slate-500">Sensor trust decays to 12% (Untrusted)</div>
          </div>
          <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Toggle Fault
          </span>
        </button>
      </div>

      {/* Reset Chaos Tests */}
      <button
        onClick={() => {
          soundManager.playPacketAck();
          simulationEngine.resetSensorsToBaseline();
        }}
        className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset All Injected Faults</span>
      </button>
    </div>
  );
};
