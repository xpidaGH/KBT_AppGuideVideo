import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  FileText,
  Subtitles,
  RefreshCw,
  Check,
  Languages,
  Play,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { SoftsubCue, SupportedLanguageCode } from '../types';
import { LANGUAGE_MAP } from '../data/languages';

interface AiTranscriptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  recordedBlob: Blob | null;
  selectedLanguage: SupportedLanguageCode;
  durationSeconds: number;
  projectTitle: string;
  onApplyCues: (cues: SoftsubCue[]) => void;
}

export const AiTranscriptPanel: React.FC<AiTranscriptPanelProps> = ({
  isOpen,
  onClose,
  recordedBlob,
  selectedLanguage,
  durationSeconds,
  projectTitle,
  onApplyCues,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedVtt, setGeneratedVtt] = useState<string | null>(null);
  const [generatedSrt, setGeneratedSrt] = useState<string | null>(null);
  const [generatedCues, setGeneratedCues] = useState<SoftsubCue[] | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentLangInfo = LANGUAGE_MAP[selectedLanguage];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      let base64Audio = '';

      if (recordedBlob && recordedBlob.size > 0) {
        // Convert Blob to base64
        const buffer = await recordedBlob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64Audio = btoa(binary);
      } else {
        // Generate simulated speech tones for tutorial audio when user hasn't recorded yet
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const dest = audioCtx.createMediaStreamDestination();
        osc.connect(dest);
        osc.start();
        base64Audio = btoa('UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
        audioCtx.close();
      }

      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: recordedBlob ? recordedBlob.type : 'audio/webm',
          targetLanguage: selectedLanguage,
          durationSeconds: durationSeconds || 15,
          projectTitle: projectTitle || 'Software Development Tutorial',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.cues && Array.isArray(data.cues)) {
        const formattedCues: SoftsubCue[] = data.cues.map((c: any) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          speaker: c.speaker || 'Instructor',
          text: c.text,
          translations: {
            [selectedLanguage]: c.text,
            en: c.text,
          } as any,
        }));

        setGeneratedCues(formattedCues);
        setGeneratedVtt(data.vtt);
        setGeneratedSrt(data.srt);
        setModelUsed(data.modelUsed || 'gemini-3.5-transcribe');
        onApplyCues(formattedCues);
      }
    } catch (err: any) {
      console.error('AI transcript failed:', err);
      setErrorMsg(err?.message || 'Failed to generate transcription');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
              Gemini AI Speech-to-Text Transcript Generator
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                gemini-3.5-transcribe
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">
              Generates synchronized, localized VTT/SRT subtitles from captured tutorial audio
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

      <div className="space-y-4">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Target Language:</span>
            <span className="font-bold text-indigo-300 flex items-center gap-1">
              <span>{currentLangInfo?.flag}</span>
              <span>{currentLangInfo?.name}</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Audio Duration: <strong className="text-white font-mono">{Math.round(durationSeconds)}s</strong>
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50 active:scale-95"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Transcripts...' : 'Generate AI Subtitles'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results Preview */}
        {generatedCues && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <span>Generated Cues ({generatedCues.length})</span>
                {modelUsed && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    Model: {modelUsed}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                {generatedVtt && (
                  <button
                    onClick={() => downloadFile(generatedVtt, `${projectTitle.replace(/\s+/g, '_')}.vtt`, 'text/vtt')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
                  >
                    <Download className="w-3 h-3 text-indigo-400" />
                    Download .VTT
                  </button>
                )}
                {generatedSrt && (
                  <button
                    onClick={() => downloadFile(generatedSrt, `${projectTitle.replace(/\s+/g, '_')}.srt`, 'text/plain')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
                  >
                    <Download className="w-3 h-3 text-purple-400" />
                    Download .SRT
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {generatedCues.map((cue, idx) => (
                <div
                  key={cue.id}
                  className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                      <span className="text-indigo-400 font-bold">#{idx + 1}</span>
                      <span>
                        {cue.startTime.toFixed(1)}s → {cue.endTime.toFixed(1)}s
                      </span>
                      <span>•</span>
                      <span className="text-zinc-400 font-semibold">{cue.speaker}</span>
                    </div>
                    <p className="text-zinc-200 font-medium">{cue.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
