import { useState } from 'react';
import { Note } from '../components/Note';
import { Toolbar } from '../components/Toolbar';

interface NoteData {
  id: string;
  color: string;
  x: number;
  y: number;
}

export function App() {
  const [notes, setNotes] = useState<NoteData[]>([
    { id: '1', color: 'yellow', x: 16, y: 16 }
  ]);

  const createNote = (color: string) => {
    const newNote: NoteData = {
      id: Date.now().toString(),
      color,
      x: Math.random() * 64,
      y: Math.random() * 48
    };
    setNotes(prev => [...prev, newNote]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
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
              onDelete={deleteNote}
            />
          ))}
        </div>

    </div>
  );
}

export default App;
