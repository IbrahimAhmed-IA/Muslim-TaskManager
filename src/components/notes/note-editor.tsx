'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NoteEditorProps {
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export default function NoteEditor({
  mode,
  initialTitle = '',
  initialContent = '',
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  // Update state when initialTitle/initialContent change (when editing different notes)
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, content);
    }
  };

  return (
    <div className="note-editor space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'create' ? 'Create Note' : 'Edit Note'}
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="note-title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
          />
        </div>

        <div>
          <label htmlFor="note-content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <Textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[300px]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
