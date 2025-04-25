'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DayOfWeek, Priority } from '@/lib/types';
import { useTaskContext } from '@/context/task-context';
import { useProjectContext } from '@/context/project-context';
import { useAppSettings } from '@/context/app-settings-context';
import { FaPlus, FaRedo, FaCalendarAlt, FaFlag, FaClock, FaProjectDiagram } from 'react-icons/fa';
import RepeatTaskModal from './modals/repeat-task-modal';

export default function TaskInput() {
  const { addTask } = useTaskContext();
  const { projects } = useProjectContext();
  const { settings } = useAppSettings();

  const [title, setTitle] = useState<string>('');
  const [day, setDay] = useState<DayOfWeek>('saturday');
  const [priority, setPriority] = useState<Priority>('low');
  const [pomodoroEstimate, setPomodoroEstimate] = useState<number>(0);
  const [projectId, setProjectId] = useState<string>('');
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const handleAddTask = () => {
    if (title.trim()) {
      if (settings.advancedMode) {
        // In advanced mode, pass all parameters
        addTask(title, day, priority, pomodoroEstimate > 0 ? pomodoroEstimate : undefined, projectId || undefined);
      } else {
        // In basic mode, just pass the basic parameters
        addTask(title, day, priority);
      }
      setTitle('');
    }
  };

  // Define colors for priority selection
  const priorityColors = settings.advancedMode
    ? {
        low: 'bg-green-900/50 text-green-300 border-green-800',
        medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
        high: 'bg-red-900/50 text-red-300 border-red-800',
      }
    : {
        low: 'bg-blue-50 text-blue-600 border-blue-200',
        medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        high: 'bg-red-50 text-red-600 border-red-200',
      };

  // Get currently selected priority color
  const selectedPriorityColor = priorityColors[priority];

  return (
    <div className={`flex flex-col gap-4 ${
      settings.advancedMode
        ? 'bg-gradient-to-b from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 shadow-md'
        : ''
    }`}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTask();
            }
          }}
          className={`md:flex-1 py-6 pl-4 pr-4 text-base shadow-sm rounded-lg transition-all duration-200 ${
            settings.advancedMode
              ? 'bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/30'
              : 'border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Day Selection with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <FaCalendarAlt />
          </div>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border shadow-sm focus:outline-none capitalize appearance-none ${
              settings.advancedMode
                ? 'bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                : 'bg-white border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            }`}
          >
            {['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((dayOption) => (
              <option key={dayOption} value={dayOption} className={settings.advancedMode ? 'bg-slate-800 text-white' : ''}>
                {dayOption.charAt(0).toUpperCase() + dayOption.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Priority Selection with icon and custom styling based on selection */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <FaFlag />
          </div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border shadow-sm focus:outline-none appearance-none ${selectedPriorityColor}`}
          >
            <option value="low" className={settings.advancedMode ? 'bg-slate-800 text-green-300' : 'bg-white text-blue-600'}>
              Low priority
            </option>
            <option value="medium" className={settings.advancedMode ? 'bg-slate-800 text-yellow-300' : 'bg-white text-yellow-600'}>
              Medium priority
            </option>
            <option value="high" className={settings.advancedMode ? 'bg-slate-800 text-red-300' : 'bg-white text-red-600'}>
              High priority
            </option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Advanced Mode - Pomodoro and Project selection */}
        {settings.advancedMode && (
          <>
            {/* Pomodoro Estimate Selection */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                <FaClock />
              </div>
              <select
                value={pomodoroEstimate}
                onChange={(e) => setPomodoroEstimate(Number.parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-slate-800 text-white appearance-none"
              >
                <option value="0" className="bg-slate-800 text-white">
                  Pomodoros: None
                </option>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num} className="bg-slate-800 text-white">
                    {num} {num === 1 ? 'Pomodoro' : 'Pomodoros'}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Project Selection */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                <FaProjectDiagram />
              </div>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-slate-800 text-white appearance-none"
              >
                <option value="" className="bg-slate-800 text-white">
                  No Project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id} className="bg-slate-800 text-white">
                    {project.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Add Task Button */}
        <Button
          onClick={handleAddTask}
          className={`h-full py-2.5 transition-all ${
            settings.advancedMode
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <FaPlus className="mr-2" /> Add Task
        </Button>

        {/* Repeat Button */}
        <Button
          onClick={() => setShowRepeatModal(true)}
          className={`h-full py-2.5 transition-all ${
            settings.advancedMode
              ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <FaRedo className="mr-2" /> Repeat
        </Button>
      </div>

      {/* Repeat Task Modal */}
      <RepeatTaskModal
        isOpen={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        taskIds={[]} // Empty array for general repeat button
        onTasksRepeated={() => {
          setShowRepeatModal(false);
        }}
      />
    </div>
  );
}
