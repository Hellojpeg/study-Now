import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Get all scenarios for a course
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysis_scenarios")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

// Get scenarios for a module
export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysis_scenarios")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

// Get a single scenario by ID
export const get = query({
  args: { scenarioId: v.id("analysis_scenarios") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scenarioId);
  },
});

// Create a new scenario
export const create = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.optional(v.id("modules")),
    title: v.string(),
    excerpt: v.string(),
    source: v.optional(v.string()),
    image: v.optional(v.string()),
    tasks: v.array(v.object({
      id: v.string(),
      type: v.string(),
      prompt: v.string(),
      rubricKeywords: v.optional(v.array(v.string())),
      sampleAnswer: v.optional(v.string()),
      vennLabels: v.optional(v.object({ a: v.string(), b: v.string() })),
      vennItems: v.optional(v.array(v.object({
        id: v.string(),
        text: v.string(),
        correctZone: v.string(),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analysis_scenarios", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update a scenario
export const update = mutation({
  args: {
    scenarioId: v.id("analysis_scenarios"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    source: v.optional(v.string()),
    image: v.optional(v.string()),
    tasks: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      prompt: v.string(),
      rubricKeywords: v.optional(v.array(v.string())),
      sampleAnswer: v.optional(v.string()),
      vennLabels: v.optional(v.object({ a: v.string(), b: v.string() })),
      vennItems: v.optional(v.array(v.object({
        id: v.string(),
        text: v.string(),
        correctZone: v.string(),
      }))),
    }))),
  },
  handler: async (ctx, args) => {
    const { scenarioId, ...updates } = args;
    await ctx.db.patch(scenarioId, updates);
    return scenarioId;
  },
});

// Delete a scenario
export const remove = mutation({
  args: { scenarioId: v.id("analysis_scenarios") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.scenarioId);
  },
});

// Get random scenarios for analysis practice
export const getRandom = query({
  args: {
    courseId: v.id("courses"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const scenarios = await ctx.db
      .query("analysis_scenarios")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const shuffled = scenarios.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(args.count, shuffled.length));
  },
});
