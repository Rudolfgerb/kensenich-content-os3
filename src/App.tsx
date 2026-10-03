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
