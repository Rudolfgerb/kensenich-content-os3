import React from 'react';
import { useContentOS } from '../../context/ContentOSContext';
import { Calendar as CalendarIcon, Video, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DAYS = [
  { day: 'Mo', date: '05. Okt', label: 'Montag' },
  { day: 'Di', date: '06. Okt', label: 'Dienstag' },
  { day: 'Mi', date: '07. Okt', label: 'Mittwoch' },
  { day: 'Do', date: '08. Okt', label: 'Donnerstag' },
  { day: 'Fr', date: '09. Okt', label: 'Freitag' },
  { day: 'Sa', date: '10. Okt', label: 'Samstag' },
  { day: 'So', date: '11. Okt', label: 'Sonntag' },
];

export const DesktopCalendar: React.FC = () => {
  const { contentList, setActiveContentId } = useContentOS();

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Content Kalender</h2>
            <p className="text-xs text-neutral-400">Veröffentlichungsplan für Social Media Kanäle</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-neutral-200 px-2 font-mono">Oktober 2026 · Woche 41</span>
          <button className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Grid (PRD Section 21) */}
      <div className="flex-1 grid grid-cols-7 border-b border-neutral-800 bg-neutral-950 divide-x divide-neutral-800/80 overflow-y-auto">
        {DAYS.map((col, idx) => (
          <div key={col.day} className="flex flex-col h-full bg-neutral-950/40">
            {/* Day Header */}
            <div className="p-3 border-b border-neutral-800/80 bg-neutral-900/30 text-center">
              <span className="text-[11px] font-bold text-amber-500 uppercase">{col.day}</span>
              <div className="text-xs font-mono text-neutral-300 font-semibold">{col.date}</div>
            </div>

            {/* Scheduled slots */}
            <div className="flex-1 p-2.5 space-y-2">
              {idx === 0 && (
                <div
                  onClick={() => setActiveContentId('content-00142')}
                  className="bg-neutral-900 border border-amber-500/50 rounded-xl p-2.5 space-y-1.5 cursor-pointer shadow-sm hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                    <span>10:00 Uhr</span>
                    <span className="uppercase">Reel</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2">
                    Warum Menschen keine Zeit haben zu helfen
                  </div>
                  <div className="text-[10px] text-neutral-400">Instagram · TikTok</div>
                </div>
              )}

              {idx === 2 && (
                <div
                  onClick={() => setActiveContentId('content-00143')}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-2.5 space-y-1.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] text-sky-400 font-mono">
                    <span>18:00 Uhr</span>
                    <span className="uppercase">Story</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2">
                    3 Tools für Content Batching auf Reisen
                  </div>
                </div>
              )}

              {idx === 4 && (
                <div
                  onClick={() => setActiveContentId('content-00144')}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-2.5 space-y-1.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                    <span>14:30 Uhr</span>
                    <span className="uppercase">Shorts</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2">
                    Voice-to-Script: Wie AI dein Gehirn entlastet
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
