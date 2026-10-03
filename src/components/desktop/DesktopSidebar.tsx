import React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Layers,
  FileText,
  Film,
  Calendar,
  BarChart3,
  FolderGit2,
  Palette,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Monitor,
} from 'lucide-react';
import { useContentOS } from '../../context/ContentOSContext';

interface DesktopSidebarProps {
  currentView: 'workspace' | 'pipeline' | 'video' | 'canva' | 'calendar' | 'brand';
  onSelectView: (view: 'workspace' | 'pipeline' | 'video' | 'canva' | 'calendar' | 'brand') => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentView, onSelectView }) => {
  const { projects, activeProjectId, setActiveProjectId, lastSyncedAt, isOnline } = useContentOS();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <div className="w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col h-full select-none">
      {/* Brand Wordmark (PRD Section 5: MUTUUS CONTENT OS) */}
      <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold">
            PLATFORM 2.0
          </div>
          <h1 className="text-sm font-extrabold text-white tracking-tight">MUTUUS CONTENT OS</h1>
        </div>
      </div>

      {/* Project Switcher */}
      <div className="px-4 py-3 border-b border-neutral-800/80">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
          Workspace / Projekt
        </label>
        <select
          value={activeProjectId}
          onChange={(e) => setActiveProjectId(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.contentCount})
            </option>
          ))}
        </select>
      </div>

      {/* PRD Section 5: Desktop Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <button
          onClick={() => onSelectView('workspace')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'workspace'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-amber-500" />
          <span>Content Workspace</span>
        </button>

        <button
          onClick={() => onSelectView('pipeline')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'pipeline'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Pipeline (Kanban)</span>
        </button>

        <button
          onClick={() => onSelectView('video')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'video'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Film className="w-4 h-4 text-emerald-400" />
          <span>Video Studio Timeline</span>
        </button>

        <button
          onClick={() => onSelectView('canva')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'canva'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <div className="w-4 h-4 rounded bg-sky-500 text-white font-bold text-[9px] flex items-center justify-center">
            C
          </div>
          <span>Canva Integration</span>
        </button>

        <button
          onClick={() => onSelectView('calendar')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'calendar'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Content Kalender</span>
        </button>

        <div className="pt-4 pb-2 px-3">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Settings & Brand</span>
        </div>

        <button
          onClick={() => onSelectView('brand')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'brand'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Brand Kit</span>
        </button>
      </div>

      {/* Bottom Device & Sync Info (PRD Section 8) */}
      <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/90 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <Monitor className="w-4 h-4 text-neutral-400" />
          <span className="font-semibold text-white">MacBook Pro M3</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Cloud Sync:</span>
          <span className="text-emerald-400 font-mono">{isOnline ? 'Verbunden ✓' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};
