import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Trash2, 
  Download, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Radio, 
  Flame, 
  Cpu, 
  Zap 
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { LogEntry } from '../types/simulation';

export const TimelineLog: React.FC = () => {
  const [, setTick] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const logs = simulationEngine.logs;
  const filteredLogs = filterCategory === 'ALL' 
    ? logs 
    : logs.filter(l => l.category === filterCategory);

  const handleClearLog = () => {
    simulationEngine.logs = [];
    simulationEngine.addLog('SYSTEM', 'Log Buffer Reset', 'User cleared active demonstration log buffer.', 'info');
    setTick(t => t + 1);
  };

  const handleExportLog = () => {
    const exportData = {
      project: 'AEGIS-X: Adaptive Cooperative Edge Intelligence & Safety Grid',
      tagline: 'Evidence Before Escalation',
      exportedAt: new Date().toISOString(),
      disclaimer: 'SIMULATED DEMONSTRATION LOG — NOT FIELD VALIDATED',
      prototypeHardware: '2 × ESP32-S3 + 2 × SX1262 LoRa + USB Gateway + Local Computer Station',
      systemState: simulationEngine.systemState,
      hazardConfidence: simulationEngine.aggregatedHazardConfidence,
      sensorTrust: {
        node1TrustPct: simulationEngine.node1TrustPct,
        node2TrustPct: simulationEngine.node2TrustPct
      },
      activeHazard: simulationEngine.activeHazard,
      evidenceLedger: simulationEngine.evidenceLedger,
      timelineEvents: logs.map(l => ({
        timestamp: l.timestamp,
        timeString: l.timeString,
        category: l.category,
        node: l.nodeId || 'GLOBAL',
        sensorTrustPct: l.sensorTrustPct,
        hazardConfidence: l.hazardConfidence,
        title: l.title,
        description: l.description,
        level: l.level
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-x-decision-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (cat: LogEntry['category']) => {
    switch (cat) {
      case 'HAZARD':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1 rounded text-[9px]">HAZARD</span>;
      case 'LORA':
        return <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-1 rounded text-[9px]">LoRa</span>;
      case 'GATEWAY':
        return <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1 rounded text-[9px]">GATEWAY</span>;
      case 'EVIDENCE':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1 rounded text-[9px]">EVIDENCE</span>;
      case 'CHAOS':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 rounded text-[9px]">CHAOS</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-1 rounded text-[9px]">SYSTEM</span>;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-100 uppercase tracking-wide">
            Live Telemetry & Decision Log
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportLog}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
            title="Download complete JSON audit ledger"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>Export Log</span>
          </button>

          <button
            onClick={handleClearLog}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-[10px] transition-colors"
            title="Clear event log"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
        {['ALL', 'HAZARD', 'LORA', 'GATEWAY', 'EVIDENCE', 'CHAOS'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2 py-0.5 rounded border transition-colors whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-sky-600/30 border-sky-500/60 text-sky-200 font-semibold'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="h-64 overflow-y-auto space-y-1.5 pr-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-[11px]">
            No log entries match the selected category.
          </div>
        ) : (
          filteredLogs.map(item => (
            <div
              key={item.id}
              className={`p-2 rounded border bg-slate-950/80 transition-colors ${
                item.level === 'critical'
                  ? 'border-rose-900/60 bg-rose-950/20'
                  : item.level === 'warning'
                  ? 'border-amber-900/50 bg-amber-950/20'
                  : item.level === 'success'
                  ? 'border-emerald-900/50 bg-emerald-950/15'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 tabular-nums">[{item.timeString}]</span>
                  {getCategoryBadge(item.category)}
                  {item.nodeId && (
                    <span className="text-sky-300 font-semibold">{item.nodeId}</span>
                  )}
                </div>
                {item.sensorTrustPct !== undefined && (
                  <span className="text-emerald-400 text-[9px]">Trust: {item.sensorTrustPct}%</span>
                )}
              </div>

              <div className="font-semibold text-slate-200 text-[11px] mb-0.5">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {item.description}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
