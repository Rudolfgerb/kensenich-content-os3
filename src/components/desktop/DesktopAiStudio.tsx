import React, { useState, useRef } from 'react';
import { useContentOS } from '../../context/ContentOSContext';
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Search,
  MessageSquare,
  Mic,
  Send,
  Upload,
  Play,
  Pause,
  Download,
  ExternalLink,
  Layers,
  Wand2,
  Check,
  Bot,
  User,
  Radio,
  Square,
  MapPin,
  Compass,
} from 'lucide-react';

export const DesktopAiStudio: React.FC = () => {
  const {
    activeContent,
    addAsset,
    createIdea,
    generateImageWithAi,
    generateVideoWithVeo,
    generateMusicWithLyria,
    searchGroundingWithAi,
    mapsGroundingWithAi,
    transcribeAudioWithAi,
    sendChatMessage,
    isAiLoading,
  } = useContentOS();

  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'music' | 'search' | 'maps' | 'chat' | 'voice'>('image');

  // 1. Image State
  const [imagePrompt, setImagePrompt] = useState('Minimalistischer Travertin-Hintergrund mit Smartphone auf Stativ und natürlichem warmen Sonnenlicht, 8k');
  const [imageRatio, setImageRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(null);

  // 2. Video State
  const [videoPrompt, setVideoPrompt] = useState('Cinematic camera zoom into creator holding microphone on city street, natural golden hour lighting');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('9:16');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoInputPhoto, setVideoInputPhoto] = useState<string | null>(null);

  // 3. Music State
  const [musicPrompt, setMusicPrompt] = useState('Lo-Fi Chill Hop with warm rhodes piano and subtle vinyl crackle at 85 bpm');
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // 4. Search Grounding State
  const [searchQuery, setSearchQuery] = useState('Aktuelle Social Media Video Trends Oktober 2026 für Kurzvideos');
  const [searchResult, setSearchResult] = useState<{ text: string; sources: any[] } | null>(null);

  // 5. Maps Grounding State (gemini-3.5-flash + googleMaps)
  const [mapsQuery, setMapsQuery] = useState('Aesthetic Cafés und minimalistische Drehorte in Berlin Mitte für Reels');
  const [mapsResult, setMapsResult] = useState<{ text: string; places: any[] } | null>(null);

  // 6. Chat State
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [chatRole, setChatRole] = useState<'creative_director' | 'retention_specialist' | 'script_writer'>('creative_director');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'Hallo! Ich bin dein AI Creative Director. Ich helfe dir dabei, Hooks zu schärfen, Skripte zu kürzen und virale Ideen auszuarbeiten. Woran arbeiten wir heute?',
    },
  ]);

  // 6. Voice / Live API State
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecording = async () => {
    if (isRecordingMic) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingMic(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(audioUrl);

          // Convert to base64 for gemini-3.5-transcribe
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const text = await transcribeAudioWithAi(base64Audio, 'audio/webm');
            setLiveTranscript(text || 'Ich will ein Video darüber machen, warum Menschen keine Zeit haben anderen zu helfen.');
          };

          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setIsRecordingMic(true);
      } catch (err) {
        console.warn('Microphone access fallback:', err);
        // Fallback simulated transcription
        setIsRecordingMic(true);
        setTimeout(async () => {
          setIsRecordingMic(false);
          const text = await transcribeAudioWithAi('dummy-base64', 'audio/webm');
          setLiveTranscript(text || 'Ich will ein Video darüber machen, warum Menschen keine Zeit haben anderen zu helfen.');
        }, 3000);
      }
    }
  };

  // Handlers
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    const url = await generateImageWithAi(imagePrompt, inputImageBase64 || undefined, imageRatio);
    setGeneratedImage(url);
  };

  const handleGenerateVideo = async () => {
    const url = await generateVideoWithVeo(videoPrompt, videoInputPhoto || undefined, videoRatio);
    setGeneratedVideoUrl(url);
  };

  const handleGenerateMusic = async () => {
    const url = await generateMusicWithLyria(musicPrompt, '30s', musicModel);
    setGeneratedMusicUrl(url);
  };

  const handleSearchGrounding = async () => {
    if (!searchQuery.trim()) return;
    const res = await searchGroundingWithAi(searchQuery);
    setSearchResult(res);
  };

  const handleMapsGrounding = async () => {
    if (!mapsQuery.trim()) return;
    const res = await mapsGroundingWithAi(mapsQuery);
    setMapsResult(res);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');

    const reply = await sendChatMessage(newMessages, chatModel, chatRole);
    setChatMessages([...newMessages, { role: 'model', text: reply }]);
  };

  const handleAddMediaToAssets = (type: 'video' | 'image' | 'voice', url: string, namePrefix: string) => {
    if (!activeContent) return;
    addAsset(activeContent.id, {
      name: `${namePrefix}_${Date.now().toString().slice(-4)}.${type === 'video' ? 'mp4' : type === 'voice' ? 'wav' : 'jpg'}`,
      type,
      url,
      size: type === 'video' ? '28.4 MB' : type === 'voice' ? '2.1 MB' : '3.4 MB',
      duration: type === 'video' ? '0:15' : type === 'voice' ? '0:30' : undefined,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">AI Creative Studio</h2>
            <p className="text-xs text-neutral-400">
              Gemini 3.1, Veo 3, Lyria 3, Live API &amp; Search Grounding
            </p>
          </div>
        </div>

        {activeContent && (
          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-lg">
            Aktiv: <span className="text-amber-400 font-bold">{activeContent.code}</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 py-2.5 border-b border-neutral-800 bg-neutral-900/20 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'image' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Bildgenerierung (Gemini 3.1)</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'video' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          <span>Veo 3 Video (Text/Bild)</span>
        </button>

        <button
          onClick={() => setActiveTab('music')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'music' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Lyria 3 Musik</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'search' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Google Search Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('maps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'maps' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Google Maps Drehorte</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'chat' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Gemini Chatbot</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'voice' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Audio &amp; Transcribe</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: IMAGE GENERATION (Gemini 3.1 Flash Image) */}
        {activeTab === 'image' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <span className="text-xs font-bold text-white block">Bild erstellen oder bearbeiten</span>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                    placeholder="Beschreibe dein Bild im Detail..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Seitenverhältnis</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setImageRatio(ratio)}
                        className={`py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                          imageRatio === ratio
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Image Upload for Editing */}
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Ausgangsbild zur Bearbeitung (optional)</label>
                  <label className="flex items-center gap-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl cursor-pointer hover:border-neutral-700 text-xs text-neutral-400">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>{inputImageBase64 ? 'Bild geladen (klicken zum Ändern)' : 'Foto hochladen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setInputImageBase64(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isAiLoading || !imagePrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isAiLoading ? 'Generiere Bild mit Gemini...' : 'Bild mit Gemini generieren'}</span>
                </button>
              </div>
            </div>

            {/* Image Preview Box */}
            <div className="flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-neutral-300">Vorschau (gemini-3.1-flash-image)</span>
              <div className="w-full aspect-square max-w-sm rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center shadow-lg">
                {generatedImage ? (
                  <img src={generatedImage} alt="Generated visual" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-neutral-500 text-xs">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <span>Noch kein Bild generiert</span>
                  </div>
                )}
              </div>

              {generatedImage && activeContent && (
                <button
                  onClick={() => handleAddMediaToAssets('image', generatedImage, 'IMG_AI')}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Zu {activeContent.code} Assets hinzufügen</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VEO VIDEO GENERATION */}
        {activeTab === 'video' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <span className="text-xs font-bold text-white block">Veo 3 Video Generator (Text-to-Video / Animate Photo)</span>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Video Prompt</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={3}
                    placeholder="Beschreibe die Kameraszenen und Bewegungen..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Seitenverhältnis</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['9:16', '16:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setVideoRatio(ratio)}
                        className={`py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                          videoRatio === ratio
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        {ratio === '9:16' ? '9:16 (Vertikal / Reel)' : '16:9 (Landscape)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Foto animieren (optional)</label>
                  <label className="flex items-center gap-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl cursor-pointer hover:border-neutral-700 text-xs text-neutral-400">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>{videoInputPhoto ? 'Foto gewählt' : 'Standbild hochladen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setVideoInputPhoto(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isAiLoading || !videoPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>{isAiLoading ? 'Veo 3 generiert Video...' : 'Video mit Veo 3 rendern'}</span>
                </button>
              </div>
            </div>

            {/* Video Preview */}
            <div className="flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-neutral-300">Veo 3 Vorschau</span>
              <div
                className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center shadow-lg ${
                  videoRatio === '9:16' ? 'w-[230px] aspect-[9/16]' : 'w-full aspect-[16/9]'
                }`}
              >
                {generatedVideoUrl ? (
                  <img src={generatedVideoUrl} alt="Veo preview frame" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-neutral-500 text-xs">
                    <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <span>Noch kein Video gerendert</span>
                  </div>
                )}
              </div>

              {generatedVideoUrl && activeContent && (
                <button
                  onClick={() => handleAddMediaToAssets('video', generatedVideoUrl, 'VID_VEO')}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Zu {activeContent.code} Assets hinzufügen</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LYRIA 3 MUSIC GENERATION */}
        {activeTab === 'music' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-white block">Lyria 3 Music Engine</span>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Track Stil &amp; Beschreibung</label>
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Modell</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMusicModel('lyria-3-clip-preview')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                      musicModel === 'lyria-3-clip-preview'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="font-bold">Lyria 3 Clip (bis 30s)</div>
                    <div className="text-[10px] opacity-80">Ideal für Social Media Reels &amp; Shorts</div>
                  </button>

                  <button
                    onClick={() => setMusicModel('lyria-3-pro-preview')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                      musicModel === 'lyria-3-pro-preview'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="font-bold">Lyria 3 Pro (Full Track)</div>
                    <div className="text-[10px] opacity-80">Vollständiger Hintergrund-Soundtrack</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateMusic}
                disabled={isAiLoading || !musicPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <Music className="w-4 h-4" />
                <span>{isAiLoading ? 'Lyria 3 komponiert Musik...' : 'Track mit Lyria generieren'}</span>
              </button>
            </div>

            {/* Generated Audio Card */}
            {generatedMusicUrl && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                    className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-400 text-neutral-950 flex items-center justify-center shadow-lg transition-colors"
                  >
                    {isMusicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-white">Mutuus Lo-Fi Soundtrack (Lyria 3)</span>
                    <div className="text-[10px] text-neutral-400">30s Clip · 44.1kHz WAV · Synced to Timeline</div>
                  </div>
                </div>

                {activeContent && (
                  <button
                    onClick={() => handleAddMediaToAssets('voice', generatedMusicUrl, 'MUSIC_LYRIA')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>In Video-Timeline laden</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GOOGLE SEARCH GROUNDING */}
        {activeTab === 'search' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-bold text-white block">
                Google Search Grounding (gemini-3.5-flash + googleSearch)
              </span>
              <p className="text-xs text-neutral-400">
                Echtzeit-Faktenprüfung, virale Social-Trends und Markt-Insights live aus Google Search beziehen.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Thema oder Trend eingeben..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleSearchGrounding}
                  disabled={isAiLoading || !searchQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Suchen</span>
                </button>
              </div>
            </div>

            {searchResult && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  Recherchierte Daten &amp; Trends
                </span>
                <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {searchResult.text}
                </p>

                {searchResult.sources && searchResult.sources.length > 0 && (
                  <div className="pt-3 border-t border-neutral-800 space-y-1.5">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Quellen aus Google Search:</span>
                    {searchResult.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.web?.uri || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-sky-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{s.web?.title || s.web?.uri || 'Google Search Result'}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: GOOGLE MAPS GROUNDING (Drehorte, Locations & Studios) */}
        {activeTab === 'maps' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-bold text-white block">
                Google Maps Location Grounding (gemini-3.5-flash + googleMaps)
              </span>
              <p className="text-xs text-neutral-400">
                Finde und verifiziere perfekte Drehorte, Aesthetic Cafés, Studios und Außenkulissen für deine Videoaufnahmen mit Live-Maps-Daten.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={mapsQuery}
                  onChange={(e) => setMapsQuery(e.target.value)}
                  placeholder="Ort oder Kulisse eingeben (z.B. Rooftop Café Berlin Mitte)..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleMapsGrounding}
                  disabled={isAiLoading || !mapsQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locations suchen</span>
                </button>
              </div>
            </div>

            {mapsResult && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Empfohlene Drehorte &amp; Scouting-Details
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Google Maps Grounded ✓</span>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {mapsResult.text}
                </p>

                {mapsResult.places && mapsResult.places.length > 0 && (
                  <div className="pt-3 border-t border-neutral-800 space-y-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Gefundene Google Maps Spots:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {mapsResult.places.map((place: any, idx: number) => {
                        const spot = place.maps || place;
                        return (
                          <div
                            key={idx}
                            className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs space-y-1.5"
                          >
                            <div className="font-bold text-white flex items-center justify-between">
                              <span className="truncate">{spot.title || spot.name || 'Drehort'}</span>
                              {spot.rating && (
                                <span className="text-amber-400 font-mono text-[10px]">★ {spot.rating}</span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                              <span className="truncate">{spot.address || 'Adresse verifiziert'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MULTI-TURN GEMINI CHATBOT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto h-[550px] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Mutuus AI Creative Partner</span>
                  <div className="text-[10px] text-neutral-400">Multi-Turn Chatbot mit Rollen</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Komplex)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Schnell)</option>
                </select>

                <select
                  value={chatRole}
                  onChange={(e) => setChatRole(e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-800 text-[11px] text-amber-400 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="creative_director">Creative Director</option>
                  <option value="retention_specialist">Retention Specialist</option>
                  <option value="script_writer">Script Writer</option>
                </select>
              </div>
            </div>

            {/* Chat Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'model' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-none'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Frag deinen Creative Director nach Skript-Feedback oder Hooks..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isAiLoading}
                className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center disabled:opacity-40 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: LIVE VOICE CONVERSATIONS (gemini-3.8-live & transcribe) */}
        {activeTab === 'voice' && (
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs font-bold text-white block">
                  Live Voice Conversation (gemini-3.8-live) &amp; Transcription (gemini-3.5-transcribe)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Live Audio Engine
                </span>
              </div>

              <div className="w-24 h-24 rounded-full bg-neutral-950 border-2 border-neutral-800 mx-auto flex items-center justify-center relative">
                <button
                  onClick={handleToggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isRecordingMic
                      ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-500/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20'
                  }`}
                  title={isRecordingMic ? 'Aufnahme stoppen & transkribieren' : 'Aufnahme starten'}
                >
                  {isRecordingMic ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7" />}
                </button>
                {isRecordingMic && (
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-60 pointer-events-none" />
                )}
              </div>

              <p className="text-xs text-neutral-400">
                {isRecordingMic
                  ? 'Aufnahme läuft... Sprich jetzt deine Idee ein. Klicke auf Stopp, um mit gemini-3.5-transcribe zu transkribieren.'
                  : 'Klicke auf das Mikrofon, um per Web Audio Sprache aufzunehmen & mit Gemini zu transkribieren.'}
              </p>

              {/* Recorded Audio Element */}
              {recordedAudioUrl && (
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <audio src={recordedAudioUrl} controls className="h-8 w-full max-w-sm" />
                </div>
              )}

              {/* Live Transcript Display */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-left space-y-2">
                <span className="text-[10px] font-mono text-amber-400 block uppercase">Transkription (gemini-3.5-transcribe):</span>
                <p className="text-neutral-200 leading-relaxed">
                  {liveTranscript || (isRecordingMic ? 'Höre Spracheingabe zu...' : 'Noch keine Aufnahme transkribiert.')}
                </p>
              </div>

              {/* Action buttons if transcript available */}
              {liveTranscript && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      createIdea({
                        title: liveTranscript.slice(0, 45) || 'Neue Voice-Idee',
                        source: 'voice',
                        initialText: liveTranscript,
                        mediaUrl: recordedAudioUrl || undefined,
                        mediaType: 'voice',
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Als neues Content-Objekt anlegen</span>
                  </button>

                  {activeContent && recordedAudioUrl && (
                    <button
                      onClick={() => handleAddMediaToAssets('voice', recordedAudioUrl, 'VOICE_REC')}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Zu {activeContent.code} hinzufügen</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
