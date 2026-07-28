import React from 'react';
import { GameState } from '@/types/game';
import LobbyScreen from '@/components/screens/LobbyScreen';
import RoleRevealScreen from '@/components/screens/RoleRevealScreen';
import DiscussionScreen from '@/components/screens/DiscussionScreen';
import VotingScreen from '@/components/screens/VotingScreen';
import VoteResultScreen from '@/components/screens/VoteResultScreen';
import GameOverScreen from '@/components/screens/GameOverScreen';

interface PhaseGateProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function PhaseGate({ gameState }: PhaseGateProps) {
  const { phase } = gameState;

  switch (phase) {
    case 'lobby':
      return <LobbyScreen gameState={gameState} />;
    case 'role-reveal':
      return <RoleRevealScreen gameState={gameState} />;
    case 'discussion':
      return <DiscussionScreen gameState={gameState} />;
    case 'voting':
      return <VotingScreen gameState={gameState} />;
    case 'vote-result':
      return <VoteResultScreen gameState={gameState} />;
    case 'game-over':
      return <GameOverScreen gameState={gameState} />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen text-muted">
          Loading game phase...
        </div>
      );
  }
}
