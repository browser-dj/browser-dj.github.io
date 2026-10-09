import React, { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  peaks: number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  cuePoint?: number;
  isLooping?: boolean;
  loopStart?: number;
  loopEnd?: number;
  deckTheme: 'crimson' | 'red';
  frequencies?: Uint8Array;
  onSeek: (time: number) => void;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  peaks,
  currentTime,
  duration,
  isPlaying,
  cuePoint = 0,
  isLooping = false,
  loopStart = 0,
  loopEnd = 0,
  deckTheme,
  frequencies,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Background grid / centerline
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, height);

    const midY = height / 2;
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Loop Region Highlight
    if (isLooping && loopEnd > loopStart && duration > 0) {
      const loopX1 = (loopStart / duration) * width;
      const loopX2 = (loopEnd / duration) * width;
      ctx.fillStyle = deckTheme === 'crimson' ? 'rgba(188, 2, 2, 0.25)' : 'rgba(255, 0, 0, 0.25)';
      ctx.fillRect(loopX1, 0, Math.max(2, loopX2 - loopX1), height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(loopX1, 0, Math.max(2, loopX2 - loopX1), height);
    }

    // Draw Peaks
    const effectivePeaks = peaks.length > 0 ? peaks : Array.from({ length: 150 }, () => 0.05);
    const barWidth = width / effectivePeaks.length;
    const progressNorm = duration > 0 ? currentTime / duration : 0;
    const playheadX = progressNorm * width;

    for (let i = 0; i < effectivePeaks.length; i++) {
      const x = i * barWidth;
      const peakVal = effectivePeaks[i];
      const barHeight = Math.max(3, peakVal * (height * 0.82));
      const y = midY - barHeight / 2;

      // Color coding: already played vs upcoming
      const isPlayed = x <= playheadX;
      if (isPlayed) {
        if (deckTheme === 'crimson') {
          ctx.fillStyle = '#BC0202';
        } else {
          ctx.fillStyle = '#FF0000';
        }
      } else {
        ctx.fillStyle = '#3a3a3a';
      }

      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }

    // Real-time Frequency Spectrum bars (subtle dancing overlay at bottom)
    if (frequencies && isPlaying) {
      const freqBars = Math.min(64, frequencies.length);
      const fWidth = width / freqBars;
      for (let f = 0; f < freqBars; f++) {
        const fHeight = (frequencies[f] / 255) * (height * 0.35);
        ctx.fillStyle = deckTheme === 'crimson' ? 'rgba(255, 70, 70, 0.35)' : 'rgba(255, 100, 100, 0.35)';
        ctx.fillRect(f * fWidth, height - fHeight, fWidth - 1, fHeight);
      }
    }

    // Draw Cue Point Marker
    if (cuePoint > 0 && duration > 0) {
      const cueX = (cuePoint / duration) * width;
      ctx.fillStyle = '#38bdf8'; // Cyan cue marker
      ctx.beginPath();
      ctx.moveTo(cueX - 6, 0);
      ctx.lineTo(cueX + 6, 0);
      ctx.lineTo(cueX, 10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cueX, 0);
      ctx.lineTo(cueX, height);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('CUE', cueX + 3, 18);
    }

    // Draw Playhead
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = deckTheme === 'crimson' ? '#BC0202' : '#FF0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Playhead arrow indicator at top
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 9);
    ctx.closePath();
    ctx.fill();
  }, [peaks, currentTime, duration, isPlaying, cuePoint, isLooping, loopStart, loopEnd, deckTheme, frequencies]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-20 bg-pitch-black rounded-lg overflow-hidden border border-neutral-800 shadow-inner cursor-pointer select-none group"
      title="Click or drag to scrub track"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full block"
        role="img"
        aria-label="Interactive track audio waveform visualizer"
      />
      <div className="absolute top-1 right-2 text-[10px] font-mono text-neutral-400 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
        SCRUB / SEEK
      </div>
    </div>
  );
};
