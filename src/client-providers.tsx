'use client';

import type React from 'react';
import { AppSettingsProvider } from './context/app-settings-context';
import { PomodoroProvider } from './context/pomodoro-context';
import { TaskProvider } from './context/task-context';
import { ProjectProvider } from './context/project-context';
import { NoteProvider } from './context/note-context';
import { WeeklyScoreProvider } from './context/weekly-score-context';
import { WidgetLayoutProvider } from './context/widget-layout-context';
import { Toaster } from '@/components/ui/toaster';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppSettingsProvider>
      <TaskProvider>
        <PomodoroProvider>
          <ProjectProvider>
            <NoteProvider>
              <WeeklyScoreProvider>
                <WidgetLayoutProvider>
                  {children}
                  <Toaster />
                </WidgetLayoutProvider>
              </WeeklyScoreProvider>
            </NoteProvider>
          </ProjectProvider>
        </PomodoroProvider>
      </TaskProvider>
    </AppSettingsProvider>
  );
}
