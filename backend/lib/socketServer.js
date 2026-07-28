const {
  createRoom,
  joinRoom,
  changePlayerColor,
  findRoomBySocketId,
  deleteRoom,
  safePlayerList,
} = require('../serverModules/roomManager');
const {
  startGame,
  nextRound,
  submitVote,
  tallyVotes,
} = require('../serverModules/gameManager');
const { getCategories } = require('../serverModules/utils/wordLoader');
const { getMaxImposters } = require('../serverModules/utils/imposterRules');

function initSocketServer(io) {
  io.on('connection', (socket) => {
    // room:create
    socket.on('room:create', ({ playerName }) => {
      try {
        const { code, player, room } = createRoom(socket.id, playerName);
        socket.join(code);
        socket.emit('room:created', { code, player });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:join
    socket.on('room:join', ({ code, playerName }) => {
      try {
        const { room, newPlayer } = joinRoom(code, socket.id, playerName);
        socket.join(room.code);

        const safeRoomView = {
          code: room.code,
          players: safePlayerList(room),
          settings: room.settings,
          categories: getCategories(),
        };

        socket.emit('room:joined', { room: safeRoomView, myColor: newPlayer.color });
        io.to(room.code).emit('room:updated', { players: safePlayerList(room) });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // player:colorChange
    socket.on('player:colorChange', ({ colorId }) => {
      try {
        const room = changePlayerColor(socket.id, colorId);
        io.to(room.code).emit('room:updated', { players: safePlayerList(room) });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:updateSettings
    socket.on('room:updateSettings', ({ settings }) => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        if (room.hostId !== socket.id) {
          throw new Error('Only the host can update room settings');
        }

        if (settings.imposterCount !== undefined) {
          const maxAllowed = getMaxImposters(room.players.length);
          if (settings.imposterCount > maxAllowed) {
            throw new Error(`Max imposters allowed: ${maxAllowed}`);
          }
        }

        room.settings = { ...room.settings, ...settings };
        io.to(room.code).emit('room:settingsUpdated', { settings: room.settings });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:addCustomWord
    socket.on('room:addCustomWord', ({ word, meaning, hint }) => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        if (room.hostId !== socket.id) {
          throw new Error('Only the host can add custom words');
        }

        const trimmedHint = (hint || '').trim();
        if (trimmedHint.includes(' ') || !trimmedHint) {
          throw new Error('Hint must be strictly one word with no spaces');
        }

        room.customWords.push({
          word: (word || '').trim(),
          meaning: (meaning || '').trim(),
          hint: trimmedHint,
        });

        socket.emit('room:customWordAdded', { count: room.customWords.length });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:leave
    socket.on('room:leave', () => {
      handlePlayerLeave(socket, io);
    });

    // game:start
    socket.on('game:start', () => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        if (room.hostId !== socket.id) {
          throw new Error('Only the host can start the game');
        }

        startGame(room, io);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // game:discussionReady
    socket.on('game:discussionReady', () => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room || room.hostId !== socket.id || room.phase !== 'role-reveal') return;

        room.phase = 'discussion';
        io.to(room.code).emit('game:phaseChanged', { phase: 'discussion' });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // game:callVote
    socket.on('game:callVote', () => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room || room.hostId !== socket.id || room.phase !== 'discussion') return;

        room.players.forEach(p => {
          p.vote = null;
          p.hasVoted = false;
          p.voteCount = 0;
        });

        room.phase = 'voting';
        const timerSeconds = room.settings.votingTimerSeconds || 0;

        if (room.votingTimerRef) {
          clearTimeout(room.votingTimerRef);
          room.votingTimerRef = null;
        }

        if (timerSeconds > 0) {
          room.votingTimerRef = setTimeout(() => {
            tallyVotes(room.code, io);
          }, timerSeconds * 1000);
        }

        io.to(room.code).emit('game:phaseChanged', {
          phase: 'voting',
          players: safePlayerList(room),
          timerSeconds,
          serverTimestamp: Date.now(),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // game:submitVote
    socket.on('game:submitVote', ({ votedForId }) => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room || room.phase !== 'voting') return;

        submitVote(room, socket.id, votedForId, io);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // game:nextRound
    socket.on('game:nextRound', () => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room || room.hostId !== socket.id || room.phase !== 'vote-result') return;

        nextRound(room, io);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // game:playAgain
    socket.on('game:playAgain', () => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room || room.hostId !== socket.id || room.phase !== 'game-over') return;

        room.phase = 'lobby';
        room.round = 0;
        room.players.forEach(p => {
          p.isAlive = true;
          p.isImposter = false;
          p.vote = null;
          p.hasVoted = false;
          p.voteCount = 0;
        });

        io.to(room.code).emit('game:phaseChanged', {
          phase: 'lobby',
          players: safePlayerList(room),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // disconnect
    socket.on('disconnect', () => {
      handlePlayerLeave(socket, io, true);
    });
  });
}

function handlePlayerLeave(socket, io, isDisconnecting = false) {
  const room = findRoomBySocketId(socket.id);
  if (!room) return;

  const player = room.players.find(p => p.id === socket.id);
  if (!player) return;

  if (isDisconnecting) {
    player.disconnected = true;
    player.disconnectTimer = setTimeout(() => {
      removePlayerAndMigrateHost(room, socket.id, io);
    }, 30000);
  } else {
    removePlayerAndMigrateHost(room, socket.id, io);
  }
}

function removePlayerAndMigrateHost(room, socketId, io) {
  room.players = room.players.filter(p => p.id !== socketId);

  if (room.players.length === 0) {
    deleteRoom(room.code);
    return;
  }

  const hostLeft = room.hostId === socketId;
  if (hostLeft) {
    const nextPlayer = room.players.find(p => !p.disconnected) || room.players[0];
    if (nextPlayer) {
      nextPlayer.isHost = true;
      room.hostId = nextPlayer.id;
      io.to(room.code).emit('room:hostMigrated', {
        newHostId: nextPlayer.id,
        newHostName: nextPlayer.name,
        newHostColor: nextPlayer.color,
      });
    }
  }

  io.to(room.code).emit('room:updated', { players: safePlayerList(room) });
}

module.exports = { initSocketServer };
