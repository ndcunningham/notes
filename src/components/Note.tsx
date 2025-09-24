import { useEffect, useState, useRef } from "react";

const colorCls = {
  yellow: 'bg-noteYellow',
  pink: 'bg-notePink',
  blue: 'bg-noteBlue',
  green: 'bg-noteGreen',
  purple: 'bg-notePurple',
} as any;

interface NoteProps {
  id: string;
  color: string;
  initialX: number;
  initialY: number;
  onDelete: (id: string) => void;
}

export function Note({ id, color, initialX, initialY, onDelete }: NoteProps) {
  const [entered, setEntered] = useState(false);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: 180, height: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Get container bounds
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Constrain position within container
        const constrainedX = Math.max(0, Math.min(newX, containerWidth - size.width));
        const constrainedY = Math.max(0, Math.min(newY, containerHeight - size.height));

        setPosition({ x: constrainedX, y: constrainedY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        // Get container bounds
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Calculate max size based on current position
        const maxWidth = containerWidth - position.x;
        const maxHeight = containerHeight - position.y;

        const newWidth = Math.max(140, Math.min(resizeStart.width + deltaX, maxWidth));
        const newHeight = Math.max(100, Math.min(resizeStart.height + deltaY, maxHeight));

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, size, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    setIsResizing(true);
  };

  return (
    <div
        ref={noteRef}
        className={`absolute select-none rounded-xl p-2 shadow-note outline-none ${colorCls[color]} flex flex-col ${
          isDragging || isResizing ? 'transition-none' : 'transition-all duration-150'
        } ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`
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
            onClick={() => onDelete(id)}
          >
            ✖
          </button>
        </div>
        <div className="mt-1 flex-1 min-h-0">
          <textarea
            className="h-full w-full resize-none bg-transparent outline-none transition-[background] focus:bg-white/30"
            placeholder="Type here..."
          />
        </div>
        <div
          title="Resize"
          className="absolute right-1 bottom-1 h-3 w-3 cursor-nwse-resize border-b-2 border-r-2 border-black/30"
          onMouseDown={handleResizeMouseDown}
        />
      </div>
  );
}
