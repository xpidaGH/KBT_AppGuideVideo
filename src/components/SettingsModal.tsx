import React, { useState, useEffect } from 'react';
import {
  X,
  Keyboard,
  Cloud,
  Trash2,
  Check,
  RotateCcw,
  Sliders,
  HardDrive,
  AlertTriangle,
  GitBranch,
  Github,
  Sun,
  Moon,
  Search,
  Download,
  FolderTree,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  UploadCloud,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { KeyboardShortcutDef, KEYBOARD_SHORTCUTS } from '../data/recorderConfig';
import { isCloudSyncEnabled, setCloudSyncEnabled } from '../services/firebaseSync';
import { getStorageUsage, cleanupStorageThreshold, StorageQuotaReport } from '../utils/storageCleanup';
import {
  githubSyncService,
  GitHubUserSession,
  GitHubRepoItem,
  GitHubTreeNode,
} from '../services/githubSync';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcutDef[];
  onUpdateShortcuts: (updated: KeyboardShortcutDef[]) => void;
  onResetShortcuts: () => void;
  cloudSyncEnabled: boolean;
  onToggleCloudSync: (enabled: boolean) => void;
  currentProjectData?: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onUpdateShortcuts,
  onResetShortcuts,
  cloudSyncEnabled,
  onToggleCloudSync,
  currentProjectData,
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'vcs' | 'cloud' | 'appearance' | 'storage'>('shortcuts');
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [searchShortcut, setSearchShortcut] = useState<string>('');
  const [storageReport, setStorageReport] = useState<StorageQuotaReport>(() => getStorageUsage());
  const [cleanupFeedback, setCleanupFeedback] = useState<string | null>(null);

  // GitHub Version Control State
  const [ghSession, setGhSession] = useState<GitHubUserSession | null>(() => githubSyncService.getSession());
  const [ghTokenInput, setGhTokenInput] = useState<string>('');
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [repoTree, setRepoTree] = useState<GitHubTreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set(['metadata.json', 'README.md']));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'blueprints']));
  const [isLoadingVcs, setIsLoadingVcs] = useState<boolean>(false);
  const [vcsFeedback, setVcsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kbt_theme_v1');
      if (stored === 'light') return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (isOpen) {
      setStorageReport(getStorageUsage());
      setCleanupFeedback(null);
      setGhSession(githubSyncService.getSession());
    }
  }, [isOpen]);

  // When GitHub session is available, fetch repos
  useEffect(() => {
    if (ghSession?.token && activeTab === 'vcs') {
      setIsLoadingVcs(true);
      githubSyncService
        .fetchRepositories()
        .then((items) => {
          setRepos(items);
          if (items.length > 0 && !selectedRepo) {
            setSelectedRepo(items[0].fullName);
          }
        })
        .catch((err) => {
          console.warn('Failed to load GitHub repositories:', err);
        })
        .finally(() => setIsLoadingVcs(false));
    }
  }, [ghSession, activeTab]);

  // When selected repo changes, fetch tree
  useEffect(() => {
    if (selectedRepo && ghSession?.token && activeTab === 'vcs') {
      githubSyncService
        .fetchRepoTree(selectedRepo)
        .then((tree) => {
          setRepoTree(tree);
        })
        .catch((e) => console.warn('Failed to fetch repo tree:', e));
    }
  }, [selectedRepo, ghSession, activeTab]);

  // Key capture listener when remapping a key
  useEffect(() => {
    if (!editingAction) return;

    const handleKeyCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newKey = e.key === ' ' ? ' ' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const ctrlPrefix = e.ctrlKey || e.metaKey ? 'Ctrl+' : '';
      const shiftPrefix = e.shiftKey ? 'Shift+' : '';
      const baseKey = e.key === ' ' ? 'Space' : e.key.toUpperCase();
      const newDisplayKey = `${ctrlPrefix}${shiftPrefix}${baseKey}`;
      const newCode = e.code;

      const updated = shortcuts.map((s) => {
        if (s.action === editingAction) {
          return {
            ...s,
            key: newKey,
            code: newCode,
            displayKey: newDisplayKey,
            requiresCtrl: e.ctrlKey || e.metaKey,
            requiresShift: e.shiftKey,
          };
        }
        return s;
      });

      try {
        localStorage.setItem('kbt_custom_shortcuts_v1', JSON.stringify(updated));
      } catch (err) {}

      onUpdateShortcuts(updated);
      setEditingAction(null);
    };

    window.addEventListener('keydown', handleKeyCapture, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyCapture, { capture: true });
    };
  }, [editingAction, shortcuts, onUpdateShortcuts]);

  if (!isOpen) return null;

  const handleManualCleanup = () => {
    const res = cleanupStorageThreshold(5);
    setStorageReport(getStorageUsage());
    setCleanupFeedback(`Freed ${res.freedMb} MB (${res.clearedKeys.length} temp items cleaned)`);
    setTimeout(() => setCleanupFeedback(null), 4000);
  };

  const handleToggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('kbt_theme_v1', newTheme);
    }
  };

  const handleGitHubLoginPopup = async () => {
    setIsLoadingVcs(true);
    setVcsFeedback(null);
    try {
      const session = await githubSyncService.loginWithGitHub();
      setGhSession(session);
      setVcsFeedback({ type: 'success', message: `Connected as @${session.username} with 'repo' scope` });
    } catch (err: any) {
      setVcsFeedback({ type: 'error', message: err.message || 'GitHub Login failed' });
    } finally {
      setIsLoadingVcs(false);
    }
  };

  const handleGitHubTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghTokenInput.trim()) return;
    setIsLoadingVcs(true);
    setVcsFeedback(null);
    try {
      const session = await githubSyncService.loginWithToken(ghTokenInput.trim());
      setGhSession(session);
      setGhTokenInput('');
      setVcsFeedback({ type: 'success', message: `Connected as @${session.username} via Personal Access Token` });
    } catch (err: any) {
      setVcsFeedback({ type: 'error', message: err.message || 'Invalid Token' });
    } finally {
      setIsLoadingVcs(false);
    }
  };

  const handlePushMetadata = async () => {
    if (!selectedRepo) {
      setVcsFeedback({ type: 'error', message: 'Please select a target repository' });
      return;
    }
    setIsLoadingVcs(true);
    setVcsFeedback(null);
    try {
      const metadataToPush = currentProjectData || {
        projectTitle: 'KBT Studio Video Project',
        description: 'Multi-platform screen recorder and tutorial architecture blueprint metadata',
        updatedAt: new Date().toISOString(),
        syncedFiles: Array.from(selectedFiles),
      };

      const result = await githubSyncService.pushProjectMetadata(
        selectedRepo,
        'kbt-project-metadata.json',
        metadataToPush,
        `chore(kbt): sync project metadata and curriculum state [${new Date().toLocaleTimeString()}]`
      );

      setVcsFeedback({
        type: 'success',
        message: `Successfully pushed metadata to ${selectedRepo}! (Commit: ${result.commitSha.slice(0, 7)})`,
      });
    } catch (err: any) {
      setVcsFeedback({ type: 'error', message: err.message || 'Failed to commit metadata' });
    } finally {
      setIsLoadingVcs(false);
    }
  };

  const filteredShortcuts = shortcuts.filter(
    (s) =>
      s.description.toLowerCase().includes(searchShortcut.toLowerCase()) ||
      s.action.toLowerCase().includes(searchShortcut.toLowerCase()) ||
      s.displayKey.toLowerCase().includes(searchShortcut.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Studio Settings</h2>
              <p className="text-xs text-zinc-400">
                Keybindings, GitHub Version Control, Cloud Sync, and UI Theme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-800 bg-zinc-950/20 overflow-x-auto">
          {[
            { id: 'shortcuts', label: 'Key Bindings', icon: Keyboard },
            { id: 'vcs', label: 'Version Control (GitHub)', icon: GitBranch },
            { id: 'cloud', label: 'Cloud Sync', icon: Cloud },
            { id: 'appearance', label: 'Theme & Display', icon: Sun },
            { id: 'storage', label: 'Storage Quota', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-white bg-zinc-800/60'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: Key Bindings & Searchable Rebinding */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              {/* Export Hotkeys Sub-Menu Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-zinc-950 border border-indigo-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Export Shortcuts Configuration</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">KBT Hotkey Event Bus</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Assign dedicated hotkeys for <strong>Fast Immediate Export</strong> vs <strong>Advanced Export Modal</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">Fast Export (Immediate Render)</div>
                      <div className="text-[10px] text-zinc-400 font-mono">FAST_EXPORT</div>
                    </div>
                    <button
                      onClick={() => setEditingAction('FAST_EXPORT')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-sm cursor-pointer"
                    >
                      {editingAction === 'FAST_EXPORT'
                        ? '...'
                        : shortcuts.find((s) => s.action === 'FAST_EXPORT')?.displayKey || 'Ctrl+E'}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">Advanced Export (Preset Dialog)</div>
                      <div className="text-[10px] text-zinc-400 font-mono">ADVANCED_EXPORT</div>
                    </div>
                    <button
                      onClick={() => setEditingAction('ADVANCED_EXPORT')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs border border-zinc-700 shadow-sm cursor-pointer"
                    >
                      {editingAction === 'ADVANCED_EXPORT'
                        ? '...'
                        : shortcuts.find((s) => s.action === 'ADVANCED_EXPORT')?.displayKey || 'Ctrl+Shift+E'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Searchable Shortcut List */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchShortcut}
                    onChange={(e) => setSearchShortcut(e.target.value)}
                    placeholder="Search shortcuts..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={onResetShortcuts}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {editingAction && (
                <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500 text-indigo-200 text-xs flex items-center justify-between animate-pulse">
                  <span>
                    Press any key combo to bind to <strong>{editingAction}</strong>...
                  </span>
                  <button
                    onClick={() => setEditingAction(null)}
                    className="text-indigo-400 hover:text-white underline text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredShortcuts.map((shortcut) => {
                  const isEditing = editingAction === shortcut.action;
                  return (
                    <div
                      key={shortcut.action + shortcut.displayKey}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                        isEditing
                          ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="text-xs font-semibold text-zinc-200">{shortcut.description}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{shortcut.action}</div>
                      </div>

                      <button
                        onClick={() => setEditingAction(shortcut.action)}
                        className={`min-w-10 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition shadow-sm cursor-pointer ${
                          isEditing
                            ? 'bg-indigo-600 text-white border-indigo-400 animate-bounce'
                            : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600'
                        }`}
                        title="Click to remap shortcut"
                      >
                        {isEditing ? '...' : shortcut.displayKey}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Version Control (GitHub) */}
          {activeTab === 'vcs' && (
            <div className="space-y-5">
              {vcsFeedback && (
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-2 ${
                    vcsFeedback.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{vcsFeedback.message}</span>
                </div>
              )}

              {/* Authentication Status Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ghSession ? (
                      <img
                        src={ghSession.avatarUrl}
                        alt={ghSession.username}
                        className="w-10 h-10 rounded-full border border-indigo-500/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <Github className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{ghSession ? ghSession.displayName : 'GitHub Version Control'}</span>
                        {ghSession && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Authenticated (repo scope)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {ghSession
                          ? `@${ghSession.username} • Access to public and private repositories`
                          : 'Authenticate to commit project metadata JSON and curriculum state directly to GitHub'}
                      </p>
                    </div>
                  </div>

                  {ghSession ? (
                    <button
                      onClick={async () => {
                        await githubSyncService.logout();
                        setGhSession(null);
                        setRepos([]);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-zinc-700 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGitHubLoginPopup}
                      disabled={isLoadingVcs}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition shadow-sm border border-zinc-700"
                    >
                      <Github className="w-4 h-4" />
                      <span>Connect with GitHub</span>
                    </button>
                  )}
                </div>

                {!ghSession && (
                  <form onSubmit={handleGitHubTokenLogin} className="pt-2 border-t border-zinc-900 flex items-center gap-2">
                    <input
                      type="password"
                      value={ghTokenInput}
                      onChange={(e) => setGhTokenInput(e.target.value)}
                      placeholder="Or enter GitHub Personal Access Token (with repo scope)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingVcs || !ghTokenInput.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
                    >
                      Link Token
                    </button>
                  </form>
                )}
              </div>

              {/* Repo Selector & File Tree */}
              {ghSession && (
                <div className="space-y-4">
                  {/* Repo Selector */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                    <label className="font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                      Target Repository:
                    </label>
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                    >
                      {repos.length === 0 ? (
                        <option value="">Loading repositories...</option>
                      ) : (
                        repos.map((r) => (
                          <option key={r.id} value={r.fullName}>
                            {r.fullName} {r.private ? '(Private)' : '(Public)'}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Repository Tree Structure */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <FolderTree className="w-4 h-4 text-indigo-400" />
                        Repository File Structure (Select files for Metadata Sync)
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {selectedFiles.size} selected
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                      {repoTree.length === 0 ? (
                        <div className="text-zinc-500 py-3 text-center">
                          Fetching file tree from GitHub API...
                        </div>
                      ) : (
                        repoTree.slice(0, 40).map((node) => {
                          const isBlob = node.type === 'blob';
                          const isChecked = selectedFiles.has(node.path);

                          return (
                            <div
                              key={node.path}
                              onClick={() => {
                                if (isBlob) {
                                  setSelectedFiles((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(node.path)) next.delete(node.path);
                                    else next.add(node.path);
                                    return next;
                                  });
                                }
                              }}
                              className={`flex items-center justify-between px-2 py-1 rounded-lg transition cursor-pointer ${
                                isChecked ? 'bg-indigo-950/50 text-indigo-300' : 'text-zinc-400 hover:bg-zinc-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isBlob ? (
                                  <File className="w-3.5 h-3.5 text-zinc-500" />
                                ) : (
                                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                                )}
                                <span className="truncate">{node.path}</span>
                              </div>
                              {isBlob && (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 rounded text-indigo-600 accent-indigo-500"
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handlePushMetadata}
                        disabled={isLoadingVcs || !selectedRepo}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                      >
                        <UploadCloud className={`w-4 h-4 ${isLoadingVcs ? 'animate-bounce' : ''}`} />
                        <span>{isLoadingVcs ? 'Pushing to GitHub...' : 'Sync to GitHub (Push Metadata)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Cloud Sync */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Firebase Firestore Auto-Sync</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cloudSyncEnabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {cloudSyncEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-md">
                      Syncs project metadata, active recording checkpoints every 30s, and past tutorial archives across devices.
                      Toggle off to minimize network overhead during high-performance 60 FPS recording.
                    </p>
                  </div>

                  <button
                    onClick={() => onToggleCloudSync(!cloudSyncEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      cloudSyncEnabled ? 'bg-indigo-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        cloudSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Appearance / Global Theme */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white">Application Color Theme</span>
                  <p className="text-xs text-zinc-400">
                    Switch between dark and light UI themes for the entire application interface.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleToggleTheme('dark')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      theme === 'dark'
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-zinc-950 text-indigo-400 border border-zinc-800">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Dark Studio Theme</div>
                        <div className="text-[10px] text-zinc-400">High contrast for video editing</div>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleTheme('light')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      theme === 'light'
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-zinc-950 text-amber-400 border border-zinc-800">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Light Theme</div>
                        <div className="text-[10px] text-zinc-400">Clean daytime brightness</div>
                      </div>
                    </div>
                    {theme === 'light' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Storage Quota & Cleanup */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Browser Storage Usage</div>
                    <div className="text-xs text-zinc-400">
                      Local storage and temporary recording chunk buffers
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-lg font-bold text-indigo-400">{storageReport.usedMb} MB</div>
                    <div className="text-[10px] text-zinc-500">Threshold: {storageReport.thresholdMb} MB</div>
                  </div>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      storageReport.isOverThreshold ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (storageReport.usedMb / storageReport.thresholdMb) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-400">
                    {storageReport.itemCount} items ({storageReport.tempItemsCount} temp chunk buffers)
                  </span>

                  <button
                    onClick={handleManualCleanup}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Temp Buffers</span>
                  </button>
                </div>

                {cleanupFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{cleanupFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
