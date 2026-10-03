import React from 'react';
import { MobileCreatorStation } from '../mobile/MobileCreatorStation';
import { DesktopProductionStation } from '../desktop/DesktopProductionStation';
import { ArrowRightLeft, Smartphone, Monitor, Sparkles, CheckCircle2 } from 'lucide-react';
import { useContentOS } from '../../context/ContentOSContext';

export const DualStationView: React.FC = () => {
  const { isOnline, lastSyncedAt, activeContent } = useContentOS();

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Top Banner explaining the dual live sync setup */}
      <div className="px-6 py-2 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Mutuus Cross-Platform Sync Bridge</span>
          </div>
          <span className="text-neutral-400">
            Gleiche Content-Objekte auf beiden Geräten — Änderungen links am Smartphone spiegeln sich sofort rechts im Desktop-Workspace wider.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isOnline ? 'Live Socket Sync aktiv' : 'Offline Puffer aktiv'}
          </span>
        </div>
      </div>

      {/* Split Canvas */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Side: Smartphone Station (4 Cols or responsive) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 border-r border-neutral-800 bg-neutral-950 p-4 flex flex-col items-center justify-center overflow-y-auto">
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-500" />
              Smartphone Station (Mobile Capture)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">iPhone 16 Pro</span>
          </div>

          <MobileCreatorStation isEmbedded={true} />
        </div>

        {/* Right Side: Desktop Production Station (8 Cols) */}
        <div className="hidden lg:flex col-span-8 xl:col-span-8 flex-col h-full overflow-hidden">
          <div className="px-6 py-2 border-b border-neutral-800 bg-neutral-900/30 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-sky-400" />
              Desktop Production Station (Storyboard & Video Studio)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Aktives Objekt: {activeContent?.code || 'None'}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <DesktopProductionStation />
          </div>
        </div>
      </div>
    </div>
  );
};
