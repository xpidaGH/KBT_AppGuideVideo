import { SupportedLanguageCode } from '../types';
import { LANGUAGE_MAP } from '../data/languages';

class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isPaused: boolean = false;
  private isSpeaking: boolean = false;
  private currentVolume: number = 1.0;
  private pingInterval: number | null = null;
  private listeners: Set<(state: { isSpeaking: boolean; isPaused: boolean; progressText?: string }) => void> = new Set();

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.currentVolume;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
    } catch {
      this.voices = [];
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public getVoiceForLanguage(langCode: SupportedLanguageCode): SpeechSynthesisVoice | null {
    const langInfo = LANGUAGE_MAP[langCode];
    if (!langInfo) return null;

    const voices = this.getVoices();
    if (voices.length === 0) return null;

    const bcp47 = langInfo.bcp47.toLowerCase();
    const primaryCode = langCode.toLowerCase();

    // 1. Exact match (e.g. 'fr-FR')
    let matched = voices.find(v => v.lang.toLowerCase() === bcp47);
    if (matched) return matched;

    // 2. Starts with primary language (e.g. 'fr')
    matched = voices.find(v => v.lang.toLowerCase().startsWith(primaryCode));
    if (matched) return matched;

    // 3. Fallback to any voice with language name in it
    matched = voices.find(v => v.name.toLowerCase().includes(langInfo.name.toLowerCase()));
    if (matched) return matched;

    // 4. Default fallback to first voice or null
    return voices.find(v => v.default) || voices[0] || null;
  }

  public subscribe(cb: (state: { isSpeaking: boolean; isPaused: boolean; progressText?: string }) => void): () => void {
    this.listeners.add(cb);
    cb({ isSpeaking: this.isSpeaking, isPaused: this.isPaused });
    return () => this.listeners.delete(cb);
  }

  private notify(progressText?: string) {
    this.listeners.forEach(cb => cb({ isSpeaking: this.isSpeaking, isPaused: this.isPaused, progressText }));
  }

  public speak(
    text: string,
    langCode: SupportedLanguageCode = 'en',
    options?: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void }
  ) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this environment');
      options?.onEnd?.();
      return;
    }

    this.stop(); // Clear any ongoing speech

    // Clean text: strip markdown characters for clearer pronunciation
    const cleanText = text
      .replace(/[#*_`~>[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langInfo = LANGUAGE_MAP[langCode];
    utterance.lang = langInfo ? langInfo.bcp47 : 'en-US';

    const selectedVoice = this.getVoiceForLanguage(langCode);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    const targetVolume = Math.max(0, Math.min(1, options?.volume ?? this.currentVolume));
    this.currentVolume = targetVolume;
    utterance.volume = targetVolume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify(cleanText.slice(0, 80));
      this.startKeepAlive();
    };

    utterance.onpause = () => {
      this.isPaused = true;
      this.notify();
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.stopKeepAlive();
      this.currentUtterance = null;
      this.notify();
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      this.stopKeepAlive();
      this.currentUtterance = null;
      this.notify();
      options?.onEnd?.();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Failed to invoke speak:', err);
      this.isSpeaking = false;
      this.notify();
    }
  }

  public pause() {
    if (!this.synth || !this.isSpeaking || this.isPaused) return;
    try {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    } catch (e) {
      console.warn('SpeechSynthesis pause error:', e);
    }
  }

  public resume() {
    if (!this.synth || !this.isPaused) return;
    try {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    } catch (e) {
      console.warn('SpeechSynthesis resume error:', e);
    }
  }

  public stop() {
    if (!this.synth) return;
    this.stopKeepAlive();
    try {
      this.synth.cancel();
    } catch (e) {
      console.warn('SpeechSynthesis cancel error:', e);
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.notify();
  }

  // Workaround for Chromium 15-second speech freeze bug
  private startKeepAlive() {
    this.stopKeepAlive();
    this.pingInterval = window.setInterval(() => {
      if (this.synth && this.isSpeaking && !this.isPaused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const ttsEngine = new TTSEngine();
