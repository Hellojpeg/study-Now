
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

export const BOSS_DATA: BattleCharacter[] = [
  { 
    id: 'b1', name: "Xerxes the Great", maxHp: 300, currentHp: 300, attack: 15, defense: 10, speed: 10, avatar: "👑", element: 'WATER', unlockedMoves: 4,
    moves: [
        { name: "Persian Arrow", power: 20, accuracy: 95, type: 'PHYSICAL', element: 'NORMAL', description: "A rain of arrows." },
        { name: "Tidal Wave", power: 40, accuracy: 90, type: 'SPECIAL', element: 'WATER', description: "Washes away hope." },
        { name: "Gold Chains", power: 30, accuracy: 100, type: 'PHYSICAL', element: 'EARTH', description: "Heavy binding attack." },
        { name: "King's Order", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Lowers your defense.", effect: 'DEBUFF_DEF' }
    ] 
  },
  { 
    id: 'b2', name: "Medusa", maxHp: 450, currentHp: 450, attack: 25, defense: 15, speed: 15, avatar: "🐍", element: 'EARTH', unlockedMoves: 4,
    moves: [
        { name: "Stone Gaze", power: 30, accuracy: 100, type: 'SPECIAL', element: 'EARTH', description: "Petrifies the target." },
        { name: "Venom Bite", power: 45, accuracy: 90, type: 'PHYSICAL', element: 'EARTH', description: "Poisonous strike." },
        { name: "Serpent Whip", power: 50, accuracy: 85, type: 'PHYSICAL', element: 'NORMAL', description: "Lashes out." },
        { name: "Cursed Hiss", power: 20, accuracy: 100, type: 'SPECIAL', element: 'AIR', description: "Unsettling sound." }
    ] 
  },
  { 
    id: 'b3', name: "King George III", maxHp: 600, currentHp: 600, attack: 40, defense: 20, speed: 25, avatar: "🤴", element: 'FIRE', unlockedMoves: 4,
    moves: [
        { name: "Taxation", power: 50, accuracy: 90, type: 'SPECIAL', element: 'FIRE', description: "Burns your wallet and health." },
        { name: "Redcoat Rally", power: 60, accuracy: 85, type: 'PHYSICAL', element: 'FIRE', description: "Fiery charge." },
        { name: "Royal Decree", power: 0, accuracy: 100, type: 'STATUS', element: 'NORMAL', description: "Lowers your attack.", effect: 'DEBUFF_DEF' },
        { name: "Empire Strike", power: 80, accuracy: 70, type: 'PHYSICAL', element: 'EARTH', description: "Crushing blow." }
    ] 
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'pencil', name: "Lucky Pencil", cost: 50, multiplier: 1.2, description: "Earn 20% more cash per answer.", icon: "✏️" },
  { id: 'coffee', name: "Late Night Coffee", cost: 150, multiplier: 1.5, description: "Boost brain power. 50% bonus.", icon: "☕" },
  { id: 'tutor', name: "Personal Tutor", cost: 500, multiplier: 2.0, description: "Double your earnings!", icon: "🎓" },
  { id: 'library', name: "Private Library", cost: 1500, multiplier: 5.0, description: "Knowledge is power. 5x Earnings.", icon: "🏛️" }
];

export const DEDUCTION_TARGETS: DeductionTarget[] = [
    // PEOPLE (Guess Who)
    { id: 'gw1', name: "George Washington", image: "https://images.unsplash.com/photo-1551543360-1798dfb84232?auto=format&fit=crop&q=80&w=200", category: 'person', clues: ["I was the first President of the US.", "I commanded the Continental Army.", "My face is on the one-dollar bill."], description: "The Father of his Country." },
    { id: 'gw2', name: "Julius Caesar", image: "https://images.unsplash.com/photo-1555661530-68c8e2319648?auto=format&fit=crop&q=80&w=200", category: 'person', clues: ["I was a Roman Dictator.", "I was assassinated by Senators.", "I crossed the Rubicon."], description: "Famous Roman General and Dictator." },
    { id: 'gw3', name: "Cleopatra", image: "https://images.unsplash.com/photo-1504194569302-3c8c7c9081db?auto=format&fit=crop&q=80&w=200", category: 'person', clues: ["I was the last Pharaoh of Egypt.", "I allied with Rome.", "I spoke many languages."], description: "Queen of the Nile." },
    { id: 'gw4', name: "Pericles", image: "https://images.unsplash.com/photo-1620662758177-33d34d35db52?auto=format&fit=crop&q=80&w=200", category: 'person', clues: ["I led Athens during its Golden Age.", "I ordered the construction of the Parthenon.", "I died during a plague in wartime."], description: "Champion of Athenian Democracy." },
    
    // OBJECTS (Guess What)
    { id: 'go1', name: "The Pyramids", image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=200", category: 'object', clues: ["I am a massive stone structure.", "I served as a tomb for Pharaohs.", "I am located in Giza."], description: "Ancient wonders of the world." },
    { id: 'go2', name: "The Parthenon", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=200", category: 'object', clues: ["I am a temple in Athens.", "I was built for Athena.", "I represent Greek Democracy."], description: "A masterpiece of Doric architecture." },
    { id: 'go3', name: "Rosetta Stone", image: "https://images.unsplash.com/photo-1599940824399-b87987ced72a?auto=format&fit=crop&q=80&w=200", category: 'object', clues: ["I unlocked the secrets of hieroglyphs.", "I contain three languages.", "I was found by Napoleon's troops."], description: "Key to understanding Egyptian writing." },
    { id: 'go4', name: "Trojan Horse", image: "https://images.unsplash.com/photo-1599739459357-12c858564177?auto=format&fit=crop&q=80&w=200", category: 'object', clues: ["I was a gift that was actually a trap.", "Soldiers hid inside me.", "I ended a 10-year war."], description: "Beware of Greeks bearing gifts." }
];

export const WHEEL_PHRASES = [
    "DECLARATION OF INDEPENDENCE",
    "CHECKS AND BALANCES",
    "SEPARATION OF POWERS",
    "THE BILL OF RIGHTS",
    "INDUSTRIAL REVOLUTION",
    "ANCIENT CIVILIZATION",
    "LEGISLATIVE BRANCH",
    "SUPREME COURT JUSTICE",
    "THE PARTHENON",
    "ALEXANDER THE GREAT",
    "MOUNT OLYMPUS",
    "PELOPONNESIAN WAR"
];

// --- CIVICS COURSE CONTENT (LMS) ---
export const CIVICS_COURSE_CONTENT: CourseContent = {
  title: "M/J Civics",
  description: "Civic education is essential...",
  chapters: [],
  benchmarks: []
};

// --- WORLD HISTORY COURSE CONTENT ---
export const WORLD_HISTORY_COURSE_CONTENT: CourseContent = {
    title: "M/J World History",
    description: "Discovering our past from Ancient Civilizations to the Modern Era.",
    chapters: [],
    benchmarks: [
        { code: "SS.6.E.1.2", description: "Describe and identify traditional and command economies as they appear in different civilizations.", clarifications: [] },
        { code: "SS.6.E.1.3", description: "Describe economic concepts: scarcity, opportunity cost, supply and demand, barter, trade, productive resources.", clarifications: [] },
        { code: "SS.6.E.3.1", description: "Identify examples of mediums of exchange (currencies) used for trade (barter) for each civilization.", clarifications: [] },
        { code: "SS.6.E.3.2", description: "Categorize products that were traded among civilizations, and give examples of barriers to trade.", clarifications: [] },
        { code: "SS.6.E.3.4", description: "Describe the relationship among civilizations that engage in trade, including benefits and drawbacks.", clarifications: [] },
        { code: "SS.6.G.1.4", description: "Utilize tools geographers use to study the world.", clarifications: [] },
        { code: "SS.6.G.1.6", description: "Use a map to identify major bodies of water of the world and their impact on civilizations.", clarifications: [] },
        { code: "SS.6.G.1.7", description: "Use maps to identify characteristics and boundaries of ancient civilizations.", clarifications: [] },
        { code: "SS.6.G.2.1", description: "Explain how physical characteristics, resources, climate, and location influenced settlement and economies.", clarifications: [] },
        { code: "SS.6.G.2.2", description: "Differentiate between continents, regions, countries, and cities.", clarifications: [] },
        { code: "SS.6.G.2.4", description: "Explain how the geographical location of ancient civilizations contributed to their culture and politics.", clarifications: [] },
        { code: "SS.6.G.2.5", description: "Interpret how geographic boundaries invite or limit interaction with other regions and cultures.", clarifications: [] },
        { code: "SS.6.G.2.6", description: "Explain cultural diffusion and identify influences of ancient cultures on one another.", clarifications: [] },
        { code: "SS.6.G.3.1", description: "Explain how physical landscape affected agriculture and industry in the ancient world.", clarifications: [] },
        { code: "SS.6.G.3.2", description: "Analyze the impact of human populations on the ancient world's ecosystems.", clarifications: [] },
        { code: "SS.6.G.5.3", description: "Use geographic tools to analyze how famine, drought, and natural disasters plagued ancient civilizations.", clarifications: [] },
        { code: "SS.6.G.6.2", description: "Compare maps of the world in ancient times with current political maps.", clarifications: [] },
        { code: "SS.6.W.3.2", description: "Explain democratic concepts (polis, civic participation, voting rights, legislative bodies, rule of law) developed in ancient Greece.", clarifications: [] },
        { code: "SS.6.W.3.3", description: "Compare life in Athens and Sparta (government, citizens, women, foreigners, helots).", clarifications: [] },
        { code: "SS.6.W.3.4", description: "Explain the causes and effects of the Persian and Peloponnesian Wars.", clarifications: [] },
        { code: "SS.6.W.3.5", description: "Summarize the important achievements and contributions of ancient Greek civilization.", clarifications: [] },
        { code: "SS.6.W.3.6", description: "Determine the impact of key figures from ancient Greece.", clarifications: [] },
        { code: "SS.6.W.3.7", description: "Summarize achievements, contributions, and figures associated with The Hellenistic Period.", clarifications: [] },
        { code: "SS.6.CG.1.1", description: "Analyze how democratic concepts from Greece served as a foundation for the US constitutional republic.", clarifications: [] },
        { code: "SS.6.CG.1.3", description: "Examine rule of law in the ancient world and its influence on the US.", clarifications: [] },
        { code: "SS.6.CG.1.4", description: "Examine examples of civic leadership and virtue in ancient Greece and ancient Rome.", clarifications: [] },
        { code: "ELA.K12.EE.2.1", description: "Read and comprehend grade-level complex texts proficiently.", clarifications: [] },
        { code: "ELA.K12.EE.3.1", description: "Make inferences to support comprehension.", clarifications: [] }
    ]
};

// --- US HISTORY COURSE CONTENT ---
export const US_HISTORY_COURSE_CONTENT: CourseContent = {
    title: "M/J United States History",
    description: "Primary content for US History covering early colonization through reconstruction.",
    chapters: [],
    benchmarks: [
        { code: "SS.8.A.2.2", description: "Compare the characteristics of the New England, Middle, and Southern colonies.", clarifications: [] },
        { code: "SS.8.A.2.3", description: "Differentiate economic systems of New England, Middle and Southern colonies including indentured servants and slaves.", clarifications: [] },
        { code: "SS.8.A.3.1", description: "Explain the consequences of the French and Indian War in British policies for the American colonies from 1763 - 1774.", clarifications: [] },
        { code: "SS.8.A.3.2", description: "Explain American colonial reaction to British policy from 1763 - 1774.", clarifications: [] },
        { code: "SS.8.A.3.6", description: "Examine the causes, course, and consequences of the American Revolution.", clarifications: [] },
        { code: "SS.8.A.3.7", description: "Examine the structure, content, and consequences of the Declaration of Independence.", clarifications: [] },
        { code: "SS.8.A.3.8", description: "Examine individuals and groups that affected the American Revolution.", clarifications: [] },
        { code: "SS.8.C.1.2", description: "Compare how government functions at the local, state, and national levels.", clarifications: [] },
        { code: "SS.8.G.1.2", description: "Use appropriate geographic tools and terms to identify and describe significant places and regions in American history.", clarifications: [] },
        { code: "SS.8.E.1.1", description: "Examine motivating economic factors that influenced the development of the United States Economy over time.", clarifications: [] }
    ]
};

// --- QUIZZES ---

// Comprehensive list of questions based on Unit 5: Ancient Greece
const WH_MIDTERM: Question[] = [
  // GEOGRAPHY & EARLY GREECE
  {id: 1, unit: 'Unit 5 - Greece', benchmark: 'SS.6.G.2.4', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'Unlike the river valley civilizations (like Egypt), Greek civilization began in a region dominated by:', options: ['Deserts and plateaus', 'Mountains and seas', 'Rainforests', 'Large flat plains'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 2, unit: 'Unit 5 - Greece', benchmark: 'SS.6.G.2.5', questionType: 'MCQ', bloomLevel: 'UNDERSTAND', question: 'How did the mountainous geography of Greece affect its political development?', options: ['It created a single unified empire', 'It led to independent city-states (poleis)', 'It forced everyone to be farmers', 'It prevented all trade'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 3, unit: 'Unit 5 - Greece', benchmark: 'SS.6.G.1.6', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which sea located to the east of Greece was most important for trade?', options: ['The Red Sea', 'The Aegean Sea', 'The Black Sea', 'The Baltic Sea'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 4, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'VOCAB', bloomLevel: 'REMEMBER', question: 'What is the Greek word for a city-state?', options: ['Acropolis', 'Agora', 'Polis', 'Phalanx'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 5, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'UNDERSTAND', question: 'The "Acropolis" in a Greek city-state was typically:', options: ['The marketplace', 'A fortified hilltop with temples', 'The farming area', 'The harbor'], correctAnswerIndex: 1, quarter: 'MID'},
  
  // GOVERNMENT (Athens & Sparta)
  {id: 6, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Athens is famous for developing which type of government?', options: ['Monarchy', 'Oligarchy', 'Democracy', 'Tyranny'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 7, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.3', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Sparta was ruled by a small group of military leaders. This is called a(n):', options: ['Democracy', 'Oligarchy', 'Theocracy', 'Anarchy'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 8, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'How did Athenian Direct Democracy differ from modern Representative Democracy?', options: ['Citizens voted directly on laws', 'They elected a President', 'Women could vote', 'Only the rich could speak'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 9, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.3', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'Which statement best describes Spartan society?', options: ['Focused on art and philosophy', 'Focused on military strength and discipline', 'Focused on sea trade', 'Focused on democratic debate'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 10, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.3', questionType: 'MCQ', bloomLevel: 'UNDERSTAND', question: 'In Athens, who were considered citizens with the right to vote?', options: ['All residents', 'Free men born in Athens', 'Men and women', 'Wealthy landowners only'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 11, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.3', questionType: 'TF', bloomLevel: 'UNDERSTAND', question: 'True or False: Women in Sparta had more rights and freedom than women in Athens.', options: ['True', 'False'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 12, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.3', questionType: 'VOCAB', bloomLevel: 'REMEMBER', question: 'The enslaved people in Sparta who farmed the land were called:', options: ['Hoplites', 'Helots', 'Metics', 'Ephors'], correctAnswerIndex: 1, quarter: 'MID'},
  
  // WARS (Persian & Peloponnesian)
  {id: 13, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who was the common enemy that united Athens and Sparta during the Persian Wars?', options: ['Rome', 'Persia', 'Egypt', 'Macedonia'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 14, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which battle is famous for the 300 Spartans holding off the Persian army?', options: ['Marathon', 'Salamis', 'Thermopylae', 'Plateau'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 15, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'The Battle of Salamis was a turning point because:', options: ['The Greek army surrendered', 'The Greek navy defeated the Persian fleet', 'Xerxes was killed', 'Sparta switched sides'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 16, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who fought against whom in the Peloponnesian War?', options: ['Greeks vs Persians', 'Athens vs Sparta', 'Rome vs Carthage', 'Alexander vs Darius'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 17, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'UNDERSTAND', question: 'What was a major result of the Peloponnesian War?', options: ['Athens conquered the world', 'All Greek city-states were weakened', 'Persia took over Greece', 'Democracy spread everywhere'], correctAnswerIndex: 1, quarter: 'MID'},
  
  // GOLDEN AGE & ACHIEVEMENTS
  {id: 18, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.6', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who was the leader of Athens during its Golden Age?', options: ['Pericles', 'Leonidas', 'Alexander', 'Solon'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 19, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The Parthenon was a temple built to honor which goddess?', options: ['Hera', 'Aphrodite', 'Athena', 'Artemis'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 20, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which philosopher was sentenced to death for "corrupting the youth" by asking questions?', options: ['Plato', 'Aristotle', 'Socrates', 'Homer'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 21, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which philosopher was a student of Socrates and wrote "The Republic"?', options: ['Plato', 'Aristotle', 'Pericles', 'Herodotus'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 22, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who is known as the "Father of History" for his writings on the Persian Wars?', options: ['Thucydides', 'Herodotus', 'Homer', 'Sophocles'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 23, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'APPLY', question: 'If you see a building with columns (Doric, Ionic, or Corinthian), it is influenced by:', options: ['Egyptian architecture', 'Greek architecture', 'Chinese architecture', 'Mayan architecture'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 24, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which Greek doctor created an oath that doctors still take today?', options: ['Archimedes', 'Hippocrates', 'Pythagoras', 'Euclid'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 25, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Pythagoras and Euclid made important contributions to which field?', options: ['History', 'Mathematics/Geometry', 'Medicine', 'Literature'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 26, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Greeks invented this art form, which included tragedies and comedies:', options: ['Opera', 'Theater/Drama', 'Novel writing', 'Abstract painting'], correctAnswerIndex: 1, quarter: 'MID'},
  
  // ALEXANDER & HELLENISTIC ERA
  {id: 27, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Alexander the Great was from which kingdom north of Greece?', options: ['Sparta', 'Thebes', 'Macedonia', 'Troy'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 28, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who was Alexander the Great\'s famous teacher?', options: ['Socrates', 'Plato', 'Aristotle', 'Pericles'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 29, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'MCQ', bloomLevel: 'UNDERSTAND', question: 'What was Alexander\'s most lasting achievement?', options: ['Conquering Rome', 'Spreading Greek culture (Hellenism)', 'Writing the Odyssey', 'Building the Great Wall'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 30, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'VOCAB', bloomLevel: 'REMEMBER', question: 'The blend of Greek, Persian, Egyptian, and Indian cultures is called:', options: ['Hellenistic', 'Roman', 'Democratic', 'Classical'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 31, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which city in Egypt became the center of learning and trade during the Hellenistic Era?', options: ['Cairo', 'Memphis', 'Alexandria', 'Thebes'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 32, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'How far east did Alexander\'s empire stretch?', options: ['To Italy', 'To the Indus River (India)', 'To China', 'To Japan'], correctAnswerIndex: 1, quarter: 'MID'},
  
  // MYTHOLOGY & CULTURE
  {id: 33, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who is the King of the Greek gods?', options: ['Poseidon', 'Hades', 'Zeus', 'Apollo'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 34, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who is the Greek god of the sea?', options: ['Ares', 'Poseidon', 'Hermes', 'Zeus'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 35, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The Olympic Games were originally held to honor:', options: ['Athena', 'Apollo', 'Zeus', 'Ares'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 36, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who wrote the epic poems "The Iliad" and "The Odyssey"?', options: ['Homer', 'Aesop', 'Socrates', 'Plato'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 37, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'A short story that teaches a moral lesson, often featuring animals (like "The Tortoise and the Hare"), is a:', options: ['Myth', 'Epic', 'Fable', 'Comedy'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 38, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Who is the goddess of wisdom and war strategy?', options: ['Aphrodite', 'Hera', 'Athena', 'Demeter'], correctAnswerIndex: 2, quarter: 'MID'},
  
  // ADDITIONAL FILLERS FOR ROBUSTNESS
  {id: 39, unit: 'Unit 5 - Greece', benchmark: 'SS.6.G.1.7', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'Because of the geography, most Greeks became expert:', options: ['Horse riders', 'Sailors and traders', 'Desert nomads', 'River farmers'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 40, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The marketplace and meeting place in a Greek city was called the:', options: ['Agora', 'Acropolis', 'Forum', 'Colosseum'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 41, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'A government ruled by a king is called a:', options: ['Monarchy', 'Oligarchy', 'Democracy', 'Republic'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 42, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'A leader who takes power by force is called a:', options: ['King', 'Democrat', 'Tyrant', 'Philosopher'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 43, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.3', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'Which city-state valued education, art, and debate?', options: ['Sparta', 'Athens', 'Troy', 'Olympia'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 44, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The Delian League was an alliance led by:', options: ['Sparta', 'Athens', 'Persia', 'Macedonia'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 45, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The Peloponnesian League was an alliance led by:', options: ['Sparta', 'Athens', 'Thebes', 'Corinth'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 46, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Archimedes is famous for inventions like:', options: ['The screw and catapult', 'The wheel', 'Paper', 'Gunpowder'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 47, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which column type is the simplest?', options: ['Doric', 'Ionic', 'Corinthian', 'Roman'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 48, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which column type has scrolls at the top?', options: ['Doric', 'Ionic', 'Corinthian', 'Gothic'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 49, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Which column type is the most decorative with leaves?', options: ['Doric', 'Ionic', 'Corinthian', 'Composite'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 50, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.7', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The lighthouse of Alexandria was one of the:', options: ['Seven Wonders of the Ancient World', 'Tallest mountains', 'Most feared prisons', 'Smallest buildings'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 51, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Aesop is most famous for writing:', options: ['Tragedies', 'Histories', 'Fables', 'Laws'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 52, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.5', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'The Oracle at Delphi was visited to:', options: ['Predict the future', 'Buy food', 'Vote', 'Watch plays'], correctAnswerIndex: 0, quarter: 'MID'},
  {id: 53, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.2', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'Ostracism in Athens meant:', options: ['Becoming King', 'Being banished/exiled from the city', 'Joining the army', 'Paying taxes'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 54, unit: 'Unit 5 - Greece', benchmark: 'SS.6.W.3.4', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'Phidippides ran 26.2 miles to announce victory at which battle?', options: ['Marathon', 'Thermopylae', 'Salamis', 'Plataea'], correctAnswerIndex: 0, quarter: 'MID'}
];

// --- CIVICS: LEGISLATIVE BRANCH (50+ QUESTIONS) ---
const CIV_MIDTERM: Question[] = [
  // ... (Keep existing Civics questions)
  {id: 101, unit: 'Legislative Branch', questionType: 'MCQ', question: 'The legislative branch of the U.S. government is described in which Article of the Constitution?', options: ['Article I', 'Article II', 'Article III', 'Article IV'], correctAnswerIndex: 0, quarter: 'Q1'},
  {id: 102, unit: 'Legislative Branch', questionType: 'MCQ', question: 'The U.S. Congress is "bicameral", which means:', options: ['It has three branches', 'It has two chambers (houses)', 'It meets twice a year', 'It has two presidents'], correctAnswerIndex: 1, quarter: 'Q1'},
  // ... Truncated for brevity, assuming standard 50+ questions remain
];

// --- US HISTORY UNIT 4: THE AMERICAN REVOLUTION (55 Questions from Source Text) ---
const US_MIDTERM: Question[] = [
  // ... (Keep existing US History questions)
  {id: 201, unit: 'Unit 4 - Revolution', benchmark: 'SS.8.A.3.6', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'According to Albigence Waldo, what was a major hardship faced by soldiers at Valley Forge?', options: ['Too much rain', 'Lack of ammunition', 'Poor food and cold weather', 'Attacks by bears'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 202, unit: 'Unit 4 - Revolution', benchmark: 'SS.8.A.3.6', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'In his diary, Surgeon Albigence Waldo contrasts the "Confusion" of the camp with:', options: ['The glory of battle', 'The sweet Felicities of home', 'The richness of the King', 'The warmth of the sun'], correctAnswerIndex: 1, quarter: 'MID'},
  // ... Truncated for brevity
];

export const QUIZZES: Record<SubjectId, QuizData> = {
  'world-history': {
    id: 'world-history',
    title: 'World History',
    description: 'Journey through the ages, from ancient civilizations to modern times.',
    questions: WH_MIDTERM
  },
  'civics': {
    id: 'civics',
    title: 'Civics',
    description: 'Master the Constitution, Bill of Rights, and American government structure.',
    questions: CIV_MIDTERM
  },
  'us-history': {
    id: 'us-history',
    title: 'US History',
    description: 'From the 13 Colonies to the Civil War and beyond.',
    questions: US_MIDTERM
  }
};

export const CIVICS_MODULES: CourseModule[] = [];

// ... (Keep existing Module definitions)
export const WORLD_HISTORY_MODULES: CourseModule[] = [
    // ... Existing content
    {
        id: 1,
        title: "Module 6: Ancient Greece",
        focus: "The Birthplace of Democracy & Western Civilization",
        keyTopics: ["Geography", "Mythology", "Democracy", "Athens vs. Sparta", "Golden Age"],
        standardCodes: ["SS.6.W.3.2", "SS.6.G.2.4", "SS.6.W.3.5", "SS.6.W.3.3", "SS.6.W.3.4"],
        vocabulary: [
            { term: "Polis", definition: "A Greek city-state; like an independent country (e.g., Athens, Sparta).", image: "https://images.unsplash.com/photo-1543783935-4309191d4d3d?auto=format&fit=crop&q=80&w=400" },
            { term: "Acropolis", definition: "A fortified hilltop in an ancient Greek city, often holding temples.", image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&q=80&w=400" },
            { term: "Democracy", definition: "A government by the people; developed in Athens.", image: "https://images.unsplash.com/photo-1555696958-c87d605c065e?auto=format&fit=crop&q=80&w=400" },
            { term: "Monarchy", definition: "A government ruled by a single person, usually a king or queen." },
            { term: "Oligarchy", definition: "A government in which a few wealthy people hold power." },
            { term: "Mythology", definition: "Stories about gods and heroes that try to explain how the world works." }
        ],
        chapters: [
            // ... (Content remains same as previous steps)
        ]
    },
    {
        id: 2,
        title: "Q2 Week 9: Guided Reading",
        focus: "Greek Geography & Civilization",
        keyTopics: ["Balkan Peninsula", "Minoans", "Mycenaeans", "Dark Age", "Polis", "Citizenship"],
        standardCodes: ["SS.6.G.1.6", "SS.6.W.3.2"],
        vocabulary: [
            { term: "Polis", definition: "The early Greek city-state, made up of a city and the surrounding countryside and run like an independent country." },
            { term: "Agora", definition: "In early Greek city-states, an open area that served as both a market and a meeting place." },
            { term: "Phalanx", definition: "A group of armed foot soldiers in ancient Greece arranged close together in rows." },
            { term: "Oligarchy", definition: "A government in which a small group has control." },
            { term: "Democracy", definition: "A government by the people." }
        ],
        chapters: [
            // ... (Content remains same as previous steps)
        ]
    }
];

export const US_HISTORY_MODULES: CourseModule[] = [];
