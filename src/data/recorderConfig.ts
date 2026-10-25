import { SupportedLanguageCode, ColorFilterId } from '../types';
export { COLOR_FILTER_PRESETS, COLOR_FILTER_MAP } from '../utils/colorFilterPipeline';

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
 * Default configurations for studio recording and compositor canvas
 */
export const DEFAULT_STUDIO_CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 720,
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
  width: 200,
  height: 38,
  borderRadius: 8,
  backdropFill: 'rgba(9, 9, 11, 0.88)',
  activeStroke: 'rgba(239, 68, 68, 0.75)',
  pausedStroke: 'rgba(245, 158, 11, 0.75)',
  idleStroke: 'rgba(99, 102, 241, 0.45)',
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
    | 'CYCLE_FILTER';
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
