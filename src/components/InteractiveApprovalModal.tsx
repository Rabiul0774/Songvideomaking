import React, { useState } from 'react';
import { CheckCircle2, X, Terminal, ArrowRight, Edit3, Trash2, Plus, Sparkles, ShieldAlert } from 'lucide-react';
import { DelegationCommand, AgentConfig } from '../types/agent';
import { getAgentColorClasses } from '../utils/orchestratorHelper';

interface InteractiveApprovalModalProps {
  isOpen: boolean;
  delegations: DelegationCommand[];
  agents: AgentConfig[];
  onApprove: (approvedDelegations: DelegationCommand[]) => void;
  onCancel: () => void;
  rawCaptainText: string;
}

export const InteractiveApprovalModal: React.FC<InteractiveApprovalModalProps> = ({
  isOpen,
  delegations,
  agents,
  onApprove,
  onCancel,
  rawCaptainText,
}) => {
  const [editedDelegations, setEditedDelegations] = useState<DelegationCommand[]>(delegations);
  const [activeTab, setActiveTab] = useState<'cards' | 'json'>('cards');

  if (!isOpen) return null;

  const agentMap = new Map(agents.map(a => [a.id, a]));

  const handleUpdatePrompt = (index: number, newPrompt: string) => {
    const updated = [...editedDelegations];
    updated[index].task_prompt = newPrompt;
    setEditedDelegations(updated);
  };

  const handleRemove = (index: number) => {
    const updated = editedDelegations.filter((_, i) => i !== index);
    setEditedDelegations(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                External Bus Intercept: Review Delegation Commands
              </h3>
              <p className="text-xs text-zinc-400">
                Captain Agent emitted delegation instructions. Review, edit, or approve before dispatching to sub-agents.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 pb-2 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Task Cards ({editedDelegations.length})
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg font-mono transition cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Raw Protocol JSON
            </button>
          </div>
          <span className="text-[11px] font-mono text-amber-400/90">
            Workflow Step 2: External Dispatch
          </span>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'cards' ? (
            <div className="space-y-4">
              {editedDelegations.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  All delegations removed. Please re-run or cancel.
                </div>
              ) : (
                editedDelegations.map((d, index) => {
                  const agent = agentMap.get(d.target_agent);
                  const colors = getAgentColorClasses(agent?.color || 'indigo');

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors.badge}`}>
                            {d.target_agent}
                          </span>
                          {agent && (
                            <span className="text-xs text-zinc-400">
                              ({agent.name})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(index)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
                          title="Remove delegation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-400 mb-2">
                        {agent ? agent.roleDescription : 'Specialized agent'}
                      </p>

                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        Delegated <code className="text-amber-400">task_prompt</code>:
                      </label>
                      <textarea
                        value={d.task_prompt}
                        onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                      />
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-mono">
                  Intercepted Captain Agent Output:
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {rawCaptainText || JSON.stringify(editedDelegations, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel Mission
          </button>
          <button
            onClick={() => onApprove(editedDelegations)}
            disabled={editedDelegations.length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Dispatch Swarm ({editedDelegations.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
