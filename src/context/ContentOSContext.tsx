import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ContentObject,
  Project,
  BrandKit,
  SceneItem,
  AssetRecord,
  TimelineTrackClip,
  ConflictRecord,
  ContentStatus,
} from '../types/content';
import { initialProjects, initialBrandKit, initialContentObjects } from '../data/initialData';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

interface ContentOSContextType {
  // State
  contentList: ContentObject[];
  activeContent: ContentObject | null;
  activeContentId: string;
  projects: Project[];
  activeProjectId: string;
  brandKit: BrandKit;
  viewMode: 'desktop' | 'mobile' | 'dual';
  isOnline: boolean;
  syncQueue: number;
  lastSyncedAt: string;
  conflictData: ConflictRecord | null;
  isAiLoading: boolean;

  // Firebase Auth State & Actions
  user: User | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Actions
  setViewMode: (mode: 'desktop' | 'mobile' | 'dual') => void;
  setActiveContentId: (id: string) => void;
  setActiveProjectId: (id: string) => void;
  toggleOnline: () => void;
  createIdea: (data: {
    title: string;
    source: 'voice' | 'camera' | 'text' | 'scratch';
    initialText?: string;
    mediaUrl?: string;
    mediaType?: 'video' | 'image' | 'voice';
  }) => ContentObject;
  updateContentObject: (id: string, updates: Partial<ContentObject>, sourceDevice?: string) => void;
  updateScript: (id: string, hook: string, body: string, cta: string) => void;
  addScene: (contentId: string, scene: Omit<SceneItem, 'id' | 'order'>) => void;
  updateScene: (contentId: string, sceneId: string, updates: Partial<SceneItem>) => void;
  deleteScene: (contentId: string, sceneId: string) => void;
  reorderScenes: (contentId: string, scenes: SceneItem[]) => void;
  addAsset: (contentId: string, asset: Omit<AssetRecord, 'id' | 'capturedOn' | 'deviceId' | 'status'>) => void;
  updateCanva: (contentId: string, updates: Partial<ContentObject['canvaDesign']>) => void;
  updateTimelineClips: (contentId: string, trackType: keyof ContentObject['videoProject']['timeline'], clips: TimelineTrackClip[]) => void;
  triggerSimulatedConflict: () => void;
  resolveConflict: (choice: 'phone' | 'desktop') => void;
  exportPackage: (contentId: string) => void;
  updateBrandKit: (updates: Partial<BrandKit>) => void;

  // AI Actions (Gemini, Veo, Lyria, Search Grounding, Transcribe, Chat)
  generateReelWithAi: (contentId: string) => Promise<void>;
  generateBriefFromVoiceAi: (transcript: string) => Promise<any>;
  quickAssistAi: (contentId: string, action: 'hook' | 'improve' | 'caption') => Promise<string | string[]>;
  generateImageWithAi: (prompt: string, inputImageBase64?: string, aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3') => Promise<string>;
  generateVideoWithVeo: (prompt: string, imageBytes?: string, aspectRatio?: '16:9' | '9:16') => Promise<string>;
  generateMusicWithLyria: (prompt: string, duration?: string, model?: 'lyria-3-clip-preview' | 'lyria-3-pro-preview') => Promise<string>;
  searchGroundingWithAi: (query: string) => Promise<{ text: string; sources: any[] }>;
  mapsGroundingWithAi: (query: string) => Promise<{ text: string; places: any[] }>;
  transcribeAudioWithAi: (audioBase64: string, mimeType?: string) => Promise<string>;
  sendChatMessage: (messages: { role: string; text: string }[], model?: string, role?: string) => Promise<string>;
}

const ContentOSContext = createContext<ContentOSContextType | null>(null);

const STORAGE_KEY = 'mutuus_content_os_state_v2';
const BROADCAST_CHANNEL_NAME = 'mutuus_sync_bus_channel';

export const ContentOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentList, setContentList] = useState<ContentObject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contentList && Array.isArray(parsed.contentList)) {
          return parsed.contentList;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return initialContentObjects;
  });

  const [activeContentId, setActiveContentId] = useState<string>('content-00142');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-mutuus');
  const [brandKit, setBrandKit] = useState<BrandKit>(initialBrandKit);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'dual'>('dual');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueue, setSyncQueue] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Gerade eben');
  const [conflictData, setConflictData] = useState<ConflictRecord | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        // Save/Sync User profile to Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userRef,
            {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Creator',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore content when user is logged in
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/content`;
    const colRef = collection(db, 'users', user.uid, 'content');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ContentObject[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as ContentObject);
          });
          setContentList(items);
          setLastSyncedAt('Firestore Cloud synchronisiert ✓');
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Google Login & Logout
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.warn('Google sign-in canceled or failed:', e);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  };

  // Cross-tab broadcast channel for real-time multi-window sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE' && event.data.payload) {
          setContentList(event.data.payload);
        }
      };
    }
    return () => {
      bc?.close();
    };
  }, []);

  // Save to localStorage and Firestore
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          contentList,
          brandKit,
          activeProjectId,
        })
      );
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'SYNC_STATE', payload: contentList });
        bc.close();
      }
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [contentList, brandKit, activeProjectId]);

  // Online / Offline reconnection simulation
  const toggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next) {
        setSyncQueue(0);
        setLastSyncedAt('Synchronisiert ✓');
        setContentList((list) =>
          list.map((c) => (c.syncStatus === 'pending' ? { ...c, syncStatus: 'synced', version: c.version + 1 } : c))
        );
      } else {
        setLastSyncedAt('Offline Modus — Wartet auf Verbindung...');
      }
      return next;
    });
  };

  const activeContent = contentList.find((c) => c.id === activeContentId) || contentList[0] || null;

  // Generic content updater
  const updateContentObject = useCallback(
    (id: string, updates: Partial<ContentObject>, sourceDevice: string = 'active-device') => {
      setContentList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextVersion = item.version + 1;
            const status: ContentObject['syncStatus'] = isOnline ? 'synced' : 'pending';
            if (!isOnline) {
              setSyncQueue((q) => q + 1);
            }
            const updated = {
              ...item,
              ...updates,
              version: nextVersion,
              updatedAt: new Date().toISOString(),
              deviceId: sourceDevice,
              syncStatus: status,
            };

            // Write to Firestore if logged in
            if (user && isOnline) {
              setDoc(doc(db, 'users', user.uid, 'content', id), updated).catch((err) => {
                handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/content/${id}`);
              });
            }

            return updated;
          }
          return item;
        })
      );
      setLastSyncedAt(isOnline ? 'Gerade eben synchronisiert ✓' : 'Lokal gespeichert (Offline)');
    },
    [isOnline, user]
  );

  // Create new idea (Mobile or Desktop)
  const createIdea = useCallback(
    (data: {
      title: string;
      source: 'voice' | 'camera' | 'text' | 'scratch';
      initialText?: string;
      mediaUrl?: string;
      mediaType?: 'video' | 'image' | 'voice';
    }) => {
      const codeNum = 140 + contentList.length + 1;
      const id = `content-${codeNum.toString().padStart(5, '0')}`;
      const code = `Content #${codeNum.toString().padStart(5, '0')}`;

      const newAssets: AssetRecord[] = [];
      if (data.mediaUrl) {
        const type = data.mediaType || (data.source === 'camera' ? 'video' : data.source === 'voice' ? 'voice' : 'image');
        const prefix = type === 'video' ? 'VID' : type === 'voice' ? 'VOICE' : 'IMG';
        newAssets.push({
          id: `asset-${Date.now()}`,
          name: `${prefix}_001.${type === 'video' ? 'mp4' : type === 'voice' ? 'm4a' : 'jpg'}`,
          type,
          url: data.mediaUrl,
          size: '4.2 MB',
          duration: type === 'video' ? '0:15' : type === 'voice' ? '0:32' : undefined,
          capturedOn: new Date().toISOString().replace('T', ' ').slice(0, 19),
          deviceId: 'iphone-16-pro',
          status: isOnline ? 'cloud' : 'local',
        });
      }

      const newObject: ContentObject = {
        id,
        code,
        projectId: activeProjectId,
        title: data.title || 'Neue Content-Idee',
        status: 'idea',
        source: data.source,
        version: 1,
        updatedAt: new Date().toISOString(),
        deviceId: 'iphone-16-pro',
        syncStatus: isOnline ? 'synced' : 'pending',
        brief: {
          coreMessage: data.initialText || 'Kernbotschaft noch definieren...',
          targetAudience: 'Creator & Social Media Community',
          goal: 'Aufmerksamkeit fesseln',
          duration: '30s',
          tone: 'Authentisch & direkt',
        },
        script: {
          hook: data.initialText ? data.initialText.slice(0, 60) : 'Starker Hook für die ersten 3 Sekunden...',
          body: data.initialText || 'Hauptteil des Scripts...',
          cta: brandKit.defaultCTA,
          wordCount: (data.initialText || '').split(/\s+/).filter(Boolean).length,
          estimatedDuration: '25s',
        },
        scenes: [],
        assets: newAssets,
        videoProject: {
          duration: 30,
          aspectRatio: '9:16',
          currentTime: 0,
          isPlaying: false,
          timeline: {
            videoTracks: [],
            voiceTracks: [],
            textTracks: [],
            musicTracks: [],
            sfxTracks: [],
          },
          renderStatus: 'idle',
        },
        canvaDesign: {
          id: `canva-${id}`,
          title: `${data.title} — Social Slide`,
          templateType: 'Instagram Reel Overlay',
          previewUrl: '/src/assets/images/canva_graphic_template_1791010053197.jpg',
          status: 'linked',
          lastSynced: new Date().toISOString(),
          externalUrl: 'https://canva.com',
        },
        captions: {
          instagram: `${data.title} ✨\n\n${data.initialText || ''}\n\n👇 Was sagst du dazu?`,
          tiktok: `${data.title} #mindset #creator #viral`,
          youtube: `${data.title} | Mutuus Content OS`,
          linkedin: `Eine neue Perspektive auf ${data.title}.`,
          hashtags: ['#MutuusOS', '#ContentCreation', '#CreatorEconomy'],
        },
        platformVariants: [
          {
            id: `var-ig-${id}`,
            platform: 'instagram_reel',
            name: 'Instagram Reel (9:16)',
            aspectRatio: '9:16',
            status: 'draft',
            characterLimit: 2200,
          },
          {
            id: `var-tt-${id}`,
            platform: 'tiktok',
            name: 'TikTok Video (9:16)',
            aspectRatio: '9:16',
            status: 'draft',
            characterLimit: 4000,
          },
          {
            id: `var-yt-${id}`,
            platform: 'youtube_short',
            name: 'YouTube Shorts (9:16)',
            aspectRatio: '9:16',
            status: 'draft',
            characterLimit: 1000,
          },
        ],
        comments: [
          {
            id: `comm-${Date.now()}`,
            author: 'Mobile Creator',
            avatar: '/src/assets/images/creator_profile_avatar_1791010063573.jpg',
            text: `Idee erfasst via ${data.source.toUpperCase()}-Capture. Bereit für Desktop-Ausarbeitung!`,
            timestamp: 'Gerade eben',
            device: 'iPhone 16 Pro',
          },
        ],
      };

      setContentList((prev) => [newObject, ...prev]);
      setActiveContentId(id);

      // Save to Firestore if user logged in
      if (user && isOnline) {
        setDoc(doc(db, 'users', user.uid, 'content', id), newObject).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/content/${id}`);
        });
      }

      return newObject;
    },
    [activeProjectId, brandKit, contentList.length, isOnline, user]
  );

  const updateScript = useCallback((id: string, hook: string, body: string, cta: string) => {
    const fullText = `${hook} ${body} ${cta}`.trim();
    const words = fullText.split(/\s+/).filter(Boolean).length;
    const estSec = Math.max(5, Math.round(words / 2.2));

    updateContentObject(id, {
      script: {
        hook,
        body,
        cta,
        wordCount: words,
        estimatedDuration: `${estSec}s`,
      },
    });
  }, [updateContentObject]);

  const addScene = useCallback((contentId: string, scene: Omit<SceneItem, 'id' | 'order'>) => {
    setContentList((prev) =>
      prev.map((c) => {
        if (c.id === contentId) {
          const nextOrder = c.scenes.length + 1;
          const newSceneItem: SceneItem = {
            ...scene,
            id: `scene-${Date.now()}`,
            order: nextOrder,
          };
          const updated = {
            ...c,
            scenes: [...c.scenes, newSceneItem],
            version: c.version + 1,
            updatedAt: new Date().toISOString(),
          };
          if (user && isOnline) {
            setDoc(doc(db, 'users', user.uid, 'content', contentId), updated).catch(console.error);
          }
          return updated;
        }
        return c;
      })
    );
  }, [user, isOnline]);

  const updateScene = useCallback((contentId: string, sceneId: string, updates: Partial<SceneItem>) => {
    setContentList((prev) =>
      prev.map((c) => {
        if (c.id === contentId) {
          const updated = {
            ...c,
            scenes: c.scenes.map((s) => (s.id === sceneId ? { ...s, ...updates } : s)),
            version: c.version + 1,
            updatedAt: new Date().toISOString(),
          };
          if (user && isOnline) {
            setDoc(doc(db, 'users', user.uid, 'content', contentId), updated).catch(console.error);
          }
          return updated;
        }
        return c;
      })
    );
  }, [user, isOnline]);

  const deleteScene = useCallback((contentId: string, sceneId: string) => {
    setContentList((prev) =>
      prev.map((c) => {
        if (c.id === contentId) {
          const filtered = c.scenes.filter((s) => s.id !== sceneId);
          const renumbered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
          const updated = {
            ...c,
            scenes: renumbered,
            version: c.version + 1,
            updatedAt: new Date().toISOString(),
          };
          if (user && isOnline) {
            setDoc(doc(db, 'users', user.uid, 'content', contentId), updated).catch(console.error);
          }
          return updated;
        }
        return c;
      })
    );
  }, [user, isOnline]);

  const reorderScenes = useCallback((contentId: string, scenes: SceneItem[]) => {
    const renumbered = scenes.map((s, idx) => ({ ...s, order: idx + 1 }));
    setContentList((prev) =>
      prev.map((c) => {
        if (c.id === contentId) {
          const updated = {
            ...c,
            scenes: renumbered,
            version: c.version + 1,
            updatedAt: new Date().toISOString(),
          };
          if (user && isOnline) {
            setDoc(doc(db, 'users', user.uid, 'content', contentId), updated).catch(console.error);
          }
          return updated;
        }
        return c;
      })
    );
  }, [user, isOnline]);

  const addAsset = useCallback(
    (contentId: string, asset: Omit<AssetRecord, 'id' | 'capturedOn' | 'deviceId' | 'status'>) => {
      const newAsset: AssetRecord = {
        ...asset,
        id: `asset-${Date.now()}`,
        capturedOn: new Date().toISOString().replace('T', ' ').slice(0, 19),
        deviceId: 'iphone-16-pro',
        status: isOnline ? 'cloud' : 'local',
      };

      setContentList((prev) =>
        prev.map((c) => {
          if (c.id === contentId) {
            const updated = {
              ...c,
              assets: [newAsset, ...c.assets],
              version: c.version + 1,
              updatedAt: new Date().toISOString(),
            };
            if (user && isOnline) {
              setDoc(doc(db, 'users', user.uid, 'content', contentId), updated).catch(console.error);
            }
            return updated;
          }
          return c;
        })
      );
    },
    [isOnline, user]
  );

  const updateCanva = useCallback((contentId: string, updates: Partial<ContentObject['canvaDesign']>) => {
    setContentList((prev) =>
      prev.map((c) => {
        if (c.id === contentId) {
          return {
            ...c,
            canvaDesign: { ...c.canvaDesign, ...updates, lastSynced: new Date().toISOString() },
            version: c.version + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  }, []);

  const updateTimelineClips = useCallback(
    (contentId: string, trackType: keyof ContentObject['videoProject']['timeline'], clips: TimelineTrackClip[]) => {
      setContentList((prev) =>
        prev.map((c) => {
          if (c.id === contentId) {
            return {
              ...c,
              videoProject: {
                ...c.videoProject,
                timeline: {
                  ...c.videoProject.timeline,
                  [trackType]: clips,
                },
              },
              version: c.version + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    },
    []
  );

  const triggerSimulatedConflict = () => {
    if (!activeContent) return;
    setConflictData({
      contentId: activeContent.id,
      phoneVersion: {
        version: activeContent.version + 1,
        updatedAt: '10:35 Uhr (iPhone 16 Pro)',
        title: activeContent.title + ' [Mobile Live Edit]',
        scriptHook: 'Mobile Schnell-Hook: Die wichtigste 4-Sekunden-Entscheidung deines Tages.',
        scriptBody: activeContent.script.body + ' (Unterwegs per Voice nachkorrigiert)',
      },
      desktopVersion: {
        version: activeContent.version + 2,
        updatedAt: '10:32 Uhr (MacBook Studio)',
        title: activeContent.title + ' [Desktop Polish]',
        scriptHook: activeContent.script.hook,
        scriptBody: activeContent.script.body + ' [Am Desktop um B-Roll Anweisungen ergänzt]',
      },
    });
  };

  const resolveConflict = (choice: 'phone' | 'desktop') => {
    if (!conflictData) return;
    const choiceData = choice === 'phone' ? conflictData.phoneVersion : conflictData.desktopVersion;
    updateContentObject(conflictData.contentId, {
      title: choiceData.title,
      script: {
        ...activeContent!.script,
        hook: choiceData.scriptHook,
        body: choiceData.scriptBody,
      },
    });
    setConflictData(null);
  };

  // AI Actions via Server Proxy
  const generateReelWithAi = async (contentId: string) => {
    const target = contentList.find((c) => c.id === contentId);
    if (!target) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: target.title,
          brief: target.brief,
          brandKit,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate reel');
      const data = await res.json();

      updateContentObject(contentId, {
        script: {
          hook: data.hook || target.script.hook,
          body: data.body || target.script.body,
          cta: data.cta || target.script.cta,
          wordCount: (data.body || '').split(/\s+/).length,
          estimatedDuration: '30s',
        },
        scenes: data.scenes && data.scenes.length > 0 ? data.scenes.map((s: any, idx: number) => ({
          id: `scene-${Date.now()}-${idx}`,
          order: s.order || idx + 1,
          title: s.title || `Szene ${idx + 1}`,
          timecode: s.timecode || `0:0${idx * 6} - 0:0${(idx + 1) * 6}`,
          cameraAngle: s.cameraAngle || 'Eye-level 35mm',
          spokenText: s.spokenText || '',
          visualDescription: s.visualDescription || '',
          audioTrack: s.audioTrack || 'Voiceover + Lo-Fi beat',
          thumbnailUrl: idx % 2 === 0 ? '/src/assets/images/social_reel_creator_1791010043370.jpg' : '/src/assets/images/content_studio_desk_1791010031496.jpg',
        })) : target.scenes,
        captions: data.captions ? { ...target.captions, ...data.captions } : target.captions,
        status: 'storyboard',
      });
    } catch (e) {
      console.error('AI generation error', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateBriefFromVoiceAi = async (transcript: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/voice-to-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, brandContext: brandKit }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Fallback brief', e);
      return {
        title: transcript.slice(0, 45) || 'Neue Voice-Idee',
        coreMessage: transcript,
        targetAudience: 'Creator Community',
        goal: 'Engagement & Aufklärung',
        duration: '30s',
        tone: 'Authentisch',
        hook: `Warum ${transcript.slice(0, 30)}?`,
        scriptBody: transcript,
        cta: brandKit.defaultCTA,
      };
    } finally {
      setIsAiLoading(false);
    }
  };

  const quickAssistAi = async (contentId: string, action: 'hook' | 'improve' | 'caption') => {
    const target = contentList.find((c) => c.id === contentId);
    if (!target) return '';
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/quick-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          currentText: `${target.script.hook}\n${target.script.body}`,
          context: { title: target.title, brandKit },
        }),
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      console.warn('Quick assist fallback', e);
      return 'Optimierter Textentwurf mit hoher Retention.';
    } finally {
      setIsAiLoading(false);
    }
  };

  // Image Generation with gemini-3.1-flash-image-preview
  const generateImageWithAi = async (
    prompt: string,
    inputImageBase64?: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' = '1:1'
  ): Promise<string> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, inputImageBase64, aspectRatio }),
      });
      const data = await res.json();
      return data.imageUrl || '/src/assets/images/canva_graphic_template_1791010053197.jpg';
    } catch (e) {
      console.error(e);
      return '/src/assets/images/canva_graphic_template_1791010053197.jpg';
    } finally {
      setIsAiLoading(false);
    }
  };

  // Video Generation with veo-3.1-fast-generate-preview
  const generateVideoWithVeo = async (
    prompt: string,
    imageBytes?: string,
    aspectRatio: '16:9' | '9:16' = '9:16'
  ): Promise<string> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/video-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageBytes, aspectRatio }),
      });
      const data = await res.json();
      return data.videoUrl || '/src/assets/images/social_reel_creator_1791010043370.jpg';
    } catch (e) {
      console.error(e);
      return '/src/assets/images/social_reel_creator_1791010043370.jpg';
    } finally {
      setIsAiLoading(false);
    }
  };

  // Music Generation with lyria-3-clip-preview / lyria-3-pro-preview
  const generateMusicWithLyria = async (
    prompt: string,
    duration: string = '30s',
    model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' = 'lyria-3-clip-preview'
  ): Promise<string> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/music-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, model }),
      });
      const data = await res.json();
      return data.audioUrl || '#audio-track';
    } catch (e) {
      console.error(e);
      return '#audio-track';
    } finally {
      setIsAiLoading(false);
    }
  };

  // Search Grounding with gemini-3.5-flash
  const searchGroundingWithAi = async (query: string): Promise<{ text: string; sources: any[] }> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { text: 'Keine aktuellen Trenddaten verfügbar.', sources: [] };
    } finally {
      setIsAiLoading(false);
    }
  };

  // Google Maps Grounding with gemini-3.5-flash and googleMaps tool
  const mapsGroundingWithAi = async (query: string): Promise<{ text: string; places: any[] }> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { text: 'Keine Maps-Drehorte gefunden.', places: [] };
    } finally {
      setIsAiLoading(false);
    }
  };

  // Audio Transcription with gemini-3.5-transcribe
  const transcribeAudioWithAi = async (audioBase64: string, mimeType?: string): Promise<string> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });
      const data = await res.json();
      return data.transcript || '';
    } catch (e) {
      console.error(e);
      return '';
    } finally {
      setIsAiLoading(false);
    }
  };

  // Multi-turn Gemini Chatbot
  const sendChatMessage = async (
    messages: { role: string; text: string }[],
    model: string = 'gemini-3.5-flash',
    role: string = 'creative_director'
  ): Promise<string> => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model, role }),
      });
      const data = await res.json();
      return data.reply || '';
    } catch (e) {
      console.error(e);
      return 'Entschuldigung, die Antwort konnte nicht generiert werden.';
    } finally {
      setIsAiLoading(false);
    }
  };

  const exportPackage = (contentId: string) => {
    const item = contentList.find((c) => c.id === contentId);
    if (!item) return;

    const packageSummary = `
MUTUUS CONTENT PACKAGE EXPORT
=======================================
Object: ${item.code} (${item.title})
Project: ${projects.find((p) => p.id === item.projectId)?.name || 'Default'}
Exported At: ${new Date().toISOString()}

FILES GENERATED:
- /video/instagram_reel_9x16.mp4 (Rendered: 1080x1920 60fps)
- /video/tiktok_reel_9x16.mp4 (Rendered: 1080x1920 60fps)
- /video/youtube_short_9x16.mp4 (Rendered: 1080x1920 60fps)
- /design/canva_carousel_cover.png
- /copy/caption_instagram.txt
- /copy/caption_linkedin.txt
- /script/full_script.txt
- /subtitles/subtitles.srt
=======================================
    `;

    const blob = new Blob([packageSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.code.replace(/[^a-zA-Z0-9]/g, '_')}_package_manifest.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateBrandKit = (updates: Partial<BrandKit>) => {
    setBrandKit((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ContentOSContext.Provider
      value={{
        contentList,
        activeContent,
        activeContentId,
        projects,
        activeProjectId,
        brandKit,
        viewMode,
        isOnline,
        syncQueue,
        lastSyncedAt,
        conflictData,
        isAiLoading,
        user,
        isAuthLoading,
        loginWithGoogle,
        logout,
        setViewMode,
        setActiveContentId,
        setActiveProjectId,
        toggleOnline,
        createIdea,
        updateContentObject,
        updateScript,
        addScene,
        updateScene,
        deleteScene,
        reorderScenes,
        addAsset,
        updateCanva,
        updateTimelineClips,
        triggerSimulatedConflict,
        resolveConflict,
        generateReelWithAi,
        generateBriefFromVoiceAi,
        quickAssistAi,
        generateImageWithAi,
        generateVideoWithVeo,
        generateMusicWithLyria,
        searchGroundingWithAi,
        mapsGroundingWithAi,
        transcribeAudioWithAi,
        sendChatMessage,
        exportPackage,
        updateBrandKit,
      }}
    >
      {children}
    </ContentOSContext.Provider>
  );
};

export const useContentOS = () => {
  const context = useContext(ContentOSContext);
  if (!context) {
    throw new Error('useContentOS must be used within a ContentOSProvider');
  }
  return context;
};
