import React from 'react';
import { Bot, Terminal, Sliders, Sparkles, Shield, Activity, HelpCircle } from 'lucide-react';
import { AgentConfig } from '../types/agent';

interface HeaderProps {
  agents: AgentConfig[];
  hasGeminiKey: boolean;
  onOpenRegistry: () => void;
  onOpenProtocol: () => void;
  onOpenSwarmHealth: () => void;
  isExecuting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  agents,
  hasGeminiKey,
  onOpenRegistry,
  onOpenProtocol,
  onOpenSwarmHealth,
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
        <div className="flex items-center gap-2.5">
          {/* Engine Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 shadow-sm shadow-amber-400'}`} />
            <span className="text-zinc-300 font-medium">
              {hasGeminiKey ? 'Gemini 3.8 Flash' : 'Simulated Engine'}
            </span>
          </div>

          {/* Swarm Health Telemetry Button */}
          <button
            onClick={onOpenSwarmHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-300 text-xs font-medium transition cursor-pointer"
            title="Inspect Swarm Success Rates, Latencies & Error Diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Swarm Health</span>
          </button>

          {/* Protocol Inspector Button */}
          <button
            onClick={onOpenProtocol}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
            title="Inspect Captain System Prompt & Protocol Rules"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Protocol Spec</span>
          </button>

          {/* Agent Registry Button */}
          <button
            onClick={onOpenRegistry}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 border border-zinc-700/80 text-white text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent Registry</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/40">
              {activeCount} Active
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
