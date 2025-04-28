import { Button } from "@/components/ui/button";
import { useWidgetLayout } from "@/context/widget-layout-context";
import type { Widget } from "@/context/widget-layout-context";
import { useAppSettings } from "@/context/app-settings-context";
import { FaGripVertical, FaTimes, FaWindowMaximize, FaWindowRestore } from "react-icons/fa";

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
  isBeingDragged?: boolean;
  dragHandleProps?: {
    onMouseDown: (e: React.MouseEvent) => void;
  };
}

export default function WidgetContainer({
  widget,
  children,
  isBeingDragged = false,
  dragHandleProps,
}: WidgetContainerProps) {
  const { removeWidget, toggleWidgetSize } = useWidgetLayout();
  const { settings } = useAppSettings();
  const isAdvancedMode = settings.advancedMode;

  return (
    <div
      className={`widget rounded-xl overflow-hidden transition-all duration-300 ${
        isBeingDragged
          ? "widget-dragging opacity-70 scale-95"
          : ""
      } ${isAdvancedMode
          ? "bg-gradient-to-b from-slate-800/95 to-slate-800/85 backdrop-blur-lg border border-slate-700/70"
          : "bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-lg"}`}
      style={{
        width: "100%",
        marginBottom: isBeingDragged ? "40px" : "0",
        transform: isBeingDragged ? "rotate(-1deg)" : "none",
        boxShadow: isAdvancedMode
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Widget Header */}
      <div
        className={`widget-header px-3 py-2.5 flex justify-between items-center border-b ${
          isAdvancedMode
            ? "from-slate-800 to-slate-800/90 border-slate-700/70 text-white"
            : "bg-gradient-to-r from-white to-gray-50 border-gray-200/50"
        }`}
      >
        <div className="flex items-center">
          <div
            className={`cursor-move p-1.5 mr-2 rounded-md transition-colors ${
              isAdvancedMode
                ? "hover:bg-slate-700/70 text-gray-300 hover:text-white"
                : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-800"
            }`}
            {...dragHandleProps}
          >
            <FaGripVertical size={14} />
          </div>
          <h3
            className={`text-sm font-medium ${
              isAdvancedMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {widget.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1.5">
          {/* Toggle widget size button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleWidgetSize(widget.id)}
            className={`h-7 w-7 p-0 rounded-md transition-colors ${
              isAdvancedMode
                ? "hover:bg-slate-700/70 text-gray-300 hover:text-white"
                : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-700"
            }`}
          >
            {widget.size === "large" ? (
              <FaWindowRestore size={12} />
            ) : (
              <FaWindowMaximize size={12} />
            )}
          </Button>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeWidget(widget.id)}
            className={`h-7 w-7 p-0 rounded-md transition-colors ${
              isAdvancedMode
                ? "hover:bg-red-900/20 text-gray-300 hover:text-red-400"
                : "hover:bg-red-50 text-gray-500 hover:text-red-500"
            }`}
          >
            <FaTimes size={14} />
          </Button>
        </div>
      </div>

      {/* Widget Content */}
      <div className={`widget-content p-5 ${isAdvancedMode ? "text-gray-200" : ""}`}>
        {children}
      </div>
    </div>
  );
}
