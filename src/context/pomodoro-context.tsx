import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { type PomodoroSettings, getPomodoroSettings, savePomodoroSettings, getPomodoroCount, savePomodoroCount } from '@/lib/storage';

type TimerType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroContextType {
  isRunning: boolean;
  timerType: TimerType;
  timeLeft: number;
  completedPomodoros: number;
  settings: PomodoroSettings;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  changeTimerType: (type: TimerType) => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  pomodoroCount: number;
  incrementPomodoroCount: () => void;
  onPomodoroComplete?: (callback: () => void) => void;
}

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PomodoroSettings>(getPomodoroSettings());
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);

  // Store the end time of the timer to calculate time left accurately
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pomodoroCompleteCallbackRef = useRef<(() => void) | null>(null);

  // Load pomodoro count from localStorage on initial render
  useEffect(() => {
    setPomodoroCount(getPomodoroCount());
  }, []);

  // Initialize timer based on the selected type
  const initializeTimer = useCallback((type: TimerType) => {
    switch (type) {
      case 'work':
        setTimeLeft(settings.workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakDuration * 60);
        break;
    }
    // Reset the end time reference when initializing
    endTimeRef.current = null;
  }, [settings]);

  // Initialize timer when settings or timer type changes
  useEffect(() => {
    initializeTimer(timerType);
  }, [timerType, initializeTimer]);

  // Start/stop timer based on isRunning state
  useEffect(() => {
    if (isRunning) {
      // Calculate and set the end time when starting the timer
      if (endTimeRef.current === null) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        if (endTimeRef.current !== null) {
          const newTimeLeft = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
          setTimeLeft(newTimeLeft);
        }
      }, 200); // Update more frequently for better accuracy
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      // Stop the timer
      setIsRunning(false);
      endTimeRef.current = null;

      // Play appropriate notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          timerType === 'work'
            ? 'Pomodoro completed! Take a break'
            : 'Break is over! Time to work'
        );
      }

      // Handle different timer completions
      if (timerType === 'work') {
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);
        incrementPomodoroCount(); // Increment the pomodoro count

        // Call the pomodoro complete callback if it exists
        if (pomodoroCompleteCallbackRef.current) {
          pomodoroCompleteCallbackRef.current();
        }

        // Determine if we should take a long break
        const shouldTakeLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
        const nextTimerType = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';

        toast.success('Pomodoro completed! Time for a break');
        setTimerType(nextTimerType);

        // Auto-start break if enabled
        if (settings.autoStartBreaks) {
          setTimeout(() => {
            setIsRunning(true);
          }, 500);
        }
      } else {
        toast.success('Break completed! Time to focus');
        setTimerType('work');

        // Auto-start pomodoro if enabled
        if (settings.autoStartPomodoros) {
          setTimeout(() => {
            setIsRunning(true);
          }, 500);
        }
      }
    }
  }, [timeLeft, isRunning, timerType, settings, completedPomodoros]);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = getPomodoroSettings();
    setSettings(savedSettings);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    savePomodoroSettings(settings);
  }, [settings]);

  // Start the timer
  const startTimer = () => {
    // Calculate the end time when starting the timer
    if (!isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
    setIsRunning(true);
  };

  // Pause the timer
  const pauseTimer = () => {
    setIsRunning(false);
    // Remember the current time left when paused
    endTimeRef.current = null;
  };

  // Reset the current timer
  const resetTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    initializeTimer(timerType);
  };

  // Skip to next timer
  const skipTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;

    if (timerType === 'work') {
      const nextType = completedPomodoros % settings.longBreakInterval === settings.longBreakInterval - 1
        ? 'longBreak'
        : 'shortBreak';

      setTimerType(nextType);
    } else {
      setTimerType('work');
    }
  };

  // Change timer type
  const changeTimerType = (type: TimerType) => {
    setIsRunning(false);
    endTimeRef.current = null;
    setTimerType(type);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      savePomodoroSettings(updated);
      return updated;
    });

    toast.success('Settings updated');

    // Reinitialize the current timer with new duration
    setIsRunning(false);
    endTimeRef.current = null;
    setTimeout(() => initializeTimer(timerType), 0);
  };

  // Increment pomodoro count
  const incrementPomodoroCount = () => {
    const newCount = pomodoroCount + 1;
    setPomodoroCount(newCount);
    savePomodoroCount(newCount);
  };

  // Register a callback to be called when a pomodoro is completed
  const onPomodoroComplete = (callback: () => void) => {
    pomodoroCompleteCallbackRef.current = callback;
  };

  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        timerType,
        timeLeft,
        completedPomodoros,
        settings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        changeTimerType,
        updateSettings,
        pomodoroCount,
        incrementPomodoroCount,
        onPomodoroComplete,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};
