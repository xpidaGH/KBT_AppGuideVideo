import React, { useState } from 'react';
import {
  X,
  FileText,
  Sparkles,
  ListOrdered,
  Clock,
  Code2,
  Check,
  Plus,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { SupportedLanguageCode } from '../types';

interface OutlineSection {
  id: string;
  title: string;
  durationSec: number;
  talkingPoints: string[];
  codeSnippet?: string;
}

interface SmartScriptingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectDescription?: string;
  selectedLanguage?: SupportedLanguageCode;
  language?: SupportedLanguageCode;
  onApplyOutlineToTeleprompter?: (scriptText: string) => void;
  onApplyOutline?: (headers: string[]) => void;
}

export const SmartScriptingModal: React.FC<SmartScriptingModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  projectDescription,
  selectedLanguage,
  language,
  onApplyOutlineToTeleprompter,
  onApplyOutline,
}) => {
  const activeLang = selectedLanguage || language || 'en';
  const [topic, setTopic] = useState<string>(projectTitle || 'Distributed Systems & Video Encoding');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sections, setSections] = useState<OutlineSection[]>([]);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateOutline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          targetLanguage: selectedLanguage,
          targetDurationMinutes: durationMinutes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sections)) {
          setSections(data.sections);
          setHasGenerated(true);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Gemini outline:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedScriptText = sections
    .map(
      (s, idx) =>
        `[${idx + 1}. ${s.title} (~${s.durationSec}s)]\n` +
        s.talkingPoints.map((tp) => `• ${tp}`).join('\n') +
        (s.codeSnippet ? `\nCommand: ${s.codeSnippet}` : '')
    )
    .join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedScriptText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleSendToTeleprompter = () => {
    if (onApplyOutlineToTeleprompter && formattedScriptText) {
      onApplyOutlineToTeleprompter(formattedScriptText);
    }
    if (onApplyOutline) {
      onApplyOutline(sections.map((s) => s.title));
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Smart Scripting Assistant</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini API Analyzed
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                AI outline generation and timing pacing based on project topic and technical scope
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Controls */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Tutorial Topic & Context:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-xs focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Memory Alignment in WebAssembly SIMD"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Target Length:
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value={2}>2 Minutes (Lightning Demo)</option>
                  <option value={5}>5 Minutes (Standard Tutorial)</option>
                  <option value={10}>10 Minutes (Deep Dive Walkthrough)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerateOutline}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Generating Outline...' : 'Generate Tutorial Headers'}</span>
              </button>
            </div>
          </div>

          {/* Outline Results */}
          {hasGenerated && sections.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                  Suggested Outline Sections ({sections.length})
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                >
                  {copyFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copyFeedback ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{sec.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {sec.durationSec}s
                      </span>
                    </div>

                    <ul className="space-y-1 pl-7 list-disc text-zinc-300 text-[11px]">
                      {sec.talkingPoints.map((tp, tpIdx) => (
                        <li key={tpIdx}>{tp}</li>
                      ))}
                    </ul>

                    {sec.codeSnippet && (
                      <div className="ml-7 p-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-amber-300 flex items-center gap-2">
                        <Code2 className="w-3 h-3 text-zinc-500 shrink-0" />
                        <code>{sec.codeSnippet}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
          >
            Close
          </button>

          {hasGenerated && (
            <button
              type="button"
              onClick={handleSendToTeleprompter}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Send Outline to Teleprompter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
