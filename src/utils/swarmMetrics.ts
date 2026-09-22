export interface AgentExecutionRecord {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string; // ISO string
  status: 'completed' | 'failed';
  durationMs: number;
  taskPrompt: string;
  outputPreview?: string;
  errorMessage?: string;
}

const STORAGE_KEY = 'captain_swarm_execution_history';

// Pre-seeded telemetry records so users immediately see charts upon opening
export const INITIAL_SWARM_METRICS: AgentExecutionRecord[] = [
  {
    id: 'rec-001',
    agentId: 'Song_Generator_Agent',
    agentName: 'Bengali Song Lyricist',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'completed',
    durationMs: 1450,
    taskPrompt: 'Compose contemporary rainy Kolkata lyrics with [Verse] and [Chorus].',
  },
  {
    id: 'rec-002',
    agentId: 'Google_Music_Agent',
    agentName: 'Google Music Agent (Lyria)',
    timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    status: 'completed',
    durationMs: 1820,
    taskPrompt: 'Build Lyria audio prompt with 180s duration and vocal arrangement.',
  },
  {
    id: 'rec-003',
    agentId: 'Art_Director_Agent',
    agentName: 'Visual Art Director',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'completed',
    durationMs: 1100,
    taskPrompt: 'Establish master visual style bible with 35mm film grain.',
  },
  {
    id: 'rec-004',
    agentId: 'Storyboard_Timing_Agent',
    agentName: 'Storyboard Timing Director',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    status: 'completed',
    durationMs: 1350,
    taskPrompt: 'Slice lyrics into consecutive 5-second scenes.',
  },
  {
    id: 'rec-005',
    agentId: 'Subtitle_Formatter_Agent',
    agentName: 'Subtitle Formatter',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'completed',
    durationMs: 980,
    taskPrompt: 'Format Bengali Unicode lyrics with strict newline splits.',
  },
  {
    id: 'rec-006',
    agentId: 'Video_Scene_Agent',
    agentName: 'Video Scene Director',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    status: 'completed',
    durationMs: 1720,
    taskPrompt: 'Synthesize scene prompts incorporating Art Director visual suffix.',
  },
  {
    id: 'rec-007',
    agentId: 'Google_Video_Agent',
    agentName: 'Google Video Agent (Veo)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'completed',
    durationMs: 2100,
    taskPrompt: 'Format veo-2.0-generate-001 payload with 16:9 aspect ratio.',
  },
  {
    id: 'rec-008',
    agentId: 'Video_QC_Agent',
    agentName: 'Video QC Director',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: 'completed',
    durationMs: 1650,
    taskPrompt: 'Inspect MP4 video against visual prompt adherence and artifacts.',
  },
  {
    id: 'rec-009',
    agentId: 'Video_QC_Agent',
    agentName: 'Video QC Director',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    status: 'failed',
    durationMs: 2400,
    taskPrompt: 'Inspect night scene for temporal flickering.',
    errorMessage: 'Frame distortion detected: subject facial warping exceeded threshold (Score 5/10). Re-roll requested.',
  },
  {
    id: 'rec-010',
    agentId: 'Google_Video_Agent',
    agentName: 'Google Video Agent (Veo)',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    status: 'failed',
    durationMs: 3100,
    taskPrompt: 'Compile scene 8 high-res payload.',
    errorMessage: 'Quota rate limit exceeded on upstream video generation endpoint: 429 ResourceExhausted.',
  },
  {
    id: 'rec-011',
    agentId: 'Master_Music_Video_Director_Agent',
    agentName: 'Master Video Director',
    timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    status: 'completed',
    durationMs: 2850,
    taskPrompt: 'Generate full-length 25-cut blueprint with 8-second Veo blocks.',
  },
  {
    id: 'rec-012',
    agentId: 'Google_Music_Agent',
    agentName: 'Google Music Agent (Lyria)',
    timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    status: 'completed',
    durationMs: 1540,
    taskPrompt: 'Compile 180s Indie-Pop Lyria generation payload.',
  },
];

export function getExecutionHistory(): AgentExecutionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SWARM_METRICS));
      return INITIAL_SWARM_METRICS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SWARM_METRICS;
  } catch {
    return INITIAL_SWARM_METRICS;
  }
}

export function saveExecutionRecord(record: Omit<AgentExecutionRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): AgentExecutionRecord[] {
  const fullRecord: AgentExecutionRecord = {
    id: record.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: record.timestamp || new Date().toISOString(),
    agentId: record.agentId,
    agentName: record.agentName,
    status: record.status,
    durationMs: record.durationMs,
    taskPrompt: record.taskPrompt,
    outputPreview: record.outputPreview,
    errorMessage: record.errorMessage,
  };

  try {
    const history = getExecutionHistory();
    const updated = [fullRecord, ...history].slice(0, 150); // Keep last 150
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save execution record:', e);
    return [];
  }
}

export function clearExecutionHistory(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
