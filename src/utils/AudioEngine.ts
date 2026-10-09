/**
 * BrowserDJ AudioEngine
 * 100% Client-Side Web Audio API DJ Engine
 * 
 * Architecture:
 * SourceNode -> LowShelf (320Hz) -> Peaking Mid (1kHz) -> HighShelf (3.2kHz) -> ChannelGain -> DeckAnalyser -> CrossfaderGain -> MasterGain -> MasterAnalyser -> Destination
 */

export interface TrackMetadata {
  id: string;
  name: string;
  artist: string;
  duration: number;
  bpm: number;
  file?: File;
  peaks?: number[];
  audioBuffer?: AudioBuffer;
}

export type DeckId = 'A' | 'B';

export interface DeckState {
  track: TrackMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  pitch: number; // -0.16 to +0.16 (rate = 1 + pitch)
  bpm: number;
  volume: number; // 0 to 1
  cuePoint: number;
  isLooping: boolean;
  loopStart: number;
  loopEnd: number;
  loopBeats: number | null;
  eq: {
    high: number; // dB -30 to +6
    mid: number;  // dB -30 to +6
    low: number;  // dB -30 to +6
    killHigh: boolean;
    killMid: boolean;
    killLow: boolean;
  };
}

export interface SamplerPadState {
  index: number;
  name: string;
  isPlaying: boolean;
  hasCustomBuffer: boolean;
}

/**
 * Procedurally synthesize 4 punchy, seamless 4-beat audio loops
 * so beat pads have studio sound immediately without external files
 */
function createSynthesizedBeatLoop(ctx: AudioContext, type: 'kick' | 'clap' | 'hat' | 'bass', bpm = 126): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const beatDuration = 60 / bpm;
  const totalDuration = beatDuration * 4; // exactly 4 beats
  const totalSamples = Math.floor(sampleRate * totalDuration);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const samplesPerBeat = Math.floor(sampleRate * beatDuration);

  if (type === 'kick') {
    // Punchy 4-on-the-floor club kick
    for (let beat = 0; beat < 4; beat++) {
      const start = beat * samplesPerBeat;
      for (let i = 0; i < Math.min(sampleRate * 0.4, totalSamples - start); i++) {
        const t = i / sampleRate;
        const freq = 150 * Math.exp(-t * 30) + 48;
        const env = Math.exp(-t * 14);
        const kick = Math.sin(2 * Math.PI * freq * t) * env * 0.85;
        left[start + i] += kick;
        right[start + i] += kick;
      }
    }
  } else if (type === 'clap') {
    // Crisp snappy claps on beats 2 and 4 (indices 1 and 3)
    for (const beat of [1, 3]) {
      const start = beat * samplesPerBeat;
      for (let i = 0; i < Math.min(sampleRate * 0.25, totalSamples - start); i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 20);
        const noise = (Math.random() * 2 - 1) * env * 0.4;
        const snap = Math.sin(2 * Math.PI * 220 * t) * env * 0.25;
        const clap = (noise + snap) * 0.8;
        left[start + i] += clap;
        right[start + i] += clap;
      }
    }
  } else if (type === 'hat') {
    // 16th-note rolling hi-hats with open hat on upbeats
    for (let sub = 0; sub < 16; sub++) {
      const start = Math.floor(sub * (samplesPerBeat / 4));
      const isOpen = sub % 4 === 2;
      const dur = isOpen ? 0.18 : 0.05;
      const decay = isOpen ? 18 : 65;
      const vol = isOpen ? 0.35 : (sub % 2 === 0 ? 0.22 : 0.15);
      for (let i = 0; i < Math.min(sampleRate * dur, totalSamples - start); i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * decay);
        const noise = (Math.random() * 2 - 1) * env * vol;
        left[start + i] += noise;
        right[start + i] += noise;
      }
    }
  } else if (type === 'bass') {
    // Bouncy punchy rolling sub bass groove
    const rootFreq = 55; // A1
    const pattern = [1, 0, 1.25, 1, 0, 1.5, 1, 0];
    for (let step = 0; step < 8; step++) {
      const freqMultiplier = pattern[step];
      if (freqMultiplier > 0) {
        const start = Math.floor(step * (samplesPerBeat / 2));
        const noteFreq = rootFreq * freqMultiplier;
        for (let i = 0; i < Math.min(sampleRate * 0.2, totalSamples - start); i++) {
          const t = i / sampleRate;
          const env = Math.exp(-t * 12);
          const sub = (Math.sin(2 * Math.PI * noteFreq * t) + 0.3 * Math.sin(4 * Math.PI * noteFreq * t)) * env * 0.6;
          left[start + i] += sub;
          right[start + i] += sub;
        }
      }
    }
  }

  // Normalize
  let maxAmp = 0;
  for (let i = 0; i < totalSamples; i++) {
    const aL = Math.abs(left[i]);
    const aR = Math.abs(right[i]);
    if (aL > maxAmp) maxAmp = aL;
    if (aR > maxAmp) maxAmp = aR;
  }
  if (maxAmp > 0.95) {
    const scale = 0.9 / maxAmp;
    for (let i = 0; i < totalSamples; i++) {
      left[i] *= scale;
      right[i] *= scale;
    }
  }

  return buffer;
}

export class SamplerPad {
  index: number;
  name: string;
  defaultName: string;
  buffer: AudioBuffer | null = null;
  isPlaying = false;
  hasCustomBuffer = false;
  sourceNode: AudioBufferSourceNode | null = null;
  gainNode: GainNode;
  ctx: AudioContext;

  constructor(index: number, defaultName: string, ctx: AudioContext, destination: GainNode) {
    this.index = index;
    this.name = defaultName;
    this.defaultName = defaultName;
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0.85;
    this.gainNode.connect(destination);
  }

  setBuffer(buffer: AudioBuffer, name: string, isCustom = true) {
    this.buffer = buffer;
    this.name = name;
    this.hasCustomBuffer = isCustom;
    if (this.isPlaying) {
      this.play();
    }
  }

  play() {
    if (!this.buffer) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.stop();

    this.sourceNode = this.ctx.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.loop = true;
    this.sourceNode.connect(this.gainNode);
    this.sourceNode.start(0);
    this.isPlaying = true;
  }

  stop() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {
        // Ignored
      }
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  getState(): SamplerPadState {
    return {
      index: this.index,
      name: this.name,
      isPlaying: this.isPlaying,
      hasCustomBuffer: this.hasCustomBuffer,
    };
  }
}

class DeckChannel {
  id: DeckId;
  ctx: AudioContext;
  audioBuffer: AudioBuffer | null = null;
  sourceNode: AudioBufferSourceNode | null = null;
  
  // Biquad Filters
  lowFilter: BiquadFilterNode;
  midFilter: BiquadFilterNode;
  highFilter: BiquadFilterNode;
  
  // Gain nodes
  channelGain: GainNode;
  crossfadeGain: GainNode;
  analyser: AnalyserNode;

  // 4-Beats Sampler Bus & Pads (plays concurrently with main song)
  samplerMixBus: GainNode;
  pads: SamplerPad[];

  // Pre-Fade Listen (PFL) Headphone Cue Bus
  cueGain: GainNode;
  isCueActive = false;

  // Playback tracking
  isPlaying = false;
  startedAt = 0;
  pausedAt = 0;
  pitch = 0; // -0.16 to +0.16
  cuePoint = 0;
  isLooping = false;
  loopStart = 0;
  loopEnd = 0;
  loopBeats: number | null = null;
  trackDuration = 0;
  calculatedBpm = 126;

  // EQ values
  eqHigh = 0;
  eqMid = 0;
  eqLow = 0;
  killHigh = false;
  killMid = false;
  killLow = false;

  private onEndedCallback: (() => void) | null = null;

  constructor(id: DeckId, ctx: AudioContext, masterNode: GainNode, cueBusNode: GainNode) {
    this.id = id;
    this.ctx = ctx;

    // Filters
    this.lowFilter = ctx.createBiquadFilter();
    this.lowFilter.type = 'lowshelf';
    this.lowFilter.frequency.value = 320;
    this.lowFilter.gain.value = 0;

    this.midFilter = ctx.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1.0;
    this.midFilter.gain.value = 0;

    this.highFilter = ctx.createBiquadFilter();
    this.highFilter.type = 'highshelf';
    this.highFilter.frequency.value = 3200;
    this.highFilter.gain.value = 0;

    // Channel Gain
    this.channelGain = ctx.createGain();
    this.channelGain.gain.value = 1.0;

    // Analyser for Deck
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Crossfade Gain
    this.crossfadeGain = ctx.createGain();
    this.crossfadeGain.gain.value = 1.0;

    // Audio Graph Routing:
    // lowFilter -> midFilter -> highFilter -> channelGain -> analyser -> crossfadeGain -> masterNode
    this.lowFilter.connect(this.midFilter);
    this.midFilter.connect(this.highFilter);
    this.highFilter.connect(this.channelGain);
    this.channelGain.connect(this.analyser);
    this.analyser.connect(this.crossfadeGain);
    this.crossfadeGain.connect(masterNode);

    // 4-Beats Sampler Mix Bus: connects into channelGain so volume/crossfader apply
    this.samplerMixBus = ctx.createGain();
    this.samplerMixBus.gain.value = 0.85;
    this.samplerMixBus.connect(this.channelGain);

    // Headphone Cue (PFL): connects post-EQ/sampler, pre-crossfader to cueBusNode
    this.cueGain = ctx.createGain();
    this.cueGain.gain.value = 0.0;
    this.highFilter.connect(this.cueGain);
    this.samplerMixBus.connect(this.cueGain);
    this.cueGain.connect(cueBusNode);

    const defaultNames = ['Beat 1: Kick', 'Beat 2: Clap', 'Beat 3: Hi-Hat', 'Beat 4: Bass'];
    this.pads = defaultNames.map((name, idx) => new SamplerPad(idx, name, ctx, this.samplerMixBus));
  }

  setCue(active: boolean) {
    this.isCueActive = active;
    this.cueGain.gain.setTargetAtTime(active ? 1.0 : 0.0, this.ctx.currentTime, 0.02);
  }

  togglePad(index: number): boolean {
    if (index >= 0 && index < this.pads.length) {
      return this.pads[index].toggle();
    }
    return false;
  }

  stopAllPads() {
    this.pads.forEach((p) => p.stop());
  }

  setPadBuffer(index: number, buffer: AudioBuffer, name: string, isCustom = true) {
    if (index >= 0 && index < this.pads.length) {
      this.pads[index].setBuffer(buffer, name, isCustom);
    }
  }

  getPadStates(): SamplerPadState[] {
    return this.pads.map((p) => p.getState());
  }

  loadBuffer(buffer: AudioBuffer, bpm = 126, duration?: number) {
    this.stop();
    this.audioBuffer = buffer;
    this.trackDuration = duration || buffer.duration;
    this.calculatedBpm = bpm;
    this.pausedAt = 0;
    this.cuePoint = 0;
    this.isLooping = false;
  }

  getCurrentTime(): number {
    if (!this.isPlaying) return this.pausedAt;
    const elapsedReal = this.ctx.currentTime - this.startedAt;
    const playbackRate = 1.0 + this.pitch;
    const currentPos = this.pausedAt + elapsedReal * playbackRate;

    if (this.isLooping && this.loopEnd > this.loopStart) {
      if (currentPos >= this.loopEnd) {
        const loopLen = this.loopEnd - this.loopStart;
        return this.loopStart + ((currentPos - this.loopStart) % loopLen);
      }
    }

    if (currentPos >= this.trackDuration) {
      return this.trackDuration;
    }
    return Math.max(0, currentPos);
  }

  play(startOffset?: number) {
    if (!this.audioBuffer) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stopSource();
    }

    const offset = startOffset !== undefined ? startOffset : this.pausedAt;
    const safeOffset = Math.min(Math.max(0, offset), this.trackDuration);

    this.sourceNode = this.ctx.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.playbackRate.value = 1.0 + this.pitch;

    if (this.isLooping && this.loopEnd > this.loopStart) {
      this.sourceNode.loop = true;
      this.sourceNode.loopStart = this.loopStart;
      this.sourceNode.loopEnd = this.loopEnd;
    }

    this.sourceNode.connect(this.lowFilter);
    this.startedAt = this.ctx.currentTime;
    this.pausedAt = safeOffset;

    this.sourceNode.onended = () => {
      if (this.isPlaying && !this.isLooping && this.getCurrentTime() >= this.trackDuration - 0.1) {
        this.isPlaying = false;
        this.pausedAt = 0;
        if (this.onEndedCallback) this.onEndedCallback();
      }
    };

    this.sourceNode.start(0, safeOffset);
    this.isPlaying = true;
  }

  pause() {
    if (!this.isPlaying) return;
    this.pausedAt = this.getCurrentTime();
    this.stopSource();
    this.isPlaying = false;
  }

  stop() {
    this.stopSource();
    this.isPlaying = false;
    this.pausedAt = 0;
  }

  private stopSource() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {
        // Node was already stopped or disconnected
      }
      this.sourceNode = null;
    }
  }

  seek(targetTime: number) {
    const clamped = Math.max(0, Math.min(targetTime, this.trackDuration));
    if (this.isPlaying) {
      this.play(clamped);
    } else {
      this.pausedAt = clamped;
    }
  }

  cue() {
    if (this.isPlaying) {
      // Standard DJ Cue: Stop and return to cue point
      this.pause();
      this.seek(this.cuePoint);
    } else {
      // Set new cue point to current playhead
      this.cuePoint = this.pausedAt;
    }
  }

  jumpToCue() {
    this.seek(this.cuePoint);
  }

  setPitch(pitchValue: number) {
    this.pitch = Math.max(-0.5, Math.min(0.5, pitchValue));
    if (this.sourceNode) {
      this.sourceNode.playbackRate.setTargetAtTime(1.0 + this.pitch, this.ctx.currentTime, 0.02);
    }
  }

  pitchBend(amount: number) {
    if (this.sourceNode) {
      this.sourceNode.playbackRate.setTargetAtTime(1.0 + this.pitch + amount, this.ctx.currentTime, 0.05);
    }
  }

  resetPitchBend() {
    if (this.sourceNode) {
      this.sourceNode.playbackRate.setTargetAtTime(1.0 + this.pitch, this.ctx.currentTime, 0.05);
    }
  }

  setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.channelGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
  }

  setEQ(high: number, mid: number, low: number) {
    this.eqHigh = high;
    this.eqMid = mid;
    this.eqLow = low;
    this.updateEQFilters();
  }

  setEQKill(killHigh?: boolean, killMid?: boolean, killLow?: boolean) {
    if (killHigh !== undefined) this.killHigh = killHigh;
    if (killMid !== undefined) this.killMid = killMid;
    if (killLow !== undefined) this.killLow = killLow;
    this.updateEQFilters();
  }

  private updateEQFilters() {
    const targetLow = this.killLow ? -70 : Math.max(-30, Math.min(6, this.eqLow));
    const targetMid = this.killMid ? -70 : Math.max(-30, Math.min(6, this.eqMid));
    const targetHigh = this.killHigh ? -70 : Math.max(-30, Math.min(6, this.eqHigh));

    this.lowFilter.gain.setTargetAtTime(targetLow, this.ctx.currentTime, 0.02);
    this.midFilter.gain.setTargetAtTime(targetMid, this.ctx.currentTime, 0.02);
    this.highFilter.gain.setTargetAtTime(targetHigh, this.ctx.currentTime, 0.02);
  }

  setLoop(beats: number | null) {
    if (beats === null) {
      this.isLooping = false;
      this.loopBeats = null;
      if (this.sourceNode) {
        this.sourceNode.loop = false;
      }
      return;
    }

    const cur = this.getCurrentTime();
    const effectiveBpm = this.calculatedBpm * (1.0 + this.pitch);
    const beatDuration = 60 / Math.max(40, effectiveBpm);
    const loopDuration = beats * beatDuration;

    this.loopStart = cur;
    this.loopEnd = Math.min(cur + loopDuration, this.trackDuration);
    this.isLooping = true;
    this.loopBeats = beats;

    if (this.isPlaying) {
      // Re-trigger loop for sample-accurate node looping
      this.play(cur);
    }
  }

  getAudioLevel(): number {
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    return sum / (buffer.length * 255);
  }

  getFrequencyData(): Uint8Array {
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer);
    return buffer;
  }
}

export class DJAudioEngine {
  private static instance: DJAudioEngine | null = null;
  ctx: AudioContext;
  masterGain: GainNode;
  masterAnalyser: AnalyserNode;

  deckA: DeckChannel;
  deckB: DeckChannel;

  // Crossfader: range -1.0 (Deck A only) to +1.0 (Deck B only), 0.0 = centered
  crossfaderPosition = 0;
  masterVolume = 0.85;

  // Headphone Cue / PFL Monitoring State
  cueBusGain: GainNode;
  cueActiveA = false;
  cueActiveB = true; // Deck B pre-cued by default so incoming deck can be heard!
  headphoneVolume = 0.85;
  headphoneMix = 0.5; // 0.0 = CUE only, 0.5 = 50% Cue / 50% Master, 1.0 = Master only
  isSplitCue = false; // Left = Master (crowd), Right = Cue (headphones)

  // Audio Graph for Headphone Monitoring
  normalMasterGain: GainNode;
  normalCueGain: GainNode;
  splitMasterGain: GainNode;
  splitCueGain: GainNode;
  splitMerger: ChannelMergerNode;
  splitOutputGain: GainNode;

  // Crate quick-preview node
  previewSourceNode: AudioBufferSourceNode | null = null;
  isPreviewing = false;
  previewTrackId: string | null = null;
  private previewListeners: Array<(trackId: string | null, isPlaying: boolean) => void> = [];

  // AutoMIX state
  isAutoMixing = false;
  autoMixTargetDeck: DeckId = 'B';
  autoMixDuration = 5000; // 5 seconds
  private autoMixAnimFrame: number | null = null;
  private autoMixListeners: Array<(progress: number, active: boolean) => void> = [];

  private constructor() {
    // Lazily created or standard AudioContext
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.masterVolume;

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;
    this.masterAnalyser.smoothingTimeConstant = 0.85;

    this.masterGain.connect(this.masterAnalyser);

    // Headphone Cue Bus (Pre-Fade Listen from Decks & Crate Preview)
    this.cueBusGain = this.ctx.createGain();
    this.cueBusGain.gain.value = 1.0;

    // Normal Stereo Output Nodes (Blended Master + Cue)
    this.normalMasterGain = this.ctx.createGain();
    this.normalCueGain = this.ctx.createGain();

    this.masterAnalyser.connect(this.normalMasterGain);
    this.cueBusGain.connect(this.normalCueGain);

    this.normalMasterGain.connect(this.ctx.destination);
    this.normalCueGain.connect(this.ctx.destination);

    // Split Cue (Left Ear = Master mono, Right Ear = Cue mono)
    this.splitMasterGain = this.ctx.createGain();
    this.splitCueGain = this.ctx.createGain();
    this.splitMerger = this.ctx.createChannelMerger(2);

    this.masterAnalyser.connect(this.splitMasterGain);
    this.cueBusGain.connect(this.splitCueGain);

    this.splitMasterGain.connect(this.splitMerger, 0, 0); // L = Master
    this.splitCueGain.connect(this.splitMerger, 0, 1);    // R = Cue

    this.splitOutputGain = this.ctx.createGain();
    this.splitMerger.connect(this.splitOutputGain);
    this.splitOutputGain.connect(this.ctx.destination);

    // Instantiate Decks with master bus and cue bus
    this.deckA = new DeckChannel('A', this.ctx, this.masterGain, this.cueBusGain);
    this.deckB = new DeckChannel('B', this.ctx, this.masterGain, this.cueBusGain);

    this.deckA.setCue(this.cueActiveA);
    this.deckB.setCue(this.cueActiveB);

    this.updateCrossfader(0);
    this.updateHeadphoneGains();
    this.initDefaultBeatPads();
  }

  static getInstance(): DJAudioEngine {
    if (!DJAudioEngine.instance) {
      DJAudioEngine.instance = new DJAudioEngine();
    }
    return DJAudioEngine.instance;
  }

  /**
   * Synthesizes 4 distinct default 4-beat loops for each deck
   * (Kick, Clap, Hi-Hats, Bass)
   */
  initDefaultBeatPads() {
    const padConfigs: Array<{ type: 'kick' | 'clap' | 'hat' | 'bass'; name: string }> = [
      { type: 'kick', name: 'Beat 1: Kick Loop' },
      { type: 'clap', name: 'Beat 2: Clap Groove' },
      { type: 'hat', name: 'Beat 3: Hi-Hats' },
      { type: 'bass', name: 'Beat 4: Sub Bass' },
    ];

    padConfigs.forEach((cfg, idx) => {
      const bufferA = createSynthesizedBeatLoop(this.ctx, cfg.type, 126);
      const bufferB = createSynthesizedBeatLoop(this.ctx, cfg.type, 128);
      this.deckA.setPadBuffer(idx, bufferA, cfg.name, false);
      this.deckB.setPadBuffer(idx, bufferB, cfg.name, false);
    });
  }

  /**
   * Toggle a specific 4-beat sampler pad on/off for a deck
   * Plays simultaneously over the main track
   */
  toggleDeckPad(deckId: DeckId, index: number): boolean {
    this.resumeContext();
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    return deck.togglePad(index);
  }

  /**
   * Stop all active 4-beat sampler pads for a deck
   */
  stopAllDeckPads(deckId: DeckId) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    deck.stopAllPads();
  }

  /**
   * Load custom audio file from device into a specific pad slot (0 to 3)
   */
  async loadDeckPadFile(deckId: DeckId, index: number, file: File): Promise<string> {
    this.resumeContext();
    const decoded = await this.decodeFile(file);
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    const cleanName = `Beat ${index + 1}: ${file.name.replace(/\.[^/.]+$/, '').slice(0, 16)}`;
    deck.setPadBuffer(index, decoded.buffer, cleanName, true);
    return cleanName;
  }

  /**
   * Get current state of the 4 pads for a deck
   */
  getDeckPadStates(deckId: DeckId): SamplerPadState[] {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    return deck.getPadStates();
  }

  resumeContext() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    this.updateHeadphoneGains();
  }

  /**
   * Recalculates output gains for Headphone Monitor (PFL) and Split Cue
   */
  updateHeadphoneGains() {
    const t = this.ctx.currentTime;
    if (this.isSplitCue) {
      // Split Cue active: Normal paths muted, Left ear = Master mono, Right ear = Cue mono
      this.normalMasterGain.gain.setTargetAtTime(0, t, 0.02);
      this.normalCueGain.gain.setTargetAtTime(0, t, 0.02);
      this.splitOutputGain.gain.setTargetAtTime(this.headphoneVolume, t, 0.02);
    } else {
      // Normal Stereo Mix: Split path muted, blend Cue and Master in stereo
      this.splitOutputGain.gain.setTargetAtTime(0, t, 0.02);
      // headphoneMix: 0 = 100% CUE, 0.5 = 50% Cue / 50% Master, 1.0 = 100% Master
      const masterScale = Math.min(1.0, this.headphoneMix * 1.5) * this.masterVolume;
      const cueScale = Math.min(1.0, (1.0 - this.headphoneMix) * 1.5) * this.headphoneVolume;

      this.normalMasterGain.gain.setTargetAtTime(masterScale, t, 0.02);
      this.normalCueGain.gain.setTargetAtTime(cueScale, t, 0.02);
    }
  }

  /**
   * Toggle Headphone Cue (PFL pre-listen) for Deck A or Deck B
   */
  setDeckCue(deckId: DeckId, active: boolean) {
    this.resumeContext();
    if (deckId === 'A') {
      this.cueActiveA = active;
      this.deckA.setCue(active);
    } else {
      this.cueActiveB = active;
      this.deckB.setCue(active);
    }
    this.updateHeadphoneGains();
  }

  setHeadphoneVolume(vol: number) {
    this.headphoneVolume = Math.max(0, Math.min(1, vol));
    this.updateHeadphoneGains();
  }

  setHeadphoneMix(mix: number) {
    this.headphoneMix = Math.max(0, Math.min(1, mix));
    this.updateHeadphoneGains();
  }

  setSplitCue(enabled: boolean) {
    this.isSplitCue = enabled;
    this.updateHeadphoneGains();
  }

  /**
   * Audition / preview a track from crate directly into the Headphone Cue bus
   */
  previewTrack(buffer: AudioBuffer, trackId: string) {
    this.resumeContext();
    this.stopPreview();

    this.previewSourceNode = this.ctx.createBufferSource();
    this.previewSourceNode.buffer = buffer;
    this.previewSourceNode.connect(this.cueBusGain);
    this.previewSourceNode.onended = () => {
      this.isPreviewing = false;
      this.previewTrackId = null;
      this.notifyPreviewListeners(null, false);
    };
    this.previewSourceNode.start(0);
    this.isPreviewing = true;
    this.previewTrackId = trackId;
    this.notifyPreviewListeners(trackId, true);
  }

  stopPreview() {
    if (this.previewSourceNode) {
      try {
        this.previewSourceNode.stop();
        this.previewSourceNode.disconnect();
      } catch {}
      this.previewSourceNode = null;
    }
    this.isPreviewing = false;
    this.previewTrackId = null;
    this.notifyPreviewListeners(null, false);
  }

  subscribePreview(cb: (trackId: string | null, isPlaying: boolean) => void) {
    this.previewListeners.push(cb);
    return () => {
      this.previewListeners = this.previewListeners.filter((l) => l !== cb);
    };
  }

  private notifyPreviewListeners(trackId: string | null, isPlaying: boolean) {
    this.previewListeners.forEach((cb) => cb(trackId, isPlaying));
  }

  /**
   * Set Crossfader position: -1.0 (All A) to +1.0 (All B)
   * Implements constant-power crossfading curve
   */
  updateCrossfader(pos: number) {
    this.crossfaderPosition = Math.max(-1, Math.min(1, pos));
    // Normalize to 0 (all A) -> 1 (all B)
    const norm = (this.crossfaderPosition + 1) / 2;

    // Constant power equal loudness curve:
    // Deck A = cos(norm * PI / 2)
    // Deck B = sin(norm * PI / 2)
    const gainA = Math.cos(norm * 0.5 * Math.PI);
    const gainB = Math.sin(norm * 0.5 * Math.PI);

    this.deckA.crossfadeGain.gain.setTargetAtTime(gainA, this.ctx.currentTime, 0.02);
    this.deckB.crossfadeGain.gain.setTargetAtTime(gainB, this.ctx.currentTime, 0.02);
  }

  /**
   * AutoMIX: Algorithmically transitions crossfader over 5 seconds.
   * If Deck A is active, transitions to Deck B and starts Deck B.
   * If Deck B is active, transitions to Deck A and starts Deck A.
   */
  triggerAutoMix(onProgress?: (progress: number, active: boolean) => void) {
    this.resumeContext();

    if (this.isAutoMixing) {
      this.cancelAutoMix();
      return;
    }

    // Determine target deck based on current crossfader position
    // If crossfader is <= 0 (leaning A), transition to B. Otherwise transition to A.
    const startPos = this.crossfaderPosition;
    const targetDeck: DeckId = startPos <= 0 ? 'B' : 'A';
    const targetPos = targetDeck === 'B' ? 1.0 : -1.0;

    const targetDeckInstance = targetDeck === 'B' ? this.deckB : this.deckA;

    // Trigger playback of incoming deck if paused and has audio buffer
    if (!targetDeckInstance.isPlaying && targetDeckInstance.audioBuffer) {
      targetDeckInstance.play();
    }

    this.isAutoMixing = true;
    this.autoMixTargetDeck = targetDeck;

    const startTime = performance.now();
    const duration = this.autoMixDuration;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Smooth cosine easing
      const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      const currentPos = startPos + (targetPos - startPos) * eased;

      this.updateCrossfader(currentPos);
      this.notifyAutoMixListeners(progress, true);
      if (onProgress) onProgress(progress, true);

      if (progress < 1.0) {
        this.autoMixAnimFrame = requestAnimationFrame(step);
      } else {
        this.isAutoMixing = false;
        this.updateCrossfader(targetPos);
        this.notifyAutoMixListeners(1.0, false);
        if (onProgress) onProgress(1.0, false);
      }
    };

    this.autoMixAnimFrame = requestAnimationFrame(step);
  }

  cancelAutoMix() {
    if (this.autoMixAnimFrame) {
      cancelAnimationFrame(this.autoMixAnimFrame);
      this.autoMixAnimFrame = null;
    }
    this.isAutoMixing = false;
    this.notifyAutoMixListeners(0, false);
  }

  subscribeAutoMix(cb: (progress: number, active: boolean) => void) {
    this.autoMixListeners.push(cb);
    return () => {
      this.autoMixListeners = this.autoMixListeners.filter(l => l !== cb);
    };
  }

  private notifyAutoMixListeners(progress: number, active: boolean) {
    this.autoMixListeners.forEach(cb => cb(progress, active));
  }

  /**
   * Decode local audio file into AudioBuffer
   */
  async decodeFile(file: File): Promise<{ buffer: AudioBuffer; peaks: number[]; duration: number }> {
    this.resumeContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    const peaks = this.extractPeaks(audioBuffer, 300);
    return {
      buffer: audioBuffer,
      peaks,
      duration: audioBuffer.duration,
    };
  }

  /**
   * Extract peak amplitudes for responsive waveform visualization
   */
  extractPeaks(buffer: AudioBuffer, count = 300): number[] {
    const rawData = buffer.getChannelData(0);
    const step = Math.floor(rawData.length / count);
    const peaks: number[] = [];

    for (let i = 0; i < count; i++) {
      let max = 0;
      const start = i * step;
      const end = Math.min(start + step, rawData.length);
      for (let j = start; j < end; j += 4) {
        const val = Math.abs(rawData[j]);
        if (val > max) max = val;
      }
      peaks.push(Math.min(1.0, max));
    }
    return peaks;
  }

  /**
   * Real-time master frequency and level analysis for VU meters
   */
  getMasterLevels(): { left: number; right: number; frequencies: Uint8Array } {
    const freq = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.masterAnalyser.getByteFrequencyData(freq);

    const time = new Uint8Array(this.masterAnalyser.fftSize);
    this.masterAnalyser.getByteTimeDomainData(time);

    let sumSquares = 0;
    for (let i = 0; i < time.length; i++) {
      const normalized = (time[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / time.length);

    return {
      left: Math.min(1.0, rms * 1.8),
      right: Math.min(1.0, rms * 1.7),
      frequencies: freq,
    };
  }

  /**
   * Synthesize instant high-energy demo tracks directly in-browser
   * zero server, instant play for any user without audio files
   */
  async generateDemoTrack(type: 'house' | 'techno'): Promise<{ buffer: AudioBuffer; peaks: number[]; duration: number; bpm: number; title: string; artist: string }> {
    const sampleRate = this.ctx.sampleRate;
    const duration = 30; // 30-second seamless loopable demo track
    const bpm = type === 'house' ? 126 : 128;
    const totalSamples = sampleRate * duration;
    const audioBuffer = this.ctx.createBuffer(2, totalSamples, sampleRate);
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);

    const secondsPerBeat = 60 / bpm;
    const samplesPerBeat = Math.floor(sampleRate * secondsPerBeat);

    // Procedural Drum & Synth Generator
    for (let beat = 0; beat < Math.floor(duration / secondsPerBeat); beat++) {
      const beatStartSample = beat * samplesPerBeat;

      // Four-on-the-floor Kick
      for (let i = 0; i < Math.min(sampleRate * 0.45, totalSamples - beatStartSample); i++) {
        const t = i / sampleRate;
        const freq = 140 * Math.exp(-t * 28) + 45;
        const kickEnvelope = Math.exp(-t * 12);
        const kick = Math.sin(2 * Math.PI * freq * t) * kickEnvelope;
        if (beatStartSample + i < totalSamples) {
          left[beatStartSample + i] += kick * 0.7;
          right[beatStartSample + i] += kick * 0.7;
        }
      }

      // Off-beat Open Hi-Hat (on every "and")
      const hatStart = beatStartSample + Math.floor(samplesPerBeat * 0.5);
      for (let i = 0; i < Math.min(sampleRate * 0.15, totalSamples - hatStart); i++) {
        const t = i / sampleRate;
        const hatEnv = Math.exp(-t * 22);
        const noise = (Math.random() * 2 - 1) * hatEnv * 0.22;
        if (hatStart + i < totalSamples) {
          left[hatStart + i] += noise * 0.6;
          right[hatStart + i] += noise * 0.8;
        }
      }

      // Snare / Clap on beats 2 and 4
      if (beat % 2 === 1) {
        for (let i = 0; i < Math.min(sampleRate * 0.2, totalSamples - beatStartSample); i++) {
          const t = i / sampleRate;
          const clapEnv = Math.exp(-t * 18);
          const clapNoise = (Math.random() * 2 - 1) * clapEnv * 0.35;
          const snap = Math.sin(2 * Math.PI * 180 * t) * clapEnv * 0.2;
          if (beatStartSample + i < totalSamples) {
            left[beatStartSample + i] += (clapNoise + snap) * 0.7;
            right[beatStartSample + i] += (clapNoise + snap) * 0.7;
          }
        }
      }

      // Bassline (Rolling 16th note synth)
      const rootFreq = type === 'house' ? 110 : 98; // A2 vs G2
      for (let sub = 0; sub < 4; sub++) {
        const subStart = beatStartSample + Math.floor(samplesPerBeat * (sub * 0.25));
        const noteFreq = rootFreq * (sub === 2 ? 1.25 : sub === 3 ? 1.5 : 1.0);
        for (let i = 0; i < Math.min(sampleRate * 0.12, totalSamples - subStart); i++) {
          const t = i / sampleRate;
          const bassEnv = Math.exp(-t * 16);
          const saw = (2 * ((t * noteFreq) % 1) - 1) * bassEnv * 0.28;
          if (subStart + i < totalSamples) {
            left[subStart + i] += saw * 0.65;
            right[subStart + i] += saw * 0.65;
          }
        }
      }

      // Melodic Synth Chords (every 4 beats)
      if (beat % 4 === 0) {
        const chordFreqs = type === 'house' ? [220, 261.63, 329.63, 392] : [196, 233.08, 293.66, 349.23];
        for (let i = 0; i < Math.min(sampleRate * 1.8, totalSamples - beatStartSample); i++) {
          const t = i / sampleRate;
          const chordEnv = Math.exp(-t * 2.2);
          let chordSample = 0;
          for (const f of chordFreqs) {
            chordSample += Math.sin(2 * Math.PI * f * t);
          }
          chordSample = (chordSample / chordFreqs.length) * chordEnv * 0.22;
          if (beatStartSample + i < totalSamples) {
            left[beatStartSample + i] += chordSample * 0.7;
            right[beatStartSample + i] += chordSample * 0.7;
          }
        }
      }
    }

    // Normalize slightly to prevent clipping
    let maxAmp = 0;
    for (let i = 0; i < totalSamples; i++) {
      const aL = Math.abs(left[i]);
      const aR = Math.abs(right[i]);
      if (aL > maxAmp) maxAmp = aL;
      if (aR > maxAmp) maxAmp = aR;
    }
    if (maxAmp > 0.95) {
      const scale = 0.92 / maxAmp;
      for (let i = 0; i < totalSamples; i++) {
        left[i] *= scale;
        right[i] *= scale;
      }
    }

    const peaks = this.extractPeaks(audioBuffer, 300);
    return {
      buffer: audioBuffer,
      peaks,
      duration,
      bpm,
      title: type === 'house' ? 'Cyber Sunset (Club Mix)' : 'Crimson Pulse (Techno Groove)',
      artist: 'BrowserDJ Studio',
    };
  }
}
