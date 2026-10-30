import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Download, Film, FileVideo, Sparkles } from 'lucide-react';
import { ExportFormatId } from '../types';

export interface ExportToastData {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
  filename?: string;
  format?: ExportFormatId;
  duration?: string;
}

interface ExportToastNotificationProps {
  toast: ExportToastData | null;
  onDismiss: () => void;
  onDownloadAgain?: (format: ExportFormatId) => void;
}

export const ExportToastNotification: React.FC<ExportToastNotificationProps> = ({
  toast,
  onDismiss,
  onDownloadAgain,
}) => {
  useEffect(() => {
    if (!toast) return;

    // Auto dismiss after 5 seconds if success, 7 seconds if error
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.type === 'error' ? 7000 : 5000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      id="export-toast-notification-banner"
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-auto select-none"
    >
      <div
        className={`p-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
          isSuccess
            ? 'bg-zinc-950/95 border-emerald-500/60 shadow-emerald-500/20 text-white'
            : 'bg-zinc-950/95 border-red-500/60 shadow-red-500/20 text-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-xs tracking-wide">
                  {toast.title}
                </h4>
                {toast.format && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      isSuccess
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    .{toast.format}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {toast.message}
              </p>
              {toast.filename && (
                <p className="text-[11px] font-mono text-emerald-300 truncate max-w-[320px]">
                  {toast.filename}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button row for success */}
        {isSuccess && onDownloadAgain && toast.format && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-zinc-400">
              Download another format:
            </span>
            <div className="flex items-center gap-1.5">
              {toast.format !== 'mp4' && (
                <button
                  type="button"
                  onClick={() => onDownloadAgain('mp4')}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-white border border-indigo-500/30 font-mono text-[10px] font-semibold transition cursor-pointer"
                >
                  .MP4
                </button>
              )}
              {toast.format !== 'webm' && (
                <button
                  type="button"
                  onClick={() => onDownloadAgain('webm')}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-300 hover:text-white border border-emerald-500/30 font-mono text-[10px] font-semibold transition cursor-pointer"
                >
                  .WEBM
                </button>
              )}
              {toast.format !== 'gif' && (
                <button
                  type="button"
                  onClick={() => onDownloadAgain('gif')}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white border border-purple-500/30 font-mono text-[10px] font-semibold transition cursor-pointer"
                >
                  .GIF
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
