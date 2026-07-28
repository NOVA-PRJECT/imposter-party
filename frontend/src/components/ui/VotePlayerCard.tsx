import React from 'react';
import { Player } from '@/types/game';
import ColorCircle from './ColorCircle';

interface VotePlayerCardProps {
  player: Player;
  isMe: boolean;
  hasVoted: boolean;
  isVotedByMe: boolean;
  isSelected: boolean;
  onSelect: (playerId: string) => void;
}

export default function VotePlayerCard({
  player,
  isMe,
  hasVoted,
  isVotedByMe,
  isSelected,
  onSelect,
}: VotePlayerCardProps) {
  const isAlive = player.isAlive;
  const canSelect = !isMe && !hasVoted && isAlive;

  return (
    <div
      onClick={() => canSelect && onSelect(player.id)}
      className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all select-none ${
        !isAlive
          ? 'bg-zinc-800/60 border-zinc-700 opacity-60 cursor-not-allowed'
          : isSelected || isVotedByMe
          ? 'bg-white border-yellow-400 ring-4 ring-yellow-400/40 shadow-lg scale-[1.02] cursor-pointer'
          : canSelect
          ? 'bg-slate-100 hover:bg-white border-slate-300 hover:border-yellow-400 cursor-pointer active:scale-95'
          : isMe
          ? 'bg-slate-200/80 border-slate-300 opacity-90 cursor-not-allowed'
          : 'bg-slate-200 border-slate-300 opacity-75'
      }`}
    >
      {/* "I VOTED" Badge Stamp */}
      {player.hasVoted && (
        <div className="absolute -top-2 -left-2 z-20 bg-red-600 text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-md transform -rotate-12 tracking-tighter uppercase animate-pulse">
          I VOTED
        </div>
      )}

      {/* Avatar Container */}
      <div className="relative shrink-0">
        <ColorCircle colorId={player.color} size="md" />

        {/* Dead Player Red Cross */}
        {!isAlive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <span className="text-red-500 font-black text-xl leading-none">❌</span>
          </div>
        )}
      </div>

      {/* Player Name */}
      <div className="flex-1 min-w-0">
        <span
          className={`font-black text-sm block truncate ${
            !isAlive
              ? 'text-zinc-500 line-through'
              : isMe
              ? 'text-red-600'
              : 'text-slate-900'
          }`}
        >
          {player.name}
        </span>
        {isMe && (
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 block -mt-0.5">
            (You)
          </span>
        )}
      </div>

      {/* Checkmark indicator for selected target */}
      {isSelected && !hasVoted && (
        <div className="bg-yellow-400 text-slate-950 font-black text-xs px-2 py-1 rounded border border-yellow-500 shadow">
          SELECT
        </div>
      )}

      {isVotedByMe && (
        <div className="bg-red-600 text-white font-black text-xs px-2 py-1 rounded shadow animate-bounce">
          VOTED
        </div>
      )}
    </div>
  );
}
