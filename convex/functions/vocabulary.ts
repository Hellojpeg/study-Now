import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Get all vocabulary terms for a module
export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vocabulary")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

// Get a single vocabulary term by ID
export const get = query({
  args: { vocabId: v.id("vocabulary") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.vocabId);
  },
});

// Get all vocabulary for a course (across all modules)
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    // First get all modules for the course
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Then get vocabulary for each module
    const allVocab = [];
    for (const mod of modules) {
      const vocab = await ctx.db
        .query("vocabulary")
        .withIndex("by_module", (q) => q.eq("moduleId", mod._id))
        .collect();
      allVocab.push(...vocab.map(v => ({ ...v, moduleName: mod.title })));
    }

    return allVocab;
  },
});

// Create a new vocabulary term
export const create = mutation({
  args: {
    moduleId: v.id("modules"),
    term: v.string(),
    definition: v.string(),
    image: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vocabId = await ctx.db.insert("vocabulary", {
      ...args,
      createdAt: Date.now(),
    });
    return vocabId;
  },
});

// Bulk create vocabulary terms
export const createBulk = mutation({
  args: {
    terms: v.array(v.object({
      moduleId: v.id("modules"),
      term: v.string(),
      definition: v.string(),
      image: v.optional(v.string()),
      category: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const ids: string[] = [];
    for (const term of args.terms) {
      const id = await ctx.db.insert("vocabulary", {
        ...term,
        createdAt: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});

// Update a vocabulary term
export const update = mutation({
  args: {
    vocabId: v.id("vocabulary"),
    term: v.optional(v.string()),
    definition: v.optional(v.string()),
    image: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { vocabId, ...updates } = args;
    const existing = await ctx.db.get(vocabId);
    if (!existing) {
      throw new Error("Vocabulary term not found");
    }

    await ctx.db.patch(vocabId, updates);
    return vocabId;
  },
});

// Delete a vocabulary term
export const remove = mutation({
  args: { vocabId: v.id("vocabulary") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.vocabId);
  },
});

// Delete all vocabulary for a module
export const removeAllForModule = mutation({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const vocab = await ctx.db
      .query("vocabulary")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    for (const term of vocab) {
      await ctx.db.delete(term._id);
    }

    return vocab.length;
  },
});

// Get random vocabulary for flashcards
export const getRandomForFlashcards = query({
  args: {
    moduleId: v.optional(v.id("modules")),
    courseId: v.optional(v.id("courses")),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    let vocab;

    if (args.moduleId) {
      const moduleId = args.moduleId;
      vocab = await ctx.db
        .query("vocabulary")
        .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
        .collect();
    } else if (args.courseId) {
      const courseId = args.courseId;
      // Get all modules for the course
      const modules = await ctx.db
        .query("modules")
        .withIndex("by_course", (q) => q.eq("courseId", courseId))
        .collect();

      vocab = [];
      for (const mod of modules) {
        const moduleVocab = await ctx.db
          .query("vocabulary")
          .withIndex("by_module", (q) => q.eq("moduleId", mod._id))
          .collect();
        vocab.push(...moduleVocab);
      }
    } else {
      return [];
    }

    // Shuffle and return requested count
    const shuffled = vocab.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(args.count, shuffled.length));
  },
});
