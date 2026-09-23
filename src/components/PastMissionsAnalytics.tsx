import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine,
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Bot, 
  Zap, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Timer,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { SavedMission, calculateMissionAnalytics } from '../utils/missionStorage';
import { AgentConfig } from '../types/agent';

interface PastMissionsAnalyticsProps {
  missions: SavedMission[];
  agents: AgentConfig[];
  onSelectMission?: (mission: SavedMission) => void;
}

export const PastMissionsAnalytics: React.FC<PastMissionsAnalyticsProps> = ({
  missions,
  agents,
  onSelectMission
}) => {
  const agentNameMap = useMemo(() => {
    return new Map(agents.map(a => [a.id, a.name]));
  }, [agents]);

  const stats = useMemo(() => {
    return calculateMissionAnalytics(missions, agentNameMap);
  }, [missions, agentNameMap]);

  if (missions.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 px-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-400">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">No Analytics Available</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Save at least one mission to visualize completion times, success rates, and specialist agent metrics.
        </p>
      </div>
    );
  }

  // Custom tooltip for Duration BarChart
  const CustomDurationTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700/90 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 max-w-xs z-50">
          <div className="font-semibold text-white truncate">{data.title}</div>
          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800">
            <span>Completion Time:</span>
            <span className="font-mono text-indigo-400 font-bold">{data.durationSec}s ({data.durationMs}ms)</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Specialist Agents:</span>
            <span className="font-mono text-zinc-200">{data.agentCount}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Status:</span>
            <span className={`font-mono capitalize font-medium ${
              data.isSuccess ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {data.phase.replace('_', ' ')}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono pt-1 text-right">
            {data.date}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Agent Performance
  const CustomAgentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700/90 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 max-w-xs z-50">
          <div className="font-semibold text-white">{data.name}</div>
          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800">
            <span>Avg Latency:</span>
            <span className="font-mono text-sky-400 font-bold">{data.avgDurationSec}s</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Task Success Rate:</span>
            <span className="font-mono text-emerald-400 font-bold">{data.successRate}%</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Total Delegations:</span>
            <span className="font-mono text-zinc-200">{data.runs} runs</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Average Completion Time */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Avg Completion Time
            </span>
            <span className="text-[10px] font-mono text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30">
              Benchmark
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {stats.avgCompletionTimeSec}s
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              ({Math.round(stats.avgCompletionTimeSec * 1000)}ms)
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between border-t border-zinc-850 pt-2 font-mono">
            <span>Min: <strong className="text-zinc-300">{stats.minCompletionTimeSec}s</strong></span>
            <span>Max: <strong className="text-zinc-300">{stats.maxCompletionTimeSec}s</strong></span>
          </div>
        </div>

        {/* Card 2: Overall Success Rate */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Overall Success Rate
            </span>
            <span className="text-[10px] font-mono text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
              {stats.completedMissions + stats.directAnswerMissions}/{stats.totalMissions} Passed
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {stats.overallSuccessRate}%
            </span>
            <span className="text-xs text-zinc-500">
              across {stats.totalMissions} missions
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between border-t border-zinc-850 pt-2 font-mono">
            <span>Sub-Agent Tasks: <strong className="text-emerald-400">{stats.subAgentSuccessRate}%</strong></span>
            <span>Failed: <strong className={stats.failedMissions > 0 ? "text-rose-400" : "text-zinc-500"}>{stats.failedMissions}</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Section 1: Completion Time by Mission with Average Reference Line */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Timer className="w-4 h-4 text-indigo-400" />
              Mission Completion Time (Seconds)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Visual duration breakdown per mission compared against the swarm average ({stats.avgCompletionTimeSec}s).
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Duration
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2.5 h-0.5 bg-purple-400 border border-purple-400" /> Avg ({stats.avgCompletionTimeSec}s)
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={stats.missionDurationData} 
              margin={{ top: 12, right: 12, left: -16, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="shortTitle" 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#3f3f46"
                interval={0}
                angle={-18}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#3f3f46"
                unit="s"
              />
              <Tooltip content={<CustomDurationTooltip />} cursor={{ fill: '#27272a40' }} />
              
              {/* Highlight swarm average completion time */}
              <ReferenceLine 
                y={stats.avgCompletionTimeSec} 
                stroke="#a855f7" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `Avg: ${stats.avgCompletionTimeSec}s`, 
                  fill: '#c084fc', 
                  fontSize: 10, 
                  position: 'top',
                  fontFamily: 'monospace'
                }} 
              />
              
              <Bar 
                dataKey="durationSec" 
                radius={[6, 6, 0, 0]}
              >
                {stats.missionDurationData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isSuccess ? (entry.durationSec <= stats.avgCompletionTimeSec ? '#6366f1' : '#818cf8') : '#f43f5e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Section 2: Success Rates & Outcome Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outcome Breakdown Donut */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Mission Outcome Distribution
            </h4>
            <p className="text-[11px] text-zinc-400">
              Proportion of synthesized deliverables vs direct answers.
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, name: any) => [`${val} missions (${((Number(val) / stats.totalMissions) * 100).toFixed(0)}%)`, name]}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#a1a1aa' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub-Agent Delegation Health */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              Sub-Agent Task Execution Health
            </h4>
            <p className="text-[11px] text-zinc-400">
              Success rates across all decomposed delegations.
            </p>
          </div>

          <div className="space-y-3 py-1 font-mono text-xs">
            {/* Success Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Successful Sub-Tasks
                </span>
                <span>{stats.successfulDelegations} / {stats.totalDelegations} ({stats.subAgentSuccessRate}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.subAgentSuccessRate}%` }}
                />
              </div>
            </div>

            {/* Average Sub-Agent Task Duration */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Avg Specialist Task Latency</span>
                <div className="text-sm font-bold text-white font-mono">{stats.avgSubAgentDurationMs} ms</div>
              </div>
              <div className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700">
                {(stats.avgSubAgentDurationMs / 1000).toFixed(2)}s / task
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Section 3: Specialist Agent Latency & Success Comparison */}
      {stats.agentPerformanceData.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Specialist Agent Average Latency (Seconds)
              </h4>
              <p className="text-[11px] text-zinc-400">
                Execution speed per registered specialist sub-agent across missions.
              </p>
            </div>
          </div>

          <div className="h-52 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.agentPerformanceData} 
                layout="vertical"
                margin={{ top: 8, right: 24, left: 32, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis 
                  type="number" 
                  unit="s"
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                  stroke="#3f3f46"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#d4d4d8', fontSize: 10 }}
                  stroke="#3f3f46"
                  width={110}
                />
                <Tooltip content={<CustomAgentTooltip />} cursor={{ fill: '#27272a40' }} />
                <Bar 
                  dataKey="avgDurationSec" 
                  fill="#06b6d4" 
                  radius={[0, 6, 6, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Timeline Trend Line Chart */}
      {stats.missionDurationData.length >= 2 && (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Completion Speed Timeline Trend
            </h4>
            <p className="text-[11px] text-zinc-400">
              Historical evolution of orchestration completion times over sequence of missions.
            </p>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={stats.missionDurationData} 
                margin={{ top: 8, right: 12, left: -20, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="shortTitle" 
                  tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'monospace' }}
                  stroke="#3f3f46"
                />
                <YAxis 
                  unit="s"
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                  stroke="#3f3f46"
                />
                <Tooltip content={<CustomDurationTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="durationSec" 
                  stroke="#818cf8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#durationGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
