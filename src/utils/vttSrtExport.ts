import { SoftsubCue, SupportedLanguageCode, ScribeWorkflowStep, ProjectRecordingMetadata } from '../types';

/**
 * Format seconds to WebVTT timestamp: 00:01:23.456
 */
export function formatVttTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

/**
 * Format seconds to SubRip (SRT) timestamp: 00:01:23,456
 */
export function formatSrtTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

/**
 * Format duration in seconds to standard display counter: MM:SS or HH:MM:SS
 */
export function formatDisplayDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}


/**
 * Generate WebVTT content for a given target language
 */
export function generateWebVTT(cues: SoftsubCue[], lang: SupportedLanguageCode = 'en'): string {
  let vtt = `WEBVTT - KBT_AppGuideVideo Timed Metadata Track (${lang})\n\n`;

  cues.forEach((cue, index) => {
    const text = cue.translations[lang] || cue.text;
    const speakerPrefix = cue.speaker ? `<v ${cue.speaker}>` : '';
    vtt += `${index + 1}\n`;
    vtt += `${formatVttTimestamp(cue.startTime)} --> ${formatVttTimestamp(cue.endTime)}\n`;
    vtt += `${speakerPrefix}${text}\n\n`;
  });

  return vtt;
}

/**
 * Generate SubRip (SRT) content for YouTube & LMS platforms
 */
export function generateSRT(cues: SoftsubCue[], lang: SupportedLanguageCode = 'en'): string {
  let srt = '';

  cues.forEach((cue, index) => {
    const text = cue.translations[lang] || cue.text;
    const speakerPrefix = cue.speaker ? `${cue.speaker}: ` : '';
    srt += `${index + 1}\n`;
    srt += `${formatSrtTimestamp(cue.startTime)} --> ${formatSrtTimestamp(cue.endTime)}\n`;
    srt += `${speakerPrefix}${text}\n\n`;
  });

  return srt;
}

/**
 * Export Scribe/Guidde structured workflow documentation as Markdown
 */
export function generateScribeMarkdown(
  steps: ScribeWorkflowStep[],
  title: string = 'Software Step-by-Step Interactive Guide',
  lang: SupportedLanguageCode = 'en'
): string {
  let md = `# ${title}\n`;
  md += `*Generated automatically by KBT_AppGuideVideo Scribe Engine*\n`;
  md += `*Language: ${lang}*\n\n`;

  steps.forEach((step) => {
    const tr = step.translations[lang] || { title: step.title, description: step.description };
    md += `## Step ${step.stepNumber}: ${tr.title}\n`;
    md += `- **Timestamp**: ${step.timestamp.toFixed(2)}s\n`;
    md += `- **Action**: \`${step.actionType.toUpperCase()}\` on \`${step.targetElement}\`\n`;
    md += `- **Coordinates**: (X: ${step.coordinates.x}px, Y: ${step.coordinates.y}px)\n`;
    md += `- **Instructions**: ${tr.description}\n`;
    if (step.codeSnippet) {
      md += `\n\`\`\`bash\n${step.codeSnippet}\n\`\`\`\n`;
    }
    md += `\n---\n\n`;
  });

  return md;
}

/**
 * Download a file in the browser
 */
export function triggerDownload(content: string | Blob, filename: string, mimeType: string = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Sanitize a string for safe usage in file names
 */
export function sanitizeFileName(name: string, fallback: string = 'KBT_Tutorial'): string {
  if (!name || typeof name !== 'string') return fallback;
  const sanitized = name
    .trim()
    .replace(/[^\w\s-]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
  return sanitized || fallback;
}

/**
 * Generate formatted JSON companion metadata manifest
 */
export function generateProjectMetadataJson(metadata: ProjectRecordingMetadata): string {
  return JSON.stringify(metadata, null, 2);
}

