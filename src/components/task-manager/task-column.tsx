'use client';

import { useTaskContext } from '@/context/task-context';
import { useAppSettings } from '@/context/app-settings-context';
import type { DayOfWeek } from '@/lib/types';
import TaskItem from './task-item';

interface TaskColumnProps {
  day: DayOfWeek;
}

export default function TaskColumn({
  day,
}: TaskColumnProps) {
  const { getTasksByDay, getDayProgress, selectedTasks, toggleSelectTask } = useTaskContext();
  const { settings } = useAppSettings();

  const tasks = getTasksByDay(day);
  const progress = getDayProgress(day);

  // Format the day name to title case
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Advanced mode styles
  const advancedStyles = settings.advancedMode ? {
    columnBg: 'bg-slate-800',
    columnBorder: 'border border-slate-700',
    text: 'text-white',
    mutedText: 'text-slate-200',
    progressBg: 'bg-slate-700',
    emptyBorder: 'border-slate-700',
    emptyText: 'text-slate-400',
    emptySubtext: 'text-slate-500',
    columnShadow: 'shadow-md shadow-slate-900/20'
  } : {};

  // Get gradient color based on day
  const getDayGradient = (day: DayOfWeek) => {
    if (settings.advancedMode) {
      const gradients = {
        'saturday': 'from-indigo-900 to-purple-900',
        'sunday': 'from-blue-900 to-indigo-900',
        'monday': 'from-sky-900 to-blue-900',
        'tuesday': 'from-teal-900 to-cyan-900',
        'wednesday': 'from-emerald-900 to-green-900',
        'thursday': 'from-orange-900 to-amber-900',
        'friday': 'from-rose-900 to-red-900',
      };
      return gradients[day] || 'from-indigo-900 to-purple-900';
    }

    const gradients = {
      'saturday': 'from-indigo-600 to-purple-600',
      'sunday': 'from-blue-600 to-indigo-600',
      'monday': 'from-sky-500 to-blue-600',
      'tuesday': 'from-teal-500 to-cyan-500',
      'wednesday': 'from-emerald-500 to-green-600',
      'thursday': 'from-orange-500 to-amber-500',
      'friday': 'from-rose-500 to-red-600',
    };
    return gradients[day] || 'from-indigo-600 to-purple-600';
  };

  const dayGradient = getDayGradient(day);

  return (
    <div className={`day-column h-full flex flex-col ${
      settings.advancedMode ?
        `${advancedStyles.columnBg} ${advancedStyles.columnBorder} ${advancedStyles.columnShadow} rounded-lg overflow-hidden` :
        ''
    }`}>
      <h3 className={`bg-gradient-to-r ${dayGradient} text-white font-medium tracking-wide`}>
        {formatDayName(day)}
      </h3>

      <div className={`mb-4 px-4 pt-4 ${settings.advancedMode ? advancedStyles.text : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${settings.advancedMode ? advancedStyles.mutedText : 'text-gray-700'}`}>
            Progress
          </span>
          <span className={`text-sm font-medium ${settings.advancedMode ? advancedStyles.mutedText : 'text-gray-700'}`}>
            {progress}%
          </span>
        </div>

        <div className={`progress-bar ${settings.advancedMode ? advancedStyles.progressBg : ''} h-2.5`}>
          <div
            className={`progress-value bg-gradient-to-r ${dayGradient}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`task-list flex-1 overflow-auto px-4 pb-4 ${settings.advancedMode ? 'space-y-3 custom-scrollbar' : ''}`}>
        {tasks.length === 0 ? (
          <div className={`text-center p-6 border-2 border-dashed rounded-lg ${
            settings.advancedMode
              ? `${advancedStyles.emptyBorder} ${advancedStyles.emptyText}`
              : 'border-gray-200 text-gray-400'
          }`}>
            <p className="text-sm">No tasks for {formatDayName(day)}</p>
            <p className={`text-xs mt-1 ${settings.advancedMode ? advancedStyles.emptySubtext : 'text-gray-400'}`}>
              Add tasks using the form above
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TaskItem
                  task={task}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={toggleSelectTask}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
