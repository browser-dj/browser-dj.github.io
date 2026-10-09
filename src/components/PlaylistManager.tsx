import React, { useRef, useState } from 'react';
import { UploadCloud, Music, ShieldCheck, Trash2, Search, Sparkles, FolderPlus, FolderOpen, Loader2, ListOrdered, X, Headphones } from 'lucide-react';
import type { TrackMetadata, DeckId } from '../utils/AudioEngine';

interface PlaylistManagerProps {
  tracks: TrackMetadata[];
  deckAQueue: TrackMetadata[];
  deckBQueue: TrackMetadata[];
  onAddFiles: (files: File[]) => void;
  onLoadDemoTracks: () => void;
  onLoadTrackToDeck: (track: TrackMetadata, deck: DeckId) => void;
  onQueueTrack: (track: TrackMetadata, deck: DeckId) => void;
  onRemoveFromQueue: (deck: DeckId, index: number) => void;
  onRemoveTrack: (id: string) => void;
  onClearTracks: () => void;
  onTogglePreview?: (track: TrackMetadata) => void;
  previewTrackId?: string | null;
  isLoadingFiles: boolean;
  decodingStatus?: { current: number; total: number; fileName: string } | null;
  activeDeckATrackId?: string;
  activeDeckBTrackId?: string;
  langLabels: {
    title: string;
    dropzoneText: string;
    dropzoneSubtext: string;
    browseFiles: string;
    browseFolder: string;
    decodingProgress: string;
    loadDemoTracks: string;
    loadToA: string;
    loadToB: string;
    queueNextA: string;
    queueNextB: string;
    queuedBadgeA: string;
    queuedBadgeB: string;
    queueSectionTitle: string;
    searchPlaceholder: string;
    tracksCount: string;
    noTracksFound: string;
    clearAll: string;
    privacyBadge: string;
    quickPreview?: string;
    stopPreview?: string;
  };
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  tracks,
  deckAQueue,
  deckBQueue,
  onAddFiles,
  onLoadDemoTracks,
  onLoadTrackToDeck,
  onQueueTrack,
  onRemoveFromQueue,
  onRemoveTrack,
  onClearTracks,
  onTogglePreview,
  previewTrackId,
  isLoadingFiles,
  decodingStatus,
  activeDeckATrackId,
  activeDeckBTrackId,
  langLabels,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQueueDrawer, setShowQueueDrawer] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f.name)
      );
      if (filesArray.length > 0) {
        onAddFiles(filesArray);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      e.target.value = '';
      onAddFiles(filesArray);
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter((f) =>
        f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f.name)
      );
      e.target.value = '';
      if (filesArray.length > 0) {
        onAddFiles(filesArray);
      }
    }
  };

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQueued = deckAQueue.length + deckBQueue.length;

  return (
    <div className="flex flex-col bg-neutral-900/90 dark:bg-pitch-black border border-neutral-800 rounded-2xl p-3 sm:p-6 shadow-2xl relative w-full">
      {/* Crate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3 sm:pb-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-deep-crimson/80 flex items-center justify-center text-white shadow-[0_0_12px_rgba(131,0,0,0.6)] shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-neutral-100 tracking-wide">
              {langLabels.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">
                {tracks.length} {langLabels.tracksCount}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{langLabels.privacyBadge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {totalQueued > 0 && (
            <button
              type="button"
              onClick={() => setShowQueueDrawer((prev) => !prev)}
              className="px-3 py-1.5 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition border border-amber-500/30"
              title="Toggle Queued Songs Order"
            >
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span>Queued ({totalQueued})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLoadDemoTracks}
            disabled={isLoadingFiles}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-deep-crimson to-bright-crimson hover:brightness-110 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(188,2,2,0.35)] touch-manipulation"
            title="Load two synthesized demo tracks ready to mix"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{langLabels.loadDemoTracks}</span>
          </button>

          {tracks.length > 0 && (
            <button
              type="button"
              onClick={onClearTracks}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-rose-400 transition"
              title={langLabels.clearAll}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden Multi-File & Folder Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error webkitdirectory is standard for folders
        webkitdirectory=""
        directory=""
        onChange={handleFolderInputChange}
        className="hidden"
      />

      {/* Up Next Queue Order Drawer (When songs are queued) */}
      {totalQueued > 0 && showQueueDrawer && (
        <div className="mb-4 sm:mb-5 bg-neutral-950/90 border border-neutral-800 p-3 sm:p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300 mb-2.5 pb-1.5 border-b border-neutral-800/80">
            <span className="flex items-center gap-1.5 text-amber-400 font-mono tracking-wider">
              <ListOrdered className="w-4 h-4" />
              {langLabels.queueSectionTitle}
            </span>
            <span className="text-[10px] text-neutral-500 font-normal">
              Queued tracks will load in this exact order
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Deck A Queue */}
            <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-[#830000]/40">
              <span className="text-[10px] font-mono font-bold text-[#BC0202] block mb-1.5">
                DECK A UPCOMING QUEUE ({deckAQueue.length})
              </span>
              {deckAQueue.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {deckAQueue.map((t, idx) => (
                    <div
                      key={`${t.id}_q_a_${idx}`}
                      className="flex items-center justify-between bg-neutral-950 px-2 py-1 rounded text-xs border border-neutral-800 text-neutral-200"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] font-mono font-bold text-[#BC0202]">
                          #{idx + 1}
                        </span>
                        <span className="truncate max-w-[150px] sm:max-w-[180px] font-medium text-[11px]">
                          {t.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFromQueue('A', idx)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5"
                        title="Remove from Deck A queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-neutral-500 italic">No songs queued for Deck A</span>
              )}
            </div>

            {/* Deck B Queue */}
            <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-[#BC0202]/40">
              <span className="text-[10px] font-mono font-bold text-pure-red block mb-1.5">
                DECK B UPCOMING QUEUE ({deckBQueue.length})
              </span>
              {deckBQueue.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {deckBQueue.map((t, idx) => (
                    <div
                      key={`${t.id}_q_b_${idx}`}
                      className="flex items-center justify-between bg-neutral-950 px-2 py-1 rounded text-xs border border-neutral-800 text-neutral-200"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] font-mono font-bold text-pure-red">
                          #{idx + 1}
                        </span>
                        <span className="truncate max-w-[150px] sm:max-w-[180px] font-medium text-[11px]">
                          {t.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFromQueue('B', idx)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5"
                        title="Remove from Deck B queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-neutral-500 italic">No songs queued for Deck B</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-4 sm:mb-6 select-none ${
          isDragOver
            ? 'border-pure-red bg-bright-crimson/10 scale-[1.01]'
            : 'border-neutral-700/80 hover:border-neutral-500 bg-neutral-950/60 hover:bg-neutral-950/90'
        }`}
      >
        <UploadCloud
          className={`w-9 h-9 sm:w-12 sm:h-12 mb-2 sm:mb-3 transition-colors ${
            isDragOver ? 'text-pure-red animate-bounce' : 'text-neutral-400'
          }`}
        />
        <p className="text-xs sm:text-base font-bold text-neutral-200 text-center mb-1">
          {langLabels.dropzoneText}
        </p>
        <p className="text-[11px] sm:text-xs text-neutral-400 text-center mb-3 sm:mb-4 max-w-md">
          {langLabels.dropzoneSubtext}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition"
          >
            <FolderPlus className="w-4 h-4 text-bright-crimson" />
            <span>{langLabels.browseFiles}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-neutral-850 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-neutral-300 text-xs font-bold flex items-center gap-1.5 border border-neutral-800 transition"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>{langLabels.browseFolder}</span>
          </button>
        </div>
      </div>

      {/* Real-time Decoding Progress Feedback Bar */}
      {isLoadingFiles && decodingStatus && (
        <div className="mb-4 bg-neutral-950 p-3 rounded-xl border border-bright-crimson/50 shadow-[0_0_15px_rgba(188,2,2,0.2)]">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-200 mb-1.5">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-bright-crimson" />
              <span>
                {langLabels.decodingProgress} {decodingStatus.current} of {decodingStatus.total}
              </span>
            </span>
            <span className="text-neutral-400 font-mono text-[11px] truncate max-w-[180px]">
              {decodingStatus.fileName}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-deep-crimson to-pure-red h-full transition-all duration-150"
              style={{
                width: `${Math.round((decodingStatus.current / decodingStatus.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Search Filter */}
      {tracks.length > 0 && (
        <div className="relative mb-3 sm:mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder={langLabels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-bright-crimson transition"
          />
        </div>
      )}

      {/* Track List Cards */}
      {filteredTracks.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredTracks.map((track) => {
            const isDeckA = activeDeckATrackId === track.id;
            const isDeckB = activeDeckBTrackId === track.id;
            const isQueuedA = deckAQueue.some((q) => q.id === track.id);
            const isQueuedB = deckBQueue.some((q) => q.id === track.id);

            return (
              <div
                key={track.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border transition gap-2.5 ${
                  isDeckA
                    ? 'bg-[#830000]/15 border-[#830000]/60'
                    : isDeckB
                    ? 'bg-[#BC0202]/15 border-[#BC0202]/60'
                    : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                      isDeckA
                        ? 'bg-[#830000] text-white shadow-[0_0_8px_#830000]'
                        : isDeckB
                        ? 'bg-[#BC0202] text-white shadow-[0_0_8px_#BC0202]'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {isDeckA ? 'A' : isDeckB ? 'B' : <Music className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-neutral-100 truncate">
                        {track.name}
                      </span>
                      {isQueuedA && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#830000]/30 text-rose-300 border border-[#830000]/50 shrink-0">
                          {langLabels.queuedBadgeA}
                        </span>
                      )}
                      {isQueuedB && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#BC0202]/30 text-pure-red border border-[#BC0202]/50 shrink-0">
                          {langLabels.queuedBadgeB}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span className="truncate max-w-[120px]">{track.artist}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{track.bpm} BPM</span>
                      <span>•</span>
                      <span className="font-mono">{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Deck Load & Queue Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto">
                  {/* Load to Deck A */}
                  <button
                    type="button"
                    onClick={() => onLoadTrackToDeck(track, 'A')}
                    className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wider transition active:scale-95 touch-manipulation ${
                      isDeckA
                        ? 'bg-[#830000] text-white ring-2 ring-white/50'
                        : 'bg-neutral-800 hover:bg-[#830000] text-neutral-200 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {langLabels.loadToA}
                  </button>

                  {/* Queue as Next for Deck A */}
                  <button
                    type="button"
                    onClick={() => onQueueTrack(track, 'A')}
                    className="px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-rose-300 border border-neutral-700 transition active:scale-95"
                    title="Queue this song as Next for Deck A"
                  >
                    {langLabels.queueNextA}
                  </button>

                  {/* Load to Deck B */}
                  <button
                    type="button"
                    onClick={() => onLoadTrackToDeck(track, 'B')}
                    className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wider transition active:scale-95 touch-manipulation ${
                      isDeckB
                        ? 'bg-[#BC0202] text-white ring-2 ring-white/50'
                        : 'bg-neutral-800 hover:bg-[#BC0202] text-neutral-200 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {langLabels.loadToB}
                  </button>

                  {/* Queue as Next for Deck B */}
                  <button
                    type="button"
                    onClick={() => onQueueTrack(track, 'B')}
                    className="px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-pure-red border border-neutral-700 transition active:scale-95"
                    title="Queue this song as Next for Deck B"
                  >
                    {langLabels.queueNextB}
                  </button>

                  {/* Quick Headphone Cue Preview */}
                  {onTogglePreview && track.audioBuffer && (
                    <button
                      type="button"
                      onClick={() => onTogglePreview(track)}
                      className={`p-1 sm:p-1.5 rounded-lg border transition active:scale-95 flex items-center justify-center ${
                        previewTrackId === track.id
                          ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow-[0_0_10px_#f59e0b] animate-pulse font-bold'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-amber-400 hover:border-neutral-600'
                      }`}
                      title={
                        previewTrackId === track.id
                          ? langLabels.stopPreview || 'Stop Preview'
                          : langLabels.quickPreview || 'Quick Headphone Preview'
                      }
                    >
                      <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}

                  {/* Remove Track */}
                  <button
                    type="button"
                    onClick={() => onRemoveTrack(track.id)}
                    className="p-1 sm:p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition"
                    title="Remove from crate"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : tracks.length > 0 ? (
        <div className="py-6 text-center text-xs text-neutral-500">
          {langLabels.noTracksFound}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-neutral-500">
          No tracks loaded yet. Select multiple MP3s, a folder, or click "Load Built-In Demo Beats"!
        </div>
      )}
    </div>
  );
};
