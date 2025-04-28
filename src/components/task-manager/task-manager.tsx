"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppSettings } from "@/context/app-settings-context";
import { usePomodoroContext } from "@/context/pomodoro-context";
import { useTaskContext } from "@/context/task-context";
import type { DayOfWeek } from "@/lib/types";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaSort, FaUndoAlt } from "react-icons/fa";
import RepeatTaskModal from "./modals/repeat-task-modal";
import TaskColumn from "./task-column";
import TaskInput from "./task-input";

export default function TaskManager() {
  const {
    getOverallProgress,
    uncheckAllTasks,
    sortTasks,
    selectedTasks,
    setSelectedTasks,
    tasks,
    incrementTaskPomodoro,
  } = useTaskContext();

  const { settings } = useAppSettings();
  const { onPomodoroComplete } = usePomodoroContext();

  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const progressPercentage = getOverallProgress();

  useEffect(() => {
    if (!onPomodoroComplete) return;

    const handlePomodoroComplete = () => {
      const currentTask = tasks.find((task) => task.currentPomodoroTask);
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
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  const getCurrentDay = (): DayOfWeek => {
    const daysMap: Record<number, DayOfWeek> = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };
    const dayIndex = new Date().getDay();
    return daysMap[dayIndex];
  };

  const currentDay = getCurrentDay();

  const remainingDays = days.filter((day) => day !== currentDay);

  return (
    <div
      className={`task-manager w-full fade-in ${settings.advancedMode ? "text-white" : ""}`}
    >
      <div className="container mx-auto p-4">
        {/* Progress card with improved design */}
        <div
          className={`card p-6 mb-8 transition-all hover:shadow-md rounded-2xl ${
            settings.advancedMode
              ? "bg-slate-800/90 border-slate-700 backdrop-blur-sm"
              : "bg-white/90 backdrop-blur-sm shadow-lg"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center mr-4 shadow-lg transition-all ${
                  settings.advancedMode
                    ? progressPercentage >= 75
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-400/30"
                      : progressPercentage >= 50
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-400/30"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-400/30"
                    : progressPercentage >= 75
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-emerald-300/30"
                      : progressPercentage >= 50
                        ? "bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-blue-300/30"
                        : "bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-indigo-300/30"
                }`}
              >
                <span className="text-white font-bold text-lg">
                  {progressPercentage}%
                </span>
              </div>
              <div>
                <h2
                  className={`text-xl font-semibold ${settings.advancedMode ? "text-white" : "text-gray-800"}`}
                >
                  Today's Progress
                </h2>
                <p
                  className={
                    settings.advancedMode
                      ? "text-slate-300 text-sm"
                      : "text-gray-500 text-sm"
                  }
                >
                  {progressPercentage >= 75
                    ? "Amazing work, almost there!"
                    : progressPercentage >= 50
                      ? "Keep going, you're on track!"
                      : "Focus on your tasks today"}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-4/5">
              <Progress
                value={progressPercentage}
                className={`h-4 w-full rounded-full ${
                  settings.advancedMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              />
            </div>
          </div>

          {/* Task input section with improved styling */}
          <div
            className={`${
              settings.advancedMode
                ? "bg-slate-900/80 border border-slate-700/70"
                : "bg-gray-50/90 border border-gray-100"
            } p-5 rounded-xl mb-6 shadow-sm`}
          >
            <h3
              className={`text-lg font-medium mb-4 ${settings.advancedMode ? "text-slate-200" : "text-gray-700"}`}
            >
              Add New Task
            </h3>
            <TaskInput />
          </div>

          {/* Buttons with improved styling and icons */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleUncheckAllTasks}
                className={`btn-primary py-5 flex items-center justify-center gap-2 ${
                  settings.advancedMode
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                    : "shadow-md"
                }`}
              >
                <FaUndoAlt className="mr-1" /> Uncheck All Tasks
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleRepeatTasks}
                  disabled={selectedTasks.length === 0}
                  className={`btn-primary py-5 flex items-center justify-center gap-2 ${
                    settings.advancedMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-400 shadow-md"
                      : "shadow-md"
                  }`}
                >
                  <FaCheckCircle className="mr-1" /> Repeat ({selectedTasks.length})
                </Button>

                <Button
                  onClick={sortTasks}
                  className={`py-5 flex items-center justify-center gap-2 shadow-md ${
                    settings.advancedMode
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white"
                  }`}
                >
                  <FaSort className="mr-1" /> Sort & Organize
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Day columns with improved styling */}
        <div className="grid grid-cols-1 gap-8">
          <div key={currentDay} className="slide-up">
            <div className="mb-2">
              <span
                className={`font-medium text-lg ${settings.advancedMode ? "text-white" : "text-gray-700"}`}
              >
                Today
              </span>
              <span
                className={`${settings.advancedMode ? "text-blue-300" : "text-blue-600"} ml-2 font-medium capitalize`}
              >
                ({currentDay})
              </span>
            </div>
            <TaskColumn day={currentDay} isCurrentDay={true} />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <h3 className={`text-lg font-medium mb-4 ${settings.advancedMode ? "text-slate-300" : "text-gray-700"}`}>
              Upcoming Days
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {remainingDays.map((day, index) => (
                <div
                  key={day}
                  className="slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
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
