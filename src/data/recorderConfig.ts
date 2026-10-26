import {
  SupportedLanguageCode,
  ColorFilterId,
  AspectRatioId,
  AspectRatioPreset,
  ExportFormatId,
  ExportFormatPreset,
} from '../types';
export { COLOR_FILTER_PRESETS, COLOR_FILTER_MAP } from '../utils/colorFilterPipeline';

/**
 * Supported Export Video/Animation Formats (MP4, WEBM, GIF)
 */
export const EXPORT_FORMAT_PRESETS: ExportFormatPreset[] = [
  {
    id: 'mp4',
    label: 'MP4 Video',
    name: 'MPEG-4 Part 14 (H.264 / AAC)',
    extension: 'mp4',
    mimeType: 'video/mp4',
    badge: 'Universal H.264',
    description:
      'Universally supported video standard compatible across all operating systems, smartphones, YouTube, Vimeo, and LMS portals.',
    recommendedFor: 'YouTube, Canvas LMS, iOS/Android & Broad Sharing',
    icon: 'mp4',
  },
  {
    id: 'webm',
    label: 'WebM Video',
    name: 'WebM Open Video (VP8/VP9 / Opus)',
    extension: 'webm',
    mimeType: 'video/webm',
    badge: 'Native Web Stream',
    description:
      'Ultra-efficient open container with VP9 video encoding. Direct browser zero-transcode export with superior compression.',
    recommendedFor: 'Web Embedding, HTML5 Video & Chrome/Firefox',
    icon: 'webm',
  },
  {
    id: 'gif',
    label: 'Animated GIF',
    name: 'GIF89a Looping Animation',
    extension: 'gif',
    mimeType: 'image/gif',
    badge: 'Looping Graphic',
    description:
      'Compact animated image loop without audio. Zero setup needed to embed directly in GitHub README.md, PR comments, Slack, and Discord.',
    recommendedFor: 'GitHub READMEs, Pull Requests, Bug Reports & Slack',
    icon: 'gif',
  },
];

export const EXPORT_FORMAT_MAP: Record<ExportFormatId, ExportFormatPreset> = {
  mp4: EXPORT_FORMAT_PRESETS[0],
  webm: EXPORT_FORMAT_PRESETS[1],
  gif: EXPORT_FORMAT_PRESETS[2],
};

/**
 * 22 International language test phrases for audio verification
 */
export const TTS_TEST_PHRASES: Record<SupportedLanguageCode, string> = {
  en: 'Testing audio volume settings in KBT Studio.',
  fr: 'Test des paramètres de volume audio dans KBT Studio.',
  de: 'Audiolautstärke-Einstellungen werden in KBT Studio getestet.',
  es: 'Probando configuración de volumen de audio en KBT Studio.',
  it: 'Test delle impostazioni del volume audio in KBT Studio.',
  pt: 'Testando configurações de volume de áudio no KBT Studio.',
  id: 'Menguji pengaturan volume audio di KBT Studio.',
  sw: 'Kujaribu mipangilio ya sauti katika KBT Studio.',
  tr: 'KBT Studio ses seviyesi ayarları test ediliyor.',
  ru: 'Проверка настроек громкости звука в KBT Studio.',
  zh: '正在测试 KBT Studio 语音音量设置。',
  ja: 'KBT Studio の音声音量設定をテストしています。',
  ar: 'اختبار إعدادات مستوى الصوت في KBT Studio.',
  ur: 'KBT اسٹوڈیو میں آڈیو والیوم سیٹنگز کی جانچ ہو رہی ہے۔',
  hi: 'KBT स्टूडियो में ऑडियो वॉल्यूम सेटिंग्स का परीक्षण हो रहा है।',
  vi: 'Đang kiểm tra cài đặt âm lượng trong KBT Studio.',
  ko: 'KBT 스튜디오 오디오 볼륨 설정을 테스트합니다.',
  fa: 'در حال آزمایش تنظیمات صدای KBT Studio.',
  mr: 'KBT स्टुडिओमध्ये ऑडिओ आवाज सेटिंग्ज तपासत आहे.',
  bn: 'KBT স্টুডিওতে অডিও ভলিউম সেটিংস পরীক্ষা করা হচ্ছে।',
  ta: 'KBT Studio-வில் ஒலி அமைப்புகளை சோதிக்கிறது.',
  te: 'KBT Studio లో ఆడియో వాల్యూమ్ సెట్టింగ్‌లను పరీక్షిస్తోంది.',
};

/**
 * Aspect Ratio Presets for Target Video Export Platforms (YouTube, TikTok, Instagram, Slides)
 */
export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  {
    id: '16:9',
    label: '16:9 Landscape',
    name: 'Widescreen (1920×1080)',
    platform: 'YouTube & Desktop',
    width: 1920,
    height: 1080,
    aspectClass: 'aspect-video w-full',
    description: 'Standard widescreen format ideal for desktop monitors, YouTube tutorials, and course lectures.',
  },
  {
    id: '9:16',
    label: '9:16 Portrait',
    name: 'Vertical (1080×1920)',
    platform: 'TikTok, Reels & Shorts',
    width: 1080,
    height: 1920,
    aspectClass: 'aspect-[9/16] max-w-sm sm:max-w-md mx-auto',
    description: 'Vertical mobile format optimized for TikTok, Instagram Reels, and YouTube Shorts.',
  },
  {
    id: '1:1',
    label: '1:1 Square',
    name: 'Square (1080×1080)',
    platform: 'Instagram Feed & LinkedIn',
    width: 1080,
    height: 1080,
    aspectClass: 'aspect-square max-w-lg mx-auto',
    description: 'Square aspect ratio for social media feeds, Twitter/X cards, and LinkedIn posts.',
  },
  {
    id: '4:3',
    label: '4:3 Standard',
    name: 'Presentation (1440×1080)',
    platform: 'Slides, iPads & Classrooms',
    width: 1440,
    height: 1080,
    aspectClass: 'aspect-[4/3] max-w-2xl mx-auto',
    description: 'Classic slide presentation aspect ratio for academic lectures, tablet displays, and PDF embeds.',
  },
];

export const ASPECT_RATIO_MAP: Record<AspectRatioId, AspectRatioPreset> = {
  '16:9': ASPECT_RATIO_PRESETS[0],
  '9:16': ASPECT_RATIO_PRESETS[1],
  '1:1': ASPECT_RATIO_PRESETS[2],
  '4:3': ASPECT_RATIO_PRESETS[3],
};

/**
 * Default configurations for studio recording and compositor canvas
 */
export const STUDIO_PROJECT_SETTINGS_STORAGE_KEY = 'kbt_video_studio_project_settings_v1';

export const DEFAULT_STUDIO_CONFIG = {
  canvasWidth: 1920,
  canvasHeight: 1080,
  defaultProjectTitle: 'Full-Stack Architecture & Telemetry Tutorial',
  defaultProjectDescription: 'Interactive walkthrough covering distributed microservices, low-level kernel optimizations, and multi-language softsubs.',
  defaultAspectRatio: '16:9' as AspectRatioId,
  defaultExportFormat: 'mp4' as ExportFormatId,
  defaultTtsVolume: 1.0,
  defaultQuality: '1080p' as const,
  defaultFramerate: 60 as const,
  defaultShowTimerOverlay: true,
  defaultFilter: 'none' as ColorFilterId,
  defaultCameraWidth: 320,
  defaultCameraHeight: 240,
};



/**
 * Real-time timer overlay dimensions and visual layout configuration on canvas
 */
export const TIMER_OVERLAY_STYLE = {
  x: 24,
  y: 24,
  width: 250,
  height: 42,
  borderRadius: 10,
  backdropFill: 'rgba(9, 9, 11, 0.92)',
  activeStroke: 'rgba(239, 68, 68, 0.85)',
  pausedStroke: 'rgba(245, 158, 11, 0.85)',
  idleStroke: 'rgba(99, 102, 241, 0.55)',
  recDotColor: '#ef4444',
  pauseDotColor: '#f59e0b',
  idleDotColor: '#10b981',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '13px',
  fontWeight: '700',
};


/**
 * Video container quality choices
 */
export const VIDEO_QUALITY_OPTIONS = [
  { label: '1080p Full HD', value: '1080p', width: 1920, height: 1080 },
  { label: '720p HD', value: '720p', width: 1280, height: 720 },
] as const;

/**
 * Frame rate options
 */
export const FRAMERATE_OPTIONS = [
  { label: '60 FPS', value: 60 },
  { label: '30 FPS', value: 30 },
] as const;

/**
 * Global Keyboard Shortcut Definitions
 */
export interface KeyboardShortcutDef {
  key: string;
  code: string;
  displayKey: string;
  description: string;
  action:
    | 'TOGGLE_RECORDING'
    | 'TOGGLE_TIMER'
    | 'TOGGLE_CAM'
    | 'TOGGLE_MIC'
    | 'PREVIEW_TTS'
    | 'CYCLE_FILTER'
    | 'TOGGLE_DRAW';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcutDef[] = [
  {
    key: ' ',
    code: 'Space',
    displayKey: 'Space',
    description: 'Start / Stop Recording',
    action: 'TOGGLE_RECORDING',
  },
  {
    key: 'd',
    code: 'KeyD',
    displayKey: 'D',
    description: 'Toggle Draw & Highlight Overlay',
    action: 'TOGGLE_DRAW',
  },
  {
    key: 'f',
    code: 'KeyF',
    displayKey: 'F',
    description: 'Cycle Video Filter / LUT',
    action: 'CYCLE_FILTER',
  },
  {
    key: 't',
    code: 'KeyT',
    displayKey: 'T',
    description: 'Toggle Timer Overlay',
    action: 'TOGGLE_TIMER',
  },
  {
    key: 'c',
    code: 'KeyC',
    displayKey: 'C',
    description: 'Toggle Camera Bubble',
    action: 'TOGGLE_CAM',
  },
  {
    key: 'm',
    code: 'KeyM',
    displayKey: 'M',
    description: 'Toggle Mic Track',
    action: 'TOGGLE_MIC',
  },
  {
    key: 'p',
    code: 'KeyP',
    displayKey: 'P',
    description: 'Preview TTS Voice',
    action: 'PREVIEW_TTS',
  },
];

export const DRAWING_COLOR_PRESETS = [
  { name: 'Neon Yellow', value: '#facc15', bgClass: 'bg-yellow-400' },
  { name: 'Electric Cyan', value: '#38bdf8', bgClass: 'bg-sky-400' },
  { name: 'Hot Coral', value: '#f43f5e', bgClass: 'bg-rose-500' },
  { name: 'Emerald', value: '#34d399', bgClass: 'bg-emerald-400' },
  { name: 'Bright Violet', value: '#c084fc', bgClass: 'bg-purple-400' },
  { name: 'Pure White', value: '#ffffff', bgClass: 'bg-white' },
];

