import { useEffect, useState } from 'react';

interface TrashZoneProps {
  isActive: boolean;
}

export function TrashZone({ isActive }: TrashZoneProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
    } else {
      const timeout = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  return (
    <div
      id="trash-zone"
      className={`fixed bottom-0 left-0 right-0 h-20 flex items-center justify-center transition-all duration-200 ${
        isActive
          ? 'bg-red-500/20 border-t-4 border-red-500'
          : 'bg-neutral-100/50 border-t border-neutral-200'
      } ${isAnimating ? 'animate-pulse' : ''}`}
    >
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-red-500 text-white scale-110'
          : 'bg-neutral-200 text-neutral-600'
      }`}>
        <span className="text-2xl">🗑️</span>
        <span className="text-sm font-medium">
          {isActive ? 'Release to Delete' : 'Drop here to delete'}
        </span>
      </div>
    </div>
  );
}