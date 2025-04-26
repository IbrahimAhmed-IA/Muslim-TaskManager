'use client';

import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import TaskManager from '@/components/task-manager/task-manager';
import { useWeeklyScoreContext } from '@/context/weekly-score-context';
import { useAppSettings } from '@/context/app-settings-context';
import WidgetDashboard from '@/components/widgets/widget-dashboard';

// Home content component that handles weekly score checking
const HomeContent = () => {
  const { checkWeekEnd } = useWeeklyScoreContext();
  const { settings } = useAppSettings();

  useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  return settings.advancedMode ? <WidgetDashboard /> : <TaskManager />;
};

export default function Home() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  );
}
