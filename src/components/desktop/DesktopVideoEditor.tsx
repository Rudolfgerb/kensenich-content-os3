import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Volume2,
  Film,
  Type,
  Music,
  Sparkles,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react';
import { useContentOS } from '../../context/ContentOSContext';

export const DesktopVideoEditor: React.FC = () => {
  const { activeContent, updateContentObject } = useContentOS();
  const item = activeContent;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(6); // in seconds
  const [activeTrack, setActiveTrack] = useState<string>('video');

  if (!item) return null;

  const timeline = item.videoProject.timeline;
  const duration = item.videoProject.duration || 32;

  // Render status badge
  const renderStatus = item.videoProject.renderStatus;

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-white">Mutuus Video Timeline Studio</span>
          <span className="text-xs text-neutral-400 font-mono">· {item.code} ({item.title})</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-mono">
            Status: <span className="text-emerald-400 font-bold uppercase">{renderStatus}</span>
          </span>
          <button
            onClick={() => {
              updateContentObject(item.id, {
                videoProject: {
                  ...item.videoProject,
                  renderStatus: 'complete',
                  renderProgress: 100,
                },
              });
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Remotion Render starten
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-6 flex items-center justify-center bg-neutral-950/60 overflow-hidden">
        <div className="relative w-[280px] aspect-[9/16] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          <img
            src="/src/assets/images/social_reel_creator_1791010043370.jpg"
            alt="Timeline Frame"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
            <span className="bg-black/70 text-white font-extrabold text-xs px-2 py-1 rounded w-fit mb-2 uppercase">
              {playheadTime < 6 ? 'KEINE ZEIT?' : playheadTime < 15 ? '4 SEKUNDEN' : 'TUNNELBLICK'}
            </span>
            <div className="text-[10px] text-neutral-300 font-mono">
              00:{String(playheadTime).padStart(2, '0')} / 00:{duration}
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </div>
          </button>
        </div>
      </div>

      {/* PRD Section 17: DESKTOP MULTITRACK TIMELINE (VIDEO, VOICE, TEXT, MUSIC, SFX) */}
      <div className="h-72 border-t border-neutral-800 bg-neutral-900/80 flex flex-col select-none">
        {/* Timeline Control Bar */}
        <div className="h-10 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={() => setPlayheadTime(0)}
              className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-amber-400">
              00:{String(playheadTime).padStart(2, '0')}:00
            </span>
          </div>

          {/* Time markers */}
          <div className="flex-1 max-w-xl mx-8 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span>00:00</span>
            <span>00:08</span>
            <span>00:16</span>
            <span>00:24</span>
            <span>00:32</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              <span>Split</span>
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-xs">
          {/* TRACK 1: VIDEO */}
          <div className="flex items-center gap-3 h-9">
            <div className="w-20 text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-500" />
              VIDEO
            </div>
            <div className="flex-1 h-8 bg-neutral-950 rounded-lg border border-neutral-800 relative flex overflow-hidden">
              {timeline.videoTracks.map((clip) => {
                const widthPercent = (clip.duration / duration) * 100;
                return (
                  <div
                    key={clip.id}
                    className="h-full border-r border-neutral-900 px-2 flex items-center text-[10px] font-bold text-neutral-950 truncate transition-all hover:brightness-110 cursor-pointer"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: clip.color,
                    }}
                  >
                    {clip.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: VOICE */}
          <div className="flex items-center gap-3 h-9">
            <div className="w-20 text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              VOICE
            </div>
            <div className="flex-1 h-8 bg-neutral-950 rounded-lg border border-neutral-800 relative flex overflow-hidden">
              {timeline.voiceTracks.map((clip) => (
                <div
                  key={clip.id}
                  className="h-full px-2 flex items-center text-[10px] font-bold text-neutral-950 truncate"
                  style={{
                    width: `${(clip.duration / duration) * 100}%`,
                    backgroundColor: clip.color,
                  }}
                >
                  {clip.name}
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 3: TEXT */}
          <div className="flex items-center gap-3 h-9">
            <div className="w-20 text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              TEXT
            </div>
            <div className="flex-1 h-8 bg-neutral-950 rounded-lg border border-neutral-800 relative flex overflow-hidden">
              {timeline.textTracks.map((clip) => {
                const leftPercent = (clip.start / duration) * 100;
                const widthPercent = (clip.duration / duration) * 100;
                return (
                  <div
                    key={clip.id}
                    className="h-full px-2 flex items-center text-[10px] font-bold text-white rounded absolute truncate"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: clip.color,
                    }}
                  >
                    {clip.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 4: MUSIC */}
          <div className="flex items-center gap-3 h-9">
            <div className="w-20 text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-sky-400" />
              MUSIC
            </div>
            <div className="flex-1 h-8 bg-neutral-950 rounded-lg border border-neutral-800 relative flex overflow-hidden">
              {timeline.musicTracks.map((clip) => (
                <div
                  key={clip.id}
                  className="h-full px-2 flex items-center text-[10px] font-bold text-white truncate"
                  style={{
                    width: `${(clip.duration / duration) * 100}%`,
                    backgroundColor: clip.color,
                  }}
                >
                  {clip.name}
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 5: SFX */}
          <div className="flex items-center gap-3 h-9">
            <div className="w-20 text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SFX
            </div>
            <div className="flex-1 h-8 bg-neutral-950 rounded-lg border border-neutral-800 relative flex overflow-hidden">
              {timeline.sfxTracks.map((clip) => {
                const leftPercent = (clip.start / duration) * 100;
                const widthPercent = (clip.duration / duration) * 100;
                return (
                  <div
                    key={clip.id}
                    className="h-full px-2 flex items-center text-[10px] font-bold text-neutral-950 rounded absolute truncate"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: clip.color,
                    }}
                  >
                    {clip.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
