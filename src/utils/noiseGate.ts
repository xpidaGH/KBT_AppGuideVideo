/**
 * Real-time Digital Noise Gate & Multi-Track Audio Mixer for StudioRecorder
 * Supports:
 * 1. Primary Microphone input with real-time RMS digital noise gate (threshold, attack, release)
 * 2. System / Display Audio capture
 * 3. Secondary Audio Track (Background music / sound effects / auxiliary stream)
 */

export interface NoiseGateConfig {
  enabled: boolean;
  thresholdDb: number; // e.g. -50 dB to -10 dB (default: -38 dB)
  attackTimeMs: number; // e.g. 20ms
  releaseTimeMs: number; // e.g. 250ms
}

export interface CompressorConfig {
  enabled: boolean;
  thresholdDb: number; // -60 dB to 0 dB (default: -24 dB)
  kneeDb: number; // 0 dB to 40 dB (default: 30 dB)
  ratio: number; // 1 to 20 (default: 4, e.g. 4:1 for spoken voiceover)
  attackTimeSec: number; // 0.001 to 0.1s (default: 0.003s / 3ms)
  releaseTimeSec: number; // 0.05 to 1.0s (default: 0.25s)
}

export interface AudioTrackState {
  id: 'mic' | 'system' | 'secondary';
  name: string;
  enabled: boolean;
  muted: boolean;
  volume: number; // 0.0 to 2.0 (1.0 = 100%)
  level: number; // 0.0 to 1.0 peak meter
  gateActive: boolean; // true when noise gate is currently suppressing noise
  compressorActive?: boolean;
  compressorReduction?: number;
}

export class MultiTrackAudioMixer {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  // Track nodes
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micGain: GainNode | null = null;
  private micGateGain: GainNode | null = null;
  private micCompressor: DynamicsCompressorNode | null = null;
  private micAnalyser: AnalyserNode | null = null;

  private systemSource: MediaStreamAudioSourceNode | null = null;
  private systemGain: GainNode | null = null;
  private systemAnalyser: AnalyserNode | null = null;

  private secondaryAudioElement: HTMLAudioElement | null = null;
  private secondarySource: MediaElementAudioSourceNode | null = null;
  private secondaryGain: GainNode | null = null;
  private secondaryAnalyser: AnalyserNode | null = null;

  // Metering & Noise Gate loop
  private meterInterval: number | null = null;
  private onLevelUpdate?: (levels: {
    micLevel: number;
    micGateActive: boolean;
    compressorReduction: number;
    compressorActive: boolean;
    systemLevel: number;
    secondaryLevel: number;
    masterLevel: number;
  }) => void;

  public noiseGateConfig: NoiseGateConfig = {
    enabled: true,
    thresholdDb: -42,
    attackTimeMs: 15,
    releaseTimeMs: 220,
  };

  public compressorConfig: CompressorConfig = {
    enabled: true,
    thresholdDb: -24,
    kneeDb: 30,
    ratio: 4,
    attackTimeSec: 0.003,
    releaseTimeSec: 0.25,
  };

  private isGateOpen = false;
  private lastAboveThresholdTime = 0;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.masterGain = this.audioCtx.createGain();
      this.destinationNode = this.audioCtx.createMediaStreamDestination();
      this.masterGain.connect(this.destinationNode);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Connect Microphone Stream
   */
  public attachMicStream(stream: MediaStream): void {
    const ctx = this.init();
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch (e) {
        // ignore
      }
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    this.micSource = ctx.createMediaStreamSource(stream);
    this.micGateGain = ctx.createGain();
    this.micCompressor = ctx.createDynamicsCompressor();
    this.applyCompressorValues(this.compressorConfig);
    this.micGain = ctx.createGain();
    this.micAnalyser = ctx.createAnalyser();
    this.micAnalyser.fftSize = 512;
    this.micAnalyser.smoothingTimeConstant = 0.3;

    // Pipeline: MicSource -> Analyser -> NoiseGateGain -> Compressor -> TrackGain -> MasterGain
    this.micSource.connect(this.micAnalyser);
    this.micAnalyser.connect(this.micGateGain);
    this.micGateGain.connect(this.micCompressor);
    this.micCompressor.connect(this.micGain);
    this.micGain.connect(this.masterGain!);

    this.startMeteringLoop();
  }

  /**
   * Connect System Audio Stream (e.g. from getDisplayMedia)
   */
  public attachSystemAudioStream(stream: MediaStream): void {
    const ctx = this.init();
    if (this.systemSource) {
      try {
        this.systemSource.disconnect();
      } catch (e) {
        // ignore
      }
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    this.systemSource = ctx.createMediaStreamSource(stream);
    this.systemGain = ctx.createGain();
    this.systemAnalyser = ctx.createAnalyser();
    this.systemAnalyser.fftSize = 512;

    this.systemSource.connect(this.systemAnalyser);
    this.systemAnalyser.connect(this.systemGain);
    this.systemGain.connect(this.masterGain!);

    this.startMeteringLoop();
  }

  /**
   * Connect Secondary Audio (Sound FX, Ambient Loop, or secondary track)
   */
  public attachSecondaryAudio(element: HTMLAudioElement): void {
    const ctx = this.init();
    if (this.secondarySource) {
      try {
        this.secondarySource.disconnect();
      } catch (e) {
        // ignore
      }
    }

    this.secondaryAudioElement = element;
    this.secondarySource = ctx.createMediaElementSource(element);
    this.secondaryGain = ctx.createGain();
    this.secondaryAnalyser = ctx.createAnalyser();
    this.secondaryAnalyser.fftSize = 512;

    this.secondarySource.connect(this.secondaryAnalyser);
    this.secondaryAnalyser.connect(this.secondaryGain);
    this.secondaryGain.connect(this.masterGain!);

    this.startMeteringLoop();
  }

  /**
   * Set Track Volume (0.0 to 2.0)
   */
  public setTrackVolume(trackId: 'mic' | 'system' | 'secondary' | 'master', volume: number, muted = false): void {
    const targetGain = muted ? 0 : Math.max(0, Math.min(2.0, volume));
    const now = this.audioCtx ? this.audioCtx.currentTime : 0;

    if (trackId === 'mic' && this.micGain && this.audioCtx) {
      this.micGain.gain.setValueAtTime(targetGain, now);
    } else if (trackId === 'system' && this.systemGain && this.audioCtx) {
      this.systemGain.gain.setValueAtTime(targetGain, now);
    } else if (trackId === 'secondary' && this.secondaryGain && this.audioCtx) {
      this.secondaryGain.gain.setValueAtTime(targetGain, now);
    } else if (trackId === 'master' && this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(targetGain, now);
    }
  }

  /**
   * Update Noise Gate settings
   */
  public setNoiseGateConfig(config: Partial<NoiseGateConfig>): void {
    this.noiseGateConfig = { ...this.noiseGateConfig, ...config };
  }

  /**
   * Apply DynamicsCompressorNode parameters with audio-rate safety
   */
  private applyCompressorValues(config: CompressorConfig): void {
    if (!this.micCompressor || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    try {
      if (!config.enabled) {
        // Transparent mode: 1:1 ratio, 0 dB threshold
        this.micCompressor.threshold.setValueAtTime(0, now);
        this.micCompressor.ratio.setValueAtTime(1, now);
      } else {
        this.micCompressor.threshold.setValueAtTime(config.thresholdDb, now);
        this.micCompressor.knee.setValueAtTime(config.kneeDb, now);
        this.micCompressor.ratio.setValueAtTime(config.ratio, now);
        this.micCompressor.attack.setValueAtTime(config.attackTimeSec, now);
        this.micCompressor.release.setValueAtTime(config.releaseTimeSec, now);
      }
    } catch (e) {
      console.warn('Compressor parameter apply warning:', e);
    }
  }

  /**
   * Update Dynamic Range Compressor settings
   */
  public setCompressorConfig(config: Partial<CompressorConfig>): void {
    this.compressorConfig = { ...this.compressorConfig, ...config };
    this.applyCompressorValues(this.compressorConfig);
  }

  /**
   * Subscribe to real-time audio levels & noise gate state
   */
  public onLevels(
    callback: (levels: {
      micLevel: number;
      micGateActive: boolean;
      compressorReduction: number;
      compressorActive: boolean;
      systemLevel: number;
      secondaryLevel: number;
      masterLevel: number;
    }) => void
  ): void {
    this.onLevelUpdate = callback;
  }

  /**
   * Start real-time metering and noise gate loop
   */
  private startMeteringLoop(): void {
    if (this.meterInterval) return;

    const micData = new Float32Array(512);
    const sysData = new Float32Array(512);
    const secData = new Float32Array(512);

    this.meterInterval = window.setInterval(() => {
      let micRms = 0;
      let sysRms = 0;
      let secRms = 0;

      // 1. Mic RMS calculation & Noise Gate evaluation
      let gateActive = false;
      if (this.micAnalyser && this.audioCtx) {
        this.micAnalyser.getFloatTimeDomainData(micData);
        let sumSquares = 0;
        for (let i = 0; i < micData.length; i++) {
          sumSquares += micData[i] * micData[i];
        }
        micRms = Math.sqrt(sumSquares / micData.length);
        const micDb = micRms > 0 ? 20 * Math.log10(micRms) : -100;

        if (this.noiseGateConfig.enabled && this.micGateGain) {
          const now = Date.now();
          const threshold = this.noiseGateConfig.thresholdDb;

          if (micDb >= threshold) {
            // Signal above threshold - open gate immediately with attack smoothing
            this.lastAboveThresholdTime = now;
            if (!this.isGateOpen) {
              this.isGateOpen = true;
              const ctxTime = this.audioCtx.currentTime;
              this.micGateGain.gain.cancelScheduledValues(ctxTime);
              this.micGateGain.gain.linearRampToValueAtTime(1.0, ctxTime + this.noiseGateConfig.attackTimeMs / 1000);
            }
          } else {
            // Signal below threshold - check release time
            const elapsed = now - this.lastAboveThresholdTime;
            if (this.isGateOpen && elapsed > this.noiseGateConfig.releaseTimeMs) {
              this.isGateOpen = false;
              const ctxTime = this.audioCtx.currentTime;
              this.micGateGain.gain.cancelScheduledValues(ctxTime);
              this.micGateGain.gain.linearRampToValueAtTime(0.0, ctxTime + 0.05);
            }
          }
          gateActive = !this.isGateOpen;
        } else if (this.micGateGain && this.audioCtx) {
          this.micGateGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
          gateActive = false;
        }
      }

      // 2. System Audio RMS
      if (this.systemAnalyser) {
        this.systemAnalyser.getFloatTimeDomainData(sysData);
        let sum = 0;
        for (let i = 0; i < sysData.length; i++) {
          sum += sysData[i] * sysData[i];
        }
        sysRms = Math.sqrt(sum / sysData.length);
      }

      // 3. Secondary Track RMS
      if (this.secondaryAnalyser) {
        this.secondaryAnalyser.getFloatTimeDomainData(secData);
        let sum = 0;
        for (let i = 0; i < secData.length; i++) {
          sum += secData[i] * secData[i];
        }
        secRms = Math.sqrt(sum / secData.length);
      }

      const masterRms = Math.min(1.0, micRms + sysRms + secRms);
      const compReduction = this.micCompressor && this.compressorConfig.enabled ? this.micCompressor.reduction : 0;
      const compActive = this.compressorConfig.enabled && compReduction < -0.4;

      if (this.onLevelUpdate) {
        this.onLevelUpdate({
          micLevel: Math.min(1.0, micRms * 3.5),
          micGateActive: gateActive,
          compressorReduction: compReduction,
          compressorActive: compActive,
          systemLevel: Math.min(1.0, sysRms * 3.0),
          secondaryLevel: Math.min(1.0, secRms * 3.0),
          masterLevel: Math.min(1.0, masterRms * 3.0),
        });
      }
    }, 40); // 25 updates per second
  }

  /**
   * Get the mixed MediaStreamAudioDestinationNode stream for MediaRecorder
   */
  public getMixedAudioStream(): MediaStream | null {
    if (!this.destinationNode) {
      this.init();
    }
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  /**
   * Get primary microphone AnalyserNode for audio visualizers
   */
  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }

  /**
   * Get real-time byte frequency data for visualizers
   */
  public getFrequencyData(track: 'mic' | 'system' = 'mic'): Uint8Array | null {
    const analyser = track === 'mic' ? this.micAnalyser : this.systemAnalyser;
    if (!analyser) return null;
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buffer);
    return buffer;
  }

  /**
   * Clean up all audio nodes
   */
  public dispose(): void {
    if (this.meterInterval) {
      clearInterval(this.meterInterval);
      this.meterInterval = null;
    }
    try {
      this.micSource?.disconnect();
      this.micCompressor?.disconnect();
      this.systemSource?.disconnect();
      this.secondarySource?.disconnect();
      this.audioCtx?.close();
    } catch (e) {
      // ignore
    }
  }
}
