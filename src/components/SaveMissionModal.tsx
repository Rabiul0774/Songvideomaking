import React, { useState, useEffect } from 'react';
import { X, BookmarkPlus, Sparkles, CheckCircle2, Bot, Layers, Tag, ArrowRight, Plus } from 'lucide-react';
import { DelegationCommand, OrchestrationLog, AgentConfig } from '../types/agent';
import { generateMissionTitle } from '../utils/missionStorage';

interface SaveMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPrompt: string;
  mode: 'auto' | 'interactive';
  phase: string;
  delegations: DelegationCommand[];
  captainPlanText?: string;
  directResponse?: string;
  synthesizedDeliverable?: string;
  logs: OrchestrationLog[];
  agents: AgentConfig[];
  onConfirmSave: (title: string, tags: string[]) => void;
}

const COMMON_TAG_SUGGESTIONS = [
  'Music Video',
  'Veo',
  'Bengali',
  'Architecture',
  'SaaS',
  'Finance',
  'Security',
  'Marketing',
  'Automation',
  'API Support'
];

export const SaveMissionModal: React.FC<SaveMissionModalProps> = ({
  isOpen,
  onClose,
  userPrompt,
  mode,
  phase,
  delegations,
  captainPlanText,
  directResponse,
  synthesizedDeliverable,
  logs,
  agents,
  onConfirmSave,
}) => {
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const suggested = generateMissionTitle(userPrompt, delegations, synthesizedDeliverable);
      setTitle(suggested);

      // Auto-extract default tags
      const autoTags: string[] = [];
      const p = (userPrompt || '').toLowerCase();
      if (p.includes('music') || p.includes('song') || p.includes('bengali')) {
        autoTags.push('Music Video');
        if (p.includes('bengali')) autoTags.push('Bengali');
      }
      if (p.includes('video') || p.includes('veo') || p.includes('storyboard')) autoTags.push('Veo');
      if (p.includes('code') || p.includes('architecture')) autoTags.push('Architecture');
      if (p.includes('data') || p.includes('metric') || p.includes('analytics')) autoTags.push('Analytics');
      if (p.includes('copy') || p.includes('marketing')) autoTags.push('Marketing');
      if (p.includes('security') || p.includes('audit')) autoTags.push('Security');
      if (p.includes('finance') || p.includes('saas')) autoTags.push('SaaS');
      if (autoTags.length === 0) autoTags.push('Orchestration');

      setTags(Array.from(new Set(autoTags)));
      setTagInput('');
    }
  }, [isOpen, userPrompt, delegations, synthesizedDeliverable]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : tagInput;
    const trimmed = raw.trim().replace(/^#+/, '').replace(/^,|,$/g, '').trim();
    if (!trimmed) return;

    const exists = tags.some(t => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirmSave(title.trim(), tags);
  };

  const agentMap = new Map(agents.map(a => [a.id, a]));
  const completedDelegates = delegations.filter(d => d.status === 'completed').length;

  // Unselected suggestions to show as quick-add chips
  const availableSuggestions = COMMON_TAG_SUGGESTIONS.filter(
    s => !tags.some(t => t.toLowerCase() === s.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Save Mission to Archives
              </h3>
              <p className="text-xs text-zinc-400">
                Serialize prompt, orchestration plan, sub-agent results, and deliverable to local storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mission Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Mission Title</span>
              <span className="text-[11px] text-zinc-500 lowercase">Editable</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master AI Music Video: Bengali Rain Monsoon"
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              autoFocus
              required
            />
          </div>

          {/* Prompt Summary Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Prompt Snapshot
            </span>
            <p className="text-xs text-zinc-300 italic line-clamp-2">
              "{userPrompt || 'No prompt specified.'}"
            </p>

            {/* Session Stats Badges */}
            <div className="pt-2 border-t border-zinc-850 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">
                Mode: <strong className="text-white capitalize">{mode}</strong>
              </span>

              <span className={`px-2 py-0.5 rounded-md border font-mono ${
                phase === 'completed'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : phase === 'direct_answered'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}>
                Phase: <strong className="capitalize">{phase.replace('_', ' ')}</strong>
              </span>

              {delegations.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                  {completedDelegates}/{delegations.length} Agents Executed
                </span>
              )}

              {synthesizedDeliverable && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                  Deliverable Ready
                </span>
              )}

              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                {logs.length} Logs Logged
              </span>
            </div>
          </div>

          {/* Sub-Agents Snapshot */}
          {delegations.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                Delegated Specialists ({delegations.length})
              </label>
              <div className="flex flex-wrap gap-1.5">
                {delegations.map((d, idx) => {
                  const agent = agentMap.get(d.target_agent);
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800/90 text-zinc-200 text-xs border border-zinc-700/70 flex items-center gap-1.5"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        d.status === 'completed' ? 'bg-emerald-400' : d.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                      {agent ? agent.name : d.target_agent}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Tags Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Custom Tags & Categories
              </span>
              <span className="text-[11px] text-zinc-500 lowercase">
                {tags.length} tag{tags.length !== 1 ? 's' : ''} added
              </span>
            </label>

            {/* Custom Tag Input with explicit Add button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDownTag}
                  placeholder="Enter a custom tag (e.g. Bengali, Veo, Release-v1)..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                disabled={!tagInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Tags Pills Container */}
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 min-h-[44px] flex flex-wrap items-center gap-1.5">
              {tags.length === 0 ? (
                <span className="text-xs text-zinc-500 italic">
                  No tags added yet. Type a custom tag above and press Enter or click 'Add Tag'.
                </span>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="group px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5 hover:border-indigo-400/50 transition"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-red-400 transition cursor-pointer p-0.5 rounded"
                      title={`Remove tag "${tag}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Suggestions Chips */}
            {availableSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-500 font-mono">Suggested:</span>
                {availableSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    className="px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono border border-zinc-700/60 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5 text-zinc-500" />
                    <span>+{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save Mission to Archives</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

