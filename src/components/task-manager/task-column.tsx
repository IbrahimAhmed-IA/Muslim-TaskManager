'use client';

import { useTaskContext } from '@/context/task-context';
import { useAppSettings } from '@/context/app-settings-context';
import type { DayOfWeek } from '@/lib/types';
import TaskItem from './task-item';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface TaskColumnProps {
  day: DayOfWeek;
  isCurrentDay?: boolean;
}

export default function TaskColumn({
  day,
  isCurrentDay = false,
}: TaskColumnProps) {
  const { getTasksByDay, getDayProgress, selectedTasks, toggleSelectTask } = useTaskContext();
  const { settings } = useAppSettings();

  const tasks = getTasksByDay(day);
  const progress = getDayProgress(day);
  const [message, setMessage] = useState<string | null>(null);

  // Track previous progress with ref to avoid showing toast on initial load
  const previousProgressRef = useRef(progress);

  // Handle progress messages and toast notifications
  useEffect(() => {
    // Only show messages when there are tasks
    if (tasks.length === 0) {
      setMessage(null);
      previousProgressRef.current = progress;
      return;
    }

    let newMessage = null;
    let title = '';

    if (progress === 100 && tasks.length > 0) {
      title = "✨ Achievement Unlocked! ✨";
      newMessage =
        "Congratulations! You've reached 100%! Incredible effort! Allah says:\n\"إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا\"\nNow, take a moment to thank Allah for guided you to complete your tasks.";
    } else if (progress >= 75 && previousProgressRef.current < 75) {
      title = "🌟 Almost There! 🌟";
      newMessage =
        "Great work! You're almost there—just a bit more to go. Always keep in mind:\n\"وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ\"";
    } else if (progress >= 50 && previousProgressRef.current < 50) {
      title = "🔆 Milestone Reached! 🔆";
      newMessage =
        "Good job! You've passed halfway! There's just a little left. Don't forget:\n\"وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ\"";
    }

    // Show toast notification when progress milestone is reached
    // (not on initial load, only when progress changes)
    if (
      newMessage &&
      previousProgressRef.current !== 0 &&
      ((progress >= 50 && previousProgressRef.current < 50) ||
        (progress >= 75 && previousProgressRef.current < 75) ||
        (progress === 100 && previousProgressRef.current < 100))
    ) {
      toast(title, {
        description: newMessage.split('\n').join(' '),
        duration: 6000,
        icon: progress === 100 ? '🎉' : progress >= 75 ? '🌟' : '🔆',
        position: 'top-center',
        className: settings.advancedMode ? 'bg-slate-800 text-white border-slate-600' : '',
      });
    }

    setMessage(newMessage);
    previousProgressRef.current = progress;
  }, [progress, tasks.length, settings.advancedMode]);

  // Format the day name to title case
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Advanced mode styles
  const advancedStyles = settings.advancedMode
    ? {
        columnBg: 'bg-slate-800',
        columnBorder: 'border border-slate-700',
        text: 'text-white',
        mutedText: 'text-slate-200',
        progressBg: 'bg-slate-700',
        emptyBorder: 'border-slate-700',
        emptyText: 'text-slate-400',
        emptySubtext: 'text-slate-500',
        columnShadow: 'shadow-md shadow-slate-900/20',
        currentDayBorder: 'border-blue-500 border-2',
      }
    : {
        currentDayBorder: 'border-blue-500 border-2',
      };

  // Get gradient color based on day
  const getDayGradient = (day: DayOfWeek) => {
    if (settings.advancedMode) {
      const gradients = {
        saturday: 'from-indigo-900 to-purple-900',
        sunday: 'from-blue-900 to-indigo-900',
        monday: 'from-sky-900 to-blue-900',
        tuesday: 'from-teal-900 to-cyan-900',
        wednesday: 'from-emerald-900 to-green-900',
        thursday: 'from-orange-900 to-amber-900',
        friday: 'from-rose-900 to-red-900',
      };
      return gradients[day] || 'from-indigo-900 to-purple-900';
    }

    const gradients = {
      saturday: 'from-indigo-600 to-purple-600',
      sunday: 'from-blue-600 to-indigo-600',
      monday: 'from-sky-500 to-blue-600',
      tuesday: 'from-teal-500 to-cyan-500',
      wednesday: 'from-emerald-500 to-green-600',
      thursday: 'from-orange-500 to-amber-500',
      friday: 'from-rose-500 to-red-600',
    };
    return gradients[day] || 'from-indigo-600 to-purple-600';
  };

  const dayGradient = getDayGradient(day);

  return (
    <div
      className={`day-column h-full flex flex-col ${
        settings.advancedMode
          ? `${advancedStyles.columnBg} ${advancedStyles.columnBorder} ${advancedStyles.columnShadow} rounded-lg overflow-hidden`
          : ''
      } ${isCurrentDay ? advancedStyles.currentDayBorder : ''}`}
    >
      <h3
        className={`bg-gradient-to-r ${dayGradient} text-white font-medium tracking-wide ${
          isCurrentDay ? 'font-bold text-lg py-2' : ''
        }`}
      >
        {formatDayName(day)}
        {isCurrentDay && (
          <span className="ml-2 text-sm font-normal bg-white/20 px-2 py-0.5 rounded-full">
            Today
          </span>
        )}
      </h3>

      <div className={`mb-4 px-4 pt-4 ${settings.advancedMode ? advancedStyles.text : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <span
            className={`text-sm font-medium ${
              settings.advancedMode ? advancedStyles.mutedText : 'text-gray-700'
            }`}
          >
            Progress
          </span>
          <span
            className={`text-sm font-medium ${
              settings.advancedMode ? advancedStyles.mutedText : 'text-gray-700'
            }`}
          >
            {progress}%
          </span>
        </div>

        <div className={`progress-bar ${settings.advancedMode ? advancedStyles.progressBg : ''} h-2.5`}>
          <div
            className={`progress-value bg-gradient-to-r ${dayGradient}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Motivational message based on progress */}
        {message && (
          <div
            className={`mt-3 p-3 text-sm rounded-lg ${
              settings.advancedMode
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-600 shadow-lg'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-100 shadow-md'
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`text-center mb-1 font-medium ${
                  settings.advancedMode ? 'text-blue-300' : 'text-blue-600'
                }`}
              >
                {progress === 100
                  ? '✨ Achievement Unlocked! ✨'
                  : progress >= 75
                  ? '🌟 Almost There! 🌟'
                  : '🔆 Milestone Reached! 🔆'}
              </div>
              <p className="whitespace-pre-line text-center">
                {message.split('\n').map((line, index) => (
                  <span
                    key={index}
                    className={`block ${
                      line.includes('إِنَّ الَّذِينَ') ||
                      line.includes('وَأَنَّ سَعْيَهُ') ||
                      line.includes('وَقُلِ اعْمَلُوا')
                        ? `my-1.5 text-base font-medium ${
                            settings.advancedMode ? 'text-emerald-300' : 'text-emerald-600'
                          }`
                        : ''
                    }`}
                  >
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={`task-list flex-1 overflow-visible px-4 pb-4 ${
          settings.advancedMode ? 'space-y-3 custom-scrollbar' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div
            className={`text-center p-6 border-2 border-dashed rounded-lg ${
              settings.advancedMode
                ? `${advancedStyles.emptyBorder} ${advancedStyles.emptyText}`
                : 'border-gray-200 text-gray-400'
            }`}
          >
            <p className="text-sm">No tasks for {formatDayName(day)}</p>
            <p
              className={`text-xs mt-1 ${
                settings.advancedMode ? advancedStyles.emptySubtext : 'text-gray-400'
              }`}
            >
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
