'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNoteContext } from '@/context/note-context';
import NotesList from './notes-list';
import NoteEditor from './note-editor';
import { Note } from '@/lib/types';
import { FaPlus, FaStickyNote } from 'react-icons/fa';

export default function NotesManager() {
  const { notes, addNote, updateNote, deleteNote } = useNoteContext();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsCreatingNote(false);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(true);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (isCreatingNote) {
      addNote(title, content);
      setIsCreatingNote(false);
    } else if (selectedNoteId) {
      updateNote(selectedNoteId, title, content);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const handleCancel = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(false);
  };

  return (
    <div className="py-6 w-full fade-in">
      <header className="page-header">
        <h1 className="text-3xl font-bold mb-1">My Notes</h1>
        <p className="text-white/80">Capture thoughts and ideas</p>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="card p-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Notes</h2>
                <Button onClick={handleCreateNote} size="sm" className="btn-primary">
                  <FaPlus className="mr-1" /> New Note
                </Button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="bg-gray-50 inline-flex p-4 rounded-full mb-3">
                    <FaStickyNote className="text-indigo-500 text-xl" />
                  </div>
                  <p className="text-gray-500">No notes yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first note to get started</p>
                </div>
              ) : (
                <NotesList
                  notes={notes}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={handleSelectNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card p-5 h-full">
              {isCreatingNote ? (
                <NoteEditor
                  mode="create"
                  onSave={handleSaveNote}
                  onCancel={handleCancel}
                />
              ) : selectedNote ? (
                <NoteEditor
                  mode="edit"
                  initialTitle={selectedNote.title}
                  initialContent={selectedNote.content}
                  onSave={handleSaveNote}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="bg-gray-50 inline-flex p-6 rounded-full mb-4">
                    <FaStickyNote className="text-indigo-500 text-3xl" />
                  </div>
                  <p className="mb-4 text-lg">Select a note to view or edit</p>
                  <Button onClick={handleCreateNote} variant="outline" className="btn-secondary">
                    <FaPlus className="mr-2" /> Create a new note
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
