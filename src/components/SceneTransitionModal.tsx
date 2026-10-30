import React from 'react';
import {
  Sparkles,
  Sliders,
  X,
  Play,
  Check,
  Layers,
  ArrowRight,
  Circle,
  Eye,
} from 'lucide-react';

export type SceneTransitionType = 'fade' | 'slide-left' | 'slide-up' | 'wipe-horizontal' | 'iris-circle' | 'cut';

export interface SceneTransitionConfig {
  type: SceneTransitionType;
  durationMs: number;
}

export const SCENE_TRANSITION_PRESETS: Array<{
  id: SceneTransitionType;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'fade',
    name: 'Cross Fade',
    description: 'Smooth alpha dissolve between capture sources',
    icon: '✨',
  },
  {
    id: 'slide-left',
    name: 'Push Slide Left',
    description: 'Incoming scene slides smoothly from right to left',
    icon: '➡️',
  },
  {
    id: 'slide-up',
    name: 'Push Slide Up',
    description: 'Incoming scene glides upward into frame',
    icon: '⬆️',
  },
  {
    id: 'wipe-horizontal',
    name: 'Linear Wipe',
    description: 'Sharp or feathered sweep across the horizontal axis',
    icon: '↔️',
  },
  {
    id: 'iris-circle',
    name: 'Iris Radial Wipe',
    description: 'Classic cinema expanding spotlight aperture',
    icon: '🎯',
  },
  {
    id: 'cut',
    name: 'Hard Cut',
    description: 'Instant zero-frame immediate switch',
    icon: '⚡',
  },
];

interface SceneTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SceneTransitionConfig;
  onUpdateConfig: (updated: Partial<SceneTransitionConfig>) => void;
  onTestTransition: () => void;
}

export const SceneTransitionModal: React.FC<SceneTransitionModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTestTransition,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Scene Transitions</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold uppercase">
                  Live Engine
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Configure transitions when switching capture sources (Simulator ↔ Screen)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transition Presets Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Transition Style</span>
            <span className="text-[11px] font-mono text-indigo-400">
              Active: {config.type.toUpperCase()}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {SCENE_TRANSITION_PRESETS.map((preset) => {
              const isSelected = config.type === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => onUpdateConfig({ type: preset.id })}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{preset.icon}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs">{preset.name}</p>
                    <p className="text-[10px] text-zinc-400 leading-tight">{preset.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transition Duration Slider */}
        <div className="space-y-2 pt-2 border-t border-zinc-900">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">Transition Duration</span>
            <span className="font-mono text-indigo-300 font-bold">{config.durationMs} ms</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="150"
              max="1200"
              step="50"
              value={config.durationMs}
              onChange={(e) => onUpdateConfig({ durationMs: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>150ms (Snappy)</span>
            <span>500ms (Balanced)</span>
            <span>1200ms (Cinema)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onTestTransition}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Transition</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
