import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Note } from '@/lib/types';
import { getNotes, saveNotes } from '@/lib/storage';
import { toast } from 'sonner';

interface NoteContextType {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
}

const NoteContext = createContext<NoteContextType | null>(null);

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Load notes from localStorage on initial render
    const savedNotes = getNotes();
    setNotes(savedNotes);
  }, []);

  useEffect(() => {
    // Save notes to localStorage whenever they change
    saveNotes(notes);
  }, [notes]);

  const addNote = (title: string, content: string) => {
    if (!title.trim()) {
      toast.error('Note title cannot be empty');
      return;
    }

    const now = new Date();
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content,
      createdAt: now,
      updatedAt: now,
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    toast.success('Note added successfully');
  };

  const updateNote = (id: string, title: string, content: string) => {
    if (!title.trim()) {
      toast.error('Note title cannot be empty');
      return;
    }

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content,
              updatedAt: new Date()
            }
          : note
      )
    );
    toast.success('Note updated');
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    toast.success('Note deleted');
  };

  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
