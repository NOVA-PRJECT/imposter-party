import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface HomeScreenProps {
  gameState?: any;
}

export default function HomeScreen({ gameState }: HomeScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [activeModal, setActiveModal] = useState<'about_game' | 'about_creator' | null>(null);

  const actions = gameState?.actions;
  const error = gameState?.error;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    if (actions?.createRoom) {
      actions.createRoom(playerName.trim(), maxPlayers);
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
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-8 max-w-md mx-auto relative">
      {/* Top Title Header */}
      <div className="text-center mb-6 w-full">
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

      {/* Main Form Container */}
      <div className="w-full bg-surface border border-border rounded-card p-6 shadow-xl space-y-4">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface2 rounded-card">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono uppercase text-muted">
                  Max Players Limit
                </label>
                <span className="text-xs text-accent font-mono font-bold">{maxPlayers} players</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMaxPlayers(m => Math.max(3, m - 1))}
                  disabled={maxPlayers <= 3}
                  className="w-10 h-10 rounded-card bg-surface2 text-primary font-bold border border-border disabled:opacity-30 flex items-center justify-center text-lg"
                >
                  -
                </button>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(parseInt(e.target.value) || 10)}
                  className="w-full accent-accent bg-surface2 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setMaxPlayers(m => Math.min(20, m + 1))}
                  disabled={maxPlayers >= 20}
                  className="w-10 h-10 rounded-card bg-surface2 text-primary font-bold border border-border disabled:opacity-30 flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
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

      {/* Info & Creator Quick Action Buttons */}
      <div className="w-full mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveModal('about_game')}
          className="p-3 rounded-card bg-surface border border-border hover:border-accent/60 text-xs font-bold text-muted hover:text-primary flex items-center justify-center gap-1.5 transition-all shadow"
        >
          <span>📖</span> How To Play
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('about_creator')}
          className="p-3 rounded-card bg-surface border border-border hover:border-accent/60 text-xs font-bold text-muted hover:text-primary flex items-center justify-center gap-1.5 transition-all shadow"
        >
          <span>🚀</span> Built By
        </button>
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-6 text-[11px] font-mono text-muted">
        Imposter Party v1.0 • Crafted for Local Party Fun
      </div>

      {/* ABOUT GAME MODAL */}
      {activeModal === 'about_game' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center border-b border-border pb-3">
              <span className="text-2xl">🎮</span>
              <h2 className="text-2xl font-bold text-primary">About The Game</h2>
              <p className="text-xs text-muted">Local Social Deduction Word Game</p>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-card bg-surface2 border border-border">
                <strong className="text-accent block text-sm mb-1">🎯 The Objective</strong>
                Gather friends in the same room. Everyone receives the same secret word on their phone, except the <strong>Imposter</strong>!
              </div>

              <div className="p-3 rounded-card bg-surface2 border border-border">
                <strong className="text-accent block text-sm mb-1">🗣️ How To Play</strong>
                <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                  <li>Start a room and invite 3 to 20 players via room code.</li>
                  <li>Check your phone's secret word or Imposter role card.</li>
                  <li>Discuss out loud! Ask clever questions without giving away the exact word.</li>
                  <li>Host calls an Emergency Vote. Cast your secret vote on your phone.</li>
                  <li>View the 5-second proceeding vote breakdown and see who gets ejected!</li>
                </ol>
              </div>

              <div className="p-3 rounded-card bg-surface2 border border-border space-y-1">
                <strong className="text-accent block text-sm">✨ Key Features</strong>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                  <li>5+ Curated Word Categories (Food, Landmarks, Vehicles, Hobbies...)</li>
                  <li>200+ Words to Choose From</li>
                  <li>Smart Anti-Adjacency (No two consecutive games use the same department)</li>
                  <li>Among Us Tablet Voting Screen with "I VOTED" badges</li>
                  <li>Web Audio Retro Sound Effects & Floating Mute Toggle</li>
                  <li>Custom Words & Hint / Meaning toggles</li>
                </ul>
              </div>
            </div>

            <Button onClick={() => setActiveModal(null)} variant="accent" fullWidth>
              Got It, Let's Play!
            </Button>
          </div>
        </div>
      )}

      {/* ABOUT CREATOR MODAL */}
      {activeModal === 'about_creator' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center border-b border-border pb-3">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-bold text-primary">About Creator</h2>
              <p className="text-xs text-accent font-mono font-bold">NOVA PROJECT</p>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-card bg-surface2 border border-border text-center space-y-2">
                <p className="text-sm font-semibold text-primary">
                  Designed & Developed by <span className="text-accent font-bold">NOVA PROJECT</span>
                </p>
                <p className="text-xs text-muted">
                  Built to bring friends together for intense in-person social deduction party gaming!
                </p>
              </div>

              <div className="p-3 rounded-card bg-surface2 border border-border space-y-2">
                <strong className="text-primary block text-xs font-mono uppercase">Tech Stack & Open Source</strong>
                <p className="text-zinc-400">
                  Decoupled Node.js Express + Socket.IO backend paired with a Vite + React 18 frontend, styled with custom dark-mode Tailwind CSS and Web Audio API.
                </p>
              </div>

              <a
                href="https://github.com/NOVA-PRJECT/imposter-party"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-card bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold text-xs transition-colors shadow"
              >
                <span>⭐ View Project on GitHub</span>
              </a>
            </div>

            <Button onClick={() => setActiveModal(null)} variant="secondary" fullWidth>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
