import React from 'react';
import { GameState } from '@/types/game';
import VotePlayerCard from '@/components/ui/VotePlayerCard';
import Timer from '@/components/ui/Timer';

interface VotingScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function VotingScreen({ gameState }: VotingScreenProps) {
  const { players, myId, myVote, voteProgress, timer, actions } = gameState;

  const me = players.find(p => p.id === myId);
  const alivePlayers = players.filter(p => p.isAlive);

  const hasVoted = Boolean(me?.hasVoted || myVote);
  const totalAlive = alivePlayers.length;
  const votedCount = voteProgress ? voteProgress.votedCount : alivePlayers.filter(p => p.hasVoted).length;

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto space-y-6">
      {/* Top Bar with Header & Timer */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Timer seconds={timer} />

        <h1 className="text-3xl font-bold tracking-tight text-primary">
          CAST YOUR VOTE
        </h1>
        <p className="text-xs text-muted">Who is the Imposter?</p>

        {/* Live Vote Progress */}
        <div className="inline-block px-3 py-1 rounded-full bg-surface2 border border-border font-mono text-xs text-accent">
          {votedCount} / {totalAlive} voted
        </div>

        {hasVoted && (
          <div className="text-xs font-bold text-success flex items-center gap-1 mt-1">
            <span>✓ Vote submitted</span>
          </div>
        )}
      </div>

      {/* Grid of Alive Players */}
      <div className="grid grid-cols-2 gap-3">
        {alivePlayers.map(p => {
          const isMe = p.id === myId;
          const isVotedByMe = myVote === p.id;

          return (
            <VotePlayerCard
              key={p.id}
              player={p}
              isMe={isMe}
              hasVoted={hasVoted}
              isVotedByMe={isVotedByMe}
              onVote={id => actions.submitVote(id)}
            />
          );
        })}
      </div>
    </div>
  );
}
