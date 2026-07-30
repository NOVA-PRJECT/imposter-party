import React, { useState } from 'react';
import { GameState } from '@/types/game';
import VotePlayerCard from '@/components/ui/VotePlayerCard';
import { playVoteCast } from '@/lib/audioManager';

import Button from '@/components/ui/Button';

interface VotingScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function VotingScreen({ gameState }: VotingScreenProps) {
  const { phase, players, myId, myRole, myVote, voteProgress, voteBreakdown, timer, guessResult, actions } = gameState;

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [guessInput, setGuessInput] = useState('');

  const me = players.find(p => p.id === myId);
  const isImposter = myRole?.isImposter ?? false;
  const canGuess = isImposter && (me?.isAlive ?? false);

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

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessInput.trim()) {
      actions.clearGuessResult?.();
      actions.guessWord(guessInput.trim());
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

        {/* Imposter Word Guess Special Action Button */}
        {canGuess && !isProceeding && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                actions.clearGuessResult?.();
                setShowGuessModal(true);
              }}
              className="w-full py-2.5 px-4 bg-danger hover:bg-red-700 text-white font-black text-xs sm:text-sm rounded-xl border border-danger/40 shadow-lg shadow-danger/20 active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>🎯</span>
              <span>Guess Secret Word (Instant Imposter Win!)</span>
            </button>
          </div>
        )}

        {/* Bottom Bar: Status Message & Among Us Style Timer */}
        <div className="flex items-center justify-between border-t-2 border-border pt-3">
          <div className="text-xs sm:text-sm font-mono">
            {isProceeding ? (
              <span className="text-warning font-bold animate-pulse">
                Revealing votes... Ejection in 3s!
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
            <span className="text-accent">{timer !== null ? `${timer}s` : '3s'}</span>
          </div>
        </div>

      </div>

      {/* GUESS SECRET WORD MODAL */}
      {showGuessModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border-2 border-danger rounded-2xl p-6 max-w-md w-[92vw] space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowGuessModal(false);
                actions.clearGuessResult?.();
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xl p-1"
            >
              ✕
            </button>

            <div className="text-center border-b border-border pb-3">
              <span className="text-4xl">🎯</span>
              <h2 className="text-2xl font-extrabold text-danger uppercase tracking-wider">
                Guess Secret Word
              </h2>
              <p className="text-xs text-muted mt-1">
                If you guess the exact secret word, <strong>IMPOSTERS INSTANTLY WIN!</strong>
              </p>
            </div>

            {guessResult && !guessResult.success && (
              <div className="p-3 rounded-card bg-danger/10 border border-danger text-danger text-xs text-center font-bold animate-shake">
                {guessResult.message}
              </div>
            )}

            <form onSubmit={handleGuessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Exact Secret Word (Case Insensitive)
                </label>
                <input
                  type="text"
                  value={guessInput}
                  onChange={e => setGuessInput(e.target.value)}
                  placeholder="Type word here..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-surface2 border border-border rounded-card text-primary placeholder-muted focus:outline-none focus:border-danger font-bold text-lg text-center"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowGuessModal(false);
                    actions.clearGuessResult?.();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger">
                  Submit Guess 🚀
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
