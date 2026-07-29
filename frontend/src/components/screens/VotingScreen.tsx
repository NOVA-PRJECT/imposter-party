import React, { useState } from 'react';
import { GameState } from '@/types/game';
import VotePlayerCard from '@/components/ui/VotePlayerCard';
import { playVoteCast } from '@/lib/audioManager';

interface VotingScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function VotingScreen({ gameState }: VotingScreenProps) {
  const { phase, players, myId, myVote, voteProgress, voteBreakdown, timer, actions } = gameState;

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const me = players.find(p => p.id === myId);
  const hasVoted = Boolean(me?.hasVoted || myVote);
  const isProceeding = phase === 'proceeding';

  const totalAlive = players.filter(p => p.isAlive).length;
  const votedCount = voteProgress
    ? voteProgress.votedCount
    : players.filter(p => p.isAlive && p.hasVoted).length;

  const handleConfirmVote = () => {
    if (selectedTargetId && !hasVoted && !isProceeding) {
      playVoteCast();
      actions.submitVote(selectedTargetId);
      setSelectedTargetId(null);
    }
  };

  const selectedPlayer = players.find(p => p.id === selectedTargetId);

  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center p-3 sm:p-6 bg-background text-primary w-full">
      {/* Among Us Emergency Tablet Frame */}
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl bg-surface border-4 sm:border-8 border-border rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
        
        {/* Tablet Top Bar */}
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2 text-muted font-mono text-xs">
            <span>📶 5G</span>
            <span>• {isProceeding ? 'PROCEEDING' : 'EMERGENCY'}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-wider text-primary uppercase text-center font-sans">
            {isProceeding ? 'PROCEEDING...' : 'Who Is The Impostor?'}
          </h1>

          <div className="flex items-center gap-2 text-muted font-mono text-xs">
            <span className="bg-surface2 px-2 py-0.5 rounded font-bold text-accent border border-border">
              {isProceeding ? 'TALLY COMPLETE' : `${votedCount}/${totalAlive} VOTED`}
            </span>
          </div>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2 max-h-[60vh] overflow-y-auto pr-1">
          {players.map(p => {
            const isMe = p.id === myId;
            const isVotedByMe = myVote === p.id;
            const isSelected = selectedTargetId === p.id;

            const targetBreakdown = voteBreakdown?.find(b => b.targetId === p.id);
            const voters = targetBreakdown?.voters || [];

            return (
              <VotePlayerCard
                key={p.id}
                player={p}
                isMe={isMe}
                hasVoted={hasVoted}
                isVotedByMe={isVotedByMe}
                isSelected={isSelected}
                isProceeding={isProceeding}
                voters={voters}
                onSelect={id => {
                  if (!hasVoted && !isProceeding) {
                    setSelectedTargetId(id === selectedTargetId ? null : id);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Vote Confirmation Bar / Selected Target Bar */}
        {selectedPlayer && !hasVoted && !isProceeding && (
          <div className="bg-surface2 border-2 border-accent rounded-xl p-3 sm:p-4 flex items-center justify-between animate-fadeIn shadow-lg">
            <div className="text-sm">
              <span className="text-muted block text-xs uppercase font-mono">Confirm Vote For:</span>
              <span className="font-black text-primary text-base sm:text-lg">{selectedPlayer.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTargetId(null)}
                className="px-3 sm:px-4 py-2 rounded-lg bg-surface border border-border text-muted font-bold text-xs sm:text-sm hover:text-primary active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                className="px-4 sm:px-6 py-2 rounded-lg bg-danger hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-danger/30 active:scale-95 transition-transform uppercase tracking-wider"
              >
                CONFIRM VOTE ✓
              </button>
            </div>
          </div>
        )}

        {/* Bottom Bar: Status Message & Among Us Style Timer */}
        <div className="flex items-center justify-between border-t-2 border-border pt-3">
          <div className="text-xs sm:text-sm font-mono">
            {isProceeding ? (
              <span className="text-warning font-bold animate-pulse">
                Revealing votes... Ejection in 5s!
              </span>
            ) : hasVoted ? (
              <span className="text-success font-bold flex items-center gap-1">
                ✓ Vote submitted. Waiting for others...
              </span>
            ) : (
              <span className="text-accent font-bold animate-pulse">
                Tap a player to select & cast your vote
              </span>
            )}
          </div>

          <div className="font-mono text-sm sm:text-base font-black text-primary bg-surface2 px-3.5 py-1.5 rounded border border-border">
            {isProceeding ? 'Ejection In:' : 'Voting Ends In:'}{' '}
            <span className="text-accent">{timer !== null ? `${timer}s` : '5s'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
