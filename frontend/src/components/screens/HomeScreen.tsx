import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface HomeScreenProps {
  gameState?: any;
}

export default function HomeScreen({ gameState }: HomeScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const actions = gameState?.actions;
  const error = gameState?.error;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    if (actions?.createRoom) {
      actions.createRoom(playerName.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    if (actions?.joinRoom) {
      actions.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 max-w-md mx-auto">
      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-accent accent-glow mb-2">
          IMPOSTER PARTY
        </h1>
        <p className="text-muted text-sm font-medium">
          Same room. Own phone. Find the imposter.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="w-full mb-6 p-4 rounded-card bg-danger/10 border border-danger text-danger text-sm text-center font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => actions?.clearError?.()}
            className="text-danger hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Container */}
      <div className="w-full bg-surface border border-border rounded-card p-6 shadow-xl">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-surface2 rounded-card">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`py-2.5 text-sm font-bold rounded-card transition-colors ${
              tab === 'create'
                ? 'bg-accent text-white shadow'
                : 'text-muted hover:text-primary'
            }`}
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={() => setTab('join')}
            className={`py-2.5 text-sm font-bold rounded-card transition-colors ${
              tab === 'join'
                ? 'bg-accent text-white shadow'
                : 'text-muted hover:text-primary'
            }`}
          >
            Join Room
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={16}
                required
                className="w-full px-4 py-3 bg-surface2 border border-border rounded-card text-primary placeholder-muted focus:outline-none focus:border-accent text-base"
              />
            </div>
            <Button type="submit" variant="accent" fullWidth disabled={!playerName.trim()}>
              Create Room
            </Button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="6-LETTER CODE"
                maxLength={6}
                required
                className="w-full px-4 py-3 bg-surface2 border border-border rounded-card text-primary placeholder-muted focus:outline-none focus:border-accent font-mono text-center tracking-widest text-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={16}
                required
                className="w-full px-4 py-3 bg-surface2 border border-border rounded-card text-primary placeholder-muted focus:outline-none focus:border-accent text-base"
              />
            </div>
            <Button
              type="submit"
              variant="accent"
              fullWidth
              disabled={!playerName.trim() || roomCode.length < 6}
            >
              Join Room
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
