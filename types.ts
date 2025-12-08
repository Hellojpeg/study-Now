export interface Question {
  id: number;
  unit: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint?: string;
}

export enum QuizState {
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
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