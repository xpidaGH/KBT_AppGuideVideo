import React from 'react';
import { X, Sparkles, Sliders, Check, Tv, Film, Eye } from 'lucide-react';
import { ColorFilterId, ColorFilterPreset } from '../types';
import { COLOR_FILTER_PRESETS } from '../utils/colorFilterPipeline';

interface FilterLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilter: ColorFilterId;
  onSelectFilter: (id: ColorFilterId) => void;
}

export const FilterLibraryModal: React.FC<FilterLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedFilter,
  onSelectFilter,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Post-Processing Filter Library</h2>
              <p className="text-xs text-zinc-400">
                Real-time color grading, film LUTs, and retro hardware emulation baked into recorded video
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close filter library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Filter Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_FILTER_PRESETS.map((preset) => {
              const isSelected = selectedFilter === preset.id;
              const isRetro = preset.id === 'vhs-glitch' || preset.id === 'crt-scanlines';

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectFilter(preset.id);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
                      : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Visual Filter Preview Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                        {isRetro && <Tv className="w-3.5 h-3.5 text-pink-400" />}
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <span className="p-1 rounded-full bg-indigo-600 text-white shadow-sm">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {preset.label}
                        </span>
                      )}
                    </div>

                    {/* Gradient preview swatch */}
                    <div
                      className={`h-14 w-full rounded-lg bg-gradient-to-r ${preset.previewGradient} shadow-inner flex items-center justify-center relative overflow-hidden`}
                    >
                      {preset.id === 'vhs-glitch' && (
                        <div className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 bg-black/60 px-2 py-0.5 rounded border border-emerald-400/30">
                          VHS PLAY ▶
                        </div>
                      )}
                      {preset.id === 'crt-scanlines' && (
                        <div className="text-[10px] font-mono font-bold text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/40">
                          CRT PHOSPHOR 60Hz
                        </div>
                      )}
                      {preset.id === 'grayscale' && (
                        <div className="text-[10px] font-mono font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded">
                          ITU-R BT.709
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {preset.id === 'none' ? 'Raw Buffer' : 'Real-time Canvas LUT'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFilter(preset.id);
                        onClose();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {isSelected ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400">
          <span>Filters are applied in real time to the live video feed and baked into the final export</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
