import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Check,
  Sparkles,
  BookOpen,
  Terminal,
  Heart,
  Moon,
  Zap,
  Sliders,
  Type
} from 'lucide-react';
import { THEMES, ThemeId, getSavedTheme, applyTheme } from '../utils/themeManager';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeSelect?: (themeId: ThemeId) => void;
}

const THEME_ICONS: Record<ThemeId, React.ComponentType<{ className?: string }>> = {
  editorial: BookOpen,
  technical: Terminal,
  warm: Heart,
  dark: Moon,
  vibrant: Zap,
};

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  onThemeSelect,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getSavedTheme());

  useEffect(() => {
    if (isOpen) {
      setCurrentTheme(getSavedTheme());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: ThemeId) => {
    setCurrentTheme(id);
    applyTheme(id);
    if (onThemeSelect) {
      onThemeSelect(id);
    }
    // Close modal on selection per prompt specification
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        // Close when clicking outside of modal container
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Palette className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="font-bold text-lg text-white flex items-center gap-2">
                <span>UI Theme Variations</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                  5 Styles
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Choose a visual identity tailored for your capture workspace & tutorial workflows
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme settings modal"
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Theme Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.values(THEMES).map((theme) => {
              const isSelected = currentTheme === theme.id;
              const Icon = THEME_ICONS[theme.id] || Sparkles;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(theme.id);
                    }
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none group flex flex-col justify-between gap-3 text-left ${
                    isSelected
                      ? 'bg-zinc-900/95 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/40'
                      : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Header & Tagline */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-xl"
                          style={{
                            backgroundColor: theme.colors.surfaceSubtle,
                            color: theme.colors.accent,
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{theme.name}</span>
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {theme.typography.label} • {theme.isDark ? 'Dark' : 'Light'}
                          </span>
                        </div>
                      </div>

                      {/* Selection Checkmark */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'border border-zinc-700 bg-zinc-800/40 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 font-medium leading-relaxed mt-2">
                      {theme.tagline}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-normal">
                      {theme.description}
                    </p>
                  </div>

                  {/* Swatches & Typography Preview Pill */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    {/* Swatches */}
                    <div className="flex items-center gap-1.5">
                      {theme.previewColors.map((color, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: color }}
                          title={`Color: ${color}`}
                        />
                      ))}
                    </div>

                    {/* Font Spec Badge */}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: theme.colors.badgeBg,
                        color: theme.colors.badgeText,
                      }}
                    >
                      {theme.id === 'editorial' && 'Serif Lora'}
                      {theme.id === 'technical' && 'JetBrains Mono'}
                      {theme.id === 'warm' && 'Soft Jakarta'}
                      {theme.id === 'dark' && 'Deep Dark'}
                      {theme.id === 'vibrant' && 'Neon Fuchsia'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span>Active Theme:</span>
            <strong className="text-indigo-400 font-semibold">{THEMES[currentTheme]?.name}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
