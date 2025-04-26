import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FaPlay, FaPause, FaRedo, FaForward } from 'react-icons/fa';
import { usePomodoroContext } from '@/context/pomodoro-context';

export default function PomodoroWidget() {
  const {
    isRunning,
    timeLeft,
    timerType,
    completedPomodoros,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
  } = usePomodoroContext();

  const [progress, setProgress] = useState(100);
  const [timerDisplay, setTimerDisplay] = useState('25:00');

  // Calculate progress and format time left
  useEffect(() => {
    // Calculate max time for current timer type
    let maxTime = 0;
    switch (timerType) {
      case 'work':
        maxTime = 25 * 60; // Default 25 minutes
        break;
      case 'shortBreak':
        maxTime = 5 * 60; // Default 5 minutes
        break;
      case 'longBreak':
        maxTime = 15 * 60; // Default 15 minutes
        break;
    }

    // Calculate progress percentage
    const progressPercentage = (timeLeft / maxTime) * 100;
    setProgress(progressPercentage);

    // Format time left as MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    setTimerDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [timeLeft, timerType]);

  // Get color for timer type
  const getTimerColor = () => {
    switch (timerType) {
      case 'work':
        return 'from-red-600 to-rose-600';
      case 'shortBreak':
        return 'from-green-600 to-teal-600';
      case 'longBreak':
        return 'from-blue-600 to-indigo-600';
      default:
        return 'from-gray-600 to-slate-600';
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Timer Type */}
      <div className="text-center mb-2">
        <span className="text-xs uppercase tracking-wider font-medium text-slate-400 py-1 px-3 rounded-full bg-slate-700">
          {timerType === 'work' ? 'Focus' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </span>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center my-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#374151"
              strokeWidth="8"
            />

            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`url(#${timerType}Gradient)`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="shortBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="longBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{timerDisplay}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2 mt-4">
        {/* Start/Pause Button */}
        <Button
          onClick={isRunning ? pauseTimer : startTimer}
          className={`h-10 w-10 rounded-full p-0 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          }`}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <FaPause size={14} /> : <FaPlay size={14} />}
        </Button>

        {/* Reset Button */}
        <Button
          onClick={resetTimer}
          className="h-10 w-10 rounded-full p-0 bg-slate-700 hover:bg-slate-600"
          title="Reset"
        >
          <FaRedo size={14} />
        </Button>

        {/* Skip Button */}
        <Button
          onClick={skipTimer}
          className="h-10 w-10 rounded-full p-0 bg-slate-700 hover:bg-slate-600"
          title="Skip"
        >
          <FaForward size={14} />
        </Button>
      </div>

      {/* Pomodoros Completed */}
      <div className="text-center mt-4">
        <span className="text-xs text-slate-400">Completed: {completedPomodoros}</span>
      </div>
    </div>
  );
}
