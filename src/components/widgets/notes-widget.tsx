import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNoteContext } from '@/context/note-context';
import NotesList from '../notes/notes-list';
import NoteEditor from '../notes/note-editor';
import { FaPlus, FaStickyNote } from 'react-icons/fa';

export default function NotesWidget() {
  const { notes, addNote, updateNote, deleteNote } = useNoteContext();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showNotesList, setShowNotesList] = useState(true);

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsCreatingNote(false);
    setShowNotesList(false);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(true);
    setShowNotesList(false);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (isCreatingNote) {
      addNote(title, content);
      setIsCreatingNote(false);
    } else if (selectedNoteId) {
      updateNote(selectedNoteId, title, content);
    }
    setShowNotesList(true);
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
    setShowNotesList(true);
  };

  return (
    <div className="w-full h-full">
      {showNotesList ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-slate-200">Your Notes</h3>
            <Button onClick={handleCreateNote} size="sm" variant="outline" className="h-8">
              <FaPlus className="mr-1" size={12} /> New Note
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-slate-700 rounded-lg">
              <div className="inline-flex p-3 rounded-full mb-2 bg-slate-700">
                <FaStickyNote className="text-blue-400" size={14} />
              </div>
              <p className="text-slate-400 text-sm">No notes yet</p>
              <p className="text-xs text-slate-500 mt-1">Create your first note</p>
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
      ) : (
        <div>
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
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <FaStickyNote className="text-blue-400 mb-2" size={16} />
              <p className="text-sm">No note selected</p>
              <Button onClick={handleCreateNote} variant="ghost" size="sm" className="mt-2">
                <FaPlus className="mr-1" size={10} /> New Note
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
