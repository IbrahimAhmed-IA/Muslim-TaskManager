'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import TaskManager from '@/components/task-manager/task-manager';

// We'll move the context usage inside a component to ensure it's used within the provider
const HomeContent = () => {
  // Import inside the component to avoid context issues
  const { useWeeklyScoreContext } = require('@/context/weekly-score-context');
  const { checkWeekEnd } = useWeeklyScoreContext();

  React.useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  return <TaskManager />;
};

export default function Home() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  );
}
