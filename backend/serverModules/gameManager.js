const { getRandomWord } = require('./utils/wordLoader');
const { getMaxImposters } = require('./utils/imposterRules');
const { safePlayerList, rooms } = require('./roomManager');

function startGame(room, io) {
  const playerCount = room.players.filter(p => !p.disconnected).length;
if (playerCount < 3) {
  throw new Error('Need at least 3 players to start game');
}

  const maxImpostersAllowed = getMaxImposters(playerCount);
  if (room.settings.imposterCount > maxImpostersAllowed) {
    throw new Error(`Maximum ${maxImpostersAllowed} imposter(s) allowed for ${playerCount} players`);
  }

  const categoryParam = (room.settings.selectedCategories && room.settings.selectedCategories.length > 0)
    ? room.settings.selectedCategories
    : room.settings.wordCategory;

  // Pass categoryParam & room state to enforce anti-adjacency across ticked categories
  const selectedEntry = getRandomWord(categoryParam, room.customWords, room);
  room.currentWord = selectedEntry.word;
  room.currentMeaning = selectedEntry.meaning;
  room.currentHint = selectedEntry.hint;

  room.players.forEach(p => {
    p.isAlive = true;
    p.isImposter = false;
    p.vote = null;
    p.hasVoted = false;
    p.voteCount = 0;
  });

  const playerIndices = Array.from({ length: playerCount }, (_, i) => i);
  const imposterIndices = new Set();
  while (imposterIndices.size < room.settings.imposterCount) {
    const randIndex = Math.floor(Math.random() * playerIndices.length);
    imposterIndices.add(playerIndices[randIndex]);
  }

  imposterIndices.forEach(idx => {
    room.players[idx].isImposter = true;
  });

  room.round = 1;

  // Direct transition to Discussion phase
  room.phase = 'discussion';

  emitRoles(room, io);

  io.to(room.code).emit('game:phaseChanged', {
    phase: 'discussion',
    round: room.round,
    players: safePlayerList(room),
  });
}

function emitRoles(room, io) {
  const imposters = room.players.filter(p => p.isImposter);

  room.players.forEach(player => {
    const socket = io.sockets.sockets.get(player.id);
    if (!socket) return;

    if (player.isImposter) {
      const fellowImposters = imposters
        .filter(imp => imp.id !== player.id)
        .map(imp => ({ name: imp.name, color: imp.color }));

      socket.emit('game:roleAssigned', {
        isImposter: true,
        word: null,
        meaning: null,
        hint: room.settings.hintMode ? room.currentHint : null,
        fellowImposters,
      });
    } else {
      socket.emit('game:roleAssigned', {
        isImposter: false,
        word: room.currentWord,
        meaning: room.settings.meaningMode ? room.currentMeaning : null,
        hint: null,
        fellowImposters: [],
      });
    }
  });
}

function nextRound(room, io) {
  room.players.forEach(p => {
    p.vote = null;
    p.hasVoted = false;
    p.voteCount = 0;
  });

  room.round += 1;

  // Direct transition to Discussion phase
  room.phase = 'discussion';

  emitRoles(room, io);

  io.to(room.code).emit('game:phaseChanged', {
    phase: 'discussion',
    round: room.round,
    players: safePlayerList(room),
  });
}

function submitVote(room, voterSocketId, votedForId, io) {
  const voter = room.players.find(p => p.id === voterSocketId);
  if (!voter || !voter.isAlive || voter.hasVoted) return;

  const target = room.players.find(p => p.id === votedForId && p.isAlive);
  if (!target || target.id === voterSocketId) return;

  voter.hasVoted = true;
  voter.vote = votedForId;
  target.voteCount += 1;

  io.to(room.code).emit('game:voteUpdate', { players: safePlayerList(room) });

  const alivePlayers = room.players.filter(p => p.isAlive);
  const votedCount = alivePlayers.filter(p => p.hasVoted).length;

  if (votedCount >= alivePlayers.length) {
    tallyVotes(room.code, io);
  }
}

function tallyVotes(roomCode, io) {
  const room = rooms.get(roomCode);
  if (!room) return;

  if (room.votingTimerRef) {
    clearTimeout(room.votingTimerRef);
    room.votingTimerRef = null;
  }

  // Build vote breakdown detailing voters for each player
  const voteBreakdown = room.players.map(target => {
    const voters = room.players
      .filter(voter => voter.vote === target.id)
      .map(voter => ({ id: voter.id, name: voter.name, color: voter.color }));
    return { targetId: target.id, voters };
  });

  room.phase = 'proceeding';

  // Broadcast 5-second PROCEEDING phase with voter breakdown
  io.to(roomCode).emit('game:phaseChanged', {
    phase: 'proceeding',
    timerSeconds: 5,
    serverTimestamp: Date.now(),
    players: safePlayerList(room),
    voteBreakdown,
  });

  // After 5 seconds, finalize ejection & vote result
  setTimeout(() => {
    finalizeVoteResult(roomCode, io);
  }, 5000);
}

function finalizeVoteResult(roomCode, io) {
  const room = rooms.get(roomCode);
  if (!room || room.phase !== 'proceeding') return;

  const alivePlayers = room.players.filter(p => p.isAlive);
  const maxVotes = Math.max(...alivePlayers.map(p => p.voteCount));
  
  let topPlayers = [];
  if (maxVotes > 0) {
    topPlayers = alivePlayers.filter(p => p.voteCount === maxVotes);
  }

  let eliminated = null;
  const isTie = topPlayers.length !== 1;

  if (!isTie) {
    eliminated = topPlayers[0];
    eliminated.isAlive = false;
  }

  const winCondition = checkWinCondition(room);
  room.phase = winCondition ? 'game-over' : 'vote-result';

  const payload = {
    eliminated: eliminated
      ? {
          id: eliminated.id,
          name: eliminated.name,
          color: eliminated.color,
          wasImposter: eliminated.isImposter,
        }
      : null,
    tie: isTie,
    players: safePlayerList(room),
    winCondition,
  };

  if (winCondition) {
    payload.revealedPlayers = room.players.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      isImposter: p.isImposter,
      isAlive: p.isAlive,
    }));
    payload.word = room.currentWord;
  }

  io.to(roomCode).emit('game:voteResult', payload);
}

function checkWinCondition(room) {
  const aliveImposters = room.players.filter(p => p.isAlive && p.isImposter).length;
  const aliveCrewmates = room.players.filter(p => p.isAlive && !p.isImposter).length;

  if (aliveImposters === 0) return 'crewmates';
  if (aliveImposters >= aliveCrewmates) return 'imposters';
  return null;
}

module.exports = {
  startGame,
  nextRound,
  submitVote,
  tallyVotes,
  checkWinCondition,
};
