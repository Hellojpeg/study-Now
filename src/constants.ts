
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
    { id: 'a4', title: 'Civics EOC Practice', subject: 'civics', type: 'QUIZ', dueDate: 'Next Week', status: 'PENDING', points: 100, linkMode: 'standard' },
    { id: 'a5', title: 'Principles of Constitution', subject: 'us-history', type: 'QUIZ', dueDate: 'Friday', status: 'PENDING', points: 200, linkMode: 'standard' }
];

export const MOCK_WEEKLY_TASKS: WeeklyTask[] = [
    { day: 'Mon', label: 'Bell Work: Geo', isCompleted: true, isLocked: false },
    { day: 'Tue', label: 'Bell Work: Vocab', isCompleted: true, isLocked: false },
    { day: 'Wed', label: 'Bell Work: Quiz', isCompleted: false, isLocked: false },
    { day: 'Thu', label: 'Bell Work: Map', isCompleted: false, isLocked: true },
    { day: 'Fri', label: 'Bell Work: Review', isCompleted: false, isLocked: true },
];

// --- QUESTION BANKS ---

const WH_MIDTERM: Question[] = [
  {id: 1, unit: 'Prehistory', question: 'The Stone Age is named because early humans', options: ['lived in stone houses', 'made their first tools from stone', 'carved religious symbols in stone', 'lived in rocky environments'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 2, unit: 'Prehistory', question: 'A major benefit of the Agricultural Revolution was', options: ['constant movement', 'fewer people', 'food surpluses that allowed populations to grow', 'an end to hunting'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 3, unit: 'Prehistory', question: 'Paleolithic people survived mainly by', options: ['farming crops', 'trading food', 'hunting and gathering', 'herding animals'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 4, unit: 'Prehistory', question: 'The correct chronological order of early human time periods is', options: ['Bronze Age, Neolithic Age, Paleolithic Age', 'Paleolithic Age, Neolithic Age, Bronze Age', 'Neolithic Age, Paleolithic Age, Bronze Age', 'Bronze Age, Paleolithic Age, Neolithic Age'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 5, unit: 'Prehistory', question: 'The Neolithic Age began when humans first', options: ['used fire', 'developed art', 'began farming', 'created tools'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 6, unit: 'Prehistory', question: 'Ancient cave paintings suggest early humans', options: ['had formal schools', 'developed writing', 'wanted to express ideas', 'lived in cities'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 7, unit: 'Prehistory', question: 'Compared to Paleolithic tools, Neolithic tools were', options: ['simpler', 'only for hunting', 'more specialized', 'rarely used'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 8, unit: 'Prehistory', question: 'Bronze was an important technological breakthrough because it', options: ['was inexpensive', 'required no special skills', 'created stronger tools and weapons', 'replaced farming'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 9, unit: 'Mesopotamia', question: 'Early Mesopotamians were', options: ['monotheistic', 'atheistic', 'polytheistic', 'agnostic'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 10, unit: 'Mesopotamia', question: 'King Hammurabi is best known for', options: ['building pyramids', 'promoting trade', 'creating a strict law code', 'inventing writing'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 11, unit: 'Mesopotamia', question: 'Flooding benefited Mesopotamian farmers because it', options: ['created trade routes', 'deposited fertile silt', 'increased rainfall', 'raised river levels permanently'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 12, unit: 'Mesopotamia', question: 'Most Mesopotamian empires formed through', options: ['elections', 'peaceful agreements', 'conquest', 'migration'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 13, unit: 'Mesopotamia', question: 'Which civilization invented the first system of writing?', options: ['Babylonians', 'Assyrians', 'Sumerians', 'Phoenicians'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 14, unit: 'Mesopotamia', question: 'Food surpluses in Mesopotamia allowed people to', options: ['move constantly', 'develop specialized jobs', 'abandon religion', 'reject trade'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 15, unit: 'Mesopotamia', question: 'Which Sumerian achievement is still used today?', options: ['cuneiform writing', 'ziggurats', 'the wheel', 'city-states'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 16, unit: 'Mesopotamia', question: 'Assyrian kings maintained control mainly by', options: ['generosity', 'diplomacy', 'fear and military force', 'shared leadership'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 17, unit: 'Egypt', question: 'The Egyptian Book of the Dead was used to', options: ['list laws', 'guide the afterlife', 'record history', 'track trade'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 18, unit: 'Egypt', question: 'The Great Pyramid of Giza served as', options: ['a temple', 'a palace', 'a tomb', 'a school'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 19, unit: 'Egypt', question: 'Egyptian hieroglyphics were', options: ['religious ceremonies', 'an irrigation system', 'a system of writing', 'decorations only'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 20, unit: 'Egypt', question: 'Egyptians obeyed the pharaoh because they believed he', options: ['was elected', 'was the strongest warrior', 'was chosen by priests', 'was the son of a god'], correctAnswerIndex: 3, quarter: 'MID'},
  {id: 21, unit: 'Kush', question: 'Kush became wealthy primarily through', options: ['farming', 'gold mining', 'iron production', 'fishing'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 22, unit: 'Egypt', question: 'Women in ancient Egypt were able to', options: ['vote in elections', 'own property', 'lead armies', 'rule empires'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 23, unit: 'Egypt', question: 'The construction of pyramids led Egypt to advance in', options: ['writing', 'mathematics and calendars', 'sailing', 'warfare'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 24, unit: 'Judaism', question: 'The Jewish holiday of Passover celebrates', options: ['the giving of the Ten Commandments', 'the Exodus from Egypt', 'King David’s coronation', 'Roman rule'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 25, unit: 'Judaism', question: 'The Jewish Sabbath is a', options: ['yearly celebration', 'book of laws', 'weekly day of rest', 'pilgrimage'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 26, unit: 'Judaism', question: 'The ancestors of the Israelites were', options: ['Moses and Aaron', 'Saul and David', 'Abraham and his family', 'Jewish rabbis'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 27, unit: 'Judaism', question: 'Which empire destroyed Jerusalem and forced Jews into exile?', options: ['Egyptian', 'Persian', 'Greek', 'Neo-Babylonian'], correctAnswerIndex: 3, quarter: 'MID'},
  {id: 28, unit: 'Judaism', question: 'Judaism shares belief in one God with', options: ['Buddhism', 'Hinduism', 'Christianity', 'Shinto'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 29, unit: 'Judaism', question: 'The Diaspora refers to', options: ['Jewish rule of empires', 'Jewish migration and settlement outside Israel', 'the building of the First Temple', 'Roman persecution only'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 30, unit: 'Judaism', question: 'Rabbis were important in ancient Judaism because they', options: ['ruled governments', 'collected taxes', 'taught and explained the Torah', 'commanded armies'], correctAnswerIndex: 2, quarter: 'MID'}
];

const GREECE_QUESTIONS: Question[] = [
  { id: 301, unit: 'Greece', question: 'Why did ancient Greece develop independent city-states instead of one unified empire?', options: ['Lack of trade routes', 'Mountainous terrain separated communities', 'Constant civil wars', 'Influence from Rome'], correctAnswerIndex: 1 },
  { id: 302, unit: 'Greece', question: 'How did the Aegean Sea most influence Greek civilization?', options: ['Prevented foreign invasion', 'Encouraged isolation', 'Served as a highway for trade and travel', 'Flooded farmland'], correctAnswerIndex: 2 },
  { id: 303, unit: 'Greece', question: 'Which crops were most commonly grown in ancient Greece?', options: ['Rice, corn, cotton', 'Olives, grapes, wheat, barley', 'Potatoes, beans, squash', 'Sugar, tea, spices'], correctAnswerIndex: 1 },
  { id: 314, unit: 'Greece', question: 'Athens practiced which form of government?', options: ['Monarchy', 'Oligarchy', 'Direct democracy', 'Dictatorship'], correctAnswerIndex: 2 }
];

const US_MIDTERM: Question[] = [
  {id: 501, unit: 'Principles of Constitution', question: 'The phrase “We the People” best represents which constitutional principle?', options: ['Federalism', 'Popular sovereignty', 'Judicial review', 'Limited government'], correctAnswerIndex: 1, quarter: 'Q3', week: 2},
  {id: 502, unit: 'Principles of Constitution', question: 'Popular sovereignty means that:', options: ['Power belongs to the President', 'Power belongs to the states', 'Government authority comes from the people', 'Congress controls the courts'], correctAnswerIndex: 2, quarter: 'Q3', week: 2},
  {id: 506, unit: 'Principles of Constitution', question: 'Federalism refers to:', options: ['The power of courts', 'Division of government into branches', 'Sharing power between national and state governments', 'The amendment process'], correctAnswerIndex: 2, quarter: 'Q3', week: 2},
  {id: 512, unit: 'Principles of Constitution', question: 'Separation of powers divides government into:', options: ['Federal, state, local', 'Military and civilian', 'Legislative, executive, judicial', 'Congress, courts, voters'], correctAnswerIndex: 2, quarter: 'Q3', week: 2},
  {id: 516, unit: 'Principles of Constitution', question: 'Checks and balances are designed to:', options: ['Make laws faster', 'Limit the power of each branch', 'Strengthen the President', 'Eliminate state authority'], correctAnswerIndex: 1, quarter: 'Q3', week: 2},
  {id: 520, unit: 'Principles of Constitution', question: 'The Bill of Rights was added primarily to:', options: ['Strengthen Congress', 'Protect individual liberties', 'Increase state powers', 'Create new courts'], correctAnswerIndex: 1, quarter: 'Q3', week: 2}
];

const CIV_EOC: Question[] = [
  { id: 601, unit: 'EOC Final', benchmark: 'SS.7.C.1.1', question: 'The statements below are from the Declaration of Independence. Which statement reflects the Enlightenment ideas of natural law as expressed by Locke?', options: ['A: All men are created equal', 'B: They are endowed by their Creator with certain unalienable Rights', 'C: Governments are instituted among Men', 'D: Deriving their just powers from the consent of the governed'], correctAnswerIndex: 1, quarter: 'FIN' },
  { id: 602, unit: 'EOC Final', benchmark: 'SS.7.C.1.2', question: 'What did many American colonists use Thomas Paine\'s Common Sense to justify?', options: ['Acts of sabotage against British merchants', 'Declaring independence from Britain', 'Joining the army instead of the militia', 'Supporting the British monarchy'], correctAnswerIndex: 1, quarter: 'FIN' },
  { id: 603, unit: 'EOC Final', benchmark: 'SS.7.C.1.3', question: 'Which action completes the diagram describing causes that led to the writing of the Declaration of Independence?', options: ['British eliminate all taxes on colonists', 'Colonists vote to elect new member of Parliament', 'British ignore colonist grievances', 'Colonist send troops to Britain in protest'], correctAnswerIndex: 2, quarter: 'FIN' },
  { id: 604, unit: 'EOC Final', benchmark: 'SS.7.C.1.4', question: 'The Declaration of Independence included complaints like taxation without representation. Which complaint should be added to the list?', options: ['Requiring colonists to send representation to Parliament', 'Suspending trial by jury in many cases', 'Ordering colonists to move from Native American land', 'Allowing the wealthy to avoid local laws'], correctAnswerIndex: 1, quarter: 'FIN' },
  { id: 606, unit: 'EOC Final', benchmark: 'SS.7.C.1.5', question: 'Which of the following was a weakness of the Articles of Confederation?', options: ['The government did not have a separate judicial branch', 'The states could not print their own currency', 'The president was able to spend taxes freely', 'The government had too much power over trade'], correctAnswerIndex: 0, quarter: 'FIN' },
  { id: 608, unit: 'EOC Final', benchmark: 'SS.7.C.1.6', question: 'What does the phrase "insure domestic tranquility" in the Preamble of the Constitution mean?', options: ['Give land to the homeless', 'Fight wars on foreign soil', 'Keep the homeland at peace', 'Provide citizens with insurance'], correctAnswerIndex: 2, quarter: 'FIN' },
  { id: 611, unit: 'EOC Final', benchmark: 'SS.7.C.1.7', question: 'In Federalist 51, Madison describes "the interior structure of the government as its several constituent parts may, by their mutual relations, be the means of keeping each other in their proper places." Which principle is this?', options: ['Popular sovereignty', 'Judicial review', 'Checks and balances', 'Separation of powers'], correctAnswerIndex: 2, quarter: 'FIN' },
  { id: 613, unit: 'EOC Final', benchmark: 'SS.7.C.1.9', question: 'How does rule of law affect U.S. government officials and institutions?', options: ['It holds government officials and institutions accountable to the law', 'It requires officials to create new laws', 'It prevents making work public', 'It ensures officials are exempt from laws'], correctAnswerIndex: 0, quarter: 'FIN' },
  { id: 614, unit: 'EOC Final', benchmark: 'SS.7.C.3.10', question: 'What is a government that is run by the people, either directly or indirectly?', options: ['Democracy', 'Oligarchy', 'Autocracy', 'Communism'], correctAnswerIndex: 0, quarter: 'FIN' },
  { id: 615, unit: 'EOC Final', benchmark: 'SS.7.C.2.1', question: 'What is the term used in the 14th Amendment to describe persons who are born or naturalized in the United States?', options: ['Aliens', 'Citizens', 'Immigrants', 'Residents'], correctAnswerIndex: 1, quarter: 'FIN' },
  { id: 620, unit: 'EOC Final', benchmark: 'SS.7.C.2.4', question: 'According to the U.S. Constitution, under what circumstances would Peter win his fight to keep his home against eminent domain?', options: ['If he had paid the full price already', 'If he was born as a citizen', 'If the govt didnt build in an uninhabited area', 'If the govt did not offer him fair market price'], correctAnswerIndex: 3, quarter: 'FIN' },
  { id: 627, unit: 'EOC Final', benchmark: 'SS.7.C.3.12', question: 'What happened in American schools after the 1954 U.S. Supreme Court decision in Brown v. Board of Education?', options: ['States could continue segregation if separate but equal', 'Individuals voluntarily stopped all segregation', 'The federal government ordered desegregation', 'Desegregation was ordered for only high schools'], correctAnswerIndex: 2, quarter: 'FIN' },
  { id: 628, unit: 'EOC Final', benchmark: 'SS.7.C.3.12', question: 'Miranda v. Arizona (1966) protects which freedom?', options: ['Freedom of speech', 'Protection against self-incrimination', 'Protection of due process', 'Freedom of assembly'], correctAnswerIndex: 1, quarter: 'FIN' },
  { id: 645, unit: 'EOC Final', benchmark: 'SS.7.C.3.2', question: 'Who has the most power in a unitary system?', options: ['Central government', 'Local government', 'State government', 'Regional government'], correctAnswerIndex: 0, quarter: 'FIN' },
  { id: 647, unit: 'EOC Final', benchmark: 'SS.7.C.3.3', question: 'How are responsibilities of the legislative and executive branches different regarding treaties?', options: ['Senate proposes; President carries out', 'Senate negotiates; President approves', 'Senate carries out; President proposes', 'Senate ratifies; President negotiates'], correctAnswerIndex: 3, quarter: 'FIN' },
  { id: 650, unit: 'EOC Final', benchmark: 'SS.7.C.3.5', question: 'Which accurately describes one way an amendment to the U.S. Constitution may be proposed?', options: ['Two-thirds of each house of Congress votes to propose', 'Two-thirds of citizens nationwide vote', 'Three-fourths of state legislatures vote', 'Three-fourths of each house votes'], correctAnswerIndex: 0, quarter: 'FIN' },
  { id: 656, unit: 'EOC Final', benchmark: 'SS.7.C.3.14', question: 'Which service is performed by local government?', options: ['Delivering mail', 'Granting teacher certificates', 'Minting quarters', 'Providing fire protection'], correctAnswerIndex: 3, quarter: 'FIN' }
];

// --- APP DATA CONFIG ---

export const QUIZZES: Record<SubjectId, QuizData> = {
  'world-history': {
    id: 'world-history',
    title: 'World History',
    description: 'Journey from prehistory to the ancient world.',
    questions: [...WH_MIDTERM, ...GREECE_QUESTIONS]
  },
  'civics': {
    id: 'civics',
    title: 'Civics',
    description: 'Master the MJ Civics End-of-Course Practice Exam.',
    questions: CIV_EOC
  },
  'us-history': {
    id: 'us-history',
    title: 'US History',
    description: 'Principles of the Constitution and early America.',
    questions: US_MIDTERM
  }
};

/* Added PARTY_MEMBERS export for BossBattleGame.tsx */
export const PARTY_MEMBERS: BattleCharacter[] = [
  { 
    id: 'p1', name: "Scholar", maxHp: 100, currentHp: 100, attack: 20, defense: 15, speed: 10, avatar: "👨‍🎓", element: 'FIRE', unlockedMoves: 2,
    moves: [
        { name: "Ink Blast", power: 40, accuracy: 100, type: 'SPECIAL', element: 'FIRE', description: "Blast of hot ink." },
        { name: "Paper Cut", power: 30, accuracy: 100, type: 'PHYSICAL', element: 'NORMAL', description: "A swift cut." },
        { name: "Meditation", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Heals user.", effect: 'HEAL' },
        { name: "Focus Beam", power: 80, accuracy: 90, type: 'SPECIAL', element: 'FIRE', description: "Concentrated knowledge." }
    ] 
  },
  { 
    id: 'p2', name: "Librarian", maxHp: 120, currentHp: 120, attack: 15, defense: 20, speed: 8, avatar: "👩‍🏫", element: 'WATER', unlockedMoves: 2,
    moves: [
        { name: "Silent Wave", power: 35, accuracy: 100, type: 'SPECIAL', element: 'WATER', description: "A calming wave." },
        { name: "Book Slam", power: 45, accuracy: 90, type: 'PHYSICAL', element: 'EARTH', description: "Heavy knowledge drop." },
        { name: "Deep Research", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Boosts attack.", effect: 'BUFF_ATK' },
        { name: "Tsunami of Facts", power: 75, accuracy: 95, type: 'SPECIAL', element: 'WATER', description: "Overwhelming information." }
    ] 
  }
];

export const BOSS_DATA: BattleCharacter[] = [
  { 
    id: 'b1', name: "Xerxes the Great", maxHp: 300, currentHp: 300, attack: 15, defense: 10, speed: 10, avatar: "👑", element: 'WATER', unlockedMoves: 4,
    moves: [
        { name: "Persian Arrow", power: 20, accuracy: 95, type: 'PHYSICAL', element: 'NORMAL', description: "A rain of arrows." },
        { name: "Tidal Wave", power: 40, accuracy: 90, type: 'SPECIAL', element: 'WATER', description: "Washes away hope." },
        { name: "Gold Chains", power: 30, accuracy: 100, type: 'PHYSICAL', element: 'EARTH', description: "Heavy binding attack." },
        { name: "King's Order", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Lowers your defense.", effect: 'DEBUFF_DEF' }
    ] 
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'pencil', name: "Lucky Pencil", cost: 50, multiplier: 1.2, description: "Earn 20% more cash per answer.", icon: "✏️" },
  { id: 'coffee', name: "Late Night Coffee", cost: 150, multiplier: 1.5, description: "Boost brain power. 50% bonus.", icon: "☕" }
];

export const DEDUCTION_TARGETS: DeductionTarget[] = [
    { id: 'gw1', name: "George Washington", image: "https://images.unsplash.com/photo-1551543360-1798dfb84232?auto=format&fit=crop&q=80&w=200", category: 'person', clues: ["First President", "Continental Army Commander", "Face on $1 bill"], description: "The Father of his Country." }
];

export const WORLD_HISTORY_COURSE_CONTENT: CourseContent = {
    title: "World History",
    description: "Ancient Civs",
    chapters: [{ id: '1', title: 'Chapter 1', content: ['Text here'] }],
    benchmarks: [
        { code: 'SS.7.C.1.1', description: 'Enlightenment ideas', clarifications: [] },
        { code: 'SS.7.C.3.2', description: 'Forms of government', clarifications: [] }
    ]
};

export const WORLD_HISTORY_MODULES: CourseModule[] = [];
export const CIVICS_COURSE_CONTENT: CourseContent = { title: "Civics", description: "Government", chapters: [], benchmarks: [] };
export const CIVICS_MODULES: CourseModule[] = [];
export const US_HISTORY_COURSE_CONTENT: CourseContent = { title: "US History", description: "American Story", chapters: [], benchmarks: [] };
export const US_HISTORY_MODULES: CourseModule[] = [];
export const ANALYSIS_SCENARIOS: AnalysisScenario[] = [];
export const WHEEL_PHRASES: string[] = ["CONSTITUTION", "LIBERTY", "DEMOCRACY"];
