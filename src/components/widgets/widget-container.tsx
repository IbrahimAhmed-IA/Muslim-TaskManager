import type React from 'react';
import { useState } from 'react';
import { FaGripVertical, FaTimes, FaExpand, FaCompress, FaArrowUp, FaArrowDown, FaCog } from 'react-icons/fa';
import type { Widget } from '@/context/widget-layout-context';
import { useWidgetLayout } from '@/context/widget-layout-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DragHandleProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
  draggable?: boolean;
  isBeingDragged?: boolean;
  dragHandleProps?: DragHandleProps;
  isDragDisabled?: boolean;
}

export default function WidgetContainer({
  widget,
  children,
  draggable = true,
  isBeingDragged = false,
  dragHandleProps = {},
  isDragDisabled = false
}: WidgetContainerProps) {
  const { removeWidget, updateWidgetSize, moveWidgetUp, moveWidgetDown } = useWidgetLayout();

  // Determine if this is the task manager widget which should not be resizable
  const isTaskManager = widget.type === 'tasks';

  // Handle widget size cycling - medium -> large -> full -> medium
  const handleCycleSize = () => {
    if (isTaskManager) return; // Disable resizing for task manager

    const sizeMap: Record<Widget['size'], Widget['size']> = {
      'medium': 'large',
      'large': 'full',
      'full': 'medium'
    };

    updateWidgetSize(widget.id, sizeMap[widget.size]);
  };

  // Get size classes for the widget
  const getSizeClasses = () => {
    // Task manager is always full size
    if (isTaskManager) return 'w-full max-w-none';

    // Handle legacy 'small' size as 'medium'
    const size = widget.size === 'small' ? 'medium' : widget.size;

    switch (size) {
      case 'medium':
        return 'w-full max-w-[540px] h-auto'; // Medium widgets with auto height
      case 'large':
        return 'w-full max-w-3xl'; // Large widgets have width constraint
      case 'full':
        return 'w-full max-w-none'; // Full widgets take all available space
      default:
        return 'w-full';
    }
  };

  // Get content height classes based on widget size
  const getContentHeightClasses = () => {
    // Handle both 'medium' and legacy 'small' sizes
    if (widget.size === 'medium' || widget.size === 'small') {
      return 'max-h-[210px] overflow-y-auto'; // Fixed max-height for medium widgets
    }
    return '';
  };

  // Function to ensure up/down buttons work properly
  const handleMoveWidget = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      moveWidgetUp(widget.id);
    } else {
      moveWidgetDown(widget.id);
    }
  };

  return (
    <div
      className={`widget ${getSizeClasses()} bg-slate-800/95 rounded-lg border-[0.25px] border-slate-700/30 shadow-sm overflow-hidden transition-all duration-300 ${
        isBeingDragged ? 'opacity-75 scale-95 ring-1 ring-blue-400/50' : ''
      }`}
      data-size={widget.size}
    >
      {/* Widget Header - Much thinner */}
      <div className="widget-header flex items-center justify-between bg-slate-800/95 py-1.5 px-2 border-b border-[0.25px] border-slate-700/30">
        <div className="flex items-center">
          {draggable && !isDragDisabled && (
            <div
              {...dragHandleProps}
              className="cursor-grab p-0.5 mr-1.5 text-slate-400 hover:text-white"
              title="Drag to reposition"
            >
              <FaGripVertical size={14} />
            </div>
          )}
          <h3 className="font-medium text-sm text-white truncate">{widget.title}</h3>
        </div>

        <div className="flex items-center space-x-0.5">
          {/* Widget Order Controls - Fixed implementation */}
          <button
            onClick={() => handleMoveWidget('up')}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Move up"
          >
            <FaArrowUp size={10} />
          </button>

          <button
            onClick={() => handleMoveWidget('down')}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Move down"
          >
            <FaArrowDown size={10} />
          </button>

          {/* Widget Size Toggle - Hide for task manager */}
          {!isTaskManager && (
            <button
              onClick={handleCycleSize}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
              title="Change size"
            >
              {widget.size === 'full' ? (
                <FaCompress size={12} />
              ) : (
                <FaExpand size={12} />
              )}
            </button>
          )}

          {/* Widget Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                title="Widget settings"
              >
                <FaCog size={12} />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800/95 border-[0.25px] border-slate-700/30 text-white">
              <DialogHeader>
                <DialogTitle>Widget Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-2">
                {/* Size selection */}
                <div className="mb-3">
                  <label className="block mb-2 text-xs font-medium text-slate-400">Widget Size</label>
                  <div className="flex space-x-2">
                    {(['medium', 'large', 'full'] as const).map((size) => (
                      <Button
                        key={size}
                        onClick={() => updateWidgetSize(widget.id, size)}
                        disabled={isTaskManager}
                        variant={widget.size === size ? 'default' : 'outline'}
                        className={`px-2 py-1 text-xs ${
                          isTaskManager ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                {isTaskManager && (
                  <p className="text-xs text-slate-500 italic">
                    Task Manager size cannot be changed
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Widget Remove Button */}
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
            title="Remove widget"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      {/* Widget Content - Reduced padding */}
      <div className={`widget-content p-2.5 ${getContentHeightClasses()}`}>
        {children}
      </div>
    </div>
  );
}
