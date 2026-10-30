import React from 'react';
import {
  X,
  Play,
  Square,
  Camera,
  Mic,
  Clock,
  Sparkles,
  Download,
  RotateCcw,
  Crop,
  Layers,
  Palette,
  Activity,
  Sliders,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { KeyboardShortcutDef, KEYBOARD_SHORTCUTS } from '../data/recorderConfig';
import { audioNotification } from '../utils/audioNotification';

export interface StudioActionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcutDef[];
  isRecording?: boolean;
  isCameraActive?: boolean;
  isMicActive?: boolean;
  isDrawActive?: boolean;
  isTelemetryActive?: boolean;
  isCropActive?: boolean;
  isTimerActive?: boolean;
  onTriggerAction?: (action: string) => void;
}

export const StudioActionsSidebar: React.FC<StudioActionsSidebarProps> = ({
  isOpen,
  onClose,
  shortcuts = KEYBOARD_SHORTCUTS,
  isRecording = false,
  isCameraActive,
  isMicActive,
  isDrawActive,
  isTelemetryActive,
  isCropActive,
  isTimerActive,
  onTriggerAction,
}) => {
  if (!isOpen) return null;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'TOGGLE_RECORDING':
        return isRecording ? Square : Play;
      case 'FAST_EXPORT':
        return Download;
      case 'ADVANCED_EXPORT':
        return Sliders;
      case 'TOGGLE_CAM':
        return Camera;
      case 'TOGGLE_MIC':
        return Mic;
      case 'TOGGLE_TIMER':
        return Clock;
      case 'CYCLE_FILTER':
        return Palette;
      case 'TOGGLE_DRAW':
        return Sparkles;
      case 'TOGGLE_TELEMETRY':
        return Activity;
      case 'TOGGLE_CROP':
        return Crop;
      case 'RESET_STUDIO':
        return RotateCcw;
      default:
        return ChevronRight;
    }
  };

  const handleClick = (action: string) => {
    audioNotification.playHotkeyTriggerSound();
    if (onTriggerAction) {
      onTriggerAction(action);
    } else {
      window.dispatchEvent(new CustomEvent('kbt-hotkey', { detail: { action } }));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Studio Actions
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                  1-Click Control
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Visual control alternative to keyboard-only hotkeys
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Commands List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {shortcuts.map((sc) => {
            const Icon = getActionIcon(sc.action);
            const isRecAction = sc.action === 'TOGGLE_RECORDING';
            const isFastExport = sc.action === 'FAST_EXPORT';

            return (
              <button
                key={sc.action + sc.displayKey}
                type="button"
                onClick={() => handleClick(sc.action)}
                className={`w-full p-3 rounded-2xl border transition flex items-center justify-between text-left cursor-pointer group active:scale-[0.98] ${
                  isRecAction && isRecording
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40'
                    : isFastExport
                    ? 'bg-emerald-950/40 border-emerald-500/60 hover:bg-emerald-900/40 text-emerald-200'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-indigo-500/60 hover:bg-zinc-900 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border ${
                      isRecAction && isRecording
                        ? 'bg-rose-600 text-white border-rose-400'
                        : isFastExport
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 group-hover:bg-indigo-600 group-hover:text-white transition'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                      {sc.description}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">{sc.action}</div>
                  </div>
                </div>

                <kbd className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-amber-300 font-mono font-bold text-[10px] shadow-sm">
                  {sc.displayKey}
                </kbd>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
          <span>Click any action to execute immediately</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
