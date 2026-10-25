import { SoftsubCue, SupportedLanguageCode, ScribeWorkflowStep } from '../types';

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
export function triggerDownload(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
