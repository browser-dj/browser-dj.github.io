import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Music, Upload, Sliders, Volume2, Headphones } from 'lucide-react';
import { WaveformCanvas } from './WaveformCanvas';
import { JogWheel } from './JogWheel';
import type { TrackMetadata, DeckId, SamplerPadState } from '../utils/AudioEngine';

interface DeckComponentProps {
  deckId: DeckId;
  track: TrackMetadata | null;
  nextTrack: TrackMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  pitch: number;
  bpm: number;
  cuePoint: number;
  isLooping: boolean;
  loopStart: number;
  loopEnd: number;
  loopBeats: number | null;
  audioLevel: number;
  frequencies?: Uint8Array;
  beatPads?: SamplerPadState[];
  isHeadphoneCueActive?: boolean;
  onPlayPause: () => void;
  onCue: () => void;
  onSync: () => void;
  onPitchChange: (newPitch: number) => void;
  onPitchBend: (amount: number) => void;
  onResetPitchBend: () => void;
  onSeek: (seconds: number) => void;
  onScratch: (deltaSeconds: number) => void;
  onSetLoop: (beats: number | null) => void;
  onToggleBeatPad?: (padIndex: number) => void;
  onStopAllBeatPads?: () => void;
  onLoadBeatPadFile?: (padIndex: number, file: File) => void;
  onLoadNextTrack?: () => void;
  onLoadBeatFromDevice?: (file: File) => void;
  onToggleHeadphoneCue?: () => void;
  deckTheme: 'crimson' | 'red';
  langLabels: {
    play: string;
    pause: string;
    cue: string;
    sync: string;
    pitch: string;
    bpm: string;
    loop: string;
    loopExit: string;
    fourBeats: string;
    selectBeatFromDevice: string;
    fourBeatsActive: string;
    beatPadsTitle?: string;
    beatPadTip?: string;
    loadCustomBeat?: string;
    stopAllPads?: string;
    upNextTitle: string;
    noUpcomingTrack: string;
    loadNextNow: string;
    tempoRange: string;
    fineNudge: string;
    noTrack: string;
    reset: string;
    headphoneCue?: string;
  };
}

export const DeckComponent: React.FC<DeckComponentProps> = ({
  deckId,
  track,
  nextTrack,
  isPlaying,
  currentTime,
  duration,
  pitch,
  bpm,
  cuePoint,
  isLooping,
  loopStart,
  loopEnd,
  loopBeats,
  frequencies,
  beatPads,
  isHeadphoneCueActive,
  onPlayPause,
  onCue,
  onSync,
  onPitchChange,
  onPitchBend,
  onResetPitchBend,
  onSeek,
  onScratch,
  onSetLoop,
  onToggleBeatPad,
  onStopAllBeatPads,
  onLoadBeatPadFile,
  onLoadNextTrack,
  onLoadBeatFromDevice,
  onToggleHeadphoneCue,
  deckTheme,
  langLabels,
}) => {
  const isCrimson = deckTheme === 'crimson';
  const effectiveBpm = (bpm * (1 + pitch)).toFixed(1);
  const pitchPercent = (pitch * 100).toFixed(1);
  const remainingTime = Math.max(0, duration - currentTime);

  // Selectable Pitch Range: ±6%, ±10%, ±16%, ±50% (Wide)
  const [pitchRange, setPitchRange] = useState<number>(0.16);
  const beatFileInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated 4-Beats Sampler Pad Input Refs (1 per pad)
  const pad0InputRef = useRef<HTMLInputElement | null>(null);
  const pad1InputRef = useRef<HTMLInputElement | null>(null);
  const pad2InputRef = useRef<HTMLInputElement | null>(null);
  const pad3InputRef = useRef<HTMLInputElement | null>(null);
  const padFileInputRefs = [pad0InputRef, pad1InputRef, pad2InputRef, pad3InputRef];
  const defaultPadLabels = ['KICK', 'CLAP', 'HI-HAT', 'BASS'];
  const isAnyPadPlaying = Boolean(beatPads?.some((p) => p.isPlaying));

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00.0';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Hot Cues internal state (up to 4 hot cues per deck)
  const [hotCues, setHotCues] = useState<Array<number | null>>([null, null, null, null]);

  const handleHotCue = (index: number) => {
    const existing = hotCues[index];
    if (existing !== null) {
      onSeek(existing);
    } else {
      const updated = [...hotCues];
      updated[index] = currentTime;
      setHotCues(updated);
    }
  };

  const clearHotCue = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = [...hotCues];
    updated[index] = null;
    setHotCues(updated);
  };

  // Fine pitch adjustment helper
  const adjustPitchBy = (delta: number) => {
    const nextVal = Math.max(-pitchRange, Math.min(pitchRange, pitch + delta));
    onPitchChange(nextVal);
  };

  // Handle Beat file from device
  const handleBeatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onLoadBeatFromDevice) {
      const file = e.target.files[0];
      onLoadBeatFromDevice(file);
      e.target.value = '';
    }
  };

  return (
    <div
      className={`flex flex-col bg-neutral-900/90 dark:bg-pitch-black border ${
        isCrimson ? 'border-[#830000]/60' : 'border-[#BC0202]/60'
      } rounded-2xl p-3 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300 w-full`}
    >
      {/* Hidden 4-Beat Device File Input */}
      <input
        ref={beatFileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
        onChange={handleBeatFileChange}
        className="hidden"
      />

      {/* Deck Header: ID & Track Name */}
      <div className="flex items-center justify-between gap-1.5 border-b border-neutral-800 pb-2.5 mb-2.5 sm:pb-3 sm:mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-1 text-[11px] sm:text-xs font-black rounded-md tracking-wider shrink-0 ${
              isCrimson
                ? 'bg-deep-crimson text-white shadow-[0_0_12px_rgba(131,0,0,0.8)]'
                : 'bg-pure-red text-white shadow-[0_0_12px_rgba(255,0,0,0.8)]'
            }`}
          >
            DECK {deckId}
          </span>
          <div className="flex flex-col min-w-0">
            <h3
              className="text-xs sm:text-base font-bold text-neutral-100 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[240px]"
              title={track ? track.name : langLabels.noTrack}
            >
              {track ? track.name : langLabels.noTrack}
            </h3>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 truncate max-w-[130px] xs:max-w-[180px]">
              {track ? track.artist : '100% Client-Side'}
            </span>
          </div>
        </div>

        {/* Headphone Cue / PFL Monitor Button */}
        {onToggleHeadphoneCue && (
          <button
            type="button"
            onClick={onToggleHeadphoneCue}
            className={`px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wider transition flex items-center gap-1 border active:scale-95 select-none shrink-0 ${
              isHeadphoneCueActive
                ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow-[0_0_12px_#f59e0b] animate-pulse'
                : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-amber-400'
            }`}
            title="Toggle Headphone Cue (Pre-Fade Listen) for this deck"
          >
            <Headphones className="w-3 h-3" />
            <span>{isHeadphoneCueActive ? '🎧 CUE ON' : '🎧 CUE'}</span>
          </button>
        )}

        {/* BPM & Pitch Display */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="bg-neutral-950 px-2 py-0.5 sm:py-1 rounded border border-neutral-800 flex flex-col items-end">
            <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">BPM</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 tracking-tight">
              {effectiveBpm}
            </div>
          </div>
          <div className="bg-neutral-950 px-2 py-0.5 sm:py-1 rounded border border-neutral-800 flex flex-col items-end">
            <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">PITCH</div>
            <div
              className={`text-xs sm:text-sm font-mono font-bold ${
                pitch === 0
                  ? 'text-neutral-300'
                  : pitch > 0
                  ? 'text-pure-red'
                  : 'text-sky-400'
              }`}
            >
              {pitch > 0 ? `+${pitchPercent}` : `${pitchPercent}`}%
            </div>
          </div>
        </div>
      </div>

      {/* Up Next Song Selection Bar */}
      <div className="flex items-center justify-between bg-neutral-950/80 px-2.5 py-1.5 rounded-lg border border-neutral-800 mb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
            {langLabels.upNextTitle}
          </span>
          <span className="truncate text-neutral-300 font-medium text-[11px]">
            {nextTrack ? nextTrack.name : langLabels.noUpcomingTrack}
          </span>
        </div>
        {nextTrack && onLoadNextTrack && (
          <button
            type="button"
            onClick={onLoadNextTrack}
            className="px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-deep-crimson to-bright-crimson hover:brightness-110 text-white transition shrink-0 active:scale-95 shadow-[0_0_8px_rgba(188,2,2,0.4)]"
            title="Load this queued track now into this deck"
          >
            {langLabels.loadNextNow}
          </button>
        )}
      </div>

      {/* Time Readout: Current & Remaining */}
      <div className="flex items-center justify-between text-xs font-mono bg-neutral-950/80 px-2.5 py-1.5 rounded-lg border border-neutral-800 mb-2.5">
        <div className="flex items-center gap-1.5 text-neutral-200">
          <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase">TIME</span>
          <span className="font-bold text-xs sm:text-sm tracking-wider">{formatTime(currentTime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase">REMAIN</span>
          <span className="font-bold text-xs sm:text-sm tracking-wider text-rose-400">
            -{formatTime(remainingTime)}
          </span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="mb-3">
        <WaveformCanvas
          peaks={track?.peaks || []}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          cuePoint={cuePoint}
          isLooping={isLooping}
          loopStart={loopStart}
          loopEnd={loopEnd}
          deckTheme={deckTheme}
          frequencies={frequencies}
          onSeek={onSeek}
        />
      </div>

      {/* Center Deck Area: Jog Wheel & Super User-Friendly Pitch Control */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center justify-center mb-3">
        {/* Jog Wheel */}
        <div className="col-span-7 xs:col-span-8 sm:col-span-8 flex justify-center overflow-hidden">
          <JogWheel
            deckId={deckId}
            isPlaying={isPlaying}
            pitch={pitch}
            deckTheme={deckTheme}
            onScratch={onScratch}
            onTapCenter={onPlayPause}
          />
        </div>

        {/* User-Friendly Pro Pitch / Tempo Console */}
        <div className="col-span-5 xs:col-span-4 sm:col-span-4 flex flex-col items-center bg-neutral-950/80 p-2 sm:p-2.5 rounded-xl border border-neutral-800 shrink-0">
          {/* Header with Range Selector */}
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[9px] font-mono text-neutral-400 font-bold">
              TEMPO
            </span>
            {/* Range Toggle */}
            <button
              type="button"
              onClick={() => {
                const ranges = [0.06, 0.1, 0.16, 0.5];
                const nextIdx = (ranges.indexOf(pitchRange) + 1) % ranges.length;
                setPitchRange(ranges[nextIdx]);
              }}
              className="text-[8px] font-mono px-1 py-0.5 rounded bg-neutral-850 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition"
              title="Click to cycle pitch range (±6%, ±10%, ±16%, ±50%)"
            >
              ±{Math.round(pitchRange * 100)}%
            </button>
          </div>

          {/* Reset Pitch Button */}
          <button
            type="button"
            onClick={() => onPitchChange(0)}
            className={`text-[9px] font-mono px-2 py-0.5 mb-1.5 w-full rounded border font-bold transition ${
              pitch === 0
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.3)]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
            title="Reset pitch to 0.0%"
          >
            {pitch === 0 ? '✓ 0.0%' : 'RESET (0%)'}
          </button>

          {/* Vertical Precision Slider */}
          <div className="relative flex items-center justify-center h-24 sm:h-28 my-1 w-full" style={{ touchAction: 'none' }}>
            <input
              type="range"
              min={-pitchRange}
              max={pitchRange}
              step="0.001"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              aria-label={`Pitch tempo slider for Deck ${deckId}`}
              className="h-24 sm:h-28 w-3 accent-bright-crimson cursor-pointer -rotate-90 appearance-none bg-neutral-800 rounded touch-none"
            />
          </div>

          {/* Quick Fine Nudge Buttons: [-0.1%] [+0.1%] */}
          <div className="grid grid-cols-2 gap-1 w-full mt-1.5">
            <button
              type="button"
              onClick={() => adjustPitchBy(-0.005)}
              className="py-0.5 text-[9px] font-mono font-bold bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded text-neutral-300 border border-neutral-700 transition"
              title="Nudge -0.5%"
            >
              -0.5%
            </button>
            <button
              type="button"
              onClick={() => adjustPitchBy(0.005)}
              className="py-0.5 text-[9px] font-mono font-bold bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded text-neutral-300 border border-neutral-700 transition"
              title="Nudge +0.5%"
            >
              +0.5%
            </button>
          </div>

          {/* Pitch Bend Temporary Push/Pull Buttons */}
          <div className="grid grid-cols-2 gap-1 w-full mt-1">
            <button
              type="button"
              onMouseDown={() => onPitchBend(-0.04)}
              onMouseUp={onResetPitchBend}
              onTouchStart={() => onPitchBend(-0.04)}
              onTouchEnd={onResetPitchBend}
              className="py-1 flex items-center justify-center text-[10px] font-black bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded text-neutral-300 border border-neutral-700"
              title="Temporary Pitch Bend Slow (Hold)"
            >
              ◀ BEND
            </button>
            <button
              type="button"
              onMouseDown={() => onPitchBend(0.04)}
              onMouseUp={onResetPitchBend}
              onTouchStart={() => onPitchBend(0.04)}
              onTouchEnd={onResetPitchBend}
              className="py-1 flex items-center justify-center text-[10px] font-black bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded text-neutral-300 border border-neutral-700"
              title="Temporary Pitch Bend Fast (Hold)"
            >
              BEND ▶
            </button>
          </div>
        </div>
      </div>

      {/* 4-BEATS SAMPLER (PLAYS CONCURRENTLY OVER MAIN SONG) */}
      <div className="bg-neutral-950/90 p-2.5 rounded-xl border border-neutral-800 mb-3 shadow-inner">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-neutral-400 mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-200 tracking-wide">
              {langLabels.beatPadsTitle || '4-BEATS SAMPLER (PLAYS OVER SONG)'}
            </span>
            {isAnyPadPlaying && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                LAYER ACTIVE
              </span>
            )}
          </div>
          {isAnyPadPlaying && (
            <button
              type="button"
              onClick={onStopAllBeatPads}
              className="text-[9px] font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2 transition"
            >
              {langLabels.stopAllPads || 'Stop Beats'}
            </button>
          )}
        </div>

        {/* 4 Sampler Beat Pads */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-1.5">
          {[0, 1, 2, 3].map((padIdx) => {
            const padState = beatPads?.[padIdx];
            const isPadPlaying = Boolean(padState?.isPlaying);
            const padName = padState?.name || `Beat ${padIdx + 1}: ${defaultPadLabels[padIdx]}`;
            const isCustom = Boolean(padState?.hasCustomBuffer);

            return (
              <div
                key={padIdx}
                className={`relative rounded-lg p-2 border transition-all flex flex-col justify-between select-none ${
                  isPadPlaying
                    ? 'bg-gradient-to-b from-emerald-950/90 to-neutral-900 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Hidden File Input for this specific pad */}
                <input
                  type="file"
                  ref={padFileInputRefs[padIdx]}
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onLoadBeatPadFile) {
                      onLoadBeatPadFile(padIdx, file);
                    }
                    e.target.value = '';
                  }}
                />

                {/* Pad Header: Pad number + Device File Picker */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono font-bold text-neutral-400">
                    PAD {padIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      padFileInputRefs[padIdx].current?.click();
                    }}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition"
                    title={langLabels.loadCustomBeat || 'Load Beat from Device'}
                  >
                    <Upload className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Pad Trigger Button (Toggles concurrent loop playback) */}
                <button
                  type="button"
                  onClick={() => onToggleBeatPad?.(padIdx)}
                  aria-label={`Deck ${deckId} Beat Pad ${padIdx + 1}: ${padName}`}
                  aria-pressed={isPadPlaying}
                  className="w-full text-left active:scale-95 transition"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isPadPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] font-black truncate ${
                        isPadPlaying ? 'text-emerald-300' : 'text-neutral-200'
                      }`}
                      title={padName}
                    >
                      {padName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-mono text-neutral-400">
                    <span>{isPadPlaying ? 'PLAYING' : 'TAP TO PLAY'}</span>
                    {isCustom && <span className="text-amber-400 font-bold">CUSTOM</span>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Tip text */}
        <div className="text-[8px] sm:text-[9px] font-mono text-neutral-400 text-center">
          {langLabels.beatPadTip || 'Plays simultaneously with main track • Tap upload icon to load custom beat'}
        </div>
      </div>

      {/* TRACK AUTO-LOOP SECTION */}
      <div className="bg-neutral-950/80 p-2 rounded-xl border border-neutral-800 mb-3">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-neutral-400 mb-1.5 px-1">
          <span className="font-bold">TRACK AUTO-LOOP</span>
          {isLooping && (
            <span className="text-emerald-400 font-bold animate-pulse text-[9px]">
              {loopBeats === 4 ? langLabels.fourBeatsActive : `LOOP (${loopBeats}B)`}
            </span>
          )}
        </div>

        {/* Standard Loop Length Buttons */}
        <div className="grid grid-cols-6 gap-1">
          {[0.5, 1, 2, 4, 8].map((beats) => (
            <button
              key={beats}
              type="button"
              onClick={() => onSetLoop(loopBeats === beats && isLooping ? null : beats)}
              className={`py-1 text-[10px] sm:text-[11px] font-mono font-bold rounded transition border ${
                loopBeats === beats && isLooping
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_8px_#10b981]'
                  : 'bg-neutral-800/90 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {beats === 0.5 ? '½' : beats}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onSetLoop(null)}
            disabled={!isLooping}
            className={`py-1 text-[9px] sm:text-[10px] font-mono font-bold rounded transition border ${
              isLooping
                ? 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900'
                : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Hot Cues Section */}
      <div className="bg-neutral-950/80 p-2 rounded-xl border border-neutral-800 mb-3">
        <div className="text-[9px] sm:text-[10px] font-mono text-neutral-400 mb-1 px-1">
          HOT CUES
        </div>
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
          {hotCues.map((cue, idx) => (
            <div key={idx} className="relative group">
              <button
                type="button"
                onClick={() => handleHotCue(idx)}
                className={`w-full py-1 text-[11px] sm:text-xs font-mono font-bold rounded-lg border transition flex flex-col items-center justify-center ${
                  cue !== null
                    ? 'bg-sky-950/80 border-sky-500 text-sky-200 shadow-[0_0_8px_rgba(14,165,233,0.4)]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                }`}
              >
                <span>CUE {idx + 1}</span>
                <span className="text-[8px] sm:text-[9px] opacity-75">
                  {cue !== null ? formatTime(cue).slice(0, 5) : 'EMPTY'}
                </span>
              </button>
              {cue !== null && (
                <button
                  type="button"
                  onClick={(e) => clearHotCue(e, idx)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center opacity-70 group-hover:opacity-100 transition"
                  title="Clear Cue"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Big Tactile DJ Buttons: PLAY, CUE, SYNC */}
      {/* Massive touch hit-areas optimized for mobile and desktop */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-1">
        {/* CUE Button */}
        <button
          type="button"
          onClick={onCue}
          aria-label={`Deck ${deckId} Cue point return`}
          className="h-13 sm:h-16 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-400 text-neutral-950 font-black text-xs sm:text-base tracking-wider flex flex-col items-center justify-center border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all active:scale-95 select-none touch-manipulation"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span>{langLabels.cue}</span>
        </button>

        {/* PLAY / PAUSE Button */}
        <button
          type="button"
          onClick={onPlayPause}
          aria-label={`Deck ${deckId} ${isPlaying ? 'Pause' : 'Play'}`}
          aria-pressed={isPlaying}
          className={`h-13 sm:h-16 rounded-xl font-black text-xs sm:text-base tracking-wider flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-manipulation ${
            isPlaying
              ? 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 border-emerald-300 text-neutral-950 shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-pulse-fast'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-600 shadow-md'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span>{langLabels.pause}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 fill-current" />
              <span>{langLabels.play}</span>
            </>
          )}
        </button>

        {/* SYNC Button */}
        <button
          type="button"
          onClick={onSync}
          aria-label={`Deck ${deckId} Beat Sync`}
          className="h-13 sm:h-16 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-cyan-400 hover:text-cyan-300 font-black text-xs sm:text-base tracking-wider flex flex-col items-center justify-center border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all active:scale-95 select-none touch-manipulation"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span>{langLabels.sync}</span>
        </button>
      </div>
    </div>
  );
};
