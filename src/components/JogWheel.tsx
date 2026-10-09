import React, { useRef, useState, useEffect } from 'react';
import { Disc3 } from 'lucide-react';

interface JogWheelProps {
  deckId: 'A' | 'B';
  isPlaying: boolean;
  pitch: number;
  deckTheme: 'crimson' | 'red';
  onScratch: (deltaSeconds: number) => void;
  onTapCenter?: () => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  deckId,
  isPlaying,
  pitch,
  deckTheme,
  onScratch,
  onTapCenter,
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // Smooth rotation animation loop when track is playing
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updateRotation = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && !isDraggingRef.current) {
        // Standard vinyl 33.3 RPM = 200 degrees/sec, adjusted by pitch playback rate
        const speedMultiplier = 1.0 + pitch;
        const delta = 200 * speedMultiplier * dt;
        setRotationAngle((prev) => (prev + delta) % 360);
      }

      animId = requestAnimationFrame(updateRotation);
    };

    animId = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, pitch]);

  const getAngleFromEvent = (e: MouseEvent | TouchEvent): number => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const rad = Math.atan2(dy, dx);
    return (rad * 180) / Math.PI;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    const angle = getAngleFromEvent(e.nativeEvent);
    lastAngleRef.current = angle;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const angle = getAngleFromEvent(e.nativeEvent);
    let delta = angle - lastAngleRef.current;

    // Handle wrap-around across -180/180
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    lastAngleRef.current = angle;
    setRotationAngle((prev) => (prev + delta) % 360);

    // Delta in degrees mapped to audio scrub time (360 deg = 1.8 seconds)
    const timeDelta = (delta / 360) * 1.8;
    onScratch(timeDelta);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe
    }
  };

  const isCrimson = deckTheme === 'crimson';
  const rimColor = isCrimson ? 'border-[#830000]' : 'border-[#BC0202]';
  const glowShadow = isPlaying
    ? isCrimson
      ? 'shadow-[0_0_25px_rgba(188,2,2,0.45)]'
      : 'shadow-[0_0_25px_rgba(255,0,0,0.55)]'
    : 'shadow-none';

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2 w-full max-w-full">
      <div
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-36 h-36 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full cursor-grab active:cursor-grabbing select-none transition-shadow duration-300 ${glowShadow} touch-none shrink-0`}
        style={{ touchAction: 'none' }}
      >
        {/* Outer Strobe Rim */}
        <div
          className={`absolute inset-0 rounded-full border-[3px] sm:border-4 ${rimColor} bg-neutral-950 flex items-center justify-center overflow-hidden`}
        >
          {/* Subtle Strobe Teeth */}
          <div className="absolute inset-0 rounded-full border-[4px] sm:border-[6px] border-dashed border-neutral-800 opacity-60 pointer-events-none" />

          {/* Vinyl Grooves Texture */}
          <div
            className="absolute inset-1.5 sm:inset-2 rounded-full border border-neutral-800/80 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950"
            style={{
              backgroundImage: `radial-gradient(circle, transparent 40%, rgba(255, 255, 255, 0.03) 41%, transparent 43%),
                                radial-gradient(circle, transparent 55%, rgba(255, 255, 255, 0.04) 56%, transparent 58%),
                                radial-gradient(circle, transparent 70%, rgba(255, 255, 255, 0.03) 71%, transparent 73%)`,
            }}
          />

          {/* Rotating Vinyl Surface with Marker */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          >
            {/* White Position Cue Line */}
            <div className="absolute top-1.5 sm:top-2 w-1 sm:w-1.5 h-5 sm:h-7 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />

            {/* Red Accent Radial Streak */}
            <div
              className="absolute inset-0 rounded-full opacity-25"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${
                  isCrimson ? '#BC0202' : '#FF0000'
                } 40deg, transparent 90deg)`,
              }}
            />
          </div>

          {/* Center Record Label */}
          <button
            type="button"
            onClick={onTapCenter}
            className={`relative z-10 w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full ${
              isCrimson
                ? 'bg-gradient-to-br from-[#830000] to-[#BC0202]'
                : 'bg-gradient-to-br from-[#BC0202] to-[#FF0000]'
            } flex flex-col items-center justify-center shadow-lg border-2 border-white/20 active:scale-95 transition-transform`}
            title={`Deck ${deckId} - Tap to toggle Play/Pause`}
          >
            <Disc3
              className={`w-5 h-5 sm:w-7 sm:h-7 text-white ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            />
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-white mt-0.5">
              DECK {deckId}
            </span>
          </button>
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-1.5">
        SCRATCH / JOG
      </span>
    </div>
  );
};
