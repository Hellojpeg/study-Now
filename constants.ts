
import { Question, QuizData, CourseContent, CourseModule, SubjectId, BattleCharacter, ShopItem, DeductionTarget, Assignment, WeeklyTask, Classroom, User, AnalysisScenario } from './types';

// --- MOCK TEACHER DATA ---

export const MOCK_CLASSES: Classroom[] = [
    { id: 'c1', name: 'World History', section: 'Period 1', code: 'WH-P1-2024', studentCount: 24, assignments: ['a1', 'a2'] },
    { id: 'c2', name: 'World History', section: 'Period 3', code: 'WH-P3-2024', studentCount: 28, assignments: ['a1'] },
    { id: 'c3', name: 'Civics Honors', section: 'Period 5', code: 'CV-P5-HON', studentCount: 30, assignments: ['a4'] },
    { id: 'c4', name: 'US History', section: 'Period 2', code: 'US-P2-2024', studentCount: 25, assignments: ['a5'] }
];

export const MOCK_STUDENTS: User[] = [
    { id: 's1', name: 'Alice Johnson', email: 'alice@school.edu', role: 'STUDENT' },
    { id: 's2', name: 'Bob Smith', email: 'bob@school.edu', role: 'STUDENT' },
    { id: 's3', name: 'Charlie Davis', email: 'charlie@school.edu', role: 'STUDENT' },
    { id: 's4', name: 'Diana Prince', email: 'diana@school.edu', role: 'STUDENT' },
];

// --- DASHBOARD DATA ---

export const MOCK_ASSIGNMENTS: Assignment[] = [
    { id: 'a1', title: 'Ancient Greece Midterm Prep', subject: 'world-history', type: 'QUIZ', dueDate: 'Today', status: 'PENDING', points: 100, linkMode: 'standard' },
    { id: 'a2', title: 'Read: Rise of Democracy', subject: 'world-history', type: 'READING', dueDate: 'Tomorrow', status: 'PENDING', points: 50, linkMode: 'textbook' },
    { id: 'a3', title: 'Vocab Match: Mythology', subject: 'world-history', type: 'GAME', dueDate: 'Friday', status: 'PENDING', points: 25, linkMode: 'matching' },
    { id: 'a4', title: 'Civics: Legislative Branch', subject: 'civics', type: 'QUIZ', dueDate: 'Next Week', status: 'PENDING', points: 100, linkMode: 'standard' },
    { id: 'a5', title: 'Project: Boycott Poster', subject: 'us-history', type: 'PROJECT', dueDate: 'Friday', status: 'PENDING', points: 200, linkMode: 'modules' },
    { id: 'a6', title: 'Primary Source Analysis', subject: 'civics', type: 'READING', dueDate: 'Today', status: 'PENDING', points: 50, linkMode: 'analysis' }
];

export const MOCK_WEEKLY_TASKS: WeeklyTask[] = [
    { day: 'Mon', label: 'Bell Work: Geo', isCompleted: true, isLocked: false },
    { day: 'Tue', label: 'Bell Work: Vocab', isCompleted: true, isLocked: false },
    { day: 'Wed', label: 'Bell Work: Quiz', isCompleted: false, isLocked: false },
    { day: 'Thu', label: 'Bell Work: Map', isCompleted: false, isLocked: true },
    { day: 'Fri', label: 'Bell Work: Review', isCompleted: false, isLocked: true },
];

// --- ANALYSIS CONTENT (Primary Sources) ---

export const ANALYSIS_SCENARIOS: AnalysisScenario[] = [
    {
        id: 'as1',
        title: 'Article I, Section 8 (The Elastic Clause)',
        excerpt: "The Congress shall have Power... To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers, and all other Powers vested by this Constitution in the Government of the United States, or in any Department or Officer thereof.",
        source: "U.S. Constitution, Article I",
        tasks: [
            {
                id: 't1',
                type: 'SHORT_RESPONSE',
                prompt: "Explain why the 'Necessary and Proper Clause' is often called the 'Elastic Clause' and how it expands the power of Congress beyond the enumerated powers.",
                rubricKeywords: ['stretch', 'implied powers', 'change', 'adapt', 'enumerated', 'expand', 'flexibility'],
                sampleAnswer: "It is called the Elastic Clause because it allows Congress to 'stretch' its powers to meet new needs that the Founding Fathers didn't anticipate. It grants Congress 'Implied Powers' to pass laws needed to carry out its specific (enumerated) powers, allowing the government to adapt to changing times."
            },
            {
                id: 't2',
                type: 'VENN',
                prompt: "Compare the House of Representatives and the Senate.",
                vennLabels: { a: 'House of Reps', b: 'Senate' },
                vennItems: [
                    { id: 'v1', text: '435 Members', correctZone: 'A' },
                    { id: 'v2', text: '100 Members', correctZone: 'B' },
                    { id: 'v3', text: 'Based on Population', correctZone: 'A' },
                    { id: 'v4', text: '2 Per State', correctZone: 'B' },
                    { id: 'v5', text: 'Makes Laws', correctZone: 'BOTH' },
                    { id: 'v6', text: '6 Year Terms', correctZone: 'B' },
                    { id: 'v7', text: '2 Year Terms', correctZone: 'A' },
                    { id: 'v8', text: 'Elected by People', correctZone: 'BOTH' }
                ]
            }
        ]
    },
    {
        id: 'as2',
        title: 'Voices from Valley Forge',
        excerpt: "I am Sick . . . Poor food—hard lodging—Cold Weather—fatigue—Nasty Cloaths—nasty Cookery—Vomit half my time . . . I can’t Endure it— Why are we sent here to starve and Freeze— What sweet Felicities have I left at home; A charming Wife—pretty Children—Good Beds—good food—good Cookery—all agreeable—all harmonious. Here all Confusion—smoke & Cold—hunger & filthyness . . .",
        source: "Albigence Waldo, Continental Army Surgeon, December 14, 1777",
        tasks: [
            {
                id: 't3',
                type: 'SHORT_RESPONSE',
                prompt: "Using evidence from the text, describe the physical and emotional hardships faced by the soldiers at Valley Forge.",
                rubricKeywords: ['sick', 'cold', 'food', 'starve', 'freeze', 'home', 'family', 'confusion', 'filth'],
                sampleAnswer: "The soldiers faced extreme physical hardships including starvation, freezing cold weather, and sickness. Emotionally, they suffered from missing the comforts of home, such as their families ('pretty Children') and good food, contrasting their 'agreeable' home life with the 'Confusion' of the camp."
            }
        ]
    }
];

// --- ARCADE DATA ---

export const PARTY_MEMBERS: BattleCharacter[] = [
  {
    id: 'hero2', name: "Lady Liberty", maxHp: 150, currentHp: 150, attack: 20, defense: 15, speed: 8, avatar: "🗽", element: 'FIRE', unlockedMoves: 2,
    moves: [
      { name: "Torch Slam", power: 60, accuracy: 90, type: 'PHYSICAL', element: 'FIRE', description: "A fiery strike." },
      { name: "Freedom Ring", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Heals 50 HP.", effect: 'HEAL' },
      { name: "Fireworks", power: 90, accuracy: 80, type: 'SPECIAL', element: 'FIRE', description: "Explosive magic damage." },
      { name: "Enlighten", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Buffs Attack significantly.", effect: 'BUFF_ATK' }
    ]
  },
  {
    id: 'hero3', name: "The Eagle", maxHp: 100, currentHp: 100, attack: 25, defense: 5, speed: 20, avatar: "🦅", element: 'AIR', unlockedMoves: 2,
    moves: [
      { name: "Aerial Ace", power: 50, accuracy: 100, type: 'PHYSICAL', element: 'AIR', description: "Swift strike that never misses." },
      { name: "Screech", power: 0, accuracy: 90, type: 'STATUS', element: 'NORMAL', description: "Lowers enemy defense.", effect: 'DEBUFF_DEF' },
      { name: "Tornado", power: 70, accuracy: 85, type: 'SPECIAL', element: 'AIR', description: "Summons a whirlwind." },
      { name: "Dive Bomb", power: 100, accuracy: 70, type: 'PHYSICAL', element: 'AIR', description: "High risk, high damage." }
    ]
  },
  {
    id: 'hero4', name: "The Patriot", maxHp: 180, currentHp: 180, attack: 15, defense: 25, speed: 5, avatar: "💂", element: 'EARTH', unlockedMoves: 2,
    moves: [
      { name: "Musket Shot", power: 45, accuracy: 85, type: 'PHYSICAL', element: 'NORMAL', description: "Standard ranged attack." },
      { name: "Hold the Line", power: 0, accuracy: 100, type: 'STATUS', element: 'EARTH', description: "Drastically boosts Defense.", effect: 'HEAL' },
      { name: "Bayonet", power: 60, accuracy: 95, type: 'PHYSICAL', element: 'EARTH', description: "Sturdy physical attack." },
      { name: "Cannonball", power: 110, accuracy: 60, type: 'PHYSICAL', element: 'EARTH', description: "Heavy earth damage." }
    ]
  }
];

// --- Completed missing constants to fix compilation errors ---

// Fix for Error: Type '{}' is missing the following properties from type 'BattleCharacter': id, name, maxHp, currentHp, and 7 more.
export const BOSS_DATA: BattleCharacter[] = [
  {
    id: 'boss1',
    name: "The Tyrant",
    maxHp: 500,
    currentHp: 500,
    attack: 30,
    defense: 20,
    speed: 5,
    element: 'FIRE',
    avatar: "👺",
    unlockedMoves: 2,
    moves: [
      { name: "Oppress", power: 40, accuracy: 90, type: 'SPECIAL', element: 'FIRE', description: "Deals fire damage." },
      { name: "Heavy Strike", power: 60, accuracy: 80, type: 'PHYSICAL', element: 'NORMAL', description: "A brutal blow." }
    ]
  }
];

export const WORLD_HISTORY_COURSE_CONTENT: CourseContent = {
    title: "World History",
    description: "Journey through time.",
    chapters: [
        { id: 'ch1', title: 'Ancient Civilizations', content: ['The cradle of civilization...'] }
    ],
    benchmarks: [
        { code: 'SS.6.W.1.1', description: 'Analyze primary and secondary sources.', clarifications: ['Context matters.'] }
    ]
};

export const WORLD_HISTORY_MODULES: CourseModule[] = [
    { id: 1, title: 'The First Civilizations', focus: 'Early humans', keyTopics: ['Mesopotamia', 'Egypt'], standardCodes: ['SS.6.W.1.1'] }
];

export const CIVICS_COURSE_CONTENT: CourseContent = {
    title: "Civics",
    description: "Understanding your government.",
    chapters: [],
    benchmarks: []
};

export const CIVICS_MODULES: CourseModule[] = [
    { id: 1, title: 'Foundations of Government', focus: 'Roots of democracy', keyTopics: ['Magna Carta'], standardCodes: [] }
];

export const US_HISTORY_COURSE_CONTENT: CourseContent = {
    title: "US History",
    description: "Exploring America's past.",
    chapters: [],
    benchmarks: []
};

export const US_HISTORY_MODULES: CourseModule[] = [
    { id: 1, title: 'Colonial America', focus: '13 Colonies', keyTopics: ['Jamestown'], standardCodes: [] }
];

export const QUIZZES: Record<SubjectId, QuizData> = {
    'world-history': {
        id: 'world-history',
        title: 'World History',
        description: 'Global history overview.',
        questions: [
            { id: 1, unit: 'Unit 1', question: 'Who built the pyramids?', options: ['Egyptians', 'Romans', 'Greeks', 'Mayans'], correctAnswerIndex: 0, benchmark: 'SS.6.W.1.1' }
        ]
    },
    'civics': {
        id: 'civics',
        title: 'Civics',
        description: 'US Government and Citizenship.',
        questions: []
    },
    'us-history': {
        id: 'us-history',
        title: 'US History',
        description: 'The American Story.',
        questions: []
    }
};

export const SHOP_ITEMS: ShopItem[] = [
    { id: 'i1', name: 'Ink & Quill', cost: 50, multiplier: 1.2, description: 'Better notes earn more.', icon: '🪶' }
];

export const DEDUCTION_TARGETS: DeductionTarget[] = [
    { id: 'dt1', name: 'George Washington', category: 'person', clues: ['General', 'First President'], description: 'Father of his country.', image: '🗽' }
];

export const WHEEL_PHRASES: string[] = ["DEMOCRACY", "CONSTITUTION", "LIBERTY"];
