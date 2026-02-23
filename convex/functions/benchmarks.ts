import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Get all benchmarks for a subject
export const listBySubject = query({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("benchmarks")
      .withIndex("by_subject", (q) => q.eq("subject", args.subject))
      .collect();
  },
});

// Get a benchmark by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("benchmarks")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// Get all benchmarks
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("benchmarks").collect();
  },
});

// Create a new benchmark
export const create = mutation({
  args: {
    code: v.string(),
    description: v.string(),
    clarifications: v.array(v.string()),
    subject: v.string(),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("benchmarks", args);
  },
});

// Bulk create benchmarks
export const createBulk = mutation({
  args: {
    benchmarks: v.array(v.object({
      code: v.string(),
      description: v.string(),
      clarifications: v.array(v.string()),
      subject: v.string(),
      grade: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const ids: string[] = [];
    for (const benchmark of args.benchmarks) {
      const id = await ctx.db.insert("benchmarks", benchmark);
      ids.push(id);
    }
    return ids;
  },
});

// Update a benchmark
export const update = mutation({
  args: {
    benchmarkId: v.id("benchmarks"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    clarifications: v.optional(v.array(v.string())),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { benchmarkId, ...updates } = args;
    await ctx.db.patch(benchmarkId, updates);
    return benchmarkId;
  },
});

// Delete a benchmark
export const remove = mutation({
  args: { benchmarkId: v.id("benchmarks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.benchmarkId);
  },
});

// Delete all benchmarks for a subject
export const removeAllForSubject = mutation({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const benchmarks = await ctx.db
      .query("benchmarks")
      .withIndex("by_subject", (q) => q.eq("subject", args.subject))
      .collect();

    for (const benchmark of benchmarks) {
      await ctx.db.delete(benchmark._id);
    }

    return benchmarks.length;
  },
});
