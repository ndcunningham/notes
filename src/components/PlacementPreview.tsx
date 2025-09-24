import { useEffect, useState } from 'react';

// Color classes for notes
const colorCls = {
  yellow: 'bg-noteYellow',
  pink: 'bg-notePink',
  blue: 'bg-noteBlue',
  green: 'bg-noteGreen',
  purple: 'bg-notePurple',
} as any;

interface PlacementPreviewProps {
  color: string;
  width: number;
  height: number;
}

export function PlacementPreview({ color, width, height }: PlacementPreviewProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`fixed pointer-events-none select-none rounded-xl p-2 shadow-note opacity-60 ${colorCls[color]} flex flex-col z-[9999]`}
      style={{
        left: `${mousePos.x - width / 2}px`,
        top: `${mousePos.y - height / 2}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="flex items-center justify-between gap-2 rounded-lg px-1 py-0.5 text-[11px] font-semibold text-neutral-700">
        <div>Note</div>
      </div>
      <div className="mt-1 flex-1 min-h-0">
        <div className="h-full w-full rounded border-2 border-dashed border-neutral-400/50 flex items-center justify-center text-xs text-neutral-500">
          Click to place
        </div>
      </div>
    </div>
  );
}