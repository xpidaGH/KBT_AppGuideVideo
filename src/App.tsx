import React, { useState } from 'react';
import { Header } from './components/Header';
import { StudioRecorder } from './components/StudioRecorder';
import { BlueprintsHub } from './components/BlueprintsHub';
import { BenchmarkLab } from './components/BenchmarkLab';
import { UserGuideModal } from './components/UserGuideModal';
import { InstallationModal } from './components/InstallationModal';
import { ArchitectureMapModal } from './components/ArchitectureMapModal';
import { SupportedLanguageCode } from './types';
import { LANGUAGE_MAP, SUPPORTED_LANGUAGES } from './data/languages';
import {
  Video,
  BookOpen,
  Download,
  GitBranch,
  Languages,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'studio' | 'blueprints' | 'benchmarks'>('studio');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>('en');

  // Modals
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isArchitectureMapOpen, setIsArchitectureMapOpen] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const currentLang = LANGUAGE_MAP[selectedLanguage] || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onOpenArchitectureMap={() => setIsArchitectureMapOpen(true)}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        audioLevel={audioLevel}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 space-y-6">
        {/* Splash Banner (Prominently featuring User Guide, Native Install, and 22 Languages) */}
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/30 to-zinc-900 border border-indigo-900/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  KBT_AppGuideVideo Systems Capstone
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Inspired by OBS Studio, Camtasia, Scribe & Loom
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Software Tutorial Creation, Low-Level SIMD Capture & 22-Language Systems Architecture
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Empowering international computer science and systems programming students to capture raw GPU textures, vectorize color spaces in SIMD assembly, mux hardware containers, stream reactive telemetry lakes, and synthesize multi-lingual voiceovers across mobile, web, and desktop.
              </p>

              {/* Splash Screen Action Buttons: User Guide Button, Native Install, Language Switcher */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* 1. Prompt-Required User Guide Button */}
                <button
                  id="btn-splash-user-guide"
                  onClick={() => setIsUserGuideOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open 22-Language User Guide (USER_GUIDE.md)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* 2. Prompt-Required Native Install Guide Button */}
                <button
                  id="btn-splash-install-guide"
                  onClick={() => setIsInstallGuideOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Native Install Guide (Android, iOS, Windows, macOS)</span>
                </button>

                {/* 3. Language Selector */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguageCode)}
                    aria-label="Select Current Applet Language"
                    className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-100">
                        {lang.flag} {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="hidden lg:grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">PILLARS</span>
                <div className="text-lg font-bold text-indigo-400">5 Modules</div>
                <span className="text-[10px] text-zinc-400">VRAM to Mainframe</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">LANGUAGES</span>
                <div className="text-lg font-bold text-purple-400">22 Complete</div>
                <span className="text-[10px] text-zinc-400">Full I18n & TTS</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">ANNOTATIONS</span>
                <div className="text-lg font-bold text-amber-400">Softsubs & Scribe</div>
                <span className="text-[10px] text-zinc-400">VTT/SRT + Workflows</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">OUTPUT FORMAT</span>
                <div className="text-lg font-bold text-emerald-400">1080p 60FPS</div>
                <span className="text-[10px] text-zinc-400">YouTube & LMS Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Studio Screen Recorder & Interactive Compositor */}
        {currentTab === 'studio' && (
          <StudioRecorder
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            recordingSeconds={recordingSeconds}
            setRecordingSeconds={setRecordingSeconds}
            setAudioLevel={setAudioLevel}
          />
        )}

        {/* Tab 2: 22-Language Production Capstone Blueprints Hub */}
        {currentTab === 'blueprints' && <BlueprintsHub />}

        {/* Tab 3: Interactive SIMD & DSP Benchmark Lab */}
        {currentTab === 'benchmarks' && <BenchmarkLab />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 px-6 py-4 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-zinc-400">KBT_AppGuideVideo</span>
          <span>•</span>
          <span>International Systems Programming & Multimedia Engineering Curriculum</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button onClick={() => setIsUserGuideOpen(true)} className="hover:text-zinc-300 transition">
            USER_GUIDE.md (22 Languages)
          </button>
          <span>•</span>
          <button onClick={() => setIsInstallGuideOpen(true)} className="hover:text-zinc-300 transition">
            INSTALLATION.md (Multi-Platform)
          </button>
          <span>•</span>
          <button onClick={() => setIsArchitectureMapOpen(true)} className="hover:text-zinc-300 transition">
            Architecture Map
          </button>
        </div>
      </footer>

      {/* Modals */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <InstallationModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      <ArchitectureMapModal
        isOpen={isArchitectureMapOpen}
        onClose={() => setIsArchitectureMapOpen(false)}
      />
    </div>
  );
}
