import React, { useState, useEffect } from 'react';
import {
  X,
  Keyboard,
  Play,
  Activity,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { KEYBOARD_SHORTCUTS, KeyboardShortcutDef } from '../data/recorderConfig';
import { audioNotification } from '../utils/audioNotification';

interface HotkeyDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventLogItem {
  id: string;
  action: string;
  timestamp: string;
  source: string;
}

export const HotkeyDebugModal: React.FC<HotkeyDebugModalProps> = ({ isOpen, onClose }) => {
  const [eventLogs, setEventLogs] = useState<EventLogItem[]>([]);
  const [customAction, setCustomAction] = useState<string>('FAST_EXPORT');

  useEffect(() => {
    const handleHotkey = (e: any) => {
      const detail = e.detail || {};
      const newLog: EventLogItem = {
        id: `log-${Date.now()}-${Math.random()}`,
        action: detail.action || 'UNKNOWN',
        timestamp: new Date().toLocaleTimeString(),
        source: detail.source || 'keyboard / bus',
      };
      setEventLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    };

    window.addEventListener('kbt-hotkey', handleHotkey);
    return () => window.removeEventListener('kbt-hotkey', handleHotkey);
  }, []);

  if (!isOpen) return null;

  const handleManualDispatch = (action: string) => {
    audioNotification.playHotkeyTriggerSound();
    window.dispatchEvent(
      new CustomEvent('kbt-hotkey', { detail: { action, source: 'debug-modal' } })
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>KBT Hotkey Event Bus Debugger</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CustomEvent Inspector
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Inspect active key listeners and dispatch custom events to verify decoupled reactive buses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Active Key Listeners Grid */}
          <div className="space-y-2">
            <span className="font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
              Active System Listeners ({KEYBOARD_SHORTCUTS.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KEYBOARD_SHORTCUTS.map((sc) => (
                <button
                  key={sc.action + sc.displayKey}
                  type="button"
                  onClick={() => handleManualDispatch(sc.action)}
                  title={`Click to manually dispatch ${sc.action}`}
                  className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900 transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-white text-[11px] group-hover:text-indigo-300">
                      {sc.action}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate max-w-[110px]">
                      {sc.description}
                    </div>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-mono text-[9px]">
                    {sc.displayKey}
                  </kbd>
                </button>
              ))}
            </div>
          </div>

          {/* Event Dispatch Console */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <span className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Manual CustomEvent Dispatch:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="Custom action name e.g. FAST_EXPORT"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleManualDispatch(customAction)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Dispatch Event</span>
              </button>
            </div>
          </div>

          {/* Real-Time Event Bus Activity Log */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Bus Stream ({eventLogs.length} events logged)
              </span>
              <button
                type="button"
                onClick={() => setEventLogs([])}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                Clear Log
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] max-h-40 overflow-y-auto space-y-1.5">
              {eventLogs.length === 0 ? (
                <div className="text-zinc-600 text-center py-4">
                  Waiting for events... Trigger a shortcut or click any button above.
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">[{log.timestamp}]</span>
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{log.source}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
          >
            Close Debugger
          </button>
        </div>
      </div>
    </div>
  );
};
