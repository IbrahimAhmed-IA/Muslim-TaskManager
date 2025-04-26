import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useWidgetLayout } from '@/context/widget-layout-context';
import WidgetContainer from './widget-container';
import TaskManager from '@/components/task-manager/task-manager';
import PomodoroWidget from './pomodoro-widget';
import ProjectManager from '@/components/task-manager/project-manager';
import AzanTimes from '@/components/azan/azan-times';
import NotesWidget from './notes-widget';
import { useAppSettings } from '@/context/app-settings-context';
import type { Widget, WidgetType } from '@/context/widget-layout-context';
import { Progress } from '@/components/ui/progress';
import { useTaskContext } from '@/context/task-context';
import { Button } from '@/components/ui/button';

export default function WidgetDashboard() {
  const { widgets, availableWidgets, addWidget, setWidgets } = useWidgetLayout();
  const { settings } = useAppSettings();
  const { getOverallProgress } = useTaskContext();
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [showAddWidgets, setShowAddWidgets] = useState(false);

  // Sort widgets by order and filter visible ones
  const sortedWidgets = [...widgets]
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'tasks':
        return <TaskManager />;
      case 'pomodoro':
        return <PomodoroWidget />;
      case 'projects':
        return <ProjectManager />;
      case 'azanTimes':
        return <AzanTimes />;
      case 'notes':
        return <NotesWidget />;
      case 'progress':
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white mb-2">{getOverallProgress()}%</div>
            <Progress
              value={getOverallProgress()}
              className="h-3 w-full rounded-full bg-slate-700"
            />
            <div className="text-xs text-slate-400 mt-2">Overall Task Completion</div>
          </div>
        );
      default:
        return <div className="text-white">Widget content not available</div>;
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggingWidget(widgetId);
    e.dataTransfer.setData('text/plain', widgetId);
    e.dataTransfer.effectAllowed = 'move';

    // Create custom drag image (optional)
    const dragImage = document.createElement('div');
    dragImage.classList.add('opacity-80', 'pointer-events-none', 'border', 'border-blue-400', 'bg-slate-800', 'p-2', 'rounded');
    dragImage.textContent = 'Moving Widget';
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

    const draggedIndex = sortedWidgets.findIndex(w => w.id === draggingWidget);
    const targetIndex = sortedWidgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex < 0 || targetIndex < 0) return;

    // Highlight drop target
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.add('ring-2', 'ring-blue-400');
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.remove('ring-2', 'ring-blue-400');
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();

    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.remove('ring-2', 'ring-blue-400');

    if (draggingWidget === null) return;

    // If it's the available widgets panel, add the widget
    if (targetWidgetId === 'available-widgets-panel') {
      // Remove widget logic here
      return;
    }

    const draggedIndex = sortedWidgets.findIndex(w => w.id === draggingWidget);
    const targetIndex = sortedWidgets.findIndex(w => w.id === targetWidgetId);

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
      const draggedWidget = updatedWidgets.find(w => w.id === draggingWidget);
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

  // Group medium widgets to be rendered side by side
  const groupWidgets = () => {
    const groups: Widget[][] = [];
    let currentRow: Widget[] = [];

    for (const widget of sortedWidgets) {
      if (widget.size === 'medium') {
        // If current row is empty or has space (one medium widget) and that widget is also medium
        if (
          currentRow.length === 0 ||
          (currentRow.length === 1 && currentRow[0].size === 'medium')
        ) {
          currentRow.push(widget);
          // If we now have two medium widgets, add the row and start a new one
          if (currentRow.length === 2) {
            groups.push([...currentRow]);
            currentRow = [];
          }
        } else {
          // Push the filled row and start a new one with this widget
          groups.push([...currentRow]);
          currentRow = [widget];
        }
      } else {
        // If we have widgets in the current row, add that row first
        if (currentRow.length > 0) {
          groups.push([...currentRow]);
          currentRow = [];
        }
        // Add this widget as its own row
        groups.push([widget]);
      }
    }

    // Add any remaining widgets in the current row
    if (currentRow.length > 0) {
      groups.push(currentRow);
    }

    return groups;
  };

  if (!settings.advancedMode) {
    return null;
  }

  const widgetGroups = groupWidgets();

  return (
    <div className="widget-dashboard p-6">
      {/* Add Widgets Button & Panel */}
      {availableWidgets.length > 0 && (
        <div className="mb-8">
          <Button
            onClick={toggleAddWidgets}
            className="mb-4 bg-blue-600 hover:bg-blue-700 flex items-center"
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
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 transition-all duration-300">
              <h2 className="text-lg font-medium text-white mb-4">Available Widgets</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => handleAddWidget(widget.type)}
                    className="flex items-center justify-center p-3 rounded-lg bg-slate-700 border border-slate-600 text-white hover:bg-slate-600 transition-colors text-sm"
                  >
                    <FaPlus className="mr-2 text-blue-400" size={12} />
                    {widget.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Widgets Layout - Modified to support side-by-side medium widgets */}
      <div className="flex flex-col space-y-6">
        {widgetGroups.map((group) => {
          // Generate a stable key for each group based on widget ids
          const groupKey = `group-${group.map(w => w.id).join('-')}`;
          const isMediumWidgetsRow = group.length === 2 && group.every(w => w.size === 'medium');

          return (
            <div
              key={groupKey}
              className={`flex ${isMediumWidgetsRow ? 'flex-row gap-6 justify-center' : 'flex-col items-center'}`}
            >
              {group.map((widget) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  className={`transition-all duration-300 ${
                    isMediumWidgetsRow
                      ? 'flex-1 w-1/2 max-w-[600px]'
                      : widget.size === 'medium' || widget.size === 'small'
                        ? 'w-full max-w-[600px]'
                        : 'w-full'
                  }`}
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
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
