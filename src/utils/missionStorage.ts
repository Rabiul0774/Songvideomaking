import { DelegationCommand, OrchestrationLog } from '../types/agent';

export interface SavedMission {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  userPrompt: string;
  mode: 'auto' | 'interactive';
  phase: 'idle' | 'analyzing' | 'awaiting_approval' | 'executing_subagents' | 'synthesizing' | 'completed' | 'direct_answered' | 'error';
  captainPlanText?: string;
  delegations: DelegationCommand[];
  directResponse?: string;
  synthesizedDeliverable?: string;
  logs: OrchestrationLog[];
  agentIds: string[];
  totalDurationMs?: number;
  tags?: string[];
}

const STORAGE_KEY = 'captain_saved_missions';

export const INITIAL_PRESET_MISSIONS: SavedMission[] = [
  {
    id: 'mission_preset_music_video_director',
    title: 'Master AI Music Video: Bengali Rain Monsoon',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    userPrompt: 'Make a romantic Bengali song about the rain, generate a full music video production plan with lyrics, Google Lyria audio prompt, visual style bible, 5-second storyboard scenes for Veo, and on-screen formatted subtitles.',
    mode: 'auto',
    phase: 'completed',
    totalDurationMs: 4250,
    captainPlanText: `\`\`\`json
[
  {
    "action": "delegate",
    "target_agent": "Song_Generator_Agent",
    "task_prompt": "Write high-quality modern Bengali song lyrics in Bengali script with [Verse], [Chorus], and [Bridge] tags about Kolkata monsoon rain, with a detailed English music production style description."
  },
  {
    "action": "delegate",
    "target_agent": "Art_Director_Agent",
    "task_prompt": "Produce a unified Visual Style Bible (visual_theme, color_palette, character_dna, master_style_suffix) for a monsoon Kolkata music video to ensure cinematic consistency across all Veo scenes."
  },
  {
    "action": "delegate",
    "target_agent": "Storyboard_Timing_Agent",
    "task_prompt": "Divide the track into sequential 5-second scene blocks from 00:00 to 00:30, mapping lyrics, scene actions, and master style suffix into final video prompts."
  }
]
\`\`\``,
    delegations: [
      {
        action: 'delegate',
        target_agent: 'Song_Generator_Agent',
        task_prompt: 'Write high-quality modern Bengali song lyrics in Bengali script with [Verse], [Chorus], and [Bridge] tags about Kolkata monsoon rain.',
        status: 'completed',
        durationMs: 1420,
        output: JSON.stringify({
          lyrics: `[Verse 1]\nভিজে যাওয়া ট্রামলাইন, শহরের ক্লান্ত রাত\nকাঁচের জানালায় আঁকা স্মৃতির একমুঠো হাত\nরাতের নিয়ন আলোয় অচেনা চেনা সুর`,
          song_style: "Modern Bengali Indie Pop, melancholic yet groovy tempo, acoustic guitar, 78 BPM."
        }, null, 2)
      },
      {
        action: 'delegate',
        target_agent: 'Art_Director_Agent',
        task_prompt: 'Produce a unified Visual Style Bible for cinematic consistency.',
        status: 'completed',
        durationMs: 1180,
        output: JSON.stringify({
          visual_theme: "Monsoon Melancholy Kolkata Vintage 35mm",
          color_palette: "Teal wet asphalt, warm sodium vapor amber, neon reflections",
          master_style_suffix: "shot on 35mm Arri Alexa 65, anamorphic lens flare, natural mist, rain-slicked surfaces, 4k"
        }, null, 2)
      },
      {
        action: 'delegate',
        target_agent: 'Storyboard_Timing_Agent',
        task_prompt: 'Divide track into 5-second scene blocks with camera movement and visual prompts.',
        status: 'completed',
        durationMs: 1650,
        output: JSON.stringify({
          timeline: [
            {
              scene_index: 1,
              timestamp: "00:00 - 00:05",
              lyric_segment: "ভিজে যাওয়া ট্রামলাইন, শহরের ক্লান্ত রাত",
              final_video_prompt: "Cinematic wide tracking shot down a rain-drenched tramline in old North Kolkata at midnight, amber reflections on wet asphalt, 4k"
            }
          ]
        }, null, 2)
      }
    ],
    synthesizedDeliverable: `## 🎬 AI Music Video Production Blueprint: "বৃষ্টির শহর" (City of Rain)

### 🎵 Song Overview & Sonic DNA
* **Title:** বৃষ্টির শহর (City of Rain)
* **Genre:** Modern Bengali Indie Pop / Lo-Fi Acoustic
* **Tempo & Key:** 78 BPM, D Minor

### 🎨 Visual Style Bible
* **Aesthetic:** 35mm Arri Alexa 65, Kodak Vision3 500T color science.
* **Palette:** Teal drenched cobblestones, warm sodium vapor amber, neon reflections.`,
    logs: [
      { id: 'log_1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), phase: 'captain_plan', level: 'info', message: 'Mission initiated: Bengali rain music video production plan.' },
      { id: 'log_2', timestamp: new Date(Date.now() - 3600000 * 2 + 1000).toISOString(), phase: 'delegation', level: 'success', message: 'Captain Agent emitted delegation commands.' },
      { id: 'log_3', timestamp: new Date(Date.now() - 3600000 * 2 + 4250).toISOString(), phase: 'captain_synthesis', level: 'success', message: 'Captain Agent synthesized master production blueprint.' }
    ],
    agentIds: ['Song_Generator_Agent', 'Art_Director_Agent', 'Storyboard_Timing_Agent'],
    tags: ['Music Video', 'Veo', 'Bengali', 'Audio']
  },
  {
    id: 'mission_preset_saas_launch_suite',
    title: 'SyncPulse: Enterprise SaaS Launch Strategy',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    userPrompt: 'Create a full launch campaign, financial model, and technical architecture for SyncPulse, a real-time AI developer meeting intelligence platform.',
    mode: 'auto',
    phase: 'completed',
    totalDurationMs: 3950,
    captainPlanText: `\`\`\`json
[
  { "action": "delegate", "target_agent": "Copywriter_Agent", "task_prompt": "Write high-converting launch copy, headlines, and email campaign." },
  { "action": "delegate", "target_agent": "Code_Architect_Agent", "task_prompt": "Design scalable WebSocket audio ingestion architecture and TypeScript interfaces." },
  { "action": "delegate", "target_agent": "Financial_Analyst_Agent", "task_prompt": "Build 12-month unit economics model and SaaS pricing tiers." }
]
\`\`\``,
    delegations: [
      {
        action: 'delegate',
        target_agent: 'Copywriter_Agent',
        task_prompt: 'Write high-converting launch copy, headlines, and email campaign.',
        status: 'completed',
        durationMs: 1250,
        output: '### High-Conversion Messaging & Copy Suite\n**Headline:** Stop losing hours in meetings. Turn conversation into execution instantly.'
      },
      {
        action: 'delegate',
        target_agent: 'Code_Architect_Agent',
        task_prompt: 'Design scalable WebSocket audio ingestion architecture.',
        status: 'completed',
        durationMs: 1400,
        output: '### System Architecture & Technical Specification\nEvent-driven microservices with Redis Pub/Sub for sub-50ms sync latency.'
      },
      {
        action: 'delegate',
        target_agent: 'Financial_Analyst_Agent',
        task_prompt: 'Build 12-month unit economics model and SaaS pricing tiers.',
        status: 'completed',
        durationMs: 1300,
        output: '### Financial Projections & Unit Economics\nEstimated CAC: $145, LTV: $864 (LTV/CAC = 5.96x).'
      }
    ],
    synthesizedDeliverable: `## 🚀 SyncPulse Executive Launch Strategy & Architecture\n\n### 1. Market Positioning\nReal-time developer meeting intelligence.`,
    logs: [
      { id: 'log_saas_1', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), phase: 'captain_plan', level: 'info', message: 'Mission initiated: SyncPulse launch strategy.' },
      { id: 'log_saas_2', timestamp: new Date(Date.now() - 3600000 * 18 + 3950).toISOString(), phase: 'delegation', level: 'success', message: 'Captain Agent dispatched 3 specialist agents.' }
    ],
    agentIds: ['Copywriter_Agent', 'Code_Architect_Agent', 'Financial_Analyst_Agent'],
    tags: ['SaaS', 'Marketing', 'Architecture', 'Finance']
  },
  {
    id: 'mission_preset_rate_limit_support',
    title: 'Gemini 429 Rate Limit Recovery Protocol',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    userPrompt: 'Explain how to mitigate RESOURCE_EXHAUSTED 429 errors when generating concurrent Veo video clips and synthesize actionable configuration changes.',
    mode: 'auto',
    phase: 'direct_answered',
    totalDurationMs: 1850,
    delegations: [],
    directResponse: `### Lead Tech Support Agent Diagnosis & Fix
1. **Root Cause:** Free tier Gemini API concurrency quota saturation.
2. **Immediate Remediation:** Enforce sequential clip generation with exponential backoff (initial delay: 1.5s, max delay: 10s).
3. **Orchestrator Settings:** Set maximum concurrent sub-agent delegations to 2.`,
    logs: [
      { id: 'log_supp_1', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), phase: 'captain_plan', level: 'info', message: 'Direct knowledge evaluation executed.' },
      { id: 'log_supp_2', timestamp: new Date(Date.now() - 3600000 * 8 + 1850).toISOString(), phase: 'captain_synthesis', level: 'success', message: 'Direct response formulated.' }
    ],
    agentIds: [],
    tags: ['Tech Support', 'Gemini API', 'Rate Limits']
  },
  {
    id: 'mission_preset_security_audit',
    title: 'Kubernetes Microservices Security Hardening',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    userPrompt: 'Conduct an end-to-end security audit and zero-trust policy architecture for our multi-tenant Kubernetes cluster.',
    mode: 'auto',
    phase: 'completed',
    totalDurationMs: 5120,
    captainPlanText: `\`\`\`json
[
  { "action": "delegate", "target_agent": "Code_Architect_Agent", "task_prompt": "Audit container networking, mTLS, and Istio service mesh." },
  { "action": "delegate", "target_agent": "Data_Analyst_Agent", "task_prompt": "Analyze audit log event anomalies and Falco intrusion alert trends." }
]
\`\`\``,
    delegations: [
      {
        action: 'delegate',
        target_agent: 'Code_Architect_Agent',
        task_prompt: 'Audit container networking and mTLS.',
        status: 'completed',
        durationMs: 1850,
        output: '### Network Policies & Service Mesh Audit\nEnforced strict mTLS and non-root UID 10001 container runtimes.'
      },
      {
        action: 'delegate',
        target_agent: 'Data_Analyst_Agent',
        task_prompt: 'Analyze audit log anomalies.',
        status: 'completed',
        durationMs: 1950,
        output: '### Anomaly Telemetry\nProcessed 142,000 security logs with 99.98% policy conformance.'
      }
    ],
    synthesizedDeliverable: `## 🛡️ Zero-Trust Security Specification\n\nCluster hardening complete with sealed secrets, egress filtering, and automated vulnerability scanning.`,
    logs: [
      { id: 'log_sec_1', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), phase: 'captain_plan', level: 'info', message: 'Security audit dispatched.' },
      { id: 'log_sec_2', timestamp: new Date(Date.now() - 3600000 * 3 + 5120).toISOString(), phase: 'captain_synthesis', level: 'success', message: 'Synthesis delivered.' }
    ],
    agentIds: ['Code_Architect_Agent', 'Data_Analyst_Agent'],
    tags: ['Security', 'DevOps', 'Kubernetes']
  }
];

export function getSavedMissions(): SavedMission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial presets so the archives aren't empty on first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRESET_MISSIONS));
      return INITIAL_PRESET_MISSIONS;
    }
    const parsed: SavedMission[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_PRESET_MISSIONS;
    }
    // Sort descending by createdAt
    return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Failed to load saved missions from localStorage:', err);
    return INITIAL_PRESET_MISSIONS;
  }
}

export function saveMission(missionData: {
  id?: string;
  title?: string;
  userPrompt: string;
  mode: 'auto' | 'interactive';
  phase: SavedMission['phase'];
  captainPlanText?: string;
  delegations: DelegationCommand[];
  directResponse?: string;
  synthesizedDeliverable?: string;
  logs: OrchestrationLog[];
  tags?: string[];
}): SavedMission {
  const currentMissions = getSavedMissions();
  const id = missionData.id || `mission_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const title = (missionData.title && missionData.title.trim())
    ? missionData.title.trim()
    : generateMissionTitle(missionData.userPrompt, missionData.delegations, missionData.synthesizedDeliverable);

  const agentIds = Array.from(new Set(missionData.delegations.map(d => d.target_agent)));

  // Calculate duration if not provided
  let calculatedDuration = 2200;
  if (missionData.logs && missionData.logs.length >= 2) {
    const timestamps = missionData.logs
      .map(l => new Date(l.timestamp).getTime())
      .filter(t => !isNaN(t))
      .sort((a, b) => a - b);
    if (timestamps.length >= 2) {
      const diff = timestamps[timestamps.length - 1] - timestamps[0];
      if (diff > 200 && diff < 300000) {
        calculatedDuration = diff;
      }
    }
  } else if (missionData.delegations.length > 0) {
    const sum = missionData.delegations.reduce((acc, d) => acc + (d.durationMs || 1200), 0);
    calculatedDuration = sum + 1200;
  }

  const newMission: SavedMission = {
    id,
    title,
    createdAt: now,
    updatedAt: now,
    userPrompt: missionData.userPrompt,
    mode: missionData.mode,
    phase: missionData.phase,
    captainPlanText: missionData.captainPlanText,
    delegations: missionData.delegations,
    directResponse: missionData.directResponse,
    synthesizedDeliverable: missionData.synthesizedDeliverable,
    logs: missionData.logs,
    agentIds,
    totalDurationMs: calculatedDuration,
    tags: missionData.tags || extractDefaultTags(missionData.userPrompt, agentIds),
  };

  // If already exists, update in-place; otherwise prepend
  const existingIdx = currentMissions.findIndex(m => m.id === id);
  let updatedMissions: SavedMission[];
  if (existingIdx >= 0) {
    newMission.createdAt = currentMissions[existingIdx].createdAt;
    updatedMissions = [...currentMissions];
    updatedMissions[existingIdx] = newMission;
  } else {
    updatedMissions = [newMission, ...currentMissions];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMissions));
  return newMission;
}

export function deleteMission(id: string): SavedMission[] {
  const current = getSavedMissions();
  const updated = current.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllMissions(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function generateMissionTitle(
  userPrompt: string,
  delegations: DelegationCommand[] = [],
  synthesizedDeliverable?: string
): string {
  if (!userPrompt || !userPrompt.trim()) {
    return 'Untitled Mission';
  }

  const clean = userPrompt.trim();

  // Try extracting title from markdown headers in synthesized output if present
  if (synthesizedDeliverable) {
    const headerMatch = synthesizedDeliverable.match(/^#+\s*(.+)$/m);
    if (headerMatch && headerMatch[1]) {
      const cleanHeader = headerMatch[1].replace(/[🎬🎵🚀✨🛠️#]/g, '').trim();
      if (cleanHeader.length >= 5 && cleanHeader.length <= 60) {
        return cleanHeader;
      }
    }
  }

  // Fallback to first sentence or slice of user prompt
  const firstSentence = clean.split(/[.\n?!]/)[0].trim();
  if (firstSentence.length > 5 && firstSentence.length <= 50) {
    return firstSentence;
  }

  return clean.slice(0, 48) + (clean.length > 48 ? '...' : '');
}

function extractDefaultTags(prompt: string, agentIds: string[]): string[] {
  const tags: Set<string> = new Set();
  const p = prompt.toLowerCase();

  if (p.includes('music') || p.includes('song') || p.includes('bengali') || agentIds.includes('Song_Generator_Agent')) {
    tags.add('Music');
  }
  if (p.includes('video') || p.includes('veo') || p.includes('storyboard') || agentIds.includes('Storyboard_Timing_Agent')) {
    tags.add('Video');
  }
  if (p.includes('code') || p.includes('architecture') || p.includes('api') || agentIds.includes('Code_Architect_Agent')) {
    tags.add('Engineering');
  }
  if (p.includes('data') || p.includes('metric') || agentIds.includes('Data_Analyst_Agent')) {
    tags.add('Analytics');
  }
  if (p.includes('copy') || p.includes('marketing') || agentIds.includes('Copywriter_Agent')) {
    tags.add('Copy');
  }

  if (tags.size === 0) {
    tags.add('Orchestration');
  }

  return Array.from(tags);
}

export function exportMissionJson(mission: SavedMission): void {
  const jsonStr = JSON.stringify(mission, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (mission.title || 'mission').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
  a.download = `mission-${safeTitle}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllMissionsJson(): void {
  const missions = getSavedMissions();
  const jsonStr = JSON.stringify(missions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `all-captain-missions-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getMissionDurationMs(mission: SavedMission): number {
  if (mission.totalDurationMs && mission.totalDurationMs > 0) {
    return mission.totalDurationMs;
  }
  if (mission.logs && mission.logs.length >= 2) {
    const timestamps = mission.logs
      .map(l => new Date(l.timestamp).getTime())
      .filter(t => !isNaN(t))
      .sort((a, b) => a - b);
    if (timestamps.length >= 2) {
      const diff = timestamps[timestamps.length - 1] - timestamps[0];
      if (diff > 200 && diff < 300000) {
        return diff;
      }
    }
  }
  const delSum = (mission.delegations || []).reduce((acc, d) => acc + (d.durationMs || 1200), 0);
  return delSum > 0 ? delSum + 1200 : 2500;
}

export interface MissionAnalyticsStats {
  totalMissions: number;
  completedMissions: number;
  failedMissions: number;
  directAnswerMissions: number;
  overallSuccessRate: number; // 0 to 100
  avgCompletionTimeSec: number;
  minCompletionTimeSec: number;
  maxCompletionTimeSec: number;
  totalDelegations: number;
  successfulDelegations: number;
  failedDelegations: number;
  subAgentSuccessRate: number; // 0 to 100
  avgSubAgentDurationMs: number;
  missionDurationData: Array<{
    id: string;
    title: string;
    shortTitle: string;
    durationSec: number;
    durationMs: number;
    agentCount: number;
    phase: string;
    isSuccess: boolean;
    date: string;
  }>;
  agentPerformanceData: Array<{
    agentId: string;
    name: string;
    runs: number;
    successRate: number;
    avgDurationSec: number;
  }>;
  statusPieData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function calculateMissionAnalytics(
  missions: SavedMission[],
  agentNameMap: Map<string, string> = new Map()
): MissionAnalyticsStats {
  if (missions.length === 0) {
    return {
      totalMissions: 0,
      completedMissions: 0,
      failedMissions: 0,
      directAnswerMissions: 0,
      overallSuccessRate: 100,
      avgCompletionTimeSec: 0,
      minCompletionTimeSec: 0,
      maxCompletionTimeSec: 0,
      totalDelegations: 0,
      successfulDelegations: 0,
      failedDelegations: 0,
      subAgentSuccessRate: 100,
      avgSubAgentDurationMs: 0,
      missionDurationData: [],
      agentPerformanceData: [],
      statusPieData: []
    };
  }

  let totalDurationMs = 0;
  let minDurationMs = Infinity;
  let maxDurationMs = 0;

  let completedMissions = 0;
  let directAnswerMissions = 0;
  let failedMissions = 0;

  let totalDelegations = 0;
  let successfulDelegations = 0;
  let failedDelegations = 0;
  let totalSubAgentDurationMs = 0;

  const agentStatsMap = new Map<string, { runs: number; successes: number; durationSum: number }>();

  // Sort chronological for timeline visualization
  const sorted = [...missions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const missionDurationData = sorted.map((m, index) => {
    const durMs = getMissionDurationMs(m);
    totalDurationMs += durMs;
    if (durMs < minDurationMs) minDurationMs = durMs;
    if (durMs > maxDurationMs) maxDurationMs = durMs;

    const isDirect = m.phase === 'direct_answered';
    const isError = m.phase === 'error';
    const anyFailedDelegations = m.delegations.some(d => d.status === 'failed');

    const isSuccess = !isError && (!anyFailedDelegations || m.phase === 'completed');

    if (isDirect) {
      directAnswerMissions++;
    } else if (m.phase === 'completed') {
      completedMissions++;
    } else {
      failedMissions++;
    }

    // Process delegations
    m.delegations.forEach(d => {
      totalDelegations++;
      const dDuration = d.durationMs || 1200;
      totalSubAgentDurationMs += dDuration;

      const isSubSuccess = d.status === 'completed';
      if (isSubSuccess) {
        successfulDelegations++;
      } else if (d.status === 'failed') {
        failedDelegations++;
      } else {
        successfulDelegations++; // Count pending/executing as in-flight
      }

      const existing = agentStatsMap.get(d.target_agent) || { runs: 0, successes: 0, durationSum: 0 };
      existing.runs += 1;
      if (isSubSuccess) existing.successes += 1;
      existing.durationSum += dDuration;
      agentStatsMap.set(d.target_agent, existing);
    });

    // Clean short title
    const shortTitle = m.title.length > 22 ? m.title.slice(0, 20) + '…' : m.title;

    return {
      id: m.id,
      title: m.title,
      shortTitle: `#${index + 1} ${shortTitle}`,
      durationSec: Number((durMs / 1000).toFixed(2)),
      durationMs: durMs,
      agentCount: m.delegations.length,
      phase: m.phase,
      isSuccess,
      date: new Date(m.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
    };
  });

  const avgCompletionTimeSec = Number((totalDurationMs / missions.length / 1000).toFixed(2));
  const minCompletionTimeSec = minDurationMs === Infinity ? 0 : Number((minDurationMs / 1000).toFixed(2));
  const maxCompletionTimeSec = Number((maxDurationMs / 1000).toFixed(2));

  const totalSuccessfulMissions = completedMissions + directAnswerMissions;
  const overallSuccessRate = Number(((totalSuccessfulMissions / missions.length) * 100).toFixed(1));

  const subAgentSuccessRate = totalDelegations > 0 
    ? Number(((successfulDelegations / totalDelegations) * 100).toFixed(1))
    : 100;

  const avgSubAgentDurationMs = totalDelegations > 0
    ? Math.round(totalSubAgentDurationMs / totalDelegations)
    : 0;

  // Agent Performance list
  const agentPerformanceData = Array.from(agentStatsMap.entries()).map(([agentId, data]) => {
    const rawName = agentNameMap.get(agentId) || agentId.replace(/_Agent$/, '').replace(/_/g, ' ');
    return {
      agentId,
      name: rawName,
      runs: data.runs,
      successRate: Number(((data.successes / data.runs) * 100).toFixed(0)),
      avgDurationSec: Number((data.durationSum / data.runs / 1000).toFixed(2)),
    };
  }).sort((a, b) => b.runs - a.runs);

  // Status Pie Data
  const statusPieData = [
    { name: 'Completed Synthesis', value: completedMissions, color: '#10b981' },
    { name: 'Direct Answer', value: directAnswerMissions, color: '#06b6d4' },
    ...(failedMissions > 0 ? [{ name: 'Failed / Errors', value: failedMissions, color: '#f43f5e' }] : [])
  ].filter(item => item.value > 0);

  return {
    totalMissions: missions.length,
    completedMissions,
    failedMissions,
    directAnswerMissions,
    overallSuccessRate,
    avgCompletionTimeSec,
    minCompletionTimeSec,
    maxCompletionTimeSec,
    totalDelegations,
    successfulDelegations,
    failedDelegations,
    subAgentSuccessRate,
    avgSubAgentDurationMs,
    missionDurationData,
    agentPerformanceData,
    statusPieData
  };
}

