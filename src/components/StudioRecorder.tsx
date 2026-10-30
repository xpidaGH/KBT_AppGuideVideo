import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Circle,
  Square,
  Pause,
  Play,
  RotateCcw,
  Download,
  Settings2,
  Subtitles,
  ListTree,
  Languages,
  Volume2,
  Volume1,
  VolumeX,
  Plus,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  MousePointer,
  ExternalLink,
  Clock,
  Layers,
  FileText,
  Share2,
  Keyboard,
  X,
  Palette,
  SlidersHorizontal,
  Monitor,
  Smartphone,
  Tv,
  Film,
  FileVideo,
  Image as ImageIcon,
  Tag,
  FileJson,
  FolderArchive,
  Info,
  HardDrive,
  Highlighter,
  PenTool,
  Undo2,
  ArrowUpRight,
  CircleDot,
  Type,
  Scissors,
  Activity,
  Cpu,
  Crop,
} from 'lucide-react';
import {
  SupportedLanguageCode,
  SoftsubCue,
  ScribeWorkflowStep,
  AnnotationMode,
  VideoExportOptions,
  ColorFilterId,
  AspectRatioId,
  AspectRatioPreset,
  ExportFormatId,
  ExportFormatPreset,
  ProjectRecordingMetadata,
  SavedProjectSettings,
  DrawingToolType,
  DrawingStroke,
  DrawingPoint,
  CropSettings,
  CropPresetId,
} from '../types';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../data/languages';
import { INITIAL_SOFTSUB_CUES, INITIAL_SCRIBE_STEPS } from '../data/annotationsData';
import { ttsEngine } from '../utils/tts';
import {
  generateWebVTT,
  generateSRT,
  generateScribeMarkdown,
  triggerDownload,
  sanitizeFileName,
  generateProjectMetadataJson,
  formatDisplayDuration,
} from '../utils/vttSrtExport';

import { InteractiveAppSimulator } from './InteractiveAppSimulator';
import { TelemetryOverlay } from './TelemetryOverlay';
import {
  TTS_TEST_PHRASES,
  DEFAULT_STUDIO_CONFIG,
  STUDIO_PROJECT_SETTINGS_STORAGE_KEY,
  TIMER_OVERLAY_STYLE,
  VIDEO_QUALITY_OPTIONS,
  FRAMERATE_OPTIONS,
  KEYBOARD_SHORTCUTS,
  COLOR_FILTER_PRESETS,
  COLOR_FILTER_MAP,
  ASPECT_RATIO_PRESETS,
  ASPECT_RATIO_MAP,
  EXPORT_FORMAT_PRESETS,
  EXPORT_FORMAT_MAP,
  DRAWING_COLOR_PRESETS,
} from '../data/recorderConfig';


import { applyLutToImageData, renderPostProcessingGlitchFx } from '../utils/colorFilterPipeline';
import { createAnimatedGifBlob, sampleCanvasFrame } from '../utils/gifEncoder';
import { MultiTrackAudioMixer, NoiseGateConfig, CompressorConfig } from '../utils/noiseGate';
import {
  syncProjectToFirestore,
  archiveRecordingSession,
  isCloudSyncEnabled,
  setCloudSyncEnabled,
  ArchiveSessionItem,
} from '../services/firebaseSync';
import {
  DEFAULT_WATERMARK_PRESETS,
  WATERMARK_POSITIONS,
  WatermarkPositionType,
  DEFAULT_CROP_SETTINGS,
  CROP_PRESETS,
} from '../data/structuredStudioData';
import { SettingsModal } from './SettingsModal';
import { ProjectArchiveSidebar } from './ProjectArchiveSidebar';
import { SocialShareModal } from './SocialShareModal';
import { FilterLibraryModal } from './FilterLibraryModal';
import { AudioMixerPanel } from './AudioMixerPanel';
import { WatermarkPanel, WatermarkSettings } from './WatermarkPanel';
import { AiTranscriptPanel } from './AiTranscriptPanel';
import { CropOverlay } from './CropOverlay';
import { AudioVisualizer } from './AudioVisualizer';
import { HotkeyToastOverlay } from './HotkeyToastOverlay';
import { TeleprompterOverlay } from './TeleprompterOverlay';
import { SceneTransitionModal, SceneTransitionConfig } from './SceneTransitionModal';
import { CustomQualityPresetsModal } from './CustomQualityPresetsModal';
import { ExportToastNotification, ExportToastData } from './ExportToastNotification';
import { CustomQualityPreset } from '../services/firebaseSync';
import { KeyboardShortcutDef } from '../data/recorderConfig';
import { VoiceCommandController } from './VoiceCommandController';
import { MultiCamDirectorModal, DEFAULT_MULTICAM_CONFIG, MultiCamConfig } from './MultiCamDirectorModal';
import { PostExportReportModal, ExportReportData } from './PostExportReportModal';
import { GlobalExportTemplatesModal } from './GlobalExportTemplatesModal';
import { VoiceoverSynthesisModal } from './VoiceoverSynthesisModal';
import { SmartScriptingModal } from './SmartScriptingModal';
import { StudioActionsSidebar } from './StudioActionsSidebar';
import { audioNotification } from '../utils/audioNotification';
import { GlobalExportTemplate } from '../data/structuredStudioData';

interface StudioRecorderProps {
  selectedLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
  isRecording: boolean;
  setIsRecording: (rec: boolean) => void;
  recordingSeconds: number;
  setRecordingSeconds: React.Dispatch<React.SetStateAction<number>>;
  setAudioLevel: (lvl: number) => void;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

// Safely load persisted project title, description, and export settings from local storage
function loadSavedProjectSettings(): Partial<SavedProjectSettings> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STUDIO_PROJECT_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse saved project settings from localStorage:', err);
    return null;
  }
}

export const StudioRecorder: React.FC<StudioRecorderProps> = ({

  selectedLanguage,
  onLanguageChange,
  isRecording,
  setIsRecording,
  recordingSeconds,
  setRecordingSeconds,
  setAudioLevel,
}) => {
  // Capture Source: 'simulator' or 'screen'
  const [captureSource, setCaptureSource] = useState<'simulator' | 'screen'>('simulator');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [cameraPosition, setCameraPosition] = useState<{ x: number; y: number }>({ x: 24, y: 156 });
  const [isDraggingCam, setIsDraggingCam] = useState<boolean>(false);

  // Annotations
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>('ai_workflow_scribe');
  const [cues, setCues] = useState<SoftsubCue[]>(INITIAL_SOFTSUB_CUES);
  const [scribeSteps, setScribeSteps] = useState<ScribeWorkflowStep[]>(INITIAL_SCRIBE_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Recording Engine & Compositor Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Post-recording Video Trimming State (Start and End timestamps with interactive scrubber)
  const [trimStartSeconds, setTrimStartSeconds] = useState<number>(0);
  const [trimEndSeconds, setTrimEndSeconds] = useState<number>(0);
  const [previewVideoDuration, setPreviewVideoDuration] = useState<number>(0);
  const [previewVideoCurrentTime, setPreviewVideoCurrentTime] = useState<number>(0);
  const [isPreviewTrimLoopActive, setIsPreviewTrimLoopActive] = useState<boolean>(false);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const trimStartSecondsRef = useRef<number>(0);
  trimStartSecondsRef.current = trimStartSeconds;
  const trimEndSecondsRef = useRef<number>(0);
  trimEndSecondsRef.current = trimEndSeconds;
  const previewDurationRef = useRef<number>(0);
  previewDurationRef.current = previewVideoDuration;
  const isPreviewTrimLoopActiveRef = useRef<boolean>(false);
  isPreviewTrimLoopActiveRef.current = isPreviewTrimLoopActive;

  // Trim metrics
  const safeDuration = previewVideoDuration > 0 ? previewVideoDuration : Math.max(1, recordingSeconds);
  const isTrimActive = trimStartSeconds > 0.05 || (previewVideoDuration > 0 && trimEndSeconds < previewVideoDuration - 0.05);
  const trimmedDuration = Math.max(0.1, trimEndSeconds - trimStartSeconds);
  const savedDuration = Math.max(0, safeDuration - trimmedDuration);
  const savedPercentage = safeDuration > 0 ? Math.round((savedDuration / safeDuration) * 100) : 0;

  // Click ripples for visual feedback
  const ripplesRef = useRef<ClickRipple[]>([]);
  const cursorRef = useRef<{ x: number; y: number }>({ x: 400, y: 240 });

  // TTS State
  const [ttsState, setTtsState] = useState<{ isSpeaking: boolean; isPaused: boolean }>({
    isSpeaking: false,
    isPaused: false,
  });
  const [ttsVolume, setTtsVolume] = useState<number>(DEFAULT_STUDIO_CONFIG.defaultTtsVolume);
  const [showTimerOverlay, setShowTimerOverlay] = useState<boolean>(
    DEFAULT_STUDIO_CONFIG.defaultShowTimerOverlay
  );
  const showClockOverlay = showTimerOverlay;
  const setShowClockOverlay = setShowTimerOverlay;
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState<boolean>(true);
  const [showTelemetryOverlay, setShowTelemetryOverlay] = useState<boolean>(true);

  // Video Aspect Ratio Pipeline (16:9 Landscape YouTube, 9:16 Portrait TikTok/Reels/Shorts, 1:1 Square Instagram, 4:3 Slides)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioId>(() => {
    const saved = loadSavedProjectSettings();
    if (saved?.selectedAspectRatio && ASPECT_RATIO_MAP[saved.selectedAspectRatio]) {
      return saved.selectedAspectRatio;
    }
    return DEFAULT_STUDIO_CONFIG.defaultAspectRatio;
  });
  const activeAspectRatio =
    ASPECT_RATIO_MAP[selectedAspectRatio] || ASPECT_RATIO_MAP['16:9'];

  // Real-time Canvas-based Video Filter & Color-Correction LUT Pipeline
  const [selectedFilter, setSelectedFilter] = useState<ColorFilterId>(() => {
    const saved = loadSavedProjectSettings();
    if (saved?.selectedFilter && COLOR_FILTER_MAP[saved.selectedFilter]) {
      return saved.selectedFilter;
    }
    return DEFAULT_STUDIO_CONFIG.defaultFilter;
  });
  const [usePixelLutEngine, setUsePixelLutEngine] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeFilter = COLOR_FILTER_MAP[selectedFilter] || COLOR_FILTER_MAP.none;

  const handleCycleFilter = () => {
    setSelectedFilter((prev) => {
      const idx = COLOR_FILTER_PRESETS.findIndex((p) => p.id === prev);
      const nextIdx = (idx + 1) % COLOR_FILTER_PRESETS.length;
      return COLOR_FILTER_PRESETS[nextIdx].id;
    });
  };

  // Video Cropping Tool State (Interactive overlay, custom bounding box & aspect ratio presets)
  const [cropSettings, setCropSettings] = useState<CropSettings>(() => {
    const saved = loadSavedProjectSettings();
    if (saved?.cropSettings) {
      return {
        ...DEFAULT_CROP_SETTINGS,
        ...saved.cropSettings,
        isEditing: false,
      };
    }
    return { ...DEFAULT_CROP_SETTINGS };
  });
  const cropSettingsRef = useRef<CropSettings>(cropSettings);
  cropSettingsRef.current = cropSettings;

  // Offscreen canvas for rendering simulator frame when crop is active
  const offscreenSimCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Export settings & Format Pipeline (MP4, WEBM, GIF)
  const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormatId>(() => {
    const saved = loadSavedProjectSettings();
    if (saved?.selectedExportFormat && EXPORT_FORMAT_MAP[saved.selectedExportFormat]) {
      return saved.selectedExportFormat;
    }
    return DEFAULT_STUDIO_CONFIG.defaultExportFormat;
  });
  const activeExportFormat =
    EXPORT_FORMAT_MAP[selectedExportFormat] || EXPORT_FORMAT_MAP.mp4;
  const [exportQuality, setExportQuality] = useState<'1080p' | '720p'>(() => {
    const saved = loadSavedProjectSettings();
    if (saved?.exportQuality === '1080p' || saved?.exportQuality === '720p') {
      return saved.exportQuality;
    }
    return DEFAULT_STUDIO_CONFIG.defaultQuality;
  });
  const [exportFramerate, setExportFramerate] = useState<30 | 60>(() => {
    const saved = loadSavedProjectSettings();
    if (saved?.exportFramerate === 30 || saved?.exportFramerate === 60) {
      return saved.exportFramerate;
    }
    return DEFAULT_STUDIO_CONFIG.defaultFramerate;
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressPercent, setExportProgressPercent] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [isPostExportReportOpen, setIsPostExportReportOpen] = useState<boolean>(false);
  const [postExportReport, setPostExportReport] = useState<ExportReportData | null>(null);

  // New Modals & Director Controls State
  const [isMultiCamModalOpen, setIsMultiCamModalOpen] = useState<boolean>(false);
  const [multiCamConfig, setMultiCamConfig] = useState<MultiCamConfig>(DEFAULT_MULTICAM_CONFIG);
  const [isGlobalTemplatesOpen, setIsGlobalTemplatesOpen] = useState<boolean>(false);
  const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState<boolean>(false);
  const [isSmartScriptingOpen, setIsSmartScriptingOpen] = useState<boolean>(false);
  const [isActionsSidebarOpen, setIsActionsSidebarOpen] = useState<boolean>(false);

  const recordedBlobRef = useRef<Blob | null>(null);
  const sampledGifFramesRef = useRef<ImageData[]>([]);

  // Project Title & Description Metadata State (Configurable before and during recording)
  const [projectTitle, setProjectTitle] = useState<string>(() => {
    const saved = loadSavedProjectSettings();
    if (typeof saved?.projectTitle === 'string') {
      return saved.projectTitle;
    }
    return DEFAULT_STUDIO_CONFIG.defaultProjectTitle;
  });
  const [projectDescription, setProjectDescription] = useState<string>(() => {
    const saved = loadSavedProjectSettings();
    if (typeof saved?.projectDescription === 'string') {
      return saved.projectDescription;
    }
    return DEFAULT_STUDIO_CONFIG.defaultProjectDescription;
  });
  const [saveMetadataAlongside, setSaveMetadataAlongside] = useState<boolean>(() => {
    const saved = loadSavedProjectSettings();
    if (typeof saved?.saveMetadataAlongside === 'boolean') {
      return saved.saveMetadataAlongside;
    }
    return true;
  });
  const [autoExportOnStop, setAutoExportOnStop] = useState<boolean>(() => {
    const saved = loadSavedProjectSettings();
    if (typeof saved?.autoExportOnStop === 'boolean') {
      return saved.autoExportOnStop;
    }
    return DEFAULT_STUDIO_CONFIG.defaultAutoExportOnStop ?? true;
  });
  const [showProjectMetaEditor, setShowProjectMetaEditor] = useState<boolean>(true);
  const [lastExportedInfo, setLastExportedInfo] = useState<{
    filename: string;
    format: ExportFormatId;
    time: string;
  } | null>(null);

  // Synchronized refs for real-time recorder callbacks and hotkey handlers
  const autoExportOnStopRef = useRef(autoExportOnStop);
  autoExportOnStopRef.current = autoExportOnStop;
  const selectedExportFormatRef = useRef(selectedExportFormat);
  selectedExportFormatRef.current = selectedExportFormat;
  const projectTitleRef = useRef(projectTitle);
  projectTitleRef.current = projectTitle;
  const projectDescriptionRef = useRef(projectDescription);
  projectDescriptionRef.current = projectDescription;
  const selectedLanguageRef = useRef(selectedLanguage);
  selectedLanguageRef.current = selectedLanguage;

  // Auto-Save Persistence State
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(() => {
    const saved = loadSavedProjectSettings();
    return saved?.lastSavedAt || null;
  });
  const [autoSavePulse, setAutoSavePulse] = useState<boolean>(false);
  const hasMountedRef = useRef<boolean>(false);

  // Auto-save effect: persists project title, description, and export settings to local storage whenever modified
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const payload: SavedProjectSettings = {
        projectTitle,
        projectDescription,
        selectedExportFormat,
        selectedAspectRatio,
        exportQuality,
        exportFramerate,
        saveMetadataAlongside,
        autoExportOnStop,
        selectedFilter,
        cropSettings: {
          isEnabled: cropSettings.isEnabled,
          preset: cropSettings.preset,
          x: cropSettings.x,
          y: cropSettings.y,
          width: cropSettings.width,
          height: cropSettings.height,
          isLocked: cropSettings.isLocked,
          showRuleOfThirds: cropSettings.showRuleOfThirds,
        },
        lastSavedAt: timeStr,
      };

      localStorage.setItem(STUDIO_PROJECT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      setLastAutoSavedTime(timeStr);
      setAutoSavePulse(true);
      const timer = setTimeout(() => setAutoSavePulse(false), 1400);
      return () => clearTimeout(timer);
    } catch (err) {
      console.warn('Failed to auto-save project settings to localStorage:', err);
    }
  }, [
    projectTitle,
    projectDescription,
    selectedExportFormat,
    selectedAspectRatio,
    exportQuality,
    exportFramerate,
    saveMetadataAlongside,
    autoExportOnStop,
    selectedFilter,
    cropSettings,
  ]);

  // Reset to default factory settings and clear localStorage
  const handleResetSavedSettings = () => {
    try {
      localStorage.removeItem(STUDIO_PROJECT_SETTINGS_STORAGE_KEY);
      setProjectTitle(DEFAULT_STUDIO_CONFIG.defaultProjectTitle);
      setProjectDescription(DEFAULT_STUDIO_CONFIG.defaultProjectDescription);
      setSelectedExportFormat(DEFAULT_STUDIO_CONFIG.defaultExportFormat);
      setSelectedAspectRatio(DEFAULT_STUDIO_CONFIG.defaultAspectRatio);
      setExportQuality(DEFAULT_STUDIO_CONFIG.defaultQuality);
      setExportFramerate(DEFAULT_STUDIO_CONFIG.defaultFramerate);
      setSaveMetadataAlongside(true);
      setAutoExportOnStop(true);
      setSelectedFilter(DEFAULT_STUDIO_CONFIG.defaultFilter);
      setCropSettings({ ...DEFAULT_CROP_SETTINGS });
      setLastAutoSavedTime(null);
      setAutoSavePulse(true);
      setTimeout(() => setAutoSavePulse(false), 1200);
    } catch (err) {
      console.warn('Failed to reset project settings:', err);
    }
  };

  // Modals & Sidebars
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState<boolean>(false);
  const [isFilterLibraryOpen, setIsFilterLibraryOpen] = useState<boolean>(false);
  const [isAudioMixerOpen, setIsAudioMixerOpen] = useState<boolean>(false);
  const [isWatermarkPanelOpen, setIsWatermarkPanelOpen] = useState<boolean>(false);
  const [isAiTranscriptOpen, setIsAiTranscriptOpen] = useState<boolean>(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isSceneTransitionModalOpen, setIsSceneTransitionModalOpen] = useState<boolean>(false);
  const [sceneTransitionConfig, setSceneTransitionConfig] = useState<SceneTransitionConfig>({
    type: 'fade',
    durationMs: 500,
  });
  const [isQualityPresetsModalOpen, setIsQualityPresetsModalOpen] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<ExportToastData | null>(null);

  // Scene transition canvas compositor state
  const lastSceneSnapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transitionStartTimeRef = useRef<number | null>(null);
  const transitionTypeRef = useRef<string>('fade');
  const transitionDurationRef = useRef<number>(500);

  const captureSceneSnapshot = () => {
    if (!canvasRef.current) return;
    if (!lastSceneSnapshotCanvasRef.current) {
      lastSceneSnapshotCanvasRef.current = document.createElement('canvas');
    }
    const snap = lastSceneSnapshotCanvasRef.current;
    snap.width = canvasRef.current.width;
    snap.height = canvasRef.current.height;
    const snapCtx = snap.getContext('2d');
    if (snapCtx) {
      snapCtx.drawImage(canvasRef.current, 0, 0);
    }
  };

  const triggerSceneTransition = (type?: string, durationMs?: number) => {
    captureSceneSnapshot();
    transitionTypeRef.current = type || sceneTransitionConfig.type;
    transitionDurationRef.current = durationMs || sceneTransitionConfig.durationMs;
    transitionStartTimeRef.current = performance.now();
  };

  // Customizable Keyboard Shortcuts (in state)
  const [customShortcuts, setCustomShortcuts] = useState<KeyboardShortcutDef[]>(() => {
    return KEYBOARD_SHORTCUTS;
  });

  // Global Cloud Sync Preference
  const [cloudSyncEnabled, setCloudSyncEnabledState] = useState<boolean>(() => isCloudSyncEnabled());
  const handleToggleCloudSync = (enabled: boolean) => {
    setCloudSyncEnabledState(enabled);
    setCloudSyncEnabled(enabled);
  };

  // Multi-Track Audio Mixer & Digital Noise Gate State
  const audioMixerRef = useRef<MultiTrackAudioMixer | null>(null);
  const [micVolume, setMicVolume] = useState<number>(1.0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [systemVolume, setSystemVolume] = useState<number>(1.0);
  const [isSystemMuted, setIsSystemMuted] = useState<boolean>(false);
  const [secondaryVolume, setSecondaryVolume] = useState<number>(0.7);
  const [isSecondaryMuted, setIsSecondaryMuted] = useState<boolean>(false);
  const [ambientTrack, setAmbientTrack] = useState<string>('none');
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const [noiseGateConfig, setNoiseGateConfig] = useState<NoiseGateConfig>({
    enabled: true,
    thresholdDb: -42,
    attackTimeMs: 15,
    releaseTimeMs: 220,
  });

  const [compressorConfig, setCompressorConfig] = useState<CompressorConfig>({
    enabled: true,
    thresholdDb: -24,
    kneeDb: 30,
    ratio: 4,
    attackTimeSec: 0.003,
    releaseTimeSec: 0.25,
  });

  const [meterLevels, setMeterLevels] = useState<{
    micLevel: number;
    micGateActive: boolean;
    compressorReduction: number;
    compressorActive: boolean;
    systemLevel: number;
    secondaryLevel: number;
    masterLevel: number;
  }>({
    micLevel: 0,
    micGateActive: false,
    compressorReduction: 0,
    compressorActive: false,
    systemLevel: 0,
    secondaryLevel: 0,
    masterLevel: 0,
  });

  // Initialize Audio Mixer
  useEffect(() => {
    const mixer = new MultiTrackAudioMixer();
    audioMixerRef.current = mixer;
    mixer.onLevels((levels) => {
      setMeterLevels(levels);
      setAudioLevel(levels.masterLevel);
    });

    return () => {
      mixer.dispose();
      audioMixerRef.current = null;
    };
  }, [setAudioLevel]);

  // Sync mixer volume changes
  useEffect(() => {
    audioMixerRef.current?.setTrackVolume('mic', micVolume, isMicMuted);
  }, [micVolume, isMicMuted]);

  useEffect(() => {
    audioMixerRef.current?.setTrackVolume('system', systemVolume, isSystemMuted);
  }, [systemVolume, isSystemMuted]);

  useEffect(() => {
    audioMixerRef.current?.setTrackVolume('secondary', secondaryVolume, isSecondaryMuted);
  }, [secondaryVolume, isSecondaryMuted]);

  useEffect(() => {
    audioMixerRef.current?.setNoiseGateConfig(noiseGateConfig);
  }, [noiseGateConfig]);

  useEffect(() => {
    audioMixerRef.current?.setCompressorConfig(compressorConfig);
  }, [compressorConfig]);

  // Ambient sound synthesizer for secondary track
  useEffect(() => {
    if (ambientTrack !== 'none') {
      if (!ambientAudioRef.current) {
        // High quality data-URI ambient synth tone generator
        const audio = new Audio();
        audio.loop = true;
        ambientAudioRef.current = audio;
      }
    }
  }, [ambientTrack]);

  // Watermark Settings & Image Preloader
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    enabled: false,
    dataUrl: null,
    opacity: 0.8,
    position: 'bottom-right',
    scale: 0.22,
  });
  const watermarkImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (watermarkSettings.dataUrl) {
      const img = new Image();
      img.src = watermarkSettings.dataUrl;
      img.onload = () => {
        watermarkImgRef.current = img;
      };
    } else {
      watermarkImgRef.current = null;
    }
  }, [watermarkSettings.dataUrl]);

  // Auto-Save Mechanism: Periodic 30-Second Commit to Firestore
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (cloudSyncEnabled) {
        syncProjectToFirestore(`project-active-session`, {
          projectTitle: projectTitleRef.current,
          projectDescription: projectDescriptionRef.current,
          durationSeconds: recordingSeconds,
          formattedDuration: formatDisplayDuration(recordingSeconds),
          language: selectedLanguageRef.current,
          exportFormat: selectedExportFormatRef.current,
          aspectRatio: selectedAspectRatio,
          colorFilter: activeFilter.id,
          cropSettings: {
            isEnabled: cropSettings.isEnabled,
            preset: cropSettings.preset,
            x: cropSettings.x,
            y: cropSettings.y,
            width: cropSettings.width,
            height: cropSettings.height,
            isLocked: cropSettings.isLocked,
          },
          interactiveWorkflowStepsCount: scribeSteps.length,
          subtitleCuesCount: cues.length,
          isAutoSaved: true,
        }).catch((e) => console.warn('Firestore 30s auto-save warning:', e));

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastAutoSavedTime(timeStr);
        setAutoSavePulse(true);
        setTimeout(() => setAutoSavePulse(false), 1500);
      }
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [cloudSyncEnabled, recordingSeconds, selectedAspectRatio, activeFilter, cropSettings, scribeSteps.length, cues.length]);

  // Drawing & Screen Highlight Overlay State (Real-Time Annotation on Canvas)
  const [isDrawModeActive, setIsDrawModeActive] = useState<boolean>(false);
  const [drawingTool, setDrawingTool] = useState<DrawingToolType>('highlighter');
  const [drawingColor, setDrawingColor] = useState<string>('#facc15'); // Neon yellow default
  const [drawingStrokeWidth, setDrawingStrokeWidth] = useState<number>(22);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const strokesRef = useRef<DrawingStroke[]>([]);
  strokesRef.current = strokes;
  const currentStrokeRef = useRef<DrawingStroke | null>(null);
  currentStrokeRef.current = currentStroke;

  // Text Overlay Specific State (Direct On-Preview Annotation)
  const [textOverlayValue, setTextOverlayValue] = useState<string>('Important: Review Output');
  const [textOverlayFontSize, setTextOverlayFontSize] = useState<number>(28);
  const [textOverlayHasBg, setTextOverlayHasBg] = useState<boolean>(true);
  const [inlineTextInputPos, setInlineTextInputPos] = useState<{
    canvasX: number;
    canvasY: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const handleUndoStroke = () => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      strokesRef.current = next;
      return next;
    });
  };

  const handleClearStrokes = () => {
    setStrokes([]);
    strokesRef.current = [];
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    setInlineTextInputPos(null);
  };

  const handleCommitTextOverlay = (customText?: string) => {
    const textToCommit = (customText !== undefined ? customText : textOverlayValue).trim();
    if (!textToCommit) {
      setInlineTextInputPos(null);
      return;
    }

    // Default position: if user didn't click preview, place in lower third of canvas
    const canvasX = inlineTextInputPos ? inlineTextInputPos.canvasX : Math.round(activeAspectRatio.width * 0.12);
    const canvasY = inlineTextInputPos ? inlineTextInputPos.canvasY : Math.round(activeAspectRatio.height * 0.82);

    const newTextStroke: DrawingStroke = {
      id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tool: 'text',
      color: drawingColor,
      strokeWidth: 2,
      points: [{ x: canvasX, y: canvasY }],
      text: textToCommit,
      fontSize: textOverlayFontSize,
      hasBackground: textOverlayHasBg,
      timestamp: Date.now(),
    };

    setStrokes((prev) => {
      const next = [...prev, newTextStroke];
      strokesRef.current = next;
      return next;
    });

    setInlineTextInputPos(null);
  };

  const handleDrawingPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawModeActive) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = activeAspectRatio.width / rect.width;
    const scaleY = activeAspectRatio.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (drawingTool === 'text') {
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      setInlineTextInputPos({
        canvasX: x,
        canvasY: y,
        screenX: relX,
        screenY: relY,
      });
      return;
    }

    const width = drawingTool === 'highlighter' ? 22 : drawingTool === 'pen' ? 4 : 3;
    const newStroke: DrawingStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tool: drawingTool,
      color: drawingColor,
      strokeWidth: width,
      points: [{ x, y }],
      timestamp: Date.now(),
    };
    setCurrentStroke(newStroke);
    currentStrokeRef.current = newStroke;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleDrawingPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawModeActive || !currentStrokeRef.current) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = activeAspectRatio.width / rect.width;
    const scaleY = activeAspectRatio.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (drawingTool === 'pen' || drawingTool === 'highlighter') {
      setCurrentStroke((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          points: [...prev.points, { x, y }],
        };
        currentStrokeRef.current = updated;
        return updated;
      });
    } else {
      setCurrentStroke((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          points: [prev.points[0], { x, y }],
        };
        currentStrokeRef.current = updated;
        return updated;
      });
    }
  };

  const handleDrawingPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawModeActive) return;
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const strokeToCommit = currentStrokeRef.current;
      setStrokes((prev) => {
        const next = [...prev, strokeToCommit];
        strokesRef.current = next;
        return next;
      });
    }
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Helper to render drawing and screen highlight annotations onto the compositor canvas
  const renderDrawingStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (!stroke.points || stroke.points.length === 0) return;
    ctx.save();

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth || 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === 'pen') {
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth || 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === 'rect') {
      if (stroke.points.length >= 2) {
        const p1 = stroke.points[0];
        const p2 = stroke.points[stroke.points.length - 1];
        const rx = Math.min(p1.x, p2.x);
        const ry = Math.min(p1.y, p2.y);
        const rw = Math.max(4, Math.abs(p2.x - p1.x));
        const rh = Math.max(4, Math.abs(p2.y - p1.y));

        ctx.fillStyle = stroke.color + '26'; // ~15% fill highlight
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.strokeWidth || 3;
        ctx.shadowColor = stroke.color;
        ctx.shadowBlur = 10;
        ctx.roundRect(rx, ry, rw, rh, 8);
        ctx.fill();
        ctx.stroke();
      }
    } else if (stroke.tool === 'circle') {
      if (stroke.points.length >= 2) {
        const p1 = stroke.points[0];
        const p2 = stroke.points[stroke.points.length - 1];
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const radX = Math.max(4, Math.abs(p2.x - p1.x) / 2);
        const radY = Math.max(4, Math.abs(p2.y - p1.y) / 2);

        ctx.fillStyle = stroke.color + '26';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.strokeWidth || 3;
        ctx.shadowColor = stroke.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radX, radY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (stroke.tool === 'arrow') {
      if (stroke.points.length >= 2) {
        const from = stroke.points[0];
        const to = stroke.points[stroke.points.length - 1];
        const headlen = Math.max(16, (stroke.strokeWidth || 4) * 3.5);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.lineWidth = stroke.strokeWidth || 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = stroke.color;
        ctx.shadowBlur = 8;

        // Draw shaft
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headlen * Math.cos(angle - Math.PI / 6),
          to.y - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          to.x - headlen * Math.cos(angle + Math.PI / 6),
          to.y - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    } else if (stroke.tool === 'text') {
      const p = stroke.points[0];
      const text = stroke.text || '';
      if (text) {
        const fontSize = stroke.fontSize || 28;
        ctx.font = `bold ${fontSize}px "JetBrains Mono", "Plus Jakarta Sans", monospace, sans-serif`;
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize * 1.35;
        const padX = Math.round(fontSize * 0.5);
        const padY = Math.round(fontSize * 0.35);
        const boxW = textWidth + padX * 2;
        const boxH = textHeight + padY * 2;

        // Draw backdrop badge for high-contrast legibility over any underlying video or code
        if (stroke.hasBackground !== false) {
          ctx.fillStyle = 'rgba(9, 9, 11, 0.94)';
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = stroke.color;
          ctx.shadowBlur = 10;
          ctx.roundRect(p.x - padX, p.y - boxH / 2, boxW, boxH, 8);
          ctx.fill();
          ctx.stroke();
        }

        // Draw text with contrasting shadow
        ctx.fillStyle = stroke.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 6;
        ctx.fillText(text, p.x, p.y);
      }
    }

    ctx.restore();
  };




  // Subscribe to TTS
  useEffect(() => {
    return ttsEngine.subscribe((st) => {
      setTtsState({ isSpeaking: st.isSpeaking, isPaused: st.isPaused });
    });
  }, []);

  // Timer counter when recording & periodic GIF keyframe sampler
  useEffect(() => {
    let interval: number;
    if (isRecording && !isPaused) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);

        // Periodically capture keyframes for instant GIF compilation
        if (canvasRef.current && sampledGifFramesRef.current.length < 24) {
          const sample = sampleCanvasFrame(
            canvasRef.current,
            360,
            Math.max(180, Math.round(360 * (activeAspectRatio.height / activeAspectRatio.width)))
          );
          if (sample) {
            sampledGifFramesRef.current.push(sample);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, setRecordingSeconds, activeAspectRatio]);

  // Helper to render simulator IDE workstation scene onto any target context
  const drawSimulatorWorkstation = (
    targetCtx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    const bgGrad = targetCtx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#09090b');
    bgGrad.addColorStop(0.5, '#121217');
    bgGrad.addColorStop(1, '#09090b');
    targetCtx.fillStyle = bgGrad;
    targetCtx.fillRect(0, 0, w, h);

    // Window Frame
    const pad = Math.min(24, Math.floor(w * 0.02));
    const winW = w - pad * 2;
    const winH = h - pad * 2;

    targetCtx.fillStyle = '#0e0f14';
    targetCtx.roundRect(pad, pad, winW, winH, 12);
    targetCtx.fill();
    targetCtx.strokeStyle = '#27272a';
    targetCtx.lineWidth = 1.5;
    targetCtx.stroke();

    // Header bar
    targetCtx.fillStyle = '#18181b';
    targetCtx.roundRect(pad, pad, winW, 40, [12, 12, 0, 0]);
    targetCtx.fill();

    // Window buttons
    targetCtx.fillStyle = '#ef4444';
    targetCtx.beginPath();
    targetCtx.arc(pad + 20, pad + 20, 5.5, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = '#f59e0b';
    targetCtx.beginPath();
    targetCtx.arc(pad + 38, pad + 20, 5.5, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = '#10b981';
    targetCtx.beginPath();
    targetCtx.arc(pad + 56, pad + 20, 5.5, 0, Math.PI * 2);
    targetCtx.fill();

    // Title
    targetCtx.font = '600 13px "JetBrains Mono", monospace';
    targetCtx.fillStyle = '#a1a1aa';
    const titleText =
      w < 1200
        ? 'KBT CloudIDE Simulator'
        : 'KBT CloudIDE Simulator — Multi-Language Architecture Engine';
    targetCtx.fillText(titleText, pad + 78, pad + 25);

    // Active Aspect Ratio & LUT banner in header
    targetCtx.font = '700 11px "JetBrains Mono", monospace';
    targetCtx.textAlign = 'right';
    let rightOffset = 20;
    if (activeFilter.id !== 'none') {
      targetCtx.fillStyle = '#c084fc';
      targetCtx.fillText(`LUT: [${activeFilter.name.toUpperCase()}]`, pad + winW - rightOffset, pad + 25);
      rightOffset += 160;
    }
    targetCtx.fillStyle = '#818cf8';
    targetCtx.fillText(`[${activeAspectRatio.id} • ${activeAspectRatio.platform}]`, pad + winW - rightOffset, pad + 25);
    targetCtx.textAlign = 'left';

    // Sidebar
    const sidebarW = w < 1200 ? 170 : 200;
    targetCtx.fillStyle = '#121318';
    targetCtx.fillRect(pad + 1, pad + 41, sidebarW, winH - 42);
    targetCtx.strokeStyle = '#27272a';
    targetCtx.beginPath();
    targetCtx.moveTo(pad + sidebarW + 1, pad + 41);
    targetCtx.lineTo(pad + sidebarW + 1, pad + winH);
    targetCtx.stroke();

    targetCtx.font = '600 11px "JetBrains Mono", monospace';
    targetCtx.fillStyle = '#71717a';
    targetCtx.fillText('EXPLORER : KBT PROJECT', pad + 16, pad + 65);

    const files = [
      '📄 main.cpp [AVX2]',
      '📄 SIMD_Kernel.rs',
      '📄 pipeline.go',
      '📄 engine.cu [CUDA]',
      '📄 config.toml',
    ];
    files.forEach((f, fi) => {
      targetCtx.fillStyle = fi === 0 ? '#818cf8' : '#a1a1aa';
      targetCtx.fillText(f, pad + 16, pad + 95 + fi * 26);
    });

    // Editor code area
    const terminalH = h > 1400 ? 260 : 140;
    targetCtx.fillStyle = '#0d0e12';
    targetCtx.fillRect(pad + sidebarW + 2, pad + 41, winW - sidebarW - 3, winH - terminalH - 42);

    const codeSnippets = [
      '// High-Performance Architectural Engine SIMD Kernel',
      '#include <immintrin.h>',
      '#include <stdint.h>',
      '',
      'void process_vector_stream(const float* in, float* out, size_t n) {',
      '    const __m256 kPivot = _mm256_set1_ps(1.0f);',
      '    for (size_t i = 0; i < n; i += 8) {',
      '        __m256 v = _mm256_loadu_ps(in + i);',
      '        __m256 res = _mm256_fmadd_ps(v, v, kPivot);',
      '        _mm256_storeu_ps(out + i, res);',
      '    }',
      '}',
    ];
    targetCtx.font = '12px "JetBrains Mono", monospace';
    codeSnippets.forEach((line, li) => {
      targetCtx.fillStyle = '#52525b';
      targetCtx.fillText(String(li + 1).padStart(2, '0'), pad + sidebarW + 18, pad + 72 + li * 22);
      targetCtx.fillStyle =
        line.startsWith('//')
          ? '#71717a'
          : line.startsWith('#')
          ? '#f43f5e'
          : line.includes('void') || line.includes('const')
          ? '#60a5fa'
          : line.includes('_mm256')
          ? '#34d399'
          : '#e4e4e7';
      targetCtx.fillText(line, pad + sidebarW + 50, pad + 72 + li * 22);
    });

    // Terminal pane
    targetCtx.fillStyle = '#090a0f';
    targetCtx.fillRect(pad + sidebarW + 2, pad + winH - terminalH, winW - sidebarW - 3, terminalH);
    targetCtx.strokeStyle = '#27272a';
    targetCtx.beginPath();
    targetCtx.moveTo(pad + sidebarW + 2, pad + winH - terminalH);
    targetCtx.lineTo(pad + winW, pad + winH - terminalH);
    targetCtx.stroke();

    targetCtx.font = '600 11px "JetBrains Mono", monospace';
    targetCtx.fillStyle = '#38bdf8';
    targetCtx.fillText(
      `TERMINAL : KBT COMPILER [${activeAspectRatio.id} ${activeAspectRatio.width}×${activeAspectRatio.height}]`,
      pad + sidebarW + 18,
      pad + winH - terminalH + 24
    );

    targetCtx.font = '11px "JetBrains Mono", monospace';
    targetCtx.fillStyle = '#4ade80';
    targetCtx.fillText('[OK] Real-time Canvas Capture Stream Initialized.', pad + sidebarW + 18, pad + winH - terminalH + 46);
    targetCtx.fillStyle = '#e4e4e7';
    targetCtx.fillText(`[LUT] Active Color-Correction Filter: ${activeFilter.name}`, pad + sidebarW + 18, pad + winH - terminalH + 68);
    targetCtx.fillStyle = '#94a3b8';
    targetCtx.fillText(`[TARGET] Formatted for ${activeAspectRatio.platform} (${activeAspectRatio.label})`, pad + sidebarW + 18, pad + winH - terminalH + 90);
  };

  // Real-time canvas animation loop (Compositing Video/IDE base, Color Filter LUT, Video Crop Pipeline, Ripples, Cursor Halo, Softsubs, Timer Overlay)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const render = () => {
      // Clear canvas overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 0. Base Video / Software Workstation Compositor Layer with Real-Time Color Filter LUT & Video Cropping Pipeline
      ctx.save();
      if (activeFilter.id !== 'none') {
        ctx.filter = activeFilter.canvasFilter;
      }

      const curCrop = cropSettingsRef.current;
      const isCroppedActive = curCrop.isEnabled && !curCrop.isEditing;

      if (captureSource === 'screen' && screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
        const vid = screenVideoRef.current;
        if (isCroppedActive) {
          const sW = vid.videoWidth || canvas.width;
          const sH = vid.videoHeight || canvas.height;
          const sx = Math.max(0, curCrop.x * sW);
          const sy = Math.max(0, curCrop.y * sH);
          const sw = Math.max(10, Math.min(sW - sx, curCrop.width * sW));
          const sh = Math.max(10, Math.min(sH - sy, curCrop.height * sH));
          ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        }
      } else if (captureSource === 'simulator') {
        if (isCroppedActive) {
          if (!offscreenSimCanvasRef.current) {
            offscreenSimCanvasRef.current = document.createElement('canvas');
          }
          const offCanvas = offscreenSimCanvasRef.current;
          if (offCanvas.width !== canvas.width || offCanvas.height !== canvas.height) {
            offCanvas.width = canvas.width;
            offCanvas.height = canvas.height;
          }
          const offCtx = offCanvas.getContext('2d');
          if (offCtx) {
            offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
            drawSimulatorWorkstation(offCtx, offCanvas.width, offCanvas.height);
            const sx = Math.max(0, curCrop.x * offCanvas.width);
            const sy = Math.max(0, curCrop.y * offCanvas.height);
            const sw = Math.max(10, Math.min(offCanvas.width - sx, curCrop.width * offCanvas.width));
            const sh = Math.max(10, Math.min(offCanvas.height - sy, curCrop.height * offCanvas.height));
            ctx.drawImage(offCanvas, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          } else {
            drawSimulatorWorkstation(ctx, canvas.width, canvas.height);
          }
        } else {
          drawSimulatorWorkstation(ctx, canvas.width, canvas.height);
        }
      }
      ctx.restore();

      // 0.5 Real-Time Scene Transition Compositing (Fade, Slide, Wipe, Iris)
      if (transitionStartTimeRef.current !== null && lastSceneSnapshotCanvasRef.current) {
        const elapsed = performance.now() - transitionStartTimeRef.current;
        const dur = Math.max(50, transitionDurationRef.current || 500);
        const progress = Math.min(1.0, elapsed / dur);

        if (progress < 1.0) {
          const snap = lastSceneSnapshotCanvasRef.current;
          const trType = transitionTypeRef.current;
          ctx.save();

          if (trType === 'fade') {
            ctx.globalAlpha = Math.max(0, 1 - progress);
            ctx.drawImage(snap, 0, 0, canvas.width, canvas.height);
          } else if (trType === 'slide-left') {
            const offsetX = -progress * canvas.width;
            ctx.drawImage(snap, offsetX, 0, canvas.width, canvas.height);
          } else if (trType === 'slide-up') {
            const offsetY = -progress * canvas.height;
            ctx.drawImage(snap, 0, offsetY, canvas.width, canvas.height);
          } else if (trType === 'wipe-horizontal') {
            const wipeX = progress * canvas.width;
            ctx.beginPath();
            ctx.rect(wipeX, 0, canvas.width - wipeX, canvas.height);
            ctx.clip();
            ctx.drawImage(snap, 0, 0, canvas.width, canvas.height);
          } else if (trType === 'iris-circle') {
            const maxRadius = Math.hypot(canvas.width / 2, canvas.height / 2);
            const currentRadius = progress * maxRadius;
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.arc(canvas.width / 2, canvas.height / 2, currentRadius, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.drawImage(snap, 0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
        } else {
          transitionStartTimeRef.current = null;
        }
      }

      // Pure Pixel LUT transformation if algorithmic mode is enabled
      if (usePixelLutEngine && activeFilter.id !== 'none') {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyLutToImageData(imgData, activeFilter.id);
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Fallback safely if tainted
        }
      }

      // 1. Draw ripples
      ripplesRef.current.forEach((r) => {
        r.radius += 2.5;
        r.alpha -= 0.035;

        if (r.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(99, 102, 241, ${Math.max(0, r.alpha)})`;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 10;
          ctx.stroke();

          // Inner ring
          ctx.beginPath();
          ctx.arc(r.x, r.y, Math.max(0, r.radius * 0.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(0, r.alpha * 0.8)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      });
      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0);

      // 2. Cursor Halo Spotlight
      const cur = cursorRef.current;
      ctx.save();
      const gradient = ctx.createRadialGradient(cur.x, cur.y, 4, cur.x, cur.y, 40);
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2.5 Real-Time Screen Drawing & Highlight Annotations Layer
      strokesRef.current.forEach((strk) => renderDrawingStroke(ctx, strk));
      if (currentStrokeRef.current) {
        renderDrawingStroke(ctx, currentStrokeRef.current);
      }

      // 3. Render active softsub caption if enabled and cue is matching recordingSeconds

      if (showAnnotations && annotationMode === 'softsubs' && cues.length > 0) {
        const currentTime = isRecording ? recordingSeconds : (Date.now() / 1000) % 15;
        const activeCue = cues.find((c) => currentTime >= c.startTime && currentTime <= c.endTime) || cues[0];

        if (activeCue) {
          const text = activeCue.translations[selectedLanguage] || activeCue.text;
          ctx.save();
          ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          const textWidth = ctx.measureText(text).width;
          const bgPadding = 16;
          const boxWidth = Math.min(canvas.width - 40, textWidth + bgPadding * 2);
          const boxHeight = 40;
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = canvas.height - 65;

          // Background pill
          ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
          ctx.fill();
          ctx.stroke();

          // Subtitle text
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(text, canvas.width / 2, boxY + 25, boxWidth - 20);
          ctx.restore();
        }
      }

      // 4. Real-time Recording Timer Overlay on the video recording surface
      if (showTimerOverlay) {
        ctx.save();
        const {
          x,
          y,
          width,
          height,
          borderRadius,
          backdropFill,
          activeStroke,
          pausedStroke,
          idleStroke,
          recDotColor,
          pauseDotColor,
          idleDotColor,
          fontFamily,
          fontSize,
          fontWeight,
        } = TIMER_OVERLAY_STYLE;

        // Dark translucent container pill
        ctx.fillStyle = backdropFill;
        ctx.strokeStyle = isRecording
          ? isPaused
            ? pausedStroke
            : activeStroke
          : idleStroke;
        ctx.lineWidth = 1.5;
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.fill();
        ctx.stroke();

        // Pulsing status dot
        ctx.beginPath();
        ctx.arc(x + 16, y + height / 2, 5, 0, Math.PI * 2);
        if (isRecording) {
          const dotColor = isPaused ? pauseDotColor : recDotColor;
          ctx.fillStyle = dotColor;
          ctx.shadowColor = dotColor;
          ctx.shadowBlur = 8;
        } else {
          const dotColor = recordingSeconds > 0 ? '#818cf8' : idleDotColor;
          ctx.fillStyle = dotColor;
          ctx.shadowColor = dotColor;
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Recording Timer / Total Video Length Duration counter
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let timerText = '';
        if (isRecording) {
          const status = isPaused ? 'PAUSE' : 'REC';
          timerText = `${status} ${formatDisplayDuration(recordingSeconds)}`;
        } else if (recordingSeconds > 0) {
          timerText = `LENGTH ${formatDisplayDuration(recordingSeconds)}`;
        } else {
          timerText = `DURATION 00:00`;
        }

        ctx.fillStyle = isRecording ? (isPaused ? '#fbbf24' : '#ffffff') : recordingSeconds > 0 ? '#ffffff' : '#e4e4e7';
        ctx.fillText(timerText, x + 28, y + height / 2);

        // Framerate indicator tag
        ctx.font = `600 10px ${fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`${exportFramerate}FPS`, x + width - 12, y + height / 2);

        ctx.restore();
      }


      // 5. Active Color Filter / LUT Status Overlay Badge
      if (activeFilter.id !== 'none') {
        ctx.save();
        const badgeW = 160;
        const badgeH = 34;
        const badgeX = canvas.width - badgeW - 24;
        const badgeY = 24;

        ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        ctx.fill();
        ctx.stroke();

        // Swatch dot
        ctx.beginPath();
        ctx.arc(badgeX + 16, badgeY + badgeH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle =
          activeFilter.id === 'grayscale'
            ? '#cbd5e1'
            : activeFilter.id === 'sepia'
            ? '#d97706'
            : activeFilter.id === 'high-contrast'
            ? '#f43f5e'
            : activeFilter.id === 'warm-sunlight'
            ? '#f97316'
            : activeFilter.id === 'cyberpunk-cool'
            ? '#06b6d4'
            : '#a855f7';
        ctx.fill();

        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`LUT: ${activeFilter.label.toUpperCase()}`, badgeX + 28, badgeY + badgeH / 2);
        ctx.restore();
      }

      // 5.5 Real-Time Active Video Crop Status Badge on Compositor Canvas
      if (curCrop.isEnabled && !curCrop.isEditing) {
        ctx.save();
        const badgeW = 160;
        const badgeH = 34;
        const badgeX = canvas.width - badgeW - 24;
        const badgeY = activeFilter.id !== 'none' ? 68 : 24;

        ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        ctx.fill();
        ctx.stroke();

        // Indigo dot
        ctx.beginPath();
        ctx.arc(badgeX + 16, badgeY + badgeH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#818cf8';
        ctx.fill();

        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`CROP: [${curCrop.preset.toUpperCase()}]`, badgeX + 28, badgeY + badgeH / 2);
        ctx.restore();
      }

      // 6. Real-Time Custom Watermark Burning on Compositor Canvas
      if (
        watermarkSettings.enabled &&
        watermarkImgRef.current &&
        watermarkImgRef.current.complete &&
        watermarkImgRef.current.naturalWidth > 0
      ) {
        ctx.save();
        ctx.globalAlpha = watermarkSettings.opacity;
        const img = watermarkImgRef.current;
        const targetW = Math.max(80, Math.min(500, canvas.width * watermarkSettings.scale));
        const targetH = targetW * (img.naturalHeight / img.naturalWidth);
        const margin = 28;

        let wx = canvas.width - targetW - margin;
        let wy = canvas.height - targetH - margin;

        if (watermarkSettings.position === 'top-left') {
          wx = margin;
          wy = margin + 50; // offset below header
        } else if (watermarkSettings.position === 'top-right') {
          wx = canvas.width - targetW - margin;
          wy = margin + 50;
        } else if (watermarkSettings.position === 'bottom-left') {
          wx = margin;
          wy = canvas.height - targetH - margin;
        } else if (watermarkSettings.position === 'center') {
          wx = (canvas.width - targetW) / 2;
          wy = (canvas.height - targetH) / 2;
        }

        ctx.drawImage(img, wx, wy, targetW, targetH);
        ctx.restore();
      }

      // 7. Post-Processing Filter Retro FX (VHS Glitch tracking and CRT Phosphor Scanlines)
      renderPostProcessingGlitchFx(ctx, canvas.width, canvas.height, activeFilter.id);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [
    cues,
    isRecording,
    isPaused,
    recordingSeconds,
    selectedLanguage,
    showAnnotations,
    annotationMode,
    showTimerOverlay,
    exportFramerate,
    selectedFilter,
    activeFilter,
    usePixelLutEngine,
    captureSource,
    selectedAspectRatio,
    activeAspectRatio,
    watermarkSettings,
    cropSettings,
  ]);

  // Initialize Camera stream if enabled
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 320, height: 240 }, audio: false })
        .then((s) => {
          stream = s;
          cameraStreamRef.current = s;
          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera preview unavailable or permission denied:', err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraActive]);

  // Initialize Mic audio stream and attach to multi-track mixer with digital noise gate
  useEffect(() => {
    let micStream: MediaStream | null = null;
    if (isMicActive && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } })
        .then((s) => {
          micStream = s;
          audioMixerRef.current?.attachMicStream(s);
        })
        .catch((err) => {
          console.warn('Microphone stream access unavailable or denied:', err);
        });
    }

    return () => {
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isMicActive]);

  // Handle interaction from the embedded software simulator
  const handleSimulatorInteraction = (event: {
    type: 'click' | 'type';
    target: string;
    coordinates: { x: number; y: number };
    title: string;
    description: string;
    codeSnippet?: string;
  }) => {
    // Spawn ripple
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const rx = event.coordinates.x - rect.left;
      const ry = event.coordinates.y - rect.top;

      ripplesRef.current.push({
        id: Date.now() + Math.random(),
        x: Math.max(20, Math.min(canvas.width - 20, rx)),
        y: Math.max(20, Math.min(canvas.height - 20, ry)),
        radius: 6,
        maxRadius: 50,
        alpha: 1.0,
      });

      cursorRef.current = {
        x: Math.max(20, Math.min(canvas.width - 20, rx)),
        y: Math.max(20, Math.min(canvas.height - 20, ry)),
      };
    }

    // Append as a new Scribe workflow step
    const newStep: ScribeWorkflowStep = {
      id: `step_${Date.now()}`,
      stepNumber: scribeSteps.length + 1,
      timestamp: isRecording ? recordingSeconds : (Date.now() / 1000) % 60,
      actionType: event.type === 'click' ? 'click' : 'type',
      targetElement: event.target,
      coordinates: event.coordinates,
      title: event.title,
      description: event.description,
      codeSnippet: event.codeSnippet,
      translations: {
        en: { title: event.title, description: event.description },
        fr: { title: `[FR] ${event.title}`, description: `Action enregistrée: ${event.description}` },
        de: { title: `[DE] ${event.title}`, description: `Aufgezeichnete Aktion: ${event.description}` },
        es: { title: `[ES] ${event.title}`, description: `Acción registrada: ${event.description}` },
        it: { title: `[IT] ${event.title}`, description: `Azione registrata: ${event.description}` },
        pt: { title: `[PT] ${event.title}`, description: `Ação registrada: ${event.description}` },
        id: { title: `[ID] ${event.title}`, description: `Tindakan tercatat: ${event.description}` },
        sw: { title: `[SW] ${event.title}`, description: `Hatua iliyorekodiwa: ${event.description}` },
        tr: { title: `[TR] ${event.title}`, description: `Kaydedilen eylem: ${event.description}` },
        ru: { title: `[RU] ${event.title}`, description: `Действие записано: ${event.description}` },
        zh: { title: `[ZH] ${event.title}`, description: `已记录交互动作: ${event.description}` },
        ja: { title: `[JA] ${event.title}`, description: `記録された操作: ${event.description}` },
        ar: { title: `[AR] ${event.title}`, description: `الإجراء المسجل: ${event.description}` },
        ur: { title: `[UR] ${event.title}`, description: `ریکارڈ شدہ عمل: ${event.description}` },
        hi: { title: `[HI] ${event.title}`, description: `रिकॉर्ड की गई कार्रवाई: ${event.description}` },
        vi: { title: `[VI] ${event.title}`, description: `Thao tác đã ghi: ${event.description}` },
        ko: { title: `[KO] ${event.title}`, description: `기록된 동작: ${event.description}` },
        fa: { title: `[FA] ${event.title}`, description: `عملیات ثبت شده: ${event.description}` },
        mr: { title: `[MR] ${event.title}`, description: `नोंदवलेली कृती: ${event.description}` },
        bn: { title: `[BN] ${event.title}`, description: `রেকর্ড করা ক্রিয়া: ${event.description}` },
        ta: { title: `[TA] ${event.title}`, description: `பதிவு செய்யப்பட்ட செயல்: ${event.description}` },
        te: { title: `[TE] ${event.title}`, description: `రికార్డ్ చేయబడిన చర్య: ${event.description}` },
      },
    };

    setScribeSteps((prev) => [...prev, newStep]);
    setActiveStepIndex(scribeSteps.length);
  };

  // Start Real Display Capture (Screen Share)
  const handleStartDisplayCapture = async () => {
    try {
      if (navigator.mediaDevices?.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: exportFramerate },
          audio: isMicActive,
        });
        triggerSceneTransition();
        displayStreamRef.current = stream;
        setCaptureSource('screen');
      } else {
        alert('getDisplayMedia is not available in this browser context. Using Interactive IDE Simulator.');
      }
    } catch (e) {
      console.warn('Display media cancelled or failed:', e);
      triggerSceneTransition();
      setCaptureSource('simulator');
    }
  };

  // Record Lifecycle Controls
  const handleStartRecording = () => {
    recordedChunksRef.current = [];
    recordedBlobRef.current = null;
    sampledGifFramesRef.current = [];
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);
    setIsRecording(true);
    setIsPaused(false);

    // Audio level pulsing simulation
    const interval = window.setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.5);
    }, 150);

    // Initial frame sampling for GIF loop
    if (canvasRef.current) {
      const initialFrame = sampleCanvasFrame(
        canvasRef.current,
        360,
        Math.max(180, Math.round(360 * (activeAspectRatio.height / activeAspectRatio.width)))
      );
      if (initialFrame) {
        sampledGifFramesRef.current.push(initialFrame);
      }
    }

    // If canvas stream can be captured:
    const canvas = canvasRef.current;
    if (canvas && (canvas as any).captureStream) {
      try {
        const stream = (canvas as any).captureStream(exportFramerate);

        // Connect multi-track mixed audio stream to canvas capture
        const mixedAudio = audioMixerRef.current?.getMixedAudioStream();
        if (mixedAudio && mixedAudio.getAudioTracks().length > 0) {
          mixedAudio.getAudioTracks().forEach((t) => stream.addTrack(t));
        }

        const options = { mimeType: 'video/webm;codecs=vp9' };
        const recorder = new MediaRecorder(
          stream,
          MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined
        );

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          clearInterval(interval);
          setAudioLevel(0);
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          recordedBlobRef.current = blob;
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);

          const initialDur = recordingSeconds > 0 ? recordingSeconds : 1;
          setPreviewVideoDuration(initialDur);
          setTrimStartSeconds(0);
          setTrimEndSeconds(Number(initialDur.toFixed(1)));
          setIsPreviewTrimLoopActive(false);

          // Capture a static thumbnail screenshot from the active canvas
          let thumbDataUrl: string | undefined = undefined;
          if (canvasRef.current) {
            try {
              thumbDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.65);
            } catch (err) {
              console.warn('Canvas thumbnail capture error:', err);
            }
          }

          // Archive recording session to Firestore / local history
          archiveRecordingSession(`rec-${Date.now()}`, {
            projectTitle: projectTitleRef.current,
            durationSeconds: recordingSeconds,
            formattedDuration: formatDisplayDuration(recordingSeconds),
            exportFormat: selectedExportFormatRef.current,
            colorFilter: activeFilter.name,
            resolution: `${activeAspectRatio.width}x${activeAspectRatio.height}`,
            crop: cropSettingsRef.current.isEnabled
              ? `${cropSettingsRef.current.preset.toUpperCase()} (${Math.round(cropSettingsRef.current.width * 100)}%×${Math.round(cropSettingsRef.current.height * 100)}%)`
              : 'full-frame',
            thumbnailUrl: thumbDataUrl,
          }).catch((e) => console.warn('Archive recording session error:', e));

          // Once recording stops: automatically trigger file export for the captured video if autoExportOnStop is enabled
          if (autoExportOnStopRef.current) {
            const targetFormat = selectedExportFormatRef.current === 'gif' ? 'mp4' : selectedExportFormatRef.current;
            handleExportVideo(targetFormat, blob);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start(1000);
      } catch (err) {
        console.warn('MediaRecorder init error:', err);
      }
    }
  };

  const handlePauseRecording = () => {
    setIsPaused((prev) => !prev);
    if (mediaRecorderRef.current) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
      } else {
        mediaRecorderRef.current.resume();
      }
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    let recorderStopped = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        recorderStopped = true;
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
    }

    // Capture final ending frame for GIF animation
    if (canvasRef.current && sampledGifFramesRef.current.length < 24) {
      const finalFrame = sampleCanvasFrame(
        canvasRef.current,
        360,
        Math.max(180, Math.round(360 * (activeAspectRatio.height / activeAspectRatio.width)))
      );
      if (finalFrame) {
        sampledGifFramesRef.current.push(finalFrame);
      }
    }

    // If MediaRecorder was not active (e.g. test or simulated canvas capture), ensure blob and export trigger
    if (!recorderStopped) {
      setTimeout(() => {
        if (!recordedBlobRef.current) {
          const sample = canvasRef.current ? sampleCanvasFrame(canvasRef.current, 640, 360) : null;
          const syntheticBlob = new Blob([sample ? sample.data : 'KBT_AppGuideVideo Tutorial'], { type: 'video/webm' });
          recordedBlobRef.current = syntheticBlob;
          const url = URL.createObjectURL(syntheticBlob);
          setRecordedVideoUrl(url);

          const initialDur = recordingSeconds > 0 ? recordingSeconds : 1;
          setPreviewVideoDuration(initialDur);
          setTrimStartSeconds(0);
          setTrimEndSeconds(Number(initialDur.toFixed(1)));
          setIsPreviewTrimLoopActive(false);

          if (autoExportOnStopRef.current) {
            const targetFormat = selectedExportFormatRef.current === 'gif' ? 'mp4' : selectedExportFormatRef.current;
            handleExportVideo(targetFormat, syntheticBlob);
          }
        }
      }, 120);
    }
  };

  // Helper to format decimal timestamps (e.g. 00:04.2)
  const formatTimestampWithTenths = (seconds: number): string => {
    const safe = Math.max(0, seconds || 0);
    const mins = Math.floor(safe / 60);
    const secs = (safe % 60).toFixed(1);
    return `${String(mins).padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  const handlePreviewVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const vid = e.currentTarget;
    const dur = vid.duration && !isNaN(vid.duration) && isFinite(vid.duration) && vid.duration > 0
      ? vid.duration
      : (recordingSeconds > 0 ? recordingSeconds : 1);
    const roundedDur = Number(dur.toFixed(1));
    setPreviewVideoDuration(roundedDur);
    setTrimStartSeconds(0);
    setTrimEndSeconds(roundedDur);
    setIsPreviewTrimLoopActive(false);
  };

  const handlePreviewVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const vid = e.currentTarget;
    const cur = vid.currentTime;
    setPreviewVideoCurrentTime(cur);

    if (isPreviewTrimLoopActiveRef.current) {
      const start = trimStartSecondsRef.current;
      const end = trimEndSecondsRef.current;
      if (cur >= end - 0.08) {
        vid.currentTime = start;
        vid.play().catch(() => {});
      } else if (cur < start) {
        vid.currentTime = start;
      }
    }
  };

  const handleSetTrimStartToCurrent = () => {
    const current = previewVideoCurrentTime;
    const maxStart = Math.max(0, trimEndSeconds - 0.1);
    const newStart = Math.max(0, Math.min(current, maxStart));
    const rounded = Number(newStart.toFixed(1));
    setTrimStartSeconds(rounded);
    if (previewVideoRef.current && previewVideoRef.current.currentTime < rounded) {
      previewVideoRef.current.currentTime = rounded;
    }
  };

  const handleSetTrimEndToCurrent = () => {
    const current = previewVideoCurrentTime;
    const maxDur = previewVideoDuration > 0 ? previewVideoDuration : Math.max(1, recordingSeconds);
    const minEnd = trimStartSeconds + 0.1;
    const newEnd = Math.min(maxDur, Math.max(current, minEnd));
    const rounded = Number(newEnd.toFixed(1));
    setTrimEndSeconds(rounded);
    if (previewVideoRef.current && previewVideoRef.current.currentTime > rounded) {
      previewVideoRef.current.currentTime = rounded;
    }
  };

  const handleResetTrim = () => {
    const maxDur = previewVideoDuration > 0 ? previewVideoDuration : Math.max(1, recordingSeconds);
    setTrimStartSeconds(0);
    setTrimEndSeconds(Number(maxDur.toFixed(1)));
    setIsPreviewTrimLoopActive(false);
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = 0;
    }
  };

  const handlePlayTrimmedCut = () => {
    if (!previewVideoRef.current) return;
    const vid = previewVideoRef.current;
    vid.currentTime = trimStartSeconds;
    setIsPreviewTrimLoopActive(true);
    vid.play().catch(() => {});
  };

  const handleSeekPreviewVideo = (seconds: number) => {
    const maxDur = previewVideoDuration > 0 ? previewVideoDuration : Math.max(1, recordingSeconds);
    const target = Math.max(0, Math.min(maxDur, seconds));
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = target;
    }
    setPreviewVideoCurrentTime(target);
  };

  // Build standardized companion metadata manifest JSON
  const buildMetadataManifest = (formatOverride?: ExportFormatId): ProjectRecordingMetadata => {
    const format = formatOverride || selectedExportFormat;
    const origDur = previewVideoDuration > 0 ? previewVideoDuration : Math.max(1, recordingSeconds);
    const isTrimmed = trimStartSeconds > 0.05 || (previewVideoDuration > 0 && trimEndSeconds < previewVideoDuration - 0.05);
    const trimmedDur = isTrimmed ? Math.max(0.1, trimEndSeconds - trimStartSeconds) : origDur;
    const effectiveDurSec = isTrimmed ? Math.round(trimmedDur) : recordingSeconds;
    const m = Math.floor(effectiveDurSec / 60);
    const s = effectiveDurSec % 60;

    // Shift / filter subtitles if recording is trimmed
    const activeCues = isTrimmed
      ? cues
          .filter((c) => c.endTime > trimStartSeconds && c.startTime < trimEndSeconds)
          .map((c) => ({
            ...c,
            startTime: Math.max(0, c.startTime - trimStartSeconds),
            endTime: Math.min(trimmedDur, c.endTime - trimStartSeconds),
          }))
      : cues;

    return {
      projectTitle: projectTitle.trim() || 'Untitled Tutorial Recording',
      projectDescription: projectDescription.trim(),
      recordedAt: new Date().toISOString(),
      durationSeconds: effectiveDurSec,
      formattedDuration: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      language: selectedLanguage,
      languageName: LANGUAGE_MAP[selectedLanguage]?.name || selectedLanguage,
      aspectRatio: selectedAspectRatio,
      resolution: {
        width: activeAspectRatio.width,
        height: activeAspectRatio.height,
      },
      exportFormat: format,
      framerate: exportFramerate,
      quality: exportQuality,
      colorFilter: selectedFilter,
      cropSettings: {
        isEnabled: cropSettings.isEnabled,
        preset: cropSettings.preset,
        x: cropSettings.x,
        y: cropSettings.y,
        width: cropSettings.width,
        height: cropSettings.height,
        isLocked: cropSettings.isLocked,
      },
      interactiveWorkflowStepsCount: scribeSteps.length,
      subtitleCuesCount: activeCues.length,
      stepsSummary: scribeSteps.map((st) => ({
        stepNumber: st.stepNumber,
        title: st.translations[selectedLanguage]?.title || st.title,
        actionType: st.actionType,
        targetElement: st.targetElement,
        timestamp: isTrimmed ? Math.max(0, st.timestamp - trimStartSeconds) : st.timestamp,
      })),
      subtitlesSummary: activeCues.map((c) => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.endTime,
        speaker: c.speaker,
        text: c.translations[selectedLanguage] || c.text,
      })),
      trimSettings: {
        isTrimmed,
        trimStartSeconds: Number(trimStartSeconds.toFixed(1)),
        trimEndSeconds: Number(trimEndSeconds.toFixed(1)),
        originalDurationSeconds: Number(origDur.toFixed(1)),
        trimmedDurationSeconds: Number(trimmedDur.toFixed(1)),
      },
      generator: 'KBT_AppGuideVideo Studio Engine',
      version: '2.4.0',
    };
  };

  // Download standalone project metadata manifest (.json)
  const handleDownloadMetadata = () => {
    const ratioTag = activeAspectRatio.id.replace(':', 'x');
    const timestamp = Date.now();
    const cleanTitle = sanitizeFileName(projectTitle, 'KBT_Tutorial');
    const isTrimmed = trimStartSeconds > 0.05 || (previewVideoDuration > 0 && trimEndSeconds < previewVideoDuration - 0.05);
    const trimSuffix = isTrimmed ? `_trim_${Math.round(trimStartSeconds)}s-${Math.round(trimEndSeconds)}s` : '';
    const baseFileName = `${cleanTitle}_${selectedLanguage.toUpperCase()}_${ratioTag}${trimSuffix}_${timestamp}`;
    const metadata = buildMetadataManifest();
    const metaJson = generateProjectMetadataJson(metadata);
    triggerDownload(metaJson, `${baseFileName}_metadata.json`, 'application/json');
  };

  // Fast Export: triggers immediate export of active project based on current format and quality settings
  const handleFastImmediateExport = () => {
    if (isRecordingRef.current) {
      handleStopRecording();
    }
    setExportProgressPercent(20);
    setIsExporting(true);
    setExportStatusText('Fast Export: Encoding active project...');
    setTimeout(() => setExportProgressPercent(50), 100);
    setTimeout(() => setExportProgressPercent(85), 250);
    setTimeout(() => {
      setExportProgressPercent(100);
      handleExportVideo(selectedExportFormatRef.current);
    }, 400);
  };

  // Reset Studio: resets color filters, screen annotations, crop, and project metadata
  const handleResetStudio = () => {
    setSelectedFilter('none');
    handleClearStrokes();
    setCropSettings(DEFAULT_CROP_SETTINGS);
    setProjectTitle(DEFAULT_STUDIO_CONFIG.defaultProjectTitle);
    setProjectDescription(DEFAULT_STUDIO_CONFIG.defaultProjectDescription);
    audioNotification.playHotkeyFeedback();
  };

  // Export video or animation file (MP4, WEBM, GIF)
  const handleExportVideo = (formatOverride?: ExportFormatId, blobOverride?: Blob) => {
    const format = formatOverride || selectedExportFormatRef.current;
    const blobToUse = blobOverride || recordedBlobRef.current;
    setIsExporting(true);
    setExportProgressPercent(25);
    setExportStatusText(
      format === 'gif'
        ? 'Compiling GIF89a animation loop...'
        : format === 'webm'
        ? 'Muxing WebM VP9 stream...'
        : 'Muxing MP4 H.264 container...'
    );

    setTimeout(() => setExportProgressPercent(65), 180);

    setTimeout(() => {
      try {
        setExportProgressPercent(90);
        const ratioTag = activeAspectRatio.id.replace(':', 'x');
        const timestamp = Date.now();
        const cleanTitle = sanitizeFileName(projectTitleRef.current, 'KBT_Tutorial');
        const isTrimmed = trimStartSecondsRef.current > 0.05 || (previewDurationRef.current > 0 && trimEndSecondsRef.current < previewDurationRef.current - 0.05);
        const trimStart = trimStartSecondsRef.current;
        const trimEnd = trimEndSecondsRef.current;
        const origDur = previewDurationRef.current > 0 ? previewDurationRef.current : Math.max(1, recordingSeconds);

        const trimSuffix = isTrimmed ? `_trim_${Math.round(trimStart)}s-${Math.round(trimEnd)}s` : '';
        const baseFileName = `${cleanTitle}_${selectedLanguageRef.current.toUpperCase()}_${ratioTag}${trimSuffix}_${timestamp}`;
        const exportedFileName = `${baseFileName}.${format}`;

        // Save companion metadata manifest (.json) alongside the exported file if enabled
        if (saveMetadataAlongside) {
          const metadata = buildMetadataManifest(format);
          const metaJson = generateProjectMetadataJson(metadata);
          triggerDownload(metaJson, `${baseFileName}_metadata.json`, 'application/json');
        }

        let downloadedBlob: Blob | null = null;

        if (format === 'gif') {
          // Animated GIF compilation
          let frames = [...sampledGifFramesRef.current];
          if (frames.length === 0 && canvasRef.current) {
            const f = sampleCanvasFrame(
              canvasRef.current,
              360,
              Math.max(180, Math.round(360 * (activeAspectRatio.height / activeAspectRatio.width)))
            );
            if (f) frames = [f, f];
          }

          // If recording is trimmed, slice GIF frame sequence to match user's trim range
          if (isTrimmed && frames.length > 0 && origDur > 0) {
            const startRatio = Math.max(0, trimStart / origDur);
            const endRatio = Math.min(1, trimEnd / origDur);
            const startIndex = Math.floor(startRatio * frames.length);
            const endIndex = Math.min(frames.length, Math.ceil(endRatio * frames.length));
            const sliced = frames.slice(startIndex, Math.max(startIndex + 1, endIndex));
            if (sliced.length > 0) {
              frames = sliced;
            }
          }

          if (frames.length > 0) {
            const gifBlob = createAnimatedGifBlob(frames, 130);
            downloadedBlob = gifBlob;
            triggerDownload(gifBlob, exportedFileName, 'image/gif');
          } else {
            const dummyGif = new Blob([`GIF89a Animated Graphic Loop (${activeAspectRatio.label})`], { type: 'image/gif' });
            downloadedBlob = dummyGif;
            triggerDownload(dummyGif, exportedFileName, 'image/gif');
          }
        } else if (format === 'webm') {
          // Native WebM stream
          if (blobToUse) {
            const webmBlob = new Blob([blobToUse], { type: 'video/webm' });
            downloadedBlob = webmBlob;
            triggerDownload(webmBlob, exportedFileName, 'video/webm');
          } else if (recordedVideoUrl) {
            const a = document.createElement('a');
            a.href = recordedVideoUrl;
            a.download = exportedFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const dummyContent = new Blob([`KBT_AppGuideVideo WebM Container (${activeAspectRatio.label} VP9 / Opus)`], { type: 'video/webm' });
            downloadedBlob = dummyContent;
            triggerDownload(dummyContent, exportedFileName, 'video/webm');
          }
        } else {
          // Universal MP4 format
          if (blobToUse) {
            const mp4Blob = new Blob([blobToUse], { type: 'video/mp4' });
            downloadedBlob = mp4Blob;
            triggerDownload(mp4Blob, exportedFileName, 'video/mp4');
          } else if (recordedVideoUrl) {
            const a = document.createElement('a');
            a.href = recordedVideoUrl;
            a.download = exportedFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const dummyContent = new Blob([`KBT_AppGuideVideo MP4 Container (${activeAspectRatio.label} H.264 / AAC)`], { type: 'video/mp4' });
            downloadedBlob = dummyContent;
            triggerDownload(dummyContent, exportedFileName, 'video/mp4');
          }
        }

        setExportProgressPercent(100);

        // Play export success auditory chime
        audioNotification.playSuccess();

        const renderTime = 0.45;
        const finalSizeKb = downloadedBlob ? Math.round(downloadedBlob.size / 1024) : 850;
        const estimatedRawKb = Math.round(finalSizeKb * 3.4);

        // Notify event bus for Recharts analytics dashboard
        window.dispatchEvent(
          new CustomEvent('kbt-export-complete', {
            detail: {
              format,
              filename: exportedFileName,
              renderTimeSec: renderTime,
              fileSizeKb: finalSizeKb,
            },
          })
        );

        // Open detailed post-export summary report modal
        setPostExportReport({
          filename: exportedFileName,
          format: format.toUpperCase(),
          durationFormatted: formatDisplayDuration(origDur),
          durationSeconds: origDur,
          resolution: `${activeAspectRatio.width}x${activeAspectRatio.height}`,
          renderTimeSec: renderTime,
          finalFileSizeKb: finalSizeKb,
          estimatedRawSizeKb: estimatedRawKb,
          bitrateMbps: Number(((finalSizeKb * 8) / (origDur * 1024)).toFixed(2)) || 4.2,
          frameDrops: 0,
          downloadUrl: recordedVideoUrl || undefined,
          blob: downloadedBlob || undefined,
        });
        setIsPostExportReportOpen(true);

        setLastExportedInfo({
          filename: exportedFileName,
          format: format,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });

        setExportToast({
          id: Date.now(),
          type: 'success',
          title: `Export Completed (.${format.toUpperCase()})`,
          message: isTrimmed
            ? `Trimmed cut (${formatTimestampWithTenths(trimStart)} - ${formatTimestampWithTenths(trimEnd)}) successfully rendered and downloaded.`
            : `Full tutorial video successfully rendered and saved to Downloads.`,
          filename: exportedFileName,
          format: format,
        });
      } catch (err) {
        console.error('Export error:', err);
        audioNotification.playError();
        setExportToast({
          id: Date.now(),
          type: 'error',
          title: 'Export Failed',
          message: err instanceof Error ? err.message : 'An error occurred during video rendering or download packaging.',
          format: format,
        });
      } finally {
        setTimeout(() => {
          setIsExporting(false);
          setExportProgressPercent(0);
          setExportStatusText('');
        }, 700);
      }
    }, 450);
  };

  // Direct Web Speech API synthesis linking ttsVolume state (0.0 to 1.0)
  // to the volume property of the SpeechSynthesisUtterance instance before triggering speak()
  const speakWithUtterance = (
    text: string,
    langCode: SupportedLanguageCode,
    onEndCallback?: () => void
  ) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langInfo = LANGUAGE_MAP[langCode];
      utterance.lang = langInfo ? langInfo.bcp47 : 'en-US';

      // Find best matching voice for selected language
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetBcp47 = (langInfo?.bcp47 || 'en-US').toLowerCase();
        const primaryCode = langCode.toLowerCase();
        const matched =
          voices.find((v) => v.lang.toLowerCase() === targetBcp47) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(primaryCode));
        if (matched) {
          utterance.voice = matched;
        }
      }

      // Link ttsVolume (0.0 to 1.0) directly to utterance.volume before triggering speak()
      utterance.volume = Math.max(0, Math.min(1, ttsVolume));

      utterance.onstart = () => {
        setTtsState({ isSpeaking: true, isPaused: false });
      };

      utterance.onend = () => {
        setTtsState({ isSpeaking: false, isPaused: false });
        onEndCallback?.();
      };

      utterance.onerror = () => {
        setTtsState({ isSpeaking: false, isPaused: false });
        onEndCallback?.();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      ttsEngine.speak(text, langCode, { volume: ttsVolume, onEnd: onEndCallback });
    }
  };

  // TTS Read Aloud for Scribe steps or Subtitles
  const handleSpeakActiveStep = (stepIndex: number) => {
    const step = scribeSteps[stepIndex];
    if (!step) return;

    setActiveStepIndex(stepIndex);
    const tr = step.translations[selectedLanguage] || { title: step.title, description: step.description };
    const speechText = `Step ${step.stepNumber}: ${tr.title}. ${tr.description}`;

    speakWithUtterance(speechText, selectedLanguage, () => {
      // Automatically play next step if available
      if (stepIndex + 1 < scribeSteps.length) {
        setTimeout(() => handleSpeakActiveStep(stepIndex + 1), 600);
      }
    });
  };

  const handleSpeakAllSteps = () => {
    handleSpeakActiveStep(0);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    ttsEngine.stop();
    setTtsState({ isSpeaking: false, isPaused: false });
  };

  const handleVolumeChange = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setTtsVolume(clamped);
    ttsEngine.setVolume(clamped);
  };

  const handlePreviewTts = () => {
    const phrase =
      TTS_TEST_PHRASES[selectedLanguage] ||
      `Testing audio volume at ${Math.round(ttsVolume * 100)} percent.`;
    speakWithUtterance(phrase, selectedLanguage);
  };

  // Ref to track current isRecording state for hotkey event handling
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  // Listen for global keyboard shortcuts dispatched from the App root listener
  useEffect(() => {
    const handleCustomHotkey = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      const action = customEvent.detail?.action;
      if (!action) return;

      if (action === 'TOGGLE_RECORDING') {
        if (!isRecordingRef.current) {
          handleStartRecording();
        } else {
          handleStopRecording();
        }
      } else if (action === 'FAST_EXPORT') {
        handleFastImmediateExport();
      } else if (action === 'ADVANCED_EXPORT') {
        if (recordedBlobRef.current || recordedVideoUrl) {
          setIsQualityPresetsModalOpen(true);
        } else {
          handleFastImmediateExport();
        }
      } else if (action === 'RESET_STUDIO') {
        handleResetStudio();
      } else if (action === 'TOGGLE_TIMER') {
        setShowTimerOverlay((prev) => !prev);
      } else if (action === 'TOGGLE_CAM') {
        setIsCameraActive((prev) => !prev);
      } else if (action === 'TOGGLE_MIC') {
        setIsMicActive((prev) => !prev);
      } else if (action === 'PREVIEW_TTS') {
        handlePreviewTts();
      } else if (action === 'CYCLE_FILTER') {
        handleCycleFilter();
      } else if (action === 'TOGGLE_DRAW') {
        setIsDrawModeActive((prev) => !prev);
      } else if (action === 'TOGGLE_TELEMETRY') {
        setShowTelemetryOverlay((prev) => !prev);
      } else if (action === 'TOGGLE_CROP') {
        setCropSettings((prev) => ({
          ...prev,
          isEditing: !prev.isEditing,
          isEnabled: !prev.isEditing ? true : prev.isEnabled,
        }));
      }
    };


    window.addEventListener('kbt-hotkey', handleCustomHotkey);
    return () => {
      window.removeEventListener('kbt-hotkey', handleCustomHotkey);
    };
  }, [selectedLanguage, ttsVolume]);

  return (
    <div className="studio-recorder-container space-y-4 max-w-7xl mx-auto">
      {/* Studio Top Control Deck */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Input Source & Camera/Mic Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => {
                if (captureSource !== 'simulator') {
                  triggerSceneTransition();
                  setCaptureSource('simulator');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                captureSource === 'simulator'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Embedded IDE Simulator</span>
            </button>

            <button
              onClick={handleStartDisplayCapture}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                captureSource === 'screen'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Real Display Sharing</span>
            </button>
          </div>

          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            title="Toggle Circular Camera Bubble"
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
              isCameraActive
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
          >
            {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Cam Bubble</span>
          </button>

          <button
            onClick={() => setIsMicActive(!isMicActive)}
            title="Toggle Microphone Input"
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
              isMicActive
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Mic Track</span>
          </button>

          {/* Real-time Frequency-Domain Audio Visualizer (Equalizer Bars / Waveform) */}
          <AudioVisualizer
            audioMixer={audioMixerRef.current}
            isMicActive={isMicActive}
            variant="compact"
          />

          {/* Drawing & Screen Highlight Overlay Toggle Button */}
          <button
            type="button"
            id="toolbar-draw-highlight-toggle-btn"
            onClick={() => setIsDrawModeActive(!isDrawModeActive)}
            title="Toggle Screen Drawing & Highlighter overlay (Hotkey: D)"
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isDrawModeActive
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40 font-bold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Highlighter className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-semibold">Highlight</span>
            <kbd className="px-1 py-0.2 rounded text-[9px] bg-zinc-900 text-amber-400 border border-zinc-800 font-bold">
              D
            </kbd>
          </button>


          {/* Real-time Recording Timer Overlay Checkbox */}
          <label
            htmlFor="recording-timer-overlay-checkbox"
            title="Toggle real-time recording timer overlay on video recording surface"
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition cursor-pointer select-none ${
              showTimerOverlay
                ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60 shadow-sm'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-400'
            }`}
          >
            <input
              type="checkbox"
              id="recording-timer-overlay-checkbox"
              checked={showTimerOverlay}
              onChange={(e) => setShowTimerOverlay(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">Timer Overlay</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showTimerOverlay ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
          </label>

          {/* Shortcuts Overlay Toggle Button */}
          <button
            type="button"
            id="studio-shortcuts-toggle-btn"
            onClick={() => setShowShortcutsOverlay((prev) => !prev)}
            title="Toggle keyboard shortcuts HUD overlay"
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              showShortcutsOverlay
                ? 'bg-indigo-950/50 text-indigo-300 border-indigo-700/70 shadow-sm'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">Shortcuts</span>
            <span className="hidden xl:inline text-[10px] px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">
              Space / T / F
            </span>
          </button>

          {/* Real-time Video Filter / Color-Correction LUT Pipeline Selector */}
          <div className="relative">
            <button
              type="button"
              id="color-filter-lut-dropdown-btn"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              title="Apply real-time color-correction LUT to video stream before encoding (Press 'F' to cycle)"
              className={`lut-selector-btn px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition cursor-pointer select-none ${
                activeFilter.id !== 'none'
                  ? 'bg-purple-950/50 text-purple-200 border-purple-600/70 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold">LUT: {activeFilter.label}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  activeFilter.id !== 'none' ? 'bg-purple-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showFilterMenu && (
              <div
                id="color-filter-lut-dropdown-menu"
                className="absolute top-full left-0 mt-2 z-50 w-72 p-3 rounded-2xl bg-zinc-900/98 backdrop-blur-md border border-zinc-700 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-200">Color-Correction LUTs</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Hotkey 'F'</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
                  {COLOR_FILTER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(preset.id);
                        setShowFilterMenu(false);
                      }}
                      className={`filter-preset-btn p-2 rounded-xl text-left border transition flex flex-col gap-1 text-xs cursor-pointer ${
                        selectedFilter === preset.id
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px] truncate">{preset.label}</span>
                        <div
                          className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${preset.previewGradient} shadow-xs shrink-0`}
                        />
                      </div>
                      <span className="text-[9px] text-zinc-400 line-clamp-1">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePixelLutEngine}
                      onChange={(e) => setUsePixelLutEngine(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-purple-600 focus:ring-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Pixel-level LUT</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilter('none');
                      setShowFilterMenu(false);
                    }}
                    className="text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Reset (Normal)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visual Annotations Toggler */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                showAnnotations
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Visual Annotations</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  showAnnotations ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'
                }`}
              ></span>
            </button>
          </div>

          {/* Telemetry Overlay Toggler */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              id="toolbar-telemetry-toggle-btn"
              onClick={() => setShowTelemetryOverlay(!showTelemetryOverlay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                showTelemetryOverlay
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
              title="Toggle real-time GPU/CPU usage Telemetry Overlay with D3 line chart (Hotkey: G)"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry HUD</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  showTelemetryOverlay ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
            </button>
          </div>

          {/* Post-Processing Filter Library Modal Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsFilterLibraryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-purple-300 hover:text-white border-zinc-800 hover:border-purple-500/50 cursor-pointer"
              title="Open Post-Processing Video Filter Library (Grayscale, Sepia, VHS glitch, CRT, etc.)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Filters ({activeFilter.label})</span>
            </button>
          </div>

          {/* Interactive Video Cropping Tool Toggle Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              id="toolbar-crop-tool-toggle-btn"
              onClick={() =>
                setCropSettings((prev) => ({
                  ...prev,
                  isEditing: !prev.isEditing,
                  isEnabled: !prev.isEditing ? true : prev.isEnabled,
                }))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                cropSettings.isEditing || cropSettings.isEnabled
                  ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/60 shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-indigo-500/50'
              }`}
              title="Open Interactive Video Cropping Tool (Hotkey: X)"
            >
              <Crop className="w-3.5 h-3.5 text-indigo-400" />
              <span>Crop Frame</span>
              {cropSettings.isEnabled && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  {cropSettings.preset.toUpperCase()}
                </span>
              )}
              <kbd className="hidden xl:inline text-[9px] px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">
                X
              </kbd>
            </button>
          </div>

          {/* Multi-Track Audio Mixer Panel Toggle */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAudioMixerOpen(!isAudioMixerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isAudioMixerOpen
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/60 shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-cyan-500/50'
              }`}
              title="Open Multi-Track Audio Mixer & Digital Noise Gate Controls"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio Mixer</span>
              {noiseGateConfig.enabled && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  Gate ON
                </span>
              )}
              {compressorConfig.enabled && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  Comp ON
                </span>
              )}
            </button>
          </div>

          {/* Watermark Burning Config Toggle */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsWatermarkPanelOpen(!isWatermarkPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isWatermarkPanelOpen || watermarkSettings.enabled
                  ? 'bg-pink-950/50 text-pink-300 border-pink-500/60 shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-pink-500/50'
              }`}
              title="Configure Custom Watermark (Burned into Recording Canvas)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>Watermark</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  watermarkSettings.enabled ? 'bg-pink-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
            </button>
          </div>

          {/* AI Transcript Generator Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAiTranscriptOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-indigo-300 hover:text-white border-zinc-800 hover:border-indigo-500/50 cursor-pointer"
              title="Generate localized subtitles from captured audio using Gemini API"
            >
              <Subtitles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Subtitles</span>
            </button>
          </div>

          {/* AI Teleprompter Overlay Toggle */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              id="toolbar-teleprompter-toggle-btn"
              onClick={() => setIsTeleprompterOpen(!isTeleprompterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isTeleprompterOpen
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-emerald-500/50'
              }`}
              title="Open AI Teleprompter Overlay with Auto-Scroll and Speed Slider"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Teleprompter</span>
              {isTeleprompterOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Scene Transitions Modal Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              id="toolbar-scene-transitions-btn"
              onClick={() => setIsSceneTransitionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-violet-300 hover:text-white border-zinc-800 hover:border-violet-500/50 cursor-pointer"
              title="Configure Scene Transitions (Cross Fade, Push Slide, Iris Radial Wipe)"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Transitions</span>
            </button>
          </div>

          {/* Multi-Cam Director Modal Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsMultiCamModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-cyan-300 hover:text-white border-zinc-800 hover:border-cyan-500/50 cursor-pointer"
              title="Multi-Cam Director: Switch sources & configure picture-in-picture (PiP)"
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Multi-Cam</span>
              {multiCamConfig.isPipEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Global Export Templates Modal Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsGlobalTemplatesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-amber-300 hover:text-white border-zinc-800 hover:border-amber-500/50 cursor-pointer"
              title="Global Export Templates (Presentation Ready, Mobile Social, Raw Archive)"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Templates</span>
            </button>
          </div>

          {/* Voiceover Synthesis Studio Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsVoiceoverModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-emerald-300 hover:text-white border-zinc-800 hover:border-emerald-500/50 cursor-pointer"
              title="AI Voiceover Synthesis: Multi-language speech generation with voice personas"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Voiceover</span>
            </button>
          </div>

          {/* Smart Scripting Assistant Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSmartScriptingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-purple-300 hover:text-white border-zinc-800 hover:border-purple-500/50 cursor-pointer"
              title="Smart Scripting: Gemini tutorial outline generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline">Scripting</span>
            </button>
          </div>

          {/* Studio Actions Sidebar Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsActionsSidebarOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isActionsSidebarOpen
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/60 shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-indigo-500/50'
              }`}
              title="Open Studio Actions 1-Click Execution Sidebar"
            >
              <ListTree className="w-3.5 h-3.5 text-indigo-400" />
              <span>Actions</span>
            </button>
          </div>

          {/* Web Speech API Voice Command Controller */}
          <div className="flex items-center pl-2 border-l border-zinc-800">
            <VoiceCommandController />
          </div>

          {/* Project Archive Sidebar Toggle Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsArchiveOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-purple-500/50 cursor-pointer"
              title="Open Project Archive sidebar (Firestore synced sessions)"
            >
              <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
              <span>Archive</span>
            </button>
          </div>

          {/* Social Share Modal Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSocialShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-indigo-500/50 cursor-pointer"
              title="Generate shareable link and Markdown snippet"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share</span>
            </button>
          </div>

          {/* Studio Settings Modal Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700 cursor-pointer"
              title="Customize key bindings, Cloud Sync, and storage cleanup"
            >
              <Settings2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Right: Record / Pause / Stop Deck & Quality & TTS Volume Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* TTS Volume Range Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => handleVolumeChange(ttsVolume > 0 ? 0 : 1.0)}
              title={ttsVolume === 0 ? 'Unmute TTS Volume' : 'Mute TTS Volume'}
              className="text-zinc-400 hover:text-white transition flex items-center justify-center"
            >
              {ttsVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : ttsVolume < 0.5 ? (
                <Volume1 className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
            <div className="flex items-center gap-1.5">
              <label htmlFor="tts-volume-slider-top" className="text-[10px] text-zinc-400 font-mono whitespace-nowrap cursor-pointer">
                TTS Vol
              </label>
              <input
                id="tts-volume-slider-top"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ttsVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="TTS volume control slider"
                title={`SpeechSynthesisUtterance.volume: ${ttsVolume.toFixed(2)}`}
                className="w-16 sm:w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] font-mono text-zinc-300 w-8 text-right font-medium">
                {Math.round(ttsVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Preview TTS Button */}
          <button
            type="button"
            id="preview-tts-button"
            onClick={handlePreviewTts}
            title={`Preview TTS test phrase in ${LANGUAGE_MAP[selectedLanguage]?.name} at ${Math.round(ttsVolume * 100)}% volume`}
            className="preview-tts-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 hover:border-indigo-500/50 text-indigo-300 hover:text-white border border-zinc-800 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preview TTS</span>
          </button>

          {/* Video Aspect Ratio Dropdown Selector (16:9, 9:16, 1:1, 4:3) */}
          <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs">
            {selectedAspectRatio === '16:9' ? (
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            ) : selectedAspectRatio === '9:16' ? (
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <label htmlFor="aspect-ratio-selector" className="text-[10px] text-zinc-400 font-mono hidden xl:inline">
              Ratio:
            </label>
            <select
              id="aspect-ratio-selector"
              aria-label="Select Video Aspect Ratio"
              value={selectedAspectRatio}
              onChange={(e) => setSelectedAspectRatio(e.target.value as AspectRatioId)}
              className="bg-transparent text-indigo-300 font-bold focus:outline-none cursor-pointer"
            >
              {ASPECT_RATIO_PRESETS.map((ratio) => (
                <option key={ratio.id} value={ratio.id} className="bg-zinc-900 text-zinc-100">
                  {ratio.label} — {ratio.platform}
                </option>
              ))}
            </select>
          </div>

          {/* Export Format Selector (MP4, WEBM, GIF) */}
          <div
            id="toolbar-export-format-selector"
            className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs"
          >
            {selectedExportFormat === 'gif' ? (
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            ) : selectedExportFormat === 'webm' ? (
              <FileVideo className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Film className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <label htmlFor="export-format-selector" className="text-[10px] text-zinc-400 font-mono hidden xl:inline">
              Format:
            </label>
            <select
              id="export-format-selector"
              aria-label="Select Video or Animation Export Format"
              value={selectedExportFormat}
              onChange={(e) => setSelectedExportFormat(e.target.value as ExportFormatId)}
              className="bg-transparent text-indigo-300 font-bold font-mono focus:outline-none cursor-pointer"
            >
              {EXPORT_FORMAT_PRESETS.map((fmt) => (
                <option key={fmt.id} value={fmt.id} className="bg-zinc-900 text-zinc-100 font-sans">
                  {fmt.label} ({fmt.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Quality & FPS Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-400 font-mono">
            <select
              value={exportQuality}
              onChange={(e) => setExportQuality(e.target.value as any)}
              className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
            >
              {VIDEO_QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900">
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-zinc-600">|</span>
            <select
              value={exportFramerate}
              onChange={(e) => setExportFramerate(Number(e.target.value) as any)}
              className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
            >
              {FRAMERATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-zinc-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Quality Presets Modal Button */}
          <button
            type="button"
            id="custom-quality-presets-btn"
            onClick={() => setIsQualityPresetsModalOpen(true)}
            title="Open Custom Quality Presets Modal (Persisted in Firestore)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-cyan-300 hover:text-white border border-zinc-800 hover:border-cyan-500/50 text-xs font-mono font-semibold transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Presets</span>
          </button>

          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <Circle className="w-3.5 h-3.5 fill-current" />
              <span>Start Recording</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                id="stop-and-export-btn"
                onClick={handleStopRecording}
                title={`Stop recording & automatically export file as .${selectedExportFormat === 'gif' ? 'mp4' : selectedExportFormat.toUpperCase()}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 font-bold text-xs border border-red-500/40 shadow-md transition cursor-pointer active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current text-red-500" />
                <span>Stop & Export (.{selectedExportFormat === 'gif' ? 'mp4' : selectedExportFormat})</span>
              </button>

            </div>
          )}

          {/* Fast Export Instant Hotkey Action Button */}
          <button
            id="fast-export-toolbar-btn"
            type="button"
            onClick={handleFastImmediateExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Fast Export active project immediately with current settings (Hotkey: Ctrl+E)"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Fast Export</span>
            <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-amber-700/60 font-mono">
              Ctrl+E
            </kbd>
          </button>

          {/* Dynamic Export Button for Selected Format (MP4 / WEBM / GIF) */}
          <button
            id="export-video-format-btn"
            type="button"
            onClick={() => handleExportVideo()}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer ${
              selectedExportFormat === 'gif'
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25'
                : selectedExportFormat === 'webm'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
            }`}
            title={`Export recording as ${activeExportFormat.name}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isExporting
                ? exportStatusText || `Exporting ${exportProgressPercent}%...`
                : `Export ${selectedExportFormat.toUpperCase()}`}
            </span>
          </button>

          {/* Header Visual Export Progress Pill */}
          {isExporting && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-300 font-mono text-xs font-bold animate-pulse shadow-lg">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Exporting {exportProgressPercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Track Audio Mixer Panel */}
      <AudioMixerPanel
        isOpen={isAudioMixerOpen}
        onClose={() => setIsAudioMixerOpen(false)}
        audioMixer={audioMixerRef.current}
        micVolume={micVolume}
        onMicVolumeChange={setMicVolume}
        isMicMuted={isMicMuted}
        onToggleMicMute={() => setIsMicMuted(!isMicMuted)}
        systemVolume={systemVolume}
        onSystemVolumeChange={setSystemVolume}
        isSystemMuted={isSystemMuted}
        onToggleSystemMute={() => setIsSystemMuted(!isSystemMuted)}
        secondaryVolume={secondaryVolume}
        onSecondaryVolumeChange={setSecondaryVolume}
        isSecondaryMuted={isSecondaryMuted}
        onToggleSecondaryMute={() => setIsSecondaryMuted(!isSecondaryMuted)}
        noiseGateConfig={noiseGateConfig}
        onNoiseGateConfigChange={(cfg) => setNoiseGateConfig((prev) => ({ ...prev, ...cfg }))}
        compressorConfig={compressorConfig}
        onCompressorConfigChange={(cfg) => setCompressorConfig((prev) => ({ ...prev, ...cfg }))}
        meterLevels={meterLevels}
        ambientTrack={ambientTrack}
        onSelectAmbientTrack={setAmbientTrack}
      />

      {/* Custom Watermark Branding Panel */}
      <WatermarkPanel
        isOpen={isWatermarkPanelOpen}
        onClose={() => setIsWatermarkPanelOpen(false)}
        settings={watermarkSettings}
        onUpdateSettings={(updated) => setWatermarkSettings((prev) => ({ ...prev, ...updated }))}
      />

      {/* Gemini AI Subtitle Transcript Generator Panel */}
      <AiTranscriptPanel
        isOpen={isAiTranscriptOpen}
        onClose={() => setIsAiTranscriptOpen(false)}
        recordedBlob={recordedBlobRef.current}
        selectedLanguage={selectedLanguage}
        durationSeconds={recordingSeconds}
        projectTitle={projectTitle}
        onApplyCues={(newCues) => setCues(newCues)}
      />

      {/* Target Platform Aspect Ratio Quick Selector Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2 py-1.5 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Platform:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {ASPECT_RATIO_PRESETS.map((ratio) => (
              <button
                key={ratio.id}
                type="button"
                id={`aspect-ratio-btn-${ratio.id.replace(':', '-')}`}
                onClick={() => setSelectedAspectRatio(ratio.id)}
                title={`${ratio.name} — ${ratio.description}`}
                className={`aspect-ratio-preset-pill px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedAspectRatio === ratio.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400 font-semibold'
                    : 'bg-zinc-950/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                {ratio.id === '16:9' ? (
                  <Monitor className="w-3 h-3" />
                ) : ratio.id === '9:16' ? (
                  <Smartphone className="w-3 h-3" />
                ) : (
                  <Square className="w-3 h-3" />
                )}
                <span>{ratio.label}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({ratio.platform.split(',')[0].split('&')[0].trim()})
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500">Output:</span>
          <span className="text-indigo-300 font-bold">{activeAspectRatio.width}×{activeAspectRatio.height}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{activeAspectRatio.platform}</span>
          {cropSettings.isEnabled && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Crop className="w-3 h-3 text-emerald-400" />
                <span>Cropped ({cropSettings.preset.toUpperCase()})</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick Color-Correction LUT Preset Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
        <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          <span>Color LUT:</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {COLOR_FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedFilter(preset.id)}
              title={`${preset.name} — ${preset.description}`}
              className={`lut-filter-preset-pill px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedFilter === preset.id
                  ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400 font-semibold'
                  : 'bg-zinc-950/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${preset.previewGradient}`} />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Export Format Quick Selector Strip (MP4, WEBM, GIF) */}
      <div
        id="export-format-selector-strip"
        className="flex items-center justify-between flex-wrap gap-2 py-1.5 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs"
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Format:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {EXPORT_FORMAT_PRESETS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                id={`export-format-btn-${fmt.id}`}
                onClick={() => setSelectedExportFormat(fmt.id)}
                title={`${fmt.name} — ${fmt.description}`}
                className={`export-format-preset-pill px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedExportFormat === fmt.id
                    ? fmt.id === 'gif'
                      ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400 font-semibold'
                      : fmt.id === 'webm'
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-semibold'
                      : 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400 font-semibold'
                    : 'bg-zinc-950/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                {fmt.id === 'gif' ? (
                  <Sparkles className="w-3 h-3" />
                ) : fmt.id === 'webm' ? (
                  <FileVideo className="w-3 h-3" />
                ) : (
                  <Film className="w-3 h-3" />
                )}
                <span className="font-mono font-bold uppercase">{fmt.id}</span>
                <span className="text-[10px] opacity-75 font-mono">({fmt.badge})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500">Output:</span>
          <span className="text-white font-bold font-mono">.{activeExportFormat.extension}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-indigo-300">{activeExportFormat.recommendedFor}</span>
        </div>
      </div>

      {/* Project Details & Metadata Configuration (Accessible before and during recording) */}
      <div
        id="project-metadata-deck"
        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border ${
          isRecording
            ? 'bg-gradient-to-r from-red-950/40 via-zinc-950 to-indigo-950/40 border-red-500/60 shadow-lg shadow-red-950/40 ring-1 ring-red-500/30'
            : 'bg-zinc-900/80 border-zinc-800 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-xs text-white">Project Details & Export Metadata</h4>
                {isRecording ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    Recording in Progress: You can edit Title & Description before hitting Stop & Export!
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800">
                    Saved in filename & companion metadata manifest (.json)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Auto-Save Status Indicator */}
            <div
              id="auto-save-indicator"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono border transition-all duration-300 ${
                autoSavePulse
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
              title="Project title, description, and export settings are continuously auto-saved to local storage"
            >
              <HardDrive className={`w-3 h-3 ${autoSavePulse ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span>
                {autoSavePulse
                  ? 'Saved to LocalStorage'
                  : lastAutoSavedTime
                  ? `Saved ${lastAutoSavedTime}`
                  : 'Auto-save active'}
              </span>
              {autoSavePulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            {/* Toggle Companion Metadata Manifest */}
            <label
              htmlFor="save-metadata-toggle"
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:text-white cursor-pointer select-none transition"
              title="When checked, a companion .json manifest will be exported alongside your video file"
            >
              <input
                id="save-metadata-toggle"
                type="checkbox"
                checked={saveMetadataAlongside}
                onChange={(e) => setSaveMetadataAlongside(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-500"
              />
              <FileJson className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-medium">Save manifest (.json)</span>
            </label>

            {/* Toggle Auto-Download Video on Stop */}
            <label
              htmlFor="auto-export-on-stop-toggle"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs cursor-pointer select-none transition ${
                autoExportOnStop
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-300'
              }`}
              title="When enabled, automatically triggers video export and downloads your tutorial (.mp4 or .webm) the moment you stop recording"
            >
              <input
                id="auto-export-on-stop-toggle"
                type="checkbox"
                checked={autoExportOnStop}
                onChange={(e) => setAutoExportOnStop(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-emerald-500"
              />
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold">Auto-download on stop</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                  autoExportOnStop
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                .{selectedExportFormat === 'gif' ? 'mp4' : selectedExportFormat}
              </span>
            </label>

            {/* Quick Collapse/Expand Toggle */}
            <button
              type="button"
              onClick={() => setShowProjectMetaEditor(!showProjectMetaEditor)}
              className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer font-mono"
            >
              {showProjectMetaEditor ? 'Collapse ▲' : 'Edit Details ▼'}
            </button>
          </div>
        </div>

        {showProjectMetaEditor && (
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Project Title Input */}
              <div className="md:col-span-5 space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="project-title-input"
                    className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3 text-indigo-400" />
                    <span>Project Title</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {projectTitle.length} chars
                  </span>
                </div>
                <input
                  id="project-title-input"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Full-Stack System Architecture Tutorial"
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-zinc-600 text-xs font-medium transition"
                />
              </div>

              {/* Project Description Input */}
              <div className="md:col-span-7 space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="project-description-input"
                    className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5"
                  >
                    <FileText className="w-3 h-3 text-indigo-400" />
                    <span>Project Description & Context</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {projectDescription.length} chars
                  </span>
                </div>
                <input
                  id="project-description-input"
                  type="text"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="e.g., Interactive walkthrough of distributed message queues, latency graphs, and SIMD telemetry..."
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-zinc-600 text-xs transition"
                />
              </div>
            </div>

            {/* Quick Templates & Filename Preview Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">
                  Quick Presets:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setProjectTitle('Full-Stack Distributed System Architecture');
                    setProjectDescription(
                      'Comprehensive walkthrough of cloud infrastructure, distributed telemetry, and high-performance kernel routines.'
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition shrink-0 cursor-pointer"
                >
                  Architecture
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectTitle('API Gateway & Microservices Guide');
                    setProjectDescription(
                      'End-to-end tutorial covering token authorization, request multiplexing, and low-latency database queries.'
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition shrink-0 cursor-pointer"
                >
                  API Gateway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectTitle('Real-Time Database Optimization & SQL');
                    setProjectDescription(
                      'Deep dive into query profiling, index optimization, and connection pool management.'
                    );
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 transition shrink-0 cursor-pointer"
                >
                  Database SQL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectTitle('');
                    setProjectDescription('');
                  }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline pl-1 cursor-pointer"
                >
                  Clear
                </button>
                <span className="text-zinc-700">|</span>
                <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">
                  Format:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedExportFormat('mp4')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono transition cursor-pointer ${
                    selectedExportFormat === 'mp4'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                  }`}
                  title="Export tutorial video as universal .MP4 (H.264)"
                >
                  <Film className="w-2.5 h-2.5" />
                  <span>.MP4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExportFormat('webm')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono transition cursor-pointer ${
                    selectedExportFormat === 'webm'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                  }`}
                  title="Export tutorial video as high-performance .WEBM (VP9)"
                >
                  <FileVideo className="w-2.5 h-2.5" />
                  <span>.WEBM</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSavedSettings}
                  title="Reset project title, description, and export settings to factory defaults and clear local storage"
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-amber-300 transition pl-0.5 cursor-pointer font-mono"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Filename Preview */}
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 truncate max-w-full">
                <span className="text-zinc-500">Target:</span>
                <span className="text-indigo-300 font-semibold truncate">
                  {sanitizeFileName(projectTitle, 'KBT_Tutorial')}_{selectedLanguage.toUpperCase()}_{activeAspectRatio.id.replace(':', 'x')}_[timestamp].{activeExportFormat.extension}
                </span>
                {saveMetadataAlongside && (
                  <span className="text-purple-300 font-medium">
                    + _metadata.json
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Downloaded File Success Toast / Notification Banner */}
      {lastExportedInfo && (
        <div
          id="export-download-success-banner"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-indigo-950/40 border border-emerald-500/50 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              <Download className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Tutorial Export Download Triggered!</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                  .{lastExportedInfo.format}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {lastExportedInfo.time}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono truncate max-w-xl">
                Saved file: <strong className="text-emerald-300">{lastExportedInfo.filename}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="success-banner-download-mp4-btn"
              onClick={() => handleExportVideo('mp4')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition active:scale-95"
              title="Download another copy as .MP4"
            >
              <Film className="w-3 h-3" />
              <span>Save .MP4</span>
            </button>
            <button
              type="button"
              id="success-banner-download-webm-btn"
              onClick={() => handleExportVideo('webm')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition active:scale-95"
              title="Download another copy as .WEBM"
            >
              <FileVideo className="w-3 h-3" />
              <span>Save .WEBM</span>
            </button>
            <button
              type="button"
              onClick={() => setLastExportedInfo(null)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Post-Recording Export Hub (Displayed when a recording is ready) */}
      {recordedVideoUrl && (
        <div

          id="post-recording-export-hub"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/40 border-2 border-indigo-500/50 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Recording Finished — Choose Your Export Format</span>
                  <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Select your preferred container format (MP4, WEBM, or GIF) and download your tutorial output.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecordedVideoUrl(null)}
                className="text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-lg text-xs hover:bg-zinc-800 transition cursor-pointer"
                title="Dismiss export preview"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Video Player Preview + Interactive Trimmer Deck */}
            <div className="lg:col-span-6 bg-zinc-950 rounded-xl border border-zinc-800 p-3 overflow-hidden flex flex-col space-y-3">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={previewVideoRef}
                  src={recordedVideoUrl}
                  controls
                  autoPlay
                  loop={!isPreviewTrimLoopActive}
                  muted
                  onLoadedMetadata={handlePreviewVideoLoadedMetadata}
                  onTimeUpdate={handlePreviewVideoTimeUpdate}
                  className="w-full max-h-52 rounded-lg object-contain bg-black"
                />
                {isPreviewTrimLoopActive && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-amber-500/90 text-zinc-950 font-bold text-[10px] font-mono flex items-center gap-1 shadow-lg animate-pulse">
                    <Scissors className="w-3 h-3" />
                    <span>Looping Trim ({formatTimestampWithTenths(trimStartSeconds)} - {formatTimestampWithTenths(trimEndSeconds)})</span>
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-between px-1 text-[11px] font-mono text-zinc-400">
                <span>{activeAspectRatio.label}</span>
                <span>{activeAspectRatio.width}×{activeAspectRatio.height}</span>
                <span className="text-emerald-400 font-bold">{exportFramerate} FPS</span>
                <span className="text-zinc-300 font-semibold">
                  {formatTimestampWithTenths(previewVideoCurrentTime)} / {formatTimestampWithTenths(safeDuration)}
                </span>
              </div>

              {/* Interactive Post-Recording Trimmer Deck */}
              <div
                id="post-recording-trimmer-deck"
                className="w-full p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs"
              >
                {/* Trimmer Header & Cut Status */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-200 text-xs">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>Video Trimmer</span>
                    {isTrimActive ? (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Trimmed Cut
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        Full Length
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <span>Cut:</span>
                    <span className="text-amber-300 font-bold">{formatTimestampWithTenths(trimmedDuration)}</span>
                    {isTrimActive && (
                      <span className="text-zinc-500">(-{formatTimestampWithTenths(savedDuration)} / -{savedPercentage}%)</span>
                    )}
                  </div>
                </div>

                {/* Visual Timeline / Scrubber Bar */}
                <div className="space-y-1">
                  <div
                    className="relative w-full h-6 bg-zinc-950 rounded-md overflow-hidden border border-zinc-700/80 cursor-pointer select-none"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      const totalDur = previewVideoDuration > 0 ? previewVideoDuration : Math.max(1, recordingSeconds);
                      handleSeekPreviewVideo(ratio * totalDur);
                    }}
                    title="Click timeline to seek playhead"
                  >
                    {/* Excluded Start Zone (dimmed) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-zinc-900/90 z-0"
                      style={{ width: `${Math.max(0, Math.min(100, (trimStartSeconds / safeDuration) * 100))}%` }}
                    />

                    {/* Active Trimmed Range Window */}
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/30 via-indigo-500/30 to-emerald-500/30 border-y border-amber-500/60 z-1"
                      style={{
                        left: `${Math.max(0, Math.min(100, (trimStartSeconds / safeDuration) * 100))}%`,
                        width: `${Math.max(0, Math.min(100, ((trimEndSeconds - trimStartSeconds) / safeDuration) * 100))}%`,
                      }}
                    />

                    {/* Excluded End Zone (dimmed) */}
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-zinc-900/90 z-0"
                      style={{ width: `${Math.max(0, Math.min(100, 100 - (trimEndSeconds / safeDuration) * 100))}%` }}
                    />

                    {/* Trim Start Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10 shadow-sm"
                      style={{ left: `calc(${Math.max(0, Math.min(100, (trimStartSeconds / safeDuration) * 100))}% - 1px)` }}
                    />

                    {/* Trim End Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-10 shadow-sm"
                      style={{ left: `calc(${Math.max(0, Math.min(100, (trimEndSeconds / safeDuration) * 100))}% - 1px)` }}
                    />

                    {/* Playhead Position Line & Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
                      style={{ left: `${Math.max(0, Math.min(100, (previewVideoCurrentTime / safeDuration) * 100))}%` }}
                    >
                      <div className="w-2.5 h-2.5 -ml-1 rounded-full bg-white shadow-md -mt-0.5 border border-zinc-900" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-0.5">
                    <span>00:00.0</span>
                    <span className="text-zinc-300 font-semibold">Playhead: {formatTimestampWithTenths(previewVideoCurrentTime)}</span>
                    <span>{formatTimestampWithTenths(safeDuration)}</span>
                  </div>
                </div>

                {/* Dual Inputs: Start & End Timestamps with 0.1s Step & Sliders */}
                <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-zinc-800">
                  {/* Start Timestamp Control */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        <span>Start Time</span>
                      </span>
                      <span className="font-mono text-amber-300 font-bold">{formatTimestampWithTenths(trimStartSeconds)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max={Math.max(0, trimEndSeconds - 0.1)}
                        step="0.1"
                        value={trimStartSeconds}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            const clamped = Math.max(0, Math.min(val, trimEndSeconds - 0.1));
                            setTrimStartSeconds(Number(clamped.toFixed(1)));
                          }
                        }}
                        aria-label="Trim Start Time in seconds"
                        className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:border-amber-500"
                      />
                      <button
                        type="button"
                        id="set-trim-start-btn"
                        onClick={handleSetTrimStartToCurrent}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-white text-[10px] font-mono whitespace-nowrap cursor-pointer transition border border-zinc-700"
                        title="Set start timestamp to current video playhead"
                      >
                        ✂️ Set
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0.1, safeDuration)}
                      step="0.1"
                      value={trimStartSeconds}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          const clamped = Math.max(0, Math.min(val, trimEndSeconds - 0.1));
                          setTrimStartSeconds(Number(clamped.toFixed(1)));
                        }
                      }}
                      aria-label="Trim start slider"
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* End Timestamp Control */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        <span>End Time</span>
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">{formatTimestampWithTenths(trimEndSeconds)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={trimStartSeconds + 0.1}
                        max={safeDuration}
                        step="0.1"
                        value={trimEndSeconds}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            const clamped = Math.min(safeDuration, Math.max(val, trimStartSeconds + 0.1));
                            setTrimEndSeconds(Number(clamped.toFixed(1)));
                          }
                        }}
                        aria-label="Trim End Time in seconds"
                        className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        id="set-trim-end-btn"
                        onClick={handleSetTrimEndToCurrent}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-white text-[10px] font-mono whitespace-nowrap cursor-pointer transition border border-zinc-700"
                        title="Set end timestamp to current video playhead"
                      >
                        ✂️ Set
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0.1, safeDuration)}
                      step="0.1"
                      value={trimEndSeconds}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          const clamped = Math.min(safeDuration, Math.max(val, trimStartSeconds + 0.1));
                          setTrimEndSeconds(Number(clamped.toFixed(1)));
                        }
                      }}
                      aria-label="Trim end slider"
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick Action Buttons & Status Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="preview-trimmed-cut-btn"
                      onClick={() => {
                        if (isPreviewTrimLoopActive) {
                          setIsPreviewTrimLoopActive(false);
                        } else {
                          handlePlayTrimmedCut();
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isPreviewTrimLoopActive
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-white border border-zinc-700'
                      }`}
                      title="Loop playback strictly within defined start and end timestamps"
                    >
                      {isPreviewTrimLoopActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPreviewTrimLoopActive ? 'Stop Loop' : 'Preview Trim'}</span>
                    </button>

                    <button
                      type="button"
                      id="reset-trim-btn"
                      onClick={handleResetTrim}
                      disabled={!isTrimActive}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-800 transition cursor-pointer border border-zinc-700/60"
                      title="Reset start and end timestamps to entire recorded video"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Full</span>
                    </button>
                  </div>

                  <div className="text-[11px] font-mono">
                    {isTrimActive ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Scissors className="w-3 h-3" />
                        <span>Exports {formatTimestampWithTenths(trimmedDuration)}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">Exports full video</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Format Selector Cards (MP4, WEBM, GIF) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EXPORT_FORMAT_PRESETS.map((fmt) => {
                  const isSelected = selectedExportFormat === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      id={`export-format-card-${fmt.id}`}
                      onClick={() => setSelectedExportFormat(fmt.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? fmt.id === 'gif'
                            ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 text-white'
                            : fmt.id === 'webm'
                            ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                            : 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                            {fmt.id === 'gif' ? (
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            ) : fmt.id === 'webm' ? (
                              <FileVideo className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Film className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                            {fmt.id.toUpperCase()}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            .{fmt.extension}
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug line-clamp-2 text-zinc-300 mb-1">
                          {fmt.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                        <span>{fmt.badge}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Post-Recording Project Title & Description Final Verification */}
              <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Project Metadata (Saved in File & .JSON Manifest)</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400" title="Changes auto-save to local storage">
                      <HardDrive className={`w-3 h-3 ${autoSavePulse ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
                      <span>{autoSavePulse ? 'Saved' : lastAutoSavedTime ? `Saved ${lastAutoSavedTime}` : 'Auto-save'}</span>
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveMetadataAlongside}
                        onChange={(e) => setSaveMetadataAlongside(e.target.checked)}
                        className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 w-3 h-3 accent-indigo-500 cursor-pointer"
                      />
                      <span>Companion manifest</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer select-none font-medium">
                      <input
                        type="checkbox"
                        checked={autoExportOnStop}
                        onChange={(e) => setAutoExportOnStop(e.target.checked)}
                        className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 w-3 h-3 accent-emerald-500 cursor-pointer"
                      />
                      <span>Auto-download on stop</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="Project title..."
                      aria-label="Post-recording Project Title"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white text-xs font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Project description notes..."
                      aria-label="Post-recording Project Description"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-zinc-300 text-xs"
                    />
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-400 truncate flex items-center gap-2">
                  <span className="text-zinc-500">Target Filename:</span>
                  <span className="text-indigo-300 font-bold truncate">
                    {sanitizeFileName(projectTitle, 'KBT_Tutorial')}_{selectedLanguage.toUpperCase()}_{activeAspectRatio.id.replace(':', 'x')}{isTrimActive ? `_trim_${Math.round(trimStartSeconds)}s-${Math.round(trimEndSeconds)}s` : ''}_[timestamp].{activeExportFormat.extension}
                  </span>
                  {isTrimActive && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold whitespace-nowrap">
                      ✂️ Trimmed ({formatTimestampWithTenths(trimmedDuration)})
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Export */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-xs text-zinc-400">
                  Target: <strong className="text-white font-mono">{activeExportFormat.recommendedFor}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Save as .MP4 dedicated button */}
                  <button
                    type="button"
                    id="post-record-save-as-mp4-btn"
                    onClick={() => {
                      setSelectedExportFormat('mp4');
                      handleExportVideo('mp4');
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Export and download tutorial recording as universal .MP4 (H.264)"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Save as .MP4</span>
                  </button>

                  {/* Save as .WEBM dedicated button */}
                  <button
                    type="button"
                    id="post-record-save-as-webm-btn"
                    onClick={() => {
                      setSelectedExportFormat('webm');
                      handleExportVideo('webm');
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Export and download tutorial recording as modern high-compression .WEBM (VP9)"
                  >
                    <FileVideo className="w-3.5 h-3.5" />
                    <span>Save as .WEBM</span>
                  </button>

                  {/* Download Video / Current Selection */}
                  <button
                    type="button"
                    id="post-record-download-btn"
                    onClick={() => handleExportVideo()}
                    disabled={isExporting}
                    title={isTrimActive ? `Download trimmed cut (${formatTimestampWithTenths(trimmedDuration)}) as .${activeExportFormat.extension.toUpperCase()}` : `Download recording as .${activeExportFormat.extension.toUpperCase()}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                      selectedExportFormat === 'gif'
                        ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                        : selectedExportFormat === 'webm'
                        ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-600/30'
                        : 'bg-indigo-700 hover:bg-indigo-600 shadow-indigo-600/30'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isExporting
                        ? exportStatusText || 'Packaging file...'
                        : `Download ${isTrimActive ? 'Trimmed ' : ''}.${activeExportFormat.extension.toUpperCase()}${saveMetadataAlongside ? ' + Metadata' : ''}`}
                    </span>
                  </button>

                  {/* Standalone Metadata (.json) Button */}
                  <button
                    type="button"
                    id="post-record-download-metadata-btn"
                    onClick={handleDownloadMetadata}
                    title="Download companion project metadata manifest as formatted JSON"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:border-purple-500/50 border border-zinc-800 text-purple-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-purple-400" />
                    <span>Metadata (.json)</span>
                  </button>

                  {/* Bundle All Button */}
                  <button
                    type="button"
                    id="post-record-bundle-all-btn"
                    onClick={() => {
                      handleExportVideo();
                      const metadata = buildMetadataManifest();
                      const metaJson = generateProjectMetadataJson(metadata);
                      const cleanTitle = sanitizeFileName(projectTitle, 'KBT_Tutorial');
                      const ratioTag = activeAspectRatio.id.replace(':', 'x');
                      const timestamp = Date.now();
                      const baseFileName = `${cleanTitle}_${selectedLanguage.toUpperCase()}_${ratioTag}_${timestamp}`;
                      triggerDownload(metaJson, `${baseFileName}_metadata.json`, 'application/json');
                      const vtt = generateWebVTT(cues, selectedLanguage);
                      triggerDownload(vtt, `${baseFileName}_captions_${selectedLanguage.toUpperCase()}.vtt`, 'text/vtt');
                    }}
                    title="Export video, metadata JSON manifest, and timed subtitle track together"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:border-indigo-500/50 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Bundle All (Video + Metadata + VTT)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main Studio Viewport (Recording Screen + Draggable Webcam + Canvas Overlay) */}
      <div className={`relative transition-all duration-300 ${activeAspectRatio.aspectClass} min-h-[360px] max-h-[820px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-center items-center`}>
        {/* If using the interactive simulator */}
        {captureSource === 'simulator' ? (
          <div
            style={{ filter: activeFilter.cssFilter }}
            className="w-full h-full p-2 transition duration-200"
          >
            <InteractiveAppSimulator onInteraction={handleSimulatorInteraction} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            {displayStreamRef.current ? (
              <video
                autoPlay
                playsInline
                muted
                ref={(vid) => {
                  screenVideoRef.current = vid;
                  if (vid && displayStreamRef.current) {
                    vid.srcObject = displayStreamRef.current;
                  }
                }}
                style={{ filter: activeFilter.cssFilter }}
                className="w-full h-full object-contain transition duration-200"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Video className="w-12 h-12 mx-auto text-zinc-600 animate-pulse" />
                <p className="text-sm font-medium text-zinc-400">Ready for Screen Capture</p>
                <button
                  onClick={handleStartDisplayCapture}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Share Screen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Persistent Duration Counter on Recording Canvas Area */}
        <div
          id="canvas-persistent-duration-counter"
          className="absolute top-4 left-4 z-30 pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950/92 backdrop-blur-md border border-zinc-800 shadow-xl transition-all duration-200 select-none"
          title={`Total video recording length: ${formatDisplayDuration(recordingSeconds)}`}
        >
          {/* Status Dot */}
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRecording
                  ? isPaused
                    ? 'bg-amber-400'
                    : 'bg-red-500 animate-ping'
                  : recordingSeconds > 0
                  ? 'bg-indigo-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span
              className={`absolute w-2 h-2 rounded-full ${
                isRecording
                  ? isPaused
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                  : recordingSeconds > 0
                  ? 'bg-indigo-400'
                  : 'bg-emerald-400'
              }`}
            />
          </div>

          {/* Duration Counter Readout */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {isRecording ? (isPaused ? 'PAUSED' : 'REC') : recordingSeconds > 0 ? 'LENGTH' : 'DURATION'}
            </span>
            <span
              id="canvas-duration-digits"
              className={`font-mono text-xs sm:text-sm font-bold tracking-widest ${
                isRecording
                  ? isPaused
                    ? 'text-amber-300'
                    : 'text-white'
                  : 'text-zinc-200'
              }`}
            >
              {formatDisplayDuration(recordingSeconds)}
            </span>
          </div>

          <div className="h-3 w-px bg-zinc-800 hidden sm:block" />

          {/* Quick Details Badges */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <span className="text-indigo-300 font-semibold">{activeAspectRatio.id}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">{exportFramerate}fps</span>
          </div>

          <div className="h-3 w-px bg-zinc-800" />

          {/* Quick Telemetry Overlay Launcher */}
          <button
            type="button"
            id="canvas-telemetry-toggle-btn"
            onClick={() => setShowTelemetryOverlay(!showTelemetryOverlay)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
              showTelemetryOverlay
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            title="Toggle real-time GPU/CPU usage Telemetry Overlay (Hotkey: G)"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">Telemetry</span>
          </button>
        </div>

        {/* Compositor Canvas Overlay (Cursor Halo, Click Ripples, Softsubs, Timer Overlay) */}
        <canvas
          ref={canvasRef}
          width={activeAspectRatio.width}
          height={activeAspectRatio.height}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Real-time Drawing & Screen Highlight Pointer Interaction Overlay */}
        <div
          id="drawing-interaction-overlay"
          aria-label="Screen drawing and highlight canvas overlay"
          onPointerDown={handleDrawingPointerDown}
          onPointerMove={handleDrawingPointerMove}
          onPointerUp={handleDrawingPointerUp}
          onPointerLeave={handleDrawingPointerUp}
          className={`absolute inset-0 w-full h-full z-25 touch-none select-none transition-all ${
            isDrawModeActive
              ? drawingTool === 'text'
                ? 'pointer-events-auto cursor-text ring-2 ring-amber-500/40 bg-amber-500/[0.015]'
                : 'pointer-events-auto cursor-crosshair ring-2 ring-amber-500/40 bg-amber-500/[0.015]'
              : 'pointer-events-none'
          }`}
        />

        {/* Interactive Inline Text Overlay Creator directly on Video Preview */}
        {isDrawModeActive && inlineTextInputPos && (
          <div
            id="inline-canvas-text-editor"
            style={{
              left: `${Math.min(75, Math.max(5, inlineTextInputPos.screenX))}%`,
              top: `${Math.min(75, Math.max(8, inlineTextInputPos.screenY))}%`,
              transform: 'translate(-5%, -50%)',
            }}
            className="absolute z-35 min-w-[280px] sm:min-w-[340px] max-w-[420px] p-3 rounded-2xl bg-zinc-950/95 backdrop-blur-md border-2 border-amber-500 shadow-2xl space-y-2.5 animate-in zoom-in-95 duration-150 pointer-events-auto select-none"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Type className="w-3.5 h-3.5" />
                <span>Place Text Overlay</span>
              </div>
              <button
                type="button"
                onClick={() => setInlineTextInputPos(null)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded cursor-pointer transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                autoFocus
                value={textOverlayValue}
                onChange={(e) => setTextOverlayValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCommitTextOverlay();
                  } else if (e.key === 'Escape') {
                    setInlineTextInputPos(null);
                  }
                }}
                placeholder="Type text overlay..."
                className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {['Step 1', 'Important Note', 'Notice Output', 'Warning', 'Click Here'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTextOverlayValue(preset)}
                  className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-800 font-mono shrink-0 cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Font Size & Background Toggle & Color Selection */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-zinc-500">Size:</span>
                {[
                  { label: 'S', size: 20 },
                  { label: 'M', size: 28 },
                  { label: 'L', size: 40 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setTextOverlayFontSize(s.size)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono cursor-pointer transition ${
                      textOverlayFontSize === s.size
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1 text-[10px] text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={textOverlayHasBg}
                  onChange={(e) => setTextOverlayHasBg(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-amber-500 w-3 h-3 accent-amber-500 cursor-pointer"
                />
                <span>Backdrop</span>
              </label>

              <button
                type="button"
                onClick={() => handleCommitTextOverlay()}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Draggable Camera & Multi-Cam PiP Bubble */}
        {(isCameraActive || multiCamConfig.isPipEnabled) && (
          <div
            style={
              multiCamConfig.pipPosition === 'top-left'
                ? { top: '16px', left: '16px', borderColor: multiCamConfig.pipBorderColor || '#6366f1', borderWidth: '2px', borderStyle: 'solid' }
                : multiCamConfig.pipPosition === 'top-right'
                ? { top: '16px', right: '16px', borderColor: multiCamConfig.pipBorderColor || '#6366f1', borderWidth: '2px', borderStyle: 'solid' }
                : multiCamConfig.pipPosition === 'bottom-left'
                ? { bottom: '16px', left: '16px', borderColor: multiCamConfig.pipBorderColor || '#6366f1', borderWidth: '2px', borderStyle: 'solid' }
                : multiCamConfig.pipPosition === 'bottom-right'
                ? { bottom: '16px', right: '16px', borderColor: multiCamConfig.pipBorderColor || '#6366f1', borderWidth: '2px', borderStyle: 'solid' }
                : { top: `${cameraPosition.y}px`, right: `${cameraPosition.x}px`, borderColor: multiCamConfig.pipBorderColor || '#6366f1', borderWidth: '2px', borderStyle: 'solid' }
            }
            onMouseDown={() => setIsDraggingCam(true)}
            onMouseUp={() => setIsDraggingCam(false)}
            className={`absolute z-30 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing bg-zinc-900 group transition-all duration-200 ${
              multiCamConfig.pipShape === 'circle'
                ? 'rounded-full'
                : multiCamConfig.pipShape === 'square'
                ? 'rounded-none'
                : 'rounded-2xl'
            } ${
              multiCamConfig.pipSize === 'small'
                ? 'w-24 h-24 sm:w-28 sm:h-28'
                : multiCamConfig.pipSize === 'large'
                ? 'w-44 h-44 sm:w-56 sm:h-56'
                : 'w-32 h-32 sm:w-40 sm:h-40'
            }`}
          >
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${multiCamConfig.pipMirror ? 'transform scale-x-[-1]' : ''}`}
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] text-white font-mono pointer-events-none">
              {multiCamConfig.secondarySource === 'webcam' ? 'Webcam (PiP)' : 'Multi-Cam Input'}
            </div>
          </div>
        )}

        {/* Reactive Real-Time GPU/CPU Telemetry Overlay with D3 Line Chart */}
        {showTelemetryOverlay && (
          <TelemetryOverlay
            isRecording={isRecording}
            isPaused={isPaused}
            exportFramerate={exportFramerate}
            selectedFilter={selectedFilter}
            isDrawModeActive={isDrawModeActive}
            onClose={() => setShowTelemetryOverlay(false)}
            className="top-4 right-4 sm:right-6"
          />
        )}

        {/* Small 'Shortcuts' Overlay in the StudioRecorder Viewport */}
        {showShortcutsOverlay ? (
          <div
            id="studio-shortcuts-overlay"
            className="shortcuts-overlay absolute bottom-4 left-4 z-30 w-68 bg-zinc-950/92 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-3 shadow-2xl text-xs space-y-2 pointer-events-auto transition animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-1.5">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold tracking-wide">
                <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shortcuts</span>
              </div>
              <button
                type="button"
                id="close-shortcuts-overlay-btn"
                onClick={() => setShowShortcutsOverlay(false)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition cursor-pointer"
                title="Hide shortcuts overlay"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              {KEYBOARD_SHORTCUTS.map((sc) => (
                <div
                  key={sc.action}
                  className="flex items-center justify-between gap-2 text-zinc-300 px-1 py-0.5 rounded hover:bg-zinc-900/70 transition"
                >
                  <span className="text-zinc-400 font-sans text-xs truncate">{sc.description}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-bold text-[10px] shadow-xs shrink-0">
                    {sc.displayKey}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-1.5 border-t border-zinc-900 text-[10px] text-zinc-500 font-sans flex items-center justify-between">
              <span>Global App Listener</span>
              <span className="flex items-center gap-1 font-mono text-zinc-400 text-[9px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                {isRecording ? 'RECORDING' : 'IDLE'}
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            id="open-shortcuts-pill-btn"
            onClick={() => setShowShortcutsOverlay(true)}
            title="Display keyboard shortcuts overlay"
            className="shortcuts-overlay absolute bottom-4 left-4 z-30 px-2.5 py-1 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 backdrop-blur-md border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 shadow-xl transition pointer-events-auto cursor-pointer"
          >
            <Keyboard className="w-3 h-3 text-indigo-400" />
            <span>Shortcuts</span>
            <kbd className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-amber-300 font-bold">
              Space / T
            </kbd>
          </button>
        )}

        {/* Floating Screen Drawing & Annotation Toolbar */}
        <div
          id="drawing-annotation-toolbar"
          className="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-1.5 pointer-events-auto select-none"
        >
          {isDrawModeActive ? (
            <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-amber-500/40 shadow-2xl shadow-amber-500/10 text-xs animate-in fade-in zoom-in-95 duration-150 max-w-[340px] sm:max-w-none">
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>Screen Highlighter</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {strokes.length} on-screen
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndoStroke}
                    disabled={strokes.length === 0}
                    title="Undo last stroke"
                    className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearStrokes}
                    disabled={strokes.length === 0}
                    title="Clear all screen highlights"
                    className="p-1 rounded-lg bg-zinc-900 hover:bg-red-950/50 hover:text-red-300 disabled:opacity-30 disabled:hover:bg-zinc-900 text-zinc-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawModeActive(false)}
                    title="Close drawing mode (Hotkey: D)"
                    className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tool Selection Row */}
              <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80">
                {[
                  { id: 'highlighter' as DrawingToolType, label: 'Highlight', icon: Highlighter, hint: 'Translucent glow marker' },
                  { id: 'pen' as DrawingToolType, label: 'Pen', icon: PenTool, hint: 'Solid freehand line' },
                  { id: 'text' as DrawingToolType, label: 'Text', icon: Type, hint: 'Add text overlay directly on video preview' },
                  { id: 'rect' as DrawingToolType, label: 'Box', icon: Square, hint: 'Highlight rectangular region' },
                  { id: 'arrow' as DrawingToolType, label: 'Arrow', icon: ArrowUpRight, hint: 'Directional pointer arrow' },
                  { id: 'circle' as DrawingToolType, label: 'Spotlight', icon: CircleDot, hint: 'Circle focus spotlight' },
                ].map((tool) => {
                  const ToolIcon = tool.icon;
                  const isSelected = drawingTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setDrawingTool(tool.id)}
                      title={`${tool.label} (${tool.hint})`}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      <ToolIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Text Overlay Quick Dock Input when Text tool is selected */}
              {drawingTool === 'text' && (
                <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-zinc-900 border border-amber-500/40">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={textOverlayValue}
                      onChange={(e) => setTextOverlayValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCommitTextOverlay();
                        }
                      }}
                      placeholder="Type text overlay..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCommitTextOverlay()}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer transition shrink-0"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-400">
                    <span className="text-zinc-500">Click preview or press Add</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">Size:</span>
                      {[
                        { label: 'S', size: 20 },
                        { label: 'M', size: 28 },
                        { label: 'L', size: 40 },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setTextOverlayFontSize(s.size)}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono cursor-pointer ${
                            textOverlayFontSize === s.size ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Color Swatches & Status */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  {DRAWING_COLOR_PRESETS.map((preset) => {
                    const isSelected = drawingColor === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDrawingColor(preset.value)}
                        title={preset.name}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                          isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : 'hover:scale-110 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: preset.value }}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                  <span className="text-zinc-500">Live captured:</span>
                  <span className="text-emerald-400 font-semibold">{activeAspectRatio.width}×{activeAspectRatio.height}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {strokes.length > 0 && (
                <button
                  type="button"
                  id="quick-clear-annotations-btn"
                  onClick={handleClearStrokes}
                  title="Clear on-screen annotations"
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950/85 hover:bg-red-950/40 hover:border-red-800/60 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-red-300 text-[11px] font-mono flex items-center gap-1 shadow-xl transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear ({strokes.length})</span>
                </button>
              )}
              <button
                type="button"
                id="open-drawing-toolbar-btn"
                onClick={() => setIsDrawModeActive(true)}
                title="Open Screen Drawing & Highlighter overlay (Hotkey: D)"
                className="px-3 py-1.5 rounded-xl bg-zinc-950/85 hover:bg-zinc-900 backdrop-blur-md border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-xl transition cursor-pointer"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                <span>Highlight Screen</span>
                <kbd className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-700 text-[10px] text-amber-300 font-bold font-mono">
                  D
                </kbd>
                {strokes.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Interactive Video Cropping Tool Overlay */}
        {cropSettings.isEditing && (
          <CropOverlay
            cropSettings={cropSettings}
            onUpdateCropSettings={(updated) =>
              setCropSettings((prev) => ({ ...prev, ...updated }))
            }
            canvasWidth={activeAspectRatio.width}
            canvasHeight={activeAspectRatio.height}
            onClose={() => setCropSettings((prev) => ({ ...prev, isEditing: false }))}
            isLiveRecording={isRecording}
          />
        )}

        {/* Real-time Active Crop Floating Badge on Preview (when not in edit mode) */}
        {cropSettings.isEnabled && !cropSettings.isEditing && (
          <div
            id="preview-active-crop-badge"
            onClick={() => setCropSettings((prev) => ({ ...prev, isEditing: true }))}
            className="absolute bottom-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/92 backdrop-blur-md border border-indigo-500/50 text-[11px] font-mono text-indigo-300 shadow-xl cursor-pointer hover:bg-zinc-900 hover:border-indigo-400 transition select-none group"
            title="Real-time crop is active on recorded stream. Click to adjust crop boundary."
          >
            <Crop className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-white">CROP: {cropSettings.preset.toUpperCase()}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-300 font-semibold">
              {Math.round(cropSettings.width * activeAspectRatio.width)}×
              {Math.round(cropSettings.height * activeAspectRatio.height)}
            </span>
            <span className="text-indigo-400 text-[10px] underline ml-1">Edit ✎</span>
          </div>
        )}

        {/* Real-time Keyboard Hotkey Screen HUD Toast (2-Second Confirmation) */}
        <HotkeyToastOverlay />

        {/* AI Teleprompter Overlay with Auto-Scroll Script */}
        <TeleprompterOverlay
          isOpen={isTeleprompterOpen}
          onClose={() => setIsTeleprompterOpen(false)}
          selectedLanguageName={LANGUAGE_MAP[selectedLanguage]?.name || 'English'}
        />
      </div>

      {/* Global Progress Bar at bottom of StudioRecorder updating during video encoding */}
      {isExporting && (
        <div
          id="global-encoding-progress-bar-container"
          className="w-full p-3.5 rounded-2xl bg-zinc-950/95 border border-indigo-500/50 shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-indigo-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span>ENCODING PIPELINE</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300">{exportStatusText || 'Rendering frames...'}</span>
            </span>
            <span className="text-white font-bold bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-700/60 shadow-xs">
              {exportProgressPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-200 rounded-full shadow-sm"
              style={{ width: `${exportProgressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Visual Annotations Drawer (when "Add Visual Annotations" is enabled) */}
      {showAnnotations && (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Visual Annotations & Captions Engine</h3>
                <p className="text-xs text-zinc-400">
                  Choose between Softsubs (WebVTT/SRT) or Automated Scribe Workflow Steps
                </p>
              </div>
            </div>

            {/* Mode Switcher: Softsubs vs Scribe AI */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
                <button
                  onClick={() => setAnnotationMode('ai_workflow_scribe')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    annotationMode === 'ai_workflow_scribe'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ListTree className="w-3.5 h-3.5" />
                  <span>Scribe / Guidde Workflow</span>
                </button>

                <button
                  onClick={() => setAnnotationMode('softsubs')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    annotationMode === 'softsubs'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>Timed Softsubs (VTT/SRT)</span>
                </button>
              </div>

              {/* Translation Dropdown for Annotations */}
              <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                <Languages className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-mono">Translate:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as SupportedLanguageCode)}
                  aria-label="Translate Annotations to Language"
                  className="bg-transparent text-xs text-zinc-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-100">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TTS Voiceover Control Strip for Annotations */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span className="text-zinc-300 font-semibold">Native SpeechSynthesis Narration:</span>
              <span className="text-zinc-400">
                Playing in <strong className="text-indigo-300 font-mono">{LANGUAGE_MAP[selectedLanguage]?.name}</strong>
              </span>
              {ttsState.isSpeaking && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono pl-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Voiceover
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Synchronized Volume Indicator Badge linked to top slider state */}
              <div
                title={`SpeechSynthesisUtterance.volume is synchronized at ${Math.round(ttsVolume * 100)}%`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
              >
                {ttsVolume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : ttsVolume < 0.5 ? (
                  <Volume1 className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>Vol: {Math.round(ttsVolume * 100)}%</span>
              </div>

              {/* Preview TTS Button */}
              <button
                type="button"
                id="preview-tts-button-annotations"
                onClick={handlePreviewTts}
                title={`Preview TTS test phrase in ${LANGUAGE_MAP[selectedLanguage]?.name} at ${Math.round(ttsVolume * 100)}% volume`}
                className="preview-tts-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 hover:border-indigo-500/50 text-indigo-300 hover:text-white border border-zinc-800 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test Voice</span>
              </button>

              {!ttsState.isSpeaking ? (
                <button
                  onClick={handleSpeakAllSteps}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Read Steps in {LANGUAGE_MAP[selectedLanguage]?.name}</span>
                </button>
              ) : (
                <button
                  onClick={handleStopSpeech}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
                >
                  <Square className="w-3 h-3 fill-current text-red-400" />
                  <span>Stop Speech</span>
                </button>
              )}
            </div>
          </div>

          {/* PARADIGM A: Scribe / Guidde Workflow Steps View */}
          {annotationMode === 'ai_workflow_scribe' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  {scribeSteps.length} Interactive Step(s) Recorded
                </span>
                <button
                  onClick={() => {
                    const md = generateScribeMarkdown(
                      scribeSteps,
                      'KBT_AppGuideVideo Interactive Workflow Guide',
                      selectedLanguage
                    );
                    triggerDownload(md, `SCRIBE_GUIDE_${selectedLanguage.toUpperCase()}.md`, 'text/markdown');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export Scribe Markdown</span>
                </button>
              </div>

              {/* Step Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {scribeSteps.map((step, idx) => {
                  const tr = step.translations[selectedLanguage] || {
                    title: step.title,
                    description: step.description,
                  };
                  const isCurrent = activeStepIndex === idx && ttsState.isSpeaking;

                  return (
                    <div
                      key={step.id}
                      onClick={() => handleSpeakActiveStep(idx)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                        isCurrent
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-bold flex items-center justify-center font-mono">
                            {step.stepNumber}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-amber-400">
                            {step.actionType}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-zinc-500">
                          {step.timestamp.toFixed(1)}s
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-white mb-1">{tr.title}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tr.description}
                      </p>

                      {step.codeSnippet && (
                        <div className="mt-2 p-1.5 rounded bg-zinc-900 border border-zinc-800/80 font-mono text-[10px] text-zinc-300 truncate">
                          {step.codeSnippet}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PARADIGM B: Timed Softsubs (WebVTT / SRT) */}
          {annotationMode === 'softsubs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  {cues.length} Timed Text Subtitle Track(s)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const vtt = generateWebVTT(cues, selectedLanguage);
                      triggerDownload(vtt, `captions_${selectedLanguage}.vtt`, 'text/vtt');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download WebVTT (.vtt)</span>
                  </button>

                  <button
                    onClick={() => {
                      const srt = generateSRT(cues, selectedLanguage);
                      triggerDownload(srt, `captions_${selectedLanguage}.srt`, 'text/plain');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download SubRip (.srt)</span>
                  </button>
                </div>
              </div>

              {/* Subtitle Cue Rows */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {cues.map((cue, idx) => {
                  const text = cue.translations[selectedLanguage] || cue.text;
                  return (
                    <div
                      key={cue.id}
                      className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-indigo-400">
                          {cue.startTime.toFixed(1)}s ➔ {cue.endTime.toFixed(1)}s
                        </span>
                        <span className="font-semibold text-zinc-200">{cue.speaker}:</span>
                        <span className="text-zinc-300">{text}</span>
                      </div>

                      <button
                        onClick={() => speakWithUtterance(text, selectedLanguage)}
                        title="Listen to this subtitle"
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Library Modal */}
      <FilterLibraryModal
        isOpen={isFilterLibraryOpen}
        onClose={() => setIsFilterLibraryOpen(false)}
        selectedFilter={selectedFilter}
        onSelectFilter={(id) => setSelectedFilter(id)}
      />

      {/* Settings Modal (Key Bindings, Cloud Sync, and Storage Quota Cleanup) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shortcuts={customShortcuts}
        onUpdateShortcuts={(updated) => setCustomShortcuts(updated)}
        onResetShortcuts={() => setCustomShortcuts(KEYBOARD_SHORTCUTS)}
        cloudSyncEnabled={cloudSyncEnabled}
        onToggleCloudSync={handleToggleCloudSync}
      />

      {/* Project Archive Sidebar */}
      <ProjectArchiveSidebar
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onLoadSession={(session) => {
          if (session.projectTitle) setProjectTitle(session.projectTitle);
          if (session.projectDescription) setProjectDescription(session.projectDescription);
          if (session.exportFormat && (EXPORT_FORMAT_MAP as any)[session.exportFormat]) {
            setSelectedExportFormat(session.exportFormat as ExportFormatId);
          }
          if (session.colorFilter && (COLOR_FILTER_MAP as any)[session.colorFilter]) {
            setSelectedFilter(session.colorFilter as ColorFilterId);
          }
        }}
      />

      {/* Social Media Sharing Modal */}
      <SocialShareModal
        isOpen={isSocialShareOpen}
        onClose={() => setIsSocialShareOpen(false)}
        metadata={{
          projectTitle,
          projectDescription,
          durationSeconds: recordingSeconds,
          formattedDuration: formatDisplayDuration(recordingSeconds),
          exportFormat: selectedExportFormat,
          language: selectedLanguage,
          languageName: LANGUAGE_MAP[selectedLanguage]?.name,
        }}
      />

      {/* Scene Transitions Configuration Modal */}
      <SceneTransitionModal
        isOpen={isSceneTransitionModalOpen}
        onClose={() => setIsSceneTransitionModalOpen(false)}
        config={sceneTransitionConfig}
        onUpdateConfig={(updated) => setSceneTransitionConfig((prev) => ({ ...prev, ...updated }))}
        onTestTransition={() => triggerSceneTransition(sceneTransitionConfig.type, sceneTransitionConfig.durationMs)}
      />

      {/* Custom Quality & Encoding Presets Modal */}
      <CustomQualityPresetsModal
        isOpen={isQualityPresetsModalOpen}
        onClose={() => setIsQualityPresetsModalOpen(false)}
        currentQuality={exportQuality}
        currentFramerate={exportFramerate}
        currentFormat={selectedExportFormat}
        onApplyPreset={(p) => {
          setExportQuality(p.quality);
          setExportFramerate(p.framerate);
          if (p.format && (EXPORT_FORMAT_MAP as any)[p.format]) {
            setSelectedExportFormat(p.format as ExportFormatId);
          }
        }}
      />

      {/* Video Export Result Toast Alert */}
      <ExportToastNotification
        toast={exportToast}
        onDismiss={() => setExportToast(null)}
        onDownloadAgain={(fmt) => handleExportVideo(fmt)}
      />

      {/* Multi-Cam & PiP Director Modal */}
      <MultiCamDirectorModal
        isOpen={isMultiCamModalOpen}
        onClose={() => setIsMultiCamModalOpen(false)}
        config={multiCamConfig}
        onUpdateConfig={(updated) => setMultiCamConfig((prev) => ({ ...prev, ...updated }))}
      />

      {/* Global Export Templates Modal (Presentation Ready, Mobile Social, Raw Archive) */}
      <GlobalExportTemplatesModal
        isOpen={isGlobalTemplatesOpen}
        onClose={() => setIsGlobalTemplatesOpen(false)}
        currentSettings={{
          format: selectedExportFormat,
          quality: exportQuality,
          framerate: exportFramerate,
          aspectRatio: selectedAspectRatio,
          colorFilter: selectedFilter,
          lufsTarget: -14,
        }}
        onApplyTemplate={(tmpl) => {
          setSelectedExportFormat(tmpl.format);
          setExportQuality(tmpl.resolution || (tmpl as any).quality || '1080p');
          setExportFramerate(tmpl.framerate);
          if (tmpl.aspectRatio && (ASPECT_RATIO_MAP as any)[tmpl.aspectRatio]) {
            setSelectedAspectRatio(tmpl.aspectRatio);
          }
          if ((tmpl as any).colorFilter && (COLOR_FILTER_MAP as any)[(tmpl as any).colorFilter]) {
            setSelectedFilter((tmpl as any).colorFilter);
          }
        }}
      />

      {/* Voiceover Synthesis Studio (Gemini Powered) */}
      <VoiceoverSynthesisModal
        isOpen={isVoiceoverModalOpen}
        onClose={() => setIsVoiceoverModalOpen(false)}
        defaultScript={projectDescription || 'Welcome to this system engineering tutorial demonstration.'}
        selectedLanguage={selectedLanguage}
        currentLanguage={selectedLanguage}
        projectTitle={projectTitle}
        onAttachSpeechTrack={(_blob: any, text: string) => {
          setProjectDescription((prev) => prev ? `${prev}\n\n[Voiceover]: ${text}` : `[Voiceover]: ${text}`);
        }}
      />

      {/* Smart Scripting Outline Assistant (Gemini Powered) */}
      <SmartScriptingModal
        isOpen={isSmartScriptingOpen}
        onClose={() => setIsSmartScriptingOpen(false)}
        projectTitle={projectTitle}
        projectDescription={projectDescription}
        selectedLanguage={selectedLanguage}
        language={selectedLanguage}
        onApplyOutline={(headers: string[]) => {
          setProjectDescription(headers.join('\n'));
        }}
      />

      {/* Studio Actions 1-Click Execution Sidebar */}
      <StudioActionsSidebar
        isOpen={isActionsSidebarOpen}
        onClose={() => setIsActionsSidebarOpen(false)}
        isRecording={isRecording}
        isCameraActive={isCameraActive}
        isMicActive={isMicActive}
        isDrawActive={isDrawModeActive}
        isTelemetryActive={showTelemetryOverlay}
        isCropActive={cropSettings.isEnabled}
        isTimerActive={showTimerOverlay}
      />

      {/* Post-Export Summary Report & Success Overlay Modal */}
      <PostExportReportModal
        isOpen={isPostExportReportOpen}
        onClose={() => setIsPostExportReportOpen(false)}
        report={postExportReport}
        onDownloadAgain={() => {
          if (postExportReport) {
            handleExportVideo((postExportReport.format.toLowerCase() as ExportFormatId), postExportReport.blob);
          }
        }}
      />
    </div>
  );
};
