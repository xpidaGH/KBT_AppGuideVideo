import React, { useState } from 'react';
import {
  X,
  Mic,
  Volume2,
  Sparkles,
  Play,
  Square,
  Check,
  Languages,
  UserCheck,
  Wand2,
  ListMusic,
  Plus,
} from 'lucide-react';
import { VOICEOVER_PERSONAS, VoiceoverPersona } from '../data/structuredStudioData';
import { SupportedLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { ttsEngine } from '../utils/tts';

interface VoiceoverSynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: SupportedLanguageCode;
  currentLanguage?: SupportedLanguageCode;
  projectTitle?: string;
  defaultScript?: string;
  onAttachVoiceTrack?: (track: { title: string; script: string; durationSec: number; voiceName: string }) => void;
  onAttachSpeechTrack?: (blob: any, text: string) => void;
}

export const VoiceoverSynthesisModal: React.FC<VoiceoverSynthesisModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  currentLanguage,
  projectTitle = 'KBT Tutorial Recording',
  defaultScript,
  onAttachVoiceTrack,
  onAttachSpeechTrack,
}) => {
  const activeLang = selectedLanguage || currentLanguage || 'en';
  const [script, setScript] = useState<string>(
    defaultScript ||
    `In this tutorial, we will explore the high-performance SIMD compositor and multi-track audio leveling engine for ${projectTitle}. Notice the smooth 60 frames per second rendering and low latency capture.`
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceoverPersona>(VOICEOVER_PERSONAS[0]);
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>(activeLang);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [enhancedResult, setEnhancedResult] = useState<{
    title: string;
    enhancedScript: string;
    durationSeconds: number;
    pacingNotes?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGeminiSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/gemini/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          targetLanguage: targetLang,
          voicePersona: selectedVoice.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.speechTrack) {
          setEnhancedResult(data.speechTrack);
        }
      }
    } catch (e) {
      console.warn('Voiceover synthesis fallback:', e);
      setEnhancedResult({
        title: `${selectedVoice.name} Speech Track`,
        enhancedScript: script,
        durationSeconds: Math.max(5, Math.ceil(script.split(/\s+/).length / 2.5)),
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePreviewVoice = () => {
    const textToSpeak = enhancedResult?.enhancedScript || script;
    if (isPlaying) {
      ttsEngine.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    ttsEngine.speak(textToSpeak, targetLang, {
      rate: 1.0,
      pitch: 1.0,
      onEnd: () => setIsPlaying(false),
    });
  };

  const handleApplyToStudio = () => {
    const text = enhancedResult?.enhancedScript || script;
    const dur = enhancedResult?.durationSeconds || Math.max(5, Math.ceil(text.split(/\s+/).length / 2.5));
    if (onAttachVoiceTrack) {
      onAttachVoiceTrack({
        title: enhancedResult?.title || `${selectedVoice.name} Voice Track`,
        script: text,
        durationSec: dur,
        voiceName: selectedVoice.name,
      });
    }
    if (onAttachSpeechTrack) {
      const blob = new Blob([text], { type: 'text/plain' });
      onAttachSpeechTrack(blob, text);
    }
    onClose();
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Voiceover Synthesis Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini API Powered
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Convert written tutorial scripts into multi-lingual natural speech tracks
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Script Input */}
          <div className="space-y-1.5">
            <label className="font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Tutorial Script to Synthesize:</span>
              <span className="text-zinc-500 font-normal">{script.length} characters</span>
            </label>
            <textarea
              rows={4}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:border-indigo-500 focus:outline-none leading-relaxed text-xs resize-none"
              placeholder="Enter spoken narration script for your tutorial..."
            />
          </div>

          {/* Voice Personas Selection */}
          <div className="space-y-2">
            <label className="font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Select Voice Persona ({VOICEOVER_PERSONAS.length} Voices):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VOICEOVER_PERSONAS.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{voice.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {voice.accent}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{voice.style}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector & Gemini Enhance Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-purple-400" />
              <span className="text-zinc-400 font-mono">Language:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-white text-xs font-semibold"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleGeminiSynthesize}
              disabled={isSynthesizing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Optimizing with Gemini...' : 'Polish Script with Gemini'}</span>
            </button>
          </div>

          {/* Enhanced Result Box */}
          {enhancedResult && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {enhancedResult.title}
                </span>
                <span className="font-mono text-[10px] text-indigo-300">
                  ~{enhancedResult.durationSeconds}s duration
                </span>
              </div>
              <p className="text-zinc-200 text-xs italic bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
                "{enhancedResult.enhancedScript}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreviewVoice}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Stop Preview' : 'Audition Voice'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyToStudio}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach Voice Track to Mixer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
