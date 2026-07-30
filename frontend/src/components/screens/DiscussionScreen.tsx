import React, { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';
import Button from '@/components/ui/Button';
import { playEmergencyMeeting, playRoleReveal, playNewRound } from '@/lib/audioManager';

interface DiscussionScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function DiscussionScreen({ gameState }: DiscussionScreenProps) {
  const { players, myId, myRole, isHost, guessResult, actions } = gameState;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isWordVisible, setIsWordVisible] = useState(true);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [guessInput, setGuessInput] = useState('');

  const me = players.find(p => p.id === myId);
  const isImposter = myRole?.isImposter ?? false;
  const canGuess = isImposter && (me?.isAlive ?? false);

  useEffect(() => {
    playNewRound();
    playRoleReveal();
  }, []);

  const handleConfirmVote = () => {
    setShowConfirm(false);
    playEmergencyMeeting();
    actions.callVote();
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessInput.trim()) {
      actions.clearGuessResult?.();
      actions.guessWord(guessInput.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] px-4 py-6 max-w-md sm:max-w-xl w-full mx-auto justify-between space-y-4 bg-background text-primary">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-mono tracking-widest text-accent font-bold">
          Discussion Phase
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary uppercase">
          DISCUSS & FIND IMPOSTER
        </h1>
        <p className="text-xs text-muted">Talk out loud in the room without giving away the word!</p>
      </div>

      {/* 3D Animated Secret Word / Role Card */}
      <div className="perspective-1000 my-2">
        <div
          className={`relative w-full rounded-2xl p-5 border-2 transition-all duration-500 transform-gpu shadow-2xl ${
            isImposter
              ? 'bg-surface border-danger shadow-danger/20'
              : 'bg-surface border-accent shadow-accent/20'
          } ${isWordVisible ? 'scale-100 rotate-0' : 'scale-95 opacity-90'}`}
        >
          {/* Card Top Label & Peek Toggle */}
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
              {isImposter ? '🔴 Your Role' : '🟢 Secret Word'}
            </span>
            <button
              type="button"
              onClick={() => setIsWordVisible(!isWordVisible)}
              className="text-xs font-mono font-bold text-accent bg-surface2 px-2.5 py-1 rounded-full border border-border hover:border-accent transition-colors"
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
                  {myRole?.hint && (
                    <div className="mt-3 p-3 rounded-xl bg-surface2 border border-warning/30 inline-block">
                      <span className="text-xs text-muted block uppercase font-mono mb-0.5">Clue Hint:</span>
                      <span className="text-lg font-bold text-warning font-mono">"{myRole.hint}"</span>
                    </div>
                  )}
                  {myRole?.fellowImposters && myRole.fellowImposters.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-surface2 border border-danger/30 space-y-1.5">
                      <span className="text-xs text-muted font-mono uppercase block">
                        Fellow Imposter(s):
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {myRole.fellowImposters.map((imp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-danger/40"
                          >
                            <ColorCircle colorId={imp.color} size="sm" />
                            <span className="text-xs font-bold text-danger">{imp.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {canGuess && (
                    <div className="mt-4 pt-3 border-t border-danger/30">
                      <button
                        type="button"
                        onClick={() => {
                          actions.clearGuessResult?.();
                          setShowGuessModal(true);
                        }}
                        className="w-full py-2.5 px-4 bg-danger hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-card border border-danger/40 shadow-lg shadow-danger/20 active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wider"
                      >
                        <span>🎯</span>
                        <span>Guess Secret Word (Instant Win!)</span>
                      </button>
                    </div>
                  )}
                  {!myRole?.hint && !canGuess && (
                    <p className="text-xs italic text-muted mt-2">No hint enabled. Fake confidence!</p>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-4xl font-black text-accent tracking-tight accent-glow break-words">
                    {myRole?.word || '???'}
                  </h2>
                  {myRole?.meaning && (
                    <p className="text-xs text-muted mt-2 p-2.5 rounded-lg bg-surface2 border border-border">
                      {myRole.meaning}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted font-mono text-xs italic">
              🔒 Information Hidden. Tap "Peek Secret Info" to view.
            </div>
          )}
        </div>
      </div>

      {/* Players Status List */}
      <div className="bg-surface border border-border rounded-card p-4 space-y-2 shadow-lg">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted">
          Players Status ({players.filter(p => p.isAlive).length} Alive)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {players.map(p => {
            const isOffline = p.disconnected;
            const remaining = p.disconnectExpiresAt
              ? Math.max(0, Math.ceil((p.disconnectExpiresAt - Date.now()) / 1000))
              : 10;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 p-2 rounded-card border ${
                  !p.isAlive
                    ? 'bg-surface2/30 border-border opacity-40 line-through text-muted'
                    : isOffline
                    ? 'bg-surface2/50 border-danger/40 text-muted opacity-70'
                    : 'bg-surface2 border-border text-primary'
                }`}
              >
                <ColorCircle colorId={p.color} size="sm" />
                <span className="text-xs font-medium truncate">
                  {p.name}
                </span>
                {!p.isAlive ? (
                  <span className="text-[10px] text-danger ml-auto font-mono no-underline">
                    Dead
                  </span>
                ) : isOffline ? (
                  <span className="text-[10px] text-danger ml-auto font-mono font-bold animate-pulse no-underline shrink-0">
                    Offline ({remaining}s)
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Call Vote Button */}
      <div className="pt-2">
        {isHost ? (
          showConfirm ? (
            <div className="p-4 rounded-card bg-surface border border-accent space-y-3 text-center shadow-xl">
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
