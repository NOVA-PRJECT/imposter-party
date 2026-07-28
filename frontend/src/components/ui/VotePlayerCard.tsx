import React from 'react';
import { Player } from '@/types/game';
import ColorCircle from './ColorCircle';

interface VotePlayerCardProps {
  player: Player;
  isMe: boolean;
  hasVoted: boolean;
  isVotedByMe: boolean;
  onVote: (playerId: string) => void;
}

export default function VotePlayerCard({
  player,
  isMe,
  hasVoted,
  isVotedByMe,
  onVote,
}: VotePlayerCardProps) {
  const canTap = !isMe && !hasVoted && player.isAlive;

  return (
    <button
      type="button"
      disabled={!canTap}
      onClick={() => canTap && onVote(player.id)}
      className={`flex flex-col items-center justify-center p-4 rounded-card border transition-all ${
        isVotedByMe
          ? 'bg-accent/10 border-accent scale-105 shadow-lg shadow-accent/20'
          : hasVoted
          ? 'bg-surface2/50 border-border opacity-75'
          : isMe
          ? 'bg-surface2/40 border-border opacity-60 cursor-not-allowed'
          : 'bg-surface2 border-border hover:border-accent/50 active:scale-95'
      }`}
    >
      <div className="relative mb-2">
        <ColorCircle colorId={player.color} size="lg" voteBadge={player.voteCount} />
        {isVotedByMe && (
          <div className="absolute inset-0 rounded-full ring-4 ring-accent flex items-center justify-center bg-black/40">
            <span className="text-accent text-2xl font-bold">✓</span>
          </div>
        )}
      </div>

      <span className="font-bold text-sm text-primary truncate max-w-full text-center">
        {player.name}
      </span>

      {isMe ? (
        <span className="text-[10px] uppercase font-mono tracking-wider text-muted mt-1">(You)</span>
      ) : isVotedByMe ? (
        <span className="text-xs font-semibold text-accent mt-1">Your Vote</span>
      ) : (
        <span className="h-4"></span>
      )}
    </button>
  );
}
