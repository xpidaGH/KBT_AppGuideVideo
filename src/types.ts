export type SupportedLanguageCode =
  | 'en' // English
  | 'fr' // French
  | 'de' // German
  | 'it' // Italian
  | 'es' // Spanish
  | 'pt' // Portuguese
  | 'id' // Indonesian
  | 'sw' // Swahili
  | 'tr' // Turkish
  | 'ru' // Russian
  | 'zh' // Chinese (Simplified)
  | 'ja' // Japanese
  | 'ar' // Arabic (RTL)
  | 'ur' // Urdu (RTL)
  | 'hi' // Hindi
  | 'vi' // Vietnamese
  | 'ko' // Korean
  | 'fa' // Farsi/Persian (RTL)
  | 'mr' // Marathi
  | 'bn' // Bangla/Bengali
  | 'ta' // Tamil
  | 'te'; // Telugu

export interface LanguageInfo {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  bcp47: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  region: string;
}

export type ArchitecturePillarId =
  | 'desktop_lowlevel'
  | 'mobile_systems'
  | 'distributed_cloud'
  | 'enterprise_analytics'
  | 'legacy_dsp';

export interface ArchitecturePillar {
  id: ArchitecturePillarId;
  title: string;
  persona: string;
  inspiration: string;
  languages: string[];
  description: string;
  iconName: string;
}

export interface CodeBlueprint {
  id: string;
  pillarId: ArchitecturePillarId;
  language: string;
  languageFamily: string;
  title: string;
  filename: string;
  description: string;
  simdOrOptimizationNote?: string;
  code: string;
  benchmarkAvailable?: boolean;
}

export interface SoftsubCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  speaker?: string;
  text: string;
  translations: Record<SupportedLanguageCode, string>;
}

export interface ScribeWorkflowStep {
  id: string;
  stepNumber: number;
  timestamp: number; // in seconds
  actionType: 'click' | 'type' | 'navigate' | 'select' | 'submit' | 'inspect';
  targetElement: string;
  coordinates: { x: number; y: number };
  title: string;
  description: string;
  codeSnippet?: string;
  screenshotUrl?: string;
  translations: Record<SupportedLanguageCode, { title: string; description: string }>;
}

export type AnnotationMode = 'softsubs' | 'ai_workflow_scribe';

export interface RecordingTelemetryEvent {
  timestamp: number;
  type: 'click' | 'hover' | 'scroll' | 'keydown' | 'resize';
  x?: number;
  y?: number;
  target?: string;
  details?: string;
}

export interface VideoExportOptions {
  format: 'webm' | 'mp4';
  resolution: '1080p' | '720p';
  framerate: 30 | 60;
  includeCaptions: boolean;
  includeAudioTrack: boolean;
  annotationMode: AnnotationMode;
  targetLanguage: SupportedLanguageCode;
}
