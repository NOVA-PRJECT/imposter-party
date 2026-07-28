import React from 'react';
import { PLAYER_COLORS } from '@/lib/colors';
import { ColorId } from '@/types/game';

interface ColorPickerProps {
  currentColor: ColorId;
  occupiedColors: ColorId[];
  onSelect: (colorId: ColorId) => void;
  onClose: () => void;
}

export default function ColorPicker({
  currentColor,
  occupiedColors,
  onSelect,
  onClose,
}: ColorPickerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-card p-6 w-full max-w-sm flex flex-col items-center">
        <h3 className="text-xl font-bold mb-4 text-primary">Choose Your Color</h3>
        
        <div className="grid grid-cols-6 gap-3 mb-6 w-full place-items-center">
          {PLAYER_COLORS.map(c => {
            const isSelected = c.id === currentColor;
            const isOccupied = occupiedColors.includes(c.id) && !isSelected;

            return (
              <button
                key={c.id}
                type="button"
                disabled={isOccupied}
                onClick={() => {
                  onSelect(c.id);
                  onClose();
                }}
                className={`w-10 h-10 rounded-full transition-transform min-touch flex items-center justify-center ${
                  isSelected ? 'ring-4 ring-white scale-110' : ''
                } ${isOccupied ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                style={{ backgroundColor: c.hex }}
                title={isOccupied ? `${c.label} (Taken)` : c.label}
              >
                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-card bg-surface2 text-muted hover:text-primary transition-colors text-sm font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
