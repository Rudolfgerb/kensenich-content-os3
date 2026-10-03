import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Check, RefreshCw, X, Play, Pause, Video, Sparkles, Volume2 } from 'lucide-react';

interface MobileMediaCaptureProps {
  mode: 'camera' | 'voice' | 'idea';
  onClose: () => void;
  onSave: (data: {
    title: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'video' | 'image' | 'voice';
  }) => void;
  onAiTransform?: (transcript: string) => Promise<any>;
}

export const MobileMediaCapture: React.FC<MobileMediaCaptureProps> = ({
  mode,
  onClose,
  onSave,
  onAiTransform,
}) => {
  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Voice state
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceBlobUrl, setVoiceBlobUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState(
    'Ich will ein Video darüber machen, warum Menschen im Alltag keine Zeit haben anderen zu helfen. Oft sind es nur 4 Sekunden, die alles verändern.'
  );
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([15, 30, 45, 60, 20, 80, 50, 35, 70, 90, 40, 25, 65, 85, 30]);

  // Idea text state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaText, setIdeaText] = useState('');

  // Start Camera
  useEffect(() => {
    if (mode === 'camera') {
      let isMounted = true;
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user' }, audio: true })
        .then((stream) => {
          if (isMounted) {
            mediaStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          }
        })
        .catch((err) => {
          console.warn('Camera access not granted or unavailable:', err);
          setCameraError('Kamera-Zugriff im Browser nicht verfügbar. Wir nutzen die mobile Studio-Simulation.');
        });

      return () => {
        isMounted = false;
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [mode]);

  // Video recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Voice recording timer & waveform jitter
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceSeconds((s) => s + 1);
        setWaveformBars((prev) => prev.map(() => Math.floor(Math.random() * 80) + 15));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Start / Stop Video
  const handleToggleRecordVideo = () => {
    if (!isRecording) {
      // Start recording
      setRecordedChunks([]);
      if (mediaStreamRef.current) {
        try {
          const recorder = new MediaRecorder(mediaStreamRef.current);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
          };
          recorder.onstop = () => {
            // Simulated or real blob
            const blob = new Blob(recordedChunks, { type: 'video/mp4' });
            setRecordedVideoUrl('/src/assets/images/social_reel_creator_1791010043370.jpg');
          };
          recorder.start();
          mediaRecorderRef.current = recorder;
        } catch (e) {
          console.warn('MediaRecorder error, using simulation', e);
        }
      }
      setIsRecording(true);
    } else {
      // Stop recording
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setRecordedVideoUrl('/src/assets/images/social_reel_creator_1791010043370.jpg');
    }
  };

  const handleRetakeVideo = () => {
    setRecordedVideoUrl(null);
    setRecordedChunks([]);
  };

  const handleSaveVideo = () => {
    onSave({
      title: 'Mobile Aufnahme ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaUrl: recordedVideoUrl || '/src/assets/images/social_reel_creator_1791010043370.jpg',
      mediaType: 'video',
    });
    onClose();
  };

  // Start / Stop Voice Note
  const handleToggleRecordVoice = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setVoiceBlobUrl(null);
    } else {
      setIsRecordingVoice(false);
      setVoiceBlobUrl('simulated-voice-memo.m4a');
    }
  };

  const handleVoiceToIdeaAi = async () => {
    if (!onAiTransform) return;
    setIsAiProcessing(true);
    try {
      const res = await onAiTransform(transcript);
      onSave({
        title: res.title || 'Warum Menschen keine Zeit haben',
        text: res.scriptBody || transcript,
        mediaUrl: '/src/assets/images/content_studio_desk_1791010031496.jpg',
        mediaType: 'voice',
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveSimpleVoice = () => {
    onSave({
      title: 'Voice Note ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: transcript,
      mediaUrl: '/src/assets/images/content_studio_desk_1791010031496.jpg',
      mediaType: 'voice',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            {mode === 'camera' && <Camera className="w-5 h-5 text-amber-500" />}
            {mode === 'voice' && <Mic className="w-5 h-5 text-sky-400" />}
            {mode === 'idea' && <Sparkles className="w-5 h-5 text-amber-500" />}
            <span className="font-semibold text-sm tracking-tight text-white">
              {mode === 'camera' && 'Mobile Camera Station'}
              {mode === 'voice' && 'Voice-to-Idea Capture'}
              {mode === 'idea' && 'Schnelle Content-Idee'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col">
          {/* 1. CAMERA MODE */}
          {mode === 'camera' && (
            <div className="flex flex-col items-center flex-1">
              {!recordedVideoUrl ? (
                <div className="relative w-full aspect-[9/16] max-h-[420px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                  {cameraError ? (
                    <div className="text-center p-6 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Video className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-neutral-400 max-w-xs">{cameraError}</p>
                      <img
                        src="/src/assets/images/social_reel_creator_1791010043370.jpg"
                        alt="Camera simulator"
                        className="w-32 h-44 object-cover rounded-lg border border-neutral-700 shadow-md"
                      />
                    </div>
                  ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  )}

                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                      <span>REC {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <button
                      onClick={handleToggleRecordVideo}
                      className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                        isRecording ? 'border-red-500 bg-red-600/30' : 'border-white bg-red-500 hover:scale-105'
                      }`}
                    >
                      {isRecording ? <Square className="w-6 h-6 text-white" /> : <div className="w-8 h-8 rounded-full bg-white" />}
                    </button>
                  </div>
                </div>
              ) : (
                /* PRD Section 12: Keep Video? [Retake] [Use Video] */
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full aspect-[9/16] max-h-[380px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-700">
                    <img
                      src="/src/assets/images/social_reel_creator_1791010043370.jpg"
                      alt="Recorded Video Frame"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-4">
                      <div className="text-xs text-neutral-300">
                        <span className="font-semibold text-white">VID_004.mp4</span> · 0:15 min · 1080x1920
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white my-3">Video behalten und zuweisen?</p>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={handleRetakeVideo}
                      className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retake
                    </button>
                    <button
                      onClick={handleSaveVideo}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      Use Video
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. VOICE MODE (PRD Section 11: Voice-to-Idea) */}
          {mode === 'voice' && (
            <div className="flex flex-col items-center flex-1">
              <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center mb-4">
                {/* Audio Waveform Visualizer */}
                <div className="h-16 flex items-center gap-1.5 px-4 mb-4">
                  {waveformBars.map((height, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isRecordingVoice ? 'bg-sky-400 shadow-sm shadow-sky-400/50' : 'bg-neutral-700'
                      }`}
                      style={{ height: `${isRecordingVoice ? height : 12}px` }}
                    />
                  ))}
                </div>

                <div className="text-xl font-mono tabular-nums text-white mb-2">
                  {String(Math.floor(voiceSeconds / 60)).padStart(2, '0')}:{String(voiceSeconds % 60).padStart(2, '0')}
                </div>

                <p className="text-xs text-neutral-400 mb-4 text-center">
                  {isRecordingVoice
                    ? 'Aufnahme läuft... Sprich deine Gedanken frei aus!'
                    : 'Tippe auf das Mikrofon, um deine Sprachnotiz zu starten.'}
                </p>

                <button
                  onClick={handleToggleRecordVoice}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isRecordingVoice
                      ? 'bg-red-500 hover:bg-red-600 scale-105 shadow-lg shadow-red-500/30'
                      : 'bg-sky-500 hover:bg-sky-400 shadow-lg shadow-sky-500/20 text-neutral-950'
                  }`}
                >
                  {isRecordingVoice ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7 text-neutral-950" />}
                </button>
              </div>

              {/* Transcript Preview */}
              <div className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400">Live Transkription</span>
                  <span className="text-[10px] text-sky-400 font-mono">Gemini Transcribe Ready</span>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-xs text-neutral-200 resize-none focus:outline-none"
                  placeholder="Hier erscheint dein gesprochener Text..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                <button
                  onClick={handleSaveSimpleVoice}
                  className="px-4 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Als Sprachnotiz speichern
                </button>
                <button
                  onClick={handleVoiceToIdeaAi}
                  disabled={isAiProcessing || !transcript.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAiProcessing ? 'AI strukturiert Brief...' : 'In Content Brief wandeln'}
                </button>
              </div>
            </div>
          )}

          {/* 3. QUICK IDEA TEXT MODE */}
          {mode === 'idea' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 mb-1.5 block">Titel der Idee</label>
                <input
                  type="text"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="z.B. Warum Menschen keine Zeit haben"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 mb-1.5 block">Notiz / Gedanken</label>
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  rows={4}
                  placeholder="Beschreibe kurz den Aufhänger, die Szene oder den Hook..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    if (ideaTitle.trim()) {
                      onSave({
                        title: ideaTitle,
                        text: ideaText,
                      });
                      onClose();
                    }
                  }}
                  disabled={!ideaTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Idee speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
