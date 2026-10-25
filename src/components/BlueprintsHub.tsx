import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Filter,
  Search,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ArchitecturePillarId, CodeBlueprint } from '../types';
import { ARCHITECTURE_PILLARS, CODE_BLUEPRINTS } from '../data/blueprintsData';
import { triggerDownload } from '../utils/vttSrtExport';

export const BlueprintsHub: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<ArchitecturePillarId | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique languages
  const allLanguages = Array.from(new Set(CODE_BLUEPRINTS.map((b) => b.language))).sort();

  const filteredBlueprints = CODE_BLUEPRINTS.filter((b) => {
    const matchesPillar = selectedPillar === 'all' || b.pillarId === selectedPillar;
    const matchesLang = selectedLanguage === 'all' || b.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesLang && matchesSearch;
  });

  const [activeBlueprint, setActiveBlueprint] = useState<CodeBlueprint>(
    filteredBlueprints[0] || CODE_BLUEPRINTS[0]
  );

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSource = (bp: CodeBlueprint) => {
    triggerDownload(bp.code, bp.filename, 'text/plain');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-extrabold text-xl text-white tracking-tight">
              22-Language Production Capstone Blueprints
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              5 Core Engineering Pillars
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Authentic, production-grade source code modules bypassing high-level wrappers for direct GPU texture capture, SIMD AVX2 vectorization, lock-free ring buffers, headless render clusters, time-series telemetry lakes, and digital signal processing.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code blueprints..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Pillar Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPillar('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            selectedPillar === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          All 5 Pillars ({CODE_BLUEPRINTS.length})
        </button>

        {ARCHITECTURE_PILLARS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPillar(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedPillar === p.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>{p.title.split(':')[0]}</span>
          </button>
        ))}
      </div>

      {/* Language Quick Pills */}
      <div className="flex flex-wrap gap-1.5 items-center text-xs">
        <span className="text-zinc-500 text-[11px] font-mono mr-1">Languages:</span>
        <button
          onClick={() => setSelectedLanguage('all')}
          className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition ${
            selectedLanguage === 'all'
              ? 'bg-zinc-100 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          All
        </button>

        {allLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition ${
              selectedLanguage === lang
                ? 'bg-indigo-500 text-white font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Main Two-Column View: Left Blueprint List / Right Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Blueprint Selector */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredBlueprints.map((bp) => {
            const isSelected = activeBlueprint?.id === bp.id;
            return (
              <div
                key={bp.id}
                onClick={() => setActiveBlueprint(bp)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-500/10'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold font-mono text-indigo-300">
                    {bp.language}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[120px]">
                    {bp.filename}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white mb-1 leading-snug">
                  {bp.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {bp.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Code Viewer & Architectural Rationale */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
          {activeBlueprint && (
            <>
              {/* Code Viewer Title Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                      <span>{activeBlueprint.filename}</span>
                      <span className="text-xs text-indigo-400 font-sans font-normal">
                        ({activeBlueprint.language} • {activeBlueprint.languageFamily})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(activeBlueprint.code, activeBlueprint.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    {copiedId === activeBlueprint.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadSource(activeBlueprint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              {/* Rationale & SIMD Optimization Note */}
              <div className="p-4 bg-zinc-900/30 border-b border-zinc-800/80 text-xs space-y-2">
                <p className="text-zinc-300 leading-relaxed">
                  <strong className="text-white">Architecture Overview: </strong>
                  {activeBlueprint.description}
                </p>
                {activeBlueprint.simdOrOptimizationNote && (
                  <div className="flex items-center gap-2 text-amber-300 text-[11px] font-mono bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Performance Rationale: {activeBlueprint.simdOrOptimizationNote}</span>
                  </div>
                )}
              </div>

              {/* Code Pre Block with Syntax Styling */}
              <div className="flex-1 p-5 overflow-x-auto bg-zinc-950 font-mono text-xs leading-relaxed text-zinc-200 select-text max-h-[500px]">
                <pre className="whitespace-pre">{activeBlueprint.code}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
