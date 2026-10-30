import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Type,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  FlipHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface TeleprompterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguageName: string;
}

const DEFAULT_SCRIPT = `Welcome back everyone! In this systems engineering tutorial, we're examining low-level SIMD vectorization and AVX-512 memory layouts.

Today we'll compare hand-tuned assembly kernels with compiler auto-vectorization across x86-64 and ARM NEON architectures.

First, let's open the terminal and compile our SIMD benchmark with maximum optimization flags.
Notice the cache miss rate and throughput metrics on our live telemetry dashboard.

Follow along as we inspect the memory alignments and register usage in real time. Let's get started!`;

export const TeleprompterOverlay: React.FC<TeleprompterOverlayProps> = ({
  isOpen,
  onClose,
  selectedLanguageName,
}) => {
  const [scriptText, setScriptText] = useState<string>(DEFAULT_SCRIPT);
  const [isEditingScript, setIsEditingScript] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(35); // pixels per second
  const [fontSize, setFontSize] = useState<number>(24);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(0.85);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Auto-scroll loop
  useEffect(() => {
    let animId: number;

    const scrollLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying && scrollContainerRef.current) {
        scrollPosRef.current += scrollSpeed * delta;
        const maxScroll =
          scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;

        if (scrollPosRef.current >= maxScroll + 100) {
          // Reset to start when script ends
          scrollPosRef.current = 0;
          setIsPlaying(false);
        }

        scrollContainerRef.current.scrollTop = scrollPosRef.current;
      }

      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, scrollSpeed]);

  if (!isOpen) return null;

  const handleResetScroll = () => {
    scrollPosRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <div
      id="ai-teleprompter-overlay"
      style={{
        backgroundColor: `rgba(9, 9, 11, ${opacity})`,
      }}
      className="absolute top-12 left-1/2 -translate-x-1/2 w-[92%] sm:w-[84%] max-w-3xl z-40 rounded-3xl border border-indigo-500/50 shadow-2xl backdrop-blur-md overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Teleprompter Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/90 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-wide">AI Teleprompter</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-indigo-300 border border-indigo-500/30">
            {selectedLanguageName}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Scroll'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetScroll}
            title="Rewind script to top"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsEditingScript(!isEditingScript)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isEditingScript
                ? 'bg-purple-950/60 text-purple-300 border-purple-600/60'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            {isEditingScript ? 'Done Editing' : 'Edit Script'}
          </button>

          {/* Mirror Toggle */}
          <button
            type="button"
            onClick={() => setIsMirrored(!isMirrored)}
            title="Mirror text horizontally (Glass Teleprompter beam-splitter mode)"
            className={`p-1.5 rounded-lg border transition ${
              isMirrored
                ? 'bg-indigo-950 text-indigo-300 border-indigo-600'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adjustable Parameters Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-1.5 border-b border-zinc-800/80 bg-zinc-950/60 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Speed:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(parseInt(e.target.value, 10))}
            className="w-24 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-indigo-300 font-bold">{scrollSpeed} px/s</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Size:</span>
          {[18, 24, 30].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setFontSize(sz)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                fontSize === sz
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Opacity:</span>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* Script Viewing & Scrolling Body */}
      {isEditingScript ? (
        <div className="p-4 bg-zinc-950">
          <textarea
            rows={7}
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Paste your tutorial speech script here..."
            className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          style={{
            transform: isMirrored ? 'scaleX(-1)' : 'none',
          }}
          className="relative max-h-56 sm:max-h-64 overflow-y-auto px-6 py-6 scroll-smooth text-center"
        >
          {/* Eyeline Focus Marker Guide */}
          <div className="sticky top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-between px-2 opacity-30 z-10">
            <div className="w-4 h-0.5 bg-amber-400" />
            <div className="flex-1 border-t border-amber-400/40 border-dashed mx-2" />
            <div className="w-4 h-0.5 bg-amber-400" />
          </div>

          <div
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            className="font-sans font-bold text-white tracking-wide space-y-4 max-w-2xl mx-auto"
          >
            {scriptText.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="hover:text-amber-200 transition-colors">
                {paragraph}
              </p>
            ))}
          </div>

          {/* End buffer for smooth scrolling */}
          <div className="h-32" />
        </div>
      )}
    </div>
  );
};
