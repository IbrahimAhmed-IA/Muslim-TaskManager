"use client";

import MainLayout from "@/components/layout/main-layout";
import TaskManager from "@/components/task-manager/task-manager";
import WidgetDashboard from "@/components/widgets/widget-dashboard";
import { useAppSettings } from "@/context/app-settings-context";
import { useWeeklyScoreContext } from "@/context/weekly-score-context";
import React, { useEffect } from "react";

// Home content component that handles weekly score checking
const HomeContent = () => {
  const { checkWeekEnd } = useWeeklyScoreContext();
  const { settings } = useAppSettings();

  useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  return (
    <div className="main-content p-6 fade-in">
      {settings.advancedMode ? <WidgetDashboard /> : <TaskManager />}
    </div>
  );
};

export default function Home() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  );
}
