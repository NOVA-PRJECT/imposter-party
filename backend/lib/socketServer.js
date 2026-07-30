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
  checkWinCondition,
  submitWordGuess,
} = require('../serverModules/gameManager');
const { getCategories } = require('../serverModules/utils/wordLoader');
const { getMaxImposters } = require('../serverModules/utils/imposterRules');
const { sanitizeString } = require('../serverModules/utils/sanitizer');

// Socket event rate limiter map (Socket ID -> timestamps array)
const socketRateLimits = new Map();

function isRateLimited(socketId) {
  const now = Date.now();
  const timestamps = socketRateLimits.get(socketId) || [];
  const recent = timestamps.filter(t => now - t < 3000);
  
  if (recent.length >= 10) {
    return true;
  }
  
  recent.push(now);
  socketRateLimits.set(socketId, recent);
  return false;
}

function initSocketServer(io) {
  io.on('connection', (socket) => {
    socket.use(([event, ...args], next) => {
      if (isRateLimited(socket.id)) {
        return next(new Error('Rate limit exceeded. Please slow down.'));
      }
      next();
    });

    // room:create
    socket.on('room:create', ({ playerName, maxPlayers }) => {
      try {
        const cleanName = sanitizeString(playerName, 16) || 'Player 1';
        const { code, player, room, reconnectToken } = createRoom(socket.id, cleanName, maxPlayers);
        socket.join(code);

        const safeRoomView = {
          code: room.code,
          players: safePlayerList(room),
          settings: room.settings,
          categories: getCategories(),
          customWords: room.customWords || [],
        };

        socket.emit('room:created', { code, player, room: safeRoomView, reconnectToken });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:join
    socket.on('room:join', ({ code, playerName, reconnectToken }) => {
      try {
        const cleanCode = sanitizeString(code, 6).toUpperCase();
        const cleanName = sanitizeString(playerName, 16) || 'Player';

        const { room, newPlayer, isRejoining } = joinRoom(cleanCode, socket.id, cleanName, reconnectToken);
        socket.join(room.code);

        const safeRoomView = {
          code: room.code,
          players: safePlayerList(room),
          settings: room.settings,
          categories: getCategories(),
          customWords: room.customWords || [],
        };

        socket.emit('room:joined', {
          room: safeRoomView,
          myColor: newPlayer.color,
          reconnectToken: newPlayer.reconnectToken,
        });
        io.to(room.code).emit('room:updated', { players: safePlayerList(room) });

        if (isRejoining && room.phase !== 'lobby') {
          const player = room.players.find(p => p.id === socket.id);
          if (player) {
            const imposters = room.players.filter(p => p.isImposter);
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
          }
          socket.emit('game:phaseChanged', {
            phase: room.phase,
            round: room.round,
            players: safePlayerList(room),
          });
        }
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

        if (settings.maxPlayers !== undefined) {
          const newMax = Math.max(3, Math.min(20, parseInt(settings.maxPlayers, 10) || 10));
          if (newMax < room.players.length) {
            throw new Error(`Cannot set max players lower than current player count (${room.players.length})`);
          }
          settings.maxPlayers = newMax;
        }

        if (settings.votingTimerSeconds !== undefined) {
          const timerVal = parseInt(settings.votingTimerSeconds, 10);
          if (isNaN(timerVal)) {
            settings.votingTimerSeconds = 10;
          } else if (timerVal !== 0) {
            settings.votingTimerSeconds = Math.max(5, Math.min(30, timerVal));
          } else {
            settings.votingTimerSeconds = 0;
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

        const cleanWord = sanitizeString(word, 40);
        const cleanMeaning = sanitizeString(meaning, 100);
        const cleanHint = sanitizeString(hint, 20);

        if (!cleanHint || cleanHint.includes(' ')) {
          throw new Error('Hint must be strictly one word with no spaces');
        }

        if (!cleanWord) {
          throw new Error('Word cannot be empty');
        }

        const newCustomWord = {
          id: Date.now().toString(),
          word: cleanWord,
          meaning: cleanMeaning,
          hint: cleanHint,
        };

        room.customWords.push(newCustomWord);

        io.to(room.code).emit('room:customWordsUpdated', {
          customWords: room.customWords,
          count: room.customWords.length,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:editCustomWord
    socket.on('room:editCustomWord', ({ index, word, meaning, hint }) => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        if (room.hostId !== socket.id) {
          throw new Error('Only the host can edit custom words');
        }

        if (index < 0 || index >= room.customWords.length) {
          throw new Error('Invalid custom word index');
        }

        const cleanWord = sanitizeString(word, 40);
        const cleanMeaning = sanitizeString(meaning, 100);
        const cleanHint = sanitizeString(hint, 20);

        if (!cleanHint || cleanHint.includes(' ')) {
          throw new Error('Hint must be strictly one word with no spaces');
        }

        if (!cleanWord) {
          throw new Error('Word cannot be empty');
        }

        room.customWords[index] = {
          ...room.customWords[index],
          word: cleanWord,
          meaning: cleanMeaning,
          hint: cleanHint,
        };

        io.to(room.code).emit('room:customWordsUpdated', {
          customWords: room.customWords,
          count: room.customWords.length,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // room:deleteCustomWord
    socket.on('room:deleteCustomWord', ({ index }) => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        if (room.hostId !== socket.id) {
          throw new Error('Only the host can delete custom words');
        }

        if (index < 0 || index >= room.customWords.length) {
          throw new Error('Invalid custom word index');
        }

        room.customWords.splice(index, 1);

        io.to(room.code).emit('room:customWordsUpdated', {
          customWords: room.customWords,
          count: room.customWords.length,
        });
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

    // game:guessWord
    socket.on('game:guessWord', ({ guess }) => {
      try {
        const room = findRoomBySocketId(socket.id);
        if (!room) return;
        submitWordGuess(room, socket.id, guess, io);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // disconnect
    socket.on('disconnect', () => {
      socketRateLimits.delete(socket.id);
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
    player.disconnectExpiresAt = Date.now() + 10000;

    // Immediately broadcast updated player list so all clients see offline countdown
    io.to(room.code).emit('room:updated', { players: safePlayerList(room) });

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
    }

    player.disconnectTimer = setTimeout(() => {
      removePlayerAndMigrateHost(room, socket.id, io);
    }, 10000);
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

  if (room.phase !== 'lobby' && room.phase !== 'game-over') {
    const winCondition = checkWinCondition(room);
    if (winCondition) {
      room.phase = 'game-over';
      const payload = {
        eliminated: null,
        tie: false,
        players: safePlayerList(room),
        winCondition,
        revealedPlayers: room.players.map(p => ({
          id: p.id,
          name: p.name,
          color: p.color,
          isImposter: p.isImposter,
          isAlive: p.isAlive,
        })),
        word: room.currentWord,
      };
      io.to(room.code).emit('game:voteResult', payload);
    }
  }
}

module.exports = { initSocketServer };
