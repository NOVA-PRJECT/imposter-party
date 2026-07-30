import React, { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';
import Button from '@/components/ui/Button';

interface VoteResultScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function VoteResultScreen({ gameState }: VoteResultScreenProps) {
  const { voteResult, isHost, actions } = gameState;
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setRevealed(true);
    }, 400);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(revealTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  if (!voteResult) {
    return <div className="text-center p-8 text-muted">Calculating votes...</div>;
  }

  const { eliminated, tie, players } = voteResult;

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 max-w-md mx-auto justify-between space-y-6">
      {/* Result Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto">
        {tie || !eliminated ? (
          <div className="space-y-3">
            <div className="text-5xl">⚖️</div>
            <h1 className="text-2xl font-bold text-primary">It's a Tie!</h1>
            <p className="text-sm text-muted">No one was eliminated this round.</p>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <ColorCircle colorId={eliminated.color} size="xl" className="mx-auto shadow-2xl" />

            <h1 className="text-2xl font-bold text-primary">
              {eliminated.name}
            </h1>
            <p className="text-xs uppercase font-mono tracking-widest text-muted">
              was voted off
            </p>

            {revealed ? (
              <div
                className={`p-4 rounded-card border text-lg font-bold transition-all animate-bounce ${
                  eliminated.wasImposter
                    ? 'bg-success/20 border-success text-success'
                    : 'bg-danger/20 border-danger text-danger'
                }`}
              >
                {eliminated.wasImposter
                  ? '✅ They WERE An Imposter!'
                  : '❌ They were NOT An Imposter!'}
              </div>
            ) : (
              <div className="p-4 rounded-card bg-surface2 border border-border text-sm text-muted animate-pulse">
                Revealing identity...
              </div>
            )}
          </div>
        )}

        {/* Vote Breakdown */}
        <div className="w-full bg-surface border border-border rounded-card p-4 space-y-2 mt-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted text-left mb-2">
            Vote Breakdown
          </h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {players.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-card bg-surface2 border border-border text-xs"
              >
                <div className="flex items-center gap-2">
                  <ColorCircle colorId={p.color} size="sm" />
                  <span className="font-medium text-primary">{p.name}</span>
                </div>
                <span className="font-mono font-bold text-accent">
                  {p.voteCount} vote{p.voteCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Advance & Host Actions */}
      <div className="pt-4 border-t border-border text-center space-y-3">
        <div className="text-sm font-mono text-accent font-bold animate-pulse">
          Starting Next Round in {countdown}s... 🔔
        </div>
        {isHost && (
          <Button onClick={actions.nextRound} variant="accent" fullWidth>
            Start Next Round Now ⏩
          </Button>
        )}
      </div>
    </div>
  );
}
