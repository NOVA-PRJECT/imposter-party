export type GamePhase =
  | 'lobby'
  | 'role-reveal'
  | 'discussion'
  | 'voting'
  | 'proceeding'
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
  disconnectExpiresAt?: number | null;
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
  selectedCategories?: string[];
  hintMode: boolean;
  meaningMode: boolean;
}

export interface CustomWord {
  id?: string;
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

export interface VoteTargetBreakdown {
  targetId: string;
  voters: {
    id: string;
    name: string;
    color: ColorId;
  }[];
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
  guessedBy?: {
    id: string;
    name: string;
    color: ColorId;
    word: string;
  } | null;
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
  voteBreakdown: VoteTargetBreakdown[];
  timer: number | null;
  categories: { id: string; label: string }[];
  customWordCount: number;
  customWords: CustomWord[];
  error: string | null;
  guessResult?: { success: boolean; message: string } | null;
}
