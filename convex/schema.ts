import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // 'STUDENT' | 'TEACHER'
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  courses: defineTable({
    name: v.string(),
    subjectId: v.string(), // "world-history", "civics", "us-history"
    description: v.string(),
    isArchived: v.boolean(),
  }).index("by_subjectId", ["subjectId"]),

  classes: defineTable({
    name: v.string(),
    section: v.string(),
    code: v.string(),
    teacherId: v.string(),
    studentIds: v.array(v.string()), // Array of user IDs
    courseId: v.optional(v.id("courses")),
    assignmentIds: v.optional(v.array(v.id("assignments"))), // Linked to assignments table
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_code", ["code"])
    .index("by_course", ["courseId"]),

  // ============ NEW TABLES FOR CONCEPTS/LESSONS/QUESTIONS ============

  // Educational standards/benchmarks (e.g., SS.6.W.3.2)
  benchmarks: defineTable({
    code: v.string(), // e.g., "SS.6.W.3.2"
    description: v.string(),
    clarifications: v.array(v.string()),
    subject: v.string(), // "world-history", "civics", "us-history"
    grade: v.optional(v.string()), // e.g., "6", "7", "8"
  })
    .index("by_code", ["code"])
    .index("by_subject", ["subject"]),

  // Course modules (units of study)
  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    focus: v.string(),
    keyTopics: v.array(v.string()),
    standardCodes: v.array(v.string()), // References benchmark codes
    keyConcepts: v.optional(v.array(v.string())),
    order: v.number(), // Display order within course
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "order"]),

  // Chapters within modules
  chapters: defineTable({
    moduleId: v.id("modules"),
    title: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_module", ["moduleId"])
    .index("by_module_order", ["moduleId", "order"]),

  // Individual lessons within chapters
  lessons: defineTable({
    chapterId: v.id("chapters"),
    moduleId: v.id("modules"), // Denormalized for easier queries
    title: v.string(),
    content: v.array(v.string()), // Array of paragraphs
    image: v.optional(v.object({
      url: v.string(),
      caption: v.string(),
    })),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_chapter", ["chapterId"])
    .index("by_module", ["moduleId"])
    .index("by_chapter_order", ["chapterId", "order"]),

  // Vocabulary/concepts linked to modules
  vocabulary: defineTable({
    moduleId: v.id("modules"),
    term: v.string(),
    definition: v.string(),
    image: v.optional(v.string()),
    category: v.optional(v.string()), // For grouping terms
    createdAt: v.number(),
  })
    .index("by_module", ["moduleId"]),

  // Quiz questions - the core content table
  questions: defineTable({
    courseId: v.id("courses"),
    moduleId: v.optional(v.id("modules")), // Optional: for module-specific questions
    unit: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswerIndex: v.number(),
    hint: v.optional(v.string()),
    quarter: v.optional(v.string()), // 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'MID' | 'FIN'
    week: v.optional(v.number()),
    image: v.optional(v.string()),
    benchmark: v.optional(v.string()), // Links to benchmark code
    questionType: v.optional(v.string()), // 'MCQ' | 'TF' | 'VOCAB' | 'ANALYSIS' | 'MATCH'
    bloomLevel: v.optional(v.string()), // 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE'
    createdBy: v.optional(v.id("users")), // Teacher who created it
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_module", ["moduleId"])
    .index("by_course_unit", ["courseId", "unit"])
    .index("by_course_quarter", ["courseId", "quarter"])
    .index("by_benchmark", ["benchmark"])
    .index("by_createdBy", ["createdBy"]),

  // Assignments given to classes
  assignments: defineTable({
    classId: v.id("classes"),
    courseId: v.id("courses"),
    title: v.string(),
    type: v.string(), // 'QUIZ' | 'READING' | 'GAME' | 'PROJECT'
    questionIds: v.optional(v.array(v.id("questions"))), // Questions for this assignment
    moduleId: v.optional(v.id("modules")), // If assignment is module-based
    gameMode: v.optional(v.string()), // Which game mode to use
    dueDate: v.number(), // Unix timestamp
    points: v.number(),
    status: v.string(), // 'DRAFT' | 'PUBLISHED' | 'CLOSED'
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_class", ["classId"])
    .index("by_course", ["courseId"])
    .index("by_class_due", ["classId", "dueDate"]),

  // Student quiz/assignment attempts
  quiz_attempts: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    assignmentId: v.optional(v.id("assignments")), // If from an assignment
    classId: v.optional(v.id("classes")),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    missedQuestionIds: v.array(v.id("questions")),
    answers: v.optional(v.array(v.object({
      questionId: v.id("questions"),
      selectedIndex: v.number(),
      isCorrect: v.boolean(),
      timeSpent: v.optional(v.number()), // ms
    }))),
    gameMode: v.optional(v.string()),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_assignment", ["assignmentId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_class", ["classId"]),

  // Overall student progress tracking (XP, streaks, etc.)
  student_progress: defineTable({
    userId: v.id("users"),
    xp: v.number(),
    level: v.number(),
    streakDays: v.number(),
    lastActivityDate: v.optional(v.string()), // ISO date string
    gamesCompleted: v.number(),
    quizzesCompleted: v.number(),
    totalQuestionsAnswered: v.number(),
    totalCorrectAnswers: v.number(),
    achievements: v.optional(v.array(v.string())), // Achievement IDs
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Mini-quiz questions for end of lessons/chapters
  lesson_quizzes: defineTable({
    lessonId: v.optional(v.id("lessons")),
    chapterId: v.optional(v.id("chapters")),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_chapter", ["chapterId"]),

  // Analysis scenarios for higher-order thinking
  analysis_scenarios: defineTable({
    courseId: v.id("courses"),
    moduleId: v.optional(v.id("modules")),
    title: v.string(),
    excerpt: v.string(),
    source: v.optional(v.string()),
    image: v.optional(v.string()),
    tasks: v.array(v.object({
      id: v.string(),
      type: v.string(), // 'SHORT_RESPONSE' | 'VENN'
      prompt: v.string(),
      rubricKeywords: v.optional(v.array(v.string())),
      sampleAnswer: v.optional(v.string()),
      vennLabels: v.optional(v.object({ a: v.string(), b: v.string() })),
      vennItems: v.optional(v.array(v.object({
        id: v.string(),
        text: v.string(),
        correctZone: v.string(), // 'A' | 'B' | 'BOTH'
      }))),
    })),
    createdAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_module", ["moduleId"]),

  // ============ EXISTING SCORM TABLES ============

  scorm_packages: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    version: v.string(), // '1.2' | '2004'
    teacherId: v.string(),
    classIds: v.array(v.string()),
    filename: v.string(),
    storagePath: v.string(),
    manifestUrl: v.string(),
    metadata: v.optional(
      v.object({
        entryPoint: v.optional(v.string()),
        masteryScore: v.optional(v.number()),
        maxTimeAllowed: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_teacher", ["teacherId"]),

  scorm_attempts: defineTable({
    packageId: v.string(),
    studentId: v.string(),
    classId: v.optional(v.string()),
    cmiData: v.object({
      coreStudentId: v.optional(v.string()),
      coreStudentName: v.optional(v.string()),
      coreLessonLocation: v.optional(v.string()),
      coreLessonStatus: v.optional(v.string()),
      coreScoreRaw: v.optional(v.number()),
      coreScoreMin: v.optional(v.number()),
      coreScoreMax: v.optional(v.number()),
      coreTotalTime: v.optional(v.string()),
      coreSessionTime: v.optional(v.string()),
      coreExit: v.optional(v.string()),
      coreEntry: v.optional(v.string()),
      suspendData: v.optional(v.string()),
      launchData: v.optional(v.string()),
      comments: v.optional(v.string()),
      objectives: v.optional(v.string()),
      interactions: v.optional(v.string()),
    }),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    lastAccessedAt: v.number(),
  })
    .index("by_package", ["packageId"])
    .index("by_student", ["studentId"])
    .index("by_package_student", ["packageId", "studentId"]),
});
