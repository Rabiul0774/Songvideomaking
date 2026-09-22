import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health / Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Helper for fallback simulation when API key is missing or for edge cases
function simulateCaptainPlan(userPrompt: string, agents: any[]): { text: string; isDelegation: boolean; delegations: any[] } {
  const pLower = userPrompt.toLowerCase();
  const activeAgents = (agents || []).filter((a: any) => a.enabled);
  const activeIds = new Set(activeAgents.map((a: any) => a.id));

  const chosenDelegations: any[] = [];

  // Match against user prompt semantics
  if ((pLower.includes('data') || pLower.includes('metric') || pLower.includes('csv') || pLower.includes('stat') || pLower.includes('churn') || pLower.includes('benchmarks') || pLower.includes('analysis') || pLower.includes('report')) && activeIds.has('Data_Analyst_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Data_Analyst_Agent',
      task_prompt: `Perform an in-depth statistical and quantitative breakdown based on the user's objective: "${userPrompt}". Include concrete metric models, KPI forecasts, and a structured markdown comparison table.`,
    });
  }

  if ((pLower.includes('copy') || pLower.includes('email') || pLower.includes('marketing') || pLower.includes('landing') || pLower.includes('pitch') || pLower.includes('social') || pLower.includes('launch') || pLower.includes('content') || pLower.includes('re-engagement') || pLower.includes('syncpulse')) && activeIds.has('Copywriter_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Copywriter_Agent',
      task_prompt: `Write high-converting, persuasive copy tailored to this request: "${userPrompt}". Provide high-impact headlines, core value proposition bullets, an email announcement template, and explicit call-to-actions (CTAs).`,
    });
  }

  if ((pLower.includes('code') || pLower.includes('architecture') || pLower.includes('api') || pLower.includes('system') || pLower.includes('canvas') || pLower.includes('backend') || pLower.includes('technical') || pLower.includes('syncpulse') || pLower.includes('feature spec')) && activeIds.has('Code_Architect_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Code_Architect_Agent',
      task_prompt: `Design the technical system architecture and clean production-ready code interfaces for: "${userPrompt}". Include data flow specifications, TypeScript schemas/interfaces, API endpoint contracts, and error resilience strategies.`,
    });
  }

  if ((pLower.includes('ui') || pLower.includes('ux') || pLower.includes('design') || pLower.includes('wireframe') || pLower.includes('interface') || pLower.includes('canvas') || pLower.includes('interaction')) && activeIds.has('UIUX_Designer_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'UIUX_Designer_Agent',
      task_prompt: `Create a comprehensive UI/UX specification for: "${userPrompt}". Detail user journey steps, accessibility considerations, layout hierarchy, and Tailwind CSS component structures.`,
    });
  }

  if ((pLower.includes('qa') || pLower.includes('test') || pLower.includes('security') || pLower.includes('edge case') || pLower.includes('audit') || pLower.includes('risk') || pLower.includes('checklist')) && activeIds.has('QA_FactChecker_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'QA_FactChecker_Agent',
      task_prompt: `Execute a rigorous quality, adversarial, and edge-case audit for: "${userPrompt}". Identify top 5 potential failure modes, security/concurrency risks, and a verification test checklist.`,
    });
  }

  if ((pLower.includes('financial') || pLower.includes('revenue') || pLower.includes('pricing') || pLower.includes('cac') || pLower.includes('ltv') || pLower.includes('burn') || pLower.includes('investor') || pLower.includes('economics')) && activeIds.has('Financial_Analyst_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Financial_Analyst_Agent',
      task_prompt: `Build a strategic financial model and unit economics breakdown for: "${userPrompt}". Provide ARR/MRR forecasts, pricing tier suggestions, and investor-level summaries.`,
    });
  }

  if ((pLower.includes('research') || pLower.includes('competitor') || pLower.includes('market') || pLower.includes('industry') || pLower.includes('landscape')) && activeIds.has('Web_Researcher_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Web_Researcher_Agent',
      task_prompt: `Conduct a competitive intelligence and market landscape analysis for: "${userPrompt}". Highlight top market contenders, differentiating moats, and emerging adoption trends.`,
    });
  }

  if ((pLower.includes('song') || pLower.includes('bengali') || pLower.includes('bangla') || pLower.includes('lyric') || pLower.includes('music') || pLower.includes('producer') || pLower.includes('track') || pLower.includes('melody') || pLower.includes('audio') || pLower.includes('tune')) && activeIds.has('Song_Generator_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Song_Generator_Agent',
      task_prompt: `Write high-quality, original modern Bengali song lyrics in Bengali script with [Verse], [Chorus], and [Bridge] tags, and formulate a detailed English music production style description based on: "${userPrompt}". Output strictly valid JSON with "lyrics" and "song_style" keys.`,
    });
  }

  if ((pLower.includes('api') || pLower.includes('endpoint') || pLower.includes('payload') || pLower.includes('generate_music') || pLower.includes('webhook') || pLower.includes('integration') || pLower.includes('music-generation')) && activeIds.has('Music_API_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Music_API_Agent',
      task_prompt: `Transform the raw song data (Bengali lyrics and English song_style) into a strictly formatted JSON API payload for the music generation endpoint /generate_music with method, prompt, tags, title, make_instrumental, and wait_audio. Output strictly valid JSON with no markdown tags.`,
    });
  }

  if ((pLower.includes('art director') || pLower.includes('art_director') || pLower.includes('style bible') || pLower.includes('visual bible') || pLower.includes('character dna') || pLower.includes('color palette') || pLower.includes('aesthetic continuity')) && activeIds.has('Art_Director_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Art_Director_Agent',
      task_prompt: `Analyze the song theme and musical style, then produce a unified Visual Style Bible (visual_theme, color_palette, character_dna, master_style_suffix) to enforce cinematic consistency across all scenes. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('storyboard') || pLower.includes('timeline') || pLower.includes('timing') || pLower.includes('5-second') || pLower.includes('5 second') || pLower.includes('chunking')) && activeIds.has('Storyboard_Timing_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Storyboard_Timing_Agent',
      task_prompt: `Divide the entire track into sequential 5-second scene blocks from 00:00 to the end. Map lyrics, formulate scene actions, and append the Master Style Suffix to create the final video prompt for each scene. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('subtitle') || pLower.includes('caption') || pLower.includes('typography') || pLower.includes('formatter') || pLower.includes('on-screen text')) && activeIds.has('Subtitle_Formatter_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Subtitle_Formatter_Agent',
      task_prompt: `Format Bengali lyrics into short, readable on-screen subtitles that fit comfortably on mobile and landscape video screens. Split lines exceeding 5-6 words with '\\n', clean punctuation, and preserve Bengali Unicode. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('lyria') || pLower.includes('google music') || pLower.includes('google_music') || pLower.includes('google-music')) && activeIds.has('Google_Music_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Google_Music_Agent',
      task_prompt: `Combine the Bengali lyrics and the musical style description into a single detailed prompt and prepare the strict JSON payload for Google's Lyria music generation model (model: 'lyria-3.5-generate', duration_seconds: 180). Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('video') || pLower.includes('scene') || pLower.includes('visual') || pLower.includes('cinematic') || pLower.includes('director') || pLower.includes('storyboard')) && activeIds.has('Video_Scene_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Video_Scene_Agent',
      task_prompt: `Analyze the Bengali song lyrics and musical style, and generate a sequence of cinematic visual prompts in English matching the song sections (Verse, Chorus, Bridge). Output strictly valid JSON with the "music_video_scenes" array.`,
    });
  }

  if ((pLower.includes('dashscope') || pLower.includes('wanx') || pLower.includes('wan-video') || pLower.includes('video api') || pLower.includes('video-generation') || pLower.includes('video-synthesis') || pLower.includes('video payload')) && activeIds.has('Video_API_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Video_API_Agent',
      task_prompt: `Extract the visual prompt for the music video scene and convert it into the strict standardized asynchronous JSON API payload required for Alibaba Cloud DashScope video generation endpoint (https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis). Set model to 'wanx-video-generation', duration 5s, resolution '1280*720'. Output strictly valid machine-readable JSON.`,
    });
  }

  if ((pLower.includes('veo') || pLower.includes('google video') || pLower.includes('google_video') || pLower.includes('genai video') || pLower.includes('veo-2.0')) && activeIds.has('Google_Video_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Google_Video_Agent',
      task_prompt: `Extract the visual prompt and structure it into a strict JSON payload compatible with Google's video generation models (veo-2.0-generate-001) in Google AI Studio / Google GenAI SDK. Configure aspect_ratio 16:9, duration_seconds 5, resolution 720p. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('qc') || pLower.includes('quality control') || pLower.includes('grade') || pLower.includes('audit video') || pLower.includes('artifacts') || pLower.includes('adherence')) && activeIds.has('Video_QC_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Video_QC_Agent',
      task_prompt: `Watch the generated video clip and grade it against the director's visual prompt on 3 criteria: Prompt Adherence, Visual Artifacts, and Motion Quality. Output strictly valid JSON with score (1-10), pass boolean, reason, and retry_suggestion.`,
    });
  }

  if ((pLower.includes('troubleshoot') || pLower.includes('error') || pLower.includes('crash') || pLower.includes('support') || pLower.includes('failed') || pLower.includes('429') || pLower.includes('resourceexhausted') || pLower.includes('permissiondenied') || pLower.includes('exception')) && activeIds.has('Troubleshooting_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Troubleshooting_Agent',
      task_prompt: `Analyze the critical error details: "${userPrompt}". Explain the failure in simple, non-jargon terms, and give clear, step-by-step instructions (with shell / python fixes) on how to resolve it immediately.`,
    });
  }

  if ((pLower.includes('hire') || pLower.includes('hr') || pLower.includes('new agent') || pLower.includes('specialist') || pLower.includes('missing capability') || pLower.includes('restoration') || pLower.includes('repair') || pLower.includes('recruit')) && activeIds.has('HR_Developer_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'HR_Developer_Agent',
      task_prompt: `Analyze the problem description: "${userPrompt}". Determine the missing specialist capability, design their system instruction, configure their agent parameters, and hire them into the production swarm. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('beat') || pLower.includes('sync') || pLower.includes('cut') || pLower.includes('timing') || pLower.includes('tempo') || pLower.includes('rhythm') || pLower.includes('timestamps')) && activeIds.has('Beat_Sync_Editor_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Beat_Sync_Editor_Agent',
      task_prompt: `Analyze the audio track and calculate beat-synced cut durations for each storyboard scene. Listen for vocal onsets and downbeats, ensuring every scene transition cuts tightly on rhythm. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('continuity') || pLower.includes('character lock') || pLower.includes('reference frame') || pLower.includes('drift') || pLower.includes('consistency') || pLower.includes('extract frame')) && activeIds.has('Character_Continuity_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Character_Continuity_Agent',
      task_prompt: `Extract reference character frame from previous scene and formulate persistent character anchors and lighting continuity to prevent character drift in the next Veo clip. Output strictly valid JSON.`,
    });
  }

  if ((pLower.includes('shield') || pLower.includes('safety') || pLower.includes('sanitize') || pLower.includes('ip') || pLower.includes('disney') || pLower.includes('batman') || pLower.includes('marvel') || pLower.includes('filter') || pLower.includes('violation')) && activeIds.has('Shield_Safety_Agent')) {
    chosenDelegations.push({
      action: 'delegate',
      target_agent: 'Shield_Safety_Agent',
      task_prompt: `Audit the video generation prompt for Veo safety rules (trademarked characters, IP, identity-lock tags, violence). Rewrite violations into a safe, generic cinematic equivalent that passes Google Veo filters.`,
    });
  }

  // If no specific keyword matched, but agents are available, pick the most relevant or top 2
  if (chosenDelegations.length === 0 && activeAgents.length > 0) {
    // Check if prompt is completely out of registry scope (e.g. music sonata, cooking recipe, etc.)
    if (pLower.includes('sonata') || pLower.includes('piano') || pLower.includes('sheet music') || pLower.includes('recipe') || pLower.includes('poem')) {
      return {
        text: `As the Captain Agent, I have analyzed your request: "${userPrompt}".\n\n*Note: A specialized agent for classical music composition or music notation is not currently registered in the CURRENT AGENT REGISTRY.* Consequently, per my operational rules, I am addressing this directly with general knowledge:\n\nA classical Baroque trio sonata typically comprises two melody instruments (such as two violins or flutes) and a basso continuo (cello and harpsichord). Typical movement structure: Adagio (slow/solemn in 4/4) -> Allegro (fugal/contrapuntal) -> Grave/Andante (lyrical relative minor) -> Vivace/Gigue (lively compound meter 6/8 or 12/8). To compose an entire custom score, you can register a dedicated \`Music_Composer_Agent\` into the Captain Agent Registry!`,
        isDelegation: false,
        delegations: [],
      };
    }

    // Default to first 2 active agents
    activeAgents.slice(0, 2).forEach((agent: any) => {
      chosenDelegations.push({
        action: 'delegate',
        target_agent: agent.id,
        task_prompt: `Apply your specialized capabilities (${agent.roleDescription}) to address the user goal: "${userPrompt}". Produce actionable, high-quality deliverables.`,
      });
    });
  }

  const jsonPayload = JSON.stringify(chosenDelegations.length === 1 ? chosenDelegations[0] : chosenDelegations, null, 2);
  return {
    text: `\`\`\`json\n${jsonPayload}\n\`\`\``,
    isDelegation: chosenDelegations.length > 0,
    delegations: chosenDelegations,
  };
}

function simulateSubAgentExecution(agentId: string, taskPrompt: string, originalPrompt: string): string {
  switch (agentId) {
    case 'Data_Analyst_Agent':
      return `### Quantitative Analysis & Metric Modeling
**Focus:** Statistical evaluation and performance benchmarks.

#### Key Performance Indicators (KPIs)
| Metric | Baseline | Target (30 Days) | Target (90 Days) | Confidence |
| :--- | :--- | :--- | :--- | :--- |
| **Activation Rate** | 22.4% | 34.0% (+51.7%) | 42.5% | 92% |
| **Monthly Churn** | 4.8% | 2.9% (-39.5%) | 1.8% | 88% |
| **Median Time-to-Value** | 4.2 days | 1.1 days | 45 minutes | 95% |
| **Net Revenue Retention** | 104% | 115% | 128% | 85% |

#### Statistical Findings
1. **Cohort Separation:** Analysis reveals that user accounts utilizing automated workspace integrations retain at 3.4x the rate of manual users (*p < 0.001*).
2. **Critical Inflection Point:** Day 7 engagement dropoff is primarily caused by complex initial onboarding steps rather than product utility. Streamlining the first 3 clicks recovers an estimated 18.2% of at-risk accounts.`;

    case 'Copywriter_Agent':
      return `### High-Conversion Messaging & Copy Suite
**Target Audience:** Forward-thinking engineering and product teams.

#### 1. Core Positioning & Hero Header
* **Headline:** Stop losing hours in meetings. Turn conversation into execution instantly.
* **Subheader:** SyncPulse listens, synthesizes architectural decisions, and syncs directly with your team's issue tracker—no manual note-taking required.
* **Primary CTA:** \`Start Free 14-Day Pilot →\`
* **Secondary CTA:** \`Watch 2-Min Product Tour\`

#### 2. Three-Pillar Value Proposition
* **Zero Meeting Drift:** Real-time AI transcription that extracts code snippets, action items, and blocker flags before the call even ends.
* **Engineered for Developers:** Deep bidirectional sync with GitHub, Linear, Jira, and Slack.
* **Enterprise Security First:** SOC2 Type II compliant, zero-retention data policies, and dedicated private VPC options.

#### 3. Announcement Email Template
**Subject:** Meet SyncPulse: Never take meeting notes again 🚀
**Preview:** The developer-first meeting intelligence agent is here.

*Hi {{First_Name}},*

Every engineer knows the feeling: spending 45 minutes in a sprint planning meeting, only to spend another 30 minutes figuring out who was assigned what ticket.

Today, we're changing that with **SyncPulse**. It automatically listens to your team discussions, detects architectural decisions, and generates ready-to-merge specs and tickets in seconds.

👉 [Claim Your Free Team Pilot](https://syncpulse.ai/pilot)

*Onward,*
*The SyncPulse Engineering Team*`;

    case 'Code_Architect_Agent':
      return `### System Architecture & Technical Specification
**Architecture Pattern:** Event-driven, low-latency microservices with WebSocket presence.

#### 1. Core Technical Stack
* **Runtime:** Node.js / TypeScript / Go audio streaming ingestion service.
* **Real-time Engine:** WebSocket server with Redis Pub/Sub for sub-50ms sync latency.
* **State Management:** CRDT (Yjs) for conflict-free state resolution during concurrent edits.

#### 2. Core TypeScript Interfaces & Contracts
\`\`\`typescript
export interface MeetingSession {
  sessionId: string;
  organizationId: string;
  hostUserId: string;
  createdAt: string;
  status: 'active' | 'transcribing' | 'synthesized' | 'archived';
  participants: ParticipantMetadata[];
}

export interface ActionItemExtraction {
  id: string;
  sessionId: string;
  assigneeName?: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  linkedTicketUrl?: string;
}

export interface AudioStreamChunk {
  streamId: string;
  sequenceNumber: number;
  sampleRate: number;
  pcmAudioBuffer: ArrayBuffer;
}
\`\`\`

#### 3. Resiliency & Scale Safeguards
* **Backpressure Handling:** Audio streams buffer locally in memory using ring buffers before pushing to transcription workers.
* **Idempotency:** All state mutation operations carry unique UUID correlation keys to avoid duplicate ticket generation during network reconnections.`;

    case 'UIUX_Designer_Agent':
      return `### UI/UX Architecture & Design System Spec
**Design Aesthetic:** Modern, hyper-clean dark-mode terminal inspired interface with high contrast accents.

#### User Flow Map
1. **Trigger:** User joins or connects meeting stream via 1-click bot or browser extension.
2. **Active Stream:** Persistent minimal floating dock displaying live audio waveforms and detected action items.
3. **Review & Dispatch:** Post-meeting dashboard organized in 3 columns: Summary Narrative, Action Items Checklist, and Integrations Dispatch.

#### Tailwind CSS Component Structure
\`\`\`html
<!-- Live Action Items Dock -->
<aside class="fixed bottom-6 right-6 w-96 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl p-5 backdrop-blur-xl">
  <div class="flex items-center justify-between pb-3 border-b border-zinc-800">
    <div class="flex items-center gap-2">
      <span class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">Live Synthesis</h4>
    </div>
    <span class="text-xs font-mono text-zinc-500">12 items logged</span>
  </div>
  <ul class="mt-3 space-y-2 max-h-60 overflow-y-auto">
    <!-- Action Item Card -->
    <li class="p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition border border-zinc-700/50 flex items-start gap-3">
      <input type="checkbox" class="mt-1 rounded border-zinc-600 text-indigo-500 focus:ring-indigo-400" />
      <div>
        <p class="text-xs font-medium text-zinc-200">Refactor WebSocket reconnect logic</p>
        <span class="text-[10px] text-zinc-400 font-mono">Assigned to @sarah</span>
      </div>
    </li>
  </ul>
</aside>
\`\`\``;

    case 'QA_FactChecker_Agent':
      return `### Quality Assurance, Security & Stress-Test Audit
**Status:** Verification Passed with 3 High-Priority Action Items.

#### 1. Edge Case & Failure Mode Matrix
* **Risk 1: High Audio Packet Loss (Wi-Fi dropouts)**
  * *Impact:* Interrupted transcription tokens.
  * *Mitigation:* Audio capture worker must maintain local indexedDB buffer of unacknowledged audio chunks for 120 seconds.
* **Risk 2: Multi-Speaker Overlap Confusion**
  * *Impact:* Assigning action items to incorrect speaker.
  * *Mitigation:* Implement speaker diarization probability threshold (>85%) before asserting definitive speaker attribution.
* **Risk 3: PII & Sensitive Token Ingestion**
  * *Impact:* Accidental credential leakage in meeting logs.
  * *Mitigation:* Pre-synthesis regex scrubber for API keys, AWS tokens, and private URLs.

#### 2. Readiness Checklist
- [x] Concurrent WebSocket load tested up to 5,000 active streams.
- [x] GDPR/CCPA data scrubbing pipelines verified.
- [x] Graceful degradation to batch processing when real-time connection drops.`;

    case 'Financial_Analyst_Agent':
      return `### Financial Projections & Unit Economics Model
**Time Horizon:** 12-Month Launch Ramp.

#### 1. Tiered Pricing Strategy
* **Developer Tier (Free):** Up to 5 meetings/mo, community support. (Acquisition engine).
* **Team Tier ($18/seat/mo):** Unlimited meetings, Jira/GitHub integrations, 90-day retention.
* **Enterprise ($45/seat/mo):** Custom LLM fine-tuning, VPC deployment, dedicated SLA, SSO.

#### 2. Unit Economics Breakdown
* **Gross Margin Target:** 78.4%
* **Estimated LLM Ingestion Cost per User:** $2.30 / mo (at 20 meetings/mo average)
* **Estimated Customer Acquisition Cost (CAC):** $145
* **Customer Lifetime Value (LTV):** $864 (assuming 2.8% monthly churn)
* **LTV / CAC Ratio:** 5.96x (Industry benchmark: > 3.0x indicates strong capital efficiency).`;

    case 'Web_Researcher_Agent':
      return `### Market Landscape & Competitive Intelligence
**Domain:** AI Workspace Automation & Meeting Intelligence.

#### Key Market Dynamics
* **Consolidation Trend:** Standalone transcription tools are losing ground to multi-modal workflow orchestrators that close the loop on task execution.
* **Key Differentiator:** Developer native integration (git/issue tracking) commands a 40% higher willingness-to-pay than general corporate transcription.
* **Emerging Opportunity:** Enterprise compliance teams actively seeking self-hosted or zero-data-retention models over centralized cloud storage.`;

    case 'Song_Generator_Agent':
      return JSON.stringify({
        lyrics: `[Verse 1]
ভিজে যাওয়া ট্রামলাইন, শহরের ক্লান্ত রাত
কাঁচের জানালায় আঁকা স্মৃতির একমুঠো হাত
রাতের নিয়ন আলোয় অচেনা চেনা সুর
তোমার কি মনে পড়ে সেই কফি হাউজের দূর?

[Chorus]
তুমি নেই তবু বৃষ্টিতে ধুয়ে যায় এই শহর
অজানা ছায়ারা খুঁজে ফেরে হারানো প্রহর
যদি কখনো ফিরে আসো এই অচেনা মোড়ে
দেখবে গানগুলো এখনো তোমাকেই জড়িয়ে ধরে।

[Verse 2]
মোবাইল স্ক্রিনে জমেছে অকারণ অভিমান
হেডফোনে বেজে ওঠে পুরোনো লুপের গান
ধোঁয়া ওঠা চায়ের কাপে একলা বিকেল নামে
চিঠিগুলো রয়ে গেছে নাম না জানা খামে।

[Bridge]
সময়ের স্রোতে কত মুখ মুছে যায়
তবু এই মন শুধু তোমাকেই চায়
বৃষ্টির ফোঁটা ফেলে দীর্ঘশ্বাস
বাতাসে এখনও তোমার নিঃশ্বাস।

[Chorus]
তুমি নেই তবু বৃষ্টিতে ধুয়ে যায় এই শহর
অজানা ছায়ারা খুঁজে ফেরে হারানো প্রহর
যদি কখনো ফিরে আসো এই অচেনা মোড়ে
দেখবে গানগুলো এখনো তোমাকেই জড়িয়ে ধরে।

[Outro]
বৃষ্টি থামে, নিভে যায় আলো...
ভালো থেকো তুমি, খুব ভালো...`,
        song_style: "Modern Bengali Indie Pop, melancholic yet groovy tempo, acoustic guitar fingerpicking layered with soft ambient synth pads, mellow emotional male vocal with subtle falsetto, gentle punchy 808 percussion, warm analog bassline, 102 BPM, minor key ballad aesthetic."
      }, null, 2);

    case 'Music_API_Agent':
      return JSON.stringify({
        api_endpoint: "/generate_music",
        method: "POST",
        payload: {
          prompt: `[Verse 1]\nভিজে যাওয়া ট্রামলাইন, শহরের ক্লান্ত রাত\nকাঁচের জানালায় আঁকা স্মৃতির একমুঠো হাত\nরাতের নিয়ন আলোয় অচেনা চেনা সুর\nতোমার কি মনে পড়ে সেই কফি হাউজের দূর?\n\n[Chorus]\nতুমি নেই তবু বৃষ্টিতে ধুয়ে যায় এই শহর\nঅজানা ছায়ারা খুঁজে ফেরে হারানো প্রহর\nযদি কখনো ফিরে আসো এই অচেনা মোড়ে\nদেখবে গানগুলো এখনো তোমাকেই জড়িয়ে ধরে।\n\n[Verse 2]\nমোবাইল স্ক্রিনে জমেছে অকারণ অভিমান\nহেডফোনে বেজে ওঠে পুরোনো লুপের গান\nধোঁয়া ওঠা চায়ের কাপে একলা বিকেল নামে\nচিঠিগুলো রয়ে গেছে নাম না জানা খামে।\n\n[Bridge]\nসময়ের স্রোতে কত মুখ মুছে যায়\nতবু এই মন শুধু তোমাকেই চায়\nবৃষ্টির ফোঁটা ফেলে দীর্ঘশ্বাস\nবাতাসে এখনও তোমার নিঃশ্বাস।\n\n[Chorus]\nতুমি নেই তবু বৃষ্টিতে ধুয়ে যায় এই শহর\nঅজানা ছায়ারা খুঁজে ফেরে হারানো প্রহর\nযদি কখনো ফিরে আসো এই অচেনা মোড়ে\nদেখবে গানগুলো এখনো তোমাকেই জড়িয়ে ধরে।\n\n[Outro]\nবৃষ্টি থামে, নিভে যায় আলো...\nভালো থেকো তুমি, খুব ভালো...`,
          tags: "Modern Bengali Indie Pop, melancholic yet groovy tempo, acoustic guitar fingerpicking layered with soft ambient synth pads, mellow emotional male vocal with subtle falsetto, gentle punchy 808 percussion, warm analog bassline, 102 BPM, minor key ballad aesthetic.",
          title: "বৃষ্টির শহর",
          make_instrumental: false,
          wait_audio: true
        }
      }, null, 2);

    case 'Video_Scene_Agent':
      return JSON.stringify({
        music_video_scenes: [
          {
            section: "Verse 1",
            lyric_reference: "ভিজে যাওয়া ট্রামলাইন, শহরের নীরব রাত / কাঁচের জানালায় আঁকা স্মৃতির একমুঠো হাত",
            visual_prompt: "Cinematic wide tracking shot down a rain-drenched tramline in old North Kolkata at midnight. Reflections of glowing amber and neon street lamps glistening on wet asphalt. A vintage tram rolls slowly past in deep atmospheric mist, warm vintage film grain, Arri Alexa 35mm aesthetic, moody teal and orange color grading, slow-motion 60fps."
          },
          {
            section: "Chorus",
            lyric_reference: "তুমি নেই তবু বৃষ্টিতে ধুয়ে যায় এই শহর / অজানা ছায়ারা খুঁজে ফেরে হারানো প্রহর",
            visual_prompt: "Drone crane shot slowly descending through torrential rain over the Victoria Memorial and illuminated Howrah Bridge. Silhouette of a lone protagonist holding a transparent umbrella under a flickering streetlamp, camera slowly orbiting 360 degrees as water droplets shatter around in macro focus, high emotional resonance, cinematic depth of field."
          },
          {
            section: "Verse 2",
            lyric_reference: "মোবাইল স্ক্রিনে জমেছে অকারণ অভিমান / হেডফোনে বেজে ওঠে পুরোনো লুপের গান",
            visual_prompt: "Medium close-up profile shot inside an old wooden-shuttered colonial cafe. Soft bokeh lights from the street outside. A young melancholic artist wearing over-ear vintage headphones looking out a rain-streaked windowpane, steam curling gently from an earthen tea cup (bhar), soft melancholic golden hour rim lighting."
          },
          {
            section: "Bridge",
            lyric_reference: "সময়ের স্রোতে কত মুখ মুছে যায় / তবু এই মন শুধু তোমাকেই চায়",
            visual_prompt: "Dynamic montage sequence with dreamy motion blur: nostalgic flashbacks of two close friends laughing on the banks of Princep Ghat at sunset, cross-dissolving with current-day empty ghats in pouring rain, cinematic anamorphic lens flare, wistful indie-film aesthetic."
          },
          {
            section: "Outro",
            lyric_reference: "বৃষ্টি থামে, নিভে যায় আলো... / ভালো থেকো তুমি, খুব ভালো...",
            visual_prompt: "Extreme wide static shot of an empty Kolkata crossroad as rain clouds part to reveal pale dawn light breaking through mist. Streetlights click off sequentially one by one. The solitary figure walks away into the misty dawn horizon, poignant peaceful resolution, hyper-realistic, photorealistic 8k cinematic masterpiece."
          }
        ]
      }, null, 2);

    case 'Video_API_Agent':
      return JSON.stringify({
        api_endpoint: "https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis",
        method: "POST",
        headers: {
          "X-DashScope-Async": "enable",
          "Content-Type": "application/json"
        },
        payload: {
          model: "wanx-video-generation",
          input: {
            prompt: "Cinematic wide tracking shot along a rain-drenched vintage tram track in old North Kolkata at midnight. Reflections of glowing amber and neon streetlamps ripple on wet asphalt. An illuminated vintage wooden tram glides slowly through atmospheric mist, warm 35mm film grain, moody teal and deep orange color grade, slow-motion 60fps."
          },
          parameters: {
            duration: 5,
            resolution: "1280*720"
          }
        }
      }, null, 2);

    case 'Google_Video_Agent':
      return JSON.stringify({
        model: "veo-2.0-generate-001",
        prompt: "Cinematic wide tracking shot down a rain-drenched vintage tramline in old North Kolkata at midnight. Reflections of glowing amber and neon street lamps glistening on wet asphalt. An illuminated vintage wooden tram rolls slowly past in deep atmospheric mist, warm 35mm film grain, Arri Alexa aesthetic, moody teal and deep orange color grading, slow-motion 60fps.",
        config: {
          aspect_ratio: "16:9",
          duration_seconds: 5,
          resolution: "720p"
        }
      }, null, 2);

    case 'Art_Director_Agent':
      return JSON.stringify({
        visual_theme: "Monsoon Melancholy Kolkata Vintage 35mm",
        color_palette: "Teal wet asphalt, warm sodium vapor amber, neon magenta reflections, muted mustard yellow facades, moody shadows",
        character_dna: "Young Bengali musician in late 20s, tousled dark wavy hair, vintage round tortoiseshell spectacles, damp olive-green linen kurta, carrying a leather acoustic guitar gig bag",
        master_style_suffix: "shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
      }, null, 2);

    case 'Storyboard_Timing_Agent':
      return JSON.stringify({
        total_scenes: 6,
        scene_duration_sec: 5,
        timeline: [
          {
            scene_index: 1,
            timestamp: "00:00 - 00:05",
            lyric_segment: "",
            action_description: "Wide shot of a vintage Kolkata tram navigating glowing wet tracks at twilight, headlights piercing the drizzle",
            final_video_prompt: "Wide shot of a vintage Kolkata tram navigating glowing wet tracks at twilight, headlights piercing the drizzle, shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
          },
          {
            scene_index: 2,
            timestamp: "00:05 - 00:10",
            lyric_segment: "বৃষ্টিভেজা এই শহরের অলিগলিতে",
            action_description: "Medium tracking shot of young Bengali musician in damp olive-green linen kurta walking beneath an old colonial balcony with acoustic guitar gig bag",
            final_video_prompt: "Medium tracking shot of young Bengali musician in late 20s, tousled dark wavy hair, tortoiseshell glasses, damp olive-green linen kurta walking beneath an old colonial balcony carrying acoustic guitar gig bag, shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
          },
          {
            scene_index: 3,
            timestamp: "00:10 - 00:15",
            lyric_segment: "খুঁজে ফিরি ফেলে আসা সুর",
            action_description: "Close-up of raindrop ripples in a street puddle reflecting amber sodium streetlamps and neon signs",
            final_video_prompt: "Close-up of raindrop ripples in a street puddle reflecting amber sodium streetlamps and neon signs, shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
          },
          {
            scene_index: 4,
            timestamp: "00:15 - 00:20",
            lyric_segment: "মেঘের কোলে রোদ হেসেছে",
            action_description: "The musician stops at an illuminated chai stall, steam gently rising into the cool evening breeze",
            final_video_prompt: "The young Bengali musician stops at an illuminated chai stall, steam gently rising into the cool evening breeze, warm amber glow, shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
          },
          {
            scene_index: 5,
            timestamp: "00:20 - 00:25",
            lyric_segment: "বাদল গেছে টুটি",
            action_description: "Over-the-shoulder view looking at the Howrah Bridge silhouette enveloped in mist and distant city lights across the Hooghly river",
            final_video_prompt: "Over-the-shoulder view looking at the Howrah Bridge silhouette enveloped in mist and distant city lights across the Hooghly river, shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
          },
          {
            scene_index: 6,
            timestamp: "00:25 - 00:30",
            lyric_segment: "আজ আমাদের ছুটি ও ভাই",
            action_description: "Low-angle cinematic slow-motion shot of the musician stepping onto a departing wooden tram, turning slightly toward camera with a faint nostalgic smile",
            final_video_prompt: "Low-angle cinematic slow-motion shot of the young Bengali musician stepping onto a departing wooden tram, turning slightly toward camera with a faint nostalgic smile, shot on 35mm Arri Alexa 65, anamorphic lens flare, Kodak Vision3 500T color science, natural mist, cinematic rim lighting, rain-slicked surfaces, shallow depth of field, photorealistic, 4k"
          }
        ]
      }, null, 2);

    case 'Subtitle_Formatter_Agent':
      return JSON.stringify({
        formatted_subtitles: [
          {
            scene_index: 1,
            subtitle_text: ""
          },
          {
            scene_index: 2,
            subtitle_text: "বৃষ্টিভেজা এই শহরের\nঅলিগলিতে"
          },
          {
            scene_index: 3,
            subtitle_text: "খুঁজে ফিরি\nফেলে আসা সুর"
          },
          {
            scene_index: 4,
            subtitle_text: "মেঘের কোলে\nরোদ হেসেছে"
          },
          {
            scene_index: 5,
            subtitle_text: "বাদল গেছে টুটি"
          },
          {
            scene_index: 6,
            subtitle_text: "আজ আমাদের ছুটি ও ভাই\nআজ আমাদের ছুটি"
          }
        ]
      }, null, 2);

    case 'Google_Music_Agent':
      return JSON.stringify({
        model: "lyria-3.5-generate",
        prompt: "Create an Urban Bengali Indie-Pop / Lo-fi Folk-Pop track with Warm, Intimate Airy Female Soprano vocals. The song should feel Melancholic yet nostalgic and hopeful, evocative of a misty monsoon twilight in Kolkata. Instrumentation includes delicate fingerpicked nylon acoustic guitar, vintage upright piano, subtle ambient rain soundscapes, warm analog bassline, and brushed acoustic percussion at 78 BPM. Use the following lyrics exactly as written:\n\n[Verse 1]\nবৃষ্টিভেজা এই শহরের অলিগলিতে\nখুঁজে ফিরি ফেলে আসা সুর\nপুরনো ট্রামের জানালায় জমে থাকা জল\nমনে করায় সেই অচেনা দুপুর।\n\n[Chorus]\nমেঘের কোলে রোদ হেসেছে, বাদল গেছে টুটি\nআজ আমাদের ছুটি ও ভাই, আজ আমাদের ছুটি।\nহারিয়ে যাওয়া দিনগুলো সব ফিরে যদি পেতাম\nতোর কাঁধে হাত রেখে আবার বৃষ্টিতে ভিজতাম।\n\n[Bridge]\nকালো মেঘের দেশে ডাকপিয়ন নেই কোনো\nতবু এই মন তোকেই খোঁজে জানো।\n\n[Outro]\nভিজে যাওয়া ট্রাম লাইন, নিভে আসা আলো\nবন্ধু তোকে এখনো বাসি কত ভালো।",
        config: {
          instrumental_only: false,
          duration_seconds: 180
        }
      }, null, 2);

    case 'Video_QC_Agent':
      return JSON.stringify({
        score: 8,
        pass: true,
        reason: "The video clip strictly adheres to the requested wet twilight Kolkata street and tram action with accurate cinematic rim lighting. Zero facial melting or anatomical anomalies detected on the musician. Fluid dolly camera movement with natural rain physics.",
        retry_suggestion: ""
      }, null, 2);

    case 'Master_Music_Video_Director_Agent':
      const isBearVoice = (originalPrompt || '').toLowerCase().includes('bear voice') || (taskPrompt || '').toLowerCase().includes('bear voice');
      if (isBearVoice) {
        return JSON.stringify({
          song_title: "নদীর তীরে সন্ধে (Twilight by the River - Bear Voice Edition)",
          bengali_lyrics: "[Intro]\nনদীর চরে মৃদু বাতাস, দূরে বাঁশির সুর\n[Verse 1]\nনদীর তীরে নিঝুম সন্ধে, কাঁপে শান্ত জল\nবুকের মাঝে জমে আছে কত কথার দল।\n[Chorus]\nআমার এই গভীর গানে তোমায় কাছে ডাকি\nদিনের শেষে নদীর ঘাটে একলা বসে থাকি।\n[Outro]\nঅন্ধকারে হারায় নদী, জলে চাঁদের আলো\nবন্ধু তোমায় এই মনেতে বেসেছি কত ভালো।",
          lyria_audio_prompt: "Create an unplugged acoustic soulful romantic track. Mandatory: Feature a very deep, warm, rich, resonant male baritone vocal ('bear voice'). Instrumentation: delicate fingerpicked acoustic guitar, subtle acoustic cello, and soft percussion at 68 BPM. Use these lyrics strictly:\n\n[Intro]\nনদীর চরে মৃদু বাতাস, দূরে বাঁশির সুর\n[Verse 1]\nনদীর তীরে নিঝুম সন্ধে, কাঁপে শান্ত জল\nবুকের মাঝে জমে আছে কত কথার দল।\n[Chorus]\nআমার এই গভীর গানে তোমায় কাছে ডাকি\nদিনের শেষে নদীর ঘাটে একলা বসে থাকি।\n[Outro]\nঅন্ধকারে হারায় নদী, জলে চাঁদের আলো\nবন্ধু তোমায় এই মনেতে বেসেছি কত ভালো।",
          master_style_suffix: "cinematic lighting, warm romantic tones, acoustic indie music video aesthetic, shot on 35mm lens, 4k",
          scenes: [
            {
              index: 1,
              lyric_segment: "নদীর তীরে নিঝুম সন্ধে, কাঁপে শান্ত জল",
              video_prompt: "Cinematic wide shot of a serene riverbank at golden twilight, gentle water ripples glowing in sunset amber, cinematic lighting, warm romantic tones, acoustic indie music video aesthetic, shot on 35mm lens, 4k"
            },
            {
              index: 2,
              lyric_segment: "আমার এই গভীর গানে তোমায় কাছে ডাকি",
              video_prompt: "Medium atmospheric shot of a bearded musician with an acoustic guitar sitting peacefully on a wooden riverside pier, lantern softly glowing beside him, cinematic lighting, warm romantic tones, acoustic indie music video aesthetic, shot on 35mm lens, 4k"
            },
            {
              index: 3,
              lyric_segment: "দিনের শেষে নদীর ঘাটে একলা বসে থাকি",
              video_prompt: "Gentle slow-motion tracking shot of a wooden rowboat drifting slowly across the reflective river as evening dusk sets in, cinematic lighting, warm romantic tones, acoustic indie music video aesthetic, shot on 35mm lens, 4k"
            }
          ]
        }, null, 2);
      }

      return JSON.stringify({
        song_title: "বৃষ্টিভেজা কলকাতা (Rainy Kolkata Echoes)",
        bengali_lyrics: "[Verse 1]\nবৃষ্টিভেজা এই শহরের অলিগলিতে\nখুঁজে ফিরি ফেলে আসা সুর\n\n[Chorus]\nমেঘের কোলে রোদ হেসেছে বাদল গেছে টুটি\nআজ আমাদের ছুটি ও ভাই আজ আমাদের ছুটি\n\n[Bridge]\nকালো মেঘের দেশে ডাকপিয়ন নেই কোনো\nতবু এই মন তোকেই খোঁজে জানো\n\n[Outro]\nভিজে যাওয়া ট্রাম লাইন নিভে আসা আলো\nবন্ধু তোকে এখনো বাসি কত ভালো",
        lyria_audio_prompt: "Create an Urban Bengali Indie-Pop / Lo-fi Folk-Pop track with Warm, Intimate Airy Female Soprano vocals. The song should feel Melancholic yet nostalgic and hopeful at 78 BPM with acoustic nylon guitar, vintage upright piano, brushed drums, and ambient Kolkata rain soundscapes. Use these lyrics:\n\n[Verse 1]\nবৃষ্টিভেজা এই শহরের অলিগলিতে\nখুঁজে ফিরি ফেলে আসা সুর\n\n[Chorus]\nমেঘের কোলে রোদ হেসেছে বাদল গেছে টুটি\nআজ আমাদের ছুটি ও ভাই আজ আমাদের ছুটি\n\n[Bridge]\nকালো মেঘের দেশে ডাকপিয়ন নেই কোনো\nতবু এই মন তোকেই খোঁজে জানো\n\n[Outro]\nভিজে যাওয়া ট্রাম লাইন নিভে আসা আলো\nবন্ধু তোকে এখনো বাসি কত ভালো",
        visual_style: "cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography",
        veo_video_scenes: [
          {
            time: "00:00-00:05",
            lyric_segment: "",
            video_prompt: "Atmospheric establishing shot of a quiet North Kolkata colonial street during a gentle evening monsoon downpour, glowing street lamps reflecting on wet cobblestones and vintage tram rails, slow cinematic tracking shot, cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography"
          },
          {
            time: "00:05-00:10",
            lyric_segment: "বৃষ্টিভেজা এই শহরের অলিগলিতে",
            video_prompt: "Medium wide shot of a thoughtful young Bengali woman in an olive green cotton saree holding a vintage black umbrella, strolling past a weathered heritage building with green wooden shutters, cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography"
          },
          {
            time: "00:10-00:15",
            lyric_segment: "খুঁজে ফিরি ফেলে আসা সুর",
            video_prompt: "Close-up shot of raindrops cascading down the weathered wooden window pane of a green historic Kolkata tram, gentle camera rack focus from water droplets to the woman looking outside nostalgically, cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography"
          },
          {
            time: "00:15-00:20",
            lyric_segment: "মেঘের কোলে রোদ হেসেছে বাদল গেছে টুটি",
            video_prompt: "Golden hour low-angle shot as monsoon clouds part slightly over College Street, warm amber sunlight illuminating steam rising from rain-drenched asphalt and iconic second-hand book stalls, cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography"
          },
          {
            time: "00:20-00:25",
            lyric_segment: "আজ আমাদের ছুটি ও ভাই আজ আমাদের ছুটি",
            video_prompt: "Joyful medium tracking shot of laughing university friends running through a sunlit puddle near a tea stall, clay chai cups steaming, water splashing in slow motion, cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography"
          },
          {
            time: "00:25-00:30",
            lyric_segment: "বন্ধু তোকে এখনো বাসি কত ভালো",
            video_prompt: "Cinematic wide closing shot of the illuminated historic Kolkata tram gliding slowly into the blue twilight mist along the Maidan avenue, raindrops shimmering in the headlight beam, cinematic 35mm anamorphic film photography, warm vintage Kodak color palette, gentle organic rain reflections, golden hour twilight mist, shallow depth of field, subtle film grain, photorealistic 4k, award-winning cinematography"
          }
        ]
      }, null, 2);

    case 'Troubleshooting_Agent':
      return `### 🛠️ LEAD TECH SUPPORT & DIAGNOSTIC REPORT
**Target Service:** Google GenAI Video API (\`veo-2.0-generate-001\`) & Google Lyria Audio

---

#### 1. 🚨 Plain-English Incident Summary
Your video generation pipeline hit a **temporary barrier** while communicating with the Google GenAI Veo service. 

* **What happened:** The Google Cloud server returned an error indicating either a **rate-limit (ResourceExhausted / HTTP 429)**, a missing model entitlement for the specific project, or an outdated SDK payload structure.
* **Good news:** Your video prompts, lyrics, and storyboard data are intact and completely safe. No video generation credits were lost on failed operations.

---

#### 2. 🔍 Root Cause Analysis & Common Culprits
1. **Quota / Rate Limits (429 ResourceExhausted):**
   * Video models like \`veo-2.0-generate-001\` have strict queries-per-minute (QPM) limits (usually 1 concurrent video generation operation at a time).
2. **SDK Version Drift:**
   * Google recently migrated Video Generation APIs into the unified \`google-genai\` SDK. Older calls made via legacy packages fail with unrecognized parameters.
3. **Project API Activation:**
   * In Google AI Studio / Google Cloud Console, ensure the Generative Language API is active for the target Project ID.

---

#### 3. 🛠️ Step-by-Step Fix Instructions

##### Step 1: Upgrade Google GenAI SDK
Make sure you have the newest SDK release with Veo 2.0 streaming support:
\`\`\`bash
pip install --upgrade google-genai
\`\`\`

##### Step 2: Implement Exponential Backoff with Jitter
Instead of hammering the API repeatedly, wrap \`generate_videos\` in a retry loop:
\`\`\`python
import time
from google.genai.errors import APIError

def safe_generate_video(client, prompt, max_retries=3):
    delay = 15
    for attempt in range(max_retries):
        try:
            return client.models.generate_videos(
                model="veo-2.0-generate-001",
                prompt=prompt,
                config={"aspect_ratio": "16:9", "duration_seconds": 5}
            )
        except APIError as e:
            if "429" in str(e) or "ResourceExhausted" in str(e):
                print(f"[!] Quota throttled. Waiting {delay}s before retry {attempt + 1}/{max_retries}...")
                time.sleep(delay)
                delay *= 2
            else:
                raise e
    raise RuntimeError("Veo generation timed out after multiple retries.")
\`\`\`

##### Step 3: Verify Environment Variable
Check that your API key is correctly exported in your terminal:
\`\`\`bash
echo $GEMINI_API_KEY
# If empty, set it:
export GEMINI_API_KEY="your-google-ai-studio-api-key"
\`\`\`

##### Step 4: Run Sequential Clip Generation
Do not invoke multiple \`generate_videos\` calls simultaneously in a thread pool. Generate clip 1 $\\rightarrow$ poll until \`operation.done\` $\\rightarrow$ proceed to clip 2.`;

    case 'HR_Developer_Agent':
      return JSON.stringify({
        new_agent_name: "Audio_Restoration_Agent",
        new_agent_system_instruction: "You are the Audio_Restoration_Agent, a master audio engineer specializing in acoustic signal recovery, de-noising, vinyl de-crackling, and notch filtering. Your mission is to isolate guitar/vocal signals, eradicate 50Hz/60Hz AC hum, eliminate clicks/transients without introducing phase distortion, and return clean master-ready audio processing specs.",
        new_agent_task: "Apply dynamic spectral subtraction and a sharp 55Hz high-pass filter to eliminate the AC rumble and vinyl clicks from the acoustic guitar track intro, preserving the resonant 'Bear Voice' baritone fundamentals."
      }, null, 2);

    case 'Beat_Sync_Editor_Agent':
      return JSON.stringify([
        { index: 1, cut_duration: 4.5, downbeat_timestamp: "00:04.50", transition_reason: "Vocal intro completes, acoustic arpeggio hits downbeat on bar 4" },
        { index: 2, cut_duration: 3.8, downbeat_timestamp: "00:08.30", transition_reason: "First verse lyric onset starts, camera cuts to riverbank close-up" },
        { index: 3, cut_duration: 5.2, downbeat_timestamp: "00:13.50", transition_reason: "Resonant Bear Voice chorus swell cuts on drum snare accent" }
      ], null, 2);

    case 'Character_Continuity_Agent':
      return JSON.stringify({
        reference_frame_path: "output_clips/reference_scene_1.jpg",
        frame_timestamp_extracted: "00:04.50 (t=duration - 0.5s)",
        character_anchor: "Identical Bengali male singer, mid-30s, trimmed dark beard, deep warm brown eyes, wearing earthy brown knitted acoustic vest over linen rolled-sleeve shirt",
        wardrobe_and_palette: "Charcoal gray linen shirt, hand-knit wool vest, brass pocket watch chain, warm terracotta riverbank soil tones",
        lighting_continuity: "Golden dusk rim light, 35mm f/1.8 shallow depth of field, subtle film grain",
        augmented_prompt: "The singer strums an old acoustic guitar sitting near the riverbank at sunset, [CHARACTER LOCK: Bengali male singer, mid-30s, trimmed beard, earthy brown knitted acoustic vest, linen rolled-sleeve shirt], [LIGHTING CONTINUITY: golden dusk rim light, 35mm lens, 4k cinematic]"
      }, null, 2);

    case 'Shield_Safety_Agent':
      return JSON.stringify({
        shield_status: "ACTIVE_INTERVENTION",
        violations_detected: [
          "Trademarked Character: 'Batman' (DC Comics IP)",
          "Trademarked Character: 'Spider-Man' (Marvel IP)",
          "Protected Venue/IP: 'Disney Castle'",
          "Weaponry/Violence: 'laser gun fight'"
        ],
        original_prompt: "Batman and Spider-Man having a laser gun fight inside Disney castle at midnight, 4k cinematic",
        sanitized_safe_prompt: "Two enigmatic acrobatic vigilantes in dark stylized tactical suits having an intense cinematic encounter inside a grand gothic fairytale citadel at midnight, dramatic moonlight rays, atmospheric mist, cinematic 35mm lighting, 4k resolution",
        compliance_notes: "Rewritten to eliminate copyright liability, brand dilution, and violent gun references while preserving nocturnal gothic tension and dynamic cinematic scale."
      }, null, 2);

    default:
      return `### Sub-Agent Execution Output: [${agentId}]
**Task Executed:** ${taskPrompt}

#### Findings & Deliverables
1. Rigorous specialized execution completed according to domain parameters.
2. Formatted output generated with structured headings, actionable recommendations, and clean implementation guidelines.
3. Ready for Captain Agent synthesis.`;
  }
}

// 1. Captain Plan endpoint: analyzes user request and produces delegation JSON or direct answer
app.post('/api/captain-plan', async (req: Request, res: Response) => {
  const { userPrompt, systemPrompt, agents } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ error: 'userPrompt is required' });
  }

  const startTime = Date.now();

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Low temperature for strict protocol adherence
        },
      });

      const responseText = response.text || '';
      return res.json({
        rawText: responseText,
        durationMs: Date.now() - startTime,
        mode: 'gemini-api',
      });
    }

    // Fallback simulation
    const simulated = simulateCaptainPlan(userPrompt, agents);
    return res.json({
      rawText: simulated.text,
      durationMs: Date.now() - startTime,
      mode: 'simulation',
    });
  } catch (error: any) {
    console.error('Error in /api/captain-plan:', error);
    // If Gemini fails, gracefully fallback
    const simulated = simulateCaptainPlan(userPrompt, agents);
    return res.json({
      rawText: simulated.text,
      durationMs: Date.now() - startTime,
      mode: 'fallback_simulation',
      warning: error.message || 'Gemini API call failed, using intelligent simulation.',
    });
  }
});

// 2. Sub-agent execution endpoint
app.post('/api/execute-subagent', async (req: Request, res: Response) => {
  const { agentId, systemPrompt, taskPrompt, originalUserPrompt } = req.body;

  if (!agentId || !taskPrompt) {
    return res.status(400).json({ error: 'agentId and taskPrompt are required' });
  }

  const startTime = Date.now();

  try {
    if (ai) {
      const promptToSend = `User's overall goal: "${originalUserPrompt || 'N/A'}"\n\nYour specific delegated assignment from the Captain Agent:\n${taskPrompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptToSend,
        config: {
          systemInstruction: systemPrompt || `You are ${agentId}, a specialized expert. Execute the requested assignment thoroughly and professionally.`,
          temperature: 0.4,
        },
      });

      return res.json({
        agentId,
        output: response.text || '',
        durationMs: Date.now() - startTime,
        mode: 'gemini-api',
      });
    }

    // Simulated execution
    const output = simulateSubAgentExecution(agentId, taskPrompt, originalUserPrompt || '');
    return res.json({
      agentId,
      output,
      durationMs: Date.now() - startTime,
      mode: 'simulation',
    });
  } catch (error: any) {
    console.error(`Error executing sub-agent ${agentId}:`, error);
    const output = simulateSubAgentExecution(agentId, taskPrompt, originalUserPrompt || '');
    return res.json({
      agentId,
      output,
      durationMs: Date.now() - startTime,
      mode: 'fallback_simulation',
      warning: error.message,
    });
  }
});

// 3. Captain Synthesis endpoint
app.post('/api/captain-synthesize', async (req: Request, res: Response) => {
  const { userPrompt, subAgentResults } = req.body;

  if (!userPrompt || !Array.isArray(subAgentResults)) {
    return res.status(400).json({ error: 'userPrompt and subAgentResults are required' });
  }

  const startTime = Date.now();

  const formattedResults = subAgentResults
    .map((r: any) => `### Deliverable from [${r.agentId}]:\n${r.output}`)
    .join('\n\n---\n\n');

  const synthesisPrompt = `You are the Captain Agent. Your specialized sub-agents have executed their assigned tasks for the user's objective:
Original User Request: "${userPrompt}"

Below are the intermediate results from your specialized sub-agents:
${formattedResults}

### YOUR MANDATE:
Proceed to Step 3 of your workflow:
**Synthesize:** Combine, format, and present the final polished, unified, executive-grade deliverable to the user.
- Eliminate redundancies.
- Unify the voice into a cohesive, comprehensive master plan / deliverable.
- Acknowledge which specialized sub-agents contributed to each section.
- Use clear markdown typography: headings, callout quotes, tables, and code snippets where appropriate.
- Conclude with an executive summary and recommended immediate next steps.`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: synthesisPrompt,
        config: {
          systemInstruction: 'You are the Captain Agent, the master orchestrator. Synthesize the sub-agent deliverables into a masterwork.',
          temperature: 0.3,
        },
      });

      return res.json({
        synthesizedText: response.text || '',
        durationMs: Date.now() - startTime,
        mode: 'gemini-api',
      });
    }

    // Simulated synthesis
    const synthesizedText = `# Executive Master Plan & Synthesis
*Orchestrated by Captain Agent via Multi-Agent Collaboration*

---

### Executive Overview
To accomplish your objective—**"${userPrompt}"**—the Captain Agent decomposed the initiative and orchestrated specialized sub-agents in parallel:
${subAgentResults.map((r: any) => `- **${r.agentId}**: Completed quantitative & strategic deliverables.`).join('\n')}

---

${formattedResults}

---

### Master Execution Roadmap & Recommended Next Steps
1. **Immediate (Days 1–7):** Finalize landing copy and initialize the telemetry tracking schemas.
2. **Short-Term (Days 8–21):** Deploy the core API contracts and conduct the adversarial QA verification audit.
3. **Rollout (Days 22–30):** Launch public beta with automated cohort analytics and customer re-engagement flows.

*Synthesized and audited by Captain Agent.*`;

    return res.json({
      synthesizedText,
      durationMs: Date.now() - startTime,
      mode: 'simulation',
    });
  } catch (error: any) {
    console.error('Error in /api/captain-synthesize:', error);
    const synthesizedText = `# Synthesis Deliverable\n\n${formattedResults}\n\n*Synthesized by Captain Agent.*`;
    return res.json({
      synthesizedText,
      durationMs: Date.now() - startTime,
      mode: 'fallback_simulation',
      warning: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Captain Agent server running on http://0.0.0.0:${PORT} (Gemini API: ${apiKey ? 'Configured' : 'Simulated fallback'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
