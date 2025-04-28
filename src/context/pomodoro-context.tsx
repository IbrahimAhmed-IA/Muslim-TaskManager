import {
  type PomodoroSettings,
  getPomodoroCount,
  getPomodoroSettings,
  getTimerState,
  savePomodoroCount,
  savePomodoroSettings,
  saveTimerState,
} from "@/lib/storage";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type TimerType = "work" | "shortBreak" | "longBreak";

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
    throw new Error(
      "usePomodoroContext must be used within a PomodoroProvider",
    );
  }
  return context;
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<PomodoroSettings>(
    getPomodoroSettings(),
  );
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);

  // Load timer state from localStorage
  const savedTimerState = useRef(
    typeof window !== "undefined" ? getTimerState() : null,
  );

  // Initialize state from saved timer state or defaults
  const [timerType, setTimerType] = useState<TimerType>(
    savedTimerState.current?.timerType || "work",
  );
  const [timeLeft, setTimeLeft] = useState(
    savedTimerState.current?.timeLeft || settings.workDuration * 60,
  );
  const [isRunning, setIsRunning] = useState(
    savedTimerState.current?.isRunning || false,
  );
  const [completedPomodoros, setCompletedPomodoros] = useState(
    savedTimerState.current?.completedPomodoros || 0,
  );

  // Store the end time of the timer to calculate time left accurately
  const endTimeRef = useRef<number | null>(
    savedTimerState.current?.isRunning && savedTimerState.current?.endTime
      ? savedTimerState.current.endTime
      : null,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pomodoroCompleteCallbackRef = useRef<(() => void) | null>(null);

  // Load pomodoro count from localStorage on initial render
  useEffect(() => {
    setPomodoroCount(getPomodoroCount());
  }, []);

  // Initialize timer based on the selected type
  const initializeTimer = useCallback(
    (type: TimerType) => {
      switch (type) {
        case "work":
          setTimeLeft(settings.workDuration * 60);
          break;
        case "shortBreak":
          setTimeLeft(settings.shortBreakDuration * 60);
          break;
        case "longBreak":
          setTimeLeft(settings.longBreakDuration * 60);
          break;
      }
      // Reset the end time reference when initializing
      endTimeRef.current = null;

      // Save the new timer state
      saveTimerState({
        isRunning: false,
        timerType: type,
        timeLeft:
          type === "work"
            ? settings.workDuration * 60
            : type === "shortBreak"
              ? settings.shortBreakDuration * 60
              : settings.longBreakDuration * 60,
        completedPomodoros,
        endTime: null,
      });
    },
    [settings, completedPomodoros],
  );

  // Initialize timer when settings or timer type changes
  useEffect(() => {
    // Only initialize if there's no saved timer state or if timer type changes
    if (
      !savedTimerState.current ||
      savedTimerState.current.timerType !== timerType
    ) {
      initializeTimer(timerType);
    }
    // Clear the saved state reference after initial use
    savedTimerState.current = null;
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
          const newTimeLeft = Math.max(
            0,
            Math.round((endTimeRef.current - now) / 1000),
          );
          setTimeLeft(newTimeLeft);

          // Save timer state every 5 seconds to avoid excessive writes
          if (newTimeLeft % 5 === 0) {
            saveTimerState({
              isRunning,
              timerType,
              timeLeft: newTimeLeft,
              completedPomodoros,
              endTime: endTimeRef.current,
            });
          }
        }
      }, 200); // Update more frequently for better accuracy
    } else if (timerRef.current) {
      clearInterval(timerRef.current);

      // Save state when timer is paused
      saveTimerState({
        isRunning: false,
        timerType,
        timeLeft,
        completedPomodoros,
        endTime: null,
      });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, timerType, completedPomodoros]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      // Stop the timer
      setIsRunning(false);
      endTimeRef.current = null;

      // Play appropriate notification
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(
          timerType === "work"
            ? "Pomodoro completed! Take a break"
            : "Break is over! Time to work",
        );
      }

      // Handle different timer completions
      if (timerType === "work") {
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);
        incrementPomodoroCount(); // Increment the pomodoro count

        // Call the pomodoro complete callback if it exists
        if (pomodoroCompleteCallbackRef.current) {
          pomodoroCompleteCallbackRef.current();
        }

        // Determine if we should take a long break
        const shouldTakeLongBreak =
          newCompletedPomodoros % settings.longBreakInterval === 0;
        const nextTimerType = shouldTakeLongBreak ? "longBreak" : "shortBreak";

        toast.success("Pomodoro completed! Time for a break");
        setTimerType(nextTimerType);

        // Save state on timer completion
        saveTimerState({
          isRunning: false,
          timerType: nextTimerType,
          timeLeft: shouldTakeLongBreak
            ? settings.longBreakDuration * 60
            : settings.shortBreakDuration * 60,
          completedPomodoros: newCompletedPomodoros,
          endTime: null,
        });

        // Auto-start break if enabled
        if (settings.autoStartBreaks) {
          setTimeout(() => {
            setIsRunning(true);
          }, 500);
        }
      } else {
        toast.success("Break completed! Time to focus");
        setTimerType("work");

        // Save state on timer completion
        saveTimerState({
          isRunning: false,
          timerType: "work",
          timeLeft: settings.workDuration * 60,
          completedPomodoros,
          endTime: null,
        });

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

      // Save state when starting timer
      saveTimerState({
        isRunning: true,
        timerType,
        timeLeft,
        completedPomodoros,
        endTime: endTimeRef.current,
      });
    }
    setIsRunning(true);
  };

  // Pause the timer
  const pauseTimer = () => {
    setIsRunning(false);
    // Remember the current time left when paused
    endTimeRef.current = null;

    // Save state when pausing timer
    saveTimerState({
      isRunning: false,
      timerType,
      timeLeft,
      completedPomodoros,
      endTime: null,
    });
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

    let nextType: TimerType;
    if (timerType === "work") {
      nextType =
        completedPomodoros % settings.longBreakInterval ===
        settings.longBreakInterval - 1
          ? "longBreak"
          : "shortBreak";
    } else {
      nextType = "work";
    }

    setTimerType(nextType);

    // Save state when skipping timer
    saveTimerState({
      isRunning: false,
      timerType: nextType,
      timeLeft:
        nextType === "work"
          ? settings.workDuration * 60
          : nextType === "shortBreak"
            ? settings.shortBreakDuration * 60
            : settings.longBreakDuration * 60,
      completedPomodoros,
      endTime: null,
    });
  };

  // Change timer type
  const changeTimerType = (type: TimerType) => {
    setIsRunning(false);
    endTimeRef.current = null;
    setTimerType(type);

    // Save state when changing timer type
    saveTimerState({
      isRunning: false,
      timerType: type,
      timeLeft:
        type === "work"
          ? settings.workDuration * 60
          : type === "shortBreak"
            ? settings.shortBreakDuration * 60
            : settings.longBreakDuration * 60,
      completedPomodoros,
      endTime: null,
    });
  };

  // Update settings
  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      savePomodoroSettings(updated);
      return updated;
    });

    toast.success("Settings updated");

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
