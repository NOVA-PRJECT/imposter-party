import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { GameState, MyRole, Player, VoteResult, RoomSettings } from '@/types/game';

const initialState: GameState = {
  phase: 'lobby',
  roomCode: '',
  players: [],
  myId: '',
  myRole: null,
  settings: {
    maxPlayers: 10,
    imposterCount: 1,
    votingTimerSeconds: 60,
    wordCategory: 'general',
    hintMode: false,
    meaningMode: false,
  },
  isHost: false,
  myVote: null,
  voteProgress: null,
  voteResult: null,
  voteBreakdown: [],
  timer: null,
  categories: [],
  customWordCount: 0,
  error: null,
};

export function useGame(initialRoomCode: string = '') {
  const [state, setState] = useState<GameState>({ ...initialState, roomCode: initialRoomCode });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    if (socket.id) {
      setState(s => ({ ...s, myId: socket.id ?? '' }));
    }

    socket.on('connect', () => {
      setState(s => ({ ...s, myId: socket.id ?? '' }));
    });

    socket.on('room:created', ({ code, player, room }) => {
      setState(s => ({
        ...s,
        roomCode: code,
        myId: player.id,
        isHost: true,
        players: room?.players ?? [player],
        settings: room?.settings ?? s.settings,
        categories: room?.categories ?? s.categories,
        error: null,
      }));
    });

    socket.on('room:joined', ({ room }) => {
      setState(s => ({
        ...s,
        roomCode: room.code,
        players: room.players,
        settings: room.settings,
        categories: room.categories,
        isHost: room.players.find((p: Player) => p.id === s.myId)?.isHost || false,
        error: null,
      }));
    });

    socket.on('room:updated', ({ players, newHostId }) => {
      setState(s => {
        const isCurrentHost = newHostId ? newHostId === s.myId : s.players.find(p => p.id === s.myId)?.isHost || s.isHost;
        return {
          ...s,
          players,
          isHost: isCurrentHost,
        };
      });
    });

    socket.on('room:settingsUpdated', ({ settings }) => {
      setState(s => ({ ...s, settings }));
    });

    socket.on('room:customWordAdded', ({ count }) => {
      setState(s => ({ ...s, customWordCount: count }));
    });

    socket.on('room:customWordsUpdated', ({ count }) => {
      setState(s => ({ ...s, customWordCount: count }));
    });

    socket.on('room:hostMigrated', ({ newHostId }) => {
      setState(s => ({ ...s, isHost: newHostId === s.myId }));
    });

    socket.on('game:roleAssigned', (role: MyRole) => {
      setState(s => ({ ...s, myRole: role }));
    });

    socket.on('game:phaseChanged', ({ phase, players, round, timerSeconds, serverTimestamp, voteBreakdown }) => {
      setState(s => ({
        ...s,
        phase,
        players: players ?? s.players,
        myVote: phase === 'discussion' ? null : s.myVote,
        voteResult: null,
        voteBreakdown: voteBreakdown ?? s.voteBreakdown,
        error: null,
      }));

      if (timerSeconds && serverTimestamp) {
        const elapsed = Math.floor((Date.now() - serverTimestamp) / 1000);
        const remaining = Math.max(0, timerSeconds - elapsed);
        setState(s => ({ ...s, timer: remaining }));

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setState(s => {
            const next = (s.timer ?? 0) - 1;
            if (next <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
              return { ...s, timer: 0 };
            }
            return { ...s, timer: next };
          });
        }, 1000);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setState(s => ({ ...s, timer: null }));
      }
    });

    socket.on('game:voteUpdate', ({ players }) => {
      const alive = players.filter((p: Player) => p.isAlive);
      const voted = alive.filter((p: Player) => p.hasVoted).length;
      setState(s => ({
        ...s,
        players,
        voteProgress: { votedCount: voted, totalAlive: alive.length },
      }));
    });

    socket.on('game:voteResult', (result: VoteResult) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(s => ({
        ...s,
        phase: result.winCondition ? 'game-over' : 'vote-result',
        players: result.players,
        voteResult: result,
        timer: null,
      }));
    });

    socket.on('error', ({ message }: { message: string }) => {
      setState(s => ({ ...s, error: message }));
    });

    socket.on('connect_error', () => {
      setState(s => ({ ...s, error: 'Connection to game server failed. Please check backend URL.' }));
    });

    return () => {
      socket.off('connect');
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:updated');
      socket.off('room:settingsUpdated');
      socket.off('room:customWordAdded');
      socket.off('room:customWordsUpdated');
      socket.off('room:hostMigrated');
      socket.off('game:roleAssigned');
      socket.off('game:phaseChanged');
      socket.off('game:voteUpdate');
      socket.off('game:voteResult');
      socket.off('error');
      socket.off('connect_error');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const socket = getSocket();

  const actions = {
    createRoom: (playerName: string, maxPlayers: number = 10) => {
      if (!socket.connected) socket.connect();
      socket.emit('room:create', { playerName, maxPlayers });
    },
    joinRoom: (code: string, playerName: string) => {
      if (!socket.connected) socket.connect();
      socket.emit('room:join', { code, playerName });
    },
    startGame: () => socket.emit('game:start'),
    callVote: () => socket.emit('game:callVote'),
    submitVote: (id: string) => {
      setState(s => ({ ...s, myVote: id }));
      socket.emit('game:submitVote', { votedForId: id });
    },
    nextRound: () => socket.emit('game:nextRound'),
    updateSettings: (settings: Partial<RoomSettings>) =>
      socket.emit('room:updateSettings', { settings }),
    addCustomWord: (word: string, meaning: string, hint: string) =>
      socket.emit('room:addCustomWord', { word, meaning, hint }),
    changeColor: (colorId: string) =>
      socket.emit('player:colorChange', { colorId }),
    leaveRoom: () => {
      socket.emit('room:leave');
      setState(s => ({ ...initialState }));
    },
    playAgain: () => socket.emit('game:playAgain'),
    clearError: () => setState(s => ({ ...s, error: null })),
  };

  return { ...state, actions };
}
