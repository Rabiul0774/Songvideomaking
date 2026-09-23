import React, { useState } from 'react';
import { Sparkles, Play, ArrowRight, RotateCcw, Sliders, CheckSquare, Zap, HelpCircle, BookmarkPlus, FolderArchive } from 'lucide-react';
import { WORKFLOW_PRESETS } from '../data/defaultAgents';
import { WorkflowPreset } from '../types/agent';

interface GoalInputPanelProps {
  userPrompt: string;
  onChangePrompt: (val: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isExecuting: boolean;
  mode: 'auto' | 'interactive';
  onChangeMode: (mode: 'auto' | 'interactive') => void;
  onSaveMission?: () => void;
  onOpenPastMissions?: () => void;
  canSave?: boolean;
}

export const GoalInputPanel: React.FC<GoalInputPanelProps> = ({
  userPrompt,
  onChangePrompt,
  onSubmit,
  onReset,
  isExecuting,
  mode,
  onChangeMode,
  onSaveMission,
  onOpenPastMissions,
  canSave = false,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handleSelectPreset = (preset: WorkflowPreset) => {
    setSelectedPresetId(preset.id);
    onChangePrompt(preset.prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isExecuting && userPrompt.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-xl backdrop-blur-md">
      {/* Top Bar: Title & Workflow Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Mission Objective / User Request
        </label>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => onChangeMode('auto')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              mode === 'auto'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Automatically run Step 1, Step 2, and Step 3 end-to-end"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto Pilot</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('interactive')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              mode === 'interactive'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Pause after Captain outputs delegation JSON to review and approve before dispatching sub-agents"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Review & Approve</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={userPrompt}
          onChange={(e) => {
            onChangePrompt(e.target.value);
            if (selectedPresetId) setSelectedPresetId(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          rows={3}
          placeholder="Describe your complex goal or initiative... The Captain Agent will decompose the goal, dispatch specialized sub-agents, and synthesize the final deliverable."
          className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none disabled:opacity-50"
        />

        {/* Footer shortcuts & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">⌘/Ctrl + Enter</kbd> to dispatch</span>
          </div>

          <div className="flex items-center gap-2">
            {canSave && onSaveMission && (
              <button
                type="button"
                onClick={onSaveMission}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Save this mission to browser archives"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save Mission</span>
              </button>
            )}

            {onOpenPastMissions && (
              <button
                type="button"
                onClick={onOpenPastMissions}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                title="View past saved missions"
              >
                <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Archives</span>
              </button>
            )}

            {userPrompt && (
              <button
                type="button"
                onClick={onReset}
                disabled={isExecuting}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSubmit}
              disabled={isExecuting || !userPrompt.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Dispatch Mission</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Starters */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Quick Starters & Presets:
          </span>
          <span className="text-[10px] text-zinc-500">Click to load pre-configured goal</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {WORKFLOW_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isExecuting}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40'
                    : 'bg-zinc-950/40 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wide">
                      {preset.category}
                    </span>
                    {preset.expectedAgents.length > 0 ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {preset.expectedAgents.length} Agents
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono border border-rose-500/20">
                        Out of Scope
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-200 mt-1 line-clamp-1">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
