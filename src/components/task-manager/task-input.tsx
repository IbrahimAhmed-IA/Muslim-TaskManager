'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DayOfWeek, Priority } from '@/lib/types';
import { useTaskContext } from '@/context/task-context';
import { useProjectContext } from '@/context/project-context';
import { useAppSettings } from '@/context/app-settings-context';
import { FaPlus } from 'react-icons/fa';

export default function TaskInput() {
  const { addTask } = useTaskContext();
  const { projects } = useProjectContext();
  const { settings } = useAppSettings();

  const [title, setTitle] = useState<string>('');
  const [day, setDay] = useState<DayOfWeek>('saturday');
  const [priority, setPriority] = useState<Priority>('low');
  const [pomodoroEstimate, setPomodoroEstimate] = useState<number>(0);
  const [projectId, setProjectId] = useState<string>('');

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
  const priorityColors = settings.advancedMode ? {
    low: 'text-green-300',
    medium: 'text-yellow-300',
    high: 'text-red-300'
  } : {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  return (
    <div className={`flex flex-col gap-3 ${settings.advancedMode ? 'bg-slate-800 p-4 rounded-xl border border-slate-700' : ''}`}>
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
        className={`md:flex-1 py-6 shadow-sm border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg ${
          settings.advancedMode ? 'bg-slate-700 border-slate-600 text-white' : ''
        }`}
      />

      <div className="flex flex-col md:flex-row gap-3">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value as DayOfWeek)}
          className={`px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white capitalize ${
            settings.advancedMode ? 'bg-slate-700 border-slate-600 text-white' : ''
          }`}
          style={settings.advancedMode ? { background: '#334155' /* slate-700 */ } : {}}
        >
          <option value="saturday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Saturday</option>
          <option value="sunday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Sunday</option>
          <option value="monday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Monday</option>
          <option value="tuesday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Tuesday</option>
          <option value="wednesday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Wednesday</option>
          <option value="thursday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Thursday</option>
          <option value="friday" className={settings.advancedMode ? 'bg-slate-700 text-white' : ''}>Friday</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className={`px-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white font-medium ${
            settings.advancedMode ? 'bg-slate-700 border-slate-600 text-white' : ''
          }`}
          style={settings.advancedMode ? { background: '#334155' /* slate-700 */ } : {}}
        >
          <option value="low" className={`${priorityColors.low} ${settings.advancedMode ? 'bg-slate-700 text-white' : ''}`}>Low priority</option>
          <option value="medium" className={`${priorityColors.medium} ${settings.advancedMode ? 'bg-slate-700 text-white' : ''}`}>Medium priority</option>
          <option value="high" className={`${priorityColors.high} ${settings.advancedMode ? 'bg-slate-700 text-white' : ''}`}>High priority</option>
        </select>

        {settings.advancedMode && (
          <>
            <select
              value={pomodoroEstimate}
              onChange={(e) => setPomodoroEstimate(Number.parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg border border-slate-600 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-slate-700 text-white"
              style={{ background: '#334155' /* slate-700 */ }}
            >
              <option value="0" className="bg-slate-700 text-white">Pomodoros: None</option>
              <option value="1" className="bg-slate-700 text-white">1 Pomodoro</option>
              <option value="2" className="bg-slate-700 text-white">2 Pomodoros</option>
              <option value="3" className="bg-slate-700 text-white">3 Pomodoros</option>
              <option value="4" className="bg-slate-700 text-white">4 Pomodoros</option>
              <option value="5" className="bg-slate-700 text-white">5 Pomodoros</option>
              <option value="6" className="bg-slate-700 text-white">6 Pomodoros</option>
              <option value="8" className="bg-slate-700 text-white">8 Pomodoros</option>
              <option value="10" className="bg-slate-700 text-white">10 Pomodoros</option>
            </select>

            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-600 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-slate-700 text-white"
              style={{ background: '#334155' /* slate-700 */ }}
            >
              <option value="" className="bg-slate-700 text-white">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-slate-700 text-white">
                  {project.name}
                </option>
              ))}
            </select>
          </>
        )}

        <Button
          onClick={handleAddTask}
          className={`btn-primary py-6 px-6 ${
            settings.advancedMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : ''
          }`}
        >
          <FaPlus className="mr-2" /> Add Task
        </Button>
      </div>
    </div>
  );
}
