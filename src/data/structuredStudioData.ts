/**
 * Structured Data File: Watermark Presets, Audio Channel Configurations,
 * Noise Gate Presets, and Reusable Vectors
 */

export interface WatermarkPreset {
  id: string;
  name: string;
  svg: string;
}

export const DEFAULT_WATERMARK_PRESETS: WatermarkPreset[] = [
  {
    id: 'kbt-badge',
    name: 'KBT Studio Badge',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="236" height="56" rx="14" fill="#09090b" fill-opacity="0.88" stroke="url(#g1)" stroke-width="2" />
      <circle cx="30" cy="30" r="14" fill="url(#g1)" />
      <polygon points="26,22 38,30 26,38" fill="#ffffff" />
      <text x="56" y="30" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#ffffff" letter-spacing="0.5">KBT STUDIO</text>
      <text x="56" y="44" font-family="sans-serif" font-size="10" font-weight="600" fill="#a1a1aa">MULTI-TRACK RECORDER</text>
    </svg>`,
  },
  {
    id: 'confidential',
    name: 'Confidential / Internal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 50" width="220" height="50">
      <rect x="2" y="2" width="216" height="46" rx="8" fill="#450a0a" fill-opacity="0.85" stroke="#ef4444" stroke-width="2" />
      <text x="110" y="24" font-family="sans-serif" font-size="12" font-weight="900" fill="#fca5a5" text-anchor="middle" letter-spacing="2">CONFIDENTIAL</text>
      <text x="110" y="38" font-family="monospace" font-size="9" font-weight="600" fill="#f87171" text-anchor="middle">INTERNAL USE ONLY</text>
    </svg>`,
  },
  {
    id: 'verified-tutorial',
    name: 'Verified Tutorial',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="200" height="50">
      <rect x="2" y="2" width="196" height="46" rx="10" fill="#064e3b" fill-opacity="0.85" stroke="#10b981" stroke-width="2" />
      <circle cx="28" cy="25" r="11" fill="#10b981" />
      <polyline points="23,25 27,29 33,21" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="48" y="24" font-family="sans-serif" font-size="12" font-weight="800" fill="#ecfdf5">VERIFIED TUTORIAL</text>
      <text x="48" y="38" font-family="monospace" font-size="9" fill="#a7f3d0">22-LANG CAPSTONE</text>
    </svg>`,
  },
];

export const NOISE_GATE_PRESETS = [
  { id: 'low', label: 'Gentle (-50 dB)', value: -50, desc: 'Quiet studio or headset' },
  { id: 'medium', label: 'Standard (-42 dB)', value: -42, desc: 'Balanced room noise reduction' },
  { id: 'high', label: 'Aggressive (-32 dB)', value: -32, desc: 'Loud environment or fan noise' },
];

export const WATERMARK_POSITIONS = [
  { id: 'bottom-right', label: 'Bottom Right', corner: 'BR' },
  { id: 'bottom-left', label: 'Bottom Left', corner: 'BL' },
  { id: 'top-right', label: 'Top Right', corner: 'TR' },
  { id: 'top-left', label: 'Top Left', corner: 'TL' },
  { id: 'center', label: 'Center (Watermark)', corner: 'C' },
] as const;

export type WatermarkPositionType = (typeof WATERMARK_POSITIONS)[number]['id'];

export const CROP_PRESETS = [
  { id: 'free', label: 'Free / Custom', ratio: null, description: 'Arbitrary custom crop bounding box' },
  { id: '16:9', label: '16:9 YouTube', ratio: 16 / 9, description: 'Widescreen landscape (1920×1080 / 1280×720)' },
  { id: '9:16', label: '9:16 Shorts/Reels', ratio: 9 / 16, description: 'Vertical mobile feed (TikTok, Reels, Shorts)' },
  { id: '1:1', label: '1:1 Square', ratio: 1, description: 'Square post format (Instagram, Discord)' },
  { id: '4:3', label: '4:3 Presentation', ratio: 4 / 3, description: 'Standard slides / classic monitor ratio' },
  { id: '21:9', label: '21:9 Cinematic', ratio: 21 / 9, description: 'UltraWide panoramic cinema framing' },
  { id: '3:2', label: '3:2 Classic', ratio: 3 / 2, description: 'Photography 35mm / tablet landscape' },
] as const;

export const DEFAULT_CROP_SETTINGS = {
  isEnabled: false,
  isEditing: false,
  x: 0.05,
  y: 0.05,
  width: 0.9,
  height: 0.9,
  preset: '16:9' as const,
  isLocked: false,
  showRuleOfThirds: true,
};

export const COMPRESSOR_RATIO_PRESETS = [
  { id: 'subtle', label: '2:1 Subtle', value: 2, desc: 'Gentle leveling for natural speech' },
  { id: 'voiceover', label: '4:1 Voiceover', value: 4, desc: 'Standard professional spoken voiceover' },
  { id: 'punchy', label: '8:1 Punchy', value: 8, desc: 'Tight dynamic range for noisy headphones' },
  { id: 'broadcast', label: '12:1 Broadcast', value: 12, desc: 'Heavy leveling preventing any digital clipping' },
];

export const COMPRESSOR_ATTACK_PRESETS = [
  { id: 'fast', label: 'Fast (3ms)', value: 0.003, desc: 'Catches transients immediately' },
  { id: 'balanced', label: 'Balanced (15ms)', value: 0.015, desc: 'Preserves vocal punch and articulation' },
  { id: 'smooth', label: 'Smooth (40ms)', value: 0.040, desc: 'Transparent musical leveling' },
];

/**
 * Global Export Templates for Instant Setup
 * Persisted and loaded across devices via Firestore
 */
export interface GlobalExportTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  format: 'mp4' | 'webm' | 'gif';
  codec: string;
  resolution: '1080p' | '720p';
  quality?: '1080p' | '720p';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  bitrateKbps: number;
  framerate: 30 | 60;
  lufsTarget: number;
  colorFilter?: string;
}

export const GLOBAL_EXPORT_TEMPLATES: GlobalExportTemplate[] = [
  {
    id: 'presentation-ready',
    name: 'Presentation Ready',
    badge: '1080p 60fps H.264',
    description: 'Crisp Full HD with balanced high bitrate and YouTube -14 LUFS loudness. Ideal for slides, screencasts, and developer courses.',
    format: 'mp4',
    codec: 'H.264 / AAC High Profile',
    resolution: '1080p',
    aspectRatio: '16:9',
    bitrateKbps: 6000,
    framerate: 60,
    lufsTarget: -14,
  },
  {
    id: 'mobile-social',
    name: 'Mobile Social',
    badge: '9:16 Vertical 30fps',
    description: 'Ultra-fast vertical mobile framing optimized for TikTok, Instagram Reels, and YouTube Shorts at low bandwidth consumption.',
    format: 'mp4',
    codec: 'H.264 Baseline',
    resolution: '720p',
    aspectRatio: '9:16',
    bitrateKbps: 3200,
    framerate: 30,
    lufsTarget: -11,
  },
  {
    id: 'raw-archive',
    name: 'Raw Archive',
    badge: 'VP9 Lossless 60fps',
    description: 'Master archive quality container with VP9 encoding and high dynamic range audio for preservation and offline backup.',
    format: 'webm',
    codec: 'VP9 Profile 2 / Opus Lossless',
    resolution: '1080p',
    aspectRatio: '16:9',
    bitrateKbps: 12000,
    framerate: 60,
    lufsTarget: -23,
  },
];

/**
 * Voiceover Synthesis Voices and Personas (for Gemini API / Web Speech)
 */
export interface VoiceoverPersona {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  accent: string;
  style: string;
  geminiVoice: string;
}

export const VOICEOVER_PERSONAS: VoiceoverPersona[] = [
  {
    id: 'puck',
    name: 'Puck (Studio Technical Host)',
    gender: 'male',
    accent: 'American Neutral',
    style: 'Articulate, confident, and engaging tech tutorial pacing',
    geminiVoice: 'Puck',
  },
  {
    id: 'charon',
    name: 'Charon (Deep Systems Architect)',
    gender: 'male',
    accent: 'Warm Baritone',
    style: 'Authoritative, calm, and didactic for complex kernel and compiler topics',
    geminiVoice: 'Charon',
  },
  {
    id: 'kore',
    name: 'Kore (Senior Developer Advocate)',
    gender: 'female',
    accent: 'Clear & Energetic',
    style: 'Friendly, crisp enunciation suitable for fast-paced UI and web development walkthroughs',
    geminiVoice: 'Kore',
  },
  {
    id: 'fenrir',
    name: 'Fenrir (Rapid Screencaster)',
    gender: 'male',
    accent: 'Fast Tech',
    style: 'Dynamic and concise for speedrun demos and quick pull-request reviews',
    geminiVoice: 'Fenrir',
  },
  {
    id: 'aoede',
    name: 'Aoede (Academic Lecturer)',
    gender: 'female',
    accent: 'Scholarly & Measured',
    style: 'Measured, precise pacing designed for educational curriculum lectures',
    geminiVoice: 'Aoede',
  },
];

/**
 * Voice command definitions for Web Speech API recognition
 */
export const VOICE_COMMAND_DEFINITIONS = [
  { command: 'start recording', action: 'TOGGLE_RECORDING', description: 'Begin capturing tutorial stream' },
  { command: 'stop recording', action: 'TOGGLE_RECORDING', description: 'Stop and finalize current capture' },
  { command: 'toggle camera', action: 'TOGGLE_CAM', description: 'Show or hide webcam PiP bubble' },
  { command: 'toggle microphone', action: 'TOGGLE_MIC', description: 'Mute or unmute mic audio track' },
  { command: 'fast export', action: 'FAST_EXPORT', description: 'Instantly render and download video' },
  { command: 'cycle filter', action: 'CYCLE_FILTER', description: 'Switch to next color grading LUT' },
  { command: 'toggle timer', action: 'TOGGLE_TIMER', description: 'Show or hide recording timer overlay' },
  { command: 'toggle draw', action: 'TOGGLE_DRAW', description: 'Toggle pen and highlighter overlay' },
  { command: 'toggle telemetry', action: 'TOGGLE_TELEMETRY', description: 'Display GPU/CPU telemetry HUD' },
  { command: 'toggle crop', action: 'TOGGLE_CROP', description: 'Toggle video cropping handles' },
  { command: 'reset studio', action: 'RESET_STUDIO', description: 'Restore defaults and clear state' },
];


