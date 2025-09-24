import { useState } from 'react';

interface ToolbarProps {
  onCreateNote: (color: string) => void;
}

export function Toolbar({ onCreateNote }: ToolbarProps) {
  const [color, setColor] = useState('yellow');
  const colors: Array<[string, string]> = [
    ['yellow', 'bg-noteYellow'],
    ['blue', 'bg-noteBlue'],
    ['green', 'bg-noteGreen'],
    ['pink', 'bg-notePink'],
    ['purple', 'bg-notePurple'],
  ];


  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 bg-panel px-4 py-3 shadow">
      <button onClick={() => onCreateNote(color)} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-white active:translate-y-px">
        ➕ New Note
      </button>
      <div className="flex items-center gap-2">
        {colors.map(([k, cls]) => (
          <button
            key={k}
            aria-label={`color ${k}`}
            onClick={() => setColor(k)}
            className={`h-5 w-5 rounded-full border border-black/10 ${cls} ${
              k === color ? 'ring-2 ring-ink/70' : ''
            }`}
          ></button>
        ))}
      </div>
      <div className="ml-auto text-xs text-neutral-500">Drag to move • Corner to resize</div>
    </div>
  );
}
