import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Trash2, 
  Download, 
  Search, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  Bot, 
  Calendar, 
  Layers, 
  FileText, 
  ChevronRight, 
  Tag, 
  Clock, 
  AlertTriangle,
  FolderArchive,
  ArrowRight,
  Zap,
  CheckSquare,
  BarChart3,
  List
} from 'lucide-react';
import { SavedMission, exportMissionJson, exportAllMissionsJson } from '../utils/missionStorage';
import { AgentConfig } from '../types/agent';
import { PastMissionsAnalytics } from './PastMissionsAnalytics';

interface PastMissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  missions: SavedMission[];
  currentMissionId?: string | null;
  onReloadMission: (mission: SavedMission) => void;
  onDeleteMission: (id: string) => void;
  onClearAllMissions: () => void;
  agents: AgentConfig[];
  onOpenSaveModal: () => void;
}

export const PastMissionsDrawer: React.FC<PastMissionsDrawerProps> = ({
  isOpen,
  onClose,
  missions,
  currentMissionId,
  onReloadMission,
  onDeleteMission,
  onClearAllMissions,
  agents,
  onOpenSaveModal,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<'all' | 'completed' | 'direct_answered' | 'other'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Agent Map for display
  const agentMap = useMemo(() => new Map(agents.map(a => [a.id, a])), [agents]);

  // Aggregate all unique tags across saved missions with frequency count
  const allUniqueTags = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    missions.forEach(m => {
      (m.tags || []).forEach(rawTag => {
        const clean = rawTag.trim();
        if (clean) {
          tagCountMap.set(clean, (tagCountMap.get(clean) || 0) + 1);
        }
      });
    });
    return Array.from(tagCountMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [missions]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTagFilters = () => {
    setSelectedTags([]);
  };

  // Filtered and searched missions
  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      // Phase filter
      if (filterPhase === 'completed' && m.phase !== 'completed') return false;
      if (filterPhase === 'direct_answered' && m.phase !== 'direct_answered') return false;
      if (filterPhase === 'other' && (m.phase === 'completed' || m.phase === 'direct_answered')) return false;

      // Tag filter: mission must include all selected tags
      if (selectedTags.length > 0) {
        const missionTagsLower = (m.tags || []).map(t => t.toLowerCase());
        const hasAllSelectedTags = selectedTags.every(st => 
          missionTagsLower.includes(st.toLowerCase())
        );
        if (!hasAllSelectedTags) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchPrompt = m.userPrompt.toLowerCase().includes(q);
      const matchDeliverable = (m.synthesizedDeliverable || '').toLowerCase().includes(q);
      const matchDirect = (m.directResponse || '').toLowerCase().includes(q);
      const matchAgent = m.agentIds.some(id => id.toLowerCase().includes(q));
      const matchTag = (m.tags || []).some(t => t.toLowerCase().includes(q));

      return matchTitle || matchPrompt || matchDeliverable || matchDirect || matchAgent || matchTag;
    });
  }, [missions, searchQuery, filterPhase, selectedTags]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Right side) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-xl bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-5 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Mission Archives
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/40">
                      {missions.length} Saved
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Review past orchestrated sessions, visualize metrics, or reload deliverables.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  title="Close Archives (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View Mode Tabs: Saved Missions vs Analytics Dashboard */}
            <div className="flex items-center gap-1.5 mt-3 p-1 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <List className="w-3.5 h-3.5 text-zinc-400" />
                <span>Saved Missions ({missions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics Dashboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            {/* Search and Filters only in List Mode */}
            {activeTab === 'list' && (
              <>
                {/* Search Input */}
                <div className="relative mt-3">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by prompt, title, agent, or tag..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Pills & Bulk Actions */}
                <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <button
                      onClick={() => setFilterPhase('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                        filterPhase === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      All ({missions.length})
                    </button>
                    <button
                      onClick={() => setFilterPhase('completed')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                        filterPhase === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setFilterPhase('direct_answered')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                        filterPhase === 'direct_answered'
                          ? 'bg-teal-600 text-white'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Direct Answer
                    </button>
                  </div>

                  {/* Bulk actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportAllMissionsJson}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                      title="Export all saved missions as JSON"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Export All</span>
                    </button>
                  </div>
                </div>

                {/* Tag Filter Bar */}
                {allUniqueTags.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-mono flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        <span>Filter by Tag:</span>
                        {selectedTags.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px]">
                            {selectedTags.length} active
                          </span>
                        )}
                      </span>

                      {selectedTags.length > 0 && (
                        <button
                          onClick={handleClearTagFilters}
                          className="text-[11px] text-zinc-400 hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <span>Clear tags</span>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Horizontal Scrollable Tag Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {allUniqueTags.map(([tag, count]) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/30'
                                : 'bg-zinc-950/90 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                            }`}
                            title={isSelected ? `Click to remove "${tag}" filter` : `Click to filter by "${tag}" (${count} missions)`}
                          >
                            <span>#{tag}</span>
                            <span className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                              isSelected ? 'bg-indigo-800 text-white' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {count}
                            </span>
                            {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Body: Analytics Dashboard or Missions List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'analytics' ? (
              <PastMissionsAnalytics 
                missions={missions} 
                agents={agents} 
              />
            ) : filteredMissions.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-400">
                  {selectedTags.length > 0 ? (
                    <Tag className="w-6 h-6 text-indigo-400" />
                  ) : (
                    <Bookmark className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {selectedTags.length > 0
                    ? `No missions with tag${selectedTags.length > 1 ? 's' : ''}: ${selectedTags.map(t => `#${t}`).join(', ')}`
                    : searchQuery
                    ? 'No matching missions found'
                    : 'No saved missions yet'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {selectedTags.length > 0
                    ? 'No archived missions match all active tag criteria. Try unselecting tags or clearing filters.'
                    : searchQuery
                    ? `No missions matching "${searchQuery}". Try a different keyword.`
                    : 'Save your current orchestration session (prompt, plan, sub-agent results, deliverable) to reload it anytime.'}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  {selectedTags.length > 0 && (
                    <button
                      onClick={handleClearTagFilters}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                    >
                      Clear Tag Filters
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                  {missions.length === 0 && (
                    <button
                      onClick={onOpenSaveModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Current Workspace</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredMissions.map((mission) => {
                const isActive = currentMissionId === mission.id;
                const completedCount = mission.delegations.filter(d => d.status === 'completed').length;
                const hasDeliverable = Boolean(mission.synthesizedDeliverable);

                return (
                  <div
                    key={mission.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isActive
                        ? 'bg-zinc-950/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                        : 'bg-zinc-950/60 border-zinc-800/90 hover:border-zinc-700/90 hover:bg-zinc-950/80'
                    }`}
                  >
                    {/* Card Top Header */}
                    <div className="p-4 border-b border-zinc-850 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {mission.title}
                          </h4>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-medium border border-indigo-500/40">
                              Active in Workspace
                            </span>
                          )}
                        </div>

                        {/* Timestamp & Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {formatDate(mission.createdAt)}
                          </span>

                          <span className="text-zinc-600">•</span>

                          <span className="flex items-center gap-1 capitalize">
                            {mission.mode === 'auto' ? (
                              <Zap className="w-3 h-3 text-indigo-400" />
                            ) : (
                              <CheckSquare className="w-3 h-3 text-amber-400" />
                            )}
                            {mission.mode}
                          </span>

                          <span className="text-zinc-600">•</span>

                          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${
                            mission.phase === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : mission.phase === 'direct_answered'
                              ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {mission.phase.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Icons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => exportMissionJson(mission)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                          title="Export mission JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMissionToDelete(mission.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                          title="Delete from archives"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content: Prompt Quote */}
                    <div className="p-4 space-y-3">
                      <div className="text-xs text-zinc-300 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850 line-clamp-2">
                        "{mission.userPrompt}"
                      </div>

                      {/* Delegated Agents Badges */}
                      {mission.delegations.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            Swarm Specialists ({mission.delegations.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {mission.delegations.map((d, i) => {
                              const agent = agentMap.get(d.target_agent);
                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 text-[10px] font-mono border border-zinc-700/60"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    d.status === 'completed' ? 'bg-emerald-400' : 'bg-zinc-500'
                                  }`} />
                                  {agent ? agent.name : d.target_agent}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tags (Interactive Click to Filter) */}
                      {mission.tags && mission.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {mission.tags.map((tag, idx) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTag(tag);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/25 hover:text-indigo-300'
                                }`}
                                title={isSelected ? `Active filter: click to remove "${tag}" filter` : `Click to filter archives by #${tag}`}
                              >
                                <span>#{tag}</span>
                                {isSelected && <X className="w-2.5 h-2.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Deliverable Snapshot Preview */}
                      {hasDeliverable && (
                        <div className="text-[11px] text-zinc-400 bg-purple-950/20 border border-purple-800/30 rounded-lg p-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            Synthesized Deliverable Available
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Ready
                          </span>
                        </div>
                      )}

                      {/* Primary Reload Button */}
                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-850">
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {mission.logs.length} orchestration logs
                        </div>

                        <button
                          onClick={() => {
                            onReloadMission(mission);
                            onClose();
                          }}
                          className={`px-4 py-1.5 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            isActive
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-indigo-500/30'
                              : 'bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-indigo-600/20'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isActive ? 'Restore Workspace' : 'Reload Mission'}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Actions */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between text-xs">
            <div className="text-zinc-500 font-mono text-[11px]">
              Stored locally in browser
            </div>

            <div className="flex items-center gap-2">
              {missions.length > 0 && (
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition text-xs cursor-pointer"
                >
                  Clear Archives
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {missionToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-sm font-bold text-white">Delete Mission?</h4>
            </div>
            <p className="text-xs text-zinc-300">
              Are you sure you want to remove this mission from your local archives? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMissionToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteMission(missionToDelete);
                  setMissionToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-sm font-bold text-white">Clear All Saved Missions?</h4>
            </div>
            <p className="text-xs text-zinc-300">
              This will permanently delete all {missions.length} mission records stored in your browser's localStorage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllMissions();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
