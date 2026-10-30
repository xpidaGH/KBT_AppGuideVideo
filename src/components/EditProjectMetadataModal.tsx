import React, { useState, useEffect } from 'react';
import { Tag, Edit3, X, Check, Cloud, FolderArchive, Plus } from 'lucide-react';
import { ArchiveSessionItem, updateArchivedSession } from '../services/firebaseSync';

interface EditProjectMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ArchiveSessionItem | null;
  onSessionUpdated: (updated: ArchiveSessionItem) => void;
}

export const EditProjectMetadataModal: React.FC<EditProjectMetadataModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionUpdated,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (session) {
      setTitle(session.projectTitle || '');
      setDescription(session.projectDescription || '');
      setTags(session.tags || []);
      setSaveSuccess(false);
    }
  }, [session]);

  if (!isOpen || !session) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      await updateArchivedSession(session.id, {
        projectTitle: title.trim() || 'Untitled Session',
        projectDescription: description.trim(),
        tags,
      });

      const updatedSession: ArchiveSessionItem = {
        ...session,
        projectTitle: title.trim() || 'Untitled Session',
        projectDescription: description.trim(),
        tags,
        updatedAt: new Date().toISOString(),
      };

      onSessionUpdated(updatedSession);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.warn('Failed to update project metadata:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Edit Project Metadata</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Firestore Archive
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Update title, description, and tags for session ID: <span className="font-mono text-zinc-300">{session.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 text-xs">
          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>Project Title</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SIMD AVX-512 Benchmark Tutorial"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-medium focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, tutorial topics, or systems benchmarks discussed..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>Tags & Categories</span>
              <span className="text-[10px] text-zinc-500 font-mono">Press Enter or Add</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. c-plus-plus, simd, tutorial"
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Render tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-800/60 text-[11px] font-mono"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-400 p-0.5 rounded cursor-pointer transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
            <Cloud className="w-3.5 h-3.5 text-purple-400" />
            <span>Syncs to Firestore & Local Storage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
              }`}
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Metadata'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
