import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '../components/Note';
import { Toolbar } from '../components/Toolbar';
import { TrashZone } from '../components/TrashZone';
import { PlacementPreview } from '../components/PlacementPreview';

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
  const [placementMode, setPlacementMode] = useState<{
    active: boolean;
    color: string;
    width: number;
    height: number;
  } | null>(null);

  // Refs for DOM elements
  const toolbarRef = useRef<HTMLDivElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

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

  const createNoteAtPosition = useCallback((x: number, y: number, color: string, width: number, height: number) => {
    const newZIndex = maxZIndex + 1;
    const newNote: NoteData = {
      id: Date.now().toString(),
      color,
      x,
      y,
      width,
      height,
      content: '',
      zIndex: newZIndex
    };
    setNotes(prev => [...prev, newNote]);
    setMaxZIndex(newZIndex);
    setPlacementMode(null);
  }, [maxZIndex]);

  const startPlacementMode = useCallback((color: string, width: number, height: number) => {
    setPlacementMode({ active: true, color, width, height });
  }, []);

  const cancelPlacementMode = useCallback(() => {
    setPlacementMode(null);
  }, []);

  // Handle ESC key to cancel placement mode and document clicks for placement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && placementMode?.active) {
        cancelPlacementMode();
      }
    };

    const handleDocumentClick = (e: MouseEvent) => {
      if (!placementMode?.active) return;

      // Check if click is within the workspace area (not toolbar or trash zone)
      const target = e.target as HTMLElement;

      if (toolbarRef.current?.contains(target) || trashZoneRef.current?.contains(target)) {
        return;
      }

      // Get workspace bounds
      if (!workspaceRef.current) return;

      const rect = workspaceRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 16; // Account for padding
      const y = e.clientY - rect.top - 16;  // Account for padding

      // Constrain position within bounds
      const containerWidth = window.innerWidth - 32; // Account for padding
      const containerHeight = window.innerHeight - 200; // Account for toolbar and padding

      const constrainedX = Math.max(0, Math.min(x, containerWidth - placementMode.width));
      const constrainedY = Math.max(0, Math.min(y, containerHeight - placementMode.height));

      createNoteAtPosition(constrainedX, constrainedY, placementMode.color, placementMode.width, placementMode.height);
    };

    if (placementMode?.active) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleDocumentClick, true); // Use capture phase
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleDocumentClick, true);
      };
    }
  }, [placementMode?.active, placementMode, cancelPlacementMode, createNoteAtPosition]);

  const handleWorkspaceClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode?.active) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 16; // Account for padding
    const y = e.clientY - rect.top - 16;  // Account for padding

    // Constrain position within bounds
    const containerWidth = window.innerWidth - 32; // Account for padding
    const containerHeight = window.innerHeight - 200; // Account for toolbar and padding

    const constrainedX = Math.max(0, Math.min(x, containerWidth - placementMode.width));
    const constrainedY = Math.max(0, Math.min(y, containerHeight - placementMode.height));

    createNoteAtPosition(constrainedX, constrainedY, placementMode.color, placementMode.width, placementMode.height);
  }, [placementMode, createNoteAtPosition]);

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center mx-auto bg-neutral-50"
        role="main"
        aria-label="Loading application"
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto mb-4"
            role="status"
            aria-label="Loading spinner"
          ></div>
          <h2 className="text-lg font-medium text-neutral-700 mb-2">Loading your notes...</h2>
          <p className="text-sm text-neutral-500">Syncing with backend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr]" role="main" aria-label="Sticky notes application">
        <Toolbar ref={toolbarRef} onCreateNote={createNote} onStartPlacement={startPlacementMode} />
        <div
          ref={workspaceRef}
          className={`relative p-4 ${placementMode?.active ? 'cursor-crosshair' : ''}`}
          role="main"
          aria-label="Notes workspace"
          onMouseDown={handleWorkspaceClick}
        >
          {placementMode?.active && (
            <PlacementPreview
              color={placementMode.color}
              width={placementMode.width}
              height={placementMode.height}
            />
          )}
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
              isPlacementMode={placementMode?.active || false}
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
        <TrashZone ref={trashZoneRef} isActive={trashZoneActive} isPlacementMode={placementMode?.active} />
   </div>
  );
}

export default App;
