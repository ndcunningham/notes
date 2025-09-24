import { useState, forwardRef } from 'react';

interface ToolbarProps {
  onCreateNote: (color: string, width: number, height: number) => void;
  onStartPlacement: (color: string, width: number, height: number) => void;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar({ onCreateNote, onStartPlacement }, ref) {
  const [color, setColor] = useState('yellow');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const colors: Array<[string, string]> = [
    ['yellow', 'bg-noteYellow'],
    ['blue', 'bg-noteBlue'],
    ['green', 'bg-noteGreen'],
    ['pink', 'bg-notePink'],
    ['purple', 'bg-notePurple'],
  ];

  const sizes = {
    small: { width: 140, height: 100, label: 'S' },
    medium: { width: 180, height: 120, label: 'M' },
    large: { width: 220, height: 160, label: 'L' }
  };

  const handleCreateNote = () => {
    const { width, height } = sizes[size];
    onStartPlacement(color, width, height);
  };


  return (
    <div ref={ref} className="sticky top-0 z-50 flex items-center gap-3 bg-panel px-4 py-3 shadow" role="toolbar" aria-label="Note creation toolbar">
      <button
        onClick={handleCreateNote}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-white active:translate-y-px"
        aria-describedby="selected-options"
      >
        ➕ New Note
      </button>
      <div className="flex items-center gap-2" role="group" aria-label="Color selection">
        {colors.map(([k, cls]) => (
          <button
            key={k}
            aria-label={`Select ${k} color`}
            aria-pressed={k === color}
            onClick={() => setColor(k)}
            className={`h-5 w-5 rounded-full border border-black/10 ${cls} ${
              k === color ? 'ring-2 ring-ink/70' : ''
            }`}
          ></button>
        ))}
      </div>
      <div className="flex items-center gap-2" role="group" aria-label="Size selection">
        {Object.entries(sizes).map(([k, { label }]) => (
          <button
            key={k}
            aria-label={`Select ${k} size`}
            aria-pressed={k === size}
            onClick={() => setSize(k as 'small' | 'medium' | 'large')}
            className={`h-6 w-6 rounded border text-xs font-medium transition-colors ${
              k === size
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id="selected-options"
        className="ml-auto text-xs text-neutral-500"
        aria-live="polite"
      >
        {color} • {size} • Click to place
      </div>
    </div>
  );
});
