import React from 'react';
import { Player } from '@/types/game';
import ColorCircle from './ColorCircle';

interface PlayerCardProps {
  player: Player;
  isMe: boolean;
  onTap?: () => void;
}

export default function PlayerCard({ player, isMe, onTap }: PlayerCardProps) {
  return (
    <div
      onClick={isMe ? onTap : undefined}
      className={`flex items-center gap-3 p-3 rounded-card bg-surface2 border ${
        isMe ? 'border-accent shadow-md shadow-accent/10 cursor-pointer hover:bg-surface2/80' : 'border-border'
      } ${player.disconnected ? 'opacity-50' : ''}`}
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
        <span className="text-xs text-danger font-mono font-bold">Offline</span>
      )}
    </div>
  );
}
