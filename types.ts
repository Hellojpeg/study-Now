
export interface Question {
  id: number;
  unit: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint?: string;
}

export enum QuizState {
  LANDING = 'LANDING',
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  MULTIPLAYER = 'MULTIPLAYER'
}

export interface QuizResult {
  totalQuestions: number;
  score: number;
  missedQuestions: number[]; // IDs of missed questions
}

export type SubjectId = 'world-history' | 'civics' | 'us-history';

export interface QuizData {
  id: SubjectId;
  title: string;
  description: string;
  questions: Question[];
}

export type GameMode = 'standard' | 'speed' | 'matching';

export interface MatchingCard {
  id: string;
  content: string;
  type: 'question' | 'answer';
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
  iconName?: string;
}

// --- Multiplayer Types ---

export type MultiplayerGameState = 'MENU' | 'LOBBY' | 'COUNTDOWN' | 'QUESTION' | 'RESULT' | 'LEADERBOARD' | 'PODIUM';

export type MultiplayerGameMode = 'CLASSIC' | 'SMASH';

export interface GameSettings {
  gameMode: MultiplayerGameMode;
  timerDuration: number;
  autoPlay: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  lastAnswerTime: number | null; // ms taken to answer
  rank: number;
  previousRank: number; // For animation
  avatarColor: string;
}

export interface MultiplayerMessage {
  type: 'JOIN' | 'UPDATE_STATE' | 'ANSWER' | 'SMASH' | 'KICK';
  payload?: any;
}
