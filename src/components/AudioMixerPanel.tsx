import React from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Shield,
  Music,
  Activity,
  Layers,
} from 'lucide-react';
import { MultiTrackAudioMixer, NoiseGateConfig, CompressorConfig } from '../utils/noiseGate';
import {
  NOISE_GATE_PRESETS,
  COMPRESSOR_RATIO_PRESETS,
  COMPRESSOR_ATTACK_PRESETS,
} from '../data/structuredStudioData';

interface AudioMixerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  audioMixer: MultiTrackAudioMixer | null;
  micVolume: number;
  onMicVolumeChange: (vol: number) => void;
  isMicMuted: boolean;
  onToggleMicMute: () => void;
  systemVolume: number;
  onSystemVolumeChange: (vol: number) => void;
  isSystemMuted: boolean;
  onToggleSystemMute: () => void;
  secondaryVolume: number;
  onSecondaryVolumeChange: (vol: number) => void;
  isSecondaryMuted: boolean;
  onToggleSecondaryMute: () => void;
  noiseGateConfig: NoiseGateConfig;
  onNoiseGateConfigChange: (cfg: Partial<NoiseGateConfig>) => void;
  compressorConfig: CompressorConfig;
  onCompressorConfigChange: (cfg: Partial<CompressorConfig>) => void;
  meterLevels: {
    micLevel: number;
    micGateActive: boolean;
    compressorReduction?: number;
    compressorActive?: boolean;
    systemLevel: number;
    secondaryLevel: number;
    masterLevel: number;
  };
  ambientTrack: string;
  onSelectAmbientTrack: (track: string) => void;
}

export const AudioMixerPanel: React.FC<AudioMixerPanelProps> = ({
  isOpen,
  onClose,
  audioMixer,
  micVolume,
  onMicVolumeChange,
  isMicMuted,
  onToggleMicMute,
  systemVolume,
  onSystemVolumeChange,
  isSystemMuted,
  onToggleSystemMute,
  secondaryVolume,
  onSecondaryVolumeChange,
  isSecondaryMuted,
  onToggleSecondaryMute,
  noiseGateConfig,
  onNoiseGateConfigChange,
  compressorConfig,
  onCompressorConfigChange,
  meterLevels,
  ambientTrack,
  onSelectAmbientTrack,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
              Multi-Track Audio Mixer
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                3 Tracks Active
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">
              Discrete gain control, digital noise gate, and channel VU metering
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
        >
          Close Mixer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* TRACK 1: Microphone Input with Digital Noise Gate */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Track 1: Microphone</span>
            </div>
            <button
              onClick={onToggleMicMute}
              className={`p-1 rounded-lg text-xs font-mono transition ${
                isMicMuted
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* VU Level Meter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Peak Level</span>
              <span className="text-cyan-400">{Math.round(meterLevels.micLevel * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden flex">
              <div
                className={`h-2 rounded-full transition-all duration-75 ${
                  meterLevels.micGateActive
                    ? 'bg-amber-500/60'
                    : meterLevels.micLevel > 0.8
                    ? 'bg-rose-500'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, meterLevels.micLevel * 100)}%` }}
              />
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Gain ({Math.round(micVolume * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={micVolume}
              onChange={(e) => onMicVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Digital Noise Gate Controls */}
          <div className="pt-2 border-t border-zinc-900 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-zinc-200">
                <input
                  type="checkbox"
                  checked={noiseGateConfig.enabled}
                  onChange={(e) => onNoiseGateConfigChange({ enabled: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 w-3.5 h-3.5 cursor-pointer"
                />
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Digital Noise Gate</span>
              </label>

              {noiseGateConfig.enabled && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    meterLevels.micGateActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {meterLevels.micGateActive ? 'MUTING NOISE' : 'VOICE ACTIVE'}
                </span>
              )}
            </div>

            {noiseGateConfig.enabled && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Threshold</span>
                  <span className="text-cyan-300">{noiseGateConfig.thresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="-15"
                  step="1"
                  value={noiseGateConfig.thresholdDb}
                  onChange={(e) => onNoiseGateConfigChange({ thresholdDb: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex gap-1 pt-0.5">
                  {NOISE_GATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => onNoiseGateConfigChange({ thresholdDb: preset.value })}
                      className={`flex-1 py-0.5 text-[9px] font-mono rounded border transition ${
                        noiseGateConfig.thresholdDb === preset.value
                          ? 'bg-cyan-950 text-cyan-200 border-cyan-500/60 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {preset.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Range Compressor (Volume Normalization for Voiceover) */}
          <div className="pt-2.5 border-t border-zinc-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-zinc-200">
                <input
                  type="checkbox"
                  id="compressor-enabled-toggle"
                  checked={compressorConfig.enabled}
                  onChange={(e) => onCompressorConfigChange({ enabled: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 w-3.5 h-3.5 cursor-pointer accent-indigo-500"
                />
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Voiceover Compressor</span>
              </label>

              {compressorConfig.enabled && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 ${
                    meterLevels.compressorActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      meterLevels.compressorActive ? 'bg-amber-400 animate-ping' : 'bg-indigo-400'
                    }`}
                  />
                  <span>
                    {meterLevels.compressorActive
                      ? `NORM ${meterLevels.compressorReduction?.toFixed(1)} dB`
                      : 'NORMALIZING'}
                  </span>
                </span>
              )}
            </div>

            {compressorConfig.enabled && (
              <div className="space-y-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                {/* Live Gain Reduction Meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span>Gain Reduction (GR)</span>
                      {meterLevels.compressorActive && (
                        <span className="text-amber-400 font-bold animate-pulse">● COMPRESSING</span>
                      )}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {meterLevels.compressorReduction
                        ? `${meterLevels.compressorReduction.toFixed(1)} dB`
                        : '0.0 dB'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden flex flex-row-reverse border border-zinc-800">
                    <div
                      className="h-1.5 bg-gradient-to-l from-amber-500 via-orange-500 to-amber-300 rounded-full transition-all duration-75"
                      style={{
                        width: `${Math.min(100, Math.max(0, Math.abs(meterLevels.compressorReduction || 0) * 8))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Ratio Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="font-semibold text-zinc-300">Ratio (Compression)</span>
                    <span className="text-indigo-300 font-bold">{compressorConfig.ratio}:1</span>
                  </div>
                  <input
                    type="range"
                    id="compressor-ratio-slider"
                    aria-label="Dynamic Range Compressor Ratio"
                    min="1"
                    max="20"
                    step="0.5"
                    value={compressorConfig.ratio}
                    onChange={(e) => onCompressorConfigChange({ ratio: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {COMPRESSOR_RATIO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onCompressorConfigChange({ ratio: preset.value })}
                        title={preset.desc}
                        className={`py-0.5 px-1 text-[8.5px] font-mono rounded border transition text-center cursor-pointer ${
                          compressorConfig.ratio === preset.value
                            ? 'bg-indigo-950 text-indigo-200 border-indigo-500/60 font-bold shadow-xs'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {preset.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attack Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="font-semibold text-zinc-300">Attack Time</span>
                    <span className="text-cyan-300 font-bold">
                      {Math.round(compressorConfig.attackTimeSec * 1000)} ms
                    </span>
                  </div>
                  <input
                    type="range"
                    id="compressor-attack-slider"
                    aria-label="Dynamic Range Compressor Attack Time"
                    min="0.001"
                    max="0.100"
                    step="0.001"
                    value={compressorConfig.attackTimeSec}
                    onChange={(e) => onCompressorConfigChange({ attackTimeSec: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {COMPRESSOR_ATTACK_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onCompressorConfigChange({ attackTimeSec: preset.value })}
                        title={preset.desc}
                        className={`py-0.5 px-1 text-[8.5px] font-mono rounded border transition text-center cursor-pointer ${
                          Math.abs(compressorConfig.attackTimeSec - preset.value) < 0.0005
                            ? 'bg-cyan-950 text-cyan-200 border-cyan-500/60 font-bold shadow-xs'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {preset.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Threshold Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-zinc-400">Threshold</span>
                    <span className="text-zinc-300 font-bold">{compressorConfig.thresholdDb} dB</span>
                  </div>
                  <input
                    type="range"
                    id="compressor-threshold-slider"
                    aria-label="Dynamic Range Compressor Threshold"
                    min="-60"
                    max="0"
                    step="1"
                    value={compressorConfig.thresholdDb}
                    onChange={(e) => onCompressorConfigChange({ thresholdDb: parseInt(e.target.value, 10) })}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TRACK 2: System / Desktop Audio */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Track 2: System Audio</span>
            </div>
            <button
              onClick={onToggleSystemMute}
              className={`p-1 rounded-lg text-xs font-mono transition ${
                isSystemMuted
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isSystemMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* VU Level Meter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Peak Level</span>
              <span className="text-emerald-400">{Math.round(meterLevels.systemLevel * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden flex">
              <div
                className="h-2 rounded-full bg-emerald-400 transition-all duration-75"
                style={{ width: `${Math.min(100, meterLevels.systemLevel * 100)}%` }}
              />
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Gain ({Math.round(systemVolume * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={systemVolume}
              onChange={(e) => onSystemVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <p className="text-[10px] text-zinc-500 leading-relaxed pt-2 border-t border-zinc-900">
            Captures system application audio, terminal beeps, and browser sound streams when screen share is engaged.
          </p>
        </div>

        {/* TRACK 3: Secondary Audio Source (Ambient / FX) */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Track 3: Secondary Aux</span>
            </div>
            <button
              onClick={onToggleSecondaryMute}
              className={`p-1 rounded-lg text-xs font-mono transition ${
                isSecondaryMuted
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isSecondaryMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* VU Level Meter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Peak Level</span>
              <span className="text-purple-400">{Math.round(meterLevels.secondaryLevel * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden flex">
              <div
                className="h-2 rounded-full bg-purple-400 transition-all duration-75"
                style={{ width: `${Math.min(100, meterLevels.secondaryLevel * 100)}%` }}
              />
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Gain ({Math.round(secondaryVolume * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={secondaryVolume}
              onChange={(e) => onSecondaryVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Ambient Track Selector */}
          <div className="pt-2 border-t border-zinc-900 space-y-1">
            <div className="text-[10px] font-mono text-zinc-400">Aux Audio Source</div>
            <select
              value={ambientTrack}
              onChange={(e) => onSelectAmbientTrack(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-purple-300 focus:outline-none focus:border-purple-500"
            >
              <option value="none">None (Aux Muted)</option>
              <option value="ambient-synth">Ambient Low-Pass Drone</option>
              <option value="lofi-study">Lo-Fi Tutorial Bed</option>
              <option value="tech-pulse">Cyber Acoustic Pulse</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
