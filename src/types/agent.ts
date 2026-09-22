export interface AgentConfig {
  id: string; // e.g. "Data_Analyst_Agent"
  name: string; // e.g. "Data Analyst"
  roleDescription: string; // e.g. "Specializes in reading CSVs, creating charts, and finding statistical trends."
  systemPrompt: string;
  iconName: string;
  color: string; // Tailwind color theme identifier, e.g. "emerald", "blue", "violet"
  enabled: boolean;
  capabilities: string[];
  isCustom?: boolean;
}

export interface DelegationCommand {
  action: 'delegate';
  target_agent: string;
  task_prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface OrchestrationLog {
  id: string;
  timestamp: string;
  phase: 'captain_plan' | 'delegation' | 'subagent_exec' | 'captain_synthesis' | 'direct_response' | 'system';
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  payload?: any;
}

export interface OrchestrationSession {
  id: string;
  title: string;
  createdAt: string;
  userPrompt: string;
  mode: 'auto' | 'interactive';
  phase: 'idle' | 'analyzing' | 'awaiting_approval' | 'executing_subagents' | 'synthesizing' | 'completed' | 'direct_answered' | 'error';
  captainPlanText?: string;
  delegations: DelegationCommand[];
  directResponse?: string;
  synthesizedDeliverable?: string;
  logs: OrchestrationLog[];
  totalDurationMs?: number;
}

export interface WorkflowPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  expectedAgents: string[];
}
