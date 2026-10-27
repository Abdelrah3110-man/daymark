import { create } from 'zustand';
import { Note } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';

interface NotesStorageData {
  notes: Note[];
}

interface NotesState {
  notes: Note[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  createNote: (params: {
    title: string;
    content: string;
    tags?: string[];
    linkedTaskId?: string;
    linkedGoalId?: string;
    isPinned?: boolean;
  }) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  clearNotes: () => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isHydrated: false,

  hydrate: async () => {
    const saved = await loadItem<NotesStorageData>(STORAGE_KEYS.NOTES, { notes: [] });
    set({ notes: saved.notes || [], isHydrated: true });
  },

  createNote: (params) => {
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: params.title.trim() || 'Untitled Note',
      content: params.content.trim(),
      tags: params.tags || [],
      linkedTaskId: params.linkedTaskId,
      linkedGoalId: params.linkedGoalId,
      isPinned: Boolean(params.isPinned),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...get().notes];
    set({ notes: updated });
    saveItem(STORAGE_KEYS.NOTES, { notes: updated });
    return newNote;
  },

  updateNote: (id, updates) => {
    const updated = get().notes.map((note) => {
      if (note.id === id) {
        return {
          ...note,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });

    set({ notes: updated });
    saveItem(STORAGE_KEYS.NOTES, { notes: updated });
  },

  deleteNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    set({ notes: updated });
    saveItem(STORAGE_KEYS.NOTES, { notes: updated });
  },

  togglePinNote: (id) => {
    const updated = get().notes.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          isPinned: !n.isPinned,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });

    set({ notes: updated });
    saveItem(STORAGE_KEYS.NOTES, { notes: updated });
  },

  clearNotes: async () => {
    set({ notes: [] });
    await saveItem(STORAGE_KEYS.NOTES, { notes: [] });
  },
}));

