import React from 'react';
import { GameState } from '@/types/game';
import ColorCircle from '@/components/ui/ColorCircle';

interface DeadScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function DeadScreen({ gameState }: DeadScreenProps) {
  const { players, myRole, actions } = gameState;
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);

  return (
    <div className="min-h-[100dvh] bg-black text-zinc-200 flex flex-col items-center justify-between px-4 py-8 max-w-md sm:max-w-xl mx-auto filter grayscale select-none">
      {/* Top Header */}
      <div className="text-center space-y-2 w-full border-b border-zinc-800 pb-4">
        <span className="text-xs uppercase font-mono tracking-widest text-zinc-500 font-bold">
          👻 Spectator Mode
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-white uppercase animate-pulse">
          YOU ARE DEAD
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          You were ejected from the group!
        </p>
      </div>

      {/* Main Ghost Status Hero Card */}
      <div className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-5 my-auto text-center space-y-4 shadow-2xl">
        <div className="text-6xl animate-bounce">💀</div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Shh! Keep Quiet 🤫</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            You are now a ghost. Do not talk out loud or give hints to living players in the room!
          </p>
        </div>

        {/* Role Reminder for Ghost */}
        {myRole && (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-mono">
            <span>Your role was: </span>
            <strong className="text-white font-bold">
              {myRole.isImposter ? '🔴 IMPOSTER' : `🟢 CREWMATE ("${myRole.word}")`}
            </strong>
          </div>
        )}
      </div>

      {/* Living & Dead Players List */}
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-card p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Living Players ({alivePlayers.length})
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">
            {deadPlayers.length} Dead
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {players.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-2 p-2 rounded-card border text-xs ${
                p.isAlive
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-200'
                  : 'bg-zinc-950/40 border-zinc-900 opacity-40 line-through text-zinc-600'
              }`}
            >
              <ColorCircle colorId={p.color} size="sm" />
              <span className="font-medium truncate">{p.name}</span>
              {!p.isAlive && (
                <span className="text-[9px] text-zinc-500 ml-auto font-mono no-underline">
                  Dead
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="w-full pt-4 border-t border-zinc-800 text-center space-y-2">
        <p className="text-xs text-zinc-500 font-mono animate-pulse">
          Spectating live game... Next full game starts soon!
        </p>
        <button
          type="button"
          onClick={actions.leaveRoom}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-mono underline"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
