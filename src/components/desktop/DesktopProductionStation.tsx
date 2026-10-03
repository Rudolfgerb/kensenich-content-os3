import React, { useState } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopWorkspace } from './DesktopWorkspace';
import { DesktopPipeline } from './DesktopPipeline';
import { DesktopVideoEditor } from './DesktopVideoEditor';
import { DesktopCanvaIntegration } from './DesktopCanvaIntegration';
import { DesktopCalendar } from './DesktopCalendar';
import { DesktopBrandKit } from './DesktopBrandKit';

export const DesktopProductionStation: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workspace' | 'pipeline' | 'video' | 'canva' | 'calendar' | 'brand'>('workspace');

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-neutral-950">
      <DesktopSidebar currentView={currentView} onSelectView={setCurrentView} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {currentView === 'workspace' && <DesktopWorkspace />}
        {currentView === 'pipeline' && <DesktopPipeline />}
        {currentView === 'video' && <DesktopVideoEditor />}
        {currentView === 'canva' && <DesktopCanvaIntegration />}
        {currentView === 'calendar' && <DesktopCalendar />}
        {currentView === 'brand' && <DesktopBrandKit />}
      </main>
    </div>
  );
};
