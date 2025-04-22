'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import PomodoroTimer from '@/components/pomodoro/pomodoro-timer';
import Providers from '@/providers';

// Component to handle context inside Providers
const PomodoroContent = () => {
  // Import inside the component to avoid context issues
  const { useWeeklyScoreContext } = require('@/context/weekly-score-context');
  const { checkWeekEnd } = useWeeklyScoreContext();

  React.useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <PomodoroTimer />
    </div>
  );
};

export default function PomodoroPage() {
  return (
    <Providers>
      <MainLayout>
        <PomodoroContent />
      </MainLayout>
    </Providers>
  );
}
