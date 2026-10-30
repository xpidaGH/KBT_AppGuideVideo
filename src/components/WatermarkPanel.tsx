import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Sliders, Check, Trash2, Eye } from 'lucide-react';
import {
  DEFAULT_WATERMARK_PRESETS,
  WATERMARK_POSITIONS,
  WatermarkPositionType,
} from '../data/structuredStudioData';

export interface WatermarkSettings {
  enabled: boolean;
  dataUrl: string | null;
  opacity: number; // 0.1 to 1.0
  position: WatermarkPositionType;
  scale: number; // 0.1 to 0.4
}

interface WatermarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WatermarkSettings;
  onUpdateSettings: (settings: Partial<WatermarkSettings>) => void;
}

export const WatermarkPanel: React.FC<WatermarkPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('svg') && !file.type.includes('image')) {
      alert('Please upload a valid PNG or SVG image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateSettings({ dataUrl: result, enabled: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (svgContent: string) => {
    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    onUpdateSettings({ dataUrl: encoded, enabled: true });
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
              Recording Watermark & Branding
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  settings.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {settings.enabled ? 'Burned into Canvas' : 'Off'}
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">
              Upload custom PNG/SVG logo to burn directly into video stream
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Upload & Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
                className="rounded bg-zinc-800 border-zinc-700 text-pink-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Enable Watermark Burning</span>
            </label>

            {settings.dataUrl && (
              <button
                onClick={() => onUpdateSettings({ dataUrl: null, enabled: false })}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,image/png,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-pink-500/60 bg-zinc-950/60 text-xs font-semibold text-zinc-300 hover:text-white transition group"
            >
              <Upload className="w-4 h-4 text-pink-400 group-hover:scale-110 transition" />
              <span>Upload Custom PNG or SVG</span>
            </button>
          </div>

          {/* Presets List */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-zinc-400 font-mono">Or choose a built-in brand preset:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {DEFAULT_WATERMARK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.svg)}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-pink-500/40 text-[11px] font-semibold text-zinc-300 hover:text-white text-center transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Opacity & Position Controls */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          {/* Opacity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span>Opacity</span>
              <span className="font-mono text-pink-400 font-bold">{Math.round(settings.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => onUpdateSettings({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Scale Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span>Watermark Size Scale</span>
              <span className="font-mono text-pink-400 font-bold">{Math.round(settings.scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.45"
              step="0.02"
              value={settings.scale}
              onChange={(e) => onUpdateSettings({ scale: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Position Selector */}
          <div className="space-y-1.5">
            <span className="text-xs text-zinc-300 font-medium">Corner Positioning</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {WATERMARK_POSITIONS.map((pos) => {
                const isSelected = settings.position === pos.id;
                return (
                  <button
                    key={pos.id}
                    onClick={() => onUpdateSettings({ position: pos.id })}
                    className={`py-1 px-2 rounded-lg text-xs font-mono border transition ${
                      isSelected
                        ? 'bg-pink-950 text-pink-200 border-pink-500 font-bold shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
