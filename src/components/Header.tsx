import React from 'react';
import { Bot, Terminal, Sliders, Sparkles, Shield, Activity, HelpCircle, BookmarkPlus, FolderArchive, Wrench } from 'lucide-react';
import { AgentConfig } from '../types/agent';

interface HeaderProps {
  agents: AgentConfig[];
  hasGeminiKey: boolean;
  onOpenRegistry: () => void;
  onOpenProtocol: () => void;
  onOpenSwarmHealth: () => void;
  onOpenSaveMission: () => void;
  onOpenPastMissions: () => void;
  onOpenYouTubeStudio: () => void;
  onOpenAutoCoder?: () => void;
  savedMissionsCount: number;
  canSave: boolean;
  isExecuting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  agents,
  hasGeminiKey,
  onOpenRegistry,
  onOpenProtocol,
  onOpenSwarmHealth,
  onOpenSaveMission,
  onOpenPastMissions,
  onOpenYouTubeStudio,
  onOpenAutoCoder,
  savedMissionsCount,
  canSave,
  isExecuting
}) => {
  const activeCount = agents.filter(a => a.enabled).length;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {isExecuting && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Captain Agent
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  Orchestrator v2.0
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Manager of the modular multi-agent swarm · Analyze, Delegate, Synthesize
            </p>
          </div>
        </div>

        {/* Right Actions & Status */}
        <div className="flex items-center gap-2">
          {/* Autonomous Auto-Coder Trigger */}
          {onOpenAutoCoder && (
            <button
              onClick={onOpenAutoCoder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition cursor-pointer shadow-sm shadow-cyan-500/10"
              title="Autonomous Auto-Coder: Script Repair & Bug Auto-Patching"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Auto-Coder</span>
            </button>
          )}

          {/* YouTube Production Studio Trigger */}
          <button
            onClick={onOpenYouTubeStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-semibold transition cursor-pointer shadow-sm shadow-red-500/10"
            title="Open 180s YouTube Video Production Studio & Watchable Cinema Player"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>YouTube Studio</span>
          </button>

          {/* Engine Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 shadow-sm shadow-amber-400'}`} />
            <span className="text-zinc-300 font-medium">
              {hasGeminiKey ? 'Gemini 3.8 Flash' : 'Simulated Engine'}
            </span>
          </div>

          {/* Save Mission Button */}
          <button
            onClick={onOpenSaveMission}
            disabled={!canSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              canSave
                ? 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:border-indigo-500/60 shadow-sm shadow-indigo-500/10'
                : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 cursor-not-allowed opacity-60'
            }`}
            title={canSave ? "Serialize and save current mission into localStorage" : "Enter a prompt or run a mission to save"}
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Save Mission</span>
          </button>

          {/* Past Missions Drawer Trigger */}
          <button
            onClick={onOpenPastMissions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Open side drawer to list and reload past missions"
          >
            <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Past Missions</span>
            <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/40">
              {savedMissionsCount}
            </span>
          </button>

          {/* Swarm Health Telemetry Button */}
          <button
            onClick={onOpenSwarmHealth}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-300 text-xs font-medium transition cursor-pointer"
            title="Inspect Swarm Success Rates, Latencies & Error Diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Health</span>
          </button>

          {/* Protocol Inspector Button */}
          <button
            onClick={onOpenProtocol}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
            title="Inspect Captain System Prompt & Protocol Rules"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Protocol</span>
          </button>

          {/* Agent Registry Button */}
          <button
            onClick={onOpenRegistry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 border border-zinc-700/80 text-white text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Registry</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/40">
              {activeCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
