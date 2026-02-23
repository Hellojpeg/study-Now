import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

// Get a course by ID
export const get = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

// Get a course by subject ID
export const getBySubjectId = query({
  args: { subjectId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_subjectId", (q) => q.eq("subjectId", args.subjectId))
      .first();
  },
});

// Create a new course
export const create = mutation({
  args: {
    name: v.string(),
    subjectId: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      ...args,
      isArchived: false,
    });
  },
});

// Update a course
export const update = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.optional(v.string()),
    subjectId: v.optional(v.string()),
    description: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { courseId, ...updates } = args;
    await ctx.db.patch(courseId, updates);
    return courseId;
  },
});

// Archive a course (soft delete)
export const archive = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, { isArchived: true });
    return args.courseId;
  },
});

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const courses = [
      {
        name: "World History",
        subjectId: "world-history",
        description: "Journey through the history of human civilization.",
      },
      {
        name: "Civics",
        subjectId: "civics",
        description: "Understanding the rights and duties of citizenship.",
      },
      {
        name: "US History",
        subjectId: "us-history",
        description: "The history of the United States of America.",
      },
    ];

    for (const courseData of courses) {
      const existing = await ctx.db
        .query("courses")
        .withIndex("by_subjectId", (q) => q.eq("subjectId", courseData.subjectId))
        .first();

      if (!existing) {
        await ctx.db.insert("courses", {
          ...courseData,
          isArchived: false,
        });
      }
    }
  },
});
