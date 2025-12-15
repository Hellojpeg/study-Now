
export interface Question {
  id: number;
  unit: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint?: string;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'MID' | 'FIN';
  week?: number;
  image?: string;
  benchmark?: string; // Links to a specific standard code (e.g., SS.6.W.3.2)
  questionType?: 'MCQ' | 'TF' | 'VOCAB' | 'ANALYSIS' | 'MATCH'; // Type of question
  bloomLevel?: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE'; // Bloom's Taxonomy
}

export enum QuizState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
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

export type GameMode = 'standard' | 'speed' | 'matching' | 'flashcards' | 'jeopardy' | 'wordle' | 'textbook' | 'outline' | 'modules' | 'boss' | 'commerce' | 'tictactoe' | 'hangman' | 'guesswho' | 'guesswhat' | 'towerdefense' | 'wheel' | 'millionaire' | 'analysis' | 'connect4' | 'battleship' | 'risk' | 'checkers';

export interface MatchingCard {
  id: string;
  content: string;
  type: 'question' | 'answer';
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
  iconName?: string;
}

// --- Analysis / Higher Order Types ---

export type AnalysisTaskType = 'SHORT_RESPONSE' | 'VENN';

export interface VennItem {
  id: string;
  text: string;
  correctZone: 'A' | 'B' | 'BOTH'; // A = Left, B = Right, BOTH = Center
}

export interface AnalysisTask {
  id: string;
  type: AnalysisTaskType;
  prompt: string;
  // For Short Response
  rubricKeywords?: string[]; // Keywords required for full credit
  sampleAnswer?: string;
  // For Venn
  vennLabels?: { a: string, b: string };
  vennItems?: VennItem[];
}

export interface AnalysisScenario {
  id: string;
  title: string;
  excerpt: string;
  source?: string;
  image?: string;
  tasks: AnalysisTask[];
}

// --- Auth & User Types ---

export type UserRole = 'STUDENT' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Classroom {
  id: string;
  name: string;
  section: string;
  code: string;
  studentCount: number;
  assignments: string[]; // IDs of assigned quizzes
}

// --- Dashboard Types ---

export interface Assignment {
  id: string;
  title: string;
  subject: SubjectId;
  type: 'QUIZ' | 'READING' | 'GAME' | 'PROJECT';
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'LATE';
  points: number;
  linkMode: GameMode; // Which game mode to start
}

export interface WeeklyTask {
  day: string;
  label: string;
  isCompleted: boolean;
  isLocked: boolean; // Future days locked
}

// --- RPG Boss Battle Types ---

export type MoveCategory = 'PHYSICAL' | 'SPECIAL' | 'STATUS';
export type ElementType = 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'NORMAL';

export interface BattleMove {
  name: string;
  power: number; // 0-100
  accuracy: number; // 0-100
  type: MoveCategory;
  element: ElementType;
  description: string;
  effect?: 'HEAL' | 'BUFF_ATK' | 'DEBUFF_DEF' | 'STUN';
}

export interface BattleCharacter {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  element: ElementType;
  avatar: string; // Emoji or URL
  moves: BattleMove[];
  unlockedMoves: number; // How many moves are available (2, 3, or 4)
}

// --- Arcade / Strategy Types ---

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  multiplier: number; // Increases money per question
  description: string;
  icon: string;
}

export interface CommerceState {
  money: number;
  multiplier: number;
  inventory: string[]; // IDs of bought items
}

// --- Deduction Types (Guess Who / What) ---
export interface DeductionTarget {
  id: string;
  name: string;
  image: string; // Emoji or URL
  category: 'person' | 'object'; // To distinguish modes
  clues: string[]; // 3-4 clues
  description: string; // Final reveal text
}

// --- Tower Defense Types ---
export type TowerType = 'PEASANT' | 'ARCHER' | 'SNIPER' | 'MAGE' | 'ICE' | 'CANNON' | 'TESLA' | 'POISON' | 'MINIGUN' | 'LASER' | 'MORTAR' | 'SONIC' | 'PLASMA' | 'VOID';

export interface TDEnemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number; // Progress along the SVG path
  frozen?: number;
  isBoss?: boolean;
}

export interface TDTower {
  id: string;
  x: number;
  y: number;
  type: TowerType;
  range: number;
  damage: number;
  cooldown: number;
  energyCost: number; // How much knowledge per shot
  lastShot: number;
}

// --- Curriculum Types ---

export interface Benchmark {
  code: string;
  description: string;
  clarifications: string[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string[]; // Array of paragraphs
}

export interface CourseContent {
  title: string;
  description: string;
  chapters: Chapter[];
  benchmarks: Benchmark[];
}

// --- LMS / Textbook Types ---

export interface VocabularyTerm {
  term: string;
  definition: string;
  image?: string;
}

export interface SimpleQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string[]; // Paragraphs
  image?: {
    url: string;
    caption: string;
  };
  miniQuiz?: SimpleQuizQuestion[];
}

export interface ModuleChapter {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: SimpleQuizQuestion[]; // End of chapter quiz
}

export interface ProjectStep {
    title: string;
    description: string;
    checklist: string[];
}

export interface CourseProject {
    title: string;
    question: string;
    summary: string;
    steps: ProjectStep[];
}

export interface CourseModule {
  id: number;
  title: string;
  focus: string;
  keyTopics: string[];
  standardCodes: string[];
  // Rich Content
  chapters?: ModuleChapter[];
  vocabulary?: VocabularyTerm[];
  keyConcepts?: string[];
  project?: CourseProject; // New Project Field
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
