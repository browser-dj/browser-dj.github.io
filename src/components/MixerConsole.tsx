import React from 'react';
import { Sliders, Sparkles, Volume2, RefreshCw, Headphones } from 'lucide-react';
import type { DeckState } from '../utils/AudioEngine';

interface MixerConsoleProps {
  deckAState: DeckState;
  deckBState: DeckState;
  crossfader: number; // -1 to 1
  masterVolume: number; // 0 to 1
  isAutoMixing: boolean;
  autoMixProgress: number; // 0 to 1
  vuLevels: { left: number; right: number };
  cueActiveA: boolean;
  cueActiveB: boolean;
  headphoneVolume: number;
  headphoneMix: number;
  isSplitCue: boolean;
  onCrossfaderChange: (val: number) => void;
  onMasterVolumeChange: (vol: number) => void;
  onDeckVolumeChange: (deck: 'A' | 'B', vol: number) => void;
  onEQChange: (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number) => void;
  onEQKillToggle: (deck: 'A' | 'B', band: 'high' | 'mid' | 'low') => void;
  onTriggerAutoMix: () => void;
  onToggleCue: (deck: 'A' | 'B') => void;
  onHeadphoneVolumeChange: (vol: number) => void;
  onHeadphoneMixChange: (mix: number) => void;
  onSplitCueToggle: () => void;
  langLabels: {
    title: string;
    masterVolume: string;
    crossfader: string;
    autoMix: string;
    autoMixActive: string;
    high: string;
    mid: string;
    low: string;
    volume: string;
    headphoneTitle?: string;
    headphoneCue?: string;
    cueDeckA?: string;
    cueDeckB?: string;
    headphoneMix?: string;
    splitCue?: string;
    splitCueDesc?: string;
    headphoneVol?: string;
  };
}

export const MixerConsole: React.FC<MixerConsoleProps> = ({
  deckAState,
  deckBState,
  crossfader,
  masterVolume,
  isAutoMixing,
  autoMixProgress,
  vuLevels,
  cueActiveA,
  cueActiveB,
  headphoneVolume,
  headphoneMix,
  isSplitCue,
  onCrossfaderChange,
  onMasterVolumeChange,
  onDeckVolumeChange,
  onEQChange,
  onEQKillToggle,
  onTriggerAutoMix,
  onToggleCue,
  onHeadphoneVolumeChange,
  onHeadphoneMixChange,
  onSplitCueToggle,
  langLabels,
}) => {
  // LED VU meter bar generator (12 LED steps per channel)
  const renderVUSegments = (level: number) => {
    const steps = 12;
    const activeSteps = Math.round(level * steps);

    return (
      <div className="flex flex-col-reverse gap-0.5 h-28 sm:h-36 w-2.5 sm:w-3 bg-neutral-950 p-0.5 rounded border border-neutral-800">
        {Array.from({ length: steps }).map((_, i) => {
          const isActive = i < activeSteps;
          let color = 'bg-neutral-800';
          if (isActive) {
            if (i >= 10) color = 'bg-pure-red shadow-[0_0_6px_#ff0000]'; // peak red
            else if (i >= 8) color = 'bg-amber-400 shadow-[0_0_5px_#f59e0b]'; // warm amber
            else color = 'bg-emerald-400 shadow-[0_0_4px_#10b981]'; // healthy green
          }
          return (
            <div
              key={i}
              className={`w-full flex-1 rounded-[1px] transition-all duration-75 ${color}`}
            />
          );
        })}
      </div>
    );
  };

  const remainingAutoMixSeconds = ((1 - autoMixProgress) * 5).toFixed(1);

  // Helper to render an EQ band with title + value + kill button on row 1, and full-width slider on row 2
  const renderEQBand = (
    deck: 'A' | 'B',
    band: 'high' | 'mid' | 'low',
    label: string,
    value: number,
    isKilled: boolean,
    accentClass: string
  ) => {
    const displayValue = isKilled ? 'KILL' : `${value > 0 ? `+${value}` : value}dB`;
    const valueColorClass = isKilled
      ? 'text-rose-400 font-black'
      : value > 0
      ? 'text-pure-red font-bold'
      : value < 0
      ? 'text-sky-400 font-bold'
      : 'text-neutral-400';

    return (
      <div className="flex flex-col my-1.5 w-full">
        {/* Row 1: Label on left, dB Value & Kill Button on right */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono mb-1 gap-1">
          <span className="text-neutral-400 font-bold uppercase">{label}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono ${valueColorClass}`}>
              {displayValue}
            </span>
            <button
              type="button"
              onClick={() => onEQKillToggle(deck, band)}
              className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-bold border transition ${
                isKilled
                  ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_6px_#f43f5e]'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
              title={`Kill ${label}`}
            >
              K
            </button>
          </div>
        </div>

        {/* Row 2: Full-width Slider */}
        <div className="relative flex items-center w-full" style={{ touchAction: 'none' }}>
          <input
            type="range"
            min="-30"
            max="6"
            step="1"
            value={value}
            onChange={(e) => onEQChange(deck, band, parseFloat(e.target.value))}
            aria-label={`Deck ${deck} ${label} EQ`}
            className={`w-full h-2 ${accentClass} bg-neutral-800 rounded cursor-pointer touch-none`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-neutral-900/95 dark:bg-pitch-black border border-neutral-800 rounded-2xl p-3 sm:p-4 md:p-5 shadow-2xl relative overflow-hidden w-full">
      {/* Top Console Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-3 sm:pb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Sliders className="w-4 h-4 text-bright-crimson shrink-0" />
          <h2 className="text-xs sm:text-sm font-black tracking-widest text-neutral-200 truncate">
            {langLabels.title}
          </h2>
        </div>

        {/* Master Output Level Knob/Slider */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 uppercase hidden xs:inline">
            MASTER
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
            aria-label="Master Output Volume"
            className="w-14 xs:w-18 sm:w-24 h-2 accent-bright-crimson bg-neutral-800 rounded cursor-pointer touch-none"
          />
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-300 w-7 sm:w-8 text-right">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>

      {/* 3-Band Studio EQ Section (Responsive: Stacks on mobile, Side-by-side on sm+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-3 sm:mb-5">
        {/* DECK A EQ Card */}
        <div className="flex flex-col bg-neutral-950/60 p-2.5 sm:p-3 rounded-xl border border-neutral-800">
          <div className="text-[10px] sm:text-[11px] font-black text-[#BC0202] tracking-wider mb-1.5 flex items-center justify-between">
            <span>EQ [DECK A]</span>
            <span className="text-[9px] font-mono text-neutral-500">HI/MID/LOW</span>
          </div>

          {renderEQBand(
            'A',
            'high',
            langLabels.high,
            deckAState.eq.high,
            deckAState.eq.killHigh,
            'accent-bright-crimson'
          )}
          {renderEQBand(
            'A',
            'mid',
            langLabels.mid,
            deckAState.eq.mid,
            deckAState.eq.killMid,
            'accent-bright-crimson'
          )}
          {renderEQBand(
            'A',
            'low',
            langLabels.low,
            deckAState.eq.low,
            deckAState.eq.killLow,
            'accent-bright-crimson'
          )}
        </div>

        {/* DECK B EQ Card */}
        <div className="flex flex-col bg-neutral-950/60 p-2.5 sm:p-3 rounded-xl border border-neutral-800">
          <div className="text-[10px] sm:text-[11px] font-black text-pure-red tracking-wider mb-1.5 flex items-center justify-between">
            <span>EQ [DECK B]</span>
            <span className="text-[9px] font-mono text-neutral-500">HI/MID/LOW</span>
          </div>

          {renderEQBand(
            'B',
            'high',
            langLabels.high,
            deckBState.eq.high,
            deckBState.eq.killHigh,
            'accent-pure-red'
          )}
          {renderEQBand(
            'B',
            'mid',
            langLabels.mid,
            deckBState.eq.mid,
            deckBState.eq.killMid,
            'accent-pure-red'
          )}
          {renderEQBand(
            'B',
            'low',
            langLabels.low,
            deckBState.eq.low,
            deckBState.eq.killLow,
            'accent-pure-red'
          )}
        </div>
      </div>

      {/* Middle Channel Faders & Stereo VU Meters */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center justify-center bg-neutral-950/70 p-2.5 sm:p-4 rounded-xl border border-neutral-800 mb-3 sm:mb-4">
        {/* Deck A Level Fader */}
        <div className="col-span-4 flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] font-mono text-[#BC0202] font-black mb-1">
            CH A
          </span>
          <div className="relative flex items-center justify-center h-28 sm:h-32 my-1" style={{ touchAction: 'none' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={deckAState.volume}
              onChange={(e) => onDeckVolumeChange('A', parseFloat(e.target.value))}
              aria-label="Deck A Channel Volume Fader"
              className="h-28 sm:h-32 w-3 accent-bright-crimson cursor-pointer -rotate-90 appearance-none bg-neutral-800 rounded touch-none"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400">
            {Math.round(deckAState.volume * 100)}%
          </span>
        </div>

        {/* Center Stereo Master VU Meter */}
        <div className="col-span-4 flex flex-col items-center justify-center">
          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
            L | VU | R
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {renderVUSegments(vuLevels.left)}
            {renderVUSegments(vuLevels.right)}
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 mt-1">
            0 dB PEAK
          </span>
        </div>

        {/* Deck B Level Fader */}
        <div className="col-span-4 flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] font-mono text-pure-red font-black mb-1">
            CH B
          </span>
          <div className="relative flex items-center justify-center h-28 sm:h-32 my-1" style={{ touchAction: 'none' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={deckBState.volume}
              onChange={(e) => onDeckVolumeChange('B', parseFloat(e.target.value))}
              aria-label="Deck B Channel Volume Fader"
              className="h-28 sm:h-32 w-3 accent-pure-red cursor-pointer -rotate-90 appearance-none bg-neutral-800 rounded touch-none"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400">
            {Math.round(deckBState.volume * 100)}%
          </span>
        </div>
      </div>

      {/* HEADPHONE CUE & MONITOR (PFL - PRE-FADE LISTEN) */}
      <div className="bg-neutral-950/90 p-2.5 sm:p-3 rounded-xl border border-neutral-800 mb-3 shadow-inner">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-400 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-neutral-200">
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>{langLabels.headphoneTitle || 'HEADPHONE CUE & MONITOR'}</span>
          </div>
          {(cueActiveA || cueActiveB) && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              PFL ACTIVE
            </span>
          )}
        </div>

        {/* Headphone Cue Buttons for Deck A and Deck B */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* CUE A */}
          <button
            type="button"
            onClick={() => onToggleCue('A')}
            className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black tracking-wider transition flex items-center justify-center gap-1.5 border active:scale-95 select-none ${
              cueActiveA
                ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow-[0_0_14px_rgba(245,158,11,0.6)] font-black'
                : 'bg-neutral-850 bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Listen to Deck A pre-fader in headphones"
          >
            <Headphones className="w-3 h-3" />
            <span>{cueActiveA ? 'CUE A [ON]' : 'CUE A'}</span>
          </button>

          {/* CUE B */}
          <button
            type="button"
            onClick={() => onToggleCue('B')}
            className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black tracking-wider transition flex items-center justify-center gap-1.5 border active:scale-95 select-none ${
              cueActiveB
                ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow-[0_0_14px_rgba(245,158,11,0.6)] font-black'
                : 'bg-neutral-850 bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Listen to Deck B pre-fader in headphones"
          >
            <Headphones className="w-3 h-3" />
            <span>{cueActiveB ? 'CUE B [ON]' : 'CUE B'}</span>
          </button>
        </div>

        {/* Headphone Cue / Master Mix Blend */}
        <div className="mb-2 bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-800/80">
          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 mb-1">
            <span className={headphoneMix < 0.4 ? 'text-amber-400 font-bold' : ''}>◀ CUE (PREVIEW)</span>
            <span className="text-neutral-500 font-bold">{Math.round(headphoneMix * 100)}%</span>
            <span className={headphoneMix > 0.6 ? 'text-pure-red font-bold' : ''}>MASTER (ROOM) ▶</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={headphoneMix}
            onChange={(e) => onHeadphoneMixChange(parseFloat(e.target.value))}
            aria-label="Headphone Cue to Master Mix Slider"
            className="w-full h-3 accent-amber-400 bg-neutral-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1 mt-1 text-[8px] font-mono">
            <button
              type="button"
              onClick={() => onHeadphoneMixChange(0)}
              className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              100% CUE
            </button>
            <button
              type="button"
              onClick={() => onHeadphoneMixChange(0.5)}
              className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold"
            >
              50/50 BLEND
            </button>
            <button
              type="button"
              onClick={() => onHeadphoneMixChange(1)}
              className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              MASTER
            </button>
          </div>
        </div>

        {/* Split Cue Mode (Stereo Split) */}
        <button
          type="button"
          onClick={onSplitCueToggle}
          className={`w-full py-1 px-2 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold transition flex items-center justify-between border active:scale-95 select-none ${
            isSplitCue
              ? 'bg-sky-600/90 border-sky-400 text-white shadow-[0_0_10px_rgba(2,132,199,0.5)]'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Split Cue: Left ear hears Master (crowd), Right ear hears Cued incoming track"
        >
          <span>{langLabels.splitCue || 'SPLIT CUE'}</span>
          <span className="text-[8px] font-mono opacity-80">
            {isSplitCue ? 'L: MASTER | R: CUE' : 'STEREO MIX'}
          </span>
        </button>

        {/* Headphone Volume */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-neutral-900 text-[9px] font-mono text-neutral-400">
          <span className="shrink-0">{langLabels.headphoneVol || 'PHONES VOL'}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={headphoneVolume}
            onChange={(e) => onHeadphoneVolumeChange(parseFloat(e.target.value))}
            aria-label="Headphone Volume"
            className="w-full h-2 accent-amber-400 bg-neutral-800 rounded cursor-pointer"
          />
          <span className="shrink-0 w-8 text-right font-mono text-neutral-300">
            {Math.round(headphoneVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Prominent AutoMIX (5s) Button */}
      <div className="mb-3 sm:mb-4">
        <button
          type="button"
          onClick={onTriggerAutoMix}
          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-black text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 transition-all select-none border-2 touch-manipulation ${
            isAutoMixing
              ? 'bg-pure-red text-white border-white animate-pulse shadow-[0_0_35px_rgba(255,0,0,0.8)]'
              : 'bg-gradient-to-r from-deep-crimson via-bright-crimson to-pure-red text-white border-pure-red/50 hover:brightness-110 active:scale-[0.99] shadow-[0_0_20px_rgba(188,2,2,0.4)]'
          }`}
          title="Algorithmically crossfades to the other deck over 5 seconds while triggering playback"
        >
          {isAutoMixing ? (
            <>
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span>
                {langLabels.autoMixActive} ({remainingAutoMixSeconds}s)
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{langLabels.autoMix}</span>
            </>
          )}
        </button>

        {/* Animated Progress Bar for AutoMIX */}
        {isAutoMixing && (
          <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden mt-1.5 border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-pure-red to-amber-400 transition-all duration-75 ease-out shadow-[0_0_8px_#ff0000]"
              style={{ width: `${Math.round(autoMixProgress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Master Crossfader */}
      <div className="bg-neutral-950/80 p-2.5 sm:p-4 rounded-xl border border-neutral-800">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-400 mb-1.5 sm:mb-2 font-bold">
          <span className="text-[#BC0202]">DECK A</span>
          <span className="text-neutral-500 uppercase">{langLabels.crossfader}</span>
          <span className="text-pure-red">DECK B</span>
        </div>

        {/* Crossfader Slider with touch-action: none */}
        <div className="relative flex items-center py-1" style={{ touchAction: 'none' }}>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={crossfader}
            onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))}
            aria-label="Master DJ Crossfader"
            className="w-full h-5 sm:h-6 accent-pure-red bg-neutral-800 rounded-lg cursor-pointer touch-none"
          />
        </div>

        {/* Center Indicator and Percentage */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-neutral-400 mt-1 px-1">
          <button
            type="button"
            onClick={() => onCrossfaderChange(-1)}
            className="hover:text-white p-1"
          >
            ◀ 100% A
          </button>
          <button
            type="button"
            onClick={() => onCrossfaderChange(0)}
            className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[9px] border border-neutral-700"
            title="Center Crossfader"
          >
            CENTER
          </button>
          <button
            type="button"
            onClick={() => onCrossfaderChange(1)}
            className="hover:text-white p-1"
          >
            100% B ▶
          </button>
        </div>
      </div>
    </div>
  );
};
