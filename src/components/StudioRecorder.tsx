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
} from 'lucide-react';
import {
  SupportedLanguageCode,
  SoftsubCue,
  ScribeWorkflowStep,
  AnnotationMode,
  VideoExportOptions,
  ColorFilterId,
} from '../types';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../data/languages';
import { INITIAL_SOFTSUB_CUES, INITIAL_SCRIBE_STEPS } from '../data/annotationsData';
import { ttsEngine } from '../utils/tts';
import {
  generateWebVTT,
  generateSRT,
  generateScribeMarkdown,
  triggerDownload,
} from '../utils/vttSrtExport';
import { InteractiveAppSimulator } from './InteractiveAppSimulator';
import {
  TTS_TEST_PHRASES,
  DEFAULT_STUDIO_CONFIG,
  TIMER_OVERLAY_STYLE,
  VIDEO_QUALITY_OPTIONS,
  FRAMERATE_OPTIONS,
  KEYBOARD_SHORTCUTS,
  COLOR_FILTER_PRESETS,
  COLOR_FILTER_MAP,
} from '../data/recorderConfig';
import { applyLutToImageData } from '../utils/colorFilterPipeline';

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
  const [cameraPosition, setCameraPosition] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
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

  // Real-time Canvas-based Video Filter & Color-Correction LUT Pipeline
  const [selectedFilter, setSelectedFilter] = useState<ColorFilterId>(
    DEFAULT_STUDIO_CONFIG.defaultFilter
  );
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

  // Export settings
  const [exportQuality, setExportQuality] = useState<'1080p' | '720p'>(
    DEFAULT_STUDIO_CONFIG.defaultQuality
  );
  const [exportFramerate, setExportFramerate] = useState<30 | 60>(
    DEFAULT_STUDIO_CONFIG.defaultFramerate
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Subscribe to TTS
  useEffect(() => {
    return ttsEngine.subscribe((st) => {
      setTtsState({ isSpeaking: st.isSpeaking, isPaused: st.isPaused });
    });
  }, []);

  // Timer counter when recording
  useEffect(() => {
    let interval: number;
    if (isRecording && !isPaused) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, setRecordingSeconds]);

  // Real-time canvas animation loop (Compositing Video/IDE base, Color Filter LUT, Ripples, Cursor Halo, Softsubs, Timer Overlay)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const render = () => {
      // Clear canvas overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 0. Base Video / Software Workstation Compositor Layer with Real-Time Color Filter LUT Pipeline
      ctx.save();
      if (activeFilter.id !== 'none') {
        ctx.filter = activeFilter.canvasFilter;
      }

      if (captureSource === 'screen' && screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
        ctx.drawImage(screenVideoRef.current, 0, 0, canvas.width, canvas.height);
      } else if (captureSource === 'simulator') {
        // Render rich simulated IDE workstation directly to compositor canvas
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, '#09090b');
        bgGrad.addColorStop(0.5, '#121217');
        bgGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Window Frame
        const pad = 24;
        const winW = canvas.width - pad * 2;
        const winH = canvas.height - pad * 2;

        ctx.fillStyle = '#0e0f14';
        ctx.roundRect(pad, pad, winW, winH, 12);
        ctx.fill();
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Header bar
        ctx.fillStyle = '#18181b';
        ctx.roundRect(pad, pad, winW, 40, [12, 12, 0, 0]);
        ctx.fill();

        // Window buttons
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(pad + 20, pad + 20, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pad + 38, pad + 20, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(pad + 56, pad + 20, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Title
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('KBT CloudIDE Simulator — Multi-Language Architecture Engine', pad + 78, pad + 25);

        // Active LUT banner in header
        if (activeFilter.id !== 'none') {
          ctx.font = '700 11px "JetBrains Mono", monospace';
          ctx.fillStyle = '#c084fc';
          ctx.textAlign = 'right';
          ctx.fillText(`LUT: [${activeFilter.name.toUpperCase()}]`, pad + winW - 20, pad + 25);
          ctx.textAlign = 'left';
        }

        // Sidebar
        ctx.fillStyle = '#121318';
        ctx.fillRect(pad + 1, pad + 41, 200, winH - 42);
        ctx.strokeStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(pad + 201, pad + 41);
        ctx.lineTo(pad + 201, pad + winH);
        ctx.stroke();

        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#71717a';
        ctx.fillText('EXPLORER : KBT PROJECT', pad + 16, pad + 65);

        const files = [
          '📄 main.cpp [AVX2]',
          '📄 SIMD_Kernel.rs',
          '📄 pipeline.go',
          '📄 engine.cu [CUDA]',
          '📄 config.toml',
        ];
        files.forEach((f, fi) => {
          ctx.fillStyle = fi === 0 ? '#818cf8' : '#a1a1aa';
          ctx.fillText(f, pad + 20, pad + 95 + fi * 26);
        });

        // Editor code area
        ctx.fillStyle = '#0d0e12';
        ctx.fillRect(pad + 202, pad + 41, winW - 203, winH - 180);

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
        ctx.font = '12px "JetBrains Mono", monospace';
        codeSnippets.forEach((line, li) => {
          ctx.fillStyle = '#52525b';
          ctx.fillText(String(li + 1).padStart(2, '0'), pad + 218, pad + 72 + li * 22);
          ctx.fillStyle =
            line.startsWith('//')
              ? '#71717a'
              : line.startsWith('#')
              ? '#f43f5e'
              : line.includes('void') || line.includes('const')
              ? '#60a5fa'
              : line.includes('_mm256')
              ? '#34d399'
              : '#e4e4e7';
          ctx.fillText(line, pad + 250, pad + 72 + li * 22);
        });

        // Terminal pane
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(pad + 202, pad + winH - 140, winW - 203, 138);
        ctx.strokeStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(pad + 202, pad + winH - 140);
        ctx.lineTo(pad + winW, pad + winH - 140);
        ctx.stroke();

        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('TERMINAL : KBT COMPILER & RUNTIME v2.4 [60 FPS COMPOSITOR]', pad + 218, pad + winH - 118);

        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('[OK] Real-time Canvas Capture Stream Initialized.', pad + 218, pad + winH - 96);
        ctx.fillStyle = '#e4e4e7';
        ctx.fillText(`[LUT] Active Color-Correction Filter: ${activeFilter.name}`, pad + 218, pad + winH - 74);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`[STATUS] ${isRecording ? (isPaused ? 'PAUSED' : 'ENCODING TO STREAM...') : 'STANDBY READY'} | Cycle with 'F'`, pad + 218, pad + winH - 52);
      }
      ctx.restore();

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
          ctx.fillStyle = idleDotColor;
          ctx.shadowColor = idleDotColor;
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Recording Timer / Clock text
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        let timerText = '';
        if (isRecording) {
          const m = Math.floor(recordingSeconds / 60);
          const s = recordingSeconds % 60;
          const status = isPaused ? 'PAUSE' : 'REC';
          timerText = `${status} ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
          timerText = `LIVE ${timeStr}`;
        }

        ctx.fillStyle = isRecording ? (isPaused ? '#fbbf24' : '#ffffff') : '#e4e4e7';
        ctx.fillText(timerText, x + 28, y + height / 2);

        // Framerate indicator tag
        ctx.font = `600 10px ${fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`${exportFramerate}FPS`, x + width - 10, y + height / 2);

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
        displayStreamRef.current = stream;
        setCaptureSource('screen');
      } else {
        alert('getDisplayMedia is not available in this browser context. Using Interactive IDE Simulator.');
      }
    } catch (e) {
      console.warn('Display media cancelled or failed:', e);
      setCaptureSource('simulator');
    }
  };

  // Record Lifecycle Controls
  const handleStartRecording = () => {
    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);
    setIsRecording(true);
    setIsPaused(false);

    // Audio level pulsing simulation
    const interval = window.setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.5);
    }, 150);

    // If canvas stream can be captured:
    const canvas = canvasRef.current;
    if (canvas && (canvas as any).captureStream) {
      try {
        const stream = (canvas as any).captureStream(exportFramerate);
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
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Export video file
  const handleExportVideo = (format: 'mp4' | 'webm') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      if (recordedVideoUrl) {
        const a = document.createElement('a');
        a.href = recordedVideoUrl;
        a.download = `KBT_Tutorial_${selectedLanguage.toUpperCase()}_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fallback: Generate simulation container
        const dummyContent = 'KBT_AppGuideVideo Output Video Container (H.264 / AAC)';
        triggerDownload(dummyContent, `KBT_Software_Guide_${selectedLanguage.toUpperCase()}.${format}`, 'video/mp4');
      }
    }, 600);
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
              onClick={() => setCaptureSource('simulator')}
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

          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
            >
              <Circle className="w-3.5 h-3.5 fill-current" />
              <span>Start Recording</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleStopRecording}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-400 font-bold text-xs border border-red-500/30 shadow-md transition"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Export</span>
              </button>
            </div>
          )}

          {/* Export MP4 Button */}
          <button
            onClick={() => handleExportVideo('mp4')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Muxing MP4...' : 'Export MP4'}</span>
          </button>
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

      {/* Main Studio Viewport (Recording Screen + Draggable Webcam + Canvas Overlay) */}
      <div className="relative w-full aspect-video min-h-[480px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-center items-center">
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

        {/* Compositor Canvas Overlay (Cursor Halo, Click Ripples, Softsubs, Timer Overlay) */}
        <canvas
          ref={canvasRef}
          width={DEFAULT_STUDIO_CONFIG.canvasWidth}
          height={DEFAULT_STUDIO_CONFIG.canvasHeight}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Draggable Circular Camera Bubble (Loom Style) */}
        {isCameraActive && (
          <div
            style={{ top: `${cameraPosition.y}px`, right: `${cameraPosition.x}px` }}
            onMouseDown={() => setIsDraggingCam(true)}
            onMouseUp={() => setIsDraggingCam(false)}
            className="absolute z-30 w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-indigo-500 shadow-2xl cursor-grab active:cursor-grabbing bg-zinc-900 group"
          >
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] text-white font-mono pointer-events-none">
              Webcam (Loom)
            </div>
          </div>
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
      </div>

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
    </div>
  );
};
