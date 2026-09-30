import React from 'react';
import { X, FileText, AlertTriangle, ShieldCheck, CheckCircle2, Cpu, Laptop, Shield } from 'lucide-react';

interface AssumptionsModalProps {
  onClose: () => void;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-950 text-base tracking-wide">
                Technical Transparency &amp; Prototype Scope
              </h2>
              <p className="text-xs text-slate-500">
                Clear distinction between physical prototype, simulated demonstration, and future scale
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

        {/* Primary Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-5 text-amber-950">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>SIH 2026 DIGITAL TWIN DEMONSTRATION</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-sans">
            This interactive demonstration accompanies our physical 2-node prototype. 
            Hazard propagation, atmospheric scattering, and multi-node scaling are simulated to allow SIH judges to verify the edge decision cascade interactively.
          </p>
        </div>

        {/* 3 Categories: Simulated vs Prototype vs Future */}
        <div className="space-y-4 mb-5">
          {/* 1. Prototype Architecture */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>PHYSICAL HARDWARE PROTOTYPE ARCHITECTURE</span>
            </div>
            <ul className="space-y-1.5 text-emerald-950 text-xs list-disc list-inside">
              <li><strong>2 × ESP32-S3:</strong> Physical microcontrollers running localized sensor trust validation.</li>
              <li><strong>2 × Semtech SX1262:</strong> Sub-GHz LoRa mesh transceivers (868.1 MHz).</li>
              <li><strong>Environmental Transducers:</strong> HC-SR04 ultrasonic water depth, optical rain sensor, MQ-2 gas/smoke, BME688.</li>
              <li><strong>Local Computer Station:</strong> Command terminal with attached LoRa transceiver running offline SQLite event store.</li>
            </ul>
          </div>

          {/* 2. Simulated Digital Twin Elements */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-sky-900 mb-2">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              <span>SIMULATED DIGITAL TWIN REALITY</span>
            </div>
            <ul className="space-y-1.5 text-sky-950 text-xs list-disc list-inside">
              <li><strong>Environmental Dynamics:</strong> Overcast rain transitions, dynamic river water height, smoke particles, and wet roads.</li>
              <li><strong>Multi-Hazard Physics:</strong> River flash flood overflows, forest perimeter ignition, slope instability.</li>
              <li><strong>Targeted Placement Candidates:</strong> 50 procedural geographic candidates evaluated by information-value models.</li>
            </ul>
          </div>

          {/* 3. Operational Guarantees */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-purple-900 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>WHAT THE PHYSICAL CASSETTE VALIDATES</span>
            </div>
            <ul className="space-y-1.5 text-purple-950 text-xs list-disc list-inside">
              <li>Single sensor spikes are quarantined by Sensor Trust without sounding false sirens.</li>
              <li>Persistent true anomalies dynamically trigger 5 Hz burst re-sensing locally.</li>
              <li>Neighbouring nodes cross-verify physical evidence directly via peer-to-peer LoRa.</li>
              <li>The entire safety grid runs without internet or cloud dependencies.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Scope Notes
          </button>
        </div>
      </div>
    </div>
  );
};
