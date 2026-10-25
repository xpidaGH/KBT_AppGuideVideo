import React from 'react';
import { X, Cpu, Smartphone, Globe, Server, Database, Video, BarChart2, GitFork } from 'lucide-react';

interface ArchitectureMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureMapModal: React.FC<ArchitectureMapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                Unified Cross-Language Architecture Map
              </h2>
              <p className="text-xs text-zinc-400">
                End-to-End Multimedia Pipeline across 22 Programming Languages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Diagram and Nodes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ASCII / Visual Flow Diagram Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
            <pre className="text-zinc-300">{`[ FRONTEND CAPTURE & TELEMETRY ]
  ├── Desktop (C++, Rust, Go, C, Assembly, PowerShell) ──► Zero-Copy GPU Textures ──┐
  ├── Mobile (Kotlin, Java, Flutter, Swift) ────────────► Foreground Daemon ────────┤► [ RAW MULTIMEDIA STREAMS ]
  └── Web (TypeScript, JavaScript Extension) ────────────► DOM Event Telemetry ─────┘             │
                                                                                                 ▼
[ DISTRIBUTED STORAGE & PROCESSING ]                                                     [ FFmpeg ENGINE CORE ]
  ├── PHP / Ruby (API Catalog & IAM Controls)                                            ├── libavcodec (NVENC / AMF)
  └── Python / C# (Microservice Headless Render Farm) ───────────────────────────────────┤── Audio Muxer (PCM to AAC)
                                                                                         └── OUTPUT: Production MP4
                                                                                                 │
                                                                                                 ▼
[ ANALYTICS & SYSTEM MANAGEMENT ]                                                        [ LMS / YOUTUBE PIPELINE ]
  ├── Scala / Java (High-Throughput Telemetry Ingestion)
  ├── SQL (Time-Series Interaction Mapping Database)
  └── R / MATLAB (Retention Modeling & Audio Signal Processing)`}</pre>
          </div>

          {/* Interactive Node Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Capture Ingestion */}
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>1. Hardware Ingestion</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Raw GPU VRAM surfaces extracted via <code className="text-indigo-300">IDXGIOutputDuplication</code> (Windows) and <code className="text-indigo-300">PipeWire</code> (Linux). AVX2/NEON SIMD converts 32-bit BGRA to NV12 planar with zero CPU overhead.
              </p>
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">C</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Assembly</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Rust</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">C++</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Kotlin</span>
              </div>
            </div>

            {/* Muxing & Transcoding */}
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Video className="w-4 h-4" />
                <span>2. Hardware Muxing</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Direct C++ bindings to <code className="text-emerald-300">libavcodec</code> dispatch NV12 textures to NVENC / QuickSync. SPSC lock-free ring buffer decouples high-frequency capture from disk serialization.
              </p>
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">C++</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Rust</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Go</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Python</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">C#</span>
              </div>
            </div>

            {/* Telemetry & LMS Analytics */}
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <BarChart2 className="w-4 h-4" />
                <span>3. Analytics & LMS</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                TimescaleDB records millions of viewer click coordinates and rewinds. R survival modeling flags confusing tutorial sections, while COBOL-85 tallies daily student network bandwidth manifests.
              </p>
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Scala</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">SQL</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">R</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">MATLAB</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">COBOL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/90 text-xs text-zinc-500 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
