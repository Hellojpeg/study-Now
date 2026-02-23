import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireTeacher } from "./authHelpers";

// Get all questions for a course
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

// Get questions for a specific module
export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

// Get questions for a specific unit within a course
export const listByUnit = query({
  args: { courseId: v.id("courses"), unit: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_course_unit", (q) => 
        q.eq("courseId", args.courseId).eq("unit", args.unit)
      )
      .collect();
  },
});

// Get questions for a specific quarter
export const listByQuarter = query({
  args: { courseId: v.id("courses"), quarter: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_course_quarter", (q) => 
        q.eq("courseId", args.courseId).eq("quarter", args.quarter)
      )
      .collect();
  },
});

// Get questions by benchmark code
export const listByBenchmark = query({
  args: { benchmark: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_benchmark", (q) => q.eq("benchmark", args.benchmark))
      .collect();
  },
});

// Get a single question by ID
export const get = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questionId);
  },
});

// Get a random set of questions for a quiz
export const getRandomSet = query({
  args: {
    courseId: v.id("courses"),
    count: v.number(),
    unit: v.optional(v.string()),
    quarter: v.optional(v.string()),
    moduleId: v.optional(v.id("modules")),
  },
  handler: async (ctx, args) => {
    let questions;

    if (args.moduleId) {
      const moduleId = args.moduleId;
      questions = await ctx.db
        .query("questions")
        .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
        .collect();
    } else if (args.unit) {
      const unit = args.unit;
      questions = await ctx.db
        .query("questions")
        .withIndex("by_course_unit", (q) => 
          q.eq("courseId", args.courseId).eq("unit", unit)
        )
        .collect();
    } else if (args.quarter) {
      const quarter = args.quarter;
      questions = await ctx.db
        .query("questions")
        .withIndex("by_course_quarter", (q) => 
          q.eq("courseId", args.courseId).eq("quarter", quarter)
        )
        .collect();
    } else {
      questions = await ctx.db
        .query("questions")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect();
    }

    // Shuffle and take requested count
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(args.count, shuffled.length));
  },
});

// Get multiple questions by their IDs (for assignments)
export const getByIds = query({
  args: { questionIds: v.array(v.id("questions")) },
  handler: async (ctx, args) => {
    const questions = await Promise.all(
      args.questionIds.map((id) => ctx.db.get(id))
    );
    return questions.filter((q) => q !== null);
  },
});

// Create a new question (Teacher only)
export const create = mutation({
  args: {
    userId: v.optional(v.id("users")), // Optional for seed scripts
    courseId: v.id("courses"),
    moduleId: v.optional(v.id("modules")),
    unit: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswerIndex: v.number(),
    hint: v.optional(v.string()),
    quarter: v.optional(v.string()),
    week: v.optional(v.number()),
    image: v.optional(v.string()),
    benchmark: v.optional(v.string()),
    questionType: v.optional(v.string()),
    bloomLevel: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Auth check only if userId provided (allows seed scripts to bypass)
    if (args.userId) {
      await requireTeacher(ctx, args.userId);
    }
    
    const { userId, ...questionData } = args;
    const questionId = await ctx.db.insert("questions", {
      ...questionData,
      createdBy: args.createdBy || args.userId,
      createdAt: Date.now(),
    });
    return questionId;
  },
});

// Bulk create questions (for seeding/import)
export const createBulk = mutation({
  args: {
    questions: v.array(v.object({
      courseId: v.id("courses"),
      moduleId: v.optional(v.id("modules")),
      unit: v.string(),
      question: v.string(),
      options: v.array(v.string()),
      correctAnswerIndex: v.number(),
      hint: v.optional(v.string()),
      quarter: v.optional(v.string()),
      week: v.optional(v.number()),
      image: v.optional(v.string()),
      benchmark: v.optional(v.string()),
      questionType: v.optional(v.string()),
      bloomLevel: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const ids: string[] = [];
    for (const q of args.questions) {
      const id = await ctx.db.insert("questions", {
        ...q,
        createdAt: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});

// Update an existing question
export const update = mutation({
  args: {
    userId: v.id("users"),
    questionId: v.id("questions"),
    unit: v.optional(v.string()),
    question: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctAnswerIndex: v.optional(v.number()),
    hint: v.optional(v.string()),
    quarter: v.optional(v.string()),
    week: v.optional(v.number()),
    image: v.optional(v.string()),
    benchmark: v.optional(v.string()),
    questionType: v.optional(v.string()),
    bloomLevel: v.optional(v.string()),
    moduleId: v.optional(v.id("modules")),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const { questionId, userId, ...updates } = args;
    const existingQuestion = await ctx.db.get(questionId);
    if (!existingQuestion) {
      throw new Error("Question not found");
    }

    await ctx.db.patch(questionId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return questionId;
  },
});

// Delete a question
export const remove = mutation({
  args: { 
    userId: v.id("users"),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    await ctx.db.delete(args.questionId);
  },
});

// Delete all questions for a course (Admin only - for re-seeding)
export const removeAllForCourse = mutation({
  args: { 
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId); // Should be requireAdmin for production
    
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    return questions.length;
  },
});

// Get question stats for a course
export const getStats = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const unitCounts: Record<string, number> = {};
    const quarterCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    for (const q of questions) {
      unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
      if (q.quarter) {
        quarterCounts[q.quarter] = (quarterCounts[q.quarter] || 0) + 1;
      }
      if (q.questionType) {
        typeCounts[q.questionType] = (typeCounts[q.questionType] || 0) + 1;
      }
    }

    return {
      total: questions.length,
      byUnit: unitCounts,
      byQuarter: quarterCounts,
      byType: typeCounts,
    };
  },
});
