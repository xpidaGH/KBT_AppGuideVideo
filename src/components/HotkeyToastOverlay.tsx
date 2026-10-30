import React, { useEffect, useState, useRef } from 'react';
import { Keyboard, CheckCircle2 } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '../data/recorderConfig';

interface HotkeyToast {
  id: number;
  displayKey: string;
  description: string;
  action: string;
}

export const HotkeyToastOverlay: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<HotkeyToast | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleCustomHotkey = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      const action = customEvent.detail?.action;
      if (!action) return;

      const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === action);
      const displayKey = shortcut?.displayKey || 'KEY';
      const description = shortcut?.description || action.replace(/_/g, ' ');

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setCurrentToast({
        id: Date.now(),
        displayKey,
        description,
        action,
      });

      timeoutRef.current = window.setTimeout(() => {
        setCurrentToast(null);
      }, 2000);
    };

    window.addEventListener('kbt-hotkey', handleCustomHotkey);
    return () => {
      window.removeEventListener('kbt-hotkey', handleCustomHotkey);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!currentToast) return null;

  return (
    <div
      id="hotkey-screen-toast-overlay"
      className="absolute top-16 left-1/2 -translate-x-1/2 z-45 pointer-events-none select-none animate-in fade-in slide-in-from-top-3 duration-150"
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-amber-500/60 shadow-2xl shadow-amber-500/20 text-xs font-mono text-white">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Keyboard className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 rounded-md bg-zinc-900 border border-amber-400/50 text-amber-300 font-bold text-xs shadow-inner">
            {currentToast.displayKey}
          </kbd>
          <span className="font-sans font-semibold text-zinc-100 text-xs">
            {currentToast.description}
          </span>
        </div>

        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
      </div>

      {/* 2-second shrinking timer bar */}
      <div className="w-full h-0.5 mt-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 animate-[shrinkWidth_2s_linear_forwards]" />
      </div>
    </div>
  );
};
