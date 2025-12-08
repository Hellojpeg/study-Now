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
    correctAnswerIndex: 1, // B
    hint: "Think about the material they used to create axes and arrowheads."
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
    correctAnswerIndex: 2, // C
    hint: "Farming allowed people to stay in one place and produce more food than they needed immediately."
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
    correctAnswerIndex: 2, // C
    hint: "Before farming, humans had to find wild plants and animals to eat."
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
    correctAnswerIndex: 1, // B
    hint: "It starts with the Old Stone Age, then New Stone Age, then metals."
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
    correctAnswerIndex: 2, // C
    hint: "This age is defined by the shift from gathering to agriculture."
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
    correctAnswerIndex: 2, // C
    hint: "Art is a form of communication and expression."
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
    correctAnswerIndex: 2, // C
    hint: "As tasks like farming became common, tools needed to be more specific."
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
    correctAnswerIndex: 2, // C
    hint: "Metal is more durable than stone for fighting and working."
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
    correctAnswerIndex: 2, // C
    hint: "They believed in many gods controlling nature."
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
    correctAnswerIndex: 2, // C
    hint: "Eye for an eye."
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
    correctAnswerIndex: 1, // B
    hint: "The river water left behind rich soil good for crops."
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
    correctAnswerIndex: 2, // C
    hint: "Empires usually grow by taking over neighbors via war."
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
    correctAnswerIndex: 2, // C
    hint: "The earliest civilization in Mesopotamia, known for Cuneiform."
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
    correctAnswerIndex: 1, // B
    hint: "If not everyone needs to farm, some can become potters, scribes, or builders."
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
    correctAnswerIndex: 2, // C
    hint: "It helps with transportation and machinery."
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
    correctAnswerIndex: 2, // C
    hint: "They were known as the cruelest warriors of the ancient world."
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
    correctAnswerIndex: 1, // B
    hint: "It contained spells to help the soul navigate the underworld."
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
    correctAnswerIndex: 2, // C
    hint: "It was the final resting place for Khufu."
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
    correctAnswerIndex: 2, // C
    hint: "It involves pictures that represent sounds or ideas."
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
    correctAnswerIndex: 3, // D
    hint: "The Pharaoh was considered a god on earth (Horus)."
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
    correctAnswerIndex: 2, // C
    hint: "They were famous for their iron weapons and tools."
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
    correctAnswerIndex: 1, // B
    hint: "They had more rights than women in many other ancient civilizations, including business rights."
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
    correctAnswerIndex: 1, // B
    hint: "Building massive structures requires precise geometry and measuring."
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
    correctAnswerIndex: 1, // B
    hint: "It marks the time when the Israelites were freed from slavery."
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
    correctAnswerIndex: 2, // C
    hint: "It happens every week, usually from Friday evening to Saturday evening."
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
    correctAnswerIndex: 2, // C
    hint: "The covenant was first made with this patriarch."
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
    correctAnswerIndex: 3, // D
    hint: "This happened under King Nebuchadnezzar."
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
    correctAnswerIndex: 2, // C
    hint: "Both religions are monotheistic and share the Old Testament texts."
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
    correctAnswerIndex: 1, // B
    hint: "The word means 'scattering' or 'dispersion'."
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
    correctAnswerIndex: 2, // C
    hint: "They are teachers and religious leaders, not kings."
  },
];

const US_HISTORY_QUESTIONS: Question[] = [
  // Native Peoples & Early Americas
  {
    id: 1,
    unit: "Native Peoples & Early Americas",
    question: "Most scientists believe migration from Asia to the Americas occurred more than",
    options: ["40,000 years ago", "32,000 years ago", "20,000 years ago", "13,000 years ago"],
    correctAnswerIndex: 3,
    hint: "The Clovis people were thought to appear around this time."
  },
  {
    id: 2,
    unit: "Native Peoples & Early Americas",
    question: "The Beringia theory explains how",
    options: ["farming developed in the Americas", "mammoths became extinct", "early people arrived in the Americas", "Europeans discovered North America"],
    correctAnswerIndex: 2,
    hint: "It involves a land bridge connecting Asia and North America."
  },
  {
    id: 3,
    unit: "Native Peoples & Early Americas",
    question: "If the Beringia theory is correct, which region was likely populated first?",
    options: ["Great Plains", "Pacific Coast of North America", "Amazon Basin", "Pacific Coast of South America"],
    correctAnswerIndex: 1,
    hint: "People would have crossed into Alaska and moved south along the coast."
  },
  {
    id: 4,
    unit: "Native Peoples & Early Americas",
    question: "The oldest known civilization of Mesoamerica was the",
    options: ["Maya", "Aztec", "Inca", "Olmec"],
    correctAnswerIndex: 3,
    hint: "They are often called the 'Mother Culture' of Mesoamerica."
  },
  {
    id: 5,
    unit: "Native Peoples & Early Americas",
    question: "Which statement correctly compares the Inca and Aztec environments?",
    options: ["Inca lived in forests; Aztec lived in deserts", "Inca lived in mountains; Aztec lived on an island in a lake", "Inca lived on the coast; Aztec lived on a plateau", "Both lived in tropical rainforests"],
    correctAnswerIndex: 1,
    hint: "The Inca built Macchu Picchu in the Andes; the Aztec built Tenochtitlan on Lake Texcoco."
  },
  {
    id: 6,
    unit: "Native Peoples & Early Americas",
    question: "One key difference between the Adena and Hopewell cultures was that",
    options: ["Adena traded widely; Hopewell hunted only", "Adena were hunters and gatherers; Hopewell were farmers and traders", "Adena lived in Mexico; Hopewell lived in Ohio", "Adena built stone cities"],
    correctAnswerIndex: 1,
    hint: "The Hopewell culture was more advanced in agriculture and trade networks."
  },
  {
    id: 7,
    unit: "Native Peoples & Early Americas",
    question: "Inuit peoples adapted to the Arctic environment by",
    options: ["farming maize", "domesticating livestock", "building cliff dwellings", "using boats to hunt sea mammals"],
    correctAnswerIndex: 3,
    hint: "Farming is impossible in the frozen Arctic."
  },
  {
    id: 8,
    unit: "Native Peoples & Early Americas",
    question: "The “Three Sisters” refers to",
    options: ["clan leaders", "hunting animals", "major crops grown together", "spiritual gods"],
    correctAnswerIndex: 2,
    hint: "Corn, beans, and squash."
  },
  {
    id: 9,
    unit: "Native Peoples & Early Americas",
    question: "The Comanche most likely lived in",
    options: ["the Arctic", "the Southeast", "the Great Plains", "the Pacific Coast"],
    correctAnswerIndex: 2,
    hint: "They were expert horse riders who hunted buffalo."
  },
  // Pre-Columbian & Native Cultures
  {
    id: 10,
    unit: "Pre-Columbian & Native Cultures",
    question: "Early inhabitants of the Americas primarily survived by",
    options: ["farming", "domesticating livestock", "hunting and gathering", "trade"],
    correctAnswerIndex: 2,
    hint: "Before complex civilizations, most people followed food sources."
  },
  {
    id: 11,
    unit: "Pre-Columbian & Native Cultures",
    question: "When game became scarce, many Native Americans",
    options: ["moved to Europe", "relied on fishing and farming", "abandoned religion", "stopped migrating"],
    correctAnswerIndex: 1,
    hint: "If you can't hunt, you must find other ways to get food like planting crops."
  },
  {
    id: 12,
    unit: "Pre-Columbian & Native Cultures",
    question: "The Olmec were known for",
    options: ["living in the Andes", "carving giant stone heads", "developing writing", "nomadic lifestyles"],
    correctAnswerIndex: 1,
    hint: "They left behind colossal heads made of basalt."
  },
  {
    id: 13,
    unit: "Pre-Columbian & Native Cultures",
    question: "Mesa Verde and Pueblo Bonito were built similarly because",
    options: ["they were burial sites", "Spanish explorers influenced them", "people lived in similar environments", "they were royal palaces"],
    correctAnswerIndex: 2,
    hint: "The dry, desert environment influenced their adobe and cliff architecture."
  },
  {
    id: 14,
    unit: "Pre-Columbian & Native Cultures",
    question: "The Hohokam are best known for",
    options: ["ice houses", "canal irrigation systems", "stone temples", "ocean fishing"],
    correctAnswerIndex: 1,
    hint: "They lived in the desert and needed water for crops."
  },
  {
    id: 15,
    unit: "Pre-Columbian & Native Cultures",
    question: "The Iroquois League was important because it",
    options: ["united colonies", "encouraged farming", "used unanimous decision-making", "spread Christianity"],
    correctAnswerIndex: 2,
    hint: "Five (later six) tribes came together to promote peace."
  },
  // Europe, Exploration & Colonization
  {
    id: 16,
    unit: "Europe, Exploration & Colonization",
    question: "The main result of the Crusades was",
    options: ["peace between Christians and Muslims", "decline of trade", "increased trade with Asia", "Islamic control of Europe"],
    correctAnswerIndex: 2,
    hint: "Europeans were introduced to new goods like spices and silk from the East."
  },
  {
    id: 17,
    unit: "Europe, Exploration & Colonization",
    question: "The Renaissance encouraged exploration by",
    options: ["ending conflicts", "spreading democracy", "increasing curiosity and learning", "weakening monarchs"],
    correctAnswerIndex: 2,
    hint: "It was a 'rebirth' of knowledge that made people want to discover the world."
  },
  {
    id: 18,
    unit: "Europe, Exploration & Colonization",
    question: "Portuguese explorers sought to",
    options: ["colonize North America", "gain control of Asia", "find a sea route around Africa", "conquer Native Americans"],
    correctAnswerIndex: 2,
    hint: "Vasco da Gama famously sailed around the Cape of Good Hope."
  },
  {
    id: 19,
    unit: "Europe, Exploration & Colonization",
    question: "Magellan’s voyage is important because",
    options: ["he discovered America", "he sailed the Atlantic", "his fleet circumnavigated the world", "he founded colonies"],
    correctAnswerIndex: 2,
    hint: "It proved the world was round by sailing all the way around it."
  },
  {
    id: 20,
    unit: "Europe, Exploration & Colonization",
    question: "Spain focused early exploration mainly in the",
    options: ["Northeast", "Northwest", "Midwest", "Southwest and Southeast"],
    correctAnswerIndex: 3,
    hint: "Think about where states like Florida, Texas, and New Mexico are."
  },
  {
    id: 21,
    unit: "Europe, Exploration & Colonization",
    question: "The colonies of the Mid-Atlantic region were mainly settled by",
    options: ["Spanish", "French", "Dutch and English", "Portuguese"],
    correctAnswerIndex: 2,
    hint: "New York was originally New Netherland."
  },
  {
    id: 22,
    unit: "Europe, Exploration & Colonization",
    question: "The Columbian Exchange refers to",
    options: ["religious reform", "global trade of goods, people, and ideas", "European warfare", "government systems"],
    correctAnswerIndex: 1,
    hint: "It was the exchange between the Old World and the New World."
  },
  // English Colonies & Colonial Life
  {
    id: 23,
    unit: "English Colonies & Colonial Life",
    question: "Jamestown was founded primarily to",
    options: ["spread Christianity", "escape persecution", "gain wealth for investors", "trade with Native Americans"],
    correctAnswerIndex: 2,
    hint: "The Virginia Company was a business venture."
  },
  {
    id: 24,
    unit: "English Colonies & Colonial Life",
    question: "The Mayflower Compact established",
    options: ["independence from England", "freedom of religion", "a structured self-government", "a monarchy"],
    correctAnswerIndex: 2,
    hint: "It was an agreement by the Pilgrims to govern themselves."
  },
  {
    id: 25,
    unit: "English Colonies & Colonial Life",
    question: "Plymouth colonists survived their first winter because of help from",
    options: ["England", "Jamestown settlers", "Native Americans", "Spain"],
    correctAnswerIndex: 2,
    hint: "Squanto taught them how to plant corn."
  },
  {
    id: 26,
    unit: "English Colonies & Colonial Life",
    question: "The Middle Colonies were unique because they",
    options: ["banned religion", "rejected trade", "welcomed diverse groups", "relied on slavery"],
    correctAnswerIndex: 2,
    hint: "Quakers in Pennsylvania promoted tolerance."
  },
  {
    id: 27,
    unit: "English Colonies & Colonial Life",
    question: "Subsistence farming was most common in",
    options: ["Virginia", "South Carolina", "Pennsylvania", "Rhode Island"],
    correctAnswerIndex: 3,
    hint: "New England soil was rocky, so large plantations weren't possible."
  },
  {
    id: 28,
    unit: "English Colonies & Colonial Life",
    question: "The Great Awakening encouraged",
    options: ["loyalty to England", "self-government", "monarchy", "isolation"],
    correctAnswerIndex: 1,
    hint: "It challenged religious authority, leading people to challenge political authority."
  },
  {
    id: 29,
    unit: "English Colonies & Colonial Life",
    question: "Fishing was most important to which region’s economy?",
    options: ["Middle Colonies", "Southern Colonies", "New England", "Western Frontier"],
    correctAnswerIndex: 2,
    hint: "They had a long coastline and poor soil for farming."
  },
  {
    id: 30,
    unit: "English Colonies & Colonial Life",
    question: "One major reason African enslavement increased was",
    options: ["industrial growth", "declining trade", "need for labor on cash crops", "religious motivation"],
    correctAnswerIndex: 2,
    hint: "Crops like tobacco and cotton required a lot of workers."
  }
];

const CIVICS_QUESTIONS: Question[] = [
  // Foundations of Government & Enlightenment
  {
    id: 1,
    unit: "Foundations of Government",
    question: "Which system of government divides power between national and state governments?",
    options: ["Unitary", "Federalism", "Dictatorship", "Confederation"],
    correctAnswerIndex: 1,
    hint: "This system is used in the United States, balancing power between Washington D.C. and the 50 states."
  },
  {
    id: 2,
    unit: "Foundations of Government",
    question: "A government in which citizens rule directly or through elected representatives is called",
    options: ["Monarchy", "Self-government", "Authoritarianism", "Oligarchy"],
    correctAnswerIndex: 1,
    hint: "This concept means people rule themselves rather than being ruled by a king or tyrant."
  },
  {
    id: 3,
    unit: "Foundations of Government",
    question: "In a confederal system of government, power is held mainly by",
    options: ["The national government", "Courts", "Local governments", "States"],
    correctAnswerIndex: 3,
    hint: "Think of the 'Articles of Confederation' where the central government was weak and states were strong."
  },
  {
    id: 4,
    unit: "Foundations of Government",
    question: "In a unitary system of government, power is held mainly by",
    options: ["The courts", "State governments", "Local governments", "The national government"],
    correctAnswerIndex: 3,
    hint: "The word 'uni' means one; power is concentrated in one central place."
  },
  {
    id: 5,
    unit: "Foundations of Government",
    question: "What is a constitution?",
    options: ["A list of punishments for crimes", "A document that outlines the basic rules and structure of government", "A plan for electing leaders", "A court decision"],
    correctAnswerIndex: 1,
    hint: "It acts as the supreme law of the land and the blueprint for how the government operates."
  },
  {
    id: 6,
    unit: "Foundations of Government",
    question: "What is the main purpose of government?",
    options: ["To control all citizens", "To protect individual rights and maintain order", "To create wealth for leaders", "To limit freedoms"],
    correctAnswerIndex: 1,
    hint: "Think about why John Locke said people form governments: life, liberty, and property."
  },
  {
    id: 7,
    unit: "Foundations of Government",
    question: "The idea of a social contract means that people",
    options: ["Control every government decision", "Give up some freedom in exchange for protection", "Are ruled without agreement", "Obey laws without rights"],
    correctAnswerIndex: 1,
    hint: "It's an agreement (contract) between the people and the government to ensure safety."
  },
  {
    id: 8,
    unit: "Enlightenment",
    question: "Which Enlightenment thinker argued that people have natural rights?",
    options: ["Thomas Hobbes", "Jean-Jacques Rousseau", "Voltaire", "John Locke"],
    correctAnswerIndex: 3,
    hint: "He influenced Thomas Jefferson significantly when writing the Declaration of Independence."
  },
  {
    id: 9,
    unit: "Enlightenment",
    question: "Montesquieu believed government power should be",
    options: ["Held by one ruler", "Concentrated in the legislature", "Divided among branches", "Given to the courts"],
    correctAnswerIndex: 2,
    hint: "He proposed the separation of powers to prevent tyranny."
  },
  
  // Colonial Government & Independence
  {
    id: 10,
    unit: "Colonial Government",
    question: "Colonists protested the Stamp Act primarily by",
    options: ["Attacking British soldiers", "Dumping tea into harbors", "Boycotting British goods", "Declaring independence"],
    correctAnswerIndex: 2,
    hint: "They refused to buy British products to hurt Britain's economy."
  },
  {
    id: 11,
    unit: "Colonial Government",
    question: "Common Sense, written by Thomas Paine, encouraged",
    options: ["Loyalty to Britain", "Support for monarchy", "Independence from Britain", "Formation of Parliament"],
    correctAnswerIndex: 2,
    hint: "The pamphlet argued it was 'common sense' for a large continent not to be ruled by a small island."
  },
  {
    id: 12,
    unit: "Colonial Government",
    question: "The Declaration of Independence was written to",
    options: ["Create courts", "Establish a constitution", "Explain why the colonies wanted independence", "List colonial laws"],
    correctAnswerIndex: 2,
    hint: "It was a break-up letter to King George III explaining the reasons for separation."
  },
  {
    id: 13,
    unit: "Colonial Government",
    question: "Which group practiced direct democracy under the Mayflower Compact?",
    options: ["Puritans", "Jamestown settlers", "Pilgrims", "Colonists of Connecticut"],
    correctAnswerIndex: 2,
    hint: "They arrived on the Mayflower in 1620."
  },
  {
    id: 14,
    unit: "Colonial Government",
    question: "After the French and Indian War, Britain",
    options: ["Lowered taxes", "Gave colonies independence", "Taxed the colonies", "Ended colonial trade"],
    correctAnswerIndex: 2,
    hint: "Britain needed money to pay off the massive war debt."
  },

  // The Constitution & Federalism
  {
    id: 15,
    unit: "The Constitution",
    question: "The main purpose of the Preamble to the Constitution is to",
    options: ["List rights", "Declare the goals of the Constitution", "Define laws", "Establish courts"],
    correctAnswerIndex: 1,
    hint: "It starts with 'We the People' and sets out the purposes of the new government."
  },
  {
    id: 16,
    unit: "The Constitution",
    question: "An amendment is",
    options: ["A lawsuit", "A court ruling", "A change or addition to the Constitution", "A government policy"],
    correctAnswerIndex: 2,
    hint: "There are 27 of these changes to the US Constitution."
  },
  {
    id: 17,
    unit: "The Constitution",
    question: "Powers shared by federal and state governments are called",
    options: ["Reserved powers", "Implied powers", "Concurrent powers", "Delegated powers"],
    correctAnswerIndex: 2,
    hint: "'Concurrent' means happening at the same time."
  },
  {
    id: 18,
    unit: "The Constitution",
    question: "The Great Compromise resolved disagreements over",
    options: ["Slavery", "Representation in Congress", "Voting rights", "Presidential elections"],
    correctAnswerIndex: 1,
    hint: "It created a bicameral legislature with a House (population) and Senate (equal)."
  },
  {
    id: 19,
    unit: "The Constitution",
    question: "Popular sovereignty means that power comes from",
    options: ["The president", "Congress", "The states", "The people"],
    correctAnswerIndex: 3,
    hint: "'Populus' means people; sovereignty means power."
  },

  // Articles of Confederation & Ratification
  {
    id: 20,
    unit: "Articles of Confederation",
    question: "One major weakness of the Articles of Confederation was",
    options: ["A strong national government", "Too much executive power", "A weak central government", "Too many courts"],
    correctAnswerIndex: 2,
    hint: "The government could not tax or enforce laws effectively."
  },
  {
    id: 21,
    unit: "Articles of Confederation",
    question: "Under the Articles of Confederation, Congress could NOT",
    options: ["Declare war", "Sign treaties", "Print money", "Tax citizens"],
    correctAnswerIndex: 3,
    hint: "Without money, the government couldn't pay its debts or soldiers."
  },
  {
    id: 22,
    unit: "Ratification",
    question: "Federalists supported the Constitution because it",
    options: ["Weakened government", "Strengthened the national government", "Eliminated states", "Removed elections"],
    correctAnswerIndex: 1,
    hint: "They wanted a stronger union than the Articles provided."
  },
  {
    id: 23,
    unit: "Ratification",
    question: "Anti-Federalists opposed the Constitution mainly because it",
    options: ["Lowered taxes", "Created courts", "Lacked protection of individual rights", "Gave states too much power"],
    correctAnswerIndex: 2,
    hint: "They demanded a Bill of Rights be added."
  },
  {
    id: 24,
    unit: "Ratification",
    question: "The Bill of Rights was added to the Constitution to",
    options: ["Limit states", "Protect individual liberties", "Increase executive power", "Eliminate courts"],
    correctAnswerIndex: 1,
    hint: "It includes freedom of speech, religion, and the press."
  },

  // Principles of American Democracy
  {
    id: 25,
    unit: "Principles of Democracy",
    question: "Limited government means",
    options: ["Government has unlimited power", "Only leaders have rights", "Government power is restricted", "Courts rule over citizens"],
    correctAnswerIndex: 2,
    hint: "The government is not above the law."
  },
  {
    id: 26,
    unit: "Principles of Democracy",
    question: "Separation of powers means",
    options: ["States control the nation", "One branch holds all power", "Power is divided among branches", "Courts make laws"],
    correctAnswerIndex: 2,
    hint: "Legislative, Executive, and Judicial branches have distinct roles."
  },
  {
    id: 27,
    unit: "Principles of Democracy",
    question: "Checks and balances exist to",
    options: ["Speed up laws", "Prevent abuse of power", "Strengthen one branch", "Limit voting"],
    correctAnswerIndex: 1,
    hint: "Each branch can stop or 'check' the other branches to ensure no one gets too powerful."
  },
  {
    id: 28,
    unit: "Principles of Democracy",
    question: "Representative government means",
    options: ["Citizens vote on every law", "Leaders inherit power", "People elect officials to govern", "Courts rule directly"],
    correctAnswerIndex: 2,
    hint: "We vote for Congress members to make laws for us."
  },
  {
    id: 29,
    unit: "Principles of Democracy",
    question: "Consent of the governed means",
    options: ["Government rules by force", "People must obey leaders", "Government exists with the people’s permission", "Laws are permanent"],
    correctAnswerIndex: 2,
    hint: "Legitimacy comes from the permission of the people."
  },
  {
    id: 30,
    unit: "Principles of Democracy",
    question: "Articles I, II, and III of the Constitution describe",
    options: ["Individual rights", "State powers", "The three branches of government", "The amendment process"],
    correctAnswerIndex: 2,
    hint: "Article I is Legislative, II is Executive, III is Judicial."
  }
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
    questions: CIVICS_QUESTIONS
  },
  'us-history': {
    id: 'us-history',
    title: 'US History',
    description: 'Prepare for your US History Midterm. From Native Peoples to the 13 Colonies.',
    questions: US_HISTORY_QUESTIONS
  }
};
