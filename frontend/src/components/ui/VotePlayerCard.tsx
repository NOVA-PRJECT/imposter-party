import React from 'react';
import { Player, ColorId } from '@/types/game';
import ColorCircle from './ColorCircle';

interface VotePlayerCardProps {
  player: Player;
  isMe: boolean;
  hasVoted: boolean;
  isVotedByMe: boolean;
  isSelected: boolean;
  isProceeding?: boolean;
  voters?: { id: string; name: string; color: ColorId }[];
  onSelect: (playerId: string) => void;
}

export default function VotePlayerCard({
  player,
  isMe,
  hasVoted,
  isVotedByMe,
  isSelected,
  isProceeding = false,
  voters = [],
  onSelect,
}: VotePlayerCardProps) {
  const isAlive = player.isAlive;
  const canSelect = !isMe && !hasVoted && isAlive && !isProceeding;

  return (
    <div className="flex flex-col space-y-1">
      <div
        onClick={() => canSelect && onSelect(player.id)}
        className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all select-none ${
          !isAlive
            ? 'bg-zinc-800/60 border-zinc-700 opacity-60 cursor-not-allowed'
            : isSelected || isVotedByMe
            ? 'bg-white border-yellow-400 ring-4 ring-yellow-400/40 shadow-lg scale-[1.02]'
            : canSelect
            ? 'bg-slate-100 hover:bg-white border-slate-300 hover:border-yellow-400 cursor-pointer active:scale-95'
            : isMe
            ? 'bg-slate-200/80 border-slate-300 opacity-90'
            : 'bg-slate-200 border-slate-300 opacity-80'
        }`}
      >
        {/* "I VOTED" Badge Stamp during voting */}
        {player.hasVoted && !isProceeding && (
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

        {/* Checkmark / Selected Badges */}
        {isSelected && !hasVoted && !isProceeding && (
          <div className="bg-yellow-400 text-slate-950 font-black text-xs px-2 py-1 rounded border border-yellow-500 shadow">
            SELECT
          </div>
        )}

        {isVotedByMe && !isProceeding && (
          <div className="bg-red-600 text-white font-black text-xs px-2 py-1 rounded shadow animate-bounce">
            VOTED
          </div>
        )}
      </div>

      {/* AMONG US STYLE VOTER COLOR CHIPS (SLIDING OUT UNDER PLAYER CARD DURING PROCEEDING PHASE) */}
      {isProceeding && (
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-1 bg-zinc-950/80 rounded-b-lg border-x border-b border-zinc-800 animate-slideUp">
          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase mr-1">
            Voted By ({voters.length}):
          </span>
          {voters.length > 0 ? (
            voters.map(voter => (
              <div
                key={voter.id}
                title={`Voted by ${voter.name}`}
                className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700 shadow-sm"
              >
                <ColorCircle colorId={voter.color} size="sm" />
                <span className="text-[10px] font-bold text-zinc-200 truncate max-w-[60px]">
                  {voter.name}
                </span>
              </div>
            ))
          ) : (
            <span className="text-[10px] font-mono text-zinc-600 italic">None</span>
          )}
        </div>
      )}
    </div>
  );
}
