import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Pause,
  Play,
  Square,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Hourglass,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  Layers,
  Settings2
} from 'lucide-react';

export interface VisualRecordingTimerProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingSeconds: number;
  framerate?: number;
  format?: string;
  onPauseToggle?: () => void;
  onStopRecording?: () => void;
  initialTargetSeconds?: number;
}

export const VisualRecordingTimer: React.FC<VisualRecordingTimerProps> = ({
  isRecording,
  isPaused,
  recordingSeconds,
  framerate = 60,
  format = 'MP4',
  onPauseToggle,
  onStopRecording,
  initialTargetSeconds = 600, // Default 10 min tutorial target
}) => {
  // Timer Display Mode: 'elapsed' (counts up), 'countdown' (counts down from target), 'dual' (both)
  const [displayMode, setDisplayMode] = useState<'elapsed' | 'countdown' | 'dual'>('elapsed');
  const [targetSeconds, setTargetSeconds] = useState<number>(initialTargetSeconds);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [dockPosition, setDockPosition] = useState<'top-center' | 'top-right' | 'bottom-center'>('top-center');

  // Do not render anything when not recording
  if (!isRecording) return null;

  // Breakdown Elapsed Time
  const elapsedHours = Math.floor(recordingSeconds / 3600);
  const elapsedMinutes = Math.floor((recordingSeconds % 3600) / 60);
  const elapsedSecs = Math.floor(recordingSeconds % 60);

  // Breakdown Countdown / Remaining Time
  const remainingTotal = Math.max(0, targetSeconds - recordingSeconds);
  const countHours = Math.floor(remainingTotal / 3600);
  const countMinutes = Math.floor((remainingTotal % 3600) / 60);
  const countSecs = Math.floor(remainingTotal % 60);

  // Progress percentage towards target
  const progressPercent = targetSeconds > 0 ? Math.min(100, Math.round((recordingSeconds / targetSeconds) * 100)) : 0;
  const isNearLimit = targetSeconds > 0 && remainingTotal <= 30 && remainingTotal > 0;
  const isOverTime = targetSeconds > 0 && recordingSeconds > targetSeconds;

  // Approximate file size written (assuming ~12-16 Mbps HD average)
  const estMbWritten = ((recordingSeconds * 1.8) + (recordingSeconds * 0.15)).toFixed(1);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Positioning classes
  const positionClass = useMemo(() => {
    switch (dockPosition) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-5 left-1/2 -translate-x-1/2';
      case 'top-center':
      default:
        return 'top-4 left-1/2 -translate-x-1/2';
    }
  }, [dockPosition]);

  return (
    <div
      id="visual-recording-countdown-timer"
      role="timer"
      aria-live="polite"
      aria-label={`Recording timer: ${pad(elapsedHours)} hours ${pad(elapsedMinutes)} minutes ${pad(elapsedSecs)} seconds elapsed`}
      className={`absolute ${positionClass} z-40 select-none pointer-events-auto transition-all duration-300 animate-in fade-in zoom-in-95`}
    >
      {/* MINIMIZED FLOATING PILL */}
      {isMinimized ? (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-950/95 backdrop-blur-md border border-red-500/60 shadow-xl shadow-red-500/10 text-white font-mono text-xs">
          {/* Pulsing REC dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isPaused ? 'bg-amber-400' : 'bg-red-400'
              } opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isPaused ? 'bg-amber-500' : 'bg-red-600'
              }`}
            />
          </span>

          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            {isPaused ? 'PAUSED' : 'REC'}
          </span>

          {/* Time digits */}
          <span className="font-extrabold text-white tracking-wider">
            {pad(elapsedHours)}:{pad(elapsedMinutes)}:{pad(elapsedSecs)}
          </span>

          {displayMode === 'countdown' && (
            <span className="text-zinc-400 text-[10px]">
              (-{pad(countMinutes)}:{pad(countSecs)})
            </span>
          )}

          {/* Expand Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            title="Expand Full Countdown Timer Deck"
            className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      ) : (
        /* EXPANDED FULL VISUAL COUNTDOWN TIMER DECK */
        <div className="w-[340px] sm:w-[410px] rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Top Header Bar */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-red-950/40 via-zinc-900/90 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Pulsing Recording Tally Dot */}
              <div className="relative flex items-center justify-center">
                <span
                  className={`animate-ping absolute inline-flex h-3 w-3 rounded-full ${
                    isPaused ? 'bg-amber-400' : 'bg-red-400'
                  } opacity-80`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isPaused ? 'bg-amber-500' : 'bg-red-600'
                  }`}
                />
              </div>

              <span className="font-mono text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                <span className={isPaused ? 'text-amber-400' : 'text-red-400'}>
                  {isPaused ? 'RECORDING PAUSED' : 'LIVE RECORDING'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-normal">
                  {framerate} FPS
                </span>
              </span>
            </div>

            {/* Mode Selector and Controls */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setDisplayMode('elapsed')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    displayMode === 'elapsed'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Display Elapsed Time"
                >
                  Elapsed
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('countdown')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    displayMode === 'countdown'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Display Countdown Remaining"
                >
                  Countdown
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('dual')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    displayMode === 'dual'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Display Both"
                >
                  Dual
                </button>
              </div>

              {/* Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                title="Configure countdown target limit"
                className={`p-1 rounded-md transition cursor-pointer ${
                  showConfig ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize Deck */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                title="Minimize timer to floating pill"
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Config Drawer (Target Limit & Dock Position) */}
          {showConfig && (
            <div className="px-3.5 py-2.5 bg-zinc-900/95 border-b border-zinc-800 text-xs space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-400" />
                  <span>Countdown Target:</span>
                </span>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {[
                    { label: '5m', sec: 300 },
                    { label: '10m', sec: 600 },
                    { label: '15m', sec: 900 },
                    { label: '30m', sec: 1800 },
                    { label: '60m', sec: 3600 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => setTargetSeconds(preset.sec)}
                      className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                        targetSeconds === preset.sec
                          ? 'bg-red-500/20 border-red-500/50 text-red-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/80">
                <span className="text-zinc-400">Dock Position:</span>
                <div className="flex gap-1 text-[10px] font-mono">
                  {(['top-center', 'top-right', 'bottom-center'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setDockPosition(pos)}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        dockPosition === pos
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {pos === 'top-center' ? 'Top' : pos === 'top-right' ? 'Right' : 'Bottom'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Visual Timer Digits Display */}
          <div className="p-4 space-y-3">
            {/* DIGIT CARDS: HOURS, MINUTES, SECONDS ELAPSED */}
            <div className="flex items-center justify-center gap-2">
              {/* Hours Card */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-zinc-900 border border-zinc-800/90 shadow-inner flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                    {displayMode === 'countdown' ? pad(countHours) : pad(elapsedHours)}
                  </span>
                  <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-zinc-600 font-bold">
                    H
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-1 font-bold">
                  Hours
                </span>
              </div>

              {/* Colon Separator with Pulsing Dot */}
              <div className="flex flex-col items-center justify-center gap-1 text-red-500 h-16 sm:h-20 pb-4">
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse'}`} />
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse'}`} />
              </div>

              {/* Minutes Card */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-zinc-900 border border-zinc-800/90 shadow-inner flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                    {displayMode === 'countdown' ? pad(countMinutes) : pad(elapsedMinutes)}
                  </span>
                  <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-zinc-600 font-bold">
                    M
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-1 font-bold">
                  Mins
                </span>
              </div>

              {/* Colon Separator with Pulsing Dot */}
              <div className="flex flex-col items-center justify-center gap-1 text-red-500 h-16 sm:h-20 pb-4">
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse'}`} />
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse'}`} />
              </div>

              {/* Seconds Card */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-zinc-900 border border-zinc-800/90 shadow-inner flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-black tracking-wider ${
                      isNearLimit ? 'text-amber-400 animate-pulse' : 'text-white'
                    }`}
                  >
                    {displayMode === 'countdown' ? pad(countSecs) : pad(elapsedSecs)}
                  </span>
                  <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-zinc-600 font-bold">
                    S
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-1 font-bold">
                  Secs
                </span>
              </div>
            </div>

            {/* DUAL MODE SUB-COUNTER OR COUNTDOWN REMAINING CALLOUT */}
            {displayMode === 'dual' ? (
              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Elapsed:</span>
                  <strong className="text-white">
                    {pad(elapsedHours)}:{pad(elapsedMinutes)}:{pad(elapsedSecs)}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Countdown:</span>
                  <strong className={isNearLimit ? 'text-amber-400' : 'text-zinc-200'}>
                    {pad(countHours)}:{pad(countMinutes)}:{pad(countSecs)}
                  </strong>
                </div>
              </div>
            ) : displayMode === 'countdown' ? (
              <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Elapsed Total:</span>
                <span className="text-zinc-200 font-semibold">
                  {pad(elapsedHours)}:{pad(elapsedMinutes)}:{pad(elapsedSecs)}
                </span>
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Target Limit ({Math.round(targetSeconds / 60)}m):</span>
                <span className={isNearLimit ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
                  {remainingTotal > 0 ? `-${pad(countMinutes)}:${pad(countSecs)} left` : 'Target Exceeded'}
                </span>
              </div>
            )}

            {/* Visual Progress Bar towards Target Session */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Session Target Progress</span>
                <span className={isNearLimit ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isOverTime
                      ? 'bg-red-500'
                      : isNearLimit
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-red-600 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Bottom Quick Controls & Status Readout */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {onPauseToggle && (
                  <button
                    type="button"
                    onClick={onPauseToggle}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isPaused
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                )}

                {onStopRecording && (
                  <button
                    type="button"
                    onClick={onStopRecording}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/40 transition cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current text-red-500" />
                    <span>Stop</span>
                  </button>
                )}
              </div>

              {/* Telemetry Metric (Written Size & Format) */}
              <div className="text-right text-[10px] font-mono text-zinc-400">
                <span className="text-zinc-300 font-bold">{estMbWritten} MB</span>
                <span className="text-zinc-600"> • </span>
                <span className="text-indigo-400 font-semibold">{format}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
