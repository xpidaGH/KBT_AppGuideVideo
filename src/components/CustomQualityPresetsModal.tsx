import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  Plus,
  Trash2,
  HardDrive,
  Cloud,
  Layers,
  Sparkles,
  Cpu,
  Monitor,
  Smartphone,
  Save,
} from 'lucide-react';
import {
  CustomQualityPreset,
  fetchQualityPresets,
  saveQualityPreset,
  deleteQualityPreset,
  DEFAULT_QUALITY_PRESETS,
} from '../services/firebaseSync';
import { ExportFormatId } from '../types';

interface CustomQualityPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuality: '1080p' | '720p';
  currentFramerate: 30 | 60;
  currentFormat: ExportFormatId;
  onApplyPreset: (preset: CustomQualityPreset) => void;
}

export const CustomQualityPresetsModal: React.FC<CustomQualityPresetsModalProps> = ({
  isOpen,
  onClose,
  currentQuality,
  currentFramerate,
  currentFormat,
  onApplyPreset,
}) => {
  const [presets, setPresets] = useState<CustomQualityPreset[]>(DEFAULT_QUALITY_PRESETS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // New preset form fields
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newQuality, setNewQuality] = useState<'1080p' | '720p'>(currentQuality);
  const [newFramerate, setNewFramerate] = useState<30 | 60>(currentFramerate);
  const [newBitrate, setNewBitrate] = useState<number>(6000);
  const [newFormat, setNewFormat] = useState<'mp4' | 'webm' | 'gif'>(
    currentFormat === 'gif' ? 'gif' : currentFormat === 'webm' ? 'webm' : 'mp4'
  );
  const [newDescription, setNewDescription] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchQualityPresets()
        .then((data) => {
          setPresets(data);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    try {
      const created = await saveQualityPreset({
        name: newPresetName.trim(),
        quality: newQuality,
        framerate: newFramerate,
        bitrateKbps: newBitrate,
        format: newFormat,
        description: newDescription.trim() || undefined,
      });

      setPresets((prev) => {
        const idx = prev.findIndex((p) => p.id === created.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = created;
          return updated;
        }
        return [...prev, created];
      });

      setSaveSuccessMsg(`Saved preset "${created.name}" to Firestore & Local Storage!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setIsCreating(false);
      setNewPresetName('');
      setNewDescription('');

      // Automatically apply the freshly created preset
      onApplyPreset(created);
    } catch (err) {
      console.error('Failed to save custom quality preset:', err);
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await deleteQualityPreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete preset:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Custom Quality & Encoding Presets</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Firestore Persisted
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Configure bitrate, resolution, and framerate presets synced across sessions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {saveSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Quick Action: New Preset Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Available Presets ({presets.length})
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isCreating ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isCreating ? 'Cancel' : 'Create Custom Preset'}</span>
            </button>
          </div>

          {/* Create Preset Form */}
          {isCreating && (
            <form
              onSubmit={handleCreatePreset}
              className="p-4 rounded-2xl bg-zinc-950 border border-indigo-500/40 space-y-4 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Configure New Quality Preset</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Saves to Firebase Firestore
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Preset Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g. 1080p 60fps High Bitrate"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-indigo-500 focus:outline-none font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Resolution:
                  </label>
                  <select
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-indigo-500 focus:outline-none font-semibold text-xs"
                  >
                    <option value="1080p">1080p (1920×1080 Full HD)</option>
                    <option value="720p">720p (1280×720 HD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Frame Rate:
                  </label>
                  <select
                    value={newFramerate}
                    onChange={(e) => setNewFramerate(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-indigo-500 focus:outline-none font-semibold text-xs"
                  >
                    <option value={60}>60 FPS (Ultra Smooth Motion)</option>
                    <option value={30}>30 FPS (Standard Broadcast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Target Bitrate (kbps):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1000}
                      max={16000}
                      step={500}
                      value={newBitrate}
                      onChange={(e) => setNewBitrate(Number(e.target.value))}
                      className="flex-1 accent-indigo-500 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-indigo-300 w-16 text-right">
                      {newBitrate}k
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Preferred Format:
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-indigo-500 focus:outline-none font-semibold text-xs uppercase"
                  >
                    <option value="mp4">MP4 (H.264 Universal)</option>
                    <option value="webm">WEBM (VP9 Modern Web)</option>
                    <option value="gif">GIF (Animated Loop)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Description (optional):
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. Optimized for low-bandwidth cellular viewers"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-indigo-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preset to Cloud</span>
                </button>
              </div>
            </form>
          )}

          {/* Presets List */}
          <div className="space-y-3">
            {presets.map((p) => {
              const isMatch =
                p.quality === currentQuality &&
                p.framerate === currentFramerate &&
                p.format === currentFormat;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isMatch
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        .{p.format}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {p.quality} @ {p.framerate}fps
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-amber-400 border border-zinc-800">
                        {p.bitrateKbps} kbps
                      </span>
                      {isMatch && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-zinc-400 leading-snug">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyPreset(p);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isMatch
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          : 'bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isMatch ? 'Active Preset' : 'Apply Preset'}</span>
                    </button>

                    {!p.id.startsWith('preset_1080p_60_high') &&
                      !p.id.startsWith('preset_720p_30_mobile') &&
                      !p.id.startsWith('preset_1080p_30_web') && (
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(p.id)}
                          title="Delete custom preset"
                          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-950/50 text-zinc-500 hover:text-red-300 border border-zinc-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preset configurations automatically sync to Firestore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
