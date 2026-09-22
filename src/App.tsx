import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExecutionPipeline } from './components/ExecutionPipeline';
import { GoalInputPanel } from './components/GoalInputPanel';
import { SubAgentGrid } from './components/SubAgentGrid';
import { SynthesizedOutput } from './components/SynthesizedOutput';
import { InteractiveApprovalModal } from './components/InteractiveApprovalModal';
import { AgentRegistryModal } from './components/AgentRegistryModal';
import { ProtocolInspectorModal } from './components/ProtocolInspectorModal';
import { SwarmHealthModal } from './components/SwarmHealthModal';
import { DEFAULT_AGENTS } from './data/defaultAgents';
import { AgentConfig, DelegationCommand, OrchestrationLog, OrchestrationSession } from './types/agent';
import { buildCaptainSystemPrompt, parseDelegationCommands } from './utils/orchestratorHelper';
import { getExecutionHistory, saveExecutionRecord, AgentExecutionRecord } from './utils/swarmMetrics';
import { Bot, Sparkles, Terminal, Activity, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    const saved = localStorage.getItem('captain_agents_registry');
    if (saved) {
      try {
        const parsed: AgentConfig[] = JSON.parse(saved);
        // Ensure any newly added default agents (e.g. Song_Generator_Agent) are included
        const existingIds = new Set(parsed.map(a => a.id));
        const missingDefaults = DEFAULT_AGENTS.filter(a => !existingIds.has(a.id));
        if (missingDefaults.length > 0) {
          return [...parsed, ...missingDefaults];
        }
        return parsed;
      } catch (e) {
        console.warn('Failed to load saved agents:', e);
      }
    }
    return DEFAULT_AGENTS;
  });

  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [mode, setMode] = useState<'auto' | 'interactive'>('auto');
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'awaiting_approval' | 'executing_subagents' | 'synthesizing' | 'completed' | 'direct_answered' | 'error'>('idle');
  const [delegations, setDelegations] = useState<DelegationCommand[]>([]);
  const [captainPlanText, setCaptainPlanText] = useState<string>('');
  const [directResponse, setDirectResponse] = useState<string>('');
  const [synthesizedDeliverable, setSynthesizedDeliverable] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [logs, setLogs] = useState<OrchestrationLog[]>([]);

  // Modals
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isSwarmHealthOpen, setIsSwarmHealthOpen] = useState(false);
  const [swarmRecords, setSwarmRecords] = useState<AgentExecutionRecord[]>(() => getExecutionHistory());

  const refreshSwarmRecords = () => {
    setSwarmRecords(getExecutionHistory());
  };

  // Sync agents to localStorage
  useEffect(() => {
    localStorage.setItem('captain_agents_registry', JSON.stringify(agents));
  }, [agents]);

  // Check backend status
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setHasGeminiKey(Boolean(data.hasGeminiKey));
        addLog('system', 'info', `Connected to backend orchestrator. Engine: ${data.model} (${data.hasGeminiKey ? 'Gemini API Key Active' : 'Simulation Mode Active'}).`);
      })
      .catch(err => {
        console.warn('Backend status check failed:', err);
        addLog('system', 'warn', 'Backend connection check failed, using local simulation mode.');
      });
  }, []);

  const addLog = (
    phase: OrchestrationLog['phase'],
    level: OrchestrationLog['level'],
    message: string,
    payload?: any
  ) => {
    const newLog: OrchestrationLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      phase,
      level,
      message,
      payload,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const handleResetSession = () => {
    setPhase('idle');
    setDelegations([]);
    setCaptainPlanText('');
    setDirectResponse('');
    setSynthesizedDeliverable('');
    setSelectedAgentId(null);
    addLog('system', 'info', 'Mission workspace reset.');
  };

  // Step 1: Start Mission -> Captain Agent analyzes & plans
  const handleStartMission = async () => {
    if (!userPrompt.trim()) return;

    setPhase('analyzing');
    setDelegations([]);
    setCaptainPlanText('');
    setDirectResponse('');
    setSynthesizedDeliverable('');
    setSelectedAgentId(null);

    const activeAgents = agents.filter(a => a.enabled);
    const systemPrompt = buildCaptainSystemPrompt(agents);

    addLog('captain_plan', 'info', `Mission initiated: "${userPrompt.slice(0, 80)}..."`, {
      activeSpecialists: activeAgents.map(a => a.id),
      mode,
    });

    try {
      const response = await fetch('/api/captain-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt,
          systemPrompt,
          agents: activeAgents,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText: string = data.rawText || '';
      setCaptainPlanText(rawText);

      // Parse Captain output according to protocol rules
      const parsed = parseDelegationCommands(rawText, activeAgents);

      if (!parsed.isDelegation) {
        // Direct answer (out of scope or answered directly)
        setPhase('direct_answered');
        setDirectResponse(parsed.directResponse || rawText);
        addLog('direct_response', 'success', 'Captain addressed request directly (out of registry scope or informational).', rawText);
        return;
      }

      // Valid delegations detected!
      setDelegations(parsed.delegations);
      addLog('delegation', 'success', `Captain Agent emitted ${parsed.delegations.length} delegation command(s).`, parsed.delegations);

      if (mode === 'interactive') {
        // Pause for human-in-the-loop review
        setPhase('awaiting_approval');
        setIsApprovalModalOpen(true);
      } else {
        // Auto pilot: immediately dispatch swarm
        await executeSubAgentsAndSynthesize(parsed.delegations);
      }
    } catch (error: any) {
      console.error('Mission failed:', error);
      setPhase('error');
      addLog('system', 'error', `Orchestration error: ${error.message}`);
    }
  };

  // Step 2 & 3: Run Sub-Agents and Captain Synthesis
  const executeSubAgentsAndSynthesize = async (targetDelegations: DelegationCommand[]) => {
    setPhase('executing_subagents');
    addLog('subagent_exec', 'info', `Dispatching ${targetDelegations.length} sub-agents in parallel...`);

    // Mark all as running
    const runningList: DelegationCommand[] = targetDelegations.map(d => ({
      ...d,
      status: 'running',
    }));
    setDelegations([...runningList]);

    // Dispatch sub-agents concurrently
    const promises = targetDelegations.map(async (delegation, index) => {
      const agent = agents.find(a => a.id === delegation.target_agent);
      try {
        const resp = await fetch('/api/execute-subagent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: delegation.target_agent,
            systemPrompt: agent?.systemPrompt,
            taskPrompt: delegation.task_prompt,
            originalUserPrompt: userPrompt,
          }),
        });

        const result = await resp.json();
        const duration = result.durationMs || 1200;

        // Record execution telemetry
        saveExecutionRecord({
          agentId: delegation.target_agent,
          agentName: agent?.name || delegation.target_agent,
          status: 'completed',
          durationMs: duration,
          taskPrompt: delegation.task_prompt,
          outputPreview: (result.output || '').slice(0, 200),
        });
        refreshSwarmRecords();

        setDelegations(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = {
              ...next[index],
              status: 'completed',
              output: result.output || '',
              durationMs: duration,
            };
          }
          return next;
        });

        addLog('subagent_exec', 'success', `[${delegation.target_agent}] completed task in ${(duration / 1000).toFixed(1)}s.`);
        return {
          agentId: delegation.target_agent,
          output: result.output || '',
        };
      } catch (err: any) {
        // Record failure telemetry
        saveExecutionRecord({
          agentId: delegation.target_agent,
          agentName: agent?.name || delegation.target_agent,
          status: 'failed',
          durationMs: 1500,
          taskPrompt: delegation.task_prompt,
          errorMessage: err.message,
        });
        refreshSwarmRecords();

        setDelegations(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = {
              ...next[index],
              status: 'failed',
              error: err.message,
            };
          }
          return next;
        });
        addLog('subagent_exec', 'error', `[${delegation.target_agent}] failed: ${err.message}`);
        return {
          agentId: delegation.target_agent,
          output: `Error during execution: ${err.message}`,
        };
      }
    });

    const subAgentResults = await Promise.all(promises);

    // Step 3: Captain Agent Synthesis
    setPhase('synthesizing');
    addLog('captain_synthesis', 'info', 'Sub-agents completed. Captain Agent synthesizing master deliverable...');

    try {
      const synthResp = await fetch('/api/captain-synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt,
          subAgentResults,
        }),
      });

      const synthData = await synthResp.json();
      setSynthesizedDeliverable(synthData.synthesizedText);
      setPhase('completed');
      addLog('captain_synthesis', 'success', `Captain Agent successfully synthesized final deliverable in ${((synthData.durationMs || 1000) / 1000).toFixed(1)}s.`);
    } catch (err: any) {
      console.error('Synthesis failed:', err);
      setPhase('error');
      addLog('captain_synthesis', 'error', `Synthesis failed: ${err.message}`);
    }
  };

  // Sandbox sub-agent test runner
  const handleTestSingleAgent = async (agent: AgentConfig, testPrompt: string): Promise<string> => {
    const resp = await fetch('/api/execute-subagent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agent.id,
        systemPrompt: agent.systemPrompt,
        taskPrompt: testPrompt,
        originalUserPrompt: 'Sandbox isolated testing session',
      }),
    });
    const data = await resp.json();
    return data.output || 'No output received.';
  };

  const isExecuting = phase === 'analyzing' || phase === 'executing_subagents' || phase === 'synthesizing';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        agents={agents}
        hasGeminiKey={hasGeminiKey}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenProtocol={() => setIsProtocolOpen(true)}
        onOpenSwarmHealth={() => setIsSwarmHealthOpen(true)}
        isExecuting={isExecuting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Visual Workflow Pipeline DAG */}
        <ExecutionPipeline
          phase={phase}
          delegations={delegations}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(id) => setSelectedAgentId(id === selectedAgentId ? null : id)}
        />

        {/* Goal Input & Starter Presets */}
        <GoalInputPanel
          userPrompt={userPrompt}
          onChangePrompt={setUserPrompt}
          onSubmit={handleStartMission}
          onReset={handleResetSession}
          isExecuting={isExecuting}
          mode={mode}
          onChangeMode={setMode}
        />

        {/* Results Area */}
        <div className="space-y-6">
          {/* Synthesized Master Output (if completed or direct response) */}
          {(synthesizedDeliverable || directResponse) && (
            <SynthesizedOutput
              synthesizedText={synthesizedDeliverable}
              directResponse={directResponse}
              delegations={delegations}
              agents={agents}
              userPrompt={userPrompt}
            />
          )}

          {/* Sub-Agent Detailed Deliverables Grid */}
          {delegations.length > 0 && (
            <SubAgentGrid
              delegations={delegations}
              agents={agents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={(id) => setSelectedAgentId(id === selectedAgentId ? null : id)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-4 px-4 lg:px-8 text-center text-xs text-zinc-500 font-mono">
        Captain Agent Orchestrator · Modular Swarm Manager · Step 1: Analyze & Plan → Step 2: Delegate → Step 3: Synthesize
      </footer>

      {/* Interactive Review / Approval Modal */}
      <InteractiveApprovalModal
        isOpen={isApprovalModalOpen}
        delegations={delegations}
        agents={agents}
        rawCaptainText={captainPlanText}
        onApprove={(approved) => {
          setIsApprovalModalOpen(false);
          setDelegations(approved);
          executeSubAgentsAndSynthesize(approved);
        }}
        onCancel={() => {
          setIsApprovalModalOpen(false);
          setPhase('idle');
          addLog('delegation', 'warn', 'Interactive delegation cancelled by user.');
        }}
      />

      {/* Agent Registry Modal */}
      <AgentRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        agents={agents}
        onUpdateAgents={setAgents}
        onTestAgent={handleTestSingleAgent}
      />

      {/* Protocol Inspector Modal */}
      <ProtocolInspectorModal
        isOpen={isProtocolOpen}
        onClose={() => setIsProtocolOpen(false)}
        agents={agents}
        logs={logs}
      />

      {/* Swarm Health & Telemetry Modal */}
      <SwarmHealthModal
        isOpen={isSwarmHealthOpen}
        onClose={() => setIsSwarmHealthOpen(false)}
        agents={agents}
        records={swarmRecords}
        onRefreshRecords={refreshSwarmRecords}
      />
    </div>
  );
}
