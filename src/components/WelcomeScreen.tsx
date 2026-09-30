import React from 'react';
import { ArrowRight, Compass, Shield, Radio, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundEffects';

interface WelcomeScreenProps {
  onContinue: () => void;
  onDirectExplore?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onContinue,
  onDirectExplore 
}) => {
  const handleStart = () => {
    soundManager.playPacketAck();
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 backdrop-blur-md text-slate-900 select-none overflow-hidden p-4 sm:p-6">
      {/* Background Subtle Daylight Ambient Gradient & Topographic Accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 via-slate-50/80 to-blue-50/40 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Main Elegant Card Container */}
      <div className="relative max-w-2xl w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
        {/* Subtle Hackathon Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-700 mb-6 bg-sky-50 border border-sky-200/70 px-3.5 py-1 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span>Smart India Hackathon 2026</span>
        </div>

        {/* Primary Project Title */}
        <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-tight text-slate-950 mb-3">
          AEGIS-X
        </h1>

        {/* Full Expanded Subtitle */}
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-600 uppercase mb-5 max-w-lg leading-relaxed">
          Adaptive Cooperative Edge Intelligence &amp; Safety Grid
        </h2>

        {/* Project Tagline Callout */}
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 font-bold text-sm sm:text-base tracking-wide mb-8 shadow-xs">
          “Evidence Before Escalation”
        </div>

        {/* Short Executive Summary (Clean, non-technical, judge-friendly) */}
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-8 leading-relaxed">
          An interactive digital twin demonstrating how distributed edge sensor nodes, 
          LoRa peer corroboration, and gateway evidence fusion prevent false alarms and 
          provide resilient disaster intelligence without relying on cloud infrastructure.
        </p>

        {/* Large Primary Action Button: [ CONTINUE ] */}
        <button
          onClick={handleStart}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-semibold text-base sm:text-lg tracking-wide shadow-lg hover:shadow-sky-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {/* Required Very Small Line */}
        <div className="mt-4 text-[11px] text-slate-500 font-medium">
          Interactive environmental intelligence demonstration
        </div>

        {/* Secondary Free Exploration Link (Optional bypass for returning reviewers) */}
        {onDirectExplore && (
          <button
            onClick={onDirectExplore}
            className="mt-6 text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-600 transition-colors cursor-pointer"
          >
            Or jump directly to free 3D digital twin exploration
          </button>
        )}
      </div>
    </div>
  );
};
