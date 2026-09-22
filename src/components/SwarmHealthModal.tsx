import React, { useState, useMemo } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Filter,
  BarChart3,
  Cpu,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { AgentExecutionRecord, clearExecutionHistory, getExecutionHistory } from '../utils/swarmMetrics';
import { AgentConfig } from '../types/agent';

interface SwarmHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  records: AgentExecutionRecord[];
  onRefreshRecords: () => void;
}

export const SwarmHealthModal: React.FC<SwarmHealthModalProps> = ({
  isOpen,
  onClose,
  agents,
  records,
  onRefreshRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'response_time' | 'error_logs'>('overview');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');

  // Compute metrics per agent
  const agentMetrics = useMemo(() => {
    const stats: Record<
      string,
      {
        agentId: string;
        agentName: string;
        total: number;
        completed: number;
        failed: number;
        totalDurationMs: number;
        avgDurationMs: number;
        successRate: number;
      }
    > = {};

    // Initialize with all registered agents
    agents.forEach((ag) => {
      stats[ag.id] = {
        agentId: ag.id,
        agentName: ag.name,
        total: 0,
        completed: 0,
        failed: 0,
        totalDurationMs: 0,
        avgDurationMs: 0,
        successRate: 100,
      };
    });

    records.forEach((rec) => {
      if (!stats[rec.agentId]) {
        stats[rec.agentId] = {
          agentId: rec.agentId,
          agentName: rec.agentName || rec.agentId,
          total: 0,
          completed: 0,
          failed: 0,
          totalDurationMs: 0,
          avgDurationMs: 0,
          successRate: 100,
        };
      }

      stats[rec.agentId].total += 1;
      if (rec.status === 'completed') {
        stats[rec.agentId].completed += 1;
      } else {
        stats[rec.agentId].failed += 1;
      }
      stats[rec.agentId].totalDurationMs += rec.durationMs;
    });

    return Object.values(stats).map((s) => ({
      ...s,
      avgDurationMs: s.total > 0 ? Math.round(s.totalDurationMs / s.total) : 0,
      successRate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 100,
    }));
  }, [agents, records]);

  // Overall Swarm Totals
  const overallStats = useMemo(() => {
    const totalRuns = records.length;
    const completedRuns = records.filter((r) => r.status === 'completed').length;
    const failedRuns = records.filter((r) => r.status === 'failed').length;
    const overallSuccessRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100;
    const totalDuration = records.reduce((acc, r) => acc + (r.durationMs || 0), 0);
    const avgDuration = totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0;

    return {
      totalRuns,
      completedRuns,
      failedRuns,
      overallSuccessRate,
      avgDuration,
    };
  }, [records]);

  // Data for Success Rates Bar Chart
  const successRateChartData = useMemo(() => {
    return agentMetrics
      .filter((m) => m.total > 0)
      .map((m) => ({
        name: m.agentName.length > 18 ? m.agentName.slice(0, 16) + '...' : m.agentName,
        fullName: m.agentName,
        successRate: m.successRate,
        completed: m.completed,
        failed: m.failed,
        total: m.total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [agentMetrics]);

  // Data for Average Response Time (ms)
  const responseTimeChartData = useMemo(() => {
    return agentMetrics
      .filter((m) => m.total > 0)
      .map((m) => ({
        name: m.agentName.length > 18 ? m.agentName.slice(0, 16) + '...' : m.agentName,
        fullName: m.agentName,
        avgDurationSec: +(m.avgDurationMs / 1000).toFixed(2),
        avgDurationMs: m.avgDurationMs,
      }))
      .sort((a, b) => a.avgDurationMs - b.avgDurationMs);
  }, [agentMetrics]);

  // Timeline Trend (chronological runs)
  const timelineData = useMemo(() => {
    const sorted = [...records].reverse();
    return sorted.map((r, idx) => ({
      run: `#${idx + 1}`,
      agent: r.agentName,
      durationMs: r.durationMs,
      durationSec: +(r.durationMs / 1000).toFixed(2),
      status: r.status,
      timestamp: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }));
  }, [records]);

  // Filtered Error and Execution Logs
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchAgent = selectedAgentFilter === 'all' || r.agentId === selectedAgentFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchAgent && matchStatus;
    });
  }, [records, selectedAgentFilter, statusFilter]);

  const errorCount = useMemo(() => {
    return records.filter((r) => r.status === 'failed').length;
  }, [records]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all swarm telemetry history?')) {
      clearExecutionHistory();
      onRefreshRecords();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Swarm Health & Telemetry</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Live Monitoring
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Visualize sub-agent success rates, average response times, and failure diagnostics via Recharts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
              title="Clear telemetry history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3.5 bg-zinc-950/40 border-b border-zinc-800/80">
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Overall Success Rate</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{overallStats.overallSuccessRate}%</span>
              <span className="text-[10px] text-zinc-500 font-mono">({overallStats.completedRuns}/{overallStats.totalRuns} passed)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Avg Execution Time</span>
              <Clock className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{(overallStats.avgDuration / 1000).toFixed(2)}s</span>
              <span className="text-[10px] text-zinc-500 font-mono">{overallStats.avgDuration}ms</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Total Dispatches</span>
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{overallStats.totalRuns}</span>
              <span className="text-[10px] text-zinc-500 font-mono">sub-agent runs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Anomalies & Errors</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {errorCount}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">logged failures</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 pb-2 border-b border-zinc-800 flex items-center justify-between text-xs bg-zinc-950/60">
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Success Rates
            </button>
            <button
              onClick={() => setActiveTab('response_time')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'response_time'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Latency & Response Times
            </button>
            <button
              onClick={() => setActiveTab('error_logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'error_logs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Error Logs & Audits ({records.filter((r) => r.status === 'failed').length})
            </button>
          </div>

          <span className="text-[11px] font-mono text-zinc-500 hidden sm:block">
            {records.length} total recorded operations
          </span>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW WITH BOTH GRAPHS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dual Visual Graph Grid: Success Rates & Response Times */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Graph 1: Success Rates */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Agent Success Rates (%)
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Percentage of runs completed without errors or re-rolls.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Threshold &gt; 80%
                    </span>
                  </div>

                  <div className="h-64 w-full pt-2">
                    {successRateChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={successRateChartData} margin={{ top: 10, right: 15, left: -20, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            angle={-30}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 10 }} domain={[0, 100]} unit="%" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              borderColor: '#3f3f46',
                              borderRadius: '0.75rem',
                              fontSize: '12px',
                              color: '#fff',
                            }}
                            formatter={(value: any, _name: any, item: any) => [
                              `${value}% (${item.payload.completed}/${item.payload.total} passed)`,
                              'Success Rate',
                            ]}
                            labelFormatter={(label) => `Agent: ${label}`}
                          />
                          <Bar dataKey="successRate" radius={[5, 5, 0, 0]}>
                            {successRateChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.successRate >= 90 ? '#10b981' : entry.successRate >= 70 ? '#38bdf8' : '#f43f5e'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                        No telemetry data logged yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Graph 2: Average Response Times */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" />
                        Average Response Time per Agent
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Derived directly from swarmRecords telemetry latency (seconds).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                        Target &lt; 3.0s
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    {responseTimeChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={responseTimeChartData} margin={{ top: 10, right: 15, left: -20, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            angle={-30}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 10 }} unit="s" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              borderColor: '#3f3f46',
                              borderRadius: '0.75rem',
                              fontSize: '12px',
                              color: '#fff',
                            }}
                            formatter={(value: any, _name: any, item: any) => [
                              `${value}s (${item.payload.avgDurationMs}ms)`,
                              'Avg Latency',
                            ]}
                            labelFormatter={(label) => `Sub-Agent: ${label}`}
                          />
                          <Bar dataKey="avgDurationSec" radius={[5, 5, 0, 0]}>
                            {responseTimeChartData.map((entry, index) => (
                              <Cell
                                key={`cell-rt-${index}`}
                                fill={
                                  entry.avgDurationSec <= 1.5
                                    ? '#38bdf8'
                                    : entry.avgDurationSec <= 3.0
                                    ? '#818cf8'
                                    : '#f59e0b'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                        No latency data logged yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Performance Table */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                  Agent Operational Status Matrix
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                        <th className="pb-2 font-medium">Sub-Agent</th>
                        <th className="pb-2 font-medium">Total Runs</th>
                        <th className="pb-2 font-medium">Success</th>
                        <th className="pb-2 font-medium">Failures</th>
                        <th className="pb-2 font-medium">Success Rate</th>
                        <th className="pb-2 font-medium">Avg Latency</th>
                        <th className="pb-2 font-medium">Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {agentMetrics.map((ag) => (
                        <tr key={ag.agentId} className="hover:bg-zinc-900/40 transition">
                          <td className="py-2.5 font-sans font-semibold text-white">
                            {ag.agentName}
                            <span className="block text-[10px] text-zinc-500 font-mono font-normal">{ag.agentId}</span>
                          </td>
                          <td className="py-2.5 text-zinc-300">{ag.total}</td>
                          <td className="py-2.5 text-emerald-400">{ag.completed}</td>
                          <td className="py-2.5 text-rose-400">{ag.failed}</td>
                          <td className="py-2.5 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                ag.successRate >= 90
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : ag.successRate >= 70
                                  ? 'bg-sky-500/10 text-sky-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {ag.total > 0 ? `${ag.successRate}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="py-2.5 text-zinc-300">
                            {ag.total > 0 ? `${(ag.avgDurationMs / 1000).toFixed(2)}s` : '-'}
                          </td>
                          <td className="py-2.5">
                            {ag.total === 0 ? (
                              <span className="text-zinc-500 text-[10px]">Idle</span>
                            ) : ag.successRate >= 80 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" /> Nominal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                                <AlertTriangle className="w-3 h-3" /> Degraded
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESPONSE TIMES */}
          {activeTab === 'response_time' && (
            <div className="space-y-6">
              {/* Avg Response Time Chart */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      Average Agent Response Latency (Seconds)
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Average round-trip execution time per agent to generate structural deliverables.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                    Target: &lt; 3.0s
                  </span>
                </div>

                <div className="h-64 w-full pt-4">
                  {responseTimeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={responseTimeChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                        <XAxis type="number" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} unit="s" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#71717a"
                          tick={{ fill: '#a1a1aa', fontSize: 11 }}
                          width={140}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#3f3f46',
                            borderRadius: '0.75rem',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                          formatter={(value: any) => [`${value}s (${Math.round(+value * 1000)}ms)`, 'Avg Latency']}
                        />
                        <Bar dataKey="avgDurationSec" fill="#38bdf8" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                      No response time data logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Latency Timeline */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Swarm Execution Timeline (Recent Dispatches)
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Chronological progression of task durations across consecutive sub-agent delegations.
                    </p>
                  </div>
                </div>

                <div className="h-56 w-full pt-4">
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="run" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                        <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} unit="s" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#3f3f46',
                            borderRadius: '0.75rem',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                          formatter={(val: any, _name: any, item: any) => [
                            `${val}s (${item.payload.agent} - ${item.payload.status})`,
                            'Duration',
                          ]}
                          labelFormatter={(l, items) => {
                            const item = items?.[0]?.payload;
                            return `Dispatch ${l} at ${item?.timestamp || ''}`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="durationSec"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={{ fill: '#818cf8', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                      No timeline history recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ERROR LOGS & AUDITS */}
          {activeTab === 'error_logs' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300 font-medium">Filter Logs:</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={selectedAgentFilter}
                    onChange={(e) => setSelectedAgentFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Sub-Agents</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Outcomes</option>
                    <option value="failed">Failed / Errors Only</option>
                    <option value="completed">Completed Successfully</option>
                  </select>
                </div>
              </div>

              {/* Records Stream */}
              <div className="space-y-2.5">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => {
                    const isErr = rec.status === 'failed';
                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border text-xs transition space-y-2 ${
                          isErr
                            ? 'bg-rose-950/20 border-rose-500/30'
                            : 'bg-zinc-950/80 border-zinc-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isErr ? (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            <span className="font-semibold text-white">{rec.agentName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {rec.agentId}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-zinc-500">
                              {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                              {(rec.durationMs / 1000).toFixed(2)}s
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                                isErr
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800/60 font-mono text-[11px] text-zinc-300">
                          <span className="text-zinc-500 block mb-0.5 text-[10px] uppercase font-semibold">
                            Task Prompt:
                          </span>
                          {rec.taskPrompt}
                        </div>

                        {rec.errorMessage && (
                          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 font-mono text-[11px] text-rose-300 leading-relaxed">
                            <span className="text-rose-400 block mb-0.5 text-[10px] uppercase font-semibold">
                              Error Diagnostic / Hallucination Log:
                            </span>
                            {rec.errorMessage}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-zinc-500 text-xs font-mono bg-zinc-950/40 rounded-xl border border-zinc-800">
                    No execution records match the current filter selection.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
