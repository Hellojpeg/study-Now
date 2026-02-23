import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireTeacher, requireOwnership } from "./authHelpers";

// Get all assignments for a class
export const listByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
  },
});

// Get upcoming assignments for a class (sorted by due date)
export const listUpcomingByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_class_due", (q) => q.eq("classId", args.classId))
      .collect();

    return assignments
      .filter((a) => a.dueDate > now && a.status === "PUBLISHED")
      .sort((a, b) => a.dueDate - b.dueDate);
  },
});

// Get assignments for a student across all their classes
export const listByStudent = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    // Find all classes the student is in
    const allClasses = await ctx.db.query("classes").collect();
    const studentClasses = allClasses.filter((c) =>
      c.studentIds.includes(args.studentId)
    );

    // Get assignments for each class
    const assignments = [];
    for (const cls of studentClasses) {
      const classAssignments = await ctx.db
        .query("assignments")
        .withIndex("by_class", (q) => q.eq("classId", cls._id))
        .collect();
      
      // Add class info to each assignment
      assignments.push(
        ...classAssignments
          .filter((a) => a.status === "PUBLISHED")
          .map((a) => ({
            ...a,
            className: cls.name,
            classSection: cls.section,
          }))
      );
    }

    return assignments.sort((a, b) => a.dueDate - b.dueDate);
  },
});

// Get a single assignment by ID
export const get = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assignmentId);
  },
});

// Get assignment with questions loaded
export const getWithQuestions = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    const questions = assignment.questionIds
      ? await Promise.all(
          assignment.questionIds.map((id) => ctx.db.get(id))
        )
      : [];

    return {
      ...assignment,
      questions: questions.filter((q) => q !== null),
    };
  },
});

// Create a new assignment (Teacher only)
export const create = mutation({
  args: {
    userId: v.id("users"),
    classId: v.id("classes"),
    courseId: v.id("courses"),
    title: v.string(),
    type: v.string(), // 'QUIZ' | 'READING' | 'GAME' | 'PROJECT'
    questionIds: v.optional(v.array(v.id("questions"))),
    moduleId: v.optional(v.id("modules")),
    gameMode: v.optional(v.string()),
    dueDate: v.number(),
    points: v.number(),
    status: v.optional(v.string()), // 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const { userId, ...assignmentData } = args;
    const assignmentId = await ctx.db.insert("assignments", {
      ...assignmentData,
      createdBy: userId,
      status: args.status || "DRAFT",
      createdAt: Date.now(),
    });

    // Update the class to include this assignment
    const classDoc = await ctx.db.get(args.classId);
    if (classDoc) {
      const currentAssignments = classDoc.assignmentIds || [];
      await ctx.db.patch(args.classId, {
        assignmentIds: [...currentAssignments, assignmentId],
        updatedAt: Date.now(),
      });
    }

    return assignmentId;
  },
});

// Update an assignment
export const update = mutation({
  args: {
    userId: v.id("users"),
    assignmentId: v.id("assignments"),
    title: v.optional(v.string()),
    type: v.optional(v.string()),
    questionIds: v.optional(v.array(v.id("questions"))),
    moduleId: v.optional(v.id("modules")),
    gameMode: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    points: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const { assignmentId, userId, ...updates } = args;
    const existing = await ctx.db.get(assignmentId);
    if (!existing) {
      throw new Error("Assignment not found");
    }

    await ctx.db.patch(assignmentId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return assignmentId;
  },
});

// Publish an assignment (make it visible to students)
export const publish = mutation({
  args: { 
    userId: v.id("users"),
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await ctx.db.patch(args.assignmentId, {
      status: "PUBLISHED",
      updatedAt: Date.now(),
    });

    return args.assignmentId;
  },
});

// Close an assignment (no more submissions)
export const close = mutation({
  args: { 
    userId: v.id("users"),
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    await ctx.db.patch(args.assignmentId, {
      status: "CLOSED",
      updatedAt: Date.now(),
    });

    return args.assignmentId;
  },
});

// Delete an assignment
export const remove = mutation({
  args: { 
    userId: v.id("users"),
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx, args.userId);
    
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Remove from class's assignment list
    const classDoc = await ctx.db.get(assignment.classId);
    if (classDoc && classDoc.assignmentIds) {
      await ctx.db.patch(assignment.classId, {
        assignmentIds: classDoc.assignmentIds.filter((id) => id !== args.assignmentId),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.assignmentId);
  },
});

// Get assignment completion stats for a class
export const getCompletionStats = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    const classDoc = await ctx.db.get(assignment.classId);
    if (!classDoc) return null;

    // Get all attempts for this assignment
    const attempts = await ctx.db
      .query("quiz_attempts")
      .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
      .collect();

    const studentCount = classDoc.studentIds.length;
    const completedCount = new Set(attempts.map((a) => a.userId)).size;

    const scores = attempts.map((a) => (a.score / a.totalQuestions) * 100);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      totalStudents: studentCount,
      completedCount,
      pendingCount: studentCount - completedCount,
      completionRate: studentCount > 0 ? (completedCount / studentCount) * 100 : 0,
      averageScore,
      attempts,
    };
  },
});
