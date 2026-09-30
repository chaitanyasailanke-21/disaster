import React, { useState } from 'react';
import { Header } from './components/Header';
import { ThreeScene } from './components/ThreeScene';
import { EngineeringView } from './components/EngineeringView';
import { ControlPanel } from './components/ControlPanel';
import { DeploymentPanel } from './components/DeploymentPanel';
import { EvidenceLedger } from './components/EvidenceLedger';
import { EvidenceFusionPanel } from './components/EvidenceFusionPanel';
import { ConfidenceEvolutionGraph } from './components/ConfidenceEvolutionGraph';
import { ChaosTestPanel } from './components/ChaosTestPanel';
import { FutureScaleView } from './components/FutureScaleView';
import { NodeMatrix } from './components/NodeMatrix';
import { TimelineLog } from './components/TimelineLog';
import { PacketInspectorModal } from './components/PacketInspectorModal';
import { NodeDetailModal } from './components/NodeDetailModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AssumptionsModal } from './components/AssumptionsModal';
import { JudgeDemoOverlay } from './components/JudgeDemoOverlay';
import { WelcomeJudgePopup } from './components/WelcomeJudgePopup';
import { NodeId, LoRaPacket } from './types/simulation';
import { simulationEngine } from './engine/simulationEngine';
import { 
  FileText, 
  Network, 
  TrendingUp, 
  Clock, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Radio, 
  Zap,
  Cpu,
  ShieldCheck,
  Activity,
  X,
  Sliders,
  Maximize2,
  MapPin
} from 'lucide-react';

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<LoRaPacket | null>(null);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [isEngineeringView, setIsEngineeringView] = useState(false);

  // HERO EXPERIENCE: Sidebars & Bottom Panels are COLLAPSED BY DEFAULT!
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isBottomStatusExpanded, setIsBottomStatusExpanded] = useState(false);

  // Left dock tabs: SCENARIOS, DEPLOYMENT (Risk-Adaptive), FAILURES (Chaos)
  const [activeLeftTab, setActiveLeftTab] = useState<'SCENARIOS' | 'DEPLOYMENT' | 'FAILURES'>('SCENARIOS');

  // Right dock tabs: LEDGER, FUSION, GRAPH, SCALE, LOG
  const [activeRightTab, setActiveRightTab] = useState<'LEDGER' | 'FUSION' | 'GRAPH' | 'SCALE' | 'LOG'>('LEDGER');

  const stateColors = {
    NORMAL: 'text-emerald-400',
    WATCH: 'text-sky-400',
    WARNING: 'text-amber-400',
    CRITICAL: 'text-rose-400'
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Sleek Command Center Top Bar */}
      <Header
        isEngineeringView={isEngineeringView}
        onToggleEngineeringView={() => setIsEngineeringView(!isEngineeringView)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenAssumptions={() => setIsAssumptionsOpen(true)}
      />

      {/* 2. Interactive Main Workspace — 3D Disaster Environment is HERO (85-90% attention) */}
      <div className="relative flex-1 w-full h-[calc(100vh-3.25rem)] overflow-hidden flex">
        
        {/* Left Side Dock: Collapsed by Default; slides in on demand */}
        {isLeftPanelOpen && (
          <aside className="absolute top-0 bottom-0 left-0 w-84 md:w-96 z-40 p-3 overflow-y-auto bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 flex flex-col gap-3 font-mono shadow-2xl animate-fade-in">
            {/* Dock Header & 3-Tab Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Mission Controls
              </span>
              <button
                onClick={() => setIsLeftPanelOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Collapse Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0 text-xs">
              <button
                onClick={() => setActiveLeftTab('SCENARIOS')}
                className={`py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                  activeLeftTab === 'SCENARIOS'
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Disaster Scenarios"
              >
                <Sliders className="w-3 h-3" />
                <span>Scenarios</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('DEPLOYMENT')}
                className={`py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                  activeLeftTab === 'DEPLOYMENT'
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cost-Efficient Risk-Adaptive Deployment"
              >
                <MapPin className="w-3 h-3" />
                <span>Grid Plan</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('FAILURES')}
                className={`py-1.5 rounded flex items-center justify-center gap-1 transition-colors ${
                  activeLeftTab === 'FAILURES'
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chaos Testing Suite"
              >
                <Zap className="w-3 h-3" />
                <span>Failures</span>
              </button>
            </div>

            {activeLeftTab === 'SCENARIOS' ? (
              <ControlPanel />
            ) : activeLeftTab === 'DEPLOYMENT' ? (
              <DeploymentPanel />
            ) : (
              <ChaosTestPanel />
            )}
          </aside>
        )}

        {/* Left Floating Trigger Pill (When Collapsed) */}
        {!isLeftPanelOpen && !isEngineeringView && (
          <div className="absolute top-4 left-3 z-30 flex items-center gap-2">
            <button
              onClick={() => {
                setActiveLeftTab('SCENARIOS');
                setIsLeftPanelOpen(true);
              }}
              className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg hover:border-sky-500"
              title="Open Disaster Scenarios & Controls"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Scenarios</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setActiveLeftTab('DEPLOYMENT');
                setIsLeftPanelOpen(true);
              }}
              className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg hover:border-purple-500"
              title="Open Risk-Adaptive Deployment Grid"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Targeted Grid</span>
            </button>
          </div>
        )}

        {/* Center HERO Area: 3D Digital Twin or Engineering View */}
        <main className="relative flex-1 h-full w-full overflow-hidden">
          {isEngineeringView ? (
            <EngineeringView />
          ) : (
            <ThreeScene
              onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
              onSelectPacket={(pkt) => setSelectedPacket(pkt)}
              selectedNodeId={selectedNodeId}
              onInspectNodeModal={(nodeId) => setSelectedNodeId(nodeId)}
            />
          )}

          {/* Small Floating Draggable 90-Second Judge Demo Mini-Controller */}
          <JudgeDemoOverlay onOpenEngineeringView={() => setIsEngineeringView(true)} />

          {/* Bottom Status Bar: Minimal Collapsed Strip by Default */}
          {!isEngineeringView && (
            <div className="absolute bottom-0 left-0 right-0 z-30 font-mono text-xs select-none">
              {/* Expandable Content Drawer */}
              {isBottomStatusExpanded && (
                <div className="bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 max-h-[42vh] overflow-y-auto shadow-2xl animate-fade-in">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-200">
                        AEGIS-X Field Prototype Telemetry & Decision Cascade
                      </span>
                    </div>
                    <button
                      onClick={() => setIsBottomStatusExpanded(false)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Collapse</span>
                    </button>
                  </div>

                  <NodeMatrix
                    onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                    selectedNodeId={selectedNodeId}
                  />
                </div>
              )}

              {/* Minimal Bottom Strip (Always visible, clean, non-intrusive) */}
              <div className="h-8 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <strong className="text-slate-200 tracking-wide">UNKNOWN SIX · AEGIS-X GRID</strong>
                  </span>

                  <span className="hidden sm:inline border-l border-slate-800 pl-3">
                    STATE: <strong className={stateColors[simulationEngine.systemState]}>{simulationEngine.systemState}</strong>
                  </span>

                  <span className="hidden md:inline border-l border-slate-800 pl-3">
                    HAZARD CONFIDENCE: <strong className="text-sky-400">{(simulationEngine.aggregatedHazardConfidence * 100).toFixed(0)}%</strong>
                  </span>

                  <span className="hidden lg:inline border-l border-slate-800 pl-3">
                    DEPLOYMENT: <strong className="text-slate-300">
                      {simulationEngine.virtualScaleCount === 2 
                        ? '2 Physical Prototype Nodes' 
                        : `${simulationEngine.virtualScaleCount} Nodes (Targeted Grid)`}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBottomStatusExpanded(!isBottomStatusExpanded)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700/80 transition-colors text-[10px]"
                  >
                    <span>{isBottomStatusExpanded ? 'Collapse Telemetry' : 'View Node Telemetry'}</span>
                    {isBottomStatusExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Floating Trigger Pill (When Collapsed) */}
        {!isRightPanelOpen && !isEngineeringView && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute top-4 right-3 z-30 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg hover:border-sky-500"
            title="Open Evidence Ledger & Analytics"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Evidence & Ledger</span>
          </button>
        )}

        {/* Right Side Dock: Collapsed by Default; slides in on demand */}
        {isRightPanelOpen && (
          <aside className="absolute top-0 bottom-0 right-0 w-80 md:w-96 z-40 p-3 overflow-y-auto bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 flex flex-col gap-3 font-mono shadow-2xl animate-fade-in">
            {/* Dock Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Evidence & Analytics
              </span>
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Collapse Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dock Tab Switcher */}
            <div className="grid grid-cols-5 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0 text-[10px]">
              <button
                onClick={() => setActiveRightTab('LEDGER')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeRightTab === 'LEDGER' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Evidence Ledger & Explainable Decisions"
              >
                Ledger
              </button>

              <button
                onClick={() => setActiveRightTab('FUSION')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeRightTab === 'FUSION' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Network-as-a-Sensor Fusion"
              >
                Fusion
              </button>

              <button
                onClick={() => setActiveRightTab('GRAPH')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeRightTab === 'GRAPH' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Confidence Evolution Graph"
              >
                Graph
              </button>

              <button
                onClick={() => setActiveRightTab('SCALE')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeRightTab === 'SCALE' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Future Scale & Risk-Adaptive Map"
              >
                Scale
              </button>

              <button
                onClick={() => setActiveRightTab('LOG')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeRightTab === 'LOG' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Telemetry & Incident Log"
              >
                Log
              </button>
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-900 text-[10px]">
              <button
                onClick={() => setIsArchitectureOpen(true)}
                className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 flex items-center justify-center gap-1 transition-colors"
              >
                <Network className="w-3 h-3 text-sky-400" />
                <span>Architecture</span>
              </button>

              <button
                onClick={() => setIsAssumptionsOpen(true)}
                className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 flex items-center justify-center gap-1 transition-colors"
              >
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Assumptions</span>
              </button>
            </div>

            {/* Tab Body */}
            {activeRightTab === 'LEDGER' ? (
              <EvidenceLedger />
            ) : activeRightTab === 'FUSION' ? (
              <EvidenceFusionPanel />
            ) : activeRightTab === 'GRAPH' ? (
              <ConfidenceEvolutionGraph />
            ) : activeRightTab === 'SCALE' ? (
              <FutureScaleView />
            ) : (
              <TimelineLog />
            )}
          </aside>
        )}
      </div>

      {/* 3. Detail Modals (Open only on user interaction) */}
      <NodeDetailModal
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
      />

      <PacketInspectorModal
        packet={selectedPacket}
        onClose={() => setSelectedPacket(null)}
      />

      {isArchitectureOpen && (
        <ArchitectureModal 
          onClose={() => setIsArchitectureOpen(false)}
          onFocusNode={(nId) => {
            setSelectedNodeId(nId);
            simulationEngine.setCameraMode('NODE_INSPECTION');
          }}
          onFocusComputer={() => {
            simulationEngine.setCameraMode('COMMAND_CENTER');
          }}
        />
      )}

      {isAssumptionsOpen && (
        <AssumptionsModal onClose={() => setIsAssumptionsOpen(false)} />
      )}

      {/* 5-second Welcome Popup for SIH Judge */}
      <WelcomeJudgePopup />
    </div>
  );
}
