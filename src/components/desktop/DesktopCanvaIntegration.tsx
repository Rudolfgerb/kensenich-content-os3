import React, { useState } from 'react';
import { useContentOS } from '../../context/ContentOSContext';
import { ExternalLink, RefreshCw, Palette, Sparkles, CheckCircle2, Layers } from 'lucide-react';

export const DesktopCanvaIntegration: React.FC = () => {
  const { activeContent, updateCanva, brandKit } = useContentOS();
  const item = activeContent;
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!item) return null;

  const canva = item.canvaDesign;

  const handleRefreshSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      updateCanva(item.id, {
        lastSynced: new Date().toISOString(),
        status: 'ready',
      });
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
            C
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Canva Design Engine</h2>
            <p className="text-xs text-neutral-400">Verknüpft mit {item.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshSync}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Design aktualisieren</span>
          </button>

          <a
            href={canva.externalUrl || 'https://canva.com'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <span>In Canva bearbeiten</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Canvas preview */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-4">
          <div className="flex items-center justify-between w-full pb-3 border-b border-neutral-800">
            <div>
              <span className="text-xs font-bold text-white">{canva.title}</span>
              <div className="text-[10px] text-neutral-400">{canva.templateType}</div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              SYNCHRONISIERT
            </span>
          </div>

          <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden border border-neutral-800 shadow-lg">
            <img
              src={canva.previewUrl}
              alt="Canva Graphic Mockup"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Template ID: {canva.id}</span>
            <span>Letzter Abgleich: {new Date(canva.lastSynced).toLocaleTimeString()} Uhr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
