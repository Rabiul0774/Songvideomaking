import React, { useState } from 'react';
import { X, Terminal, Shield, BookOpen, Copy, Check, FileCode, Activity } from 'lucide-react';
import { AgentConfig, OrchestrationLog } from '../types/agent';
import { buildCaptainSystemPrompt } from '../utils/orchestratorHelper';

interface ProtocolInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  logs: OrchestrationLog[];
}

export const ProtocolInspectorModal: React.FC<ProtocolInspectorModalProps> = ({
  isOpen,
  onClose,
  agents,
  logs,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'schema' | 'logs'>('prompt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSystemPrompt = buildCaptainSystemPrompt(agents);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentSystemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Captain Agent Protocol Specification
              </h3>
              <p className="text-xs text-zinc-400">
                Live inspection of system directives, JSON schema contract, and message bus telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-3 pb-2 border-b border-zinc-800 flex items-center justify-between text-xs bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'prompt' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Dynamic System Instruction</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schema' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Delegation JSON Contract</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logs' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Event Bus Telemetry ({logs.length})</span>
            </button>
          </div>

          {activeTab === 'prompt' && (
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition cursor-pointer text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'prompt' && (
            <div>
              <p className="text-xs text-zinc-400 mb-2">
                This prompt is dynamically constructed from the active Agent Registry and injected into Gemini when Captain Agent runs:
              </p>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
                {currentSystemPrompt}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                  Delegation Command Format (JSON)
                </h4>
                <pre className="text-xs font-mono text-emerald-400 bg-zinc-900/60 p-3 rounded-lg overflow-x-auto">
{`{
  "action": "delegate",
  "target_agent": "Exact_Name_From_Registry",
  "task_prompt": "Highly detailed instructions on exactly what the sub-agent needs to do"
}`}
                </pre>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When multiple specialized agents are required in parallel, the Captain outputs a JSON array:
                </p>
                <pre className="text-xs font-mono text-emerald-400 bg-zinc-900/60 p-3 rounded-lg overflow-x-auto">
{`[
  {
    "action": "delegate",
    "target_agent": "Data_Analyst_Agent",
    "task_prompt": "..."
  },
  {
    "action": "delegate",
    "target_agent": "Copywriter_Agent",
    "task_prompt": "..."
  }
]`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold text-zinc-200">
                  Rules & Constraints Enforced:
                </h4>
                <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                  <li><strong className="text-zinc-200">Manager, Not Worker:</strong> Captain must never execute domain tasks itself if a registered specialist exists.</li>
                  <li><strong className="text-zinc-200">Out-of-Scope Rule:</strong> If no sub-agent applies, Captain answers directly using general knowledge, noting the specialist isn't registered.</li>
                  <li><strong className="text-zinc-200">No Hallucinated Agents:</strong> Captain is strictly forbidden from creating agent names not listed in CURRENT AGENT REGISTRY.</li>
                  <li><strong className="text-zinc-200">Contextual Precision:</strong> Task prompts must contain complete context for the sub-agent to operate in prompt isolation.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                  No mission logs yet. Dispatch a mission to view real-time protocol telemetry.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs flex items-start gap-3"
                  >
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold whitespace-nowrap ${
                      log.level === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : log.level === 'warn'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : log.level === 'error'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {log.phase}
                    </span>
                    <div className="flex-1 overflow-x-auto text-zinc-300">
                      {log.message}
                      {log.payload && (
                        <pre className="mt-1 p-2 rounded bg-zinc-900 text-[11px] text-zinc-400 overflow-x-auto">
                          {typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
