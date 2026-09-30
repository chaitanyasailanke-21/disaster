import React from 'react';
import { X, Radio, CheckCircle, ShieldAlert, Cpu, Hash, Activity, ShieldCheck } from 'lucide-react';
import { LoRaPacket } from '../types/simulation';

interface PacketInspectorModalProps {
  packet: LoRaPacket | null;
  onClose: () => void;
}

export const PacketInspectorModal: React.FC<PacketInspectorModalProps> = ({
  packet,
  onClose
}) => {
  if (!packet) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-950 uppercase tracking-wide text-sm">
                LoRa Packet Frame Inspector
              </span>
              <div className="text-xs text-slate-500 font-mono">
                Semtech SX1262 PHY &amp; Application Frame
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Frame Identification Table */}
        <div className="space-y-3 mb-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] block">PACKET ID:</span>
              <span className="font-bold text-sky-700">{packet.id}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">MESSAGE TYPE:</span>
              <span className="font-bold text-amber-800">{packet.messageType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">SOURCE:</span>
              <span className="text-slate-900">{packet.sourceNodeId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">DESTINATION:</span>
              <span className="text-slate-900">{packet.destinationNodeId}</span>
            </div>
          </div>

          {/* Radio PHY Layer Details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2">
            <div>
              <span className="text-slate-400 text-[10px] block">RSSI:</span>
              <span className="font-semibold text-slate-800">{packet.rssi} dBm</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">SNR:</span>
              <span className="font-semibold text-slate-800">+{packet.snr.toFixed(1)} dB</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">FREQUENCY:</span>
              <span className="font-semibold text-slate-800">{packet.frequencyMHz} MHz</span>
            </div>
          </div>

          {/* Measurement Summary Payload */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] block mb-1">APPLICATION PAYLOAD JSON:</span>
            <pre className="text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 overflow-x-auto">
              {JSON.stringify(packet.measurementSummary, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
