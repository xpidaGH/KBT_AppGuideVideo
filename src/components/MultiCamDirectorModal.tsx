import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Layers,
  Monitor,
  Video,
  Check,
  Sparkles,
  Maximize2,
  Minimize2,
  Layout,
  Sliders,
  Move,
  RefreshCw,
} from 'lucide-react';

export interface MultiCamConfig {
  isPipEnabled: boolean;
  primarySource: 'screen' | 'camera_main' | 'external_card';
  secondarySource?: 'webcam' | 'screen' | 'external_card';
  pipDeviceId: string | null;
  pipPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  pipShape: 'circle' | 'rounded-rect' | 'square';
  pipSize: 'small' | 'medium' | 'large';
  pipMirror: boolean;
  pipBorderColor: string;
}

export const DEFAULT_MULTICAM_CONFIG: MultiCamConfig = {
  isPipEnabled: true,
  primarySource: 'screen',
  secondarySource: 'webcam',
  pipDeviceId: null,
  pipPosition: 'bottom-right',
  pipShape: 'circle',
  pipSize: 'medium',
  pipMirror: true,
  pipBorderColor: '#6366f1',
};

interface MultiCamDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MultiCamConfig;
  onUpdateConfig: (updated: Partial<MultiCamConfig>) => void;
}

export const MultiCamDirectorModal: React.FC<MultiCamDirectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);

  const loadDevices = async () => {
    setIsLoadingDevices(true);
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(cams);
        if (cams.length > 0 && !config.pipDeviceId) {
          onUpdateConfig({ pipDeviceId: cams[0].deviceId });
        }
      }
    } catch (e) {
      console.warn('Failed to enumerate media devices:', e);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Multi-Cam & Picture-in-Picture Director</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  OBS Multi-Source
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Route screen shares, webcams, and external capture cards into layered compositor canvases
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* PiP Master Toggle */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-400" />
                Picture-in-Picture Compositor
              </span>
              <p className="text-xs text-zinc-400">
                Overlay secondary camera stream directly onto output canvas
              </p>
            </div>

            <button
              type="button"
              onClick={() => onUpdateConfig({ isPipEnabled: !config.isPipEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                config.isPipEnabled ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.isPipEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Primary Canvas Background Source */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              Primary Background Video Layer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'screen', title: 'Screen / Desktop Share', desc: 'Display capture 1080p 60fps', icon: Monitor },
                { id: 'camera_main', title: 'Full-Frame Main Camera', desc: 'Direct facecam presentation', icon: Camera },
                { id: 'external_card', title: 'Capture Card / Cam Link', desc: 'Elgato / HDMI stream', icon: Layers },
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = config.primarySource === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => onUpdateConfig({ primarySource: src.id as any })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    <div className="text-xs font-bold text-white">{src.title}</div>
                    <div className="text-[10px] text-zinc-500">{src.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary PiP Device Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                Secondary Input Device (PiP Source)
              </label>
              <button
                type="button"
                onClick={loadDevices}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingDevices ? 'animate-spin' : ''}`} />
                <span>Rescan</span>
              </button>
            </div>

            <select
              value={config.pipDeviceId || ''}
              onChange={(e) => onUpdateConfig({ pipDeviceId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium text-xs focus:border-indigo-500 focus:outline-none"
            >
              {videoDevices.length === 0 ? (
                <option value="">Default System Webcam / Camera</option>
              ) : (
                videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Camera Source ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* PiP Layout & Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400">PiP Canvas Position:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom-right', label: 'Bottom Right' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'top-right', label: 'Top Right' },
                  { id: 'top-left', label: 'Top Left' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onUpdateConfig({ pipPosition: pos.id as any })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      config.pipPosition === pos.id
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape & Size */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400">PiP Shape & Scale:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'circle', label: 'Circle' },
                  { id: 'rounded-rect', label: 'Rounded' },
                  { id: 'square', label: 'Square' },
                ].map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => onUpdateConfig({ pipShape: shape.id as any })}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      config.pipShape === shape.id
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'small', label: 'Small (220p)' },
                  { id: 'medium', label: 'Medium (320p)' },
                  { id: 'large', label: 'Large (420p)' },
                ].map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => onUpdateConfig({ pipSize: size.id as any })}
                    className={`py-1.5 px-1.5 text-center rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                      config.pipSize === size.id
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Border Highlight & Horizontal Mirror */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Accent Border:</span>
              {['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#38bdf8', '#ffffff'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onUpdateConfig({ pipBorderColor: color })}
                  className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                    config.pipBorderColor === color ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={config.pipMirror}
                onChange={(e) => onUpdateConfig({ pipMirror: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 accent-indigo-500"
              />
              <span>Mirror Camera (Flip Horizontal)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
};
