import React, { useRef, useEffect, useState } from 'react';
import { Activity, BarChart2, Radio, Waves, Volume2, Mic, Settings } from 'lucide-react';
import { MultiTrackAudioMixer } from '../utils/noiseGate';

interface AudioVisualizerProps {
  audioMixer: MultiTrackAudioMixer | null;
  isMicActive: boolean;
  className?: string;
  variant?: 'compact' | 'expanded' | 'overlay';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioMixer,
  isMicActive,
  className = '',
  variant = 'compact',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'wave'>('bars');
  const [colorTheme, setColorTheme] = useState<'cyan' | 'violet' | 'amber'>('cyan');
  const [currentPeakDb, setCurrentPeakDb] = useState<number>(-60);
  const [dominantFreqHz, setDominantFreqHz] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Peak bars holder for smooth drop-off animation
    const numBars = variant === 'compact' ? 24 : 48;
    const peakHold = new Array(numBars).fill(0);

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!isMicActive || !audioMixer) {
        // Flatline idle line
        ctx.strokeStyle = 'rgba(113, 113, 122, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const freqData = audioMixer.getFrequencyData('mic');
      if (!freqData || freqData.length === 0) {
        // Flatline when silent
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      // Calculate peak and dominant frequency bin
      let maxVal = 0;
      let maxBin = 0;
      for (let i = 0; i < Math.min(freqData.length, 128); i++) {
        if (freqData[i] > maxVal) {
          maxVal = freqData[i];
          maxBin = i;
        }
      }
      const approxDb = maxVal > 0 ? Math.round(20 * Math.log10(maxVal / 255)) : -60;
      setCurrentPeakDb(approxDb);
      // Sample rate approx 48000 -> bin width ~23.4Hz
      setDominantFreqHz(Math.round(maxBin * 23.4));

      if (visualizerMode === 'bars') {
        const barWidth = width / numBars;
        const binStep = Math.max(1, Math.floor((freqData.length * 0.6) / numBars));

        for (let i = 0; i < numBars; i++) {
          const dataIndex = Math.min(freqData.length - 1, i * binStep);
          const rawValue = freqData[dataIndex] / 255;
          const barHeight = Math.max(2, rawValue * (height - 4));

          // Peak hold decay
          if (barHeight >= peakHold[i]) {
            peakHold[i] = barHeight;
          } else {
            peakHold[i] = Math.max(0, peakHold[i] - 0.85);
          }

          const x = i * barWidth;
          const y = height - barHeight;

          // Gradient color by theme
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          if (colorTheme === 'cyan') {
            grad.addColorStop(0, '#06b6d4');
            grad.addColorStop(0.7, '#38bdf8');
            grad.addColorStop(1, '#818cf8');
          } else if (colorTheme === 'violet') {
            grad.addColorStop(0, '#8b5cf6');
            grad.addColorStop(0.7, '#c084fc');
            grad.addColorStop(1, '#f43f5e');
          } else {
            grad.addColorStop(0, '#f59e0b');
            grad.addColorStop(0.7, '#fbbf24');
            grad.addColorStop(1, '#10b981');
          }

          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);

          // Top peak cap
          if (peakHold[i] > 2) {
            ctx.fillStyle = colorTheme === 'cyan' ? '#a5f3fc' : colorTheme === 'violet' ? '#f5d0fe' : '#fef3c7';
            ctx.fillRect(x + 1, height - peakHold[i] - 1.5, Math.max(1, barWidth - 2), 1.5);
          }
        }
      } else {
        // Continuous Frequency Waveform
        ctx.lineWidth = 2.5;
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        if (colorTheme === 'cyan') {
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#38bdf8');
          grad.addColorStop(1, '#818cf8');
        } else if (colorTheme === 'violet') {
          grad.addColorStop(0, '#a855f7');
          grad.addColorStop(0.5, '#ec4899');
          grad.addColorStop(1, '#f43f5e');
        } else {
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(0.5, '#eab308');
          grad.addColorStop(1, '#10b981');
        }

        ctx.strokeStyle = grad;
        ctx.shadowColor = colorTheme === 'cyan' ? '#06b6d4' : '#a855f7';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = width / numBars;
        let x = 0;

        for (let i = 0; i < numBars; i++) {
          const dataIndex = Math.min(freqData.length - 1, i * 2);
          const v = freqData[dataIndex] / 255;
          const y = height / 2 - (v * height * 0.45 * Math.sin(i * 0.4 + Date.now() * 0.005));

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, [audioMixer, isMicActive, visualizerMode, colorTheme, variant]);

  return (
    <div
      className={`audio-frequency-visualizer flex flex-col justify-center rounded-xl bg-zinc-950/90 border border-zinc-800/90 p-2 shadow-inner select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-900 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-zinc-300">MIC SPECTRUM</span>
          {isMicActive ? (
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {currentPeakDb} dB
            </span>
          ) : (
            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-900 text-zinc-500">MUTED</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {dominantFreqHz > 0 && isMicActive && (
            <span className="text-zinc-500 hidden sm:inline">{dominantFreqHz} Hz</span>
          )}
          {/* Toggle bars vs wave */}
          <button
            type="button"
            onClick={() => setVisualizerMode(visualizerMode === 'bars' ? 'wave' : 'bars')}
            title={`Switch to ${visualizerMode === 'bars' ? 'Waveform' : 'Equalizer Bars'}`}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            {visualizerMode === 'bars' ? <Waves className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
          </button>

          {/* Cycle theme */}
          <button
            type="button"
            onClick={() =>
              setColorTheme(colorTheme === 'cyan' ? 'violet' : colorTheme === 'violet' ? 'amber' : 'cyan')
            }
            title="Cycle Visualizer Color Palette"
            className="w-3 h-3 rounded-full border border-zinc-700 transition"
            style={{
              backgroundColor:
                colorTheme === 'cyan' ? '#06b6d4' : colorTheme === 'violet' ? '#a855f7' : '#f59e0b',
            }}
          />
        </div>
      </div>

      <div className="relative pt-1.5 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={variant === 'compact' ? 220 : 380}
          height={variant === 'compact' ? 36 : 60}
          className="w-full h-9 sm:h-11 rounded"
        />
      </div>
    </div>
  );
};
