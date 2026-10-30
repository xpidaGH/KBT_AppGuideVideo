import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Cloud,
  Monitor,
  Smartphone,
  HardDrive,
  Sliders,
  Volume2,
} from 'lucide-react';
import {
  GlobalExportTemplate,
  GLOBAL_EXPORT_TEMPLATES,
} from '../data/structuredStudioData';
import {
  fetchGlobalTemplates,
  saveGlobalTemplate,
  deleteGlobalTemplate,
} from '../services/firebaseSync';

interface GlobalExportTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateId?: string | null;
  currentSettings?: any;
  onApplyTemplate: (template: GlobalExportTemplate) => void;
}

export const GlobalExportTemplatesModal: React.FC<GlobalExportTemplatesModalProps> = ({
  isOpen,
  onClose,
  activeTemplateId = null,
  currentSettings,
  onApplyTemplate,
}) => {
  const [templates, setTemplates] = useState<GlobalExportTemplate[]>(GLOBAL_EXPORT_TEMPLATES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState<string>('');
  const [format, setFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [bitrateKbps, setBitrateKbps] = useState<number>(6000);
  const [framerate, setFramerate] = useState<30 | 60>(60);
  const [lufsTarget, setLufsTarget] = useState<number>(-14);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchGlobalTemplates()
        .then((data) => setTemplates(data))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTemplate: GlobalExportTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      badge: `${resolution} ${framerate}fps`,
      description: description.trim() || `Custom ${resolution} ${format.toUpperCase()} template`,
      format,
      codec: format === 'mp4' ? 'H.264 / AAC' : format === 'webm' ? 'VP9 / Opus' : 'GIF89a',
      resolution,
      aspectRatio,
      bitrateKbps,
      framerate,
      lufsTarget,
    };

    const saved = await saveGlobalTemplate(newTemplate);
    setTemplates((prev) => [...prev, saved]);
    setIsCreating(false);
    setName('');
    setDescription('');
    onApplyTemplate(saved);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteGlobalTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Global Export Templates</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Firestore Synced
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Instantly toggle between 'Presentation Ready', 'Mobile Social', and 'Raw Archive' modes
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Preset Templates ({templates.length})
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'Cancel' : 'New Template'}</span>
            </button>
          </div>

          {/* New Template Form */}
          {isCreating && (
            <form
              onSubmit={handleSaveNew}
              className="p-4 rounded-2xl bg-zinc-950 border border-purple-500/40 space-y-3 text-xs animate-in slide-in-from-top-2"
            >
              <div className="font-bold text-white flex items-center gap-1.5 pb-1 border-b border-zinc-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Create Global Export Template</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Template Name:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Master Tech Screencast"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Resolution & Ratio:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as any)}
                      className="px-2 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                    >
                      <option value="1080p">1080p Full HD</option>
                      <option value="720p">720p HD</option>
                    </select>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as any)}
                      className="px-2 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait</option>
                      <option value="1:1">1:1 Square</option>
                      <option value="4:3">4:3 Standard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Format & Framerate:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="px-2 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs uppercase"
                    >
                      <option value="mp4">MP4 Video</option>
                      <option value="webm">WebM Stream</option>
                      <option value="gif">Animated GIF</option>
                    </select>
                    <select
                      value={framerate}
                      onChange={(e) => setFramerate(Number(e.target.value) as any)}
                      className="px-2 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                    >
                      <option value={60}>60 FPS</option>
                      <option value={30}>30 FPS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target LUFS Loudness:</label>
                  <select
                    value={lufsTarget}
                    onChange={(e) => setLufsTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                  >
                    <option value={-14}>-14 LUFS (YouTube Standard)</option>
                    <option value={-16}>-16 LUFS (Podcasts & Voice)</option>
                    <option value={-23}>-23 LUFS (EBU Broadcast)</option>
                    <option value={-11}>-11 LUFS (High Energy Mobile)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Description:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of this export mode and use case"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save & Sync Template
                </button>
              </div>
            </form>
          )}

          {/* Template Cards */}
          <div className="space-y-3">
            {templates.map((tpl) => {
              const isActive = activeTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-purple-950/40 border-purple-500/70 ring-1 ring-purple-500/30'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{tpl.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        {tpl.format}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {tpl.resolution} • {tpl.framerate}fps • {tpl.aspectRatio}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800">
                        {tpl.lufsTarget} LUFS
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active Mode</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{tpl.description}</p>
                    <div className="text-[10px] text-zinc-500 font-mono">Codec: {tpl.codec}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyTemplate(tpl);
                        onClose();
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 hover:bg-purple-600 text-zinc-200 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Applied' : 'Load Template'}</span>
                    </button>

                    {tpl.id !== 'presentation-ready' &&
                      tpl.id !== 'mobile-social' &&
                      tpl.id !== 'raw-archive' && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(tpl.id, e)}
                          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 border border-zinc-800"
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
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-purple-400" />
            <span>Templates automatically persist to Firestore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
