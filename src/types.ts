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

export type ExportFormatId = 'mp4' | 'webm' | 'gif';

export interface ExportFormatPreset {
  id: ExportFormatId;
  label: string;
  name: string;
  extension: string;
  mimeType: string;
  badge: string;
  description: string;
  recommendedFor: string;
  icon: 'mp4' | 'webm' | 'gif';
}

export interface VideoExportOptions {
  format: ExportFormatId;
  resolution: '1080p' | '720p';
  framerate: 30 | 60;
  includeCaptions: boolean;
  includeAudioTrack: boolean;
  annotationMode: AnnotationMode;
  targetLanguage: SupportedLanguageCode;
}

export type ColorFilterId =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'high-contrast'
  | 'warm-sunlight'
  | 'cyberpunk-cool'
  | 'cinematic-bleach'
  | 'invert'
  | 'vhs-glitch'
  | 'crt-scanlines';

export interface ColorFilterPreset {
  id: ColorFilterId;
  name: string;
  label: string;
  canvasFilter: string;
  cssFilter: string;
  description: string;
  badgeColor: string;
  previewGradient: string;
  rgbBalance?: { r: number; g: number; b: number; contrast?: number };
}

export type AspectRatioId = '16:9' | '9:16' | '1:1' | '4:3';

export interface AspectRatioPreset {
  id: AspectRatioId;
  label: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectClass: string;
  description: string;
}

export type CropPresetId = 'free' | '16:9' | '9:16' | '1:1' | '4:3' | '21:9' | '3:2';

export interface CropPresetDef {
  id: CropPresetId;
  label: string;
  ratio: number | null; // width / height, or null for free
  description: string;
  iconName?: string;
}

export interface CropSettings {
  isEnabled: boolean;
  isEditing: boolean;
  // Normalized 0..1 bounding box inside capture frame:
  x: number;
  y: number;
  width: number;
  height: number;
  preset: CropPresetId;
  isLocked: boolean;
  showRuleOfThirds: boolean;
}

export interface ProjectRecordingMetadata {
  projectTitle: string;
  projectDescription: string;
  recordedAt: string;
  durationSeconds: number;
  formattedDuration: string;
  language: SupportedLanguageCode;
  languageName: string;
  aspectRatio: AspectRatioId;
  resolution: {
    width: number;
    height: number;
  };
  exportFormat: ExportFormatId;
  framerate: number;
  quality: string;
  colorFilter: ColorFilterId;
  cropSettings?: {
    isEnabled: boolean;
    preset: CropPresetId;
    x: number;
    y: number;
    width: number;
    height: number;
    isLocked: boolean;
  };
  interactiveWorkflowStepsCount: number;
  subtitleCuesCount: number;
  stepsSummary?: Array<{
    stepNumber: number;
    title: string;
    actionType: string;
    targetElement: string;
    timestamp: number;
  }>;
  subtitlesSummary?: Array<{
    id: string;
    startTime: number;
    endTime: number;
    speaker?: string;
    text: string;
  }>;

  trimSettings?: {
    isTrimmed: boolean;
    trimStartSeconds: number;
    trimEndSeconds: number;
    originalDurationSeconds: number;
    trimmedDurationSeconds: number;
  };
  generator: string;
  version: string;
}

export interface SavedProjectSettings {
  projectTitle: string;
  projectDescription: string;
  selectedExportFormat: ExportFormatId;
  selectedAspectRatio: AspectRatioId;
  exportQuality: '1080p' | '720p';
  exportFramerate: 30 | 60;
  saveMetadataAlongside: boolean;
  autoExportOnStop?: boolean;
  selectedFilter?: ColorFilterId;
  cropSettings?: {
    isEnabled: boolean;
    preset: CropPresetId;
    x: number;
    y: number;
    width: number;
    height: number;
    isLocked: boolean;
    showRuleOfThirds?: boolean;
  };
  lastSavedAt?: string;
}

export type DrawingToolType = 'pen' | 'highlighter' | 'rect' | 'arrow' | 'circle' | 'text';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  tool: DrawingToolType;
  color: string;
  strokeWidth: number;
  points: DrawingPoint[];
  text?: string;
  fontSize?: number;
  hasBackground?: boolean;
  timestamp?: number;
}
export interface TelemetryDataPoint {
  timestamp: number;
  cpu: number;
  gpu: number;
  fps: number;
  memoryMb?: number;
}
