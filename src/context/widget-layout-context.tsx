import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

// Define widget types that can be added to the layout
export type WidgetType =
  | 'tasks'
  | 'pomodoro'
  | 'projects'
  | 'azanTimes'
  | 'notes'
  | 'progress';

// Interface for a widget in the layout
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'medium' | 'large' | 'full'; // Removed 'small' from the size options
  order: number;
  visible: boolean;
}

// Widget layout context type
interface WidgetLayoutContextType {
  widgets: Widget[];
  availableWidgets: Widget[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetOrder: (id: string, newOrder: number) => void;
  updateWidgetSize: (id: string, size: Widget['size']) => void;
  updateWidgetVisibility: (id: string, visible: boolean) => void;
  moveWidgetUp: (id: string) => void;
  moveWidgetDown: (id: string) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  resetToDefaultLayout: () => void;
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
}

// Constants for storage
const WIDGET_LAYOUT_STORAGE_KEY = 'muslim_task_manager_widget_layout';

// Default widgets
export const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'progress-widget',
    type: 'progress',
    title: 'Progress Overview',
    size: 'medium', // Changed from 'small' to 'medium'
    order: 0,
    visible: true
  },
  {
    id: 'tasks-widget',
    type: 'tasks',
    title: 'Task Manager',
    size: 'full',
    order: 1,
    visible: true
  },
  {
    id: 'projects-widget',
    type: 'projects',
    title: 'Projects',
    size: 'medium',
    order: 2,
    visible: true
  },
  {
    id: 'pomodoro-widget',
    type: 'pomodoro',
    title: 'Pomodoro Timer',
    size: 'medium', // Changed from 'small' to 'medium'
    order: 3,
    visible: false
  },
  {
    id: 'azanTimes-widget',
    type: 'azanTimes',
    title: 'Azan Times',
    size: 'medium', // Changed from 'small' to 'medium'
    order: 4,
    visible: false
  },
  {
    id: 'notes-widget',
    type: 'notes',
    title: 'Notes',
    size: 'medium',
    order: 5,
    visible: false
  }
];

// Helper function to get widgets from localStorage
const getWidgetLayout = (): Widget[] => {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;

  const layoutJson = localStorage.getItem(WIDGET_LAYOUT_STORAGE_KEY);
  if (!layoutJson) return DEFAULT_WIDGETS;

  try {
    // Get stored widgets
    const storedWidgets = JSON.parse(layoutJson);

    // Make sure all 'small' widgets are converted to 'medium'
    return storedWidgets.map((widget: Widget) => {
      if (widget.size === 'small') {
        return { ...widget, size: 'medium' };
      }
      return widget;
    });
  } catch (error) {
    console.error('Failed to parse widget layout from localStorage', error);
    return DEFAULT_WIDGETS;
  }
};

// Helper function to save widgets to localStorage
const saveWidgetLayout = (widgets: Widget[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(widgets));
};

// Create the context
const WidgetLayoutContext = createContext<WidgetLayoutContextType | null>(null);

// Hook to use the context
export const useWidgetLayout = () => {
  const context = useContext(WidgetLayoutContext);
  if (!context) {
    throw new Error('useWidgetLayout must be used within a WidgetLayoutProvider');
  }
  return context;
};

// Provider component
export const WidgetLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>(getWidgetLayout());

  // Calculate available widgets (those not currently visible in the layout)
  const availableWidgets = DEFAULT_WIDGETS.filter(defaultWidget =>
    !widgets.some(w => w.id === defaultWidget.id && w.visible)
  );

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    saveWidgetLayout(widgets);
  }, [widgets]);

  // Add a widget to the layout
  const addWidget = (type: WidgetType) => {
    // Find the widget in default widgets
    const widgetToAdd = DEFAULT_WIDGETS.find(w => w.type === type);
    if (!widgetToAdd) return;

    setWidgets(prev => {
      // If widget already exists in layout, just make it visible and preserve its size
      const existingWidgetIndex = prev.findIndex(w => w.id === widgetToAdd.id);
      if (existingWidgetIndex >= 0) {
        const newWidgets = [...prev];
        newWidgets[existingWidgetIndex] = {
          ...newWidgets[existingWidgetIndex],
          visible: true
        };
        return newWidgets;
      }

      // Otherwise add it to the end, preserving its default size
      const highestOrder = Math.max(-1, ...prev.filter(w => w.visible).map(w => w.order));
      return [
        ...prev,
        {
          ...widgetToAdd,
          order: highestOrder + 1,
          visible: true
        }
      ];
    });
  };

  // Remove a widget from the layout
  const removeWidget = (id: string) => {
    setWidgets(prev => {
      const widgetIndex = prev.findIndex(w => w.id === id);
      if (widgetIndex < 0) return prev;

      const newWidgets = [...prev];
      const removedWidgetOrder = newWidgets[widgetIndex].order;
      newWidgets[widgetIndex] = {
        ...newWidgets[widgetIndex],
        visible: false
      };

      // Reorder only visible widgets
      return newWidgets.map(w => {
        if (w.visible && w.order > removedWidgetOrder) {
          return { ...w, order: w.order - 1 };
        }
        return w;
      });
    });
  };

  // Update widget order
  const updateWidgetOrder = (id: string, newOrder: number) => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === id);
      if (!widget) return prev;

      const oldOrder = widget.order;
      if (oldOrder === newOrder) return prev;

      return prev.map(w => {
        if (w.id === id) {
          return { ...w, order: newOrder };
        }
        if (w.visible) {
          if (oldOrder < newOrder && w.order > oldOrder && w.order <= newOrder) {
            return { ...w, order: w.order - 1 };
          }
          if (oldOrder > newOrder && w.order >= newOrder && w.order < oldOrder) {
            return { ...w, order: w.order + 1 };
          }
        }
        return w;
      });
    });
  };

  // Update widget size
  const updateWidgetSize = (id: string, size: Widget['size']) => {
    setWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, size } : w)
    );
  };

  // Update widget visibility
  const updateWidgetVisibility = (id: string, visible: boolean) => {
    setWidgets(prev => {
      return prev.map(w => {
        if (w.id === id) {
          return { ...w, visible };
        }
        return w;
      });
    });
  };

  // Move a widget up in the order
  const moveWidgetUp = (id: string) => {
    setWidgets(prev => {
      // Find the current widget and ensure it's visible
      const widget = prev.find(w => w.id === id && w.visible);
      if (!widget) return prev;

      // If it's already at the top, don't do anything
      // Get all visible widgets sorted by order
      const visibleWidgets = prev.filter(w => w.visible).sort((a, b) => a.order - b.order);
      const widgetIndex = visibleWidgets.findIndex(w => w.id === id);
      if (widgetIndex <= 0) return prev;

      const widgetAbove = visibleWidgets[widgetIndex - 1];

      // Swap orders
      return prev.map(w => {
        if (w.id === id) {
          return { ...w, order: widgetAbove.order };
        }
        if (w.id === widgetAbove.id) {
          return { ...w, order: widget.order };
        }
        return w;
      });
    });
  };

  // Move a widget down in the order
  const moveWidgetDown = (id: string) => {
    setWidgets(prev => {
      // Find the current widget and ensure it's visible
      const widget = prev.find(w => w.id === id && w.visible);
      if (!widget) return prev;

      // Get all visible widgets sorted by order
      const visibleWidgets = prev.filter(w => w.visible).sort((a, b) => a.order - b.order);

      // Get the max order value
      const maxOrder = visibleWidgets.length - 1;

      // Find the index of the widget
      const widgetIndex = visibleWidgets.findIndex(w => w.id === id);
      // If it's already at the bottom, don't do anything
      if (widgetIndex < 0 || widgetIndex >= visibleWidgets.length - 1) return prev;

      const widgetBelow = visibleWidgets[widgetIndex + 1];

      // Swap orders
      return prev.map(w => {
        if (w.id === id) {
          return { ...w, order: widgetBelow.order };
        }
        if (w.id === widgetBelow.id) {
          return { ...w, order: widget.order };
        }
        return w;
      });
    });
  };

  // Reorder widgets using drag and drop
  const reorderWidgets = (startIndex: number, endIndex: number) => {
    setWidgets(prev => {
      // Only reorder visible widgets
      const visibleWidgets = prev.filter(w => w.visible).sort((a, b) => a.order - b.order);
      const allWidgets = [...prev];

      if (
        startIndex < 0 ||
        endIndex < 0 ||
        startIndex >= visibleWidgets.length ||
        endIndex >= visibleWidgets.length
      ) {
        return prev;
      }

      const [removed] = visibleWidgets.splice(startIndex, 1);
      visibleWidgets.splice(endIndex, 0, removed);

      // Update order property for visible widgets
      visibleWidgets.forEach((widget, idx) => {
        const indexInAll = allWidgets.findIndex(w => w.id === widget.id);
        allWidgets[indexInAll] = { ...allWidgets[indexInAll], order: idx };
      });

      return allWidgets;
    });
  };

  // Reset to default layout
  const resetToDefaultLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  return (
    <WidgetLayoutContext.Provider
      value={{
        widgets,
        availableWidgets,
        addWidget,
        removeWidget,
        updateWidgetOrder,
        updateWidgetSize,
        updateWidgetVisibility,
        moveWidgetUp,
        moveWidgetDown,
        reorderWidgets,
        resetToDefaultLayout,
        setWidgets
      }}
    >
      {children}
    </WidgetLayoutContext.Provider>
  );
};
