'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import TaskColumn from './task-column';
import TaskInput from './task-input';
import { useTaskContext } from '@/context/task-context';
import { usePomodoroContext } from '@/context/pomodoro-context';
import { useAppSettings } from '@/context/app-settings-context';
import type { DayOfWeek } from '@/lib/types';
import RepeatTaskModal from './modals/repeat-task-modal';

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

  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const progressPercentage = getOverallProgress();

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

  const handleRepeatTasks = () => {
    if (selectedTasks.length === 0) return;
    setShowRepeatModal(true);
  };

  const handleRepeatModalClose = () => {
    setShowRepeatModal(false);
  };

  const handleUncheckAllTasks = () => {
    uncheckAllTasks();
  };

  const days: DayOfWeek[] = [
    'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ];

  const getCurrentDay = (): DayOfWeek => {
    const daysMap: Record<number, DayOfWeek> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    const dayIndex = new Date().getDay();
    return daysMap[dayIndex];
  };

  const currentDay = getCurrentDay();

  const remainingDays = days.filter(day => day !== currentDay);

  return (
    <div className={`task-manager w-full fade-in ${settings.advancedMode ? 'text-white' : ''}`}>
      <div className="container mx-auto p-6">
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

          <div className={`${settings.advancedMode ? 'bg-slate-900' : 'bg-gray-50'} p-5 rounded-xl mb-6 ${settings.advancedMode ? 'border-slate-700' : 'border border-gray-100'}`}>
            <h3 className={`text-lg font-medium mb-4 ${settings.advancedMode ? 'text-slate-200' : 'text-gray-700'}`}>
              Add New Task
            </h3>
            <TaskInput />
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleRepeatTasks}
                  disabled={selectedTasks.length === 0}
                  className={`btn-primary py-5 ${
                    settings.advancedMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-400'
                      : ''
                  }`}
                >
                  Repeat ({selectedTasks.length})
                </Button>

                <Button
                  onClick={sortTasks}
                  className={`py-5 ${
                    settings.advancedMode
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white'
                  }`}
                >
                  Sort & Organize
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div key={currentDay} className="slide-up">
            <div className="mb-2">
              <span className={`font-medium ${settings.advancedMode ? 'text-white' : 'text-gray-700'}`}>
                Today
              </span>
              <span className={`${settings.advancedMode ? 'text-blue-300' : 'text-blue-600'} ml-2 font-medium capitalize`}>
                ({currentDay})
              </span>
            </div>
            <TaskColumn day={currentDay} isCurrentDay={true} />
          </div>

          <div className="mt-4 pt-2 border-t border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {remainingDays.map((day, index) => (
                <div key={day} className="slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <TaskColumn day={day} isCurrentDay={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RepeatTaskModal
        isOpen={showRepeatModal}
        onClose={handleRepeatModalClose}
        taskIds={selectedTasks}
        onTasksRepeated={() => {
          setSelectedTasks([]);
          setShowRepeatModal(false);
        }}
      />
    </div>
  );
}
