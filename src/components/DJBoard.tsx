import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DJAudioEngine, type TrackMetadata, type DeckState, type DeckId, type SamplerPadState } from '../utils/AudioEngine';
import { DeckComponent } from './DeckComponent';
import { MixerConsole } from './MixerConsole';
import { PlaylistManager } from './PlaylistManager';
import { Keyboard, Maximize2, Minimize2, Smartphone } from 'lucide-react';
import type { Translation } from '../i18n/translations';

interface DJBoardProps {
  t: Translation;
}

export const DJBoard: React.FC<DJBoardProps> = ({ t }) => {
  const engineRef = useRef<DJAudioEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Force horizontal layout on mobile / tablet in fullscreen
  const [forceHorizontal, setForceHorizontal] = useState(false);

  // Active view tab for Mobile / Tablet view: 'all' | 'deckA' | 'mixer' | 'deckB' | 'playlist'
  const [mobileTab, setMobileTab] = useState<'all' | 'deckA' | 'mixer' | 'deckB' | 'playlist'>('all');

  // Playlist Tracks
  const [tracks, setTracks] = useState<TrackMetadata[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [decodingStatus, setDecodingStatus] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);

  // Next Up Queues for Deck A and Deck B
  const [deckAQueue, setDeckAQueue] = useState<TrackMetadata[]>([]);
  const [deckBQueue, setDeckBQueue] = useState<TrackMetadata[]>([]);

  // Deck A State
  const [deckAState, setDeckAState] = useState<DeckState>({
    track: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    pitch: 0,
    bpm: 126,
    volume: 1.0,
    cuePoint: 0,
    isLooping: false,
    loopStart: 0,
    loopEnd: 0,
    loopBeats: null,
    eq: {
      high: 0,
      mid: 0,
      low: 0,
      killHigh: false,
      killMid: false,
      killLow: false,
    },
  });

  // Deck B State
  const [deckBState, setDeckBState] = useState<DeckState>({
    track: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    pitch: 0,
    bpm: 128,
    volume: 1.0,
    cuePoint: 0,
    isLooping: false,
    loopStart: 0,
    loopEnd: 0,
    loopBeats: null,
    eq: {
      high: 0,
      mid: 0,
      low: 0,
      killHigh: false,
      killMid: false,
      killLow: false,
    },
  });

  // 4-Beats Sampler Pads State (Deck A & Deck B)
  const [deckAPads, setDeckAPads] = useState<SamplerPadState[]>([
    { index: 0, name: 'Beat 1: Kick Loop', isPlaying: false, hasCustomBuffer: false },
    { index: 1, name: 'Beat 2: Clap Groove', isPlaying: false, hasCustomBuffer: false },
    { index: 2, name: 'Beat 3: Hi-Hats', isPlaying: false, hasCustomBuffer: false },
    { index: 3, name: 'Beat 4: Sub Bass', isPlaying: false, hasCustomBuffer: false },
  ]);
  const [deckBPads, setDeckBPads] = useState<SamplerPadState[]>([
    { index: 0, name: 'Beat 1: Kick Loop', isPlaying: false, hasCustomBuffer: false },
    { index: 1, name: 'Beat 2: Clap Groove', isPlaying: false, hasCustomBuffer: false },
    { index: 2, name: 'Beat 3: Hi-Hats', isPlaying: false, hasCustomBuffer: false },
    { index: 3, name: 'Beat 4: Sub Bass', isPlaying: false, hasCustomBuffer: false },
  ]);

  // Mixer State
  const [crossfader, setCrossfader] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [isAutoMixing, setIsAutoMixing] = useState(false);
  const [autoMixProgress, setAutoMixProgress] = useState(0);
  const [vuLevels, setVuLevels] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
  const [deckAFrequencies, setDeckAFrequencies] = useState<Uint8Array | undefined>(undefined);
  const [deckBFrequencies, setDeckBFrequencies] = useState<Uint8Array | undefined>(undefined);

  // Headphone Cue / PFL Monitoring State
  const [cueActiveA, setCueActiveA] = useState(false);
  const [cueActiveB, setCueActiveB] = useState(true);
  const [headphoneVolume, setHeadphoneVolume] = useState(0.85);
  const [headphoneMix, setHeadphoneMix] = useState(0.5);
  const [isSplitCue, setIsSplitCue] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);

  // Initialize AudioEngine on client
  useEffect(() => {
    engineRef.current = DJAudioEngine.getInstance();
    setDeckAPads(engineRef.current.getDeckPadStates('A'));
    setDeckBPads(engineRef.current.getDeckPadStates('B'));
    setCueActiveA(engineRef.current.cueActiveA);
    setCueActiveB(engineRef.current.cueActiveB);
    setHeadphoneVolume(engineRef.current.headphoneVolume);
    setHeadphoneMix(engineRef.current.headphoneMix);
    setIsSplitCue(engineRef.current.isSplitCue);

    const unsubscribe = engineRef.current.subscribeAutoMix((progress, active) => {
      setAutoMixProgress(progress);
      setIsAutoMixing(active);
      if (engineRef.current) {
        setCrossfader(engineRef.current.crossfaderPosition);
      }
    });

    const unsubPreview = engineRef.current.subscribePreview((trackId, isPlaying) => {
      setPreviewTrackId(isPlaying ? trackId : null);
    });

    // Auto-load built-in demo tracks
    handleLoadDemoTracks();

    // Listen for fullscreen change events (e.g. user pressed Esc)
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setForceHorizontal(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      unsubscribe();
      unsubPreview();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen Toggle Handler
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        // Request fullscreen on container so ONLY DJ board and song list show
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (container as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
        // On mobile / tablet, determine if we are already in landscape orientation
        const isLandscape = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
        setForceHorizontal(isLandscape);

        // Attempt screen orientation lock to landscape on mobile / tablet devices
        if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
          const orientation = window.screen.orientation as unknown as { lock?: (mode: string) => Promise<void> };
          if (orientation && typeof orientation.lock === 'function') {
            try {
              await orientation.lock('landscape');
              setForceHorizontal(true);
            } catch {
              // Orientation lock not permitted or supported on device
            }
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        }
        setIsFullscreen(false);
        setForceHorizontal(false);

        // Unlock orientation if supported
        if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
          const orientation = window.screen.orientation as unknown as { unlock?: () => void };
          if (orientation && typeof orientation.unlock === 'function') {
            try {
              orientation.unlock();
            } catch {
              // safe
            }
          }
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  // 60 FPS Animation loop for smooth playhead tracking and real-time audio meters
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const engine = engineRef.current;
      if (engine) {
        const timeA = engine.deckA.getCurrentTime();
        const timeB = engine.deckB.getCurrentTime();

        setDeckAState((prev) => ({
          ...prev,
          currentTime: timeA,
          isPlaying: engine.deckA.isPlaying,
        }));

        setDeckBState((prev) => ({
          ...prev,
          currentTime: timeB,
          isPlaying: engine.deckB.isPlaying,
        }));

        const masterLevels = engine.getMasterLevels();
        setVuLevels({ left: masterLevels.left, right: masterLevels.right });

        if (engine.deckA.isPlaying) {
          setDeckAFrequencies(engine.deckA.getFrequencyData());
        }
        if (engine.deckB.isPlaying) {
          setDeckBFrequencies(engine.deckB.getFrequencyData());
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      const engine = engineRef.current;
      if (!engine) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause('A');
          break;
        case 'KeyC':
          handleCue('A');
          break;
        case 'KeyQ':
          handleSync('A');
          break;
        case 'Enter':
          e.preventDefault();
          handlePlayPause('B');
          break;
        case 'KeyM':
          handleCue('B');
          break;
        case 'KeyP':
          handleSync('B');
          break;
        case 'ArrowLeft':
          handleCrossfaderChange(Math.max(-1, crossfader - 0.1));
          break;
        case 'ArrowRight':
          handleCrossfaderChange(Math.min(1, crossfader + 0.1));
          break;
        case 'KeyX':
          handleTriggerAutoMix();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [crossfader, deckAState, deckBState, isFullscreen]);

  // Handle Play/Pause
  const handlePlayPause = useCallback((deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.resumeContext();

    const deck = deckId === 'A' ? engine.deckA : engine.deckB;
    if (deck.isPlaying) {
      deck.pause();
    } else {
      deck.play();
    }

    if (deckId === 'A') {
      setDeckAState((prev) => ({ ...prev, isPlaying: deck.isPlaying }));
    } else {
      setDeckBState((prev) => ({ ...prev, isPlaying: deck.isPlaying }));
    }
  }, []);

  // Handle Cue
  const handleCue = useCallback((deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.resumeContext();

    const deck = deckId === 'A' ? engine.deckA : engine.deckB;
    deck.cue();

    if (deckId === 'A') {
      setDeckAState((prev) => ({
        ...prev,
        isPlaying: deck.isPlaying,
        currentTime: deck.getCurrentTime(),
        cuePoint: deck.cuePoint,
      }));
    } else {
      setDeckBState((prev) => ({
        ...prev,
        isPlaying: deck.isPlaying,
        currentTime: deck.getCurrentTime(),
        cuePoint: deck.cuePoint,
      }));
    }
  }, []);

  // Handle Sync (beatmatch tempo)
  const handleSync = useCallback((deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (deckId === 'A') {
      const targetBpm = deckBState.bpm * (1 + deckBState.pitch);
      const newPitch = targetBpm / deckAState.bpm - 1;
      engine.deckA.setPitch(newPitch);
      setDeckAState((prev) => ({ ...prev, pitch: newPitch }));
    } else {
      const targetBpm = deckAState.bpm * (1 + deckAState.pitch);
      const newPitch = targetBpm / deckBState.bpm - 1;
      engine.deckB.setPitch(newPitch);
      setDeckBState((prev) => ({ ...prev, pitch: newPitch }));
    }
  }, [deckAState.bpm, deckAState.pitch, deckBState.bpm, deckBState.pitch]);

  // Handle Pitch Change
  const handlePitchChange = useCallback((deckId: DeckId, pitchValue: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (deckId === 'A') {
      engine.deckA.setPitch(pitchValue);
      setDeckAState((prev) => ({ ...prev, pitch: pitchValue }));
    } else {
      engine.deckB.setPitch(pitchValue);
      setDeckBState((prev) => ({ ...prev, pitch: pitchValue }));
    }
  }, []);

  // Pitch Bend
  const handlePitchBend = useCallback((deckId: DeckId, amount: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (deckId === 'A') engine.deckA.pitchBend(amount);
    else engine.deckB.pitchBend(amount);
  }, []);

  const handleResetPitchBend = useCallback((deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (deckId === 'A') engine.deckA.resetPitchBend();
    else engine.deckB.resetPitchBend();
  }, []);

  // Handle Seek / Scrub
  const handleSeek = useCallback((deckId: DeckId, seconds: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (deckId === 'A') {
      engine.deckA.seek(seconds);
      setDeckAState((prev) => ({ ...prev, currentTime: seconds }));
    } else {
      engine.deckB.seek(seconds);
      setDeckBState((prev) => ({ ...prev, currentTime: seconds }));
    }
  }, []);

  // Handle Vinyl Scratching
  const handleScratch = useCallback((deckId: DeckId, deltaSeconds: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const deck = deckId === 'A' ? engine.deckA : engine.deckB;
    const current = deck.getCurrentTime();
    deck.seek(current + deltaSeconds);
  }, []);

  // Handle Auto Loop
  const handleSetLoop = useCallback((deckId: DeckId, beats: number | null) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (deckId === 'A') {
      engine.deckA.setLoop(beats);
      setDeckAState((prev) => ({
        ...prev,
        isLooping: engine.deckA.isLooping,
        loopStart: engine.deckA.loopStart,
        loopEnd: engine.deckA.loopEnd,
        loopBeats: beats,
      }));
    } else {
      engine.deckB.setLoop(beats);
      setDeckBState((prev) => ({
        ...prev,
        isLooping: engine.deckB.isLooping,
        loopStart: engine.deckB.loopStart,
        loopEnd: engine.deckB.loopEnd,
        loopBeats: beats,
      }));
    }
  }, []);

  // Mixer: Crossfader
  const handleCrossfaderChange = useCallback((val: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.updateCrossfader(val);
    setCrossfader(val);
  }, []);

  // Mixer: Master Volume
  const handleMasterVolumeChange = useCallback((vol: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setMasterVolume(vol);
    setMasterVolume(vol);
  }, []);

  // Mixer: Deck Channel Volume
  const handleDeckVolumeChange = useCallback((deckId: DeckId, vol: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (deckId === 'A') {
      engine.deckA.setVolume(vol);
      setDeckAState((prev) => ({ ...prev, volume: vol }));
    } else {
      engine.deckB.setVolume(vol);
      setDeckBState((prev) => ({ ...prev, volume: vol }));
    }
  }, []);

  // Mixer: EQ Change
  const handleEQChange = useCallback((deckId: DeckId, band: 'high' | 'mid' | 'low', val: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (deckId === 'A') {
      const eq = { ...deckAState.eq, [band]: val };
      engine.deckA.setEQ(eq.high, eq.mid, eq.low);
      setDeckAState((prev) => ({ ...prev, eq }));
    } else {
      const eq = { ...deckBState.eq, [band]: val };
      engine.deckB.setEQ(eq.high, eq.mid, eq.low);
      setDeckBState((prev) => ({ ...prev, eq }));
    }
  }, [deckAState.eq, deckBState.eq]);

  // Mixer: EQ Kill Toggle
  const handleEQKillToggle = useCallback((deckId: DeckId, band: 'high' | 'mid' | 'low') => {
    const engine = engineRef.current;
    if (!engine) return;

    if (deckId === 'A') {
      const key = band === 'high' ? 'killHigh' : band === 'mid' ? 'killMid' : 'killLow';
      const newVal = !deckAState.eq[key];
      const eq = { ...deckAState.eq, [key]: newVal };
      engine.deckA.setEQKill(
        band === 'high' ? newVal : undefined,
        band === 'mid' ? newVal : undefined,
        band === 'low' ? newVal : undefined
      );
      setDeckAState((prev) => ({ ...prev, eq }));
    } else {
      const key = band === 'high' ? 'killHigh' : band === 'mid' ? 'killMid' : 'killLow';
      const newVal = !deckBState.eq[key];
      const eq = { ...deckBState.eq, [key]: newVal };
      engine.deckB.setEQKill(
        band === 'high' ? newVal : undefined,
        band === 'mid' ? newVal : undefined,
        band === 'low' ? newVal : undefined
      );
      setDeckBState((prev) => ({ ...prev, eq }));
    }
  }, [deckAState.eq, deckBState.eq]);

  // Mixer: AutoMIX Trigger
  const handleTriggerAutoMix = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.triggerAutoMix();
  }, []);

  // Mixer: Headphone Cue (PFL Pre-Listen) Handlers
  const handleToggleCue = useCallback((deckId: 'A' | 'B') => {
    const engine = engineRef.current;
    if (!engine) return;
    if (deckId === 'A') {
      const next = !cueActiveA;
      engine.setDeckCue('A', next);
      setCueActiveA(next);
    } else {
      const next = !cueActiveB;
      engine.setDeckCue('B', next);
      setCueActiveB(next);
    }
  }, [cueActiveA, cueActiveB]);

  const handleHeadphoneVolumeChange = useCallback((vol: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setHeadphoneVolume(vol);
    setHeadphoneVolume(vol);
  }, []);

  const handleHeadphoneMixChange = useCallback((mix: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setHeadphoneMix(mix);
    setHeadphoneMix(mix);
  }, []);

  const handleSplitCueToggle = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const next = !isSplitCue;
    engine.setSplitCue(next);
    setIsSplitCue(next);
  }, [isSplitCue]);

  // Playlist Crate: Quick Headphone Preview Handler
  const handleTogglePreview = useCallback((track: TrackMetadata) => {
    const engine = engineRef.current;
    if (!engine || !track.audioBuffer) return;
    if (engine.isPreviewing && engine.previewTrackId === track.id) {
      engine.stopPreview();
    } else {
      engine.previewTrack(track.audioBuffer, track.id);
    }
  }, []);

  // Load Track directly into a Deck
  const handleLoadTrackToDeck = useCallback((track: TrackMetadata, deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine || !track.audioBuffer) return;

    if (deckId === 'A') {
      engine.deckA.loadBuffer(track.audioBuffer, track.bpm, track.duration);
      setDeckAState((prev) => ({
        ...prev,
        track,
        duration: track.duration,
        currentTime: 0,
        isPlaying: false,
        bpm: track.bpm,
        cuePoint: 0,
        isLooping: false,
        loopBeats: null,
      }));
    } else {
      engine.deckB.loadBuffer(track.audioBuffer, track.bpm, track.duration);
      setDeckBState((prev) => ({
        ...prev,
        track,
        duration: track.duration,
        currentTime: 0,
        isPlaying: false,
        bpm: track.bpm,
        cuePoint: 0,
        isLooping: false,
        loopBeats: null,
      }));
    }
  }, []);

  // Queue a Track as Next for Deck A or Deck B
  const handleQueueTrack = useCallback((track: TrackMetadata, deckId: DeckId) => {
    if (deckId === 'A') {
      setDeckAQueue((prev) => {
        // Prevent duplicate queuing of same track
        if (prev.some((t) => t.id === track.id)) return prev;
        return [...prev, track];
      });
    } else {
      setDeckBQueue((prev) => {
        if (prev.some((t) => t.id === track.id)) return prev;
        return [...prev, track];
      });
    }
  }, []);

  // Remove a Track from Queue
  const handleRemoveFromQueue = useCallback((deckId: DeckId, index: number) => {
    if (deckId === 'A') {
      setDeckAQueue((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDeckBQueue((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  // Load the Next Queued Track into a Deck
  const handleLoadNextTrack = useCallback((deckId: DeckId) => {
    if (deckId === 'A' && deckAQueue.length > 0) {
      const next = deckAQueue[0];
      handleLoadTrackToDeck(next, 'A');
      setDeckAQueue((prev) => prev.slice(1));
    } else if (deckId === 'B' && deckBQueue.length > 0) {
      const next = deckBQueue[0];
      handleLoadTrackToDeck(next, 'B');
      setDeckBQueue((prev) => prev.slice(1));
    }
  }, [deckAQueue, deckBQueue, handleLoadTrackToDeck]);

  // 4-Beats Sampler Handlers (plays concurrently over main deck song)
  const handleToggleBeatPad = useCallback((deckId: DeckId, padIndex: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.toggleDeckPad(deckId, padIndex);
    if (deckId === 'A') {
      setDeckAPads(engine.getDeckPadStates('A'));
    } else {
      setDeckBPads(engine.getDeckPadStates('B'));
    }
  }, []);

  const handleStopAllBeatPads = useCallback((deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.stopAllDeckPads(deckId);
    if (deckId === 'A') {
      setDeckAPads(engine.getDeckPadStates('A'));
    } else {
      setDeckBPads(engine.getDeckPadStates('B'));
    }
  }, []);

  const handleLoadBeatPadFile = useCallback(async (deckId: DeckId, padIndex: number, file: File) => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      await engine.loadDeckPadFile(deckId, padIndex, file);
      if (deckId === 'A') {
        setDeckAPads(engine.getDeckPadStates('A'));
      } else {
        setDeckBPads(engine.getDeckPadStates('B'));
      }
    } catch (err) {
      console.error('Failed to load custom beat into pad:', err);
    }
  }, []);

  // Load Beat / Loop File from Device directly into a Deck with 4-Beat Auto-Loop
  const handleLoadBeatFromDevice = useCallback(async (file: File, deckId: DeckId) => {
    const engine = engineRef.current;
    if (!engine) return;

    try {
      setIsLoadingFiles(true);
      const decoded = await engine.decodeFile(file);
      const bpm = 126;
      const track: TrackMetadata = {
        id: `beat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: `[4-Beat] ${file.name.replace(/\.[^/.]+$/, '')}`,
        artist: 'Device Sample',
        duration: decoded.duration,
        bpm,
        file,
        peaks: decoded.peaks,
        audioBuffer: decoded.buffer,
      };

      // Add to crate
      setTracks((prev) => [track, ...prev]);

      // Load into Deck
      handleLoadTrackToDeck(track, deckId);

      // Lock into a 4-beat loop immediately
      const deckChannel = deckId === 'A' ? engine.deckA : engine.deckB;
      deckChannel.setLoop(4);

      if (deckId === 'A') {
        setDeckAState((prev) => ({
          ...prev,
          isLooping: true,
          loopBeats: 4,
          loopStart: deckChannel.loopStart,
          loopEnd: deckChannel.loopEnd,
        }));
      } else {
        setDeckBState((prev) => ({
          ...prev,
          isLooping: true,
          loopBeats: 4,
          loopStart: deckChannel.loopStart,
          loopEnd: deckChannel.loopEnd,
        }));
      }
    } catch (err) {
      console.error('Failed to load beat from device:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [handleLoadTrackToDeck]);

  // Ingest Multiple Local Files with Live Stream Decoding
  const handleAddFiles = async (files: File[]) => {
    const engine = engineRef.current;
    if (!engine || files.length === 0) return;

    setIsLoadingFiles(true);
    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setDecodingStatus({
        current: i + 1,
        total: files.length,
        fileName: file.name,
      });

      try {
        const decoded = await engine.decodeFile(file);
        const bpm = 124 + (i % 6) * 2;
        const track: TrackMetadata = {
          id: `file_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local Audio',
          duration: decoded.duration,
          bpm,
          file,
          peaks: decoded.peaks,
          audioBuffer: decoded.buffer,
        };

        // Stream each newly decoded track immediately into state
        setTracks((prev) => [track, ...prev]);
        loadedCount++;

        // Auto-load track 1 to Deck A if empty
        if (!deckAState.track && loadedCount === 1) {
          handleLoadTrackToDeck(track, 'A');
        }
        // Auto-load track 2 to Deck B if empty
        else if (!deckBState.track && loadedCount === 2) {
          handleLoadTrackToDeck(track, 'B');
        }
      } catch (err) {
        console.error('Error decoding file:', file.name, err);
      }
    }

    setDecodingStatus(null);
    setIsLoadingFiles(false);
  };

  // Load Built-in Synthesized Demo Tracks
  const handleLoadDemoTracks = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    setIsLoadingFiles(true);
    try {
      const demoA = await engine.generateDemoTrack('house');
      const demoB = await engine.generateDemoTrack('techno');

      const trackA: TrackMetadata = {
        id: 'demo_house_126',
        name: demoA.title,
        artist: demoA.artist,
        duration: demoA.duration,
        bpm: demoA.bpm,
        peaks: demoA.peaks,
        audioBuffer: demoA.buffer,
      };

      const trackB: TrackMetadata = {
        id: 'demo_techno_128',
        name: demoB.title,
        artist: demoB.artist,
        duration: demoB.duration,
        bpm: demoB.bpm,
        peaks: demoB.peaks,
        audioBuffer: demoB.buffer,
      };

      setTracks((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = [trackA, trackB].filter((t) => !existingIds.has(t.id));
        return [...filtered, ...prev];
      });

      // Automatically load into Decks
      handleLoadTrackToDeck(trackA, 'A');
      handleLoadTrackToDeck(trackB, 'B');
    } catch (err) {
      console.error('Failed to generate demo tracks:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setDeckAQueue((prev) => prev.filter((t) => t.id !== id));
    setDeckBQueue((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearTracks = () => {
    setTracks([]);
    setDeckAQueue([]);
    setDeckBQueue([]);
  };

  const isHorizontalLayout = forceHorizontal;

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-4 sm:gap-6 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-pitch-black p-3 sm:p-6 overflow-y-auto min-h-screen text-white'
          : 'relative'
      }`}
    >
      {/* Top Fullscreen & Mode Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black tracking-wider text-neutral-200 uppercase">
            {isFullscreen ? t.fullscreen.exit : 'BrowserDJ Console'}
          </span>
          {isFullscreen && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bright-crimson/20 text-pure-red border border-pure-red/30">
              PRO FULLSCREEN
            </span>
          )}
        </div>

        {/* Right Tools: Full Screen Toggle & Mobile Orientation Switch */}
        <div className="flex items-center gap-2">
          {/* Toggle Horizontal/Landscape Mode in Fullscreen */}
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setForceHorizontal((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition"
              title="Toggle horizontal side-by-side DJ layout"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400 rotate-90" />
              <span className="hidden sm:inline">{t.fullscreen.horizontalMode}</span>
            </button>
          )}

          {/* Full Screen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow-md ${
              isFullscreen
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                : 'bg-gradient-to-r from-deep-crimson via-bright-crimson to-pure-red text-white shadow-[0_0_15px_rgba(188,2,2,0.4)] hover:brightness-110'
            }`}
            title="Show only DJ board and song list in full screen"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>{t.fullscreen.exit}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>{t.fullscreen.enter}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Tab Switcher (Visible on small screens and tablets when not in forced horizontal mode) */}
      {!isHorizontalLayout && (
        <div className="flex lg:hidden items-center justify-between bg-neutral-900 border border-neutral-800 p-1 sm:p-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg">
          <button
            type="button"
            onClick={() => setMobileTab('all')}
            className={`flex-1 py-2 px-1 rounded-lg text-center transition ${
              mobileTab === 'all'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('deckA')}
            className={`flex-1 py-2 px-1 rounded-lg text-center transition ${
              mobileTab === 'deckA'
                ? 'bg-[#830000] text-white shadow-[0_0_8px_#830000]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            DECK A
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('mixer')}
            className={`flex-1 py-2 px-1 rounded-lg text-center transition ${
              mobileTab === 'mixer'
                ? 'bg-bright-crimson text-white shadow-[0_0_8px_#bc0202]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            MIXER
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('deckB')}
            className={`flex-1 py-2 px-1 rounded-lg text-center transition ${
              mobileTab === 'deckB'
                ? 'bg-pure-red text-white shadow-[0_0_8px_#ff0000]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            DECK B
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('playlist')}
            className={`flex-1 py-2 px-1 rounded-lg text-center transition ${
              mobileTab === 'playlist'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            CRATE
          </button>
        </div>
      )}

      {/* Main DJ Console Layout */}
      {/* On desktop (lg: 1024px+), or when isHorizontalLayout is active: 3 columns side-by-side! */}
      <div
        id="dj-decks"
        className={`w-full gap-3 sm:gap-5 items-start scroll-mt-24 ${
          isHorizontalLayout
            ? 'grid grid-cols-1 md:grid-cols-12'
            : 'grid grid-cols-1 lg:grid-cols-12'
        }`}
      >
        {/* DECK A */}
        <div
          className={`${
            isHorizontalLayout ? 'md:col-span-4' : 'lg:col-span-4'
          } ${
            isHorizontalLayout || mobileTab === 'deckA' || mobileTab === 'all'
              ? 'block'
              : 'hidden lg:block'
          }`}
        >
          <DeckComponent
            deckId="A"
            track={deckAState.track}
            nextTrack={deckAQueue[0] || null}
            isPlaying={deckAState.isPlaying}
            currentTime={deckAState.currentTime}
            duration={deckAState.duration}
            pitch={deckAState.pitch}
            bpm={deckAState.bpm}
            cuePoint={deckAState.cuePoint}
            isLooping={deckAState.isLooping}
            loopStart={deckAState.loopStart}
            loopEnd={deckAState.loopEnd}
            loopBeats={deckAState.loopBeats}
            audioLevel={deckAState.volume}
            frequencies={deckAFrequencies}
            beatPads={deckAPads}
            isHeadphoneCueActive={cueActiveA}
            onPlayPause={() => handlePlayPause('A')}
            onCue={() => handleCue('A')}
            onSync={() => handleSync('A')}
            onPitchChange={(p) => handlePitchChange('A', p)}
            onPitchBend={(amt) => handlePitchBend('A', amt)}
            onResetPitchBend={() => handleResetPitchBend('A')}
            onSeek={(s) => handleSeek('A', s)}
            onScratch={(d) => handleScratch('A', d)}
            onSetLoop={(b) => handleSetLoop('A', b)}
            onToggleBeatPad={(idx) => handleToggleBeatPad('A', idx)}
            onStopAllBeatPads={() => handleStopAllBeatPads('A')}
            onLoadBeatPadFile={(idx, file) => handleLoadBeatPadFile('A', idx, file)}
            onLoadNextTrack={() => handleLoadNextTrack('A')}
            onLoadBeatFromDevice={(file) => handleLoadBeatFromDevice(file, 'A')}
            onToggleHeadphoneCue={() => handleToggleCue('A')}
            deckTheme="crimson"
            langLabels={{
              play: t.deck.play,
              pause: t.deck.pause,
              cue: t.deck.cue,
              sync: t.deck.sync,
              pitch: t.deck.pitch,
              bpm: t.deck.bpm,
              loop: t.deck.loop,
              loopExit: t.deck.loopExit,
              fourBeats: t.deck.fourBeats,
              selectBeatFromDevice: t.deck.selectBeatFromDevice,
              fourBeatsActive: t.deck.fourBeatsActive,
              beatPadsTitle: t.deck.beatPadsTitle,
              beatPadTip: t.deck.beatPadTip,
              loadCustomBeat: t.deck.loadCustomBeat,
              stopAllPads: t.deck.stopAllPads,
              upNextTitle: t.deck.upNextTitle,
              noUpcomingTrack: t.deck.noUpcomingTrack,
              loadNextNow: t.deck.loadNextNow,
              tempoRange: t.deck.tempoRange,
              fineNudge: t.deck.fineNudge,
              noTrack: t.deck.noTrack,
              reset: t.deck.reset,
              headphoneCue: t.deck.headphoneCue,
            }}
          />
        </div>

        {/* CENTER MIXER CONSOLE */}
        <div
          id="dj-mixer"
          className={`scroll-mt-24 transition-all duration-300 rounded-2xl ${
            isHorizontalLayout ? 'md:col-span-4' : 'lg:col-span-4'
          } ${
            isHorizontalLayout || mobileTab === 'mixer' || mobileTab === 'all'
              ? 'block'
              : 'hidden lg:block'
          }`}
        >
          <MixerConsole
            deckAState={deckAState}
            deckBState={deckBState}
            crossfader={crossfader}
            masterVolume={masterVolume}
            isAutoMixing={isAutoMixing}
            autoMixProgress={autoMixProgress}
            vuLevels={vuLevels}
            cueActiveA={cueActiveA}
            cueActiveB={cueActiveB}
            headphoneVolume={headphoneVolume}
            headphoneMix={headphoneMix}
            isSplitCue={isSplitCue}
            onCrossfaderChange={handleCrossfaderChange}
            onMasterVolumeChange={handleMasterVolumeChange}
            onDeckVolumeChange={handleDeckVolumeChange}
            onEQChange={handleEQChange}
            onEQKillToggle={handleEQKillToggle}
            onTriggerAutoMix={handleTriggerAutoMix}
            onToggleCue={handleToggleCue}
            onHeadphoneVolumeChange={handleHeadphoneVolumeChange}
            onHeadphoneMixChange={handleHeadphoneMixChange}
            onSplitCueToggle={handleSplitCueToggle}
            langLabels={{
              title: t.mixer.title,
              masterVolume: t.mixer.masterVolume,
              crossfader: t.mixer.crossfader,
              autoMix: t.mixer.autoMix,
              autoMixActive: t.mixer.autoMixActive,
              high: t.deck.high,
              mid: t.deck.mid,
              low: t.deck.low,
              volume: t.deck.volume,
              headphoneTitle: t.mixer.headphoneTitle,
              headphoneCue: t.mixer.headphoneCue,
              cueDeckA: t.mixer.cueDeckA,
              cueDeckB: t.mixer.cueDeckB,
              headphoneMix: t.mixer.headphoneMix,
              splitCue: t.mixer.splitCue,
              splitCueDesc: t.mixer.splitCueDesc,
              headphoneVol: t.mixer.headphoneVol,
            }}
          />
        </div>

        {/* DECK B */}
        <div
          className={`${
            isHorizontalLayout ? 'md:col-span-4' : 'lg:col-span-4'
          } ${
            isHorizontalLayout || mobileTab === 'deckB' || mobileTab === 'all'
              ? 'block'
              : 'hidden lg:block'
          }`}
        >
          <DeckComponent
            deckId="B"
            track={deckBState.track}
            nextTrack={deckBQueue[0] || null}
            isPlaying={deckBState.isPlaying}
            currentTime={deckBState.currentTime}
            duration={deckBState.duration}
            pitch={deckBState.pitch}
            bpm={deckBState.bpm}
            cuePoint={deckBState.cuePoint}
            isLooping={deckBState.isLooping}
            loopStart={deckBState.loopStart}
            loopEnd={deckBState.loopEnd}
            loopBeats={deckBState.loopBeats}
            audioLevel={deckBState.volume}
            frequencies={deckBFrequencies}
            beatPads={deckBPads}
            isHeadphoneCueActive={cueActiveB}
            onPlayPause={() => handlePlayPause('B')}
            onCue={() => handleCue('B')}
            onSync={() => handleSync('B')}
            onPitchChange={(p) => handlePitchChange('B', p)}
            onPitchBend={(amt) => handlePitchBend('B', amt)}
            onResetPitchBend={() => handleResetPitchBend('B')}
            onSeek={(s) => handleSeek('B', s)}
            onScratch={(d) => handleScratch('B', d)}
            onSetLoop={(b) => handleSetLoop('B', b)}
            onToggleBeatPad={(idx) => handleToggleBeatPad('B', idx)}
            onStopAllBeatPads={() => handleStopAllBeatPads('B')}
            onLoadBeatPadFile={(idx, file) => handleLoadBeatPadFile('B', idx, file)}
            onLoadNextTrack={() => handleLoadNextTrack('B')}
            onLoadBeatFromDevice={(file) => handleLoadBeatFromDevice(file, 'B')}
            onToggleHeadphoneCue={() => handleToggleCue('B')}
            deckTheme="red"
            langLabels={{
              play: t.deck.play,
              pause: t.deck.pause,
              cue: t.deck.cue,
              sync: t.deck.sync,
              pitch: t.deck.pitch,
              bpm: t.deck.bpm,
              loop: t.deck.loop,
              loopExit: t.deck.loopExit,
              fourBeats: t.deck.fourBeats,
              selectBeatFromDevice: t.deck.selectBeatFromDevice,
              fourBeatsActive: t.deck.fourBeatsActive,
              beatPadsTitle: t.deck.beatPadsTitle,
              beatPadTip: t.deck.beatPadTip,
              loadCustomBeat: t.deck.loadCustomBeat,
              stopAllPads: t.deck.stopAllPads,
              upNextTitle: t.deck.upNextTitle,
              noUpcomingTrack: t.deck.noUpcomingTrack,
              loadNextNow: t.deck.loadNextNow,
              tempoRange: t.deck.tempoRange,
              fineNudge: t.deck.fineNudge,
              noTrack: t.deck.noTrack,
              reset: t.deck.reset,
              headphoneCue: t.deck.headphoneCue,
            }}
          />
        </div>
      </div>

      {/* PLAYLIST CRATE SECTION (Shows below the decks, always included in Fullscreen) */}
      <div
        id="dj-crate"
        className={`scroll-mt-24 transition-all duration-300 rounded-2xl ${
          isHorizontalLayout || mobileTab === 'playlist' || mobileTab === 'all'
            ? 'block'
            : 'hidden lg:block'
        }`}
      >
        <PlaylistManager
          tracks={tracks}
          deckAQueue={deckAQueue}
          deckBQueue={deckBQueue}
          onAddFiles={handleAddFiles}
          onLoadDemoTracks={handleLoadDemoTracks}
          onLoadTrackToDeck={handleLoadTrackToDeck}
          onQueueTrack={handleQueueTrack}
          onRemoveFromQueue={handleRemoveFromQueue}
          onRemoveTrack={handleRemoveTrack}
          onClearTracks={handleClearTracks}
          onTogglePreview={handleTogglePreview}
          previewTrackId={previewTrackId}
          isLoadingFiles={isLoadingFiles}
          decodingStatus={decodingStatus}
          activeDeckATrackId={deckAState.track?.id}
          activeDeckBTrackId={deckBState.track?.id}
          langLabels={{
            title: t.playlist.title,
            dropzoneText: t.playlist.dropzoneText,
            dropzoneSubtext: t.playlist.dropzoneSubtext,
            browseFiles: t.playlist.browseFiles,
            browseFolder: t.playlist.browseFolder,
            decodingProgress: t.playlist.decodingProgress,
            loadDemoTracks: t.playlist.loadDemoTracks,
            loadToA: t.playlist.loadToA,
            loadToB: t.playlist.loadToB,
            queueNextA: t.playlist.queueNextA,
            queueNextB: t.playlist.queueNextB,
            queuedBadgeA: t.playlist.queuedBadgeA,
            queuedBadgeB: t.playlist.queuedBadgeB,
            queueSectionTitle: t.playlist.queueSectionTitle,
            searchPlaceholder: t.playlist.searchPlaceholder,
            tracksCount: t.playlist.tracksCount,
            noTracksFound: t.playlist.noTracksFound,
            clearAll: t.playlist.clearAll,
            privacyBadge: t.playlist.privacyBadge,
            quickPreview: t.playlist.quickPreview,
            stopPreview: t.playlist.stopPreview,
          }}
        />
      </div>

      {/* DJ Keyboard Shortcuts Cheat Sheet (Hidden in minimal fullscreen) */}
      {!isFullscreen && (
        <div className="bg-neutral-900/60 dark:bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 sm:p-4 text-xs">
          <div className="flex items-center justify-between font-bold text-neutral-300 mb-2">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-bright-crimson" />
              <span>{t.shortcuts.title}</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Press [F] for Full Screen DJ
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-neutral-400 font-mono text-[11px]">
            <div>{t.shortcuts.deckA}</div>
            <div>{t.shortcuts.deckB}</div>
            <div>
              {t.shortcuts.crossfaderLeft} | {t.shortcuts.crossfaderRight}
            </div>
            <div>{t.shortcuts.autoMix} | F = Fullscreen</div>
          </div>
        </div>
      )}
    </div>
  );
};
