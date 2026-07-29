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
            ? 'bg-surface2/40 border-border opacity-50 cursor-not-allowed'
            : isSelected || isVotedByMe
            ? 'bg-surface border-accent ring-4 ring-accent/30 shadow-lg scale-[1.02]'
            : canSelect
            ? 'bg-surface hover:bg-surface2 border-border hover:border-accent cursor-pointer active:scale-95'
            : isMe
            ? 'bg-surface2/80 border-border opacity-90'
            : 'bg-surface2 border-border opacity-80'
        }`}
      >
        {/* "I VOTED" Badge Stamp during voting */}
        {player.hasVoted && !isProceeding && (
          <div className="absolute -top-2 -left-2 z-20 bg-danger text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-surface shadow-md transform -rotate-12 tracking-tighter uppercase animate-pulse">
            I VOTED
          </div>
        )}

        {/* Avatar Container */}
        <div className="relative shrink-0">
          <ColorCircle colorId={player.color} size="md" />

          {/* Dead Player Red Cross */}
          {!isAlive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <span className="text-danger font-black text-xl leading-none">❌</span>
            </div>
          )}
        </div>

        {/* Player Name */}
        <div className="flex-1 min-w-0">
          <span
            className={`font-black text-sm block truncate ${
              !isAlive
                ? 'text-muted line-through'
                : isMe
                ? 'text-accent font-extrabold'
                : 'text-primary'
            }`}
          >
            {player.name}
          </span>
          {isMe && (
            <span className="text-[10px] uppercase font-mono font-bold text-muted block -mt-0.5">
              (You)
            </span>
          )}
        </div>

        {/* Checkmark / Selected Badges */}
        {isSelected && !hasVoted && !isProceeding && (
          <div className="bg-accent text-white font-black text-xs px-2 py-1 rounded border border-accent shadow">
            SELECT
          </div>
        )}

        {isVotedByMe && !isProceeding && (
          <div className="bg-danger text-white font-black text-xs px-2 py-1 rounded shadow animate-bounce">
            VOTED
          </div>
        )}
      </div>

      {/* AMONG US STYLE VOTER COLOR CHIPS (SLIDING OUT UNDER PLAYER CARD DURING PROCEEDING PHASE) */}
      {isProceeding && (
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-1 bg-surface2 rounded-b-lg border-x border-b border-border animate-slideUp">
          <span className="text-[10px] font-mono text-muted font-bold uppercase mr-1">
            Voted By ({voters.length}):
          </span>
          {voters.length > 0 ? (
            voters.map(voter => (
              <div
                key={voter.id}
                title={`Voted by ${voter.name}`}
                className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border shadow-sm"
              >
                <ColorCircle colorId={voter.color} size="sm" />
                <span className="text-[10px] font-bold text-primary truncate max-w-[60px]">
                  {voter.name}
                </span>
              </div>
            ))
          ) : (
            <span className="text-[10px] font-mono text-muted italic">None</span>
          )}
        </div>
      )}
    </div>
  );
}
