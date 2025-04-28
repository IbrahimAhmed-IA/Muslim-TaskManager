'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

export type WidgetType =
  | 'tasks'
  | 'pomodoro'
  | 'projects'
  | 'azanTimes'
  | 'notes'
  | 'progress';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  order: number;
  visible: boolean;
}

interface WidgetTypeConfig {
  id: string;
  type: WidgetType;
  title: string;
  defaultSize: WidgetSize;
}

interface WidgetContextType {
  widgets: Widget[];
  availableWidgets: Widget[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetSize: (id: string, size: WidgetSize) => void;
  toggleWidgetSize: (id: string) => void;
  moveWidgetUp: (id: string) => void;
  moveWidgetDown: (id: string) => void;
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
}

// Define widget types and their configurations
const widgetTypes: Record<WidgetType, WidgetTypeConfig> = {
  tasks: {
    id: 'tasks',
    type: 'tasks',
    title: 'Task Manager',
    defaultSize: 'full',
  },
  pomodoro: {
    id: 'pomodoro',
    type: 'pomodoro',
    title: 'Pomodoro Timer',
    defaultSize: 'medium',
  },
  projects: {
    id: 'projects',
    type: 'projects',
    title: 'Projects',
    defaultSize: 'medium',
  },
  azanTimes: {
    id: 'azanTimes',
    type: 'azanTimes',
    title: 'Azan Times',
    defaultSize: 'medium',
  },
  notes: {
    id: 'notes',
    type: 'notes',
    title: 'Quick Notes',
    defaultSize: 'medium',
  },
  progress: {
    id: 'progress',
    type: 'progress',
    title: 'Progress',
    defaultSize: 'small',
  },
};

// Create the context
const WidgetLayoutContext = createContext<WidgetContextType | undefined>(
  undefined,
);

export function WidgetLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // State for widgets configuration
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    if (typeof window !== 'undefined') {
      const savedWidgets = localStorage.getItem('biome-widgets');
      if (savedWidgets) {
        try {
          return JSON.parse(savedWidgets);
        } catch (error) {
          console.error('Failed to parse saved widgets', error);
        }
      }
    }

    // Default widgets if none are saved
    return [
      {
        id: 'tasks',
        type: 'tasks',
        title: 'Task Manager',
        size: 'full',
        order: 0,
        visible: true,
      },
      {
        id: 'pomodoro',
        type: 'pomodoro',
        title: 'Pomodoro Timer',
        size: 'medium',
        order: 1,
        visible: true,
      },
      {
        id: 'notes',
        type: 'notes',
        title: 'Quick Notes',
        size: 'medium',
        order: 2,
        visible: true,
      },
      {
        id: 'progress',
        type: 'progress',
        title: 'Progress',
        size: 'small',
        order: 3,
        visible: true,
      },
    ];
  });

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('biome-widgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  // Calculate available widgets (not currently on dashboard)
  const availableWidgets = Object.values(widgetTypes).filter(
    (widgetType) => !widgets.some((w) => w.visible && w.type === widgetType.type),
  );

  // Add a widget to the dashboard
  const addWidget = (type: WidgetType) => {
    // Find the widget type configuration
    const widgetType = widgetTypes[type];
    if (!widgetType) return;

    // Check if the widget exists but is not visible
    const existingWidget = widgets.find((w) => w.type === type && !w.visible);
    if (existingWidget) {
      // Make the existing widget visible
      setWidgets(
        widgets.map((w) =>
          w.id === existingWidget.id ? { ...w, visible: true } : w,
        ),
      );
      return;
    }

    // Calculate highest order
    const highestOrder = widgets.reduce(
      (max, widget) => Math.max(max, widget.order),
      -1,
    );

    // Create a new widget with unique ID
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: widgetType.title,
      size: widgetType.defaultSize,
      order: highestOrder + 1,
      visible: true,
    };

    setWidgets([...widgets, newWidget]);
  };

  // Remove a widget from the dashboard
  const removeWidget = (id: string) => {
    // Don't allow removing the task manager
    if (id === 'tasks') return;

    // Hide the widget instead of removing it
    setWidgets(
      widgets.map((widget) =>
        widget.id === id ? { ...widget, visible: false } : widget,
      ),
    );
  };

  // Update a widget's size
  const updateWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets(
      widgets.map((widget) =>
        widget.id === id ? { ...widget, size } : widget,
      ),
    );
  };

  // Toggle a widget's size between medium and large
  const toggleWidgetSize = (id: string) => {
    setWidgets(
      widgets.map((widget) => {
        if (widget.id === id) {
          const newSize = widget.size === 'medium' || widget.size === 'small'
            ? 'large'
            : 'medium';
          return { ...widget, size: newSize };
        }
        return widget;
      }),
    );
  };

  // Move a widget up in order
  const moveWidgetUp = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    const aboveWidget = widgets
      .filter((w) => w.visible)
      .find((w) => w.order === widget.order - 1);
    if (!aboveWidget) return;

    setWidgets(
      widgets.map((w) => {
        if (w.id === id) return { ...w, order: w.order - 1 };
        if (w.id === aboveWidget.id) return { ...w, order: w.order + 1 };
        return w;
      }),
    );
  };

  // Move a widget down in order
  const moveWidgetDown = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    const belowWidget = widgets
      .filter((w) => w.visible)
      .find((w) => w.order === widget.order + 1);
    if (!belowWidget) return;

    setWidgets(
      widgets.map((w) => {
        if (w.id === id) return { ...w, order: w.order + 1 };
        if (w.id === belowWidget.id) return { ...w, order: w.order - 1 };
        return w;
      }),
    );
  };

  // Provide context value
  const value = {
    widgets,
    availableWidgets,
    addWidget,
    removeWidget,
    updateWidgetSize,
    toggleWidgetSize,
    moveWidgetUp,
    moveWidgetDown,
    setWidgets,
  };

  return (
    <WidgetLayoutContext.Provider value={value}>
      {children}
    </WidgetLayoutContext.Provider>
  );
}

export function useWidgetLayout() {
  const context = useContext(WidgetLayoutContext);
  if (context === undefined) {
    throw new Error('useWidgetLayout must be used within a WidgetLayoutProvider');
  }
  return context;
}
