import React, { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';
import Button from '@/components/ui/Button';
import { playEmergencyMeeting, playRoleReveal } from '@/lib/audioManager';

interface DiscussionScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function DiscussionScreen({ gameState }: DiscussionScreenProps) {
  const { players, myRole, isHost, actions } = gameState;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isWordVisible, setIsWordVisible] = useState(true);

  const isImposter = myRole?.isImposter ?? false;

  useEffect(() => {
    // Play uniform role reveal sound for all players on screen load
    playRoleReveal();
  }, []);

  const handleConfirmVote = () => {
    setShowConfirm(false);
    playEmergencyMeeting();
    actions.callVote();
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto justify-between space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-mono tracking-widest text-accent font-bold">
          Discussion Phase
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          DISCUSS & FIND IMPOSTER
        </h1>
        <p className="text-xs text-zinc-400">Talk out loud in the room without giving away the word!</p>
      </div>

      {/* 3D Animated Secret Word / Role Card */}
      <div className="perspective-1000 my-2">
        <div
          className={`relative w-full rounded-2xl p-5 border-2 transition-all duration-500 transform-gpu shadow-2xl ${
            isImposter
              ? 'bg-gradient-to-br from-red-950 to-zinc-900 border-red-600 shadow-red-950/50'
              : 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-accent/60 shadow-accent/20'
          } ${isWordVisible ? 'scale-100 rotate-0' : 'scale-95 opacity-90'}`}
        >
          {/* Card Top Label & Peek Toggle */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              {isImposter ? '🔴 Your Role' : '🟢 Secret Word'}
            </span>
            <button
              type="button"
              onClick={() => setIsWordVisible(!isWordVisible)}
              className="text-xs font-mono font-bold text-accent bg-surface2 px-2.5 py-1 rounded-full border border-border hover:border-accent"
            >
              {isWordVisible ? '🙈 Hide Info' : '👁️ Peek Secret Info'}
            </button>
          </div>

          {/* Animated Card Content */}
          {isWordVisible ? (
            <div className="text-center space-y-3 py-2 animate-fadeIn">
              {isImposter ? (
                <div>
                  <h2 className="text-3xl font-black text-danger tracking-wider uppercase animate-pulse">
                    YOU ARE THE IMPOSTER
                  </h2>
                  {myRole?.hint ? (
                    <div className="mt-3 p-3 rounded-xl bg-black/40 border border-yellow-500/30 inline-block">
                      <span className="text-xs text-zinc-400 block uppercase font-mono mb-0.5">Clue Hint:</span>
                      <span className="text-lg font-bold text-yellow-400 font-mono">"{myRole.hint}"</span>
                    </div>
                  ) : (
                    <p className="text-xs italic text-zinc-400 mt-2">No hint enabled. Fake confidence!</p>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-4xl font-black text-accent tracking-tight accent-glow break-words">
                    {myRole?.word || '???'}
                  </h2>
                  {myRole?.meaning && (
                    <p className="text-xs text-zinc-300 mt-2 p-2.5 rounded-lg bg-black/30 border border-white/5">
                      {myRole.meaning}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-500 font-mono text-xs italic">
              🔒 Information Hidden. Tap "Peek Secret Info" to view.
            </div>
          )}
        </div>
      </div>

      {/* Players Status List */}
      <div className="bg-surface border border-border rounded-card p-4 space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted">
          Players Status ({players.filter(p => p.isAlive).length} Alive)
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

      {/* Host Call Vote Button */}
      <div className="pt-2">
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
                  onClick={handleConfirmVote}
                >
                  Confirm Vote 🚨
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
