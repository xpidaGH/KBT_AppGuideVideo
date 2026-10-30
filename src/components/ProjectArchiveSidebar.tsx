import React, { useState, useEffect } from 'react';
import {
  X,
  Archive,
  RefreshCw,
  FolderOpen,
  Trash2,
  Clock,
  Film,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Edit3,
  Tag,
} from 'lucide-react';
import {
  ArchiveSessionItem,
  fetchArchivedSessions,
  deleteArchivedSession,
  isCloudSyncEnabled,
} from '../services/firebaseSync';
import { EditProjectMetadataModal } from './EditProjectMetadataModal';

interface ProjectArchiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: ArchiveSessionItem) => void;
}

export const ProjectArchiveSidebar: React.FC<ProjectArchiveSidebarProps> = ({
  isOpen,
  onClose,
  onLoadSession,
}) => {
  const [sessions, setSessions] = useState<ArchiveSessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<ArchiveSessionItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchArchivedSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load archive sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this project archive from history?')) return;
    try {
      await deleteArchivedSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleExportJson = (session: ArchiveSessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${session.projectTitle.replace(/\s+/g, '_')}_metadata.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Project Archive
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {sessions.length}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isCloudSyncEnabled() ? 'Cloud synced via Firestore' : 'Stored locally in browser'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition disabled:opacity-50"
              title="Refresh Archives"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 && !loading && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Film className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-zinc-300">No archived sessions found</div>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Completed recordings and 30-second auto-saves will appear here automatically.
              </p>
            </div>
          )}

          {sessions.map((session) => {
            const isSelected = selectedId === session.id;
            const formattedDate = new Date(session.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                onClick={() => setSelectedId(session.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative group ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Static Thumbnail Screenshot Card */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative group-hover:border-indigo-500/50 transition flex items-center justify-center">
                    {session.thumbnailUrl ? (
                      <img
                        src={session.thumbnailUrl}
                        alt={session.projectTitle}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-0.5 text-zinc-600">
                        <Film className="w-5 h-5" />
                        <span className="text-[8px] font-mono uppercase">{session.exportFormat}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate max-w-[190px]">
                        {session.projectTitle}
                      </span>
                      {session.isAutoSaved && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          Auto-Save
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {session.formattedDuration}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-indigo-400 font-bold">{session.exportFormat}</span>
                      <span>•</span>
                      <span>{session.resolution}</span>
                    </div>

                    {session.projectDescription && (
                      <p className="text-[11px] text-zinc-400 line-clamp-1 italic pt-0.5">
                        {session.projectDescription}
                      </p>
                    )}

                    {session.tags && session.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {session.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono pt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {formattedDate}
                    </div>
                  </div>
                </div>

                {/* Expanded Action Toolbar */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    LUT: {session.colorFilter || 'none'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSession(session);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 transition"
                      title="Edit Project Title, Description & Tags in Firestore"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleExportJson(session, e)}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="Download Metadata JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete from Archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadSession(session);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm transition active:scale-95"
                    >
                      <FolderOpen className="w-3 h-3" />
                      Load
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
          <span>Click "Load" to restore project settings</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Project Metadata Modal */}
      <EditProjectMetadataModal
        isOpen={!!editingSession}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onSessionUpdated={(updated) => {
          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setEditingSession(null);
        }}
      />
    </div>
  );
};
