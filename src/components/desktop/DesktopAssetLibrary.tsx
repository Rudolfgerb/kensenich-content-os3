import React, { useState } from 'react';
import { useContentOS } from '../../context/ContentOSContext';
import { AssetRecord, SceneItem } from '../../types/content';
import {
  Video,
  Camera,
  Mic,
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Play,
  Pause,
  Download,
  Trash2,
  HardDrive,
  Smartphone,
  Monitor,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  X,
  Volume2,
  Upload,
} from 'lucide-react';

interface DesktopAssetLibraryProps {
  onAssignToScene?: (assetId: string, sceneId: string) => void;
  onNavigateToWorkspace?: () => void;
}

export const DesktopAssetLibrary: React.FC<DesktopAssetLibraryProps> = ({
  onAssignToScene,
  onNavigateToWorkspace,
}) => {
  const { activeContent, addAsset, updateContentObject } = useContentOS();
  const item = activeContent;

  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'image' | 'voice'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewAsset, setPreviewAsset] = useState<AssetRecord | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadAssetType, setUploadAssetType] = useState<'video' | 'image' | 'voice'>('video');
  const [uploadAssetName, setUploadAssetName] = useState('');

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-neutral-400">
        Kein aktives Content-Objekt ausgewählt.
      </div>
    );
  }

  // Filter assets
  const filteredAssets = item.assets.filter((asset) => {
    const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countVideos = item.assets.filter((a) => a.type === 'video').length;
  const countImages = item.assets.filter((a) => a.type === 'image').length;
  const countVoices = item.assets.filter((a) => a.type === 'voice').length;

  // Handle simulated audio play
  const handleTogglePlayVoice = (assetId: string) => {
    if (playingVoiceId === assetId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(assetId);
    }
  };

  // Delete asset
  const handleDeleteAsset = (assetId: string) => {
    const remaining = item.assets.filter((a) => a.id !== assetId);
    updateContentObject(item.id, { assets: remaining });
    if (previewAsset?.id === assetId) setPreviewAsset(null);
  };

  // Add new asset simulation
  const handleAddSampleAsset = (type: 'video' | 'image' | 'voice') => {
    const nextNum = item.assets.filter((a) => a.type === type).length + 1;
    const prefix = type === 'video' ? 'VID' : type === 'voice' ? 'VOICE' : 'IMG';
    const ext = type === 'video' ? 'mp4' : type === 'voice' ? 'm4a' : 'jpg';
    const defaultUrl =
      type === 'video'
        ? '/src/assets/images/social_reel_creator_1791010043370.jpg'
        : type === 'image'
        ? '/src/assets/images/content_studio_desk_1791010031496.jpg'
        : '#voice-audio';

    addAsset(item.id, {
      name: `${prefix}_${String(nextNum).padStart(3, '0')}.${ext}`,
      type,
      url: defaultUrl,
      size: type === 'video' ? '34.8 MB' : type === 'image' ? '4.2 MB' : '1.8 MB',
      duration: type === 'video' ? '0:22' : type === 'voice' ? '0:35' : undefined,
    });
    setShowUploadModal(false);
  };

  // Assign to scene
  const handleAssignScene = (asset: AssetRecord, sceneId: string) => {
    const updatedScenes = item.scenes.map((s) => {
      if (s.id === sceneId) {
        return {
          ...s,
          assetId: asset.id,
          thumbnailUrl: asset.type === 'image' || asset.type === 'video' ? asset.url : s.thumbnailUrl,
        };
      }
      return s;
    });
    updateContentObject(item.id, { scenes: updatedScenes });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {item.code}
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">Asset Library</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronisierte Rohmedien (B-Roll, Kamera-Videos, Fotos &amp; Voice Notes) für {item.title}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick upload button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Asset hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Sub-Header: Filters & Search */}
      <div className="px-6 py-3 border-b border-neutral-800/80 bg-neutral-900/20 flex items-center justify-between gap-4 shrink-0">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Alle Assets</span>
            <span className="text-[10px] font-mono opacity-80">({item.assets.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('video')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'video'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos</span>
            <span className="text-[10px] font-mono opacity-80">({countVideos})</span>
          </button>

          <button
            onClick={() => setActiveFilter('image')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'image'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fotos &amp; B-Roll</span>
            <span className="text-[10px] font-mono opacity-80">({countImages})</span>
          </button>

          <button
            onClick={() => setActiveFilter('voice')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'voice'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Notes</span>
            <span className="text-[10px] font-mono opacity-80">({countVoices})</span>
          </button>
        </div>

        {/* Search & Layout toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Assets durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-52"
            />
          </div>

          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Kachel-Ansicht"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Listen-Ansicht"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Asset Grid / List Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-neutral-900/20 border border-neutral-800/60 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center text-neutral-500 mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Keine Assets gefunden</h3>
            <p className="text-xs text-neutral-400 max-w-sm mb-4">
              {searchQuery
                ? 'Kein Asset entspricht deinem Suchbegriff.'
                : 'In diesem Content-Objekt sind noch keine Assets hinterlegt. Lade jetzt Medien hoch oder nimm Rohmaterial per Smartphone auf.'}
            </p>
            <button
              onClick={() => handleAddSampleAsset('video')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Erstes Asset hochladen</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setPreviewAsset(asset)}
                className="group bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-lg flex flex-col"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden flex items-center justify-center border-b border-neutral-800/80">
                  {asset.type === 'video' && (
                    <>
                      <img
                        src={asset.url || '/src/assets/images/social_reel_creator_1791010043370.jpg'}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                      {asset.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 font-mono text-[10px] text-white px-2 py-0.5 rounded">
                          {asset.duration}
                        </div>
                      )}
                    </>
                  )}

                  {asset.type === 'image' && (
                    <>
                      <img
                        src={asset.url || '/src/assets/images/content_studio_desk_1791010031496.jpg'}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 font-mono text-[9px] text-emerald-400 px-2 py-0.5 rounded">
                        STILL
                      </div>
                    </>
                  )}

                  {asset.type === 'voice' && (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-gradient-to-br from-sky-950/40 to-neutral-950">
                      <div className="flex items-center gap-1 mb-2">
                        {[20, 45, 60, 30, 80, 50, 70, 40, 65, 35, 75, 40].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              playingVoiceId === asset.id ? 'bg-sky-400 animate-pulse' : 'bg-neutral-600'
                            }`}
                            style={{ height: `${h * 0.4}px` }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlayVoice(asset.id);
                        }}
                        className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-neutral-950 flex items-center justify-center shadow-md transition-colors"
                      >
                        {playingVoiceId === asset.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        )}
                      </button>
                      {asset.duration && (
                        <span className="text-[10px] font-mono text-neutral-400 mt-2">{asset.duration}</span>
                      )}
                    </div>
                  )}

                  {/* Top Type Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="bg-neutral-950/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 text-white border border-white/10">
                      {asset.type === 'video' && <Video className="w-3 h-3 text-amber-500" />}
                      {asset.type === 'image' && <Camera className="w-3 h-3 text-emerald-400" />}
                      {asset.type === 'voice' && <Mic className="w-3 h-3 text-sky-400" />}
                      <span className="uppercase">{asset.type}</span>
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate font-mono">{asset.name}</h4>
                      <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {asset.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                      <span>{asset.size}</span>
                      <span>·</span>
                      <span className="truncate flex items-center gap-1">
                        {asset.deviceId.includes('iphone') ? (
                          <Smartphone className="w-3 h-3 text-neutral-400" />
                        ) : (
                          <Monitor className="w-3 h-3 text-neutral-400" />
                        )}
                        {asset.deviceId}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {asset.capturedOn.slice(11, 16)} Uhr
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Assign to Scene Dropdown */}
                      {item.scenes.length > 0 && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.value) handleAssignScene(asset, e.target.value);
                          }}
                          defaultValue=""
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] rounded px-1.5 py-0.5 border border-neutral-700 focus:outline-none"
                        >
                          <option value="" disabled>
                            + Szene
                          </option>
                          {item.scenes.map((s) => (
                            <option key={s.id} value={s.id}>
                              Szene {s.order} zuweisen
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id);
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800"
                        title="Asset löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/80">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setPreviewAsset(asset)}
                className="p-3.5 hover:bg-neutral-800/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                    {asset.type === 'video' && <Video className="w-5 h-5 text-amber-500" />}
                    {asset.type === 'image' && <Camera className="w-5 h-5 text-emerald-400" />}
                    {asset.type === 'voice' && <Mic className="w-5 h-5 text-sky-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{asset.name}</div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span className="uppercase font-semibold">{asset.type}</span>
                      <span>·</span>
                      <span>{asset.size}</span>
                      {asset.duration && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{asset.duration}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{asset.deviceId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-neutral-400">{asset.capturedOn}</span>
                  <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {asset.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSET DETAIL & PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-amber-500">{previewAsset.name}</span>
                <span className="text-xs text-neutral-400">· Asset Preview</span>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Media Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center relative shadow-lg">
                {previewAsset.type === 'voice' ? (
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Mic className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-semibold text-white">Audio Waveform (44.1kHz PCM)</div>
                    <div className="flex items-center gap-1.5 h-12">
                      {[15, 30, 45, 60, 20, 80, 50, 35, 70, 90, 40, 25, 65, 85, 30].map((h, i) => (
                        <div key={i} className="w-1.5 bg-sky-400 rounded-full" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewAsset.url || '/src/assets/images/social_reel_creator_1791010043370.jpg'}
                    alt={previewAsset.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Technical Metadata Grid */}
              <div className="grid grid-cols-3 gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block font-medium">Dateigröße</span>
                  <span className="font-bold text-white font-mono">{previewAsset.size}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block font-medium">Aufnahmegerät</span>
                  <span className="font-bold text-white">{previewAsset.deviceId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block font-medium">Zeitstempel</span>
                  <span className="font-mono text-neutral-300">{previewAsset.capturedOn}</span>
                </div>
              </div>

              {/* Assign to Storyboard Scenes */}
              {item.scenes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-neutral-300">Diesem Storyboard-Shot zuweisen:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {item.scenes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          handleAssignScene(previewAsset, s.id);
                          setPreviewAsset(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center justify-between ${
                          s.assetId === previewAsset.id
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                            : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span className="font-semibold truncate">
                          Szene {s.order}: {s.title}
                        </span>
                        {s.assetId === previewAsset.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD ASSET MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white">Neues Asset hinzufügen</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-neutral-300 block">Medientyp wählen</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUploadAssetType('video')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                    uploadAssetType === 'video'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => setUploadAssetType('image')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                    uploadAssetType === 'image'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Foto</span>
                </button>
                <button
                  onClick={() => setUploadAssetType('voice')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                    uploadAssetType === 'voice'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Voice Note</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => handleAddSampleAsset(uploadAssetType)}
                className="mt-4 border-2 border-dashed border-neutral-700 hover:border-amber-500/80 rounded-2xl p-6 text-center cursor-pointer bg-neutral-950/60 transition-colors"
              >
                <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-white mb-1">
                  Datei ablegen oder zum Auswählen klicken
                </div>
                <div className="text-[10px] text-neutral-400">
                  Unterstützt MP4, MOV, JPG, PNG, M4A, WAV (Bis 500MB)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleAddSampleAsset(uploadAssetType)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
              >
                Asset hochladen &amp; synchronisieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
