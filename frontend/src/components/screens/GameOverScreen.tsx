import React, { useEffect } from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';
import Button from '@/components/ui/Button';
import { playVictory } from '@/lib/audioManager';

interface GameOverScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function GameOverScreen({ gameState }: GameOverScreenProps) {
  const { voteResult, isHost, actions } = gameState;

  const winCondition = voteResult?.winCondition;
  const revealedPlayers = voteResult?.revealedPlayers || [];
  const word = voteResult?.word;

  const isCrewmateWin = winCondition === 'crewmates';

  useEffect(() => {
    playVictory();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-between px-4 py-8 max-w-md sm:max-w-lg mx-auto transition-colors bg-background text-primary">
      <div className="w-full space-y-6 text-center my-auto">
        {/* Victory Header */}
        <div>
          {isCrewmateWin ? (
            <div className="space-y-2">
              <span className="text-5xl">🎉</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-success accent-glow">
                CREWMATES WIN
              </h1>
              <p className="text-xs text-muted">All imposters were eliminated!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-5xl">🔴</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-danger accent-glow">
                IMPOSTERS WIN
              </h1>
              <p className="text-xs text-muted">The imposters took over the group!</p>
            </div>
          )}
        </div>

        {/* Revealed Secret Word */}
        {word && (
          <div className="p-4 rounded-card bg-surface border border-border">
            <span className="text-xs font-mono uppercase text-muted block mb-1">
              The Secret Word Was
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-accent font-sans">
              "{word}"
            </span>
          </div>
        )}

        {/* Full Player Identity List */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-3 text-left shadow-lg">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
            Player Identities
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {revealedPlayers.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-card bg-surface2 border border-border"
              >
                <div className="flex items-center gap-3">
                  <ColorCircle colorId={p.color} size="md" />
                  <div>
                    <span className="font-semibold text-sm text-primary block">{p.name}</span>
                    <span className="text-[10px] text-muted font-mono">
                      {p.isAlive ? 'Survived' : 'Eliminated'}
                    </span>
                  </div>
                </div>

                <div>
                  {p.isImposter ? (
                    <span className="px-2 py-0.5 rounded bg-danger/20 text-danger border border-danger/40 font-mono text-xs font-bold">
                      IMPOSTER
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-success/20 text-success border border-success/40 font-mono text-xs font-bold">
                      CREWMATE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-2 pt-4 border-t border-border">
        {isHost && (
          <Button onClick={actions.playAgain} variant="accent" fullWidth>
            Play Again (Keep Room)
          </Button>
        )}
        <Button onClick={actions.leaveRoom} variant="secondary" fullWidth>
          Leave Room
        </Button>
      </div>
    </div>
  );
}
