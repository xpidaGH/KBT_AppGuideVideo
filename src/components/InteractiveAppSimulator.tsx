import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface InteractiveAppSimulatorProps {
  onInteraction: (event: {
    type: 'click' | 'type';
    target: string;
    coordinates: { x: number; y: number };
    title: string;
    description: string;
    codeSnippet?: string;
  }) => void;
}

export const InteractiveAppSimulator: React.FC<InteractiveAppSimulatorProps> = ({
  onInteraction,
}) => {
  const [activeTab, setActiveTab] = useState<'compiler' | 'vram' | 'database' | 'audio'>('compiler');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[INIT] KBT CloudIDE Compiler v2.4 Ready.',
    '[READY] GPU Hardware Duplication Engine Loaded (IDXGIOutputDuplication: OK).',
    '[READY] Click any button below to trigger software workflow steps.',
  ]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [sampleVar, setSampleVar] = useState('AVX2_ENABLED=1');

  const logToTerminal = (msg: string) => {
    setTerminalOutput((prev) => [...prev.slice(-8), msg]);
  };

  const handleAction = (
    e: React.MouseEvent<HTMLElement>,
    targetName: string,
    title: string,
    description: string,
    codeSnippet?: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    logToTerminal(`[ACTION] ${title} (${targetName})`);

    onInteraction({
      type: 'click',
      target: targetName,
      coordinates: { x: Math.round(e.clientX), y: Math.round(e.clientY) },
      title,
      description,
      codeSnippet,
    });
  };

  const handleRunCompiler = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsCompiling(true);
    handleAction(
      e,
      '#btn-compile-simd',
      'Execute SIMD AVX2 Kernel Benchmark',
      'Triggered 256-bit SIMD integer dot-product color conversion loop.',
      'avx2_bgra_to_nv12_fast(src, y, uv, 1920*1080);'
    );
    setTimeout(() => {
      setIsCompiling(false);
      logToTerminal('[SUCCESS] SIMD AVX2 Kernel: 1080p frame converted in 0.84ms (1190 FPS).');
    }, 400);
  };

  return (
    <div className="w-full h-full min-h-[440px] bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col font-sans select-none overflow-hidden shadow-inner">
      {/* IDE Window Title Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-xs font-mono text-zinc-400 pl-2">
            Target Software: CloudIDE & Low-Level Hardware Simulator
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Target Active
        </div>
      </div>

      {/* IDE Navigation Tabs */}
      <div className="flex bg-zinc-900/60 border-b border-zinc-800 px-3 pt-2 gap-1 overflow-x-auto text-xs font-mono">
        <button
          onClick={(e) => {
            setActiveTab('compiler');
            handleAction(e, '#tab-compiler', 'Switch to SIMD Compiler Tab', 'Selected SIMD compiler configuration view.');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
            activeTab === 'compiler'
              ? 'bg-zinc-950 text-indigo-400 border-t-2 border-indigo-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>SIMD Compiler</span>
        </button>

        <button
          onClick={(e) => {
            setActiveTab('vram');
            handleAction(e, '#tab-vram', 'Switch to VRAM Duplication Tab', 'Selected GPU VRAM capture settings.');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
            activeTab === 'vram'
              ? 'bg-zinc-950 text-indigo-400 border-t-2 border-indigo-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>VRAM Duplication</span>
        </button>

        <button
          onClick={(e) => {
            setActiveTab('database');
            handleAction(e, '#tab-database', 'Switch to SQL Telemetry Tab', 'Selected TimescaleDB telemetry schema view.');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
            activeTab === 'database'
              ? 'bg-zinc-950 text-indigo-400 border-t-2 border-indigo-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>TimescaleDB Lake</span>
        </button>

        <button
          onClick={(e) => {
            setActiveTab('audio');
            handleAction(e, '#tab-audio', 'Switch to DSP Audio Filter Tab', 'Selected MATLAB FFT noise gate view.');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
            activeTab === 'audio'
              ? 'bg-zinc-950 text-indigo-400 border-t-2 border-indigo-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>DSP Audio Filter</span>
        </button>
      </div>

      {/* Main Interactive Work Area */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
        {/* Left 2 Cols: Interactive Controls */}
        <div className="md:col-span-2 space-y-4">
          {activeTab === 'compiler' && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">SIMD AVX2 Vector Kernel Configuration</h4>
                  <p className="text-xs text-zinc-400">High-throughput BGRA32 to NV12 color transformation</p>
                </div>
                <button
                  id="btn-compile-simd"
                  onClick={handleRunCompiler}
                  disabled={isCompiling}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-xs shadow-md transition"
                >
                  <Play className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : 'fill-current'}`} />
                  <span>{isCompiling ? 'Compiling AVX2...' : 'Run SIMD Benchmark'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  onClick={(e) =>
                    handleAction(
                      e,
                      '#card-vector-256',
                      'Toggle 256-bit Vector Width',
                      'Configured AVX2 YMM registers for 8-pixel parallel processing.'
                    )
                  }
                  className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition"
                >
                  <span className="font-mono text-indigo-400 text-[11px]">REGISTER_SIZE</span>
                  <div className="font-bold text-sm text-zinc-200 mt-1">256-Bit YMM</div>
                  <p className="text-[10px] text-zinc-500">8 Pixels / Cycle</p>
                </div>

                <div
                  onClick={(e) =>
                    handleAction(
                      e,
                      '#card-target-fps',
                      'Lock Frame Pipeline to 60FPS',
                      'Set constant framerate timing for video encoder.'
                    )
                  }
                  className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition"
                >
                  <span className="font-mono text-emerald-400 text-[11px]">TARGET_FPS</span>
                  <div className="font-bold text-sm text-zinc-200 mt-1">60.00 FPS</div>
                  <p className="text-[10px] text-zinc-500">16.6ms Budget</p>
                </div>
              </div>

              {/* Editable Configuration Variable */}
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-mono">COMPILER_FLAGS:</label>
                <input
                  type="text"
                  value={sampleVar}
                  onChange={(e) => setSampleVar(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'vram' && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-sm text-white">DirectX 11 Desktop Duplication API</h4>
              <p className="text-xs text-zinc-400">Zero-copy GPU texture handle binding</p>

              <div className="flex gap-2">
                <button
                  id="btn-bind-vram"
                  onClick={(e) =>
                    handleAction(
                      e,
                      '#btn-bind-vram',
                      'Bind Primary Display Surface',
                      'Acquired ID3D11Texture2D pointer directly from GPU output adapter.',
                      'dxgi_acquire_next_frame(&engine, 16, &pTexture);'
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                >
                  Acquire VRAM Pointer
                </button>

                <button
                  id="btn-flush-dxgi"
                  onClick={(e) =>
                    handleAction(
                      e,
                      '#btn-flush-dxgi',
                      'Release DXGI Desktop Frame',
                      'Returned VRAM texture to desktop compositor pool.'
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                >
                  Release Frame Pool
                </button>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-sm text-white">TimescaleDB Interaction Analytics Query</h4>
              <p className="text-xs text-zinc-400">Query student drop-offs and click heatmaps</p>

              <button
                id="btn-exec-query"
                onClick={(e) =>
                  handleAction(
                    e,
                    '#btn-exec-query',
                    'Execute Telemetry Heatmap Query',
                    'Calculated rewind spikes across 50,000 student interaction logs.'
                  )
                }
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Run Hotspot Analysis (SQL)
              </button>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-sm text-white">MATLAB DSP Audio Filter</h4>
              <p className="text-xs text-zinc-400">FFT electrical hum removal & silence skipping</p>

              <button
                id="btn-run-fft"
                onClick={(e) =>
                  handleAction(
                    e,
                    '#btn-run-fft',
                    'Run FFT Audio Noise Gate',
                    'Applied 60Hz notch filter and removed 8 silence intervals.'
                  )
                }
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Filter Microphone Audio (FFT)
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Live Event Log Terminal */}
        <div className="flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 p-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-zinc-800/80 text-zinc-400 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Telemetry Terminal</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 text-[11px] text-zinc-300">
            {terminalOutput.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.includes('[SUCCESS]')
                    ? 'text-emerald-400 font-bold'
                    : line.includes('[ACTION]')
                    ? 'text-indigo-300'
                    : 'text-zinc-400'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
