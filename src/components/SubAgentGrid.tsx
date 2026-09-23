import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Bot, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, Terminal, Clapperboard, Palette, Film, Type, Music, ShieldCheck, ShieldAlert, Wrench, AlertTriangle, UserCheck, Camera, Shield, Download, Play } from 'lucide-react';
import { DelegationCommand, AgentConfig } from '../types/agent';
import { getAgentColorClasses } from '../utils/orchestratorHelper';
import { marked } from 'marked';
import { generateAndDownloadVideoClip } from '../utils/videoGenerator';

interface SubAgentGridProps {
  delegations: DelegationCommand[];
  agents: AgentConfig[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

export const SubAgentGrid: React.FC<SubAgentGridProps> = ({
  delegations,
  agents,
  selectedAgentId,
  onSelectAgent,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set(delegations.map((_, i) => i)));
  const [downloadingClipKey, setDownloadingClipKey] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSuccessKey, setDownloadSuccessKey] = useState<string | null>(null);

  const handleDownloadClip = async (
    key: string,
    title: string,
    prompt: string,
    subtitle = '',
    durationSeconds = 5,
    filename = 'scene_output.mp4'
  ) => {
    try {
      setDownloadingClipKey(key);
      setDownloadProgress(0);
      await generateAndDownloadVideoClip(
        {
          title,
          subtitle,
          prompt,
          durationSeconds: Math.min(Math.max(durationSeconds, 2), 10),
          width: 1280,
          height: 720,
          fps: 30,
          theme: 'monsoon',
        },
        filename,
        (p) => setDownloadProgress(p)
      );
      setDownloadSuccessKey(key);
      setTimeout(() => setDownloadSuccessKey(null), 3500);
    } catch (err) {
      console.error('Failed to download video clip:', err);
    } finally {
      setDownloadingClipKey(null);
      setDownloadProgress(0);
    }
  };

  const agentMap = new Map(agents.map(a => [a.id, a]));

  const toggleExpand = (index: number) => {
    const next = new Set(expandedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedIndices(next);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (delegations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          Specialized Sub-Agent Deliverables ({delegations.length})
        </h3>
        <span className="text-[11px] font-mono text-zinc-500">
          Isolated context execution
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {delegations.map((delegation, index) => {
          const agent = agentMap.get(delegation.target_agent);
          const colors = getAgentColorClasses(agent?.color || 'sky');
          const isExpanded = expandedIndices.has(index);
          const isSelected = selectedAgentId === delegation.target_agent;

          // Render markdown safely
          const htmlOutput = delegation.output ? marked.parse(delegation.output) : '';

          return (
            <div
              key={`${delegation.target_agent}-${index}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'bg-zinc-900/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700/80'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => {
                  toggleExpand(index);
                  onSelectAgent(delegation.target_agent);
                }}
                className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-zinc-950/40 hover:bg-zinc-950/70 border-b border-zinc-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${colors.badge}`}>
                    {delegation.target_agent === 'HR_Developer_Agent' ? (
                      <UserCheck className="w-4 h-4 text-purple-400" />
                    ) : delegation.target_agent === 'Beat_Sync_Editor_Agent' ? (
                      <Clock className="w-4 h-4 text-emerald-400" />
                    ) : delegation.target_agent === 'Character_Continuity_Agent' ? (
                      <Camera className="w-4 h-4 text-amber-400" />
                    ) : delegation.target_agent === 'Shield_Safety_Agent' ? (
                      <Shield className="w-4 h-4 text-indigo-400" />
                    ) : delegation.target_agent === 'Troubleshooting_Agent' ? (
                      <Wrench className="w-4 h-4 text-rose-400" />
                    ) : delegation.target_agent === 'Google_Video_Agent' ? (
                      <Film className="w-4 h-4 text-sky-400" />
                    ) : delegation.target_agent === 'Master_Music_Video_Director_Agent' ? (
                      <Clapperboard className="w-4 h-4 text-amber-400" />
                    ) : delegation.target_agent === 'Google_Music_Agent' ? (
                      <Music className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {agent ? agent.name : delegation.target_agent}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                        {delegation.target_agent}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                      {agent ? agent.roleDescription : 'Specialized agent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  {delegation.status === 'running' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-400 text-xs font-mono border border-sky-500/30 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Executing...
                    </span>
                  )}
                  {delegation.status === 'completed' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed {delegation.durationMs ? `(${(delegation.durationMs / 1000).toFixed(1)}s)` : ''}
                    </span>
                  )}
                  {delegation.status === 'pending' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
                      <Clock className="w-3 h-3" />
                      Queued
                    </span>
                  )}
                  {delegation.status === 'failed' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-mono border border-rose-500/30">
                      <AlertCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}

                  <button className="text-zinc-500 hover:text-zinc-300 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              {isExpanded && (
                <div className="p-5 space-y-4">
                  {/* Delegated Task Prompt Box */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs font-mono text-zinc-300">
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider block mb-1 font-semibold">
                      Instruction from Captain Agent:
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {delegation.task_prompt}
                    </p>
                  </div>

                  {/* Output content */}
                  {delegation.output ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                          Sub-Agent Output:
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(delegation.output || '', index);
                          }}
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition p-1 cursor-pointer"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Output</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div
                        className="prose prose-invert prose-sm max-w-none p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-zinc-200 leading-relaxed overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: htmlOutput as string }}
                      />

                      {/* If output is Song_Generator_Agent JSON, render a styled preview card */}
                      {(() => {
                        try {
                          const parsedJson = JSON.parse(delegation.output);
                          if (parsedJson && parsedJson.lyrics && parsedJson.song_style) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-950/20 via-zinc-900/80 to-zinc-950 border border-amber-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    Parsed Song Production Spec
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                    Audio-Gen Ready
                                  </span>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Production Musical Style (AI Prompt):
                                  </label>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-amber-200">
                                    {parsedJson.song_style}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Modern Bengali Lyrics:
                                  </label>
                                  <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sm font-sans text-zinc-100 whitespace-pre-wrap leading-relaxed">
                                    {parsedJson.lyrics}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.api_endpoint && parsedJson.payload) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-950/20 via-zinc-900/80 to-zinc-950 border border-purple-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-purple-400 flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                                    Formatted Music API Request Payload
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      {parsedJson.method || 'POST'} {parsedJson.api_endpoint}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                      Valid JSON
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Song Title:</span>
                                    <span className="font-semibold text-white">{parsedJson.payload.title}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Audio Configuration:</span>
                                    <span className="font-mono text-xs text-zinc-300">
                                      instrumental: {String(parsedJson.payload.make_instrumental)}, wait: {String(parsedJson.payload.wait_audio)}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    API Tags / Music Style:
                                  </label>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-purple-200">
                                    {parsedJson.payload.tags}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Full Machine-Readable JSON Payload:
                                  </label>
                                  <pre className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(parsedJson, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && Array.isArray(parsedJson.music_video_scenes)) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-950/20 via-zinc-900/80 to-zinc-950 border border-emerald-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    Cinematic Music Video Scenes Storyboard ({parsedJson.music_video_scenes.length} Scenes)
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                    Text-to-Video AI Ready
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  {parsedJson.music_video_scenes.map((scene: any, sIdx: number) => (
                                    <div key={sIdx} className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/90 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                                          {scene.section || `Scene ${sIdx + 1}`}
                                        </span>
                                        {scene.lyric_reference && (
                                          <span className="text-xs text-amber-300/90 italic font-sans max-w-[65%] truncate" title={scene.lyric_reference}>
                                            "{scene.lyric_reference}"
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800/80">
                                        <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1 font-semibold">Visual AI Prompt:</span>
                                        {scene.visual_prompt}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.api_endpoint && parsedJson.payload && parsedJson.payload.model && parsedJson.headers) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-rose-950/20 via-zinc-900/80 to-zinc-950 border border-rose-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                                    Alibaba Cloud DashScope (Wanx) Video Task Payload
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      {parsedJson.payload.model}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                      Async: enable
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Target Endpoint:</span>
                                    <span className="font-mono text-xs text-rose-300 break-all">{parsedJson.api_endpoint}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Parameters:</span>
                                    <span className="font-mono text-xs text-zinc-300">
                                      duration: {parsedJson.payload.parameters?.duration}s, res: {parsedJson.payload.parameters?.resolution}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Injected Video Generation Prompt:
                                  </label>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-200">
                                    {parsedJson.payload.input?.prompt}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Strict Machine-Readable JSON:
                                  </label>
                                  <pre className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(parsedJson, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.model && String(parsedJson.model).startsWith('veo') && parsedJson.prompt && parsedJson.config) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/20 via-zinc-900/80 to-zinc-950 border border-indigo-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                    Google Veo GenAI Video Task Specification
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      {parsedJson.model}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                      AI Studio / GenAI SDK
                                    </span>
                                  </div>
                                </div>

                                {/* Live Video Preview & Download Option */}
                                <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                      <Film className="w-4 h-4 text-indigo-400" />
                                      Generated Veo Video Clip
                                    </h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5">
                                      Format: MP4 ({parsedJson.config.resolution || '720p'} · {parsedJson.config.duration_seconds || 5}s · {parsedJson.config.aspect_ratio || '16:9'})
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDownloadClip(
                                      `veo-single-${index}`,
                                      'Veo Cinematic Scene',
                                      parsedJson.prompt || '',
                                      '',
                                      parsedJson.config.duration_seconds || 5,
                                      `veo_scene_${index + 1}.mp4`
                                    )}
                                    disabled={downloadingClipKey === `veo-single-${index}`}
                                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed self-start sm:self-auto"
                                    title="Download generated MP4 video clip"
                                  >
                                    {downloadingClipKey === `veo-single-${index}` ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Rendering {downloadProgress}%...</span>
                                      </>
                                    ) : downloadSuccessKey === `veo-single-${index}` ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                                        <span>Downloaded!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download Video (.mp4)</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Aspect Ratio:</span>
                                    <span className="font-semibold text-white">{parsedJson.config.aspect_ratio || '16:9'}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Duration:</span>
                                    <span className="font-semibold text-indigo-300">{parsedJson.config.duration_seconds || 5}s</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">Resolution:</span>
                                    <span className="font-semibold text-emerald-300">{parsedJson.config.resolution || '720p'}</span>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Google Veo Visual Prompt:
                                  </label>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-200">
                                    {parsedJson.prompt}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                                    Strict SDK JSON Payload:
                                  </label>
                                  <pre className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(parsedJson, null, 2)}
                                  </pre>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-indigo-400" />
                                      Python SDK Runner (client.models.generate_videos)
                                    </span>
                                    <span className="text-[10px] font-mono text-indigo-300">veo-2.0-generate-001</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`from google import genai
from google.genai import types
import time

client = genai.Client()
operation = client.models.generate_videos(
    model="${parsedJson.model || 'veo-2.0-generate-001'}",
    prompt=veo_prompt,
    config=types.GenerateVideosConfig(
        aspect_ratio="${parsedJson.config?.aspect_ratio || '16:9'}",
        duration_seconds=${parsedJson.config?.duration_seconds || 5},
        resolution="${parsedJson.config?.resolution || '720p'}"
    )
)
while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

video = operation.result.generated_videos[0].video
client.files.download(file=video)
video.save("scene_output.mp4")`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.visual_theme && parsedJson.master_style_suffix) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-950/20 via-zinc-900/80 to-zinc-950 border border-purple-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-purple-400 flex items-center gap-2">
                                    <Clapperboard className="w-3.5 h-3.5 text-purple-400" />
                                    Art Director Visual Style Bible
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      Cinematic Continuity Anchor
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-purple-400 block mb-0.5 font-semibold">Visual Theme:</span>
                                    <span className="font-semibold text-white">{parsedJson.visual_theme}</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-amber-400 block mb-0.5 font-semibold">Color Palette:</span>
                                    <span className="text-zinc-300">{parsedJson.color_palette}</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
                                  <span className="text-[10px] font-mono text-sky-400 block mb-1 font-semibold uppercase tracking-wider">
                                    Persistent Character DNA:
                                  </span>
                                  <p className="text-zinc-200">{parsedJson.character_dna}</p>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 font-semibold">
                                    Master Style Suffix (Appended to Every Scene):
                                  </label>
                                  <div className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-xs text-emerald-300">
                                    {parsedJson.master_style_suffix}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.timeline && Array.isArray(parsedJson.timeline)) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-950/20 via-zinc-900/80 to-zinc-950 border border-amber-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                                    <Film className="w-3.5 h-3.5 text-amber-400" />
                                    Storyboard Sequential Timeline ({parsedJson.total_scenes || parsedJson.timeline.length} Scenes × {parsedJson.scene_duration_sec || 5}s)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      5s Fixed Blocks
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  {parsedJson.timeline.map((item: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            #{item.scene_index || idx + 1}
                                          </span>
                                          <span className="text-[11px] font-mono text-zinc-400">
                                            {item.timestamp || `${idx * 5}:00 - ${(idx + 1) * 5}:00`}
                                          </span>
                                        </div>
                                        {item.lyric_segment ? (
                                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                                            ♫ {item.lyric_segment}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-mono text-zinc-500 italic">
                                            [Instrumental / No Lyrics]
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-zinc-300 text-[11px]">
                                        <span className="text-amber-400/80 font-mono text-[10px] uppercase font-semibold mr-1.5">Action:</span>
                                        {item.action_description}
                                      </p>
                                      {item.final_video_prompt && (
                                        <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800/60 font-mono text-[10px] text-zinc-400">
                                          <span className="text-emerald-400 uppercase font-bold mr-1 block text-[9px] mb-0.5">Veo Model Prompt:</span>
                                          {item.final_video_prompt}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.formatted_subtitles && Array.isArray(parsedJson.formatted_subtitles)) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-950/20 via-zinc-900/80 to-zinc-950 border border-emerald-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-emerald-400" />
                                    Formatted Bengali Subtitles ({parsedJson.formatted_subtitles.length} Scenes)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      Mobile & Landscape Safe (\n Balanced)
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {parsedJson.formatted_subtitles.map((sub: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                          Scene #{sub.scene_index || idx + 1}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-500">
                                          {sub.subtitle_text ? `${sub.subtitle_text.split('\n').length} line(s)` : 'Instrumental'}
                                        </span>
                                      </div>
                                      {sub.subtitle_text ? (
                                        <div className="p-2.5 rounded bg-black/60 border border-emerald-500/20 text-center font-medium text-emerald-300 text-sm whitespace-pre-line leading-relaxed">
                                          {sub.subtitle_text}
                                        </div>
                                      ) : (
                                        <div className="p-2.5 rounded bg-zinc-900/40 text-center text-xs text-zinc-600 italic">
                                          [No on-screen lyrics]
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.model && typeof parsedJson.model === 'string' && parsedJson.model.includes('lyria')) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-rose-950/20 via-zinc-900/80 to-zinc-950 border border-rose-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-2">
                                    <Music className="w-3.5 h-3.5 text-rose-400" />
                                    Google Lyria Music Model Payload
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      {parsedJson.model}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-500 block">Duration</span>
                                    <span className="font-semibold text-white">{parsedJson.config?.duration_seconds || 180}s</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-500 block">Instrumental Only</span>
                                    <span className="font-semibold text-white">{parsedJson.config?.instrumental_only ? 'true' : 'false (Vocals Enabled)'}</span>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1 font-semibold">
                                    Lyria Audio & Lyric Generation Prompt:
                                  </label>
                                  <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-xs text-rose-200/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                                    {parsedJson.prompt}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-rose-400" />
                                      Python SDK Runner (google-genai)
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500">models.generate_audio</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`from google import genai
from google.genai import types

client = genai.Client()
operation = client.models.generate_audio(
    model="${parsedJson.model || 'lyria-3.5-generate'}",
    prompt=lyria_prompt,
    config=types.GenerateAudioConfig(
        duration_seconds=${parsedJson.config?.duration_seconds || 180},
        instrumental_only=${parsedJson.config?.instrumental_only ? 'True' : 'False'}
    )
)`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.new_agent_name && parsedJson.new_agent_system_instruction) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-950/30 via-zinc-900/90 to-zinc-950 border border-purple-500/40 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-purple-400 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-purple-400" />
                                    Dynamic Specialist Onboarded: {parsedJson.new_agent_name}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                                    AUTONOMOUS HIRE
                                  </span>
                                </div>

                                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                                  <span className="text-[10px] font-mono text-purple-300 uppercase font-semibold block">
                                    Hired Specialist System Instructions:
                                  </span>
                                  <p className="text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                                    {parsedJson.new_agent_system_instruction}
                                  </p>
                                </div>

                                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                                  <span className="text-[10px] font-mono text-amber-300 uppercase font-semibold block">
                                    Immediate Execution Task:
                                  </span>
                                  <p className="text-xs text-zinc-300 leading-relaxed">
                                    {parsedJson.new_agent_task}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-purple-400" />
                                      Dynamic Agent Provisioning & Execution Runner
                                    </span>
                                    <span className="text-[10px] font-mono text-purple-300">hire_new_agent()</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`# 1. HR Agent designs specialist blueprint
blueprint = json.loads(client.models.generate_content(
    model="gemini-2.5-pro",
    contents=f"Problem: {problem}\\nData: {data}",
    config=types.GenerateContentConfig(system_instruction=HR_SYSTEM_PROMPT, response_mime_type="application/json")
).text)

# 2. Run dynamically hired specialist on the fly
result = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=blueprint['new_agent_task'],
    config=types.GenerateContentConfig(system_instruction=blueprint['new_agent_system_instruction'])
)
print(f"[{blueprint['new_agent_name']} Completed Task]:", result.text)`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (Array.isArray(parsedJson) && parsedJson.length > 0 && typeof parsedJson[0].cut_duration === 'number') {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-950/25 via-zinc-900/90 to-zinc-950 border border-emerald-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    Multimodal Beat-Sync Cut Timeline ({parsedJson.length} Scenes)
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                    BEAT-ALIGNED
                                  </span>
                                </div>

                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                  {parsedJson.map((item: any, idx: number) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-300 font-semibold">
                                          Scene #{item.index || idx + 1}
                                        </span>
                                        <span className="text-zinc-300 text-xs">
                                          {item.transition_reason || 'Rhythmic downbeat cut'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 font-mono">
                                        {item.downbeat_timestamp && (
                                          <span className="text-[10px] text-zinc-500">
                                            @{item.downbeat_timestamp}
                                          </span>
                                        )}
                                        <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                                          {item.cut_duration}s
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-emerald-400" />
                                      Multimodal Audio Listening (Google Files API)
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-300">get_beat_synced_timeline()</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`# 1. Upload audio to Gemini 2.5 Pro multimodal audio engine
audio_file = client.files.upload(file=audio_path)
while audio_file.state.name == "PROCESSING": time.sleep(2); audio_file = client.files.get(name=audio_file.name)

# 2. Extract downbeat-aligned cut duration list
beat_data = json.loads(client.models.generate_content(
    model="gemini-2.5-pro",
    contents=[sync_prompt, audio_file],
    config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
).text)
client.files.delete(name=audio_file.name)`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && parsedJson.character_anchor && parsedJson.augmented_prompt) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-zinc-900/90 to-zinc-950 border border-amber-500/40 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-amber-400" />
                                    Visual Continuity & Character Lock
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                    FRAME EXTRACTION (t = duration - 0.5s)
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase block">Locked Character Anchor</span>
                                    <p className="text-zinc-200 leading-relaxed text-xs">
                                      {parsedJson.character_anchor}
                                    </p>
                                  </div>

                                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase block">Lighting & Camera Continuity</span>
                                    <p className="text-zinc-300 leading-relaxed text-xs">
                                      {parsedJson.lighting_continuity || parsedJson.wardrobe_and_palette}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] font-mono text-amber-300 uppercase font-semibold block mb-1">
                                    Next Scene Augmented Prompt (Injected with Continuity Lock):
                                  </span>
                                  <div className="p-3 rounded-lg bg-zinc-950/90 border border-amber-500/25 font-mono text-xs text-amber-200/90 leading-relaxed">
                                    {parsedJson.augmented_prompt}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-amber-400" />
                                      MoviePy Frame Grabber & Continuity Engine
                                    </span>
                                    <span className="text-[10px] font-mono text-amber-300">extract_reference_frame()</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`# 1. Grab reference frame 0.5s before end of Scene 1
clip = VideoFileClip("output_clips/scene_1.mp4")
frame_time = max(0, clip.duration - 0.5)
clip.save_frame("ref_scene_1.jpg", t=frame_time)
clip.close()

# 2. Attach visual reference image directly to Veo 2.0 prompt
import PIL.Image
ref_img = PIL.Image.open("ref_scene_1.jpg")
operation = client.models.generate_videos(
    model="veo-2.0-generate-001",
    prompt=[prompt_text, ref_img],
    config=types.GenerateVideosConfig(aspect_ratio="16:9", duration_seconds=5)
)`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && (parsedJson.shield_status || parsedJson.sanitized_safe_prompt)) {
                            const isIntervention = parsedJson.shield_status === "ACTIVE_INTERVENTION";
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 via-zinc-900/90 to-zinc-950 border border-indigo-500/40 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-400" />
                                    Veo Pre-Flight Safety Shield
                                  </span>
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isIntervention ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                    {isIntervention ? 'POLICY REWRITE APPLIED' : 'PASSED PRE-FLIGHT'}
                                  </span>
                                </div>

                                {parsedJson.violations_detected && parsedJson.violations_detected.length > 0 && (
                                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                                    <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                      Safety Violations Neutralized Before API Call
                                    </span>
                                    <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-0.5">
                                      {parsedJson.violations_detected.map((v: string, vIdx: number) => (
                                        <li key={vIdx} className="font-mono text-[11px]">{v}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase block">Original Raw Prompt</span>
                                    <p className="text-zinc-400 text-xs font-mono line-through opacity-80 leading-relaxed">
                                      {parsedJson.original_prompt}
                                    </p>
                                  </div>

                                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                                    <span className="text-[10px] font-mono text-indigo-300 font-semibold uppercase block">Veo Compliant Safe Prompt</span>
                                    <p className="text-indigo-100 text-xs font-mono font-medium leading-relaxed">
                                      {parsedJson.sanitized_safe_prompt}
                                    </p>
                                  </div>
                                </div>

                                {parsedJson.compliance_notes && (
                                  <p className="text-[11px] text-zinc-400 italic">
                                    💡 {parsedJson.compliance_notes}
                                  </p>
                                )}

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-indigo-400" />
                                      Gemini 2.5 Pro Safety Pre-Flight Hook
                                    </span>
                                    <span className="text-[10px] font-mono text-indigo-300">sanitize_video_prompt()</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`# 1. Screen and rewrite any IP or trademark violation
safe_prompt = sanitize_video_prompt(scene["video_prompt"])

# 2. Veo 2.0 generates without triggering safety blocks
operation = client.models.generate_videos(
    model="veo-2.0-generate-001",
    prompt=safe_prompt,
    config=types.GenerateVideosConfig(aspect_ratio="16:9", duration_seconds=5)
)`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }

                          if (parsedJson && typeof parsedJson.score === 'number' && typeof parsedJson.pass === 'boolean') {
                            const isPass = parsedJson.pass;
                            return (
                              <div className={`mt-4 p-4 rounded-xl bg-gradient-to-br ${isPass ? 'from-teal-950/20 border-teal-500/30' : 'from-rose-950/20 border-rose-500/30'} via-zinc-900/80 to-zinc-950 border space-y-3`}>
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className={`text-xs font-semibold ${isPass ? 'text-teal-400' : 'text-rose-400'} flex items-center gap-2`}>
                                    {isPass ? <ShieldCheck className="w-4 h-4 text-teal-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
                                    Video Quality Control (QC) Audit
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${isPass ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                                      {isPass ? 'PASS' : 'FAIL'} (Score: {parsedJson.score}/10)
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs">
                                    <span className="text-zinc-400 text-[10px] font-mono uppercase block font-semibold mb-1">Audit Evaluation:</span>
                                    <p className="text-zinc-200 leading-relaxed">{parsedJson.reason}</p>
                                  </div>

                                  {parsedJson.retry_suggestion && (
                                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs">
                                      <span className="text-amber-400 text-[10px] font-mono uppercase block font-semibold mb-1">Suggested Prompt Re-roll Adjustment:</span>
                                      <p className="text-amber-200 font-mono text-[11px] leading-relaxed">{parsedJson.retry_suggestion}</p>
                                    </div>
                                  )}

                                  <div className="pt-2 border-t border-zinc-800/80">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                        <Terminal className="w-3 h-3 text-teal-400" />
                                        Multimodal Files API & Grading Runner
                                      </span>
                                      <span className="text-[10px] font-mono text-teal-300">gemini-2.5-pro</span>
                                    </div>
                                    <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`# 1. Upload video clip to Google Files API
video_file = client.files.upload(file=video_path)
while video_file.state.name == "PROCESSING":
    time.sleep(2)
    video_file = client.files.get(name=video_file.name)

# 2. Multimodal grading with Gemini 2.5 Pro
response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=[f"Evaluate video clip against prompt: '{prompt}'", video_file],
    config=types.GenerateContentConfig(response_mime_type="application/json")
)
client.files.delete(name=video_file.name) # Clean up server storage`}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          const scenesList = parsedJson.veo_video_scenes || parsedJson.scenes;
                          const styleBible = parsedJson.visual_style || parsedJson.master_style_suffix;

                          if (parsedJson && parsedJson.song_title && Array.isArray(scenesList)) {
                            return (
                              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-950/25 via-zinc-900/90 to-zinc-950 border border-amber-500/30 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                                    <Clapperboard className="w-4 h-4 text-amber-400" />
                                    Master Music Video Production Blueprint
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {parsedJson.song_title}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase block">Original Bengali Lyrics</span>
                                    <div className="font-medium text-zinc-200 text-xs whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto pr-1">
                                      {parsedJson.bengali_lyrics}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase block">Google Lyria Audio Prompt</span>
                                    <div className="font-mono text-zinc-300 text-[11px] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pr-1">
                                      {parsedJson.lyria_audio_prompt}
                                    </div>
                                  </div>
                                </div>

                                {styleBible && (
                                  <div className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-xs">
                                    <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase block mb-1">
                                      Visual Style Bible / Master Style Suffix
                                    </span>
                                    <p className="font-mono text-[11px] text-zinc-300 italic">
                                      "{styleBible}"
                                    </p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">
                                      5-Second Veo Storyboard Scenes ({scenesList.length} Clips)
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400">
                                      veo-2.0-generate-001
                                    </span>
                                  </div>
                                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {scenesList.map((scene: any, idx: number) => {
                                      const sceneKey = `scene-clip-${idx + 1}`;
                                      const isDownloadingThis = downloadingClipKey === sceneKey;
                                      const isSuccessThis = downloadSuccessKey === sceneKey;

                                      return (
                                        <div key={idx} className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800/80 space-y-2 text-xs">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-semibold">
                                                {scene.time || `Scene #${scene.index || idx + 1} (5s)`}
                                              </span>
                                              {scene.lyric_segment && (
                                                <span className="text-[11px] text-emerald-400 font-medium truncate max-w-[200px]">
                                                  ♪ {scene.lyric_segment}
                                                </span>
                                              )}
                                            </div>

                                            {/* Download Video Clip Button */}
                                            <button
                                              type="button"
                                              onClick={() => handleDownloadClip(
                                                sceneKey,
                                                `Scene ${scene.index || idx + 1}: ${parsedJson.song_title || 'Music Video'}`,
                                                scene.video_prompt || '',
                                                scene.lyric_segment || '',
                                                5,
                                                `scene_${scene.index || idx + 1}.mp4`
                                              )}
                                              disabled={isDownloadingThis}
                                              className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-mono text-[10px] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                              title={`Download Scene #${scene.index || idx + 1} video clip (.mp4)`}
                                            >
                                              {isDownloadingThis ? (
                                                <>
                                                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                                  <span>{downloadProgress}%</span>
                                                </>
                                              ) : isSuccessThis ? (
                                                <>
                                                  <Check className="w-3 h-3 text-emerald-400" />
                                                  <span className="text-emerald-400">Downloaded</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Download className="w-3 h-3 text-amber-400" />
                                                  <span>Download MP4</span>
                                                </>
                                              )}
                                            </button>
                                          </div>
                                          <p className="text-[11px] text-zinc-300 font-mono leading-relaxed">
                                            {scene.video_prompt}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 font-semibold">
                                      <Terminal className="w-3 h-3 text-amber-400" />
                                      Bear Voice Music Video Python Pipeline (Gemini 2.5 Pro → Veo 2.0 → MoviePy)
                                    </span>
                                    <span className="text-[10px] font-mono text-amber-300">gemini-2.5-pro + veo-2.0</span>
                                  </div>
                                  <pre className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
{`import json, os, time
from google import genai
from google.genai import types

# 1. Plan with Bear Voice: Gemini 2.5 Pro
client = genai.Client()
plan = json.loads(client.models.generate_content(
    model="gemini-2.5-pro",
    contents="User Command: romantic evening by the river",
    config=types.GenerateContentConfig(
        system_instruction=CAPTAIN_SYSTEM_INSTRUCTION, # 'Bear Voice' deep baritone
        response_mime_type="application/json"
    )
).text)

# 2. Render Clips with Auto-Retry (3 Attempts + 15s Cooldown) & Auto-Troubleshooter
downloaded_files = []
scenes = plan.get("scenes", plan.get("veo_video_scenes", []))
max_retries = 3

for scene in scenes:
    idx = scene.get("index", 1)
    prompt = scene["video_prompt"]
    file_path = f"output_clips/scene_{idx}.mp4"

    if os.path.exists(file_path):
        print(f"Scene {idx} already exists. Skipping.")
        downloaded_files.append({"file": file_path, "index": idx, "lyric": scene.get("lyric_segment", "")})
        continue

    # 🛡️ THE SAFETY SHIELD INTERCEPTION
    safe_prompt_text = sanitize_video_prompt(raw_prompt_text)

    # Prepare multimodal prompt (Text + Reference Image)
    if reference_image_path and os.path.exists(reference_image_path):
        import PIL.Image
        ref_img = PIL.Image.open(reference_image_path)
        api_prompt = [safe_prompt_text, ref_img]
    else:
        api_prompt = safe_prompt_text

    for attempt in range(1, max_retries + 1):
        try:
            print(f"Submitting Scene {idx}/{len(scenes)} (Attempt {attempt}/{max_retries})...")
            operation = client.models.generate_videos(
                model="veo-2.0-generate-001",
                prompt=api_prompt,
                config=types.GenerateVideosConfig(aspect_ratio="16:9", duration_seconds=5)
            )
            while not operation.done:
                time.sleep(10)
                operation = client.operations.get(operation)

            video_result = operation.result.generated_videos[0]
            client.files.download(file=video_result.video)
            video_result.video.save(file_path)
            downloaded_files.append({"file": file_path, "lyric": scene.get("lyric_segment", "")})
            print(f"Success! Saved Scene {idx}.")
            break
        except Exception as e:
            if attempt < max_retries:
                print(f"⚠️ Error during generation: {e}")
                print(f"Cooling down for 15 seconds before Attempt {attempt + 1}...")
                time.sleep(15)  # Rate limit cooldown
            else:
                print(f"❌ Failed to generate Scene {idx} after {max_retries} attempts.")
                ask_troubleshooting_agent(str(e))
                print("Skipping this scene and moving to the next one to save the project...")

# 3. Beat-Sync Alignment & MoviePy Audio Multiplexing
# beat_data = get_beat_synced_timeline("song.mp3", plan)
# stitch_final_video_with_beats(downloaded_files, "song.mp3", beat_data)`}
                                  </pre>
                                </div>
                              </div>
                            );
                          }
                        } catch {
                          return null;
                        }
                        return null;
                      })()}
                    </div>
                  ) : delegation.status === 'running' ? (
                    <div className="py-8 text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
                      <p className="text-xs text-zinc-400 font-mono">
                        Executing specialized prompt...
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
