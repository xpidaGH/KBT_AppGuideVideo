import { ColorFilterId, ColorFilterPreset } from '../types';

/**
 * Standard Color-Correction LUT Presets for Real-Time Canvas Video Pipeline
 */
export const COLOR_FILTER_PRESETS: ColorFilterPreset[] = [
  {
    id: 'none',
    name: 'Normal (Passthrough)',
    label: 'Normal',
    canvasFilter: 'none',
    cssFilter: 'none',
    description: 'Natural, unprocessed raw camera/screen capture with 100% color fidelity.',
    badgeColor: 'bg-zinc-700 text-zinc-200 border-zinc-600',
    previewGradient: 'from-zinc-500 to-zinc-700',
    rgbBalance: { r: 1.0, g: 1.0, b: 1.0, contrast: 1.0 },
  },
  {
    id: 'grayscale',
    name: 'Grayscale (B&W Studio)',
    label: 'Grayscale',
    canvasFilter: 'grayscale(100%) contrast(115%) brightness(105%)',
    cssFilter: 'grayscale(100%) contrast(115%) brightness(105%)',
    description: 'Clean monochrome luminance mapping following ITU-R BT.709 colorimetric weights.',
    badgeColor: 'bg-slate-700 text-slate-100 border-slate-500',
    previewGradient: 'from-slate-300 via-slate-500 to-slate-800',
    rgbBalance: { r: 0.2126, g: 0.7152, b: 0.0722, contrast: 1.15 },
  },
  {
    id: 'sepia',
    name: 'Sepia (Vintage Warm Film)',
    label: 'Sepia',
    canvasFilter: 'sepia(90%) contrast(115%) brightness(96%) saturate(110%)',
    cssFilter: 'sepia(90%) contrast(115%) brightness(96%) saturate(110%)',
    description: 'Classic nostalgic warm amber tone with enhanced midtone contrast.',
    badgeColor: 'bg-amber-900/60 text-amber-200 border-amber-600/70',
    previewGradient: 'from-amber-200 via-amber-600 to-amber-950',
    rgbBalance: { r: 1.18, g: 0.95, b: 0.72, contrast: 1.15 },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast (Punchy Clarity)',
    label: 'Hi-Contrast',
    canvasFilter: 'contrast(175%) brightness(104%) saturate(125%)',
    cssFilter: 'contrast(175%) brightness(104%) saturate(125%)',
    description: 'Deep blacks, crisp bright highlights, and expanded dynamic range for code legibility.',
    badgeColor: 'bg-rose-950/60 text-rose-200 border-rose-500/70',
    previewGradient: 'from-rose-500 via-fuchsia-600 to-indigo-800',
    rgbBalance: { r: 1.0, g: 1.0, b: 1.0, contrast: 1.75 },
  },
  {
    id: 'warm-sunlight',
    name: 'Warm Sunlight (Golden Hour)',
    label: 'Warm LUT',
    canvasFilter: 'sepia(30%) saturate(140%) brightness(106%) hue-rotate(-10deg)',
    cssFilter: 'sepia(30%) saturate(140%) brightness(106%) hue-rotate(-10deg)',
    description: 'Pleasing warm golden palette emphasizing amber, coral, and soft highlights.',
    badgeColor: 'bg-orange-950/60 text-orange-200 border-orange-500/70',
    previewGradient: 'from-amber-400 via-orange-500 to-red-600',
    rgbBalance: { r: 1.15, g: 1.04, b: 0.88, contrast: 1.1 },
  },
  {
    id: 'cyberpunk-cool',
    name: 'Cyberpunk (Teal & Cool Cyan)',
    label: 'Cool Teal',
    canvasFilter: 'hue-rotate(170deg) saturate(140%) contrast(125%) brightness(102%)',
    cssFilter: 'hue-rotate(170deg) saturate(140%) contrast(125%) brightness(102%)',
    description: 'Electric teal, neon cyan, and high-tech futuristic cool color balance.',
    badgeColor: 'bg-cyan-950/60 text-cyan-200 border-cyan-500/70',
    previewGradient: 'from-cyan-400 via-teal-500 to-blue-700',
    rgbBalance: { r: 0.82, g: 1.08, b: 1.28, contrast: 1.25 },
  },
  {
    id: 'cinematic-bleach',
    name: 'Bleach Bypass (Cinema Silver)',
    label: 'Bleach Bypass',
    canvasFilter: 'contrast(155%) saturate(55%) brightness(105%)',
    cssFilter: 'contrast(155%) saturate(55%) brightness(105%)',
    description: 'Desaturated cinematic silver halide look with punchy tonal gradients.',
    badgeColor: 'bg-emerald-950/60 text-emerald-200 border-emerald-500/70',
    previewGradient: 'from-zinc-400 via-emerald-800 to-zinc-900',
    rgbBalance: { r: 0.95, g: 1.0, b: 0.95, contrast: 1.55 },
  },
  {
    id: 'invert',
    name: 'Invert (Night Vision / Thermal)',
    label: 'Invert',
    canvasFilter: 'invert(100%) hue-rotate(180deg) contrast(110%)',
    cssFilter: 'invert(100%) hue-rotate(180deg) contrast(110%)',
    description: 'Tonal inversion with inverted hue mapping for dark-mode thermal analysis.',
    badgeColor: 'bg-purple-950/60 text-purple-200 border-purple-500/70',
    previewGradient: 'from-violet-400 via-fuchsia-600 to-black',
    rgbBalance: { r: -1.0, g: -1.0, b: -1.0, contrast: 1.1 },
  },
];

export const COLOR_FILTER_MAP: Record<ColorFilterId, ColorFilterPreset> = COLOR_FILTER_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as Record<ColorFilterId, ColorFilterPreset>
);

/**
 * Pixel-level Color-Correction LUT Transformation Engine (ImageData manipulation)
 * Used for pure mathematical color-correction algorithms directly on canvas pixel buffers.
 */
export function applyLutToImageData(imageData: ImageData, filterId: ColorFilterId): void {
  if (filterId === 'none') return;

  const data = imageData.data;
  const len = data.length;

  switch (filterId) {
    case 'grayscale': {
      // Rec. 709 luma transformation
      for (let i = 0; i < len; i += 4) {
        const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        // Mild contrast bump
        const c = Math.min(255, Math.max(0, (y - 128) * 1.15 + 128));
        data[i] = c;
        data[i + 1] = c;
        data[i + 2] = c;
      }
      break;
    }
    case 'sepia': {
      // Sepia tone matrix transformation
      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const outR = r * 0.393 + g * 0.769 + b * 0.189;
        const outG = r * 0.349 + g * 0.686 + b * 0.168;
        const outB = r * 0.272 + g * 0.534 + b * 0.131;
        data[i] = Math.min(255, outR);
        data[i + 1] = Math.min(255, outG);
        data[i + 2] = Math.min(255, outB);
      }
      break;
    }
    case 'high-contrast': {
      // S-curve contrast expansion
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.75 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.75 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.75 + 128));
      }
      break;
    }
    case 'warm-sunlight': {
      // Golden Hour RGB shift
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, data[i] * 1.18);
        data[i + 1] = Math.min(255, data[i + 1] * 1.05);
        data[i + 2] = Math.max(0, data[i + 2] * 0.88);
      }
      break;
    }
    case 'cyberpunk-cool': {
      // Teal and Cool Cyan shift
      for (let i = 0; i < len; i += 4) {
        data[i] = Math.max(0, data[i] * 0.82);
        data[i + 1] = Math.min(255, data[i + 1] * 1.12);
        data[i + 2] = Math.min(255, data[i + 2] * 1.28);
      }
      break;
    }
    case 'cinematic-bleach': {
      // Desaturate and boost contrast
      for (let i = 0; i < len; i += 4) {
        const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const mix = 0.55; // 55% color, 45% luma
        let r = data[i] * mix + luma * (1 - mix);
        let g = data[i + 1] * mix + luma * (1 - mix);
        let b = data[i + 2] * mix + luma * (1 - mix);
        data[i] = Math.min(255, Math.max(0, (r - 128) * 1.55 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (g - 128) * 1.55 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (b - 128) * 1.55 + 128));
      }
      break;
    }
    case 'invert': {
      // Invert channels
      for (let i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    }
  }
}
