import { useState, useEffect, useCallback } from 'react';
import { Note } from '../components/Note';
import { Toolbar } from '../components/Toolbar';
import { TrashZone } from '../components/TrashZone';

interface NoteData {
  id: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  zIndex: number;
}

const STORAGE_KEY = 'nicholas-sticky-notes';

// Async localStorage to simulate backend calls
const saveNotesToStorage = async (notes: NoteData[], maxZIndex: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, maxZIndex }));
      resolve();
    }, 100); // Simulate network delay
  });
};

const loadNotesFromStorage = async (): Promise<{ notes: NoteData[], maxZIndex: number } | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          resolve(data);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Failed to load notes from storage:', error);
        resolve(null);
      }
    }, 800); // Simulate network delay
  });
};

export function App() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [trashZoneActive, setTrashZoneActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate app on load
  useEffect(() => {
    const hydrateApp = async () => {
      const stored = await loadNotesFromStorage();

      if (stored && stored.notes.length > 0) {
        setNotes(stored.notes);
        setMaxZIndex(stored.maxZIndex);
      } else {
        // Create default note if no stored data
        const defaultNote: NoteData = {
          id: '1',
          color: 'yellow',
          x: 16,
          y: 16,
          width: 180,
          height: 120,
          content: '',
          zIndex: 1
        };
        setNotes([defaultNote]);
        setMaxZIndex(1);
      }

      setIsLoading(false);
    };

    hydrateApp();
  }, []);

  // Save to storage whenever notes or maxZIndex changes
  useEffect(() => {
    if (!isLoading && notes.length >= 0) {
      saveNotesToStorage(notes, maxZIndex);
    }
  }, [notes, maxZIndex, isLoading]);

  // UseCallback to avoid re-renders in children
  const createNote = useCallback((color: string) => {
    const newZIndex = maxZIndex + 1;
    const newNote: NoteData = {
      id: Date.now().toString(),
      color,
      x: Math.random() * 64,
      y: Math.random() * 48,
      width: 180,
      height: 120,
      content: '',
      zIndex: newZIndex
    };
    setNotes(prev => [...prev, newNote]);
    setMaxZIndex(newZIndex);
  }, [maxZIndex]);


  const bringToFront = useCallback((id: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note || note.zIndex === maxZIndex) return prev; // Already on top

      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      return prev.map(n =>
        n.id === id ? { ...n, zIndex: newZIndex } : n
      );
    });
  }, [maxZIndex]);

  const handleTrashZoneEnter = useCallback(() => {
    setTrashZoneActive(true);
  }, []);

  const handleTrashZoneLeave = useCallback(() => {
    setTrashZoneActive(false);
  }, []);

  const handleTrashZoneDrop = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    setTrashZoneActive(false);
  }, []);

  const updateNotePosition = useCallback((id: string, x: number, y: number) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, x, y } : note
    ));
  }, []);

  const updateNoteSize = useCallback((id: string, width: number, height: number) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, width, height } : note
    ));
  }, []);

  const updateNoteContent = useCallback((id: string, content: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center mx-auto bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-neutral-700 mb-2">Loading your notes...</h2>
          <p className="text-sm text-neutral-500">Syncing with backend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
        <Toolbar onCreateNote={createNote} />
        <div className="relative p-4">
          {notes.map(note => (
            <Note
              key={note.id}
              id={note.id}
              color={note.color}
              initialX={note.x}
              initialY={note.y}
              initialWidth={note.width}
              initialHeight={note.height}
              initialContent={note.content}
              zIndex={note.zIndex}
              onBringToFront={bringToFront}
              onPositionChange={updateNotePosition}
              onSizeChange={updateNoteSize}
              onContentChange={updateNoteContent}
              onTrashZoneEnter={handleTrashZoneEnter}
              onTrashZoneLeave={handleTrashZoneLeave}
              onTrashZoneDrop={handleTrashZoneDrop}
            />
          ))}
        </div>
        <TrashZone isActive={trashZoneActive} />
    </div>
  );
}

export default App;
