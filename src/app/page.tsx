'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import TaskManager from '@/components/task-manager/task-manager';
import Providers from '@/providers';

// We'll move the context usage inside a component that's wrapped by Providers
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
    <Providers>
      <MainLayout>
        <HomeContent />
      </MainLayout>
    </Providers>
  );
}
