import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Code2,
  BookOpen,
  Film,
  ArrowRight,
  Sparkles,
  Layers,
  ExternalLink,
  Keyboard,
} from 'lucide-react';
import { CODE_BLUEPRINTS } from '../data/blueprintsData';
import { getLocalArchives, ArchiveSessionItem } from '../services/firebaseSync';

interface SearchResultItem {
  id: string;
  type: 'blueprint' | 'doc' | 'archive';
  title: string;
  subtitle: string;
  badge: string;
  actionPayload?: any;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlueprint?: (blueprintId: string) => void;
  onOpenDoc?: (docType: 'user-guide' | 'installation' | 'architecture' | 'brand-assets') => void;
  onLoadArchiveSession?: (session: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectBlueprint,
  onOpenDoc,
  onLoadArchiveSession,
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search blueprints
  const matchingBlueprints: SearchResultItem[] = CODE_BLUEPRINTS.filter(
    (bp) =>
      bp.title.toLowerCase().includes(query.toLowerCase()) ||
      bp.language.toLowerCase().includes(query.toLowerCase()) ||
      bp.languageFamily.toLowerCase().includes(query.toLowerCase()) ||
      bp.description.toLowerCase().includes(query.toLowerCase())
  )
    .slice(0, 5)
    .map((bp) => ({
      id: `bp-${bp.id}`,
      type: 'blueprint' as const,
      title: `${bp.language}: ${bp.title}`,
      subtitle: bp.description,
      badge: bp.languageFamily,
      actionPayload: bp.id,
    }));

  // Documentation items
  const docItems: SearchResultItem[] = [
    {
      id: 'doc-user-guide',
      type: 'doc' as const,
      title: '22-Language International User Guide (USER_GUIDE.md)',
      subtitle: 'Complete technical documentation and localized audio instructions across 22 languages.',
      badge: '22-Lang Doc',
      actionPayload: 'user-guide',
    },
    {
      id: 'doc-installation',
      type: 'doc' as const,
      title: 'Native Installation & Platform Toolchain Guide (INSTALLATION.md)',
      subtitle: 'Toolchains for Android NDK, iOS Swift, Windows MSVC, and Linux GCC/Clang.',
      badge: 'Toolchains',
      actionPayload: 'installation',
    },
    {
      id: 'doc-architecture',
      type: 'doc' as const,
      title: 'Unified Cross-Language Architecture Map',
      subtitle: '5 Core Architectural Pillars from VRAM Compositor down to Mainframe telemetry.',
      badge: 'Architecture',
      actionPayload: 'architecture',
    },
    {
      id: 'doc-brand-assets',
      type: 'doc' as const,
      title: 'KBT Brand Logo & Multi-Platform App Icons (Desktop, Mobile, Web)',
      subtitle: 'Cyber-tech green/yellow spider icon for Desktop title bars, iOS/Android bars, and Web headers.',
      badge: 'Brand Assets',
      actionPayload: 'brand-assets',
    },
  ].filter(
    (d) =>
      !query ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  // Saved archive sessions
  const localArchives = getLocalArchives();
  const matchingArchives: SearchResultItem[] = localArchives
    .filter(
      (s: ArchiveSessionItem) =>
        s.projectTitle.toLowerCase().includes(query.toLowerCase()) ||
        (s.projectDescription && s.projectDescription.toLowerCase().includes(query.toLowerCase())) ||
        (s.tags && s.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase())))
    )
    .slice(0, 4)
    .map((s: ArchiveSessionItem) => ({
      id: `archive-${s.id}`,
      type: 'archive' as const,
      title: s.projectTitle,
      subtitle: `${s.formattedDuration} • ${s.exportFormat.toUpperCase()} • ${s.resolution}`,
      badge: 'Recording',
      actionPayload: s,
    }));

  const allResults: SearchResultItem[] = [...matchingBlueprints, ...docItems, ...matchingArchives];

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.type === 'blueprint' && onSelectBlueprint) {
      onSelectBlueprint(item.actionPayload);
    } else if (item.type === 'doc' && onOpenDoc) {
      onOpenDoc(item.actionPayload);
    } else if (item.type === 'archive' && onLoadArchiveSession) {
      onLoadArchiveSession(item.actionPayload);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/80">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blueprints, documentation, or saved recordings... (Esc to exit)"
            className="w-full bg-transparent text-white font-medium text-sm focus:outline-none placeholder:text-zinc-500"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
          {allResults.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No results found for "{query}". Try searching "Rust", "SIMD", "User Guide", or "Recording".
            </div>
          ) : (
            allResults.map((item) => {
              const isBlueprint = item.type === 'blueprint';
              const isDoc = item.type === 'doc';
              const isArchive = item.type === 'archive';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full p-3 rounded-2xl border border-zinc-800/80 hover:border-indigo-500/70 bg-zinc-950/50 hover:bg-zinc-900/80 text-left transition flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl border shrink-0 ${
                        isBlueprint
                          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                          : isDoc
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isBlueprint ? (
                        <Code2 className="w-4 h-4" />
                      ) : isDoc ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white group-hover:text-indigo-300 transition truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {item.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Navigate with mouse or click an item to open</span>
          <span className="font-mono">{allResults.length} items found</span>
        </div>
      </div>
    </div>
  );
};
