export type ContentStatus =
  | 'idea'
  | 'brief'
  | 'script'
  | 'storyboard'
  | 'production'
  | 'review'
  | 'ready'
  | 'published';

export type MobileContentStatus = 'idea' | 'in_progress' | 'review' | 'ready' | 'published';

export type SyncState = 'synced' | 'pending' | 'uploading' | 'conflict' | 'error';

export interface SceneItem {
  id: string;
  order: number;
  title: string;
  timecode: string;
  visualDescription: string;
  cameraAngle: string;
  spokenText: string;
  audioTrack: string;
  assetId?: string;
  thumbnailUrl?: string;
}

export interface AssetRecord {
  id: string;
  name: string; // e.g. "VID_002.mp4", "IMG_001.jpg", "VOICE_001.m4a"
  type: 'video' | 'image' | 'voice' | 'audio';
  url: string;
  size: string;
  duration?: string;
  capturedOn: string;
  deviceId: string;
  status: 'local' | 'cloud' | 'syncing';
}

export interface TimelineTrackClip {
  id: string;
  name: string;
  start: number; // in seconds
  duration: number; // in seconds
  color: string;
  assetId?: string;
}

export interface VideoProject {
  duration: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  currentTime: number;
  isPlaying: boolean;
  timeline: {
    videoTracks: TimelineTrackClip[];
    voiceTracks: TimelineTrackClip[];
    textTracks: TimelineTrackClip[];
    musicTracks: TimelineTrackClip[];
    sfxTracks: TimelineTrackClip[];
  };
  renderStatus: 'idle' | 'queued' | 'rendering' | 'complete' | 'failed';
  renderProgress?: number;
}

export interface CanvaDesign {
  id: string;
  title: string;
  templateType: string;
  previewUrl: string;
  status: 'linked' | 'editing' | 'ready';
  lastSynced: string;
  externalUrl: string;
}

export interface PlatformVariant {
  id: string;
  platform: 'instagram_reel' | 'tiktok' | 'youtube_short' | 'instagram_story' | 'linkedin' | 'youtube';
  name: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  status: 'draft' | 'ready' | 'published';
  scheduledFor?: string;
  characterLimit: number;
  customCaption?: string;
}

export interface ContentComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  device: string;
}

export interface ContentObject {
  id: string;
  code: string; // e.g. "Content #00142"
  projectId: string;
  title: string;
  status: ContentStatus;
  source: 'voice' | 'camera' | 'text' | 'scratch';
  version: number;
  updatedAt: string;
  deviceId: string;
  syncStatus: SyncState;
  
  brief: {
    coreMessage: string;
    targetAudience: string;
    goal: string;
    duration: string;
    tone: string;
  };
  
  script: {
    hook: string;
    body: string;
    cta: string;
    wordCount: number;
    estimatedDuration: string;
  };
  
  scenes: SceneItem[];
  assets: AssetRecord[];
  videoProject: VideoProject;
  canvaDesign: CanvaDesign;
  
  captions: {
    instagram: string;
    tiktok: string;
    youtube: string;
    linkedin: string;
    hashtags: string[];
  };
  
  platformVariants: PlatformVariant[];
  comments: ContentComment[];
}

export interface BrandKit {
  brandName: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
  videoStyle: string;
  captionStyle: string;
  intro: string;
  outro: string;
  defaultCTA: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
  contentCount: number;
  updatedAt: string;
}

export interface ConflictRecord {
  contentId: string;
  phoneVersion: {
    version: number;
    updatedAt: string;
    title: string;
    scriptHook: string;
    scriptBody: string;
  };
  desktopVersion: {
    version: number;
    updatedAt: string;
    title: string;
    scriptHook: string;
    scriptBody: string;
  };
}
