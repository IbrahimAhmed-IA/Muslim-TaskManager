import AzanTimes from "@/components/azan/azan-times";
import ProjectManager from "@/components/task-manager/project-manager";
import TaskManager from "@/components/task-manager/task-manager";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppSettings } from "@/context/app-settings-context";
import { useTaskContext } from "@/context/task-context";
import { useWidgetLayout } from "@/context/widget-layout-context";
import type { Widget, WidgetType } from "@/context/widget-layout-context";
import { useState, useEffect, useMemo } from "react";
import { FaPlus, FaTimes, FaGripHorizontal } from "react-icons/fa";
import NotesWidget from "./notes-widget";
import PomodoroWidget from "./pomodoro-widget";
import WidgetContainer from "./widget-container";

export default function WidgetDashboard() {
  const { widgets, availableWidgets, addWidget, setWidgets } =
    useWidgetLayout();
  const { settings } = useAppSettings();
  const { getOverallProgress } = useTaskContext();
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [showAddWidgets, setShowAddWidgets] = useState(false);
  const [gridColumns, setGridColumns] = useState(2); // Default to 2 columns
  const [containerWidth, setContainerWidth] = useState(0);

  // Update grid columns based on screen width
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth - 80; // account for sidebar width
      setContainerWidth(width);
      if (width >= 1600) {
        setGridColumns(4); // 4 columns for very large screens
      } else if (width >= 1200) {
        setGridColumns(3); // 3 columns for large screens
      } else if (width >= 800) {
        setGridColumns(2); // 2 columns for medium screens
      } else {
        setGridColumns(1); // 1 column for small screens
      }
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  // Sort widgets by order and filter visible ones
  const sortedWidgets = [...widgets]
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  // Organize widgets into rows for smoother layout
  const organizedWidgets = useMemo(() => {
    const rows: Widget[][] = [];
    let currentRow: Widget[] = [];
    let currentRowWidth = 0;

    // Function to determine widget column span
    const getWidgetSpan = (widget: Widget): number => {
      if (widget.size === "large") return gridColumns;
      if (widget.size === "medium") return Math.min(2, gridColumns);
      return 1; // small widgets
    };

    // Arrange widgets in rows
    sortedWidgets.forEach(widget => {
      const widgetSpan = getWidgetSpan(widget);

      // If adding this widget would exceed the row width, start a new row
      if (currentRowWidth + widgetSpan > gridColumns && currentRow.length > 0) {
        rows.push([...currentRow]);
        currentRow = [];
        currentRowWidth = 0;
      }

      // Add widget to current row
      currentRow.push(widget);
      currentRowWidth += widgetSpan;
    });

    // Add any remaining widgets in the last row
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }, [sortedWidgets, gridColumns]);

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case "tasks":
        return <TaskManager />;
      case "pomodoro":
        return <PomodoroWidget />;
      case "projects":
        return <ProjectManager />;
      case "azanTimes":
        return <AzanTimes />;
      case "notes":
        return <NotesWidget />;
      case "progress":
        return (
          <div className="flex flex-col items-center">
            <div className={`text-3xl font-bold mb-3 ${settings.advancedMode ? "text-white" : "text-gray-800"}`}>
              {getOverallProgress()}%
            </div>
            <Progress
              value={getOverallProgress()}
              className={`h-4 w-full rounded-full ${settings.advancedMode ? "bg-slate-700/60" : "bg-gray-100"}`}
            />
            <div className={`text-xs mt-3 ${settings.advancedMode ? "text-slate-400" : "text-gray-500"}`}>
              Overall Task Completion
            </div>
          </div>
        );
      default:
        return <div className="text-white">Widget content not available</div>;
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggingWidget(widgetId);
    e.dataTransfer.setData("text/plain", widgetId);
    e.dataTransfer.effectAllowed = "move";

    // Create custom drag image
    const dragImage = document.createElement("div");
    dragImage.classList.add(
      "opacity-80",
      "pointer-events-none",
      "py-2",
      "px-3",
      "border",
      settings.advancedMode ? "border-blue-500/50" : "border-indigo-400/50",
      settings.advancedMode ? "bg-slate-800/90" : "bg-white/90",
      "rounded-lg",
      "shadow-lg",
      "flex",
      "items-center",
      "gap-2"
    );

    const icon = document.createElement("span");
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
    icon.className = settings.advancedMode ? "text-blue-400" : "text-indigo-500";

    const text = document.createElement("span");
    text.textContent = "Moving Widget";
    text.className = settings.advancedMode ? "text-gray-200 text-sm font-medium" : "text-gray-700 text-sm font-medium";

    dragImage.appendChild(icon);
    dragImage.appendChild(text);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (draggingWidget === targetWidgetId) return;

    const draggedIndex = sortedWidgets.findIndex(
      (w) => w.id === draggingWidget,
    );
    const targetIndex = sortedWidgets.findIndex((w) => w.id === targetWidgetId);

    if (draggedIndex < 0 || targetIndex < 0) return;

    // Highlight drop target
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.add(
      "ring-2",
      settings.advancedMode ? "ring-blue-500/70" : "ring-indigo-400/70",
      "scale-[1.02]",
      "transition-transform",
      "duration-200"
    );
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.remove(
      "ring-2",
      "ring-blue-400",
      "ring-indigo-400/70",
      "scale-[1.02]",
      "transition-transform",
      "duration-200"
    );
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();

    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.remove(
      "ring-2",
      "ring-blue-400",
      "ring-indigo-400/70",
      "scale-[1.02]"
    );

    if (draggingWidget === null) return;

    // If it's the available widgets panel, add the widget
    if (targetWidgetId === "available-widgets-panel") {
      // Remove widget logic here
      return;
    }

    const draggedIndex = sortedWidgets.findIndex(
      (w) => w.id === draggingWidget,
    );
    const targetIndex = sortedWidgets.findIndex((w) => w.id === targetWidgetId);

    if (draggedIndex >= 0 && targetIndex >= 0 && draggedIndex !== targetIndex) {
      // Update widget orders for vertical layout
      const draggedOrder = sortedWidgets[draggedIndex].order;
      const targetOrder = sortedWidgets[targetIndex].order;

      // Create a new array to update all the widgets with proper orders
      const updatedWidgets = [...widgets];

      if (targetOrder > draggedOrder) {
        // Moving down - update orders for widgets in between
        for (const widget of updatedWidgets) {
          if (widget.order > draggedOrder && widget.order <= targetOrder) {
            widget.order -= 1;
          }
        }
      } else {
        // Moving up - update orders for widgets in between
        for (const widget of updatedWidgets) {
          if (widget.order < draggedOrder && widget.order >= targetOrder) {
            widget.order += 1;
          }
        }
      }

      // Update the dragged widget's order to the target position
      const draggedWidget = updatedWidgets.find((w) => w.id === draggingWidget);
      if (draggedWidget) {
        draggedWidget.order = targetOrder;
      }

      // Save updated widgets
      setWidgets(updatedWidgets);
    }

    setDraggingWidget(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingWidget(null);
  };

  // Handle adding a new widget
  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
    // Don't hide after adding - let user add multiple if they wish
  };

  // Toggle the add widgets panel
  const toggleAddWidgets = () => {
    setShowAddWidgets(!showAddWidgets);
  };

  // Get the appropriate column span for a widget
  const getWidgetWidth = (widget: Widget) => {
    if (widget.size === "large") {
      return gridColumns; // Large widgets span full width
    }

    if (widget.size === "medium") {
      return Math.min(2, gridColumns); // Medium widgets take up to 2 columns
    }

    return 1; // Small widgets take 1 column
  };

  if (!settings.advancedMode) {
    return null;
  }

  return (
    <div className="widget-dashboard px-8 py-6">
      {/* Add Widgets Button & Panel */}
      {availableWidgets.length > 0 && (
        <div className="mb-8">
          <Button
            onClick={toggleAddWidgets}
            className={`mb-5 flex items-center ${
              settings.advancedMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {showAddWidgets ? (
              <>
                <FaTimes className="mr-2" size={12} />
                Hide Widget Options
              </>
            ) : (
              <>
                <FaPlus className="mr-2" size={12} />
                Add Widgets
              </>
            )}
          </Button>

          {showAddWidgets && (
            <div className={`rounded-xl p-5 transition-all duration-300 shadow-lg ${
              settings.advancedMode
                ? "bg-slate-800/90 backdrop-blur-sm border border-slate-700/70"
                : "bg-white/95 backdrop-blur-sm border border-gray-200/50"
            }`}>
              <h2 className={`text-lg font-medium mb-4 ${
                settings.advancedMode ? "text-white" : "text-gray-800"
              }`}>
                Available Widgets
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => handleAddWidget(widget.type)}
                    className={`flex items-center justify-center p-3 rounded-lg text-sm transition-all duration-200 ${
                      settings.advancedMode
                        ? "bg-slate-700/80 border border-slate-600/50 text-white hover:bg-slate-600 hover:scale-[1.03]"
                        : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 hover:scale-[1.03]"
                    }`}
                  >
                    <FaPlus className={`mr-2 ${settings.advancedMode ? "text-blue-400" : "text-indigo-500"}`} size={10} />
                    {widget.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Widgets organized in flexible rows */}
      <div className="space-y-6">
        {organizedWidgets.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-wrap gap-6">
            {row.map((widget) => {
              const spanValue = getWidgetWidth(widget);
              const widgetWidth = spanValue === gridColumns
                ? '100%'
                : `calc(${(100 / gridColumns) * spanValue}% - ${(spanValue - 1) * 6 + 6}px)`;

              return (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  className="transition-all duration-300"
                  style={{
                    width: widgetWidth,
                    minWidth: spanValue === 1 ? '250px' : '480px'
                  }}
                >
                  <WidgetContainer
                    widget={widget}
                    isBeingDragged={draggingWidget === widget.id}
                    dragHandleProps={{
                      onMouseDown: (e: React.MouseEvent) => {
                        e.stopPropagation();
                      },
                    }}
                  >
                    {renderWidgetContent(widget)}
                  </WidgetContainer>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
