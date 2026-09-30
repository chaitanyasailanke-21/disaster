import React, { useState, useEffect } from 'react';
import { 
  SkipForward, 
  SkipBack, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2, 
  Radio, 
  ArrowRight,
  Laptop,
  Compass,
  Cpu,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { simulationEngine, JUDGE_DEMO_STEPS } from '../engine/simulationEngine';
import { soundManager } from '../audio/soundEffects';

interface JudgeDemoOverlayProps {
  onOpenEngineeringView?: () => void;
  onOpenNodeTelemetry?: () => void;
  onToggleFreeExploration?: () => void;
}

export const JudgeDemoOverlay: React.FC<JudgeDemoOverlayProps> = ({ 
  onOpenEngineeringView,
  onOpenNodeTelemetry,
  onToggleFreeExploration
}) => {
  const [, setTick] = useState(0);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState(false);

  useEffect(() => {
    return simulationEngine.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  if (!simulationEngine.isDemoRunning) return null;

  const currentStep = JUDGE_DEMO_STEPS[simulationEngine.currentDemoStepIndex] || JUDGE_DEMO_STEPS[0];
  const isFinalStep = currentStep.stepIndex === JUDGE_DEMO_STEPS.length;
  const isPaused = simulationEngine.isDemoPaused;

  const stateColors = {
    NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    WATCH: 'bg-sky-50 text-sky-700 border-sky-300',
    WARNING: 'bg-amber-50 text-amber-800 border-amber-300',
    CRITICAL: 'bg-rose-50 text-rose-800 border-rose-300'
  };

  const handleNext = () => {
    soundManager.playPacketAck();
    simulationEngine.nextJudgeDemoStep();
  };

  const handlePrev = () => {
    soundManager.playPacketAck();
    simulationEngine.prevJudgeDemoStep();
  };

  const handleTogglePause = () => {
    if (isPaused) {
      simulationEngine.resumeJudgeDemo();
    } else {
      simulationEngine.pauseJudgeDemo();
    }
  };

  const handleJump = (idx: number) => {
    soundManager.playPacketAck();
    simulationEngine.jumpToJudgeDemoStep(idx);
    setShowChapterMenu(false);
  };

  return (
    <>
      {/* 1. TOP HEADER OVERLAY (Extremely minimal, unobtrusive, daylight clean) */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between">
        {/* Top-Left: AEGIS-X DEMO MODE */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-sky-700 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-sky-600" />
            <span className="font-display tracking-wider text-xs sm:text-sm">AEGIS-X</span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-mono text-[10px]">
              DEMO MODE
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {currentStep.stepIndex.toString().padStart(2, '0')} / {JUDGE_DEMO_STEPS.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Top-Center: "Let's understand what is happening in the environment." */}
        <div className="hidden lg:flex pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-full px-4 py-1 text-xs font-medium text-slate-700 items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Let's understand what is happening in the environment.</span>
        </div>

        {/* Top-Right: Quick Controls & View Switcher */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Chapter Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChapterMenu(!showChapterMenu)}
              className="bg-white/95 hover:bg-slate-50 backdrop-blur-md border border-slate-200 shadow-md text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Select Chapter"
            >
              <span>Chapters</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showChapterMenu && (
              <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-50 text-xs">
                <div className="font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider text-[10px] border-b border-slate-100 mb-1">
                  12 Judge Demo Chapters
                </div>
                {JUDGE_DEMO_STEPS.map((step, idx) => (
                  <button
                    key={step.stepIndex}
                    onClick={() => handleJump(idx)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                      idx === simulationEngine.currentDemoStepIndex
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-400 w-5">
                      {step.stepIndex.toString().padStart(2, '0')}.
                    </span>
                    <span className="truncate flex-1">{step.title.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Switch to Free Exploration */}
          {onToggleFreeExploration && (
            <button
              onClick={onToggleFreeExploration}
              className="bg-white/95 hover:bg-slate-50 backdrop-blur-md border border-slate-200 shadow-md text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Exit Guided Tour to 3D Orbit Camera"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Free 3D</span>
            </button>
          )}

          {/* Engineering View Button */}
          {onOpenEngineeringView && (
            <button
              onClick={onOpenEngineeringView}
              className="bg-sky-600 hover:bg-sky-700 text-white shadow-md px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Full Engineering Telemetry Dashboard"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Engineering</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. BOTTOM GUIDED EXPLANATION AREA (Clean daylight hero card, 85-90% world visible) */}
      <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center px-3 sm:px-6 pointer-events-none select-none">
        <div className="pointer-events-auto max-w-3xl w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          
          {/* Header Row: Chapter Phase, Tagline Principle, and State */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                Chapter {currentStep.stepIndex} of {JUDGE_DEMO_STEPS.length} · {currentStep.phase}
              </span>

              {/* Hardware Prototype Indicator */}
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-600 font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <Cpu className="w-3 h-3 text-emerald-600" />
                <span>Node 1 &amp; 2: Physical Hardware (ESP32-S3 + LoRa)</span>
              </span>
            </div>

            {/* Live State & Confidence */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${stateColors[currentStep.systemState]}`}>
                {currentStep.systemState}
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                <span>CONF:</span>
                <strong className="text-sky-700">{(currentStep.hazardConfidence * 100).toFixed(0)}%</strong>
              </div>
            </div>
          </div>

          {/* Chapter Title & Plain-English Explanation */}
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-1 leading-snug">
              {currentStep.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {currentStep.description}
            </p>
          </div>

          {/* Principle Callout Banner: "Evidence Before Escalation" */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <div className="text-xs text-amber-950 font-medium leading-tight">
                <strong className="font-semibold text-amber-900">“Evidence Before Escalation”: </strong>
                {currentStep.aegisCallout.replace(/^AEGIS-X:\s*"?/, '').replace(/"?$/, '')}
              </div>
            </div>

            {/* Technical Detail Expand Toggle */}
            <button
              onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}
              className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold underline shrink-0 cursor-pointer"
            >
              {showTechnicalDrawer ? 'Hide specs' : 'Under the hood'}
            </button>
          </div>

          {/* Optional Inline Technical Specs Drawer */}
          {showTechnicalDrawer && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-700 leading-relaxed animate-fade-in">
              <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Telemetry &amp; Edge Processing Signature
              </div>
              <p>{currentStep.technicalDetail}</p>
            </div>
          )}

          {/* Bottom Actions Row: Navigation, Progress Dots, Next Button */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Left Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={currentStep.stepIndex <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700 transition-colors cursor-pointer"
                title="Previous Chapter"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePause}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title={isPaused ? "Resume Auto-Advance" : "Pause Auto-Advance"}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline text-[11px]">Play</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline text-[11px]">Pause</span>
                  </>
                )}
              </button>

              <button
                onClick={() => simulationEngine.startJudgeDemo()}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Restart Demonstration from Chapter 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center Clickable Progress Dots */}
            <div className="hidden sm:flex items-center gap-1">
              {JUDGE_DEMO_STEPS.map((step, idx) => (
                <button
                  key={step.stepIndex}
                  onClick={() => handleJump(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === simulationEngine.currentDemoStepIndex
                      ? 'w-6 bg-sky-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Jump to Chapter ${step.stepIndex}: ${step.title}`}
                />
              ))}
            </div>

            {/* Right Action Button: [ NEXT ] */}
            <div className="flex items-center gap-2">
              {isFinalStep ? (
                <button
                  onClick={onToggleFreeExploration || onOpenEngineeringView}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Free Exploration</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <span>NEXT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
