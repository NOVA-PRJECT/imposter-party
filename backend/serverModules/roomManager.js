const { generateRoomCode } = require('./utils/codeGenerator');
const { getNextAvailableColor, isColorAvailable } = require('./utils/colorManager');

const rooms = new Map();

function safePlayerList(room) {
  return room.players.map(({ id, name, color, isHost, isAlive, hasVoted, voteCount, disconnected }) => ({
    id,
    name,
    color,
    isHost,
    isAlive,
    hasVoted,
    voteCount,
    disconnected,
  }));
}

function createRoom(hostSocketId, playerName) {
  const existingCodes = new Set(rooms.keys());
  const code = generateRoomCode(existingCodes);

  const initialPlayer = {
    id: hostSocketId,
    name: playerName.trim() || 'Player 1',
    color: 'red',
    isHost: true,
    isAlive: true,
    isImposter: false,
    vote: null,
    hasVoted: false,
    voteCount: 0,
    disconnected: false,
    disconnectTimer: null,
  };

  const room = {
    code,
    hostId: hostSocketId,
    phase: 'lobby',
    players: [initialPlayer],
    settings: {
      maxPlayers: 20,
      imposterCount: 1,
      votingTimerSeconds: 60,
      wordCategory: 'general',
      hintMode: false,
      meaningMode: false,
    },
    customWords: [],
    currentWord: null,
    currentMeaning: null,
    currentHint: null,
    round: 0,
    votingTimerRef: null,
  };

  rooms.set(code, room);
  return { code, player: safePlayerList(room)[0], room };
}

function joinRoom(code, socketId, playerName) {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.phase !== 'lobby') {
    throw new Error('Game already in progress');
  }

  if (room.players.length >= room.settings.maxPlayers) {
    throw new Error('Room is full');
  }

  const usedColors = room.players.map(p => p.color);
  const color = getNextAvailableColor(usedColors);

  const newPlayer = {
    id: socketId,
    name: playerName.trim() || `Player ${room.players.length + 1}`,
    color,
    isHost: false,
    isAlive: true,
    isImposter: false,
    vote: null,
    hasVoted: false,
    voteCount: 0,
    disconnected: false,
    disconnectTimer: null,
  };

  room.players.push(newPlayer);
  return { room, newPlayer };
}

function changePlayerColor(socketId, colorId) {
  const room = findRoomBySocketId(socketId);
  if (!room) throw new Error('Player not in room');
  if (room.phase !== 'lobby') throw new Error('Cannot change color during game');

  const otherUsedColors = room.players
    .filter(p => p.id !== socketId)
    .map(p => p.color);

  if (!isColorAvailable(colorId, otherUsedColors)) {
    throw new Error('Color already taken or invalid');
  }

  const player = room.players.find(p => p.id === socketId);
  if (player) {
    player.color = colorId;
  }

  return room;
}

function findRoomBySocketId(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId)) {
      return room;
    }
  }
  return null;
}

function getRoom(code) {
  return rooms.get(code.toUpperCase());
}

function deleteRoom(code) {
  const room = rooms.get(code);
  if (room && room.votingTimerRef) {
    clearTimeout(room.votingTimerRef);
  }
  rooms.delete(code);
}

module.exports = {
  rooms,
  safePlayerList,
  createRoom,
  joinRoom,
  changePlayerColor,
  findRoomBySocketId,
  getRoom,
  deleteRoom,
};
