import React from 'react';
import { useContentOS } from '../../context/ContentOSContext';
import { Palette, Type, Video, MessageSquare, Check, Sparkles } from 'lucide-react';

export const DesktopBrandKit: React.FC = () => {
  const { brandKit, updateBrandKit } = useContentOS();

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-y-auto p-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Brand Kit & Style Guide</h2>
        <p className="text-xs text-neutral-400">
          Wird auf allen Geräten synchronisiert und automatisch als Kontext für KI-Generierungen genutzt
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Brand Core */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            Brand Identität
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Brand Name</label>
              <input
                type="text"
                value={brandKit.brandName}
                onChange={(e) => updateBrandKit({ brandName: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Tagline</label>
              <input
                type="text"
                value={brandKit.tagline}
                onChange={(e) => updateBrandKit({ tagline: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Colors (PRD Section 19) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500" />
            Farbpalette (Synchronisiert)
          </span>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Primary Color</label>
              <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-amber-500 shadow-sm" />
                <span className="text-xs font-mono text-neutral-200">{brandKit.colors.primary}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Secondary</label>
              <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-slate-900 shadow-sm border border-neutral-700" />
                <span className="text-xs font-mono text-neutral-200">{brandKit.colors.secondary}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Accent</label>
              <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-sky-400 shadow-sm" />
                <span className="text-xs font-mono text-neutral-200">{brandKit.colors.accent}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Canvas</label>
              <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-neutral-950 shadow-sm border border-neutral-700" />
                <span className="text-xs font-mono text-neutral-200">{brandKit.colors.background}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video & Caption Style */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-400" />
            Video- & Caption-Stil
          </span>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Video Schnitt-Stil</label>
            <input
              type="text"
              value={brandKit.videoStyle}
              onChange={(e) => updateBrandKit({ videoStyle: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Standard Call to Action (CTA)</label>
            <input
              type="text"
              value={brandKit.defaultCTA}
              onChange={(e) => updateBrandKit({ defaultCTA: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
