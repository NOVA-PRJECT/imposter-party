import React, { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import ColorCircle from './ColorCircle';

interface PlayerCardProps {
  player: Player;
  isMe: boolean;
  onTap?: () => void;
}

export default function PlayerCard({ player, isMe, onTap }: PlayerCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!player.disconnectExpiresAt) return 10;
    return Math.max(0, Math.ceil((player.disconnectExpiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!player.disconnected || !player.disconnectExpiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((player.disconnectExpiresAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [player.disconnected, player.disconnectExpiresAt]);

  return (
    <div
      onClick={isMe ? onTap : undefined}
      className={`flex items-center gap-3 p-3 rounded-card bg-surface2 border ${
        isMe ? 'border-accent shadow-md shadow-accent/10 cursor-pointer hover:bg-surface2/80' : 'border-border'
      } ${player.disconnected ? 'opacity-60 border-danger/40' : ''}`}
    >
      <ColorCircle colorId={player.color} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-primary truncate">{player.name}</span>
          {player.isHost && (
            <span title="Host" className="text-warning text-xs">👑</span>
          )}
        </div>
        {isMe && (
          <span className="text-xs text-accent font-medium">Tap to change color</span>
        )}
      </div>
      {player.disconnected && (
        <div className="flex flex-col items-end">
          <span className="text-xs text-danger font-mono font-bold animate-pulse">
            Offline ({timeLeft}s)
          </span>
          <span className="text-[9px] text-muted font-mono">Reconnecting...</span>
        </div>
      )}
    </div>
  );
}
