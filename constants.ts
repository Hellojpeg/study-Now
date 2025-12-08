import { Question, QuizData } from './types';

const WORLD_HISTORY_QUESTIONS: Question[] = [
  // UNIT 1
  {
    id: 1,
    unit: "UNIT 1 – Prehistory",
    question: "The Stone Age is named because early humans",
    options: [
      "lived in stone houses",
      "made their first tools from stone",
      "carved religious symbols in stone",
      "lived in rocky environments"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 2,
    unit: "UNIT 1 – Prehistory",
    question: "A major benefit of the Agricultural Revolution was",
    options: [
      "constant movement",
      "fewer people",
      "food surpluses that allowed populations to grow",
      "an end to hunting"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 3,
    unit: "UNIT 1 – Prehistory",
    question: "Paleolithic people survived mainly by",
    options: [
      "farming crops",
      "trading food",
      "hunting and gathering",
      "herding animals"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 4,
    unit: "UNIT 1 – Prehistory",
    question: "The correct chronological order of early human time periods is",
    options: [
      "Bronze Age, Neolithic Age, Paleolithic Age",
      "Paleolithic Age, Neolithic Age, Bronze Age",
      "Neolithic Age, Paleolithic Age, Bronze Age",
      "Bronze Age, Paleolithic Age, Neolithic Age"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 5,
    unit: "UNIT 1 – Prehistory",
    question: "The Neolithic Age began when humans first",
    options: [
      "used fire",
      "developed art",
      "began farming",
      "created tools"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 6,
    unit: "UNIT 1 – Prehistory",
    question: "Ancient cave paintings suggest early humans",
    options: [
      "had formal schools",
      "developed writing",
      "wanted to express ideas",
      "lived in cities"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 7,
    unit: "UNIT 1 – Prehistory",
    question: "Compared to Paleolithic tools, Neolithic tools were",
    options: [
      "simpler",
      "only for hunting",
      "more specialized",
      "rarely used"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 8,
    unit: "UNIT 1 – Prehistory",
    question: "Bronze was an important technological breakthrough because it",
    options: [
      "was inexpensive",
      "required no special skills",
      "created stronger tools and weapons",
      "replaced farming"
    ],
    correctAnswerIndex: 2 // C
  },

  // UNIT 2
  {
    id: 9,
    unit: "UNIT 2 – Mesopotamia",
    question: "Early Mesopotamians were",
    options: [
      "monotheistic",
      "atheistic",
      "polytheistic",
      "agnostic"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 10,
    unit: "UNIT 2 – Mesopotamia",
    question: "King Hammurabi is best known for",
    options: [
      "building pyramids",
      "promoting trade",
      "creating a strict law code",
      "inventing writing"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 11,
    unit: "UNIT 2 – Mesopotamia",
    question: "Flooding benefited Mesopotamian farmers because it",
    options: [
      "created trade routes",
      "deposited fertile silt",
      "increased rainfall",
      "raised river levels permanently"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 12,
    unit: "UNIT 2 – Mesopotamia",
    question: "Most Mesopotamian empires formed through",
    options: [
      "elections",
      "peaceful agreements",
      "conquest",
      "migration"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 13,
    unit: "UNIT 2 – Mesopotamia",
    question: "Which civilization invented the first system of writing?",
    options: [
      "Babylonians",
      "Assyrians",
      "Sumerians",
      "Phoenicians"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 14,
    unit: "UNIT 2 – Mesopotamia",
    question: "Food surpluses in Mesopotamia allowed people to",
    options: [
      "move constantly",
      "develop specialized jobs",
      "abandon religion",
      "reject trade"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 15,
    unit: "UNIT 2 – Mesopotamia",
    question: "Which Sumerian achievement is still used today?",
    options: [
      "cuneiform writing",
      "ziggurats",
      "the wheel",
      "city-states"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 16,
    unit: "UNIT 2 – Mesopotamia",
    question: "Assyrian kings maintained control mainly by",
    options: [
      "generosity",
      "diplomacy",
      "fear and military force",
      "shared leadership"
    ],
    correctAnswerIndex: 2 // C
  },

  // UNIT 3
  {
    id: 17,
    unit: "UNIT 3 – Egypt & Kush",
    question: "The Egyptian Book of the Dead was used to",
    options: [
      "list laws",
      "guide the afterlife",
      "record history",
      "track trade"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 18,
    unit: "UNIT 3 – Egypt & Kush",
    question: "The Great Pyramid of Giza served as",
    options: [
      "a temple",
      "a palace",
      "a tomb",
      "a school"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 19,
    unit: "UNIT 3 – Egypt & Kush",
    question: "Egyptian hieroglyphics were",
    options: [
      "religious ceremonies",
      "an irrigation system",
      "a system of writing",
      "decorations only"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 20,
    unit: "UNIT 3 – Egypt & Kush",
    question: "Egyptians obeyed the pharaoh because they believed he",
    options: [
      "was elected",
      "was the strongest warrior",
      "was chosen by priests",
      "was the son of a god"
    ],
    correctAnswerIndex: 3 // D
  },
  {
    id: 21,
    unit: "UNIT 3 – Egypt & Kush",
    question: "Kush became wealthy primarily through",
    options: [
      "farming",
      "gold mining",
      "iron production",
      "fishing"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 22,
    unit: "UNIT 3 – Egypt & Kush",
    question: "Women in ancient Egypt were able to",
    options: [
      "vote in elections",
      "own property",
      "lead armies",
      "rule empires"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 23,
    unit: "UNIT 3 – Egypt & Kush",
    question: "The construction of pyramids led Egypt to advance in",
    options: [
      "writing",
      "mathematics and calendars",
      "sailing",
      "warfare"
    ],
    correctAnswerIndex: 1 // B
  },

  // UNIT 4
  {
    id: 24,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "The Jewish holiday of Passover celebrates",
    options: [
      "the giving of the Ten Commandments",
      "the Exodus from Egypt",
      "King David’s coronation",
      "Roman rule"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 25,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "The Jewish Sabbath is a",
    options: [
      "yearly celebration",
      "book of laws",
      "weekly day of rest",
      "pilgrimage"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 26,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "The ancestors of the Israelites were",
    options: [
      "Moses and Aaron",
      "Saul and David",
      "Abraham and his family",
      "Jewish rabbis"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 27,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "Which empire destroyed Jerusalem and forced Jews into exile?",
    options: [
      "Egyptian",
      "Persian",
      "Greek",
      "Neo-Babylonian"
    ],
    correctAnswerIndex: 3 // D
  },
  {
    id: 28,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "Judaism shares belief in one God with",
    options: [
      "Buddhism",
      "Hinduism",
      "Christianity",
      "Shinto"
    ],
    correctAnswerIndex: 2 // C
  },
  {
    id: 29,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "The Diaspora refers to",
    options: [
      "Jewish rule of empires",
      "Jewish migration and settlement outside Israel",
      "the building of the First Temple",
      "Roman persecution only"
    ],
    correctAnswerIndex: 1 // B
  },
  {
    id: 30,
    unit: "UNIT 4 – Judaism & the Israelites",
    question: "Rabbis were important in ancient Judaism because they",
    options: [
      "ruled governments",
      "collected taxes",
      "taught and explained the Torah",
      "commanded armies"
    ],
    correctAnswerIndex: 2 // C
  },
];

export const QUIZZES: Record<string, QuizData> = {
  'world-history': {
    id: 'world-history',
    title: 'World History',
    description: 'Master the Stone Age, Mesopotamia, Egypt, and Ancient Judaism. Cycle through 30 essential questions to ace your exam.',
    questions: WORLD_HISTORY_QUESTIONS
  },
  'civics': {
    id: 'civics',
    title: 'Civics',
    description: 'Prepare for your Civics Midterm. Master the foundations of government, rights, and responsibilities.',
    questions: []
  },
  'us-history': {
    id: 'us-history',
    title: 'US History',
    description: 'Prepare for your US History Midterm. From the Colonies to the Constitution and beyond.',
    questions: []
  }
};