import React, { useState } from 'react';
import {
  Home,
  Lightbulb,
  Plus,
  Layers,
  User,
  Sparkles,
  Camera,
  Mic,
  Video,
  FileText,
  ChevronRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Upload,
  Share2,
  Trash2,
  MoveUp,
  MoveDown,
  Wand2,
} from 'lucide-react';
import { useContentOS } from '../../context/ContentOSContext';
import { ContentObject, SceneItem } from '../../types/content';
import { MobileMediaCapture } from './MobileMediaCapture';

interface MobileCreatorStationProps {
  isEmbedded?: boolean;
}

export const MobileCreatorStation: React.FC<MobileCreatorStationProps> = ({ isEmbedded = false }) => {
  const {
    contentList,
    activeContent,
    activeContentId,
    setActiveContentId,
    createIdea,
    updateContentObject,
    updateScript,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    addAsset,
    generateBriefFromVoiceAi,
    quickAssistAi,
    generateReelWithAi,
    isOnline,
    lastSyncedAt,
    brandKit,
    projects,
    activeProjectId,
  } = useContentOS();

  // Mobile navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'ideas' | 'pipeline' | 'me'>('home');
  const [editorSubTab, setEditorSubTab] = useState<'overview' | 'script' | 'scenes' | 'assets' | 'caption' | 'publish'>('overview');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Quick Action "+" Sheet
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [captureModalMode, setCaptureModalMode] = useState<'camera' | 'voice' | 'idea' | null>(null);

  // AI loading in mobile
  const [mobileAiLoading, setMobileAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const currentItem = activeContent || contentList[0];

  // Mobile status mapping (PRD Section 20: Ideas -> In Progress -> Review -> Ready -> Published)
  const getMobileStatusLabel = (status: ContentObject['status']) => {
    switch (status) {
      case 'idea':
        return 'Idee';
      case 'brief':
      case 'script':
      case 'storyboard':
      case 'production':
        return 'In Bearbeitung';
      case 'review':
        return 'Review';
      case 'ready':
        return 'Bereit';
      case 'published':
        return 'Veröffentlicht';
      default:
        return status;
    }
  };

  const handleOpenContent = (id: string) => {
    setActiveContentId(id);
    setIsEditorOpen(true);
    setEditorSubTab('overview');
  };

  const handleCreateFromCapture = (data: {
    title: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'video' | 'image' | 'voice';
  }) => {
    const created = createIdea({
      title: data.title,
      source: data.mediaType === 'video' ? 'camera' : data.mediaType === 'voice' ? 'voice' : 'text',
      initialText: data.text,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
    });
    setIsEditorOpen(true);
    setEditorSubTab('overview');
  };

  // Quick AI triggers on mobile (PRD Section 24)
  const handleAiAction = async (action: 'hook' | 'improve' | 'caption' | 'reel') => {
    if (!currentItem) return;
    setMobileAiLoading(true);
    setAiSuggestions([]);

    try {
      if (action === 'reel') {
        await generateReelWithAi(currentItem.id);
        setEditorSubTab('scenes');
      } else {
        const result = await quickAssistAi(currentItem.id, action);
        if (Array.isArray(result)) {
          setAiSuggestions(result);
        } else if (typeof result === 'string') {
          if (action === 'improve') {
            updateScript(currentItem.id, currentItem.script.hook, result, currentItem.script.cta);
          } else if (action === 'caption') {
            updateContentObject(currentItem.id, {
              captions: { ...currentItem.captions, instagram: result },
            });
            setEditorSubTab('caption');
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMobileAiLoading(false);
    }
  };

  return (
    <div
      className={`relative mx-auto bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden shadow-2xl select-none ${
        isEmbedded
          ? 'w-full max-w-[390px] h-[780px] rounded-[44px] border-[10px] border-neutral-800'
          : 'w-full max-w-md h-[844px] rounded-[48px] border-[12px] border-neutral-800'
      }`}
    >
      {/* Dynamic Notch / Status Bar */}
      <div className="h-10 px-6 pt-3 flex items-center justify-between z-20 text-[11px] font-semibold text-neutral-400 bg-neutral-950">
        <span>09:41</span>
        {/* Dynamic Island Pill */}
        <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-neutral-400 font-mono">Mutuus Sync</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-300">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-[10px] font-mono">{isOnline ? '5G' : 'OFF'}</span>
          <span>100%</span>
        </div>
      </div>

      {/* SUB-VIEW: CONTENT OBJECT EDITOR (PRD Section 14) */}
      {isEditorOpen && currentItem ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
          {/* Top App Bar */}
          <div className="px-4 py-2.5 border-b border-neutral-900 flex items-center justify-between">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white min-h-[44px] px-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="text-center truncate px-2">
              <div className="text-[11px] text-amber-500 font-mono">{currentItem.code}</div>
              <div className="text-xs font-bold text-white truncate max-w-[190px]">{currentItem.title}</div>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              {getMobileStatusLabel(currentItem.status)}
            </span>
          </div>

          {/* Editor Tabs (Overview, Script, Scenes, Assets, Caption, Publish) */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-900 bg-neutral-900/60 overflow-x-auto text-[11px] font-medium no-scrollbar">
            {(['overview', 'script', 'scenes', 'assets', 'caption', 'publish'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setEditorSubTab(tab)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap capitalize transition-colors min-h-[36px] ${
                  editorSubTab === tab ? 'bg-neutral-800 text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* OVERVIEW TAB */}
            {editorSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-medium">Status & Sync</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      v{currentItem.version} · {currentItem.syncStatus.toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => updateContentObject(currentItem.id, { title: e.target.value }, 'iphone-16-pro')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {currentItem.brief.coreMessage || 'Keine Briefing-Details hinterlegt.'}
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-neutral-400">Szenen</div>
                    <div className="text-base font-bold text-white mt-0.5">{currentItem.scenes.length}</div>
                  </div>
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-neutral-400">Assets</div>
                    <div className="text-base font-bold text-white mt-0.5">{currentItem.assets.length}</div>
                  </div>
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-neutral-400">Dauer</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">{currentItem.script.estimatedDuration}</div>
                  </div>
                </div>

                {/* Mobile Camera Shortcut */}
                <button
                  onClick={() => setCaptureModalMode('camera')}
                  className="w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between text-left hover:border-amber-500/50 transition-all min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Rohmaterial aufnehmen</div>
                      <div className="text-[10px] text-neutral-400">Video oder Foto direkt in {currentItem.code}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>

                {/* AI Quick Transform */}
                <button
                  onClick={() => handleAiAction('reel')}
                  disabled={mobileAiLoading}
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {mobileAiLoading ? 'AI baut Storyboard...' : 'In 30s Reel wandeln'}
                      </div>
                      <div className="text-[10px] text-neutral-400">Erstellt 4 Szenen, Hook & Visuals</div>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                </button>
              </div>
            )}

            {/* SCRIPT TAB */}
            {editorSubTab === 'script' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-amber-400">Hook (Erste 3 Sekunden)</label>
                    <button
                      onClick={() => handleAiAction('hook')}
                      disabled={mobileAiLoading}
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 min-h-[30px]"
                    >
                      <Wand2 className="w-3 h-3" />
                      3 Hooks generieren
                    </button>
                  </div>
                  <textarea
                    value={currentItem.script.hook}
                    onChange={(e) =>
                      updateScript(currentItem.id, e.target.value, currentItem.script.body, currentItem.script.cta)
                    }
                    rows={2}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* AI Hook Suggestions if generated */}
                {aiSuggestions.length > 0 && (
                  <div className="bg-sky-950/30 border border-sky-800/50 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-semibold text-sky-300">Hook Vorschläge (Tippe zum Übernehmen):</span>
                    {aiSuggestions.map((hookStr, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          updateScript(currentItem.id, hookStr, currentItem.script.body, currentItem.script.cta);
                          setAiSuggestions([]);
                        }}
                        className="w-full text-left text-[11px] text-neutral-200 bg-neutral-900/80 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        {hookStr}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-neutral-300">Script Body</label>
                    <button
                      onClick={() => handleAiAction('improve')}
                      disabled={mobileAiLoading}
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 min-h-[30px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      Improve Script
                    </button>
                  </div>
                  <textarea
                    value={currentItem.script.body}
                    onChange={(e) =>
                      updateScript(currentItem.id, currentItem.script.hook, e.target.value, currentItem.script.cta)
                    }
                    rows={5}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300">Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={currentItem.script.cta}
                    onChange={(e) =>
                      updateScript(currentItem.id, currentItem.script.hook, currentItem.script.body, e.target.value)
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* SCENES TAB (PRD Section 16: Mobile Storyboard) */}
            {editorSubTab === 'scenes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Storyboard ({currentItem.scenes.length} Szenen)</span>
                  <button
                    onClick={() =>
                      addScene(currentItem.id, {
                        title: `Szene ${currentItem.scenes.length + 1}`,
                        timecode: '0:20 - 0:25',
                        cameraAngle: 'Selfie Eye-Level',
                        spokenText: '',
                        visualDescription: 'B-Roll Clip',
                        audioTrack: 'Voiceover',
                        thumbnailUrl: '/src/assets/images/social_reel_creator_1791010043370.jpg',
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    + Szene
                  </button>
                </div>

                {currentItem.scenes.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-4">
                    <p className="text-xs text-neutral-400 mb-3">Noch keine Szenen vorhanden.</p>
                    <button
                      onClick={() => handleAiAction('reel')}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold"
                    >
                      AI Szenen generieren
                    </button>
                  </div>
                ) : (
                  currentItem.scenes.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-bold text-amber-400 flex items-center justify-center">
                            {scene.order}
                          </span>
                          <span className="text-xs font-bold text-white">{scene.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">{scene.timecode}</span>
                      </div>

                      <div className="flex gap-3">
                        <img
                          src={scene.thumbnailUrl || '/src/assets/images/social_reel_creator_1791010043370.jpg'}
                          alt={scene.title}
                          className="w-16 h-20 rounded-lg object-cover border border-neutral-800 flex-shrink-0"
                        />
                        <div className="flex-1 space-y-1 text-[11px]">
                          <div className="text-neutral-400">
                            <span className="text-neutral-200 font-medium">Kamera:</span> {scene.cameraAngle}
                          </div>
                          <p className="text-neutral-300 line-clamp-2 italic">
                            "{scene.spokenText || scene.visualDescription}"
                          </p>
                        </div>
                      </div>

                      {/* Reorder controls for mobile */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => {
                              const newScenes = [...currentItem.scenes];
                              [newScenes[idx - 1], newScenes[idx]] = [newScenes[idx], newScenes[idx - 1]];
                              reorderScenes(currentItem.id, newScenes);
                            }}
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === currentItem.scenes.length - 1}
                            onClick={() => {
                              const newScenes = [...currentItem.scenes];
                              [newScenes[idx + 1], newScenes[idx]] = [newScenes[idx], newScenes[idx + 1]];
                              reorderScenes(currentItem.id, newScenes);
                            }}
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => deleteScene(currentItem.id, scene.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ASSETS TAB (PRD Section 13: Mobile Asset Capture) */}
            {editorSubTab === 'assets' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Medien & Rohmaterial</span>
                  <button
                    onClick={() => setCaptureModalMode('camera')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Aufnahme
                  </button>
                </div>

                <div className="space-y-2">
                  {currentItem.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 font-mono text-[10px]">
                          {asset.type === 'video' && <Video className="w-4 h-4" />}
                          {asset.type === 'image' && <Camera className="w-4 h-4" />}
                          {asset.type === 'voice' && <Mic className="w-4 h-4 text-sky-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{asset.name}</div>
                          <div className="text-[10px] text-neutral-400">
                            {asset.size} · {asset.duration || 'Still'} · {asset.deviceId}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CAPTION TAB */}
            {editorSubTab === 'caption' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Social Media Caption</span>
                  <button
                    onClick={() => handleAiAction('caption')}
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Caption optimieren
                  </button>
                </div>
                <textarea
                  value={currentItem.captions.instagram}
                  onChange={(e) =>
                    updateContentObject(currentItem.id, {
                      captions: { ...currentItem.captions, instagram: e.target.value },
                    })
                  }
                  rows={6}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {currentItem.captions.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PUBLISH TAB */}
            {editorSubTab === 'publish' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-white">Publishing Status</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['idea', 'production', 'review', 'ready', 'published'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateContentObject(currentItem.id, { status: st })}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                          currentItem.status === st
                            ? 'bg-amber-500 text-neutral-950 shadow-md'
                            : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {getMobileStatusLabel(st)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-white">Plattform Varianten</div>
                  {currentItem.platformVariants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-800/60 last:border-none">
                      <span className="text-neutral-300">{v.name}</span>
                      <span className="text-[10px] text-amber-400 font-mono uppercase">{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MAIN MOBILE NAVIGATION VIEWS (Home, Ideas, Pipeline, Me) */
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
          {/* Top Bar */}
          <div className="px-5 py-3 border-b border-neutral-900 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-400 font-mono tracking-wider uppercase">MUTUUS MOBILE</div>
              <div className="text-sm font-bold text-white tracking-tight">Creator Station</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400">
                {isOnline ? 'Cloud Synced' : 'Offline Queue'}
              </span>
            </div>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                {/* Active Focus Card */}
                {currentItem && (
                  <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-400">Aktueller Content</span>
                      <span className="text-[10px] font-mono text-neutral-400">{currentItem.code}</span>
                    </div>

                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-neutral-800">
                      <img
                        src="/src/assets/images/social_reel_creator_1791010043370.jpg"
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                        <div className="text-xs font-bold text-white line-clamp-1">{currentItem.title}</div>
                        <div className="text-[10px] text-neutral-300">
                          {currentItem.scenes.length} Szenen · {currentItem.assets.length} Assets · {currentItem.script.estimatedDuration}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenContent(currentItem.id)}
                      className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                    >
                      <span>Bearbeiten & Storyboard öffnen</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Capture Bar */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCaptureModalMode('voice')}
                    className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 flex flex-col items-center justify-center gap-1.5 text-center min-h-[56px] transition-all"
                  >
                    <Mic className="w-5 h-5 text-sky-400" />
                    <span className="text-[10px] font-bold text-white">Voice Note</span>
                  </button>
                  <button
                    onClick={() => setCaptureModalMode('camera')}
                    className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 flex flex-col items-center justify-center gap-1.5 text-center min-h-[56px] transition-all"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-bold text-white">Kamera</span>
                  </button>
                  <button
                    onClick={() => setCaptureModalMode('idea')}
                    className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 flex flex-col items-center justify-center gap-1.5 text-center min-h-[56px] transition-all"
                  >
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] font-bold text-white">Idee</span>
                  </button>
                </div>

                {/* Recent Content List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-neutral-300">Zuletzt bearbeitet</span>
                    <span className="text-[10px] text-neutral-500">{contentList.length} Objekte</span>
                  </div>

                  {contentList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenContent(item.id)}
                      className="bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400 font-mono text-[10px] font-bold">
                          {item.source === 'voice' ? <Mic className="w-4 h-4 text-sky-400" /> : <Layers className="w-4 h-4" />}
                        </div>
                        <div className="max-w-[200px]">
                          <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                          <div className="text-[10px] text-neutral-400">
                            {item.code} · v{item.version} · {getMobileStatusLabel(item.status)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. IDEAS TAB */}
            {activeTab === 'ideas' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">Ideen-Speicher</span>
                  <button
                    onClick={() => setCaptureModalMode('voice')}
                    className="text-[10px] text-sky-400 font-semibold flex items-center gap-1"
                  >
                    <Mic className="w-3 h-3" />
                    Voice Note aufnehmen
                  </button>
                </div>

                {contentList
                  .filter((c) => c.status === 'idea' || c.source === 'voice')
                  .map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => handleOpenContent(idea.id)}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 space-y-2 cursor-pointer hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-400">{idea.code}</span>
                        <span className="text-[9px] uppercase font-mono text-neutral-400">{idea.source}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{idea.title}</div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">{idea.brief.coreMessage || idea.script.body}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* 3. PIPELINE TAB */}
            {activeTab === 'pipeline' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-neutral-200">Mobile Content Pipeline</div>
                {(['idea', 'production', 'review', 'ready', 'published'] as const).map((stage) => {
                  const itemsInStage = contentList.filter((c) =>
                    stage === 'production'
                      ? ['brief', 'script', 'storyboard', 'production'].includes(c.status)
                      : c.status === stage
                  );
                  return (
                    <div key={stage} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 capitalize">{getMobileStatusLabel(stage)}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{itemsInStage.length}</span>
                      </div>
                      {itemsInStage.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenContent(item.id)}
                          className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-xs text-white truncate max-w-[210px]">{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. ME TAB (PRD Section 4: Projects, Brand, Settings) */}
            {activeTab === 'me' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
                  <img
                    src="/src/assets/images/creator_profile_avatar_1791010063573.jpg"
                    alt="Creator Profile"
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Alex · Mobile Creator</div>
                    <div className="text-[10px] text-neutral-400">{brandKit.brandName}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">iPhone 16 Pro · Synced</div>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-white">Aktives Projekt</div>
                  <div className="text-xs text-amber-400 font-medium">{projects.find((p) => p.id === activeProjectId)?.name}</div>
                  <p className="text-[11px] text-neutral-400">{brandKit.tagline}</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-white">Speicher & Sync</div>
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-mono">{isOnline ? 'Online (Cloud Sync)' : 'Offline'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span>Letzter Abgleich:</span>
                    <span className="text-neutral-400">{lastSyncedAt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRD Section 4: FIXED BOTTOM NAVIGATION (Home | Ideas | Create | Pipeline | Me) */}
      <div className="h-16 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-900 grid grid-cols-5 items-center px-2 z-20">
        <button
          onClick={() => {
            setIsEditorOpen(false);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            !isEditorOpen && activeTab === 'home' ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </button>

        <button
          onClick={() => {
            setIsEditorOpen(false);
            setActiveTab('ideas');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            !isEditorOpen && activeTab === 'ideas' ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Ideas</span>
        </button>

        {/* PRD Section 10: Center Quick Action "+" button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowCreateSheet(true)}
            className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all -mt-3"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => {
            setIsEditorOpen(false);
            setActiveTab('pipeline');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            !isEditorOpen && activeTab === 'pipeline' ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Pipeline</span>
        </button>

        <button
          onClick={() => {
            setIsEditorOpen(false);
            setActiveTab('me');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            !isEditorOpen && activeTab === 'me' ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Me</span>
        </button>
      </div>

      {/* PRD Section 10: Mobile Idea Capture Quick Action Sheet */}
      {showCreateSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="w-full max-w-[390px] bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto" />
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Schnell erfassen</h3>
              <p className="text-[11px] text-neutral-400">Direkt in den Cloud-Speicher übertragen</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  setCaptureModalMode('voice');
                }}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-3 text-left transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">🎙 Voice</div>
                  <div className="text-[10px] text-neutral-400">Sprachnotiz & AI</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  setCaptureModalMode('camera');
                }}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-3 text-left transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">📷 Kamera</div>
                  <div className="text-[10px] text-neutral-400">Foto & Video</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  setCaptureModalMode('idea');
                }}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-3 text-left transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">💡 Idee</div>
                  <div className="text-[10px] text-neutral-400">Text-Prompt</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  handleCreateFromCapture({
                    title: 'Neuer Schnell-Entwurf',
                    text: 'Notizen unterwegs...',
                  });
                }}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-3 text-left transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">📝 Notiz</div>
                  <div className="text-[10px] text-neutral-400">Freitext</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowCreateSheet(false)}
              className="w-full py-2.5 text-xs text-neutral-400 hover:text-white font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Media Capture Modal */}
      {captureModalMode && (
        <MobileMediaCapture
          mode={captureModalMode}
          onClose={() => setCaptureModalMode(null)}
          onSave={handleCreateFromCapture}
          onAiTransform={generateBriefFromVoiceAi}
        />
      )}
    </div>
  );
};
