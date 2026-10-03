import React, { useState } from 'react';
import { AlertTriangle, Smartphone, Monitor, Check, ArrowRightLeft, X } from 'lucide-react';
import { useContentOS } from '../../context/ContentOSContext';

export const ConflictModal: React.FC = () => {
  const { conflictData, resolveConflict } = useContentOS();
  const [showComparison, setShowComparison] = useState(false);

  if (!conflictData) return null;

  const { phoneVersion, desktopVersion } = conflictData;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-amber-500/40 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        {/* Header (PRD Section 9) */}
        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">CONTENT CONFLICT</h3>
            <p className="text-xs text-neutral-300">
              Derselbe Content wurde auf zwei Geräten gleichzeitig bearbeitet.
            </p>
          </div>
        </div>

        {/* Content Comparison Cards */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Phone Version */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Phone Version</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                Updated {phoneVersion.updatedAt}
              </div>
              <div className="text-xs font-semibold text-neutral-200 line-clamp-1">
                {phoneVersion.title}
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-3 bg-neutral-900/60 p-2 rounded-lg italic">
                "{phoneVersion.scriptHook}"
              </p>
              <button
                onClick={() => resolveConflict('phone')}
                className="w-full mt-2 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors"
              >
                Use Phone
              </button>
            </div>

            {/* Desktop Version */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Desktop Version</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                Updated {desktopVersion.updatedAt}
              </div>
              <div className="text-xs font-semibold text-neutral-200 line-clamp-1">
                {desktopVersion.title}
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-3 bg-neutral-900/60 p-2 rounded-lg italic">
                "{desktopVersion.scriptHook}"
              </p>
              <button
                onClick={() => resolveConflict('desktop')}
                className="w-full mt-2 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-bold transition-colors"
              >
                Use Desktop
              </button>
            </div>
          </div>

          {/* Compare toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-neutral-400 hover:text-white underline font-medium"
            >
              {showComparison ? 'Detailvergleich schließen' : '[Compare] Detaillierten Textvergleich anzeigen'}
            </button>
          </div>

          {showComparison && (
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs space-y-2">
              <div className="text-[11px] font-bold text-amber-400">Phone Body:</div>
              <p className="text-neutral-300 italic">{phoneVersion.scriptBody}</p>
              <div className="text-[11px] font-bold text-sky-400 pt-1">Desktop Body:</div>
              <p className="text-neutral-300 italic">{desktopVersion.scriptBody}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
