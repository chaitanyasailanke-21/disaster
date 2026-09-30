import React from 'react';
import { 
  X, 
  Network, 
  ArrowDown, 
  Radio, 
  Cpu, 
  Laptop, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Flame,
  Layers,
  Database,
  Eye
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';

interface ArchitectureModalProps {
  onClose: () => void;
  onFocusNode?: (nodeId: 'NODE-1' | 'NODE-2') => void;
  onFocusComputer?: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ 
  onClose,
  onFocusNode,
  onFocusComputer
}) => {
  const currentState = simulationEngine.systemState;
  const currentConfidence = simulationEngine.aggregatedHazardConfidence;
  const node1Trust = simulationEngine.node1TrustPct;
  const node2Trust = simulationEngine.node2TrustPct;

  const handleFocus = (target: 'NODE-1' | 'NODE-2' | 'COMPUTER') => {
    onClose();
    if (target === 'NODE-1' && onFocusNode) {
      onFocusNode('NODE-1');
    } else if (target === 'NODE-2' && onFocusNode) {
      onFocusNode('NODE-2');
    } else if (target === 'COMPUTER' && onFocusComputer) {
      onFocusComputer();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 font-sans text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-950 text-base tracking-wide">
                AEGIS-X Prototype Architecture &amp; Decision Cascade
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                2 × ESP32-S3 + SX1262 LoRa ↔ Local Computer with LoRa Transceiver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Prototype Hardware Callout */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 mb-4 text-emerald-950">
          <div className="font-bold text-xs mb-1 flex items-center gap-2 text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>AUTHENTIC PHYSICAL PROTOTYPE ARCHITECTURE</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed font-sans">
            The AEGIS-X field prototype operates 2 custom weather-resistant enclosures powered by <strong>ESP32-S3</strong> microcontrollers with <strong>Semtech SX1262 LoRa transceivers</strong>. They communicate directly with each other for neighbour corroboration, and communicate directly with a <strong>Local Computer Workstation featuring an integrated LoRa transceiver</strong> running offline evidence aggregation. (No external cloud or Raspberry Pi required).
          </p>
        </div>

        {/* Interactive Click-to-Focus Nodes Diagram */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            INTERACTIVE PHYSICAL TOPOLOGY (Click to Focus in 3D):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center text-center">
            {/* Node 1 Box */}
            <button
              onClick={() => handleFocus('NODE-1')}
              className="p-3.5 bg-white border border-slate-200 hover:border-sky-500 rounded-xl text-left transition-all group shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sky-700 text-xs font-mono">NODE 01</span>
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
              </div>
              <div className="text-xs text-slate-900 font-semibold">Floodplain Station</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">ESP32-S3 + SX1262</div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-bold">Trust: {node1Trust}% · Online</div>
            </button>

            {/* Local Computer Center */}
            <button
              onClick={() => handleFocus('COMPUTER')}
              className="p-3.5 bg-white border border-slate-200 hover:border-amber-500 rounded-xl text-left transition-all group shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-800 text-xs font-mono">LOCAL COMPUTER</span>
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              </div>
              <div className="text-xs text-slate-900 font-semibold">LoRa Transceiver</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">Command Workstation</div>
              <div className="text-[10px] text-sky-700 font-mono mt-0.5 font-bold">Offline HMI &amp; Ledger</div>
            </button>

            {/* Node 2 Box */}
            <button
              onClick={() => handleFocus('NODE-2')}
              className="p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all group shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-purple-700 text-xs font-mono">NODE 02</span>
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
              </div>
              <div className="text-xs text-slate-900 font-semibold">Forest Station</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">ESP32-S3 + SX1262</div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-bold">Trust: {node2Trust}% · Online</div>
            </button>
          </div>
        </div>

        {/* 6-Stage Decision Pipeline */}
        <div className="space-y-2 mb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            "EVIDENCE BEFORE ESCALATION" PIPELINE:
          </div>

          {[
            { step: '1. SENSE', desc: 'Continuous environmental acquisition at baseline 1.0 Hz.' },
            { step: '2. VALIDATE & TRUST CHECK', desc: 'Isolate sensor hardware health vs anomaly magnitude (Sensor Trust vs Hazard Confidence).' },
            { step: '3. ADAPTIVE RE-SENSING', desc: 'Spike sampling to 5 Hz on local anomaly to discard transient noise.' },
            { step: '4. REQUEST CORROBORATION', desc: 'Dispatch peer-to-peer VERIFY_REQUEST packet via SX1262 LoRa mesh.' },
            { step: '5. FUSE EVIDENCE', desc: 'Bayesian evidence fusion converges independent observations into quantified hazard probability.' },
            { step: '6. ESCALATE & WARN', desc: 'Escalate to WATCH, WARNING, or CRITICAL only when confidence exceeds mathematical threshold.' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                {idx + 1}
              </span>
              <div>
                <strong className="text-slate-900">{item.step}: </strong>
                <span className="text-slate-600">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Pipeline View
          </button>
        </div>
      </div>
    </div>
  );
};
