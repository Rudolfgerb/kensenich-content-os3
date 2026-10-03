import React from 'react';
import { useContentOS } from '../../context/ContentOSContext';
import { ContentStatus, ContentObject } from '../../types/content';
import { ChevronRight, Plus, Video, Mic, FileText, Layers, Check } from 'lucide-react';

const PIPELINE_STAGES: { key: ContentStatus; label: string; desc: string }[] = [
  { key: 'idea', label: 'Idea', desc: 'Raw Notes & Voice' },
  { key: 'brief', label: 'Brief', desc: 'Core Message' },
  { key: 'script', label: 'Script', desc: 'Hook & Body' },
  { key: 'storyboard', label: 'Storyboard', desc: 'Scenes & Framing' },
  { key: 'production', label: 'Production', desc: 'Video & Editing' },
  { key: 'review', label: 'Review', desc: 'Final Quality Check' },
  { key: 'ready', label: 'Ready', desc: 'Scheduled for Release' },
  { key: 'published', label: 'Published', desc: 'Live on Channels' },
];

export const DesktopPipeline: React.FC = () => {
  const { contentList, setActiveContentId, updateContentObject } = useContentOS();

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Content Pipeline</h2>
          <p className="text-xs text-neutral-400">
            Von der mobilen Idee bis zum veröffentlichten Social Media Paket
          </p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-4 no-scrollbar">
        {PIPELINE_STAGES.map((stage) => {
          const itemsInStage = contentList.filter((c) => c.status === stage.key);

          return (
            <div
              key={stage.key}
              className="w-72 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl flex flex-col h-full shrink-0 overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/80">
                <div>
                  <div className="text-xs font-bold text-white capitalize">{stage.label}</div>
                  <div className="text-[10px] text-neutral-400">{stage.desc}</div>
                </div>
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-mono font-bold text-neutral-300 flex items-center justify-center">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {itemsInStage.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveContentId(item.id)}
                    className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/80 rounded-xl p-3 cursor-pointer transition-all shadow-sm space-y-2 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">v{item.version}</span>
                    </div>

                    <div className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {item.title}
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 italic">
                      "{item.script.hook || item.brief.coreMessage}"
                    </p>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        {item.source === 'voice' && <Mic className="w-3 h-3 text-sky-400" />}
                        {item.source === 'camera' && <Video className="w-3 h-3 text-amber-400" />}
                        <span>{item.scenes.length} Szenen</span>
                      </div>
                      <span className="font-mono text-neutral-300">{item.script.estimatedDuration}</span>
                    </div>

                    {/* Move Stage Shortcut */}
                    <div className="pt-1.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <select
                        value={item.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateContentObject(item.id, { status: e.target.value as any });
                        }}
                        className="bg-neutral-800 text-[10px] text-neutral-300 rounded px-1.5 py-0.5 border border-neutral-700 focus:outline-none"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            → {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
