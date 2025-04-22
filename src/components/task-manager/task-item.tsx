'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Task, SubTask } from '@/lib/types';
import { useTaskContext } from '@/context/task-context';
import { useProjectContext } from '@/context/project-context';
import { useAppSettings } from '@/context/app-settings-context';
import { usePomodoroContext } from '@/context/pomodoro-context';
import { FaTrash, FaEdit, FaRegCircle, FaRegCheckCircle, FaClock, FaPlus, FaList, FaCheckCircle } from 'react-icons/fa';
import EditTaskModal from './modals/edit-task-modal';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string, selected: boolean) => void;
}

export default function TaskItem({ task, isSelected, onSelect }: TaskItemProps) {
  const { toggleTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, setCurrentPomodoroTask } = useTaskContext();
  const { getProjectById } = useProjectContext();
  const { settings } = useAppSettings();
  const { timerType } = usePomodoroContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const project = task.projectId ? getProjectById(task.projectId) : null;
  const priorityClass = `priority-${task.priority}`;

  // Advanced mode styles with improved contrast
  const advancedStyles = settings.advancedMode ? {
    taskBg: 'bg-slate-800',
    taskHoverBg: 'hover:bg-slate-700',
    itemBorder: 'border-slate-700',
    text: 'text-white',
    mutedText: 'text-slate-200', // Improved from text-slate-300
    subtaskBg: 'bg-slate-700/80',
    buttonHover: {
      edit: 'hover:bg-blue-900/50 hover:text-blue-300',
      delete: 'hover:bg-red-900/50 hover:text-red-300',
      list: 'hover:bg-blue-900/50 hover:text-blue-300',
      pomodoro: 'hover:bg-purple-900/50 hover:text-purple-300'
    },
    priorityColors: {
      low: 'text-green-300 bg-green-900/40',
      medium: 'text-yellow-300 bg-yellow-900/40',
      high: 'text-red-300 bg-red-900/40'
    }
  } : {
    priorityColors: {
      low: 'text-blue-500 bg-blue-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-red-500 bg-red-50'
    }
  };

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect(task.id, checked);
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const handleSetCurrentPomodoro = () => {
    if (timerType === 'work') {
      setCurrentPomodoroTask(task.id);
    }
  };

  return (
    <>
      <div
        className={`task-item ${priorityClass} ${
          settings.advancedMode
            ? `${advancedStyles.taskBg} ${advancedStyles.taskHoverBg} ${advancedStyles.itemBorder} rounded-lg p-3 mb-3 shadow-md ${task.completed ? 'opacity-60' : ''}`
            : `${task.completed ? 'completed bg-gray-50' : ''}`
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelectChange}
          className={`mr-2 ${settings.advancedMode ? 'text-blue-400' : ''}`}
          aria-label="Select task for batch actions"
        />

        <div
          onClick={handleToggle}
          className="flex items-center cursor-pointer flex-1 py-1 min-w-0"
        >
          {task.completed ? (
            <FaRegCheckCircle className={`${settings.advancedMode ? 'text-green-400' : 'text-green-500'} mr-2 flex-shrink-0`} />
          ) : (
            <FaRegCircle className={`${settings.advancedMode ? 'text-gray-400' : 'text-gray-400'} mr-2 flex-shrink-0`} />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center flex-wrap gap-1">
                <span
                  className={`${task.completed ? 'line-through text-gray-400' : settings.advancedMode ? advancedStyles.text : 'text-gray-700'} break-words w-full`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {task.title}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${settings.advancedMode ? advancedStyles.priorityColors[task.priority] : advancedStyles.priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>

                  {settings.advancedMode && task.pomodoroEstimate && task.pomodoroEstimate > 0 && (
                    <span className="flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300">
                      <FaClock className="mr-1" />
                      {task.pomodorosCompleted || 0}/{task.pomodoroEstimate}
                    </span>
                  )}

                  {settings.advancedMode && project && (
                    <span
                      className="project-tag px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: `${project.color}30`, /* 30 is for opacity */
                        color: project.color.replace(')', ', 0.95)').replace('rgb', 'rgba')
                      }}
                    >
                      {project.name}
                    </span>
                  )}

                  {settings.advancedMode && task.currentPomodoroTask && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300">
                      Current Pomodoro
                    </span>
                  )}
                </div>
              </div>

              {/* Subtasks in advanced mode with improved styling */}
              {settings.advancedMode && task.subtasks && task.subtasks.length > 0 && (
                <div className="subtask-container mt-2 pl-1 border-l-2 border-slate-600">
                  {task.subtasks.map((subtask: SubTask) => (
                    <div key={subtask.id} className="flex items-center justify-between py-1 pl-2 text-sm">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubtask(task.id, subtask.id);
                        }}
                        className="flex items-center cursor-pointer overflow-hidden"
                      >
                        {subtask.completed ? (
                          <FaCheckCircle className="text-green-400 text-xs mr-2 flex-shrink-0" />
                        ) : (
                          <FaRegCircle className="text-gray-400 text-xs mr-2 flex-shrink-0" />
                        )}
                        <span className={`${subtask.completed ? 'line-through text-gray-500' : advancedStyles.mutedText} break-words`}
                          style={{ wordBreak: 'break-word' }}
                        >
                          {subtask.title}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSubtask(task.id, subtask.id);
                        }}
                        className="p-0 h-auto hover:bg-transparent hover:text-red-400 rounded-lg ml-2 flex-shrink-0"
                      >
                        <FaTrash className="text-red-400 text-xs" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`flex gap-1 transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-50'}`}>
          {settings.advancedMode && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddSubtask(!showAddSubtask);
                }}
                className={`p-1 h-auto ${settings.advancedMode ? `${advancedStyles.buttonHover.list} text-slate-300` : 'hover:bg-blue-50 hover:text-blue-600'} rounded-lg`}
                title="Add subtask"
              >
                <FaList />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetCurrentPomodoro();
                }}
                className={`p-1 h-auto ${
                  settings.advancedMode ?
                    `${advancedStyles.buttonHover.pomodoro} text-slate-300 ${task.currentPomodoroTask ? 'bg-purple-900/50 text-purple-300' : ''}` :
                    'hover:bg-purple-50 hover:text-purple-600'
                  } rounded-lg`}
                title="Set as current pomodoro task"
                disabled={timerType !== 'work'}
              >
                <FaClock />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(true);
            }}
            className={`p-1 h-auto ${settings.advancedMode ? `${advancedStyles.buttonHover.edit} text-slate-300` : 'hover:bg-blue-50 hover:text-blue-600'} rounded-lg`}
          >
            <FaEdit />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={`p-1 h-auto ${settings.advancedMode ? `${advancedStyles.buttonHover.delete} text-slate-300` : 'hover:bg-red-50 hover:text-red-600'} rounded-lg`}
          >
            <FaTrash />
          </Button>
        </div>
      </div>

      {/* Add subtask input - improved styling */}
      {settings.advancedMode && showAddSubtask && (
        <div className="subtask-container pl-6 py-2 mb-3 flex shadow-md bg-slate-700 rounded-lg">
          <Input
            placeholder="New subtask..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubtask();
            }}
            className="flex-1 text-sm h-8 bg-slate-600 border-slate-600 text-white focus:border-blue-500"
          />
          <Button
            onClick={handleAddSubtask}
            size="sm"
            className="ml-2 bg-blue-600 hover:bg-blue-700 h-8"
          >
            <FaPlus className="mr-1" /> Add
          </Button>
        </div>
      )}

      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
      />
    </>
  );
}
