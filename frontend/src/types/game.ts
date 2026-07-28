export type GamePhase =
  | 'lobby'
  | 'role-reveal'
  | 'discussion'
  | 'voting'
  | 'vote-result'
  | 'game-over';

export type ColorId =
  | 'red' | 'blue' | 'green' | 'purple' | 'yellow' | 'black'
  | 'white' | 'orange' | 'pink' | 'brown' | 'cyan' | 'lime'
  | 'maroon' | 'rose' | 'banana' | 'coral' | 'gray' | 'tan';

export interface PlayerColor {
  id: ColorId;
  hex: string;
  label: string;
}

export interface Player {
  id: string;
  name: string;
  color: ColorId;
  isHost: boolean;
  isAlive: boolean;
  hasVoted: boolean;
  voteCount: number;
  disconnected: boolean;
}

export interface MyRole {
  isImposter: boolean;
  word: string | null;
  meaning: string | null;
  hint: string | null;
  fellowImposters: FellowImposter[];
}

export interface FellowImposter {
  name: string;
  color: ColorId;
}

export interface RoomSettings {
  maxPlayers: number;
  imposterCount: number;
  votingTimerSeconds: number;
  wordCategory: string;
  hintMode: boolean;
  meaningMode: boolean;
}

export interface CustomWord {
  word: string;
  meaning: string;
  hint: string;
}

export interface WordEntry {
  word: string;
  meaning: string;
  hint: string;
}

export interface WordCategory {
  id: string;
  label: string;
  words: WordEntry[];
}

export interface VoteResult {
  eliminated: {
    id: string;
    name: string;
    color: ColorId;
    wasImposter: boolean;
  } | null;
  tie: boolean;
  players: Player[];
  winCondition: 'crewmates' | 'imposters' | null;
  revealedPlayers?: RevealedPlayer[];
  word?: string;
}

export interface RevealedPlayer extends Player {
  isImposter: boolean;
}

export interface GameState {
  phase: GamePhase;
  roomCode: string;
  players: Player[];
  myId: string;
  myRole: MyRole | null;
  settings: RoomSettings;
  isHost: boolean;
  myVote: string | null;
  voteProgress: { votedCount: number; totalAlive: number } | null;
  voteResult: VoteResult | null;
  timer: number | null;
  categories: { id: string; label: string }[];
  customWordCount: number;
  error: string | null;
}
