import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Get all lessons for a chapter
export const listByChapter = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", args.chapterId))
      .collect();
  },
});

// Get all lessons for a module (across all chapters)
export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

// Get a single lesson by ID
export const get = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

// Get lesson with its mini-quiz questions
export const getWithQuiz = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    const quizQuestions = await ctx.db
      .query("lesson_quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    return {
      ...lesson,
      miniQuiz: quizQuestions,
    };
  },
});

// Create a new lesson
export const create = mutation({
  args: {
    chapterId: v.id("chapters"),
    moduleId: v.id("modules"),
    title: v.string(),
    content: v.array(v.string()),
    image: v.optional(v.object({
      url: v.string(),
      caption: v.string(),
    })),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const lessonId = await ctx.db.insert("lessons", {
      ...args,
      createdAt: Date.now(),
    });
    return lessonId;
  },
});

// Update an existing lesson
export const update = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    content: v.optional(v.array(v.string())),
    image: v.optional(v.object({
      url: v.string(),
      caption: v.string(),
    })),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { lessonId, ...updates } = args;
    const existingLesson = await ctx.db.get(lessonId);
    if (!existingLesson) {
      throw new Error("Lesson not found");
    }

    await ctx.db.patch(lessonId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return lessonId;
  },
});

// Delete a lesson and its quiz questions
export const remove = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    // Delete related quiz questions
    const quizQuestions = await ctx.db
      .query("lesson_quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();
    for (const question of quizQuestions) {
      await ctx.db.delete(question._id);
    }

    // Delete the lesson itself
    await ctx.db.delete(args.lessonId);
  },
});

// ============ CHAPTER FUNCTIONS ============

// Get all chapters for a module
export const listChaptersByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_module_order", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

// Get chapter with all lessons
export const getChapterWithLessons = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_chapter_order", (q) => q.eq("chapterId", args.chapterId))
      .collect();

    const chapterQuiz = await ctx.db
      .query("lesson_quizzes")
      .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
      .collect();

    return {
      ...chapter,
      lessons,
      quiz: chapterQuiz,
    };
  },
});

// Create a new chapter
export const createChapter = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const chapterId = await ctx.db.insert("chapters", {
      ...args,
      createdAt: Date.now(),
    });
    return chapterId;
  },
});

// Update an existing chapter
export const updateChapter = mutation({
  args: {
    chapterId: v.id("chapters"),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { chapterId, ...updates } = args;
    const existing = await ctx.db.get(chapterId);
    if (!existing) {
      throw new Error("Chapter not found");
    }
    
    const cleanUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.order !== undefined) cleanUpdates.order = updates.order;
    
    await ctx.db.patch(chapterId, cleanUpdates);
    return chapterId;
  },
});

// Delete a chapter and all its lessons
export const removeChapter = mutation({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    // Delete all lessons in the chapter
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
      .collect();

    for (const lesson of lessons) {
      // Delete lesson quiz questions
      const quizQuestions = await ctx.db
        .query("lesson_quizzes")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
        .collect();
      for (const question of quizQuestions) {
        await ctx.db.delete(question._id);
      }
      await ctx.db.delete(lesson._id);
    }

    // Delete chapter quiz questions
    const chapterQuiz = await ctx.db
      .query("lesson_quizzes")
      .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
      .collect();
    for (const question of chapterQuiz) {
      await ctx.db.delete(question._id);
    }

    // Delete the chapter
    await ctx.db.delete(args.chapterId);
  },
});

// ============ LESSON QUIZ FUNCTIONS ============

// Create a mini-quiz question for a lesson
export const createLessonQuizQuestion = mutation({
  args: {
    lessonId: v.optional(v.id("lessons")),
    chapterId: v.optional(v.id("chapters")),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lesson_quizzes", args);
  },
});

// Delete a lesson quiz question
export const removeLessonQuizQuestion = mutation({
  args: { questionId: v.id("lesson_quizzes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});
