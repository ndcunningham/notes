import { useEffect, useState, useRef } from "react";

const colorCls = {
  yellow: 'bg-noteYellow',
  pink: 'bg-notePink',
  blue: 'bg-noteBlue',
  green: 'bg-noteGreen',
  purple: 'bg-notePurple',
} as any;

export function Note() {
  const [entered, setEntered] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setIsDragging(true);
  };

  return (
    <div
        ref={noteRef}
        className={`absolute select-none rounded-xl p-2 shadow-note outline-none bg-noteYellow ${
          isDragging ? 'transition-none' : 'transition-all duration-150'
        } ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        role="group"
        aria-label="Sticky note"
      >
        <div
          className={`flex items-center justify-between gap-2 rounded-lg px-1 py-0.5 text-[11px] font-semibold text-neutral-700 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
        >
          <div>Note</div>
          <button
            className="rounded p-1 text-neutral-700 hover:bg-black/5"
            aria-label="Delete"
          >
            ✖
          </button>
        </div>
        <div className="mt-1 min-h-[80px] min-w-[140px]">
          <textarea
            className="h-full w-full resize-none bg-transparent outline-none transition-[background] focus:bg-white/30"
            placeholder="Type here..."
          />
        </div>
        <div
          title="Resize"
          className="absolute right-1 bottom-1 h-3 w-3 cursor-nwse-resize border-b-2 border-r-2 border-black/30"
        />
      </div>
  );
}
