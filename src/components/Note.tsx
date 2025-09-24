import { useEffect, useState, useRef } from "react";

// Color classes for notes
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
  initialWidth: number;
  initialHeight: number;
  initialContent: string;
  zIndex: number;
  isPlacementMode: boolean;
  onBringToFront: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onContentChange: (id: string, content: string) => void;
  onTrashZoneEnter: () => void;
  onTrashZoneLeave: () => void;
  onTrashZoneDrop: (id: string) => void;
}

export function Note({ id, color, initialX, initialY, initialWidth, initialHeight, initialContent, zIndex, isPlacementMode, onBringToFront, onPositionChange, onSizeChange, onContentChange, onTrashZoneEnter, onTrashZoneLeave, onTrashZoneDrop }: NoteProps) {
  const [entered, setEntered] = useState(false);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [content, setContent] = useState(initialContent);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isOverTrash, setIsOverTrash] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frameId);
  }, []);


  useEffect(() => {
    if (position.x !== initialX || position.y !== initialY) {
      onPositionChange(id, position.x, position.y);
    }
  }, [position.x, position.y, id, onPositionChange, initialX, initialY]);

  useEffect(() => {
    if (size.width !== initialWidth || size.height !== initialHeight) {
      onSizeChange(id, size.width, size.height);
    }
  }, [size.width, size.height, id, onSizeChange, initialWidth, initialHeight]);

  useEffect(() => {
    if (content !== initialContent) {
      onContentChange(id, content);
    }
  }, [content, id, onContentChange, initialContent]);

  const checkTrashZoneOverlap = (x: number, y: number) => {
    const trashZone = document.getElementById('trash-zone');
    if (!trashZone || !noteRef.current) return false;

    const container = noteRef.current.offsetParent as HTMLElement;
    if (!container) return false;

    const trashRect = trashZone.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Convert note position to viewport coordinates
    const noteViewportX = containerRect.left + x;
    const noteViewportY = containerRect.top + y;
    const noteBottom = noteViewportY + size.height;
    const noteRight = noteViewportX + size.width;

    // Check if note overlaps with trash zone
    const isOverlapping = (
      noteViewportX < trashRect.right &&
      noteRight > trashRect.left &&
      noteViewportY < trashRect.bottom &&
      noteBottom > trashRect.top
    );

    return isOverlapping;
  };

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

        // Check trash zone overlap
        const isCurrentlyOverTrash = checkTrashZoneOverlap(constrainedX, constrainedY);

        if (isCurrentlyOverTrash && !isOverTrash) {
          setIsOverTrash(true);
          onTrashZoneEnter();
        } else if (!isCurrentlyOverTrash && isOverTrash) {
          setIsOverTrash(false);
          onTrashZoneLeave();
        }
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
      if (isDragging && isOverTrash) {
        // Note is being dropped on trash zone
        onTrashZoneDrop(id);
        return; // Note will be deleted, no need to continue
      }

      setIsDragging(false);
      setIsResizing(false);

      // Reset trash zone state
      if (isOverTrash) {
        setIsOverTrash(false);
        onTrashZoneLeave();
      }
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
    if (isPlacementMode) return; // Don't handle drag during placement mode
    onBringToFront(id);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isPlacementMode) return; // Don't handle resize during placement mode
    e.stopPropagation();
    onBringToFront(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    setIsResizing(true);
  };

  // We could also debounce this if performance becomes an issue or save it on blur
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div
        ref={noteRef}
        className={`absolute select-none rounded-xl p-2 shadow-note outline-none ${colorCls[color]} flex flex-col ${
          isDragging || isResizing ? 'transition-none' : 'transition-all duration-150'
        } ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'} ${
          isOverTrash ? 'scale-90 opacity-75 ring-2 ring-red-500/10' : ''
        } ${isPlacementMode ? 'pointer-events-none opacity-50' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: zIndex
        }}
        role="region"
        aria-label={`${color} sticky note`}
        aria-describedby={`note-content-${id}`}
      >
        <div
          className={`flex items-center justify-between gap-2 rounded-lg px-1 py-0.5 text-[11px] font-semibold text-neutral-700 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          role="button"
          tabIndex={0}
          aria-label="Drag to move note"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onBringToFront(id);
            }
          }}
        >
          <div>Note</div>
        </div>
        <div className="mt-1 flex-1 min-h-0">
          <textarea
            id={`note-content-${id}`}
            className="h-full w-full resize-none bg-transparent outline-none transition-[background] focus:bg-white/30"
            placeholder="Type here..."
            value={content}
            onChange={handleContentChange}
            aria-label="Note content"
            rows={4}
          />
        </div>
        <div
          title="Resize note"
          className="absolute right-1 bottom-1 h-3 w-3 cursor-nwse-resize border-b-2 border-r-2 border-black/30"
          onMouseDown={handleResizeMouseDown}
          role="button"
          tabIndex={0}
          aria-label="Resize note"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onBringToFront(id);
            }
          }}
        />
      </div>
  );
}
