import React from 'react';
import { ColorId } from '@/types/game';
import { getColor } from '@/lib/colors';

interface ColorCircleProps {
  colorId: ColorId | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  voteBadge?: number;
  className?: string;
  showCheckmark?: boolean;
}

export default function ColorCircle({
  colorId,
  size = 'md',
  voteBadge,
  className = '',
  showCheckmark = false,
}: ColorCircleProps) {
  const colorData = getColor(colorId);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-2xl',
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${sizeClasses[size]} ${className}`} style={{ backgroundColor: colorData.hex }}>
      {showCheckmark && (
        <span className="text-white font-bold drop-shadow">✓</span>
      )}
      {typeof voteBadge === 'number' && voteBadge > 0 && (
        <div className="absolute -top-1 -right-1 bg-black/80 text-white font-mono font-bold px-2 py-0.5 rounded-full text-xs border border-white/20 shadow-md">
          {voteBadge}
        </div>
      )}
    </div>
  );
}
