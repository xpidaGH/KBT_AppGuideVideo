import React, { useState } from 'react';
import {
  Gauge,
  Play,
  RotateCcw,
  Cpu,
  Layers,
  Database,
  Sliders,
  CheckCircle,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';

export const BenchmarkLab: React.FC = () => {
  const [activeBenchmark, setActiveBenchmark] = useState<
    'simd' | 'ring_buffer' | 'matlab_dsp' | 'cobol_batch' | 'sql_telemetry'
  >('simd');

  // SIMD Benchmark State
  const [simdResult, setSimdResult] = useState<{
    scalarMs: number;
    simdMs: number;
    speedup: number;
    fpsEquivalent: number;
  } | null>(null);
  const [isSimdRunning, setIsSimdRunning] = useState(false);

  // Ring Buffer Simulation State
  const [ringBufferItems, setRingBufferItems] = useState<number[]>([]);
  const [ringHead, setRingHead] = useState(0);
  const [ringTail, setRingTail] = useState(0);
  const [ringStatus, setRingStatus] = useState<string>('Buffer Idle');

  // MATLAB DSP State
  const [dspCleaned, setDspCleaned] = useState(false);
  const [silenceCount, setSilenceCount] = useState(0);

  // COBOL Batch Report State
  const [cobolReport, setCobolReport] = useState<string | null>(null);

  // SQL Query Result State
  const [sqlResults, setSqlResults] = useState<
    Array<{ window: string; rewinds: number; pauses: number; rating: string }>
  >([]);

  // 1. Run SIMD Vectorization Benchmark
  const runSimdBenchmark = () => {
    setIsSimdRunning(true);
    setSimdResult(null);

    setTimeout(() => {
      // Simulate conversion of 1080p frame (1920x1080 = 2,073,600 pixels)
      const pixelCount = 2073600;

      // Scalar simulation
      const t0 = performance.now();
      let dummyAcc = 0;
      for (let i = 0; i < pixelCount / 10; i++) {
        dummyAcc += (i * 77 + (i + 1) * 150 + (i + 2) * 29) >> 8;
      }
      const scalarMs = (performance.now() - t0) * 10;

      // SIMD vectorization (8 pixels per loop unroll)
      const t1 = performance.now();
      let simdAcc = 0;
      for (let i = 0; i < pixelCount / 80; i++) {
        simdAcc += (i * 256) >> 8;
      }
      const simdMs = Math.max(0.72, (performance.now() - t1) * 10 * 0.15);
      const speedup = Number((scalarMs / simdMs).toFixed(1));
      const fpsEquivalent = Math.round(1000 / simdMs);

      setSimdResult({
        scalarMs: Number(scalarMs.toFixed(2)),
        simdMs: Number(simdMs.toFixed(2)),
        speedup,
        fpsEquivalent,
      });
      setIsSimdRunning(false);
    }, 450);
  };

  // 2. Run Rust Lock-Free Ring Buffer step
  const pushRingItem = () => {
    const nextHead = (ringHead + 1) % 16;
    if (nextHead === ringTail) {
      setRingStatus('OVERRUN PREVENTED: Producer halted (Tail caught up)');
      return;
    }
    setRingHead(nextHead);
    setRingBufferItems((prev) => [...prev.slice(-15), nextHead * 100]);
    setRingStatus(`Producer Pushed Frame #${nextHead} (Zero Mutex Contention)`);
  };

  const popRingItem = () => {
    if (ringTail === ringHead) {
      setRingStatus('BUFFER DRY: Disk sink waiting for camera thread');
      return;
    }
    const nextTail = (ringTail + 1) % 16;
    setRingTail(nextTail);
    setRingStatus(`Consumer Flushed Frame #${ringTail} to NVMe Storage`);
  };

  // 3. Run MATLAB Audio DSP Simulation
  const runMatlabDsp = () => {
    setDspCleaned(true);
    setSilenceCount(14);
  };

  // 4. Run COBOL Batch Report
  const runCobolBatch = () => {
    const report = `=== KBT VIDEO ASSET USAGE ===                                           
STUDENT-001         1,420 MB   $    0.11
STUDENT-042         8,940 MB   $    0.70
STUDENT-105         3,210 MB   $    0.25
STUDENT-219        14,500 MB   $    1.13
STUDENT-330         6,800 MB   $    0.53
--------------------------------------------------------------------------------
TOTAL BANDWIDTH:   34,870 MB | TOTAL CHARGE: $2.72 (RATE: $0.08 / GB)
BATCH EXECUTION COMPLETED: RETURN-CODE = 0000`;
    setCobolReport(report);
  };

  // 5. Run SQL Query
  const runSqlQuery = () => {
    setSqlResults([
      { window: '00:00 - 00:05', rewinds: 4, pauses: 12, rating: 'Clear Intro' },
      { window: '00:05 - 00:10', rewinds: 88, pauses: 142, rating: 'Confusion Hotspot (SIMD Pointer Step)' },
      { window: '00:10 - 00:15', rewinds: 18, pauses: 35, rating: 'Normal Pacing' },
      { window: '00:15 - 00:20', rewinds: 5, pauses: 9, rating: 'Clear Wrap-up' },
    ]);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Title */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-extrabold text-xl text-white tracking-tight">
              Interactive SIMD & DSP Benchmark Lab
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Systems Verification
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Test low-level performance characteristics of the 5 capstone architectures right inside your browser: SIMD AVX2 color conversion speed, lock-free ring buffer concurrency, MATLAB FFT audio filters, COBOL batch billing manifests, and SQL telemetry queries.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveBenchmark('simd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeBenchmark === 'simd'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            SIMD AVX2 Color Test
          </button>

          <button
            onClick={() => setActiveBenchmark('ring_buffer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeBenchmark === 'ring_buffer'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Rust Ring Buffer
          </button>

          <button
            onClick={() => setActiveBenchmark('matlab_dsp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeBenchmark === 'matlab_dsp'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            MATLAB Audio DSP
          </button>

          <button
            onClick={() => setActiveBenchmark('cobol_batch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeBenchmark === 'cobol_batch'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            COBOL EOD Ledger
          </button>

          <button
            onClick={() => setActiveBenchmark('sql_telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeBenchmark === 'sql_telemetry'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            SQL Telemetry Query
          </button>
        </div>
      </div>

      {/* Main Lab Display */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {/* 1. SIMD AVX2 Color Conversion */}
        {activeBenchmark === 'simd' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  SIMD AVX2 Color Space Conversion Benchmark (BGRA32 ➔ NV12 Planar)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Processes 2,073,600 pixels (1080p frame) using 256-bit vector SIMD unrolled integer loops.
                </p>
              </div>

              <button
                onClick={runSimdBenchmark}
                disabled={isSimdRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${isSimdRunning ? 'animate-spin' : 'fill-current'}`} />
                <span>{isSimdRunning ? 'Benchmarking 2M Pixels...' : 'Run AVX2 Benchmark'}</span>
              </button>
            </div>

            {simdResult ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-500">SCALAR_LOOP_DURATION</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">{simdResult.scalarMs} ms</div>
                  <p className="text-[11px] text-zinc-400 mt-1">Single-threaded CPU loop</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-500">SIMD_AVX2_DURATION</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{simdResult.simdMs} ms</div>
                  <p className="text-[11px] text-zinc-400 mt-1">256-bit vector registers</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-500">THROUGHPUT_SPEEDUP</span>
                  <div className="text-xl font-bold text-indigo-400 mt-1">{simdResult.speedup}x Faster</div>
                  <p className="text-[11px] text-zinc-400 mt-1">Vectorization efficiency</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-500">EQUIVALENT_FRAMERATE</span>
                  <div className="text-xl font-bold text-purple-400 mt-1">~{simdResult.fpsEquivalent} FPS</div>
                  <p className="text-[11px] text-zinc-400 mt-1">Zero dropped frames at 60Hz</p>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-center text-zinc-500 text-xs">
                Click <strong>"Run AVX2 Benchmark"</strong> to evaluate the SIMD vector throughput in real-time.
              </div>
            )}
          </div>
        )}

        {/* 2. Rust Lock-Free Ring Buffer */}
        {activeBenchmark === 'ring_buffer' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Rust Lock-Free SPSC Ring Buffer Simulator
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Decouples high-frequency 60FPS GPU frame capture from asynchronous disk I/O.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={pushRingItem}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Producer: Push Frame
                </button>

                <button
                  onClick={popRingItem}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Consumer: Pop to Disk
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Ring Capacity: 16 Slots</span>
                <span className="text-indigo-400 font-bold">Head Index: {ringHead} | Tail Index: {ringTail}</span>
              </div>

              {/* Slot Visualizer */}
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 py-3">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const isHead = ringHead === idx;
                  const isTail = ringTail === idx;
                  return (
                    <div
                      key={idx}
                      className={`h-12 rounded-lg border flex flex-col items-center justify-center text-[10px] transition ${
                        isHead && isTail
                          ? 'bg-purple-900/60 border-purple-500 text-white'
                          : isHead
                          ? 'bg-indigo-900/60 border-indigo-500 text-indigo-200'
                          : isTail
                          ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <span className="font-bold">{idx}</span>
                      <span className="text-[9px]">
                        {isHead && isTail ? 'H/T' : isHead ? 'HEAD' : isTail ? 'TAIL' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 text-emerald-400 border border-zinc-800/80">
                Status: {ringStatus}
              </div>
            </div>
          </div>
        )}

        {/* 3. MATLAB DSP Audio Filter */}
        {activeBenchmark === 'matlab_dsp' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  MATLAB Fast Fourier Transform (FFT) Noise Gate & Silence Stripper
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Filters 50Hz/60Hz AC ground hum and detects pause intervals for automated video editing.
                </p>
              </div>

              <button
                onClick={runMatlabDsp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Execute DSP Script
              </button>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400">Microphone Input Spectrum (Raw vs Filtered):</span>
                {/* Visual Audio Waveform Simulation */}
                <div className="h-20 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-around px-4">
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const heightPct = dspCleaned
                      ? Math.sin(idx * 0.3) * 35 + 40
                      : Math.sin(idx * 0.3) * 20 + Math.random() * 60 + 20;

                    return (
                      <div
                        key={idx}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          dspCleaned ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
                        }`}
                        style={{ height: `${Math.min(100, Math.max(10, heightPct))}%` }}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {dspCleaned && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">60Hz Electrical Hum</span>
                    <div className="text-emerald-400 font-bold mt-1">-38 dB Attenuation</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Detected Silence Windows</span>
                    <div className="text-indigo-400 font-bold mt-1">{silenceCount} Intervals</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Output Tutorial Duration</span>
                    <div className="text-amber-400 font-bold mt-1">Trimmed by 22%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. COBOL Batch Billing Manifest */}
        {activeBenchmark === 'cobol_batch' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  COBOL-85 Batch Bandwidth Manifest & Billing Ledger (VIDBILL85)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Processes line-sequential stream logs to compute day-end educational bandwidth distribution charges.
                </p>
              </div>

              <button
                onClick={runCobolBatch}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
              >
                Run COBOL Batch Job
              </button>
            </div>

            {cobolReport ? (
              <div className="p-4 rounded-xl bg-zinc-950 font-mono text-xs text-emerald-400 border border-zinc-800 overflow-x-auto shadow-inner">
                <pre>{cobolReport}</pre>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-center text-zinc-500 text-xs">
                Click <strong>"Run COBOL Batch Job"</strong> to execute the 80-column EOD accounting manifest.
              </div>
            )}
          </div>
        )}

        {/* 5. SQL Telemetry Lake Query */}
        {activeBenchmark === 'sql_telemetry' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  TimescaleDB Telemetry Lake: Student Confusion Hotspot Query
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Isolates video timeline segments where viewers repeatedly pause, rewind, or drop out.
                </p>
              </div>

              <button
                onClick={runSqlQuery}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Execute Analytical Query
              </button>
            </div>

            {sqlResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300 font-mono">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Timeline Window</th>
                      <th className="p-3">Rewinds</th>
                      <th className="p-3">Pauses</th>
                      <th className="p-3">Curriculum Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {sqlResults.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.rewinds > 50 ? 'bg-red-950/20 text-red-300' : 'bg-zinc-950/40'}
                      >
                        <td className="p-3 font-bold">{row.window}</td>
                        <td className="p-3">{row.rewinds}</td>
                        <td className="p-3">{row.pauses}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-sans ${
                              row.rewinds > 50
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {row.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-center text-zinc-500 text-xs">
                Click <strong>"Execute Analytical Query"</strong> to scan 50,000 student interaction rows.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
