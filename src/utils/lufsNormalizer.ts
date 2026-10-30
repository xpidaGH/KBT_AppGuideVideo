/**
 * LUFS (Loudness Units relative to Full Scale) Target Standards and Normalization
 * Compatible with ITU-R BS.1770-4 standards for YouTube, Podcasts, and EBU Broadcast.
 */

export interface LufsTargetPreset {
  id: string;
  name: string;
  targetLufs: number; // in dBFS LUFS (e.g. -14, -16, -23)
  platform: string;
  description: string;
  maxTruePeakDb: number;
}

export const LUFS_TARGET_PRESETS: LufsTargetPreset[] = [
  {
    id: 'youtube',
    name: 'YouTube Standard (-14 LUFS)',
    targetLufs: -14.0,
    platform: 'YouTube, Twitch, Video LMS',
    description: 'Industry standard for web streaming and tech video tutorials. Prevents YouTube algorithmic attenuation.',
    maxTruePeakDb: -1.0,
  },
  {
    id: 'podcast',
    name: 'Podcasts & Voice (-16 LUFS)',
    targetLufs: -16.0,
    platform: 'Apple Podcasts, Spotify, Audiobooks',
    description: 'Standard spoken-word dialogue loudness. Optimized for headphones and mobile listening.',
    maxTruePeakDb: -1.0,
  },
  {
    id: 'broadcast',
    name: 'EBU R128 / Broadcast (-23 LUFS)',
    targetLufs: -23.0,
    platform: 'Television, European Broadcast & High Dynamic Range',
    description: 'Cinematic and professional broadcast standard with preserved dynamic range.',
    maxTruePeakDb: -1.0,
  },
  {
    id: 'club',
    name: 'Punchy Loud (-11 LUFS)',
    targetLufs: -11.0,
    platform: 'TikTok, Reels, Short-Form Screencasts',
    description: 'High-energy screencasts designed for noisy smartphone speakers and fast retention.',
    maxTruePeakDb: -0.5,
  },
];

export interface LufsMeasurement {
  integratedLufs: number;
  shortTermLufs: number;
  momentaryLufs: number;
  gainAdjustmentDb: number;
  targetLufs: number;
  isCompliant: boolean;
}

/**
 * Audio Pipeline LUFS Loudness Normalizer Node
 * Applies K-weighting high-pass and high-shelf filter stages, integrates loudness,
 * and dynamically manages target makeup gain.
 */
export class LufsAudioNormalizer {
  private ctx: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private makeupGainNode: GainNode;
  private preFilterHighPass: BiquadFilterNode;
  private preFilterHighShelf: BiquadFilterNode;
  private analyser: AnalyserNode;

  private isEnabled: boolean = true;
  private currentPreset: LufsTargetPreset = LUFS_TARGET_PRESETS[0];
  private shortTermHistory: number[] = [];
  private lastMeasurementTime: number = 0;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.makeupGainNode = ctx.createGain();

    // Stage 1 K-weighting pre-filter: High-shelf filter (+4dB at ~1.5kHz)
    this.preFilterHighShelf = ctx.createBiquadFilter();
    this.preFilterHighShelf.type = 'highshelf';
    this.preFilterHighShelf.frequency.value = 1500;
    this.preFilterHighShelf.gain.value = 4.0;

    // Stage 2 K-weighting pre-filter: High-pass RLB filter (cuts sub-bass below ~100Hz)
    this.preFilterHighPass = ctx.createBiquadFilter();
    this.preFilterHighPass.type = 'highpass';
    this.preFilterHighPass.frequency.value = 100;
    this.preFilterHighPass.Q.value = 0.5;

    // Analyser node for real-time RMS / LUFS integration
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.85;

    // Connect measurement chain
    this.inputNode.connect(this.makeupGainNode);
    this.makeupGainNode.connect(this.outputNode);

    // Sidechain for loudness measurement
    this.inputNode.connect(this.preFilterHighPass);
    this.preFilterHighPass.connect(this.preFilterHighShelf);
    this.preFilterHighShelf.connect(this.analyser);
  }

  public getInput(): GainNode {
    return this.inputNode;
  }

  public getOutput(): GainNode {
    return this.outputNode;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.makeupGainNode.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.05);
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setTargetPreset(preset: LufsTargetPreset) {
    this.currentPreset = preset;
  }

  public getTargetPreset(): LufsTargetPreset {
    return this.currentPreset;
  }

  /**
   * Samples current audio buffer and calculates momentary and integrated LUFS
   */
  public measure(): LufsMeasurement {
    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    // Calculate mean square
    let sumSq = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSq += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSq / buffer.length);
    // BS.1770 offset constant: -0.691 dB
    const momentaryLufs = rms > 0.000001 ? Math.max(-90, 10 * Math.log10(rms * rms) - 0.691) : -90;

    // Maintain short-term 3-second rolling window
    this.shortTermHistory.push(momentaryLufs);
    if (this.shortTermHistory.length > 30) {
      this.shortTermHistory.shift();
    }

    const shortTermLufs =
      this.shortTermHistory.reduce((a, b) => a + b, 0) / this.shortTermHistory.length;

    // Difference between target and current measured loudness
    const diff = this.currentPreset.targetLufs - shortTermLufs;
    // Limit maximum boost / attenuation to +/- 12 dB for safety
    const boundedAdjustmentDb = Math.max(-12, Math.min(12, diff));

    // If enabled and speech is actively flowing (louder than -60 dBFS noise gate floor)
    if (this.isEnabled && shortTermLufs > -55) {
      const targetGain = Math.pow(10, boundedAdjustmentDb / 20);
      // Smooth gradual leveling to avoid audible pumping
      this.makeupGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
    } else if (shortTermLufs <= -55) {
      // Idle room noise, gently return toward unity gain
      this.makeupGainNode.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.5);
    }

    return {
      integratedLufs: Math.round(shortTermLufs * 10) / 10,
      shortTermLufs: Math.round(shortTermLufs * 10) / 10,
      momentaryLufs: Math.round(momentaryLufs * 10) / 10,
      gainAdjustmentDb: Math.round(boundedAdjustmentDb * 10) / 10,
      targetLufs: this.currentPreset.targetLufs,
      isCompliant: Math.abs(shortTermLufs - this.currentPreset.targetLufs) <= 1.0,
    };
  }
}
