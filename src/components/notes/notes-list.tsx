'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaTrash } from 'react-icons/fa';
import type { Note } from '@/lib/types';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
}: NotesListProps) {
  // Format date to human-readable format
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort notes by updated date (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className="notes-list space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
      {sortedNotes.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No notes yet. Create your first note!
        </div>
      ) : (
        sortedNotes.map((note) => (
          <div
            key={note.id}
            className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors relative group ${
              selectedNoteId === note.id ? 'bg-purple-50 border-purple-200' : ''
            }`}
            onClick={() => onSelectNote(note.id)}
          >
            <h3 className="font-medium truncate pr-8">{note.title}</h3>
            <p className="text-gray-500 text-sm truncate">
              {note.content.substring(0, 100)}
              {note.content.length > 100 ? '...' : ''}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {formatDate(note.updatedAt)}
            </p>

            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
            >
              <FaTrash className="text-red-500" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
