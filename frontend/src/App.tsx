import React from 'react';
import { useGame } from '@/hooks/useGame';
import HomeScreen from '@/components/screens/HomeScreen';
import PhaseGate from '@/components/ui/PhaseGate';

export default function App() {
  const gameState = useGame();

  return (
    <main className="min-h-screen bg-background text-primary">
      {!gameState.roomCode ? (
        <HomeScreen gameState={gameState} />
      ) : (
        <PhaseGate gameState={gameState} />
      )}
    </main>
  );
}
