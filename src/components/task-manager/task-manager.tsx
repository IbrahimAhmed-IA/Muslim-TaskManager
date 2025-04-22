'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TaskColumn from './task-column';
import TaskInput from './task-input';
import ProjectManager from './project-manager';
import { useTaskContext } from '@/context/task-context';
import { usePomodoroContext } from '@/context/pomodoro-context';
import { useAppSettings } from '@/context/app-settings-context';
import type { DayOfWeek, Task } from '@/lib/types';
import CopyTaskModal from './modals/copy-task-modal';
import AzanTimes from '@/components/azan/azan-times';

export default function TaskManager() {
  const {
    getOverallProgress,
    uncheckAllTasks,
    sortTasks,
    selectedTasks,
    setSelectedTasks,
    tasks,
    incrementTaskPomodoro
  } = useTaskContext();

  const { settings } = useAppSettings();
  const { onPomodoroComplete } = usePomodoroContext();

  const [showCopyModal, setShowCopyModal] = useState(false);

  const progressPercentage = getOverallProgress();

  // Register callback to increment pomodoro count for current pomodoro task
  useEffect(() => {
    if (!onPomodoroComplete) return;

    const handlePomodoroComplete = () => {
      const currentTask = tasks.find(task => task.currentPomodoroTask);
      if (currentTask) {
        incrementTaskPomodoro(currentTask.id);
      }
    };

    onPomodoroComplete(handlePomodoroComplete);
  }, [tasks, onPomodoroComplete, incrementTaskPomodoro]);

  const handleCopyTasks = () => {
    if (selectedTasks.length === 0) return;
    setShowCopyModal(true);
  };

  const handleCopyModalClose = () => {
    setShowCopyModal(false);
  };

  const handleUncheckAllTasks = () => {
    uncheckAllTasks();
  };

  const days: DayOfWeek[] = [
    'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ];

  return (
    <div className={`task-manager w-full fade-in ${settings.advancedMode ? 'text-white' : ''}`}>
      {/* Header */}
      <header className={`page-header py-10 ${settings.advancedMode ? 'bg-gradient-to-r from-blue-900 to-slate-800' : ''}`}>
        <h1 className="text-3xl font-bold mb-1">Muslim Task Manager</h1>
        <p className={`${settings.advancedMode ? 'text-slate-300' : 'text-white/80'}`}>
          {settings.advancedMode ? 'Advanced Task Management with Pomodoro Integration' : 'Organize your day with purpose'}
        </p>
        <AzanTimes />
      </header>

      {/* Content */}
      <div className="container mx-auto p-6">
        {/* Advanced mode features */}
        {settings.advancedMode && (
          <ProjectManager />
        )}

        {/* Progress Overview */}
        <div className={`card p-6 mb-8 transition-all hover:shadow-md ${settings.advancedMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className={`h-12 w-12 rounded-full ${
                settings.advancedMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-800'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600'
              } flex items-center justify-center mr-4 shadow-md`}>
                <span className="text-white font-bold text-lg">{progressPercentage}%</span>
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${settings.advancedMode ? 'text-white' : 'text-gray-800'}`}>
                  Overall Progress
                </h2>
                <p className={settings.advancedMode ? 'text-slate-300 text-sm' : 'text-gray-500 text-sm'}>
                  Keep going, you're doing great!
                </p>
              </div>
            </div>

            <div className="w-full sm:w-4/5">
              <Progress
                value={progressPercentage}
                className={`h-3 w-full rounded-full ${
                  settings.advancedMode ? 'bg-slate-700' : ''
                }`}
              />
            </div>
          </div>

          {/* Task Input Form */}
          <div className={`${settings.advancedMode ? 'bg-slate-900' : 'bg-gray-50'} p-5 rounded-xl mb-6 ${settings.advancedMode ? 'border-slate-700' : 'border border-gray-100'}`}>
            <h3 className={`text-lg font-medium mb-4 ${settings.advancedMode ? 'text-slate-200' : 'text-gray-700'}`}>
              Add New Task
            </h3>
            <TaskInput />
          </div>

          {/* Task Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Button
              onClick={handleCopyTasks}
              disabled={selectedTasks.length === 0}
              className={`btn-primary py-5 ${
                settings.advancedMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-400'
                  : ''
              }`}
            >
              Copy Selected Tasks ({selectedTasks.length})
            </Button>

            <Button
              onClick={handleUncheckAllTasks}
              className={`btn-primary py-5 ${
                settings.advancedMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              Uncheck All Tasks
            </Button>

            <Button
              onClick={sortTasks}
              className={`sm:col-span-2 py-5 ${
                settings.advancedMode
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white'
              }`}
            >
              Organize & Sort Tasks
            </Button>
          </div>
        </div>

        {/* Day Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {days.map((day, index) => (
            <div key={day} className="slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <TaskColumn
                day={day}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Copy Task Modal */}
      <CopyTaskModal
        isOpen={showCopyModal}
        onClose={handleCopyModalClose}
        taskIds={selectedTasks}
        onTasksCopied={() => {
          setSelectedTasks([]);
          setShowCopyModal(false);
        }}
      />
    </div>
  );
}
