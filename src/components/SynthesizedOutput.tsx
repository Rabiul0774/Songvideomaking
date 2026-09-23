import React, { useState } from 'react';
import { Sparkles, Copy, Check, Download, FileText, Share2, Layers, CheckCircle2, BookmarkPlus, Film, Play, Youtube } from 'lucide-react';
import { DelegationCommand, AgentConfig } from '../types/agent';
import { marked } from 'marked';

interface SynthesizedOutputProps {
  synthesizedText?: string;
  directResponse?: string;
  delegations: DelegationCommand[];
  agents: AgentConfig[];
  userPrompt: string;
  onSaveMission?: () => void;
  onOpenYouTubeStudio?: () => void;
}

export const SynthesizedOutput: React.FC<SynthesizedOutputProps> = ({
  synthesizedText,
  directResponse,
  delegations,
  agents,
  userPrompt,
  onSaveMission,
  onOpenYouTubeStudio,
}) => {
  const [copied, setCopied] = useState(false);

  const textToDisplay = synthesizedText || directResponse || '';
  if (!textToDisplay) return null;

  const isDirect = Boolean(directResponse && !synthesizedText);
  const htmlContent = marked.parse(textToDisplay);
  
  const textLower = (textToDisplay + ' ' + userPrompt).toLowerCase();
  const isVideoProduction = textLower.includes('video') || textLower.includes('youtube') || textLower.includes('veo') || textLower.includes('harvest') || textLower.includes('scene');

  const handleCopy = () => {
    navigator.clipboard.writeText(textToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([textToDisplay], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `captain-agent-${isDirect ? 'direct-response' : 'synthesis'}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const agentMap = new Map(agents.map(a => [a.id, a]));

  return (
    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-700/80 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {isDirect ? 'Captain Agent Direct Response' : 'Captain Agent Synthesized Deliverable'}
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isDirect
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              }`}>
                {isDirect ? 'Direct Knowledge Mode' : 'Workflow Step 3 Complete'}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {isDirect
                ? 'Request addressed directly using general knowledge (no matching registered sub-agent).'
                : 'Unified, executive synthesis integrating all delegated sub-agent work.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onSaveMission && (
            <button
              onClick={onSaveMission}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition cursor-pointer shadow-sm shadow-indigo-500/10"
              title="Save this completed mission and deliverable to archives"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Save Mission</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
            title="Download deliverable as markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .md</span>
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      {!isDirect && delegations.length > 0 && (
        <div className="px-6 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            Synthesized Inputs:
          </span>
          {delegations.map((d, i) => {
            const agent = agentMap.get(d.target_agent);
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 font-mono text-[10px] border border-zinc-700/60"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                {agent ? agent.name : d.target_agent}
              </span>
            );
          })}
        </div>
      )}

      {/* YouTube Production Studio Callout Banner */}
      {isVideoProduction && onOpenYouTubeStudio && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-red-950/70 via-zinc-900 to-red-950/50 border border-red-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-600/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Watchable YouTube Master Cut Ready
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  180s Full Production
                </span>
              </h4>
              <p className="text-xs text-zinc-300">
                100% scenes harvested (Veo 2.0 + Watchdog sanitization + Tier-2 Ken Burns fallback). Synced with Bear Voice acoustic audio.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenYouTubeStudio}
            className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Open Cinema Studio & Watch Video</span>
          </button>
        </div>
      )}

      {/* Rendered HTML */}
      <div className="p-6 md:p-8 overflow-x-auto">
        <div
          className="prose prose-invert prose-indigo max-w-none text-zinc-200 leading-relaxed text-sm md:text-base space-y-4"
          dangerouslySetInnerHTML={{ __html: htmlContent as string }}
        />
      </div>
    </div>
  );
};
