import React, { useState, useEffect } from 'react';
import { Award, Sparkles, X, CheckCircle, Shield, Radio } from 'lucide-react';

interface WelcomeJudgePopupProps {
  onDismiss?: () => void;
}

export const WelcomeJudgePopup: React.FC<WelcomeJudgePopupProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const totalDuration = 5;

  useEffect(() => {
    // 5-second countdown timer
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVisible(false);
          if (onDismiss) onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDismiss]);

  if (!isVisible) return null;

  const progressPercent = ((totalDuration - secondsRemaining + 1) / totalDuration) * 100;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 animate-fade-in pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome SIH judge"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 font-sans overflow-hidden">
        {/* Glowing top ambient light */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            if (onDismiss) onDismiss();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Dismiss Welcome (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold tracking-wide uppercase mb-3.5 shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart India Hackathon (SIH)</span>
          </div>

          {/* Primary Welcome Heading */}
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300 tracking-tight mb-2">
            Welcome SIH judge
          </h2>

          {/* Website Name & Subheading */}
          <p className="font-mono text-xs sm:text-sm text-sky-300 font-semibold tracking-wide mb-3 flex items-center gap-1.5 justify-center">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Unknown SIX · AEGIS-X Emergency Grid</span>
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mb-5">
            Thank you for reviewing our prototype. Experience cooperative edge corroboration across physical ESP32-S3 nodes with real-time smoke & air pollution sensing and autonomous LoRa mesh failover.
          </p>

          {/* Key Quick Highlight Pills */}
          <div className="grid grid-cols-3 gap-2 w-full mb-5 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-amber-400 font-bold">5 Sec</span>
              <span className="text-slate-400 text-[10px]">Auto-Dismiss</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-emerald-400 font-bold">Air Pollution</span>
              <span className="text-slate-400 text-[10px]">Smoke Sensing</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-sky-400 font-bold">Unknown SIX</span>
              <span className="text-slate-400 text-[10px]">Platform</span>
            </div>
          </div>

          {/* Countdown & Progress Indicator */}
          <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Closing in {secondsRemaining}s
              </span>
              <span>Entering Simulation...</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
