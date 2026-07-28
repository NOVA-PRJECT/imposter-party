import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import HomeScreen from '@/components/screens/HomeScreen';
import PhaseGate from '@/components/ui/PhaseGate';
import { toggleMute, getIsMuted } from '@/lib/audioManager';

export default function App() {
  const gameState = useGame();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(getIsMuted());
  }, []);

  const handleToggleSound = () => {
    const nextMuted = toggleMute();
    setMuted(nextMuted);
  };

  return (
    <main className="min-h-screen bg-background text-primary relative">
      {/* Floating Top-Right Sound Mute Toggle */}
      <button
        type="button"
        onClick={handleToggleSound}
        className="fixed top-3 right-3 z-50 w-10 h-10 rounded-full bg-surface2/80 backdrop-blur border border-border text-primary flex items-center justify-center text-lg hover:border-accent active:scale-95 transition-all shadow-lg select-none"
        title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {!gameState.roomCode ? (
        <HomeScreen gameState={gameState} />
      ) : (
        <PhaseGate gameState={gameState} />
      )}
    </main>
  );
}
