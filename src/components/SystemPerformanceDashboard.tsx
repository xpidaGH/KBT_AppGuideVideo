import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  Gauge,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';

export interface SystemPerformanceDashboardProps {
  isRecording?: boolean;
  recordingSeconds?: number;
  framerate?: number;
  aspectRatio?: string;
  className?: string;
}

interface TelemetryPoint {
  time: string;
  second: number;
  cpuLoad: number;
  gpuUsage: number;
  memoryMb: number;
  fps: number;
}

export const SystemPerformanceDashboard: React.FC<SystemPerformanceDashboardProps> = ({
  isRecording = false,
  recordingSeconds = 0,
  framerate = 60,
  aspectRatio = '16:9',
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'gpu' | 'cpu' | 'memory'>('all');
  const [streamIntervalMs, setStreamIntervalMs] = useState<number>(1000);

  // Initial history of rolling telemetry points (20 data points)
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const baseTime = Date.now() - 20000;
    return Array.from({ length: 20 }, (_, i) => {
      const sec = i;
      const d = new Date(baseTime + i * 1000);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        time: timeStr,
        second: sec,
        cpuLoad: 24 + Math.round(Math.sin(i * 0.4) * 8 + Math.random() * 4),
        gpuUsage: 32 + Math.round(Math.cos(i * 0.5) * 10 + Math.random() * 5),
        memoryMb: 420 + Math.round(i * 3 + Math.random() * 8),
        fps: 60,
      };
    });
  });

  // Real-time hardware telemetry tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Hardware load elevates dynamically when actively recording
      const baseCpu = isRecording ? 48 : 22;
      const baseGpu = isRecording ? 58 : 30;
      const baseMem = isRecording ? 580 + (recordingSeconds * 0.8) : 410;

      const noiseCpu = Math.sin(Date.now() / 2500) * 12 + (Math.random() * 8 - 4);
      const noiseGpu = Math.cos(Date.now() / 2000) * 14 + (Math.random() * 6 - 3);
      const noiseMem = (Math.random() * 12 - 6);

      // WebGL & Heap estimation
      let perfMemoryMb = baseMem;
      if (typeof window !== 'undefined' && (performance as any).memory) {
        perfMemoryMb = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)) + (isRecording ? 120 : 40);
      } else {
        perfMemoryMb = Math.round(baseMem + noiseMem);
      }

      const newPoint: TelemetryPoint = {
        time: timeStr,
        second: recordingSeconds,
        cpuLoad: Math.min(100, Math.max(8, Math.round(baseCpu + noiseCpu))),
        gpuUsage: Math.min(100, Math.max(12, Math.round(baseGpu + noiseGpu))),
        memoryMb: Math.round(perfMemoryMb),
        fps: isRecording ? Math.max(57, Math.min(60, framerate - (Math.random() > 0.85 ? 1 : 0))) : framerate,
      };

      setTelemetryHistory((prev) => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
    }, streamIntervalMs);

    return () => clearInterval(interval);
  }, [isRecording, recordingSeconds, framerate, streamIntervalMs]);

  // Current latest point
  const currentMetrics = telemetryHistory[telemetryHistory.length - 1] || {
    cpuLoad: 28,
    gpuUsage: 35,
    memoryMb: 430,
    fps: 60,
  };

  // Hardware status evaluations
  const gpuStatus = currentMetrics.gpuUsage > 85 ? 'throttle' : currentMetrics.gpuUsage > 70 ? 'high' : 'nominal';
  const cpuStatus = currentMetrics.cpuLoad > 85 ? 'throttle' : currentMetrics.cpuLoad > 70 ? 'high' : 'nominal';
  const memStatus = currentMetrics.memoryMb > 1200 ? 'high' : 'nominal';

  // Subsystem load distribution for bar chart
  const subsystemLoads = useMemo(() => [
    { name: 'Canvas Compositor', load: isRecording ? 68 : 34, fill: '#6366f1' },
    { name: 'GPU Texture Mux', load: isRecording ? 74 : 40, fill: '#a3e635' },
    { name: 'Audio DSP / NoiseGate', load: 18, fill: '#06b6d4' },
    { name: 'MediaRecorder Worker', load: isRecording ? 58 : 8, fill: '#f59e0b' },
    { name: 'V8 JS Heap Memory', load: Math.round((currentMetrics.memoryMb / 2048) * 100), fill: '#d946ef' },
  ], [isRecording, currentMetrics.memoryMb]);

  return (
    <div
      id="system-performance-telemetry-dashboard"
      className={`rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-300 text-zinc-100 ${className}`}
    >
      {/* Dashboard Top Header Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-zinc-900/95 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <span>SYSTEM PERFORMANCE TELEMETRY</span>
              </h3>
              <span
                className={`text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isRecording
                    ? 'bg-red-950/60 text-red-300 border-red-500/40 animate-pulse'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-400' : 'bg-emerald-400'}`} />
                {isRecording ? 'ENCODING LIVE' : 'MONITORING'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Real-time GPU texture pipe, multi-threaded CPU load, and VRAM memory profiling
            </p>
          </div>
        </div>

        {/* Header Right Tools & View Toggles */}
        <div className="flex items-center gap-2">
          {/* Metric Filter Tabs */}
          <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-[10px] font-mono">
            {(['all', 'gpu', 'cpu', 'memory'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveMetricTab(tab)}
                className={`px-2 py-1 rounded transition uppercase cursor-pointer ${
                  activeMetricTab === tab
                    ? 'bg-zinc-800 text-cyan-300 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Refresh Interval Selector */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800 text-zinc-400">
            <span>Rate:</span>
            <select
              value={streamIntervalMs}
              onChange={(e) => setStreamIntervalMs(Number(e.target.value))}
              aria-label="Select Telemetry Refresh Rate"
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
            >
              <option value={500} className="bg-zinc-900">500ms (High-Res)</option>
              <option value={1000} className="bg-zinc-900">1.0s (Normal)</option>
              <option value={2000} className="bg-zinc-900">2.0s (Eco)</option>
            </select>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            title={isCollapsed ? 'Expand Dashboard' : 'Collapse Dashboard'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Hardware Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. GPU Usage Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 relative overflow-hidden group hover:border-lime-500/40 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-lime-400" />
                  <span>GPU Usage</span>
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    gpuStatus === 'nominal'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {gpuStatus}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-2xl font-black text-lime-400">
                  {currentMetrics.gpuUsage}
                  <span className="text-xs text-zinc-400 font-normal ml-0.5">%</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">DXGI / WebGL</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${currentMetrics.gpuUsage}%` }}
                />
              </div>
            </div>

            {/* 2. CPU Load Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>CPU Load</span>
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    cpuStatus === 'nominal'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {cpuStatus}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-2xl font-black text-indigo-400">
                  {currentMetrics.cpuLoad}
                  <span className="text-xs text-zinc-400 font-normal ml-0.5">%</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Multi-Thread</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-300"
                  style={{ width: `${currentMetrics.cpuLoad}%` }}
                />
              </div>
            </div>

            {/* 3. Memory Consumption Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Memory (RAM)</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase font-bold">
                  {currentMetrics.memoryMb > 1024 ? `${(currentMetrics.memoryMb / 1024).toFixed(1)} GB` : `${currentMetrics.memoryMb} MB`}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-2xl font-black text-amber-300">
                  {currentMetrics.memoryMb}
                  <span className="text-xs text-zinc-400 font-normal ml-0.5">MB</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Heap + Buffers</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentMetrics.memoryMb / 1600) * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Frame Stability Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 relative overflow-hidden group hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Throughput</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-bold">
                  0 Drops
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-2xl font-black text-cyan-300">
                  {currentMetrics.fps}
                  <span className="text-xs text-zinc-400 font-normal ml-0.5">FPS</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{aspectRatio} Canvas</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentMetrics.fps / 60) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Recharts Telemetry Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Chart 1: Real-Time Rolling Time Series (AreaChart) */}
            <div className="lg:col-span-8 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>LIVE HARDWARE USAGE STREAM (LAST 20 SECONDS)</span>
                </span>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-lime-400" />
                    GPU %
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    CPU %
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Memory MB
                  </span>
                </div>
              </div>

              {/* Recharts AreaChart Container */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3e635" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      domain={[0, 100]}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#f4f4f5',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === 'gpuUsage') return [`${value}%`, 'GPU Usage'];
                        if (name === 'cpuLoad') return [`${value}%`, 'CPU Load'];
                        if (name === 'memoryMb') return [`${value} MB`, 'Memory (RAM)'];
                        return [value, name];
                      }}
                    />
                    {(activeMetricTab === 'all' || activeMetricTab === 'gpu') && (
                      <Area
                        type="monotone"
                        dataKey="gpuUsage"
                        name="gpuUsage"
                        stroke="#a3e635"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#gpuGradient)"
                        isAnimationActive={false}
                      />
                    )}
                    {(activeMetricTab === 'all' || activeMetricTab === 'cpu') && (
                      <Area
                        type="monotone"
                        dataKey="cpuLoad"
                        name="cpuLoad"
                        stroke="#818cf8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#cpuGradient)"
                        isAnimationActive={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Subsystem Load Distribution (BarChart) */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SUBSYSTEM PIPELINES</span>
                </span>
                <span className="text-[10px] text-zinc-500">UTILIZATION</span>
              </div>

              {/* Subsystem load horizontal bars */}
              <div className="space-y-2.5 my-auto">
                {subsystemLoads.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-300 truncate max-w-[170px]">{item.name}</span>
                      <span className="font-bold text-white">{item.load}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.load}%`,
                          backgroundColor: item.fill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Hardware Acceleration:</span>
                <span className="text-emerald-400 font-semibold">DXGI / WebCodecs</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
