import React, { useState } from 'react';
import { ContentOSProvider, useContentOS } from './context/ContentOSContext';
import { MobileCreatorStation } from './components/mobile/MobileCreatorStation';
import { DesktopProductionStation } from './components/desktop/DesktopProductionStation';
import { DualStationView } from './components/dual/DualStationView';
import { ConflictModal } from './components/modals/ConflictModal';
import {
  Smartphone,
  Monitor,
  ArrowRightLeft,
  Wifi,
  WifiOff,
  AlertTriangle,
  Download,
  Plus,
} from 'lucide-react';

function ContentOSMainApp() {
  const {
    viewMode,
    setViewMode,
    isOnline,
    toggleOnline,
    triggerSimulatedConflict,
    exportPackage,
    activeContent,
    syncQueue,
    user,
    loginWithGoogle,
    logout,
  } = useContentOS();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* ========================================================================= */}
      {/* TOP BAR CONTRACT: Zone 1 (Wordmark) — Zone 2 (Nav Links) — Zone 3 (Actions) */}
      {/* ========================================================================= */}
      <header className="h-14 px-6 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0 select-none z-30">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Mutuus Content OS
          </span>
          <span className="text-neutral-600 hidden md:inline">|</span>
          <span className="text-xs text-neutral-400 font-mono hidden md:inline">
            Cross-Platform v2.0
          </span>
        </div>

        {/* Zone 2: Navigation links / View Switcher (Single line) */}
        <nav className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setViewMode('dual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              viewMode === 'dual'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Dual Sync View</span>
          </button>

          <button
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              viewMode === 'desktop'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Workspace</span>
          </button>

          <button
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              viewMode === 'mobile'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Smartphone Station</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Offline First simulation, Conflict test, Export) */}
        <div className="flex items-center gap-2.5">
          {/* Offline / Online Toggle (PRD Section 7 & Section 40) */}
          <button
            onClick={toggleOnline}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isOnline
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
            }`}
            title="Klicken zum Umschalten zwischen Online-Sync und Offline-Puffer"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online Synced' : `Offline (${syncQueue} queued)`}</span>
          </button>

          {/* Conflict Simulation Button (PRD Section 9) */}
          <button
            onClick={triggerSimulatedConflict}
            className="hidden sm:flex px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-amber-400 text-xs font-medium items-center gap-1.5 transition-colors whitespace-nowrap"
            title="Simuliere gleichzeitige Bearbeitung auf Smartphone & Desktop zur Konfliktprüfung"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Conflict</span>
          </button>

          {/* Firebase Google Auth (User Account & Cloud Firestore Sync) */}
          {user ? (
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden md:inline">
                {user.displayName || user.email}
              </span>
              <button
                onClick={logout}
                className="text-[10px] text-neutral-400 hover:text-red-400 font-medium pl-1 border-l border-neutral-800"
                title="Abmelden"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google Login</span>
            </button>
          )}

          {/* Export Package Button (PRD Section 23) */}
          {activeContent && (
            <button
              onClick={() => exportPackage(activeContent.id)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Package</span>
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'dual' && <DualStationView />}
        {viewMode === 'desktop' && <DesktopProductionStation />}
        {viewMode === 'mobile' && (
          <div className="flex-1 flex items-center justify-center p-6 bg-neutral-950 overflow-y-auto">
            <MobileCreatorStation isEmbedded={false} />
          </div>
        )}
      </main>

      {/* Conflict Resolution Modal (PRD Section 9) */}
      <ConflictModal />
    </div>
  );
}

export default function App() {
  return (
    <ContentOSProvider>
      <ContentOSMainApp />
    </ContentOSProvider>
  );
}
