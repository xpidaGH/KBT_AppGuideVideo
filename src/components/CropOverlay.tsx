import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Crop,
  Lock,
  Unlock,
  Grid,
  RotateCcw,
  Check,
  X,
  Maximize2,
  Crosshair,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CropSettings, CropPresetId } from '../types';
import { CROP_PRESETS } from '../data/structuredStudioData';

interface CropOverlayProps {
  cropSettings: CropSettings;
  onUpdateCropSettings: (updated: Partial<CropSettings>) => void;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
  isLiveRecording?: boolean;
}

type DragType =
  | 'move'
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | null;

export const CropOverlay: React.FC<CropOverlayProps> = ({
  cropSettings,
  onUpdateCropSettings,
  canvasWidth,
  canvasHeight,
  onClose,
  isLiveRecording = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragType>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initialCrop: { x: number; y: number; width: number; height: number };
  } | null>(null);

  const [previewCroppedOnly, setPreviewCroppedOnly] = useState<boolean>(false);

  // Helper to compute target ratio
  const getPresetRatio = useCallback(
    (presetId: CropPresetId): number | null => {
      const preset = CROP_PRESETS.find((p) => p.id === presetId);
      return preset ? preset.ratio : null;
    },
    []
  );

  // Set preset aspect ratio and fit proportionally in center
  const applyPreset = (presetId: CropPresetId) => {
    const ratio = getPresetRatio(presetId);
    if (!ratio) {
      onUpdateCropSettings({
        preset: 'free',
        isLocked: false,
      });
      return;
    }

    // Canvas native aspect ratio
    const stageAspect = canvasWidth / canvasHeight;
    // Ratio of normalized width / normalized height:
    // (w * canvasWidth) / (h * canvasHeight) = ratio
    // => (w / h) = ratio / stageAspect
    const normalizedRatio = ratio / stageAspect;

    let newW = 0.85;
    let newH = newW / normalizedRatio;

    if (newH > 0.85) {
      newH = 0.85;
      newW = newH * normalizedRatio;
    }

    const newX = (1 - newW) / 2;
    const newY = (1 - newH) / 2;

    onUpdateCropSettings({
      preset: presetId,
      isLocked: true,
      x: Math.max(0, Math.min(1 - newW, newX)),
      y: Math.max(0, Math.min(1 - newH, newY)),
      width: Math.min(1, newW),
      height: Math.min(1, newH),
      isEnabled: true,
    });
  };

  // Center crop bounding box
  const handleCenterCrop = () => {
    const { width, height } = cropSettings;
    const newX = Math.max(0, (1 - width) / 2);
    const newY = Math.max(0, (1 - height) / 2);
    onUpdateCropSettings({ x: newX, y: newY });
  };

  // Reset to full capture frame
  const handleResetToFull = () => {
    onUpdateCropSettings({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      preset: 'free',
      isLocked: false,
    });
  };

  // Start drag handler
  const handlePointerDown = (e: React.PointerEvent, type: DragType) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setActiveDrag(type);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialCrop: {
        x: cropSettings.x,
        y: cropSettings.y,
        width: cropSettings.width,
        height: cropSettings.height,
      },
    };
  };

  // Pointer move handler
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || !dragStartRef.current || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const deltaX = (e.clientX - dragStartRef.current.clientX) / rect.width;
    const deltaY = (e.clientY - dragStartRef.current.clientY) / rect.height;

    const { x: initX, y: initY, width: initW, height: initH } =
      dragStartRef.current.initialCrop;

    const minSize = 0.08; // 8% minimum crop dimension
    let newX = initX;
    let newY = initY;
    let newW = initW;
    let newH = initH;

    const stageAspect = canvasWidth / canvasHeight;
    const lockedPresetRatio =
      cropSettings.isLocked && cropSettings.preset !== 'free'
        ? getPresetRatio(cropSettings.preset)
        : null;
    const normAspect = lockedPresetRatio
      ? lockedPresetRatio / stageAspect
      : null;

    if (activeDrag === 'move') {
      newX = Math.max(0, Math.min(1 - initW, initX + deltaX));
      newY = Math.max(0, Math.min(1 - initH, initY + deltaY));
      onUpdateCropSettings({ x: newX, y: newY });
      return;
    }

    // Handles resizing
    if (activeDrag === 'se') {
      newW = Math.max(minSize, Math.min(1 - initX, initW + deltaX));
      if (normAspect) {
        newH = newW / normAspect;
        if (initY + newH > 1) {
          newH = 1 - initY;
          newW = newH * normAspect;
        }
      } else {
        newH = Math.max(minSize, Math.min(1 - initY, initH + deltaY));
      }
    } else if (activeDrag === 'sw') {
      const targetW = Math.max(minSize, Math.min(initX + initW, initW - deltaX));
      newW = targetW;
      newX = initX + initW - newW;
      if (normAspect) {
        newH = newW / normAspect;
        if (initY + newH > 1) {
          newH = 1 - initY;
          newW = newH * normAspect;
          newX = initX + initW - newW;
        }
      } else {
        newH = Math.max(minSize, Math.min(1 - initY, initH + deltaY));
      }
    } else if (activeDrag === 'ne') {
      newW = Math.max(minSize, Math.min(1 - initX, initW + deltaX));
      if (normAspect) {
        newH = newW / normAspect;
        newY = initY + initH - newH;
        if (newY < 0) {
          newY = 0;
          newH = initY + initH;
          newW = newH * normAspect;
        }
      } else {
        const targetH = Math.max(minSize, Math.min(initY + initH, initH - deltaY));
        newH = targetH;
        newY = initY + initH - newH;
      }
    } else if (activeDrag === 'nw') {
      newW = Math.max(minSize, Math.min(initX + initW, initW - deltaX));
      newX = initX + initW - newW;
      if (normAspect) {
        newH = newW / normAspect;
        newY = initY + initH - newH;
        if (newY < 0) {
          newY = 0;
          newH = initY + initH;
          newW = newH * normAspect;
          newX = initX + initW - newW;
        }
      } else {
        const targetH = Math.max(minSize, Math.min(initY + initH, initH - deltaY));
        newH = targetH;
        newY = initY + initH - newH;
      }
    } else if (activeDrag === 'e') {
      newW = Math.max(minSize, Math.min(1 - initX, initW + deltaX));
      if (normAspect) {
        newH = newW / normAspect;
        const diffH = newH - initH;
        newY = Math.max(0, Math.min(1 - newH, initY - diffH / 2));
      }
    } else if (activeDrag === 'w') {
      newW = Math.max(minSize, Math.min(initX + initW, initW - deltaX));
      newX = initX + initW - newW;
      if (normAspect) {
        newH = newW / normAspect;
        const diffH = newH - initH;
        newY = Math.max(0, Math.min(1 - newH, initY - diffH / 2));
      }
    } else if (activeDrag === 's') {
      newH = Math.max(minSize, Math.min(1 - initY, initH + deltaY));
      if (normAspect) {
        newW = newH * normAspect;
        const diffW = newW - initW;
        newX = Math.max(0, Math.min(1 - newW, initX - diffW / 2));
      }
    } else if (activeDrag === 'n') {
      newH = Math.max(minSize, Math.min(initY + initH, initH - deltaY));
      newY = initY + initH - newH;
      if (normAspect) {
        newW = newH * normAspect;
        const diffW = newW - initW;
        newX = Math.max(0, Math.min(1 - newW, initX - diffW / 2));
      }
    }

    onUpdateCropSettings({
      x: Math.max(0, Math.min(1 - minSize, newX)),
      y: Math.max(0, Math.min(1 - minSize, newY)),
      width: Math.max(minSize, Math.min(1 - newX, newW)),
      height: Math.max(minSize, Math.min(1 - newY, newH)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveDrag(null);
      dragStartRef.current = null;
    }
  };

  // Keyboard shortcut listener: Escape to close, C to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { x, y, width, height, isEnabled, preset, isLocked, showRuleOfThirds } =
    cropSettings;

  // Real pixel size of the cropped region
  const pxW = Math.round(width * canvasWidth);
  const pxH = Math.round(height * canvasHeight);
  const currentRatioNum = pxH > 0 ? (pxW / pxH).toFixed(2) : '1.00';

  return (
    <div
      ref={containerRef}
      id="video-crop-interactive-overlay"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 z-35 select-none touch-none overflow-hidden"
    >
      {/* 4-Quadrant Dimming Mask covering uncropped areas */}
      {!previewCroppedOnly && (
        <>
          {/* Top Mask */}
          <div
            style={{ height: `${y * 100}%` }}
            className="absolute top-0 left-0 right-0 bg-black/65 backdrop-blur-[1px] transition-all duration-75 pointer-events-auto"
          />
          {/* Bottom Mask */}
          <div
            style={{ top: `${(y + height) * 100}%` }}
            className="absolute bottom-0 left-0 right-0 bg-black/65 backdrop-blur-[1px] transition-all duration-75 pointer-events-auto"
          />
          {/* Left Mask */}
          <div
            style={{
              top: `${y * 100}%`,
              height: `${height * 100}%`,
              width: `${x * 100}%`,
            }}
            className="absolute left-0 bg-black/65 backdrop-blur-[1px] transition-all duration-75 pointer-events-auto"
          />
          {/* Right Mask */}
          <div
            style={{
              top: `${y * 100}%`,
              height: `${height * 100}%`,
              left: `${(x + width) * 100}%`,
              right: 0,
            }}
            className="absolute bg-black/65 backdrop-blur-[1px] transition-all duration-75 pointer-events-auto"
          />
        </>
      )}

      {/* Floating Crop Control Toolbar Bar (Top Center) */}
      <div
        id="crop-tool-floating-toolbar"
        className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-700/80 shadow-2xl text-xs max-w-[96%] overflow-x-auto"
      >
        {/* Tool Header & Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 border-r border-zinc-800">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400">
            <Crop className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white text-[11px] whitespace-nowrap">
            Crop Tool
          </span>
          {isLiveRecording && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
          )}
        </div>

        {/* Aspect Ratio Preset Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {CROP_PRESETS.map((p) => {
            const isSelected = preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                id={`crop-preset-btn-${p.id.replace(':', '-')}`}
                onClick={() => applyPreset(p.id as CropPresetId)}
                title={p.description}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-sm ring-1 ring-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <span>{p.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tool Actions Divider */}
        <div className="h-4 w-px bg-zinc-800 shrink-0 mx-0.5" />

        {/* Ratio Lock Toggle */}
        <button
          type="button"
          onClick={() => onUpdateCropSettings({ isLocked: !isLocked })}
          title={isLocked ? 'Unlock Aspect Ratio' : 'Lock Current Aspect Ratio'}
          className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
            isLocked
              ? 'bg-amber-950/60 text-amber-300 border-amber-600/60 shadow-sm'
              : 'text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Rule of Thirds Grid Toggle */}
        <button
          type="button"
          onClick={() =>
            onUpdateCropSettings({ showRuleOfThirds: !showRuleOfThirds })
          }
          title="Toggle Rule of Thirds Grid Guidelines"
          className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
            showRuleOfThirds
              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-600/60 shadow-sm'
              : 'text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Center Crop Action */}
        <button
          type="button"
          onClick={handleCenterCrop}
          title="Snap Crop Box to Center"
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition cursor-pointer shrink-0"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Reset to Full Frame */}
        <button
          type="button"
          onClick={handleResetToFull}
          title="Reset Crop to Full Frame"
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Enable / Disable Crop Toggle */}
        <button
          type="button"
          onClick={() => onUpdateCropSettings({ isEnabled: !isEnabled })}
          title={isEnabled ? 'Cropping Active (Will be recorded)' : 'Cropping Inactive'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer shrink-0 ${
            isEnabled
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60 shadow-sm'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
            }`}
          />
          <span>{isEnabled ? 'Active' : 'Disabled'}</span>
        </button>

        {/* Done / Close Editor Button */}
        <button
          type="button"
          id="crop-tool-done-btn"
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>
      </div>

      {/* Interactive Crop Boundary Box */}
      <div
        id="crop-bounding-box"
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: `${width * 100}%`,
          height: `${height * 100}%`,
        }}
        className={`absolute border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.45)] transition-shadow duration-150 ${
          activeDrag === 'move' ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
      >
        {/* Rule of Thirds Grid Guidelines */}
        {showRuleOfThirds && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical Lines */}
            <div className="absolute top-0 bottom-0 left-[33.33%] w-px border-l border-white/30 border-dashed" />
            <div className="absolute top-0 bottom-0 left-[66.66%] w-px border-l border-white/30 border-dashed" />
            {/* Horizontal Lines */}
            <div className="absolute left-0 right-0 top-[33.33%] h-px border-t border-white/30 border-dashed" />
            <div className="absolute left-0 right-0 top-[66.66%] h-px border-t border-white/30 border-dashed" />
            {/* Center Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40">
              <div className="absolute top-2 left-0 right-0 h-px bg-white" />
              <div className="absolute left-2 top-0 bottom-0 w-px bg-white" />
            </div>
          </div>
        )}

        {/* Viewfinder Corner Brackets */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-white pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-white pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-white pointer-events-none" />

        {/* Floating Dimension & Coordinate Badge */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none transition-all duration-100 ${
            y > 0.12 ? '-top-8' : 'bottom-2'
          }`}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/92 backdrop-blur-md border border-indigo-500/50 shadow-xl text-[10px] font-mono whitespace-nowrap text-white">
            <span className="text-indigo-300 font-bold uppercase">{preset}</span>
            <span className="text-zinc-500">•</span>
            <span className="font-semibold text-emerald-300">
              {pxW} × {pxH} px
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">({currentRatioNum}:1)</span>
          </div>
        </div>

        {/* 4 Corner Drag Handles */}
        <div
          id="crop-handle-nw"
          title="Drag top-left corner"
          onPointerDown={(e) => handlePointerDown(e, 'nw')}
          className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-lg cursor-nwse-resize hover:scale-125 transition-transform"
        />
        <div
          id="crop-handle-ne"
          title="Drag top-right corner"
          onPointerDown={(e) => handlePointerDown(e, 'ne')}
          className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-lg cursor-nesw-resize hover:scale-125 transition-transform"
        />
        <div
          id="crop-handle-sw"
          title="Drag bottom-left corner"
          onPointerDown={(e) => handlePointerDown(e, 'sw')}
          className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-lg cursor-nesw-resize hover:scale-125 transition-transform"
        />
        <div
          id="crop-handle-se"
          title="Drag bottom-right corner"
          onPointerDown={(e) => handlePointerDown(e, 'se')}
          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-lg cursor-nwse-resize hover:scale-125 transition-transform"
        />

        {/* 4 Edge Drag Handles */}
        <div
          id="crop-handle-n"
          title="Drag top edge"
          onPointerDown={(e) => handlePointerDown(e, 'n')}
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-white/90 border border-indigo-600 shadow-md cursor-ns-resize hover:scale-110 transition-transform"
        />
        <div
          id="crop-handle-s"
          title="Drag bottom edge"
          onPointerDown={(e) => handlePointerDown(e, 's')}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-white/90 border border-indigo-600 shadow-md cursor-ns-resize hover:scale-110 transition-transform"
        />
        <div
          id="crop-handle-w"
          title="Drag left edge"
          onPointerDown={(e) => handlePointerDown(e, 'w')}
          className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-8 rounded-full bg-white/90 border border-indigo-600 shadow-md cursor-ew-resize hover:scale-110 transition-transform"
        />
        <div
          id="crop-handle-e"
          title="Drag right edge"
          onPointerDown={(e) => handlePointerDown(e, 'e')}
          className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-8 rounded-full bg-white/90 border border-indigo-600 shadow-md cursor-ew-resize hover:scale-110 transition-transform"
        />
      </div>
    </div>
  );
};
