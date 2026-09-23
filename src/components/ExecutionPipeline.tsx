import React from 'react';
import { Bot, ArrowRight, CheckCircle2, Clock, Loader2, AlertCircle, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { DelegationCommand, AgentConfig } from '../types/agent';
import { getAgentColorClasses } from '../utils/orchestratorHelper';

interface ExecutionPipelineProps {
  phase: 'idle' | 'analyzing' | 'awaiting_approval' | 'executing_subagents' | 'synthesizing' | 'completed' | 'direct_answered' | 'error';
  delegations: DelegationCommand[];
  agents: AgentConfig[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  activeMissionPrompt?: string;
}

export const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({
  phase,
  delegations,
  agents,
  selectedAgentId,
  onSelectAgent,
  activeMissionPrompt,
}) => {
  const isAnalyzing = phase === 'analyzing';
  const isAwaitingApproval = phase === 'awaiting_approval';
  const isExecuting = phase === 'executing_subagents';
  const isSynthesizing = phase === 'synthesizing';
  const isCompleted = phase === 'completed';
  const isDirect = phase === 'direct_answered';

  const agentMap = new Map(agents.map(a => [a.id, a]));

  return (
    <div className="w-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Multi-Agent Orchestration Pipeline
          </h2>
        </div>
        <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
          {phase === 'idle' && <span className="text-zinc-500">Awaiting user goal</span>}
          {isAnalyzing && (
            <span className="text-indigo-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Captain: Analyzing Goal...
            </span>
          )}
          {isAwaitingApproval && (
            <span className="text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Interactive Review: Awaiting Approval
            </span>
          )}
          {isExecuting && (
            <span className="text-sky-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Swarm: Delegated Execution ({delegations.filter(d => d.status === 'completed').length}/{delegations.length})
            </span>
          )}
          {isSynthesizing && (
            <span className="text-purple-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Captain: Synthesizing Deliverables...
            </span>
          )}
          {isCompleted && (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Orchestration Complete
            </span>
          )}
          {isDirect && (
            <span className="text-teal-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Handled Directly (Out of Registry Scope)
            </span>
          )}
        </div>
      </div>

      {/* Dispatched Mission Cue (Shows after prompt text clears) */}
      {activeMissionPrompt && phase !== 'idle' && (
        <div className="mb-4 px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-semibold uppercase tracking-wider shrink-0">
              Active Command
            </span>
            <p className="text-zinc-200 truncate font-medium">
              "{activeMissionPrompt}"
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0 hidden sm:inline">
            In Flight
          </span>
        </div>
      )}

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative items-stretch">
        {/* Node 1: Request Analysis */}
        <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isAnalyzing
            ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
            : phase !== 'idle'
            ? 'bg-zinc-900/90 border-zinc-700/60'
            : 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Step 1</span>
              {isAnalyzing && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
              {phase !== 'idle' && !isAnalyzing && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <h3 className="text-sm font-semibold text-white">Analyze & Plan</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Captain evaluates registry match, decomposes tasks into sub-problems.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
            Target: Sub-Agent identification
          </div>
        </div>

        {/* Node 2: Delegation Protocol */}
        <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isAwaitingApproval
            ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
            : (isExecuting || isSynthesizing || isCompleted)
            ? 'bg-zinc-900/90 border-zinc-700/60'
            : 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Step 2</span>
              {isAwaitingApproval && <span className="text-[10px] text-amber-400 font-medium animate-pulse">Needs Review</span>}
              {(isExecuting || isSynthesizing || isCompleted) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <h3 className="text-sm font-semibold text-white">JSON Delegation</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Strict JSON commands emitted and intercepted by the orchestrator bus.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
            {delegations.length > 0 ? (
              <span className="text-indigo-400 font-medium">{delegations.length} task{delegations.length > 1 ? 's' : ''} delegated</span>
            ) : isDirect ? (
              <span className="text-teal-400 font-medium">Direct answer (0 sub-agents)</span>
            ) : (
              'Command emission'
            )}
          </div>
        </div>

        {/* Node 3: Swarm Execution */}
        <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isExecuting
            ? 'bg-sky-950/30 border-sky-500/60 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
            : (isSynthesizing || isCompleted)
            ? 'bg-zinc-900/90 border-zinc-700/60'
            : 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Step 3</span>
              {isExecuting && <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
              {(isSynthesizing || isCompleted) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <h3 className="text-sm font-semibold text-white">Sub-Agent Swarm</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Specialized agents execute domain instructions with prompt isolation.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
            {isExecuting ? 'Parallel execution in progress' : `${delegations.filter(d => d.status === 'completed').length} outputs captured`}
          </div>
        </div>

        {/* Node 4: Synthesis */}
        <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isSynthesizing
            ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
            : isCompleted
            ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
            : 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Step 4</span>
              {isSynthesizing && <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
              {isCompleted && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <h3 className="text-sm font-semibold text-white">Captain Synthesis</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Master synthesis unifies outputs into an executive-ready deliverable.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
            {isCompleted ? <span className="text-emerald-400">Final Deliverable Ready</span> : 'Unified output presentation'}
          </div>
        </div>
      </div>

      {/* Active Sub-Agent Swarm Chips (if delegations exist) */}
      {delegations.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider mr-1">
            Active Sub-Agents:
          </span>
          {delegations.map((d, index) => {
            const agent = agentMap.get(d.target_agent);
            const isSelected = selectedAgentId === d.target_agent;
            const colors = getAgentColorClasses(agent?.color || 'indigo');

            return (
              <button
                key={`${d.target_agent}-${index}`}
                onClick={() => onSelectAgent(d.target_agent)}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
                  isSelected
                    ? `${colors.badge} ring-1 ring-white/20 font-semibold shadow-md`
                    : 'bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300'
                }`}
              >
                {d.status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-sky-400" />}
                {d.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {d.status === 'pending' && <Clock className="w-3 h-3 text-zinc-400" />}
                {d.status === 'failed' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                <span>{agent ? agent.name : d.target_agent}</span>
                {d.durationMs && (
                  <span className="text-[10px] text-zinc-400">({(d.durationMs / 1000).toFixed(1)}s)</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
