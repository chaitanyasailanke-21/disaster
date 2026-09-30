import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  Cpu, 
  Network,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { EvidenceLedgerEntry } from '../types/simulation';

export const EvidenceLedger: React.FC = () => {
  const [, setTick] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const ledger = simulationEngine.evidenceLedger;
  const currentConfidence = simulationEngine.aggregatedHazardConfidence;
  const systemState = simulationEngine.systemState;
  const node1Trust = simulationEngine.node1TrustPct;
  const node2Trust = simulationEngine.node2TrustPct;
  const activeHazard = simulationEngine.activeHazard;

  const phaseColors: Record<EvidenceLedgerEntry['phase'], { bg: string; text: string; border: string }> = {
    SENSE: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    VALIDATE: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
    TRUST_CHECK: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
    ANOMALY: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
    RE_SENSE: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-300' },
    NEIGHBOUR_QUERY: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-300' },
    NEIGHBOUR_RESPONSE: { bg: 'bg-indigo-100', text: 'text-indigo-950', border: 'border-indigo-400' },
    FUSION: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300' },
    DECISION: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-300' },
    DECAY: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 font-sans text-xs text-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-900 uppercase tracking-wide">
            Evidence Ledger &amp; Decision Trace
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-500 hover:text-slate-900 p-1 rounded-md transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Button / Trigger: WHY DID AEGIS-X RAISE THIS ALERT? */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-700 shrink-0" />
          <div>
            <div className="font-bold text-sky-950 text-xs">
              WHY DID AEGIS-X REACH STATE: {systemState}?
            </div>
            <div className="text-[11px] text-sky-800 leading-tight">
              Aggregated Hazard Confidence: <strong>{(currentConfidence * 100).toFixed(0)}%</strong>
              {activeHazard && ` · Observed: ${activeHazard.name}`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono">Physical Prototype Trust</div>
          <div className="text-[11px] font-bold text-slate-700 font-mono">
            N1: {node1Trust}% · N2: {node2Trust}%
          </div>
        </div>
      </div>

      {/* Explainable Decision Certificate Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed text-amber-950">
        <strong className="font-semibold text-amber-900 block mb-0.5">
          "Evidence Before Escalation" Decision Rule:
        </strong>
        Alerts require verified cross-node proof. If Node 1 experiences an isolated anomaly, 
        AEGIS-X requests peer confirmation from Node 2 via LoRa before escalating to emergency services.
      </div>

      {/* Ledger Entries List */}
      {isExpanded && (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {ledger.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-mono text-[11px]">
              No evidence events logged yet. Trigger a scenario or run demo.
            </div>
          ) : (
            ledger.slice(0, 15).map((entry) => {
              const pStyle = phaseColors[entry.phase] || phaseColors.SENSE;
              return (
                <div
                  key={entry.id}
                  className={`p-2.5 rounded-xl border text-[11px] transition-all ${
                    entry.isEscalationTrigger
                      ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold font-mono ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                        {entry.phase}
                      </span>
                      {entry.nodeId && (
                        <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {entry.nodeId}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {entry.timeString}
                    </span>
                  </div>

                  <div className="font-medium text-slate-900 mb-1 leading-snug">
                    {entry.action}
                  </div>

                  {entry.explanation && (
                    <div className="text-[11px] text-slate-600 leading-relaxed font-sans mb-1.5">
                      {entry.explanation}
                    </div>
                  )}

                  {/* Confidence Evolution Badge */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-white p-1 rounded-lg border border-slate-200">
                    <span>Conf:</span>
                    <span>{(entry.hazardConfidenceBefore * 100).toFixed(0)}%</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className={entry.hazardConfidenceAfter > entry.hazardConfidenceBefore ? 'text-sky-700 font-bold' : 'text-slate-700'}>
                      {(entry.hazardConfidenceAfter * 100).toFixed(0)}%
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>State:</span>
                    <span className="font-bold text-slate-800">{entry.systemStateAfter}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
