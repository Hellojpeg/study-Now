import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireTeacher } from "./authHelpers";

// Get all modules for a course
export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modules")
      .withIndex("by_course_order", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

// Get a single module by ID
export const get = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.moduleId);
  },
});

// Get module with all related data (vocabulary, chapters, lessons)
export const getWithContent = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);
    if (!module) return null;

    const vocabulary = await ctx.db
      .query("vocabulary")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_module_order", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return {
      ...module,
      vocabulary,
      chapters,
      lessons,
    };
  },
});

// Create a new module (Teacher only)
export const create = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    title: v.string(),
    focus: v.string(),
    keyTopics: v.array(v.string()),
    standardCodes: v.array(v.string()),
    keyConcepts: v.optional(v.array(v.string())),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const { userId, ...moduleData } = args;
    const moduleId = await ctx.db.insert("modules", {
      ...moduleData,
      createdAt: Date.now(),
    });
    return moduleId;
  },
});

// Update an existing module
export const update = mutation({
  args: {
    userId: v.id("users"),
    moduleId: v.id("modules"),
    title: v.optional(v.string()),
    focus: v.optional(v.string()),
    keyTopics: v.optional(v.array(v.string())),
    standardCodes: v.optional(v.array(v.string())),
    keyConcepts: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const { moduleId, userId, ...updates } = args;
    const existingModule = await ctx.db.get(moduleId);
    if (!existingModule) {
      throw new Error("Module not found");
    }

    await ctx.db.patch(moduleId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return moduleId;
  },
});

// Delete a module and all related content
export const remove = mutation({
  args: { 
    userId: v.id("users"),
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    // Delete related vocabulary
    const vocabulary = await ctx.db
      .query("vocabulary")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    for (const vocab of vocabulary) {
      await ctx.db.delete(vocab._id);
    }

    // Delete related lessons
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }

    // Delete related chapters
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    for (const chapter of chapters) {
      await ctx.db.delete(chapter._id);
    }

    // Delete the module itself
    await ctx.db.delete(args.moduleId);
  },
});

// Reorder modules within a course
export const reorder = mutation({
  args: {
    userId: v.id("users"),
    moduleIds: v.array(v.id("modules")),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    for (let i = 0; i < args.moduleIds.length; i++) {
      await ctx.db.patch(args.moduleIds[i], {
        order: i,
        updatedAt: Date.now(),
      });
    }
  },
});
