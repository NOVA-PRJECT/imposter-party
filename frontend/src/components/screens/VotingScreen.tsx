import React, { useState } from 'react';
import { GameState } from '@/types/game';
import VotePlayerCard from '@/components/ui/VotePlayerCard';

interface VotingScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function VotingScreen({ gameState }: VotingScreenProps) {
  const { players, myId, myVote, voteProgress, timer, actions } = gameState;

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const me = players.find(p => p.id === myId);
  const hasVoted = Boolean(me?.hasVoted || myVote);

  const totalAlive = players.filter(p => p.isAlive).length;
  const votedCount = voteProgress
    ? voteProgress.votedCount
    : players.filter(p => p.isAlive && p.hasVoted).length;

  const handleConfirmVote = () => {
    if (selectedTargetId && !hasVoted) {
      actions.submitVote(selectedTargetId);
      setSelectedTargetId(null);
    }
  };

  const selectedPlayer = players.find(p => p.id === selectedTargetId);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-3 sm:p-6 bg-zinc-950">
      {/* Among Us Emergency Tablet Frame */}
      <div className="w-full max-w-2xl bg-zinc-900 border-4 sm:border-8 border-red-900/80 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-red-950/50 flex flex-col justify-between space-y-4">
        
        {/* Tablet Top Bar */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
            <span>📶 5G</span>
            <span>• EMERGENCY</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-wider text-white uppercase text-center font-sans">
            Who Is The Impostor?
          </h1>

          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
            <span className="bg-zinc-800 px-2 py-0.5 rounded font-bold text-accent">
              {votedCount}/{totalAlive} VOTED
            </span>
          </div>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2 max-h-[60vh] overflow-y-auto pr-1">
          {players.map(p => {
            const isMe = p.id === myId;
            const isVotedByMe = myVote === p.id;
            const isSelected = selectedTargetId === p.id;

            return (
              <VotePlayerCard
                key={p.id}
                player={p}
                isMe={isMe}
                hasVoted={hasVoted}
                isVotedByMe={isVotedByMe}
                isSelected={isSelected}
                onSelect={id => {
                  if (!hasVoted) {
                    setSelectedTargetId(id === selectedTargetId ? null : id);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Vote Confirmation Bar / Selected Target Bar */}
        {selectedPlayer && !hasVoted && (
          <div className="bg-zinc-800 border-2 border-yellow-400 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
            <div className="text-sm">
              <span className="text-zinc-400 block text-xs uppercase font-mono">Confirm Vote For:</span>
              <span className="font-black text-white text-base">{selectedPlayer.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTargetId(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 font-bold text-xs hover:bg-zinc-600 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 active:scale-95 uppercase tracking-wider"
              >
                CONFIRM VOTE ✓
              </button>
            </div>
          </div>
        )}

        {/* Bottom Bar: Status Message & Among Us Style Timer */}
        <div className="flex items-center justify-between border-t-2 border-zinc-800 pt-3">
          <div className="text-xs font-mono">
            {hasVoted ? (
              <span className="text-green-400 font-bold flex items-center gap-1">
                ✓ Vote submitted. Waiting for others...
              </span>
            ) : (
              <span className="text-yellow-400 font-bold animate-pulse">
                Tap a player to select & cast your vote
              </span>
            )}
          </div>

          <div className="font-mono text-sm font-black text-zinc-300 bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
            Voting Ends In: <span className="text-accent">{timer !== null ? `${timer}s` : '∞'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
