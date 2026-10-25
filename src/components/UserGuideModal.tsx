import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Languages,
  Download,
  Search,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguageCode, LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../data/languages';
import { USER_GUIDE_TRANSLATIONS, UserGuideLanguageData } from '../data/userGuideTranslations';
import { ttsEngine } from '../utils/tts';
import { triggerDownload } from '../utils/vttSrtExport';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ttsState, setTtsState] = useState<{
    isSpeaking: boolean;
    isPaused: boolean;
    progressText?: string;
  }>({
    isSpeaking: false,
    isPaused: false,
  });
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  const currentLangInfo: LanguageInfo = LANGUAGE_MAP[selectedLanguage] || SUPPORTED_LANGUAGES[0];
  const guideData: UserGuideLanguageData =
    USER_GUIDE_TRANSLATIONS[selectedLanguage] || USER_GUIDE_TRANSLATIONS.en;

  // Subscribe to TTS state
  useEffect(() => {
    const unsubscribe = ttsEngine.subscribe((state) => {
      setTtsState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Update voice display on language change
  useEffect(() => {
    const voice = ttsEngine.getVoiceForLanguage(selectedLanguage);
    setSelectedVoiceName(voice ? `${voice.name} (${voice.lang})` : 'System Default Voice');
  }, [selectedLanguage]);

  // Stop TTS if modal closes
  useEffect(() => {
    if (!isOpen) {
      ttsEngine.stop();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartTts = (textToRead?: string) => {
    const fullText =
      textToRead ||
      `${guideData.title}. ${guideData.subtitle}. ${guideData.overview}. ${guideData.sections
        .map((s) => `${s.title}: ${s.content}`)
        .join('. ')}`;

    ttsEngine.speak(fullText, selectedLanguage, {
      rate: speechRate,
      onEnd: () => {},
    });
  };

  const handlePauseTts = () => {
    ttsEngine.pause();
  };

  const handleResumeTts = () => {
    ttsEngine.resume();
  };

  const handleStopTts = () => {
    ttsEngine.stop();
  };

  const filteredSections = guideData.sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadMarkdown = () => {
    let md = `# ${guideData.title}\n\n`;
    md += `*${guideData.subtitle}*\n\n`;
    md += `> Language: ${currentLangInfo.name} (${currentLangInfo.nativeName}) - [${currentLangInfo.bcp47}]\n\n`;
    md += `## Overview\n${guideData.overview}\n\n`;
    guideData.sections.forEach((sec) => {
      md += `## ${sec.title}\n\n${sec.content}\n\n`;
    });
    triggerDownload(md, `USER_GUIDE_${selectedLanguage.toUpperCase()}.md`, 'text/markdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        dir={currentLangInfo.direction}
        className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentLangInfo.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">USER_GUIDE.md</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {guideData.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {currentLangInfo.name} ({currentLangInfo.nativeName}) • {currentLangInfo.region}
              </p>
            </div>
          </div>

          {/* Language Selector + Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-800/80 px-2.5 py-1.5 rounded-xl border border-zinc-700">
              <Languages className="w-4 h-4 text-purple-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguageCode)}
                aria-label="Select User Guide Translation Language"
                className="bg-transparent text-xs text-zinc-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-100">
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadMarkdown}
              title="Download Markdown Guide"
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TTS Voiceover Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-900/80 border-b border-indigo-900/40 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-200">Native Text-to-Speech (TTS) Voiceover</span>
                {ttsState.isSpeaking && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {ttsState.isPaused ? 'PAUSED' : 'SPEAKING'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-sm">
                System Voice: <span className="text-zinc-300 font-mono">{selectedVoiceName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-zinc-400">
              <span>Speed:</span>
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="bg-zinc-800 rounded px-1.5 py-0.5 text-zinc-200 border border-zinc-700 font-mono"
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x (Normal)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>

            {/* Play / Pause / Stop buttons */}
            {!ttsState.isSpeaking ? (
              <button
                onClick={() => handleStartTts()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen in {currentLangInfo.name}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                {ttsState.isPaused ? (
                  <button
                    onClick={handleResumeTts}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTts}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                )}
                <button
                  onClick={handleStopTts}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search guide in ${currentLangInfo.name}...`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title Banner */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              {guideData.title}
            </h1>
            <p className="text-sm text-indigo-400 font-medium mb-3">
              {guideData.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {guideData.overview}
            </p>
          </div>

          {/* Guide Sections */}
          <div className="space-y-4">
            {filteredSections.map((sec) => (
              <div
                key={sec.id}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {sec.title}
                  </h3>

                  <button
                    onClick={() => handleStartTts(`${sec.title}. ${sec.content}`)}
                    title="Read this section only"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 transition text-xs flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Read section</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>KBT International Systems Programming Curriculum • 22 Supported Languages</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadMarkdown}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download Markdown ({selectedLanguage.toUpperCase()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
