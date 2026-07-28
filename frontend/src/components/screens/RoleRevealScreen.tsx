import React from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';
import Button from '@/components/ui/Button';

interface RoleRevealScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function RoleRevealScreen({ gameState }: RoleRevealScreenProps) {
  const { myRole, isHost, actions } = gameState;

  const isImposter = myRole?.isImposter ?? false;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between px-6 py-10 transition-colors ${
        isImposter ? 'bg-[#1A0000]' : 'bg-[#0A0A0A]'
      }`}
    >
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto space-y-6">
        {/* Role Badge */}
        {isImposter ? (
          <div className="inline-block px-4 py-1 rounded-full bg-danger/20 border border-danger text-danger text-xs font-mono font-bold uppercase tracking-widest">
            🔴 IMPOSTER
          </div>
        ) : (
          <div className="inline-block px-4 py-1 rounded-full bg-success/20 border border-success text-success text-xs font-mono font-bold uppercase tracking-widest">
            🟢 CREWMATE
          </div>
        )}

        {/* Secret Word or Imposter Alert */}
        {isImposter ? (
          <div className="space-y-4">
            <span className="text-muted text-sm font-mono uppercase tracking-wider block">
              YOU ARE
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-danger accent-glow tracking-tight">
              THE IMPOSTER
            </h1>

            {myRole?.hint && (
              <div className="mt-4 p-4 rounded-card bg-surface/50 border border-border">
                <span className="text-xs text-muted font-mono uppercase block mb-1">
                  Your Hint
                </span>
                <span className="text-xl font-bold text-warning font-mono">
                  "{myRole.hint}"
                </span>
              </div>
            )}

            {myRole?.fellowImposters && myRole.fellowImposters.length > 0 && (
              <div className="mt-4 p-4 rounded-card bg-surface/50 border border-border">
                <span className="text-xs text-muted font-mono uppercase block mb-2">
                  Fellow Imposters
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {myRole.fellowImposters.map((fellow, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <ColorCircle colorId={fellow.color} size="sm" />
                      <span className="text-sm font-semibold text-primary">{fellow.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs italic text-muted mt-6">
              Blend in. Don't get caught.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-muted text-sm font-mono uppercase tracking-wider block">
              YOUR WORD IS
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-accent accent-glow tracking-tight break-words">
              {myRole?.word || '???'}
            </h1>

            {myRole?.meaning && (
              <div className="mt-4 p-4 rounded-card bg-surface/50 border border-border max-w-sm">
                <span className="text-xs text-muted font-mono uppercase block mb-1">
                  Meaning
                </span>
                <p className="text-sm text-primary">
                  {myRole.meaning}
                </p>
              </div>
            )}

            <p className="text-xs italic text-muted mt-6">
              Remember it. Don't say it directly.
            </p>
          </div>
        )}
      </div>

      {/* Host Controls / Footer */}
      <div className="w-full max-w-md pt-6 border-t border-border/40 text-center">
        {isHost ? (
          <Button onClick={actions.discussionReady} variant="accent" fullWidth>
            Everyone's Ready — Start Discussion
          </Button>
        ) : (
          <p className="text-sm text-muted font-mono animate-pulse">
            Waiting for host to start discussion...
          </p>
        )}
      </div>
    </div>
  );
}
