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
import { FaTrash, FaEdit, FaRegCircle, FaRegCheckCircle, FaClock, FaPlus, FaList, FaCheckCircle, FaEllipsisV, FaRedo } from 'react-icons/fa';
import EditTaskModal from './modals/edit-task-modal';
import RepeatTaskModal from './modals/repeat-task-modal';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string, selected: boolean) => void;
}

export default function TaskItem({ task, isSelected, onSelect }: TaskItemProps) {
  const { toggleTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, editSubtask, setCurrentPomodoroTask } = useTaskContext();
  const { getProjectById } = useProjectContext();
  const { settings } = useAppSettings();
  const { timerType } = usePomodoroContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const [activeSubtaskMenu, setActiveSubtaskMenu] = useState<string | null>(null);
  const [subtaskEditMode, setSubtaskEditMode] = useState<string | null>(null);
  const [editedSubtaskTitle, setEditedSubtaskTitle] = useState('');
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const [showTaskMenu, setShowTaskMenu] = useState(false);

  const project = task.projectId ? getProjectById(task.projectId) : null;
  const priorityClass = `priority-${task.priority}`;

  // Advanced mode styles with improved contrast
  const advancedStyles = settings.advancedMode ? {
    taskBg: 'bg-slate-800',
    taskHoverBg: 'hover:bg-slate-700',
    itemBorder: 'border-slate-700',
    text: 'text-white',
    mutedText: 'text-white', // Changed from text-slate-200 to text-white for maximum contrast
    subtaskBg: 'bg-slate-600/80', // Changed from bg-slate-700/80 to bg-slate-600/80
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

  const handleEditSubtask = (subtaskId: string, currentTitle: string) => {
    setSubtaskEditMode(subtaskId);
    setEditedSubtaskTitle(currentTitle);
  };

  const saveSubtaskEdit = (subtaskId: string) => {
    if (editedSubtaskTitle.trim()) {
      editSubtask(task.id, subtaskId, editedSubtaskTitle);
      setSubtaskEditMode(null);
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
        onMouseLeave={() => {
          setIsHovering(false);
          setActiveSubtaskMenu(null);
          setShowTaskMenu(false);
        }}
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

              {settings.advancedMode && task.subtasks && task.subtasks.length > 0 && (
                <div className="subtask-container mt-2 pl-1 border-l-2 border-slate-600">
                  {task.subtasks.map((subtask: SubTask) => (
                    <div key={subtask.id} className={`flex items-center justify-between py-1 pl-2 text-sm ${advancedStyles.subtaskBg} rounded mb-1`}>
                      {subtaskEditMode === subtask.id ? (
                        <div className="flex items-center w-full pr-2">
                          <Input
                            value={editedSubtaskTitle}
                            onChange={(e) => setEditedSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveSubtaskEdit(subtask.id);
                              if (e.key === 'Escape') setSubtaskEditMode(null);
                            }}
                            className="text-sm h-7 bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                            autoFocus
                          />
                          <div className="flex ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveSubtaskEdit(subtask.id)}
                              className="p-0 h-auto bg-green-600/40 hover:bg-green-700/50 text-green-300 rounded-lg ml-1 flex-shrink-0 w-6 h-6 flex items-center justify-center"
                            >
                              <FaCheckCircle className="text-xs" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSubtaskEditMode(null)}
                              className="p-0 h-auto bg-red-600/40 hover:bg-red-700/50 text-red-300 rounded-lg ml-1 flex-shrink-0 w-6 h-6 flex items-center justify-center"
                            >
                              <FaTrash className="text-xs" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubtask(task.id, subtask.id);
                            }}
                            className="flex items-center cursor-pointer overflow-hidden max-w-[90%]"
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

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSubtaskMenu(activeSubtaskMenu === subtask.id ? null : subtask.id);
                              }}
                              className="p-0 h-auto hover:bg-slate-600 rounded-lg ml-2 flex-shrink-0 w-6 h-6 flex items-center justify-center"
                              aria-label="Subtask options"
                            >
                              <FaEllipsisV className="text-slate-300 text-xs" />
                            </Button>

                            {activeSubtaskMenu === subtask.id && (
                              <div className="absolute right-0 bottom-full mb-2 bg-slate-700 rounded-md shadow-lg z-[9999] p-1 border border-slate-600 min-w-24"
                                   style={{
                                     maxHeight: 'none',
                                     overflow: 'visible'
                                   }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubtask(subtask.id, subtask.title);
                                    setActiveSubtaskMenu(null);
                                  }}
                                  className="p-2 h-auto text-blue-300 hover:bg-slate-600 rounded-md flex items-center justify-between w-full"
                                >
                                  <FaEdit className="text-xs mr-2" />
                                  <span className="text-xs">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSubtask(task.id, subtask.id);
                                    setActiveSubtaskMenu(null);
                                  }}
                                  className="p-2 h-auto text-red-300 hover:bg-slate-600 rounded-md flex items-center justify-between w-full mt-1"
                                >
                                  <FaTrash className="text-xs mr-2" />
                                  <span className="text-xs">Delete</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task action buttons: Only Pomodoro button visible, rest in three-dot menu */}
        <div className={`flex gap-1 transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-50'}`}>
          {settings.advancedMode && (
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
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowTaskMenu(!showTaskMenu);
              }}
              className={`p-1 h-auto ${settings.advancedMode ? 'text-slate-300 hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-lg`}
              aria-label="Task actions"
            >
              <FaEllipsisV />
            </Button>

            {showTaskMenu && (
              <div
                className={`absolute right-0 bottom-full mb-2 ${
                  settings.advancedMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                } rounded-md shadow-lg z-[9999] p-1 border min-w-[140px]`}
                style={{
                  maxHeight: 'none',
                  overflow: 'visible'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {settings.advancedMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddSubtask(!showAddSubtask);
                      setShowTaskMenu(false);
                    }}
                    className={`p-2 h-auto ${
                      settings.advancedMode ? 'text-blue-300 hover:bg-slate-600' : 'text-blue-600 hover:bg-blue-50'
                    } rounded-md flex items-center justify-between w-full mb-1`}
                  >
                    <FaList className="text-xs mr-2" />
                    <span className="text-xs">Add Subtask</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRepeatModal(true);
                    setShowTaskMenu(false);
                  }}
                  className={`p-2 h-auto ${
                    settings.advancedMode ? 'text-green-300 hover:bg-slate-600' : 'text-green-600 hover:bg-green-50'
                  } rounded-md flex items-center justify-between w-full mb-1`}
                >
                  <FaRedo className="text-xs mr-2" />
                  <span className="text-xs">Repeat Task</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                    setShowTaskMenu(false);
                  }}
                  className={`p-2 h-auto ${
                    settings.advancedMode ? 'text-blue-300 hover:bg-slate-600' : 'text-blue-600 hover:bg-blue-50'
                  } rounded-md flex items-center justify-between w-full mb-1`}
                >
                  <FaEdit className="text-xs mr-2" />
                  <span className="text-xs">Edit Task</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowTaskMenu(false);
                  }}
                  className={`p-2 h-auto ${
                    settings.advancedMode ? 'text-red-300 hover:bg-slate-600' : 'text-red-600 hover:bg-red-50'
                  } rounded-md flex items-center justify-between w-full`}
                >
                  <FaTrash className="text-xs mr-2" />
                  <span className="text-xs">Delete Task</span>
                </Button>
              </div>
            )}
          </div>
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

      {/* Repeat Task Modal */}
      <RepeatTaskModal
        isOpen={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        taskIds={[task.id]} // Just this single task
        onTasksRepeated={() => {
          setShowRepeatModal(false);
        }}
      />
    </>
  );
}
