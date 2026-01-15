
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
    { id: 'gw4', name: "Pericles", image: "https://images.unsplash.com/photo-1620662758177-33d34db5db52?auto=format&fit=crop&q=80&w=200", category: 'person', clues: ["I led Athens during its Golden Age.", "I ordered the construction of the Parthenon.", "I died during a plague in wartime."], description: "Champion of Athenian Democracy." },
    
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

// --- GREECE, ATHENS AND SPARTA BANK (Merged into World History) ---
const GREECE_QUESTIONS: Question[] = [
  { id: 301, unit: 'Greece, Athens and Sparta', question: 'Why did ancient Greece develop independent city-states instead of one unified empire?', options: ['Lack of trade routes', 'Mountainous terrain separated communities', 'Constant civil wars', 'Influence from Rome'], correctAnswerIndex: 1 },
  { id: 302, unit: 'Greece, Athens and Sparta', question: 'How did the Aegean Sea most influence Greek civilization?', options: ['Prevented foreign invasion', 'Encouraged isolation', 'Served as a highway for trade and travel', 'Flooded farmland'], correctAnswerIndex: 2 },
  { id: 303, unit: 'Greece, Athens and Sparta', question: 'Which crops were most commonly grown in ancient Greece?', options: ['Rice, corn, cotton', 'Olives, grapes, wheat, barley', 'Potatoes, beans, squash', 'Sugar, tea, spices'], correctAnswerIndex: 1 },
  { id: 304, unit: 'Greece, Athens and Sparta', question: 'The Minoans were best known as:', options: ['Mainland warriors', 'Nomadic herders', 'Island traders and sailors', 'Desert farmers'], correctAnswerIndex: 2 },
  { id: 305, unit: 'Greece, Athens and Sparta', question: 'The Mycenaeans were best known as:', options: ['Philosophers and teachers', 'Fortress builders and warriors', 'Peaceful merchants', 'Democratic reformers'], correctAnswerIndex: 1 },
  { id: 306, unit: 'Greece, Athens and Sparta', question: 'What event helped trigger the Greek Dark Age?', options: ['Trojan War', 'Dorian invasions', 'Persian conquest', 'Roman expansion'], correctAnswerIndex: 1 },
  { id: 307, unit: 'Greece, Athens and Sparta', question: 'What major innovation helped end the Dark Age?', options: ['Democracy', 'Coinage', 'The Greek alphabet', 'Standing armies'], correctAnswerIndex: 2 },
  { id: 308, unit: 'Greece, Athens and Sparta', question: 'Why did Greek city-states establish colonies?', options: ['Spread religion', 'Escape Persian rule', 'Overpopulation and lack of farmland', 'Avoid military service'], correctAnswerIndex: 2 },
  { id: 309, unit: 'Greece, Athens and Sparta', question: 'What economic change improved Greek trade?', options: ['Barter replacement with metal coins', 'Creation of banks', 'Use of paper money', 'Tax farming'], correctAnswerIndex: 0 },
  { id: 310, unit: 'Greece, Athens and Sparta', question: 'What was the Acropolis primarily used for?', options: ['Marketplace', 'Housing citizens', 'Fortification and religious center', 'Farmland'], correctAnswerIndex: 2 },
  { id: 311, unit: 'Greece, Athens and Sparta', question: 'What was the Agora?', options: ['Military training camp', 'Burial ground', 'Marketplace and political center', 'Palace complex'], correctAnswerIndex: 2 },
  { id: 312, unit: 'Greece, Athens and Sparta', question: 'Who qualified as a citizen in most Greek poleis?', options: ['All residents', 'Free land-owning men born in the city-state', 'Anyone who served in the army', 'All taxpayers'], correctAnswerIndex: 1 },
  { id: 313, unit: 'Greece, Athens and Sparta', question: 'Greek hoplites were:', options: ['Professional mercenaries', 'Sailors', 'Citizen-soldiers who fought in formations', 'Archers'], correctAnswerIndex: 2 },
  { id: 314, unit: 'Greece, Athens and Sparta', question: 'Athens practiced which form of government?', options: ['Monarchy', 'Oligarchy', 'Direct democracy', 'Dictatorship'], correctAnswerIndex: 2 },
  { id: 315, unit: 'Greece, Athens and Sparta', question: 'Sparta was ruled primarily by:', options: ['An elected president', 'Council of elders and kings', 'Large popular assemblies', 'Religious leaders'], correctAnswerIndex: 1 },
  { id: 316, unit: 'Greece, Athens and Sparta', question: 'Education in Athens focused on:', options: ['Military survival', 'Farming skills', 'Producing well-rounded citizens', 'Obedience and endurance'], correctAnswerIndex: 2 },
  { id: 317, unit: 'Greece, Athens and Sparta', question: 'Spartan education emphasized:', options: ['Literature and art', 'Public speaking', 'Military training and discipline', 'Trade skills'], correctAnswerIndex: 2 },
  { id: 318, unit: 'Greece, Athens and Sparta', question: 'Women in Athens were generally:', options: ['Political leaders', 'Soldiers', 'Restricted to domestic roles', 'Land-owning citizens'], correctAnswerIndex: 2 },
  { id: 319, unit: 'Greece, Athens and Sparta', question: 'Spartan women were unique because they:', options: ['Had no legal rights', 'Could own land and manage estates', 'Were excluded from physical training', 'Were priests only'], correctAnswerIndex: 1 },
  { id: 320, unit: 'Greece, Athens and Sparta', question: 'Sparta’s economy relied heavily on:', options: ['Overseas trade', 'Craft production', 'Helot labor and farming', 'Banking systems'], correctAnswerIndex: 2 }
];

// Comprehensive list of questions for World History Midterm (Prehistory, Mesopotamia, Egypt, Judaism)
const WH_MIDTERM: Question[] = [
  // UNIT 1 – Prehistory (Stone Age & Neolithic)
  {id: 1, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'The Stone Age is named because early humans', options: ['lived in stone houses', 'made their first tools from stone', 'carved religious symbols in stone', 'lived in rocky environments'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 2, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'A major benefit of the Agricultural Revolution was', options: ['constant movement', 'fewer people', 'food surpluses that allowed populations to grow', 'an end to hunting'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 3, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'Paleolithic people survived mainly by', options: ['farming crops', 'trading food', 'hunting and gathering', 'herding animals'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 4, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'The correct chronological order of early human time periods is', options: ['Bronze Age, Neolithic Age, Paleolithic Age', 'Paleolithic Age, Neolithic Age, Bronze Age', 'Neolithic Age, Paleolithic Age, Bronze Age', 'Bronze Age, Paleolithic Age, Neolithic Age'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 5, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'The Neolithic Age began when humans first', options: ['used fire', 'developed art', 'began farming', 'created tools'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 6, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'Ancient cave paintings suggest early humans', options: ['had formal schools', 'developed writing', 'wanted to express ideas', 'lived in cities'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 7, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'Compared to Paleolithic tools, Neolithic tools were', options: ['simpler', 'only for hunting', 'more specialized', 'rarely used'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 8, unit: 'Unit 1 – Prehistory', questionType: 'MCQ', question: 'Bronze was an important technological breakthrough because it', options: ['was inexpensive', 'required no special skills', 'created stronger tools and weapons', 'replaced farming'], correctAnswerIndex: 2, quarter: 'MID'},
  
  // UNIT 2 – Mesopotamia
  {id: 9, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Early Mesopotamians were', options: ['monotheistic', 'atheistic', 'polytheistic', 'agnostic'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 10, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'King Hammurabi is best known for', options: ['building pyramids', 'promoting trade', 'creating a strict law code', 'inventing writing'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 11, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Flooding benefited Mesopotamian farmers because it', options: ['created trade routes', 'deposited fertile silt', 'increased rainfall', 'raised river levels permanently'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 12, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Most Mesopotamian empires formed through', options: ['elections', 'peaceful agreements', 'conquest', 'migration'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 13, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Which civilization invented the first system of writing?', options: ['Babylonians', 'Assyrians', 'Sumerians', 'Phoenicians'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 14, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Food surpluses in Mesopotamia allowed people to', options: ['move constantly', 'develop specialized jobs', 'abandon religion', 'reject trade'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 15, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Which Sumerian achievement is still used today?', options: ['cuneiform writing', 'ziggurats', 'the wheel', 'city-states'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 16, unit: 'Unit 2 – Mesopotamia', questionType: 'MCQ', question: 'Assyrian kings maintained control mainly by', options: ['generosity', 'diplomacy', 'fear and military force', 'shared leadership'], correctAnswerIndex: 2, quarter: 'MID'},
  
  // UNIT 3 – Egypt & Kush
  {id: 17, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'The Egyptian Book of the Dead was used to', options: ['list laws', 'guide the afterlife', 'record history', 'track trade'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 18, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'The Great Pyramid of Giza served as', options: ['a temple', 'a palace', 'a tomb', 'a school'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 19, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'Egyptian hieroglyphics were', options: ['religious ceremonies', 'an irrigation system', 'a system of writing', 'decorations only'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 20, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'Egyptians obeyed the pharaoh because they believed he', options: ['was elected', 'was the strongest warrior', 'was chosen by priests', 'was the son of a god'], correctAnswerIndex: 3, quarter: 'MID'},
  {id: 21, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'Kush became wealthy primarily through', options: ['farming', 'gold mining', 'iron production', 'fishing'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 22, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'Women in ancient Egypt were able to', options: ['vote in elections', 'own property', 'lead armies', 'rule empires'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 23, unit: 'Unit 3 – Egypt & Kush', questionType: 'MCQ', question: 'The construction of pyramids led Egypt to advance in', options: ['writing', 'mathematics and calendars', 'sailing', 'warfare'], correctAnswerIndex: 1, quarter: 'MID'},
  
  // UNIT 4 – Judaism & the Israelites
  {id: 24, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'The Jewish holiday of Passover celebrates', options: ['the giving of the Ten Commandments', 'the Exodus from Egypt', 'King David’s coronation', 'Roman rule'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 25, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'The Jewish Sabbath is a', options: ['yearly celebration', 'book of laws', 'weekly day of rest', 'pilgrimage'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 26, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'The ancestors of the Israelites were', options: ['Moses and Aaron', 'Saul and David', 'Abraham and his family', 'Jewish rabbis'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 27, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'Which empire destroyed Jerusalem and forced Jews into exile?', options: ['Egyptian', 'Persian', 'Greek', 'Neo-Babylonian'], correctAnswerIndex: 3, quarter: 'MID'},
  {id: 28, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'Judaism shares belief in one God with', options: ['Buddhism', 'Hinduism', 'Christianity', 'Shinto'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 29, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'The Diaspora refers to', options: ['Jewish rule of empires', 'Jewish migration and settlement outside Israel', 'the building of the First Temple', 'Roman persecution only'], correctAnswerIndex: 1, quarter: 'MID'},
  {id: 30, unit: 'Unit 4 – Judaism', questionType: 'MCQ', question: 'Rabbis were important in ancient Judaism because they', options: ['ruled governments', 'collected taxes', 'taught and explained the Torah', 'commanded armies'], correctAnswerIndex: 2, quarter: 'MID'},

  // NEW UNIT – Greece, Athens and Sparta
  ...GREECE_QUESTIONS
];

// --- CIVICS: LEGISLATIVE BRANCH (50+ QUESTIONS) ---
const CIV_MIDTERM: Question[] = [
  {id: 101, unit: 'Legislative Branch', questionType: 'MCQ', question: 'The legislative branch of the U.S. government is described in which Article of the Constitution?', options: ['Article I', 'Article II', 'Article III', 'Article IV'], correctAnswerIndex: 0, quarter: 'Q1'},
  {id: 102, unit: 'Legislative Branch', questionType: 'MCQ', question: 'The U.S. Congress is "bicameral", which means:', options: ['It has three branches', 'It has two chambers (houses)', 'It meets twice a year', 'It has two presidents'], correctAnswerIndex: 1, quarter: 'Q1'},
];

// --- US HISTORY UNIT 4: THE AMERICAN REVOLUTION (55 Questions from Source Text) ---
const US_MIDTERM: Question[] = [
  {id: 201, unit: 'Unit 4 - Revolution', benchmark: 'SS.8.A.3.6', questionType: 'MCQ', bloomLevel: 'REMEMBER', question: 'According to Albigence Waldo, what was a major hardship faced by soldiers at Valley Forge?', options: ['Too much rain', 'Lack of ammunition', 'Poor food and cold weather', 'Attacks by bears'], correctAnswerIndex: 2, quarter: 'MID'},
  {id: 202, unit: 'Unit 4 - Revolution', benchmark: 'SS.8.A.3.6', questionType: 'MCQ', bloomLevel: 'ANALYZE', question: 'In his diary, Surgeon Albigence Waldo contrasts the "Confusion" of the camp with:', options: ['The glory of battle', 'The sweet Felicities of home', 'The richness of the King', 'The warmth of the sun'], correctAnswerIndex: 1, quarter: 'MID'},
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
export const WORLD_HISTORY_MODULES: CourseModule[] = [
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
        chapters: []
    }
];

export const US_HISTORY_MODULES: CourseModule[] = [];
