import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  MessageSquare,
  Mail,
  Code,
  ExternalLink,
  Film,
  Sparkles,
} from 'lucide-react';
import { ProjectRecordingMetadata } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: Partial<ProjectRecordingMetadata>;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  metadata,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const title = metadata.projectTitle || 'Software Tutorial';
  const duration = metadata.formattedDuration || '00:00';
  const language = metadata.languageName || 'English';
  const format = (metadata.exportFormat || 'mp4').toUpperCase();

  // Current URL or production share link
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://kbt-studio.ai';
  const shareableUrl = `${currentOrigin}/?tutorial=${encodeURIComponent(title)}&lang=${metadata.language || 'en'}`;

  // Markdown snippet for README.md, dev.to, GitHub PRs
  const markdownSnippet = `[![${title}](${currentOrigin}/preview-poster.png)](${shareableUrl})
### 🎥 Tutorial: ${title}
> Captured with **KBT AppGuideVideo Studio** (${duration} • ${format} • ${language})
- Interactive System Blueprints & 22-Language Softsubs
[Watch Tutorial Walkthrough](${shareableUrl})`;

  // HTML embed snippet
  const htmlEmbedSnippet = `<div style="max-width: 640px; border-radius: 12px; overflow: hidden; background: #09090b; border: 1px solid #27272a; padding: 16px; font-family: sans-serif; color: #fff;">
  <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">${title}</h4>
  <p style="margin: 0 0 12px; font-size: 12px; color: #a1a1aa;">Duration: ${duration} • Format: ${format}</p>
  <a href="${shareableUrl}" target="_blank" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;">Play Interactive Walkthrough</a>
</div>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Social share intents
  const tweetText = encodeURIComponent(`Check out my new software tutorial "${title}" (${duration}) built with KBT Studio! 🚀`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareableUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;

  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareableUrl)}&title=${encodeURIComponent(`Tutorial: ${title}`)}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Tutorial: ${title}`)}&body=${encodeURIComponent(
    `Hi,\n\nI just published a new software development walkthrough: "${title}" (${duration}).\n\nView it here: ${shareableUrl}\n\nCaptured with KBT Studio.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Share Tutorial</h2>
              <p className="text-xs text-zinc-400">
                Generate embed snippets, social links, and Markdown badges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Social Share Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300">Quick Share to Platforms</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-sky-500/20 hover:text-sky-400 border border-zinc-700 hover:border-sky-500/40 text-xs font-semibold text-zinc-200 transition"
              >
                <Twitter className="w-4 h-4" />
                Twitter / X
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-blue-600/20 hover:text-blue-400 border border-zinc-700 hover:border-blue-500/40 text-xs font-semibold text-zinc-200 transition"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>

              <a
                href={redditUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-orange-600/20 hover:text-orange-400 border border-zinc-700 hover:border-orange-500/40 text-xs font-semibold text-zinc-200 transition"
              >
                <MessageSquare className="w-4 h-4" />
                Reddit
              </a>

              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-600/20 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500/40 text-xs font-semibold text-zinc-200 transition"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>

          {/* Shareable Link Input */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300">Shareable Tutorial Link</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-300 select-all focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => copyToClipboard(shareableUrl, 'link')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shrink-0 active:scale-95"
              >
                {copiedType === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'link' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Markdown Snippet for GitHub README */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">GitHub README / Markdown Snippet</span>
              <button
                onClick={() => copyToClipboard(markdownSnippet, 'markdown')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedType === 'markdown' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'markdown' ? 'Copied snippet' : 'Copy snippet'}
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap select-all">
              {markdownSnippet}
            </pre>
          </div>

          {/* HTML5 Iframe Embed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">HTML Embed Code</span>
              <button
                onClick={() => copyToClipboard(htmlEmbedSnippet, 'html')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'html' ? 'Copied HTML' : 'Copy HTML'}
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap select-all">
              {htmlEmbedSnippet}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
