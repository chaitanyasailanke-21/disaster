import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  Globe, 
  WifiOff, 
  Laptop, 
  Pause,
  Layers,
  Cpu
} from 'lucide-react';
import { simulationEngine } from '../engine/simulationEngine';
import { soundManager } from '../audio/soundEffects';

interface HeaderProps {
  isEngineeringView: boolean;
  onToggleEngineeringView: () => void;
  onOpenArchitecture?: () => void;
  onOpenAssumptions?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isEngineeringView,
  onToggleEngineeringView,
  onOpenArchitecture,
  onOpenAssumptions
}) => {
  const [, setTick] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const stateColors = {
    NORMAL: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    WATCH: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    WARNING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CRITICAL: 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
  };

  const stateDot = {
    NORMAL: 'bg-emerald-400',
    WATCH: 'bg-sky-400',
    WARNING: 'bg-amber-400',
    CRITICAL: 'bg-rose-400'
  };

  return (
    <header className="h-13 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 font-mono text-xs select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-base tracking-wider text-slate-100 flex items-center gap-1.5">
            Unknown SIX
          </span>
          <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase hidden md:inline border-l border-slate-700 pl-2">
            "Evidence Before Escalation"
          </span>
        </div>
      </div>

      {/* System Status Indicators (Clean, concise) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* System State Banner */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold text-[11px] ${stateColors[simulationEngine.systemState]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stateDot[simulationEngine.systemState]}`} />
          <span>{simulationEngine.systemState}</span>
        </div>

        {/* Nodes Online */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>NODES: <strong className="text-emerald-400">2/2</strong></span>
        </div>

        {/* LoRa Mesh Status */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300">
          <Radio className="w-3 h-3 text-sky-400" />
          <span>LoRa: <strong className="text-sky-400">ONLINE</strong></span>
        </div>

        {/* Internet Status Toggle (Click to test offline resilience) */}
        <button
          onClick={() => simulationEngine.toggleInternet()}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
            simulationEngine.isInternetOnline
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
          }`}
          title="Click to toggle Internet connectivity (LoRa mesh runs autonomously)"
        >
          {simulationEngine.isInternetOnline ? (
            <>
              <Globe className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">NET:</span> <span>ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>OFFLINE (LOCAL)</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        {/* HERO ACTION: RUN 90-SEC JUDGE DEMO */}
        <button
          onClick={() => {
            if (simulationEngine.isDemoRunning) {
              simulationEngine.stopJudgeDemo();
            } else {
              simulationEngine.startJudgeDemo();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md ${
            simulationEngine.isDemoRunning
              ? 'bg-amber-500/25 border border-amber-500/60 text-amber-300 animate-pulse'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
          }`}
          title="Start 90-second automated SIH judge demonstration"
        >
          {simulationEngine.isDemoRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE DEMO</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN 90-SEC JUDGE DEMO</span>
            </>
          )}
        </button>

        {/* Engineering View Toggle */}
        <button
          onClick={onToggleEngineeringView}
          className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
            isEngineeringView
              ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
          }`}
          title="Switch to detailed technical engineering view"
        >
          <Laptop className="w-3.5 h-3.5 text-purple-400" />
          <span>{isEngineeringView ? '3D Digital Twin' : 'Engineering View'}</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
          title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
        </button>

        {/* Reset System */}
        <button
          onClick={() => {
            simulationEngine.stopJudgeDemo();
            simulationEngine.clearHazard();
            simulationEngine.resetSensorsToBaseline();
          }}
          className="p-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-800/50 transition-colors"
          title="Reset simulation to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
