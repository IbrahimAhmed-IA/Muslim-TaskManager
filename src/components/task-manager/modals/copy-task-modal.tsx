'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DayOfWeek } from '@/lib/types';
import { useTaskContext } from '@/context/task-context';
import { useAppSettings } from '@/context/app-settings-context';

interface CopyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskIds: string[];
  onTasksCopied: () => void;
}

export default function CopyTaskModal({
  isOpen,
  onClose,
  taskIds,
  onTasksCopied,
}: CopyTaskModalProps) {
  const { copyTasks } = useTaskContext();
  const { settings } = useAppSettings();
  const [destination, setDestination] = useState<DayOfWeek>('saturday');

  // Define consistent styles for the advanced mode
  const advancedStyles = settings.advancedMode ? {
    background: 'bg-slate-800',
    text: 'text-white',
    border: 'border-slate-700',
    label: 'text-slate-200',
    inputBg: 'bg-slate-700',
    inputBorder: 'border-slate-600',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
  } : {};

  const handleCopy = () => {
    if (taskIds.length === 0) return;

    copyTasks(taskIds, destination);
    onTasksCopied();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[425px] ${advancedStyles.background} ${advancedStyles.text} ${advancedStyles.border}`}>
        <DialogHeader>
          <DialogTitle className={settings.advancedMode ? 'text-white' : ''}>Copy Tasks To</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="copy-destination" className={`text-sm font-medium ${settings.advancedMode ? advancedStyles.label : ''}`}>
              Destination Day
            </label>
            <select
              id="copy-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value as DayOfWeek)}
              className={`p-2 rounded-md border focus:outline-none focus:ring-2 ${
                settings.advancedMode
                  ? `${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} focus:ring-blue-500`
                  : 'border-gray-300 focus:ring-primary'
              }`}
            >
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
            </select>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className={settings.advancedMode ? advancedStyles.buttonSecondary : ''}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            className={settings.advancedMode ? advancedStyles.buttonPrimary : ''}
          >
            Copy Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
