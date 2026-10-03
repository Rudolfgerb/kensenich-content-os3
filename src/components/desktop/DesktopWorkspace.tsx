import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  ExternalLink,
  Layers,
  Video,
  Camera,
  Mic,
  MessageSquare,
  Wand2,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { useContentOS } from '../../context/ContentOSContext';
import { ContentObject, SceneItem } from '../../types/content';

export const DesktopWorkspace: React.FC = () => {
  const {
    activeContent,
    updateContentObject,
    updateScript,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    generateReelWithAi,
    quickAssistAi,
    isAiLoading,
    brandKit,
    exportPackage,
  } = useContentOS();

  const item = activeContent;

  // Local canvas states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(6);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  // AI assistant input & output
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiResponseText, setAiResponseText] = useState<string | null>(null);
  const [aiHookVariants, setAiHookVariants] = useState<string[]>([]);

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-neutral-400">
        Kein Content-Objekt ausgewählt.
      </div>
    );
  }

  const activeScene = item.scenes.find((s) => s.id === selectedSceneId) || item.scenes[0] || null;

  // Playback timer simulation
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAiAction = async (action: 'hook' | 'improve' | 'caption' | 'reel') => {
    setAiResponseText(null);
    setAiHookVariants([]);

    if (action === 'reel') {
      await generateReelWithAi(item.id);
      setAiResponseText('30-Sekunden Reel erfolgreich mit 4 Szenen, Timecodes und Hooks generiert!');
    } else {
      const res = await quickAssistAi(item.id, action);
      if (Array.isArray(res)) {
        setAiHookVariants(res);
      } else if (typeof res === 'string') {
        setAiResponseText(res);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
      {/* Top Workspace Header (PRD Section 2: Content Object metadata) */}
      <div className="px-6 py-3.5 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            {item.code}
          </span>
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateContentObject(item.id, { title: e.target.value }, 'macbook-pro-m3')}
            className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-amber-500 focus:outline-none px-1 py-0.5"
          />
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>·</span>
            <span>Version {item.version}</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono text-[11px] uppercase">{item.syncStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={item.status}
            onChange={(e) => updateContentObject(item.id, { status: e.target.value as any })}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-200 capitalize focus:outline-none focus:border-amber-500"
          >
            <option value="idea">Idea</option>
            <option value="brief">Brief</option>
            <option value="script">Script</option>
            <option value="storyboard">Storyboard</option>
            <option value="production">Production</option>
            <option value="review">Review</option>
            <option value="ready">Ready</option>
            <option value="published">Published</option>
          </select>

          <button
            onClick={() => exportPackage(item.id)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-colors"
          >
            Export Package
          </button>
        </div>
      </div>

      {/* PRD Section 15: 3-COLUMN WORKSPACE: STRUCTURE | CANVAS | AI */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* ================= COLUMN 1: STRUCTURE (3 Cols) ================= */}
        <div className="col-span-3 border-r border-neutral-800/80 bg-neutral-950 p-4 overflow-y-auto space-y-5">
          {/* Section: Brief */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Content Brief
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">{item.brief.duration}</span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block font-medium">Kernaussage</span>
                <textarea
                  value={item.brief.coreMessage}
                  onChange={(e) =>
                    updateContentObject(item.id, { brief: { ...item.brief, coreMessage: e.target.value } })
                  }
                  rows={2}
                  className="w-full bg-transparent text-neutral-200 resize-none focus:outline-none mt-0.5 text-xs leading-relaxed"
                />
              </div>
              <div className="pt-1.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Zielgruppe: {item.brief.targetAudience}</span>
              </div>
            </div>
          </div>

          {/* Section: Script Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
              <span>Script Details</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {item.script.wordCount} Wörter · ~{item.script.estimatedDuration}
              </span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 space-y-3">
              <div>
                <span className="text-[10px] text-amber-400 font-semibold block">Hook (0:00 - 0:03)</span>
                <textarea
                  value={item.script.hook}
                  onChange={(e) => updateScript(item.id, e.target.value, item.script.body, item.script.cta)}
                  rows={2}
                  className="w-full bg-neutral-950/70 border border-neutral-800/70 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 mt-1 resize-none font-medium"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-medium block">Body Text</span>
                <textarea
                  value={item.script.body}
                  onChange={(e) => updateScript(item.id, item.script.hook, e.target.value, item.script.cta)}
                  rows={4}
                  className="w-full bg-neutral-950/70 border border-neutral-800/70 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 mt-1 resize-none leading-relaxed"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-medium block">Call to Action (CTA)</span>
                <input
                  type="text"
                  value={item.script.cta}
                  onChange={(e) => updateScript(item.id, item.script.hook, item.script.body, e.target.value)}
                  className="w-full bg-neutral-950/70 border border-neutral-800/70 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Section: Synchronized Assets (PRD Section 13) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Zugeordnete Assets ({item.assets.length})
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">Mobile Sync</span>
            </div>
            <div className="space-y-1.5">
              {item.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {asset.type === 'video' && <Video className="w-4 h-4 text-amber-500" />}
                    {asset.type === 'image' && <Camera className="w-4 h-4 text-emerald-400" />}
                    {asset.type === 'voice' && <Mic className="w-4 h-4 text-sky-400" />}
                    <div>
                      <div className="font-semibold text-neutral-200 text-[11px]">{asset.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{asset.size} · {asset.deviceId}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {asset.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Canva Design Integration (PRD Section 18) */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">Canva Design</span>
              <span className="text-[10px] text-emerald-400 font-mono">Linked</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img
                src={item.canvaDesign.previewUrl}
                alt="Canva Preview"
                className="w-12 h-12 object-cover rounded-lg border border-neutral-700"
              />
              <div className="flex-1 text-[11px]">
                <div className="font-semibold text-white line-clamp-1">{item.canvaDesign.title}</div>
                <div className="text-[10px] text-neutral-400">{item.canvaDesign.templateType}</div>
              </div>
            </div>
            <a
              href={item.canvaDesign.externalUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>In Canva öffnen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ================= COLUMN 2: CANVAS (6 Cols) ================= */}
        <div className="col-span-6 flex flex-col overflow-hidden bg-neutral-950">
          {/* Canvas Sub-Header */}
          <div className="px-5 py-2.5 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-200">Storyboard & Video Monitor</span>
              <span className="text-[11px] text-neutral-400">({item.scenes.length} Szenen)</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Aspect Ratio Switcher */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      aspectRatio === ratio ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Subtitles Toggle */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  showSubtitles
                    ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                    : 'border-neutral-800 text-neutral-500'
                }`}
              >
                CC Subtitles
              </button>
            </div>
          </div>

          {/* Central Video Monitor Preview */}
          <div className="p-4 flex-1 flex flex-col items-center justify-center overflow-y-auto">
            <div
              className={`relative bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transition-all flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-[250px] aspect-[9/16]'
                  : aspectRatio === '16:9'
                  ? 'w-[480px] aspect-[16/9]'
                  : 'w-[320px] aspect-square'
              }`}
            >
              <img
                src={activeScene?.thumbnailUrl || '/src/assets/images/social_reel_creator_1791010043370.jpg'}
                alt="Active scene frame"
                className="w-full h-full object-cover"
              />

              {/* Dynamic Subtitle Overlay */}
              {showSubtitles && (
                <div className="absolute bottom-10 inset-x-3 text-center pointer-events-none">
                  <span className="bg-black/75 backdrop-blur-sm text-white font-extrabold text-xs px-2.5 py-1 rounded tracking-wide leading-tight shadow-lg uppercase border border-white/10">
                    {activeScene?.spokenText || item.script.hook}
                  </span>
                </div>
              )}

              {/* Play / Pause Scrim Trigger */}
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </div>
              </button>

              {/* Timecode badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-neutral-200 text-[10px] font-mono px-2 py-0.5 rounded">
                {activeScene ? activeScene.timecode : '0:00 - 0:32'}
              </div>
            </div>

            {/* Scrubber playback controls */}
            <div className="w-full max-w-lg mt-3 flex items-center gap-3 px-4">
              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-400">00:06</span>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={playbackTime}
                  onChange={(e) => setPlaybackTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] font-mono text-neutral-400">00:32</span>
              </div>
            </div>
          </div>

          {/* PRD Section 16: STORYBOARD CANVAS [01] [02] [03] [04] */}
          <div className="border-t border-neutral-800/80 bg-neutral-900/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-200">Szenen-Ablauf (Drag & Drop Reordering)</span>
                <span className="text-[10px] text-neutral-500">Klicke eine Szene zum Vorschauen</span>
              </div>
              <button
                onClick={() =>
                  addScene(item.id, {
                    title: `Szene ${item.scenes.length + 1}`,
                    timecode: `0:${String((item.scenes.length) * 6).padStart(2, '0')} - 0:${String((item.scenes.length + 1) * 6).padStart(2, '0')}`,
                    cameraAngle: 'Selfie Dynamic 35mm',
                    spokenText: '',
                    visualDescription: 'B-Roll Clip',
                    audioTrack: 'Voiceover',
                    thumbnailUrl: '/src/assets/images/social_reel_creator_1791010043370.jpg',
                  })
                }
                className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Szene hinzufügen
              </button>
            </div>

            {/* Horizontal Storyboard Grid */}
            <div className="grid grid-cols-4 gap-3 overflow-x-auto no-scrollbar pb-1">
              {item.scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`group relative bg-neutral-900 border rounded-xl p-2.5 cursor-pointer transition-all ${
                    (selectedSceneId === scene.id || (!selectedSceneId && idx === 0))
                      ? 'border-amber-500 shadow-md shadow-amber-500/10'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="relative aspect-[9/14] rounded-lg overflow-hidden border border-neutral-800 mb-2">
                    <img
                      src={scene.thumbnailUrl || '/src/assets/images/social_reel_creator_1791010043370.jpg'}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-neutral-950/80 font-mono text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded">
                      [0{scene.order}]
                    </div>
                    <div className="absolute bottom-1.5 inset-x-1.5 text-center">
                      <span className="text-[9px] font-mono text-neutral-300 bg-black/70 px-1.5 py-0.5 rounded truncate block">
                        {scene.timecode}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-white truncate">{scene.title}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{scene.cameraAngle}</div>

                  {/* Reordering affordances */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newScenes = [...item.scenes];
                          [newScenes[idx - 1], newScenes[idx]] = [newScenes[idx], newScenes[idx - 1]];
                          reorderScenes(item.id, newScenes);
                        }}
                        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300"
                        title="Move Left"
                      >
                        <MoveLeft className="w-3 h-3" />
                      </button>
                      <button
                        disabled={idx === item.scenes.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newScenes = [...item.scenes];
                          [newScenes[idx + 1], newScenes[idx]] = [newScenes[idx], newScenes[idx + 1]];
                          reorderScenes(item.id, newScenes);
                        }}
                        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300"
                        title="Move Right"
                      >
                        <MoveRight className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(item.id, scene.id);
                      }}
                      className="p-1 text-neutral-500 hover:text-red-400"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: AI ASSISTANT PANEL (3 Cols) ================= */}
        <div className="col-span-3 border-l border-neutral-800/80 bg-neutral-950 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-white tracking-tight">AI Content Assistant</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Gemini 3.8</span>
          </div>

          {/* Context Card (PRD Section 25: AI Context) */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 space-y-1.5 text-[11px]">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Aktiver Kontext</span>
            <div className="text-neutral-200">
              <span className="text-neutral-400">Content:</span> {item.code}
            </div>
            <div className="text-neutral-200">
              <span className="text-neutral-400">Brand Kit:</span> {brandKit.brandName}
            </div>
            <div className="text-neutral-200">
              <span className="text-neutral-400">Style:</span> {brandKit.videoStyle}
            </div>
          </div>

          {/* Core AI Actions (PRD Section 24 & Section 26) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300 block">Orchestrierungs-Aktionen</span>

            <button
              onClick={() => handleAiAction('reel')}
              disabled={isAiLoading}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-between shadow-lg disabled:opacity-50 transition-all text-left"
            >
              <div>
                <div className="leading-snug">30s Reel Struktur erstellen</div>
                <div className="text-[10px] font-normal opacity-90">Baut Hook, Script, 4 Szenen & CTA</div>
              </div>
              <Sparkles className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => handleAiAction('hook')}
              disabled={isAiLoading}
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-between transition-colors text-left"
            >
              <span>3 kontroverse Hooks generieren</span>
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
            </button>

            <button
              onClick={() => handleAiAction('improve')}
              disabled={isAiLoading}
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-between transition-colors text-left"
            >
              <span>Script auf Retention schärfen</span>
              <FileText className="w-3.5 h-3.5 text-sky-400" />
            </button>

            <button
              onClick={() => handleAiAction('caption')}
              disabled={isAiLoading}
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-between transition-colors text-left"
            >
              <span>Social Media Captions erstellen</span>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* AI Response Output Card */}
          {aiResponseText && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-xs space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase">AI Ergebnis</span>
              <p className="text-neutral-200 whitespace-pre-wrap leading-relaxed">{aiResponseText}</p>
            </div>
          )}

          {/* Hook Variant Buttons */}
          {aiHookVariants.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Wähle deinen Hook</span>
              {aiHookVariants.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    updateScript(item.id, h, item.script.body, item.script.cta);
                    setAiHookVariants([]);
                  }}
                  className="w-full text-left p-2.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500 rounded-xl text-xs text-white transition-colors"
                >
                  "{h}"
                </button>
              ))}
            </div>
          )}

          {/* Platform Variants Summary (PRD Section 22) */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-2">
            <span className="text-xs font-bold text-neutral-300 block">Plattform Varianten</span>
            <div className="space-y-1.5">
              {item.platformVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60 text-xs"
                >
                  <span className="text-neutral-300 font-medium">{variant.name}</span>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">{variant.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
