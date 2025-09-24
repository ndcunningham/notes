import { useState } from 'react';
import { Note } from '../components/Note';
import { Toolbar } from '../components/Toolbar';

interface NoteData {
  id: string;
  color: string;
  x: number;
  y: number;
  zIndex: number;
}

export function App() {
  const [notes, setNotes] = useState<NoteData[]>([
    { id: '1', color: 'yellow', x: 16, y: 16, zIndex: 1 }
  ]);
  const [maxZIndex, setMaxZIndex] = useState(1);

  const createNote = (color: string) => {
    const newZIndex = maxZIndex + 1;
    const newNote: NoteData = {
      id: Date.now().toString(),
      color,
      x: Math.random() * 64,
      y: Math.random() * 48,
      zIndex: newZIndex
    };
    setNotes(prev => [...prev, newNote]);
    setMaxZIndex(newZIndex);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const bringToFront = (id: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note || note.zIndex === maxZIndex) return prev; // Already on top

      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      return prev.map(n =>
        n.id === id ? { ...n, zIndex: newZIndex } : n
      );
    });
  };

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
              zIndex={note.zIndex}
              onDelete={deleteNote}
              onBringToFront={bringToFront}
            />
          ))}
        </div>

    </div>
  );
}

export default App;
