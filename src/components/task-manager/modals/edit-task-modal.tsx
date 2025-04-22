'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Task, DayOfWeek, Priority, SubTask } from '@/lib/types';
import { useTaskContext } from '@/context/task-context';
import { useProjectContext } from '@/context/project-context';
import { useAppSettings } from '@/context/app-settings-context';
import { FaCheck, FaTrash, FaPlus } from 'react-icons/fa';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
}: EditTaskModalProps) {
  const { editTask, addSubtask, toggleSubtask, deleteSubtask } = useTaskContext();
  const { projects } = useProjectContext();
  const { settings } = useAppSettings();

  const [title, setTitle] = useState<string>(task.title);
  const [day, setDay] = useState<DayOfWeek>(task.day);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [pomodoroEstimate, setPomodoroEstimate] = useState<number>(task.pomodoroEstimate || 0);
  const [projectId, setProjectId] = useState<string>(task.projectId || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDay(task.day);
    setPriority(task.priority);
    setPomodoroEstimate(task.pomodoroEstimate || 0);
    setProjectId(task.projectId || '');
  }, [task]);

  const handleSubmit = () => {
    const updates: Partial<Omit<Task, 'id'>> = {
      title,
      day,
      priority,
    };

    if (settings.advancedMode) {
      updates.pomodoroEstimate = pomodoroEstimate || undefined;
      updates.projectId = projectId || undefined;
    }

    editTask(task.id, updates);
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  // Define consistent styles for the advanced mode
  const advancedStyles = settings.advancedMode ? {
    background: 'bg-slate-800',
    text: 'text-white',
    border: 'border-slate-700',
    inputBg: 'bg-slate-700',
    inputBorder: 'border-slate-600',
    labelText: 'text-slate-200',  // Improved contrast from 300 to 200
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    subtaskBg: 'bg-slate-700/70',
    subtaskItem: 'bg-slate-800/90',
    subtaskText: 'text-slate-100',  // Improved contrast
    focusRing: 'focus:ring-blue-500',
  } : {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`sm:max-w-[600px] max-h-[90vh] overflow-hidden ${advancedStyles.background} ${advancedStyles.text} ${advancedStyles.border}`}
      >
        <DialogHeader>
          <DialogTitle className={settings.advancedMode ? 'text-white' : ''}>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="edit-task-title" className={`text-sm font-medium ${advancedStyles.labelText}`}>
              Task Title
            </label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full ${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="edit-task-day" className={`text-sm font-medium ${advancedStyles.labelText}`}>
                Day
              </label>
              <select
                id="edit-task-day"
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className={`p-2 rounded-md border focus:outline-none focus:ring-2 ${
                  settings.advancedMode
                    ? `${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} ${advancedStyles.focusRing}`
                    : 'border-gray-300 focus:ring-primary'
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
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-task-priority" className={`text-sm font-medium ${advancedStyles.labelText}`}>
                Priority
              </label>
              <select
                id="edit-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={`p-2 rounded-md border focus:outline-none focus:ring-2 ${
                  settings.advancedMode
                    ? `${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} ${advancedStyles.focusRing}`
                    : 'border-gray-300 focus:ring-primary'
                }`}
                style={settings.advancedMode ? { background: '#334155' /* slate-700 */ } : {}}
              >
                <option value="low" className={settings.advancedMode ? 'bg-slate-700 text-green-300' : ''}>Low priority</option>
                <option value="medium" className={settings.advancedMode ? 'bg-slate-700 text-yellow-300' : ''}>Medium priority</option>
                <option value="high" className={settings.advancedMode ? 'bg-slate-700 text-red-300' : ''}>High priority</option>
              </select>
            </div>
          </div>

          {settings.advancedMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-task-pomodoro" className={`text-sm font-medium ${advancedStyles.labelText}`}>
                    Pomodoro Estimate
                  </label>
                  <select
                    id="edit-task-pomodoro"
                    value={pomodoroEstimate}
                    onChange={(e) => setPomodoroEstimate(Number.parseInt(e.target.value))}
                    className={`p-2 rounded-md ${advancedStyles.inputBorder} ${advancedStyles.inputBg} ${advancedStyles.text} focus:outline-none focus:ring-2 ${advancedStyles.focusRing}`}
                    style={{ background: '#334155' /* slate-700 */ }}
                  >
                    <option value="0" className="bg-slate-700 text-white">None</option>
                    <option value="1" className="bg-slate-700 text-white">1 Pomodoro</option>
                    <option value="2" className="bg-slate-700 text-white">2 Pomodoros</option>
                    <option value="3" className="bg-slate-700 text-white">3 Pomodoros</option>
                    <option value="4" className="bg-slate-700 text-white">4 Pomodoros</option>
                    <option value="5" className="bg-slate-700 text-white">5 Pomodoros</option>
                    <option value="6" className="bg-slate-700 text-white">6 Pomodoros</option>
                    <option value="8" className="bg-slate-700 text-white">8 Pomodoros</option>
                    <option value="10" className="bg-slate-700 text-white">10 Pomodoros</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="edit-task-project" className={`text-sm font-medium ${advancedStyles.labelText}`}>
                    Project
                  </label>
                  <select
                    id="edit-task-project"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className={`p-2 rounded-md ${advancedStyles.inputBorder} ${advancedStyles.inputBg} ${advancedStyles.text} focus:outline-none focus:ring-2 ${advancedStyles.focusRing}`}
                    style={{ background: '#334155' /* slate-700 */ }}
                  >
                    <option value="" className="bg-slate-700 text-white">No Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id} className="bg-slate-700 text-white">
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtasks Management - Improved with fixed height and better styling */}
              <div className="mt-4">
                <label className={`text-sm font-medium ${advancedStyles.labelText} mb-2 block`}>
                  Subtasks
                </label>

                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className={`space-y-2 mb-4 max-h-[140px] overflow-y-auto p-2 ${advancedStyles.subtaskBg} rounded-md custom-scrollbar`}>
                    {task.subtasks.map((subtask: SubTask) => (
                      <div key={subtask.id} className={`flex items-center justify-between p-2 border ${advancedStyles.inputBorder} rounded ${advancedStyles.subtaskItem}`}>
                        <div className="flex items-center overflow-hidden">
                          <button
                            onClick={() => toggleSubtask(task.id, subtask.id)}
                            className={`min-w-5 h-5 rounded-full mr-2 ${
                              subtask.completed ? 'bg-green-600 text-white' : 'bg-slate-600'
                            } flex items-center justify-center flex-shrink-0`}
                            aria-label={subtask.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {subtask.completed && <FaCheck size={10} />}
                          </button>
                          <span className={`${subtask.completed ? 'line-through text-slate-400' : advancedStyles.subtaskText} truncate`}>
                            {subtask.title}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteSubtask(task.id, subtask.id)}
                          className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                          aria-label="Delete subtask"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm mb-4">No subtasks added yet</p>
                )}

                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a new subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask();
                    }}
                    className={`flex-1 ${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text}`}
                  />
                  <Button
                    onClick={handleAddSubtask}
                    className={`${advancedStyles.buttonBg} ${advancedStyles.buttonHover} flex-shrink-0`}
                  >
                    <FaPlus className="mr-1" /> Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className={settings.advancedMode ? `${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} hover:bg-slate-600` : ''}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={settings.advancedMode ? `${advancedStyles.buttonBg} ${advancedStyles.buttonHover}` : ''}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
