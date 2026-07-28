import React, { useState } from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';
import Button from '@/components/ui/Button';

interface DiscussionScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function DiscussionScreen({ gameState }: DiscussionScreenProps) {
  const { players, myRole, isHost, actions } = gameState;
  const [showConfirm, setShowConfirm] = useState(false);

  const isImposter = myRole?.isImposter ?? false;

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 max-w-md mx-auto justify-between">
      {/* Top Header & Reminder */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-accent">
            Active Phase
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            DISCUSS
          </h1>
          <p className="text-xs text-muted">Talk out loud in the room to find the imposter!</p>
        </div>

        {/* Word / Role Reminder Card */}
        <div className="p-4 rounded-card bg-surface2 border border-border space-y-1">
          <span className="text-[11px] font-mono uppercase text-muted block">
            Your Secret Info
          </span>
          {isImposter ? (
            <div>
              <span className="font-bold text-danger">You are the IMPOSTER 🔴</span>
              {myRole?.hint && (
                <span className="block text-xs text-warning mt-0.5">
                  Hint: "{myRole.hint}"
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="font-bold text-accent text-lg block">
                {myRole?.word}
              </span>
              {myRole?.meaning && (
                <span className="text-xs text-muted block mt-0.5">
                  {myRole.meaning}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="bg-surface border border-border rounded-card p-4 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted">
            Players Status
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {players.map(p => (
              <div
                key={p.id}
                className={`flex items-center gap-2 p-2 rounded-card border ${
                  p.isAlive
                    ? 'bg-surface2 border-border'
                    : 'bg-surface2/30 border-border opacity-40 line-through'
                }`}
              >
                <ColorCircle colorId={p.color} size="sm" />
                <span className="text-xs font-medium truncate text-primary">
                  {p.name}
                </span>
                {!p.isAlive && (
                  <span className="text-[10px] text-danger ml-auto font-mono no-underline">
                    Dead
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Host Call Vote Action */}
      <div className="pt-6">
        {isHost ? (
          showConfirm ? (
            <div className="p-4 rounded-card bg-surface border border-accent space-y-3 text-center">
              <span className="text-sm font-bold text-primary block">
                Start voting process now?
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowConfirm(false);
                    actions.callVote();
                  }}
                >
                  Confirm Vote
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-32 h-32 rounded-full bg-danger hover:bg-red-700 text-white font-bold tracking-wider shadow-2xl shadow-danger/40 border-4 border-white/20 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
              >
                <span className="text-2xl">🚨</span>
                <span className="text-sm font-mono uppercase">CALL VOTE</span>
              </button>
            </div>
          )
        ) : (
          <div className="text-center p-4">
            <p className="text-sm text-muted font-mono animate-pulse">
              Waiting for host to call a vote...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
