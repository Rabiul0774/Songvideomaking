import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Check, RotateCcw, Sliders, Bot, Play, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { AgentConfig } from '../types/agent';
import { DEFAULT_AGENTS } from '../data/defaultAgents';
import { getAgentColorClasses } from '../utils/orchestratorHelper';

interface AgentRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  onUpdateAgents: (agents: AgentConfig[]) => void;
  onTestAgent: (agent: AgentConfig, testPrompt: string) => Promise<string>;
}

export const AgentRegistryModal: React.FC<AgentRegistryModalProps> = ({
  isOpen,
  onClose,
  agents,
  onUpdateAgents,
  onTestAgent,
}) => {
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testAgent, setTestAgent] = useState<AgentConfig | null>(null);
  const [testPrompt, setTestPrompt] = useState('Analyze this dataset and provide a breakdown.');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // New agent form state
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newColor, setNewColor] = useState('indigo');

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = agents.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    onUpdateAgents(updated);
  };

  const handleDelete = (id: string) => {
    const updated = agents.filter(a => a.id !== id);
    onUpdateAgents(updated);
  };

  const handleReset = () => {
    if (confirm('Reset agent registry back to default roster?')) {
      onUpdateAgents(DEFAULT_AGENTS);
    }
  };

  const handleSaveEdit = () => {
    if (!editingAgent) return;
    const updated = agents.map(a => a.id === editingAgent.id ? editingAgent : a);
    onUpdateAgents(updated);
    setEditingAgent(null);
  };

  const handleCreateNew = () => {
    if (!newId.trim() || !newName.trim() || !newDesc.trim()) return;

    // Normalize ID: ensure no spaces
    const cleanId = newId.trim().replace(/\s+/g, '_');
    const newAgent: AgentConfig = {
      id: cleanId,
      name: newName.trim(),
      roleDescription: newDesc.trim(),
      systemPrompt: newPrompt.trim() || `You are ${cleanId}. Execute assignments with domain expertise.`,
      iconName: 'Bot',
      color: newColor,
      enabled: true,
      capabilities: ['Custom Specialist'],
      isCustom: true,
    };

    onUpdateAgents([...agents, newAgent]);
    setIsAddingNew(false);
    setNewId('');
    setNewName('');
    setNewDesc('');
    setNewPrompt('');
  };

  const handleRunSandboxTest = async () => {
    if (!testAgent || !testPrompt.trim()) return;
    setIsTesting(true);
    setTestOutput(null);
    try {
      const output = await onTestAgent(testAgent, testPrompt);
      setTestOutput(output);
    } catch (e: any) {
      setTestOutput(`Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Agent Registry Manager
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {agents.filter(a => a.enabled).length} of {agents.length} Enabled
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Configure the modular sub-agents registered to the Captain Agent swarm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
              title="Reset all agents to default configuration"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list or form */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isAddingNew ? (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-indigo-500/50 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Register New Sub-Agent
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Agent ID (Protocol Identifier) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Legal_Advisor_Agent"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    No spaces; use underscores. Must match target_agent exactly.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Legal Advisor"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Role Description (Fed to Captain Agent Registry Prompt) *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Specializes in reviewing contracts, identifying legal compliance risks, and privacy policies."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Sub-Agent System Prompt
                </label>
                <textarea
                  rows={3}
                  placeholder="Instructions guiding this agent's tone, formatting, and expertise when invoked."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNew}
                  disabled={!newId.trim() || !newName.trim() || !newDesc.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  Register Agent
                </button>
              </div>
            </div>
          ) : editingAgent ? (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/50 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Agent: {editingAgent.name} ({editingAgent.id})
              </h4>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editingAgent.name}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Role Description (Captain Registry Directive)
                </label>
                <textarea
                  rows={2}
                  value={editingAgent.roleDescription}
                  onChange={(e) => setEditingAgent({ ...editingAgent, roleDescription: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Sub-Agent System Instruction
                </label>
                <textarea
                  rows={4}
                  value={editingAgent.systemPrompt}
                  onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Enable or disable agents to control which specialists Captain Agent can delegate to.
                </p>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Agent</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {agents.map((agent) => {
                  const colors = getAgentColorClasses(agent.color);

                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-xl border transition-all ${
                        agent.enabled
                          ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-950/30 border-zinc-800/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border mt-0.5 ${colors.badge}`}>
                            <Bot className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">
                                {agent.name}
                              </h4>
                              <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                                {agent.id}
                              </code>
                              {agent.isCustom && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              {agent.roleDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                              {agent.capabilities.map((cap, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                                >
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Sandbox Test Button */}
                          <button
                            onClick={() => {
                              setTestAgent(agent);
                              setTestPrompt(`Execute a test task for ${agent.name} domain.`);
                              setTestOutput(null);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Test this sub-agent in sandbox"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingAgent(agent)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Edit agent details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete custom agent */}
                          {agent.isCustom && (
                            <button
                              onClick={() => handleDelete(agent.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
                              title="Delete agent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Toggle switch */}
                          <button
                            onClick={() => handleToggle(agent.id)}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                              agent.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                            }`}
                            title={agent.enabled ? 'Click to disable' : 'Click to enable'}
                          >
                            <span
                              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                agent.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sandbox Test Drawer */}
          {testAgent && (
            <div className="mt-6 p-5 rounded-2xl bg-zinc-950 border border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Agent Sandbox Test: {testAgent.name} ({testAgent.id})
                  </h4>
                </div>
                <button
                  onClick={() => setTestAgent(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Close Sandbox
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a test prompt for this sub-agent..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleRunSandboxTest}
                  disabled={isTesting || !testPrompt.trim()}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? 'Running...' : 'Run Test'}
                </button>
              </div>

              {testOutput && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {testOutput}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">
            Changes to the registry are immediately reflected in Captain Agent prompts.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
