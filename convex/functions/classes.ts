import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireTeacher, requireAuth } from "./authHelpers";
import { Id } from "../_generated/dataModel";

// ==================== QUERIES ====================

export const listClassesForTeacher = query({
  args: { teacherId: v.optional(v.string()) },
  handler: async (ctx, { teacherId }) => {
    if (!teacherId) return [];
    return await ctx.db.query("classes").filter((q) => q.eq(q.field("teacherId"), teacherId)).collect();
  },
});

export const getClassByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db.query("classes").filter((q) => q.eq(q.field("code"), code)).first();
  },
});

export const getClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    return await ctx.db.get(classId);
  },
});

export const listAllClasses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("classes").collect();
  },
});

export const getStudentsForClass = query({
  args: { classId: v.optional(v.id("classes")) },
  handler: async (ctx, { classId }) => {
    if (!classId) return [];
    const cls = await ctx.db.get(classId);
    if (!cls) return [];
    const ids = cls.studentIds || [];
    const users = await Promise.all(ids.map((id: string) => ctx.db.get(id as Id<"users">)));
    return users.filter(Boolean);
  },
});

// ==================== MUTATIONS ====================

export const createClass = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    section: v.string(),
    code: v.string(),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, { userId, name, section, code, courseId }) => {
    await requireTeacher(ctx, userId);
    
    const id = await ctx.db.insert("classes", {
      name,
      section,
      code,
      teacherId: userId,
      courseId,
      studentIds: [],
      assignmentIds: [],
      createdAt: Date.now(),
    });
    return { id, name, section, code, teacherId: userId };
  },
});

export const updateClass = mutation({
  args: {
    userId: v.id("users"),
    classId: v.id("classes"),
    name: v.optional(v.string()),
    section: v.optional(v.string()),
    code: v.optional(v.string()),
    assignmentIds: v.optional(v.array(v.id("assignments"))),
  },
  handler: async (ctx, { userId, classId, ...updates }) => {
    await requireTeacher(ctx, userId);
    
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    
    const patch: { updatedAt: number; name?: string; section?: string; code?: string; assignmentIds?: Id<"assignments">[] } = { updatedAt: Date.now() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.section !== undefined) patch.section = updates.section;
    if (updates.code !== undefined) patch.code = updates.code;
    if (updates.assignmentIds !== undefined) patch.assignmentIds = updates.assignmentIds;
    
    await ctx.db.patch(classId, patch);
    return { id: classId, ...patch };
  },
});

export const deleteClass = mutation({
  args: { 
    userId: v.id("users"),
    classId: v.id("classes"),
  },
  handler: async (ctx, { userId, classId }) => {
    await requireTeacher(ctx, userId);
    
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    await ctx.db.delete(classId);
    return { success: true, id: classId };
  },
});

export const addStudentToClass = mutation({
  args: { 
    userId: v.id("users"), // Teacher performing the action
    classId: v.id("classes"), 
    studentId: v.string(),
  },
  handler: async (ctx, { userId, classId, studentId }) => {
    await requireTeacher(ctx, userId);
    
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    const existingIds = Array.isArray(cls.studentIds) ? cls.studentIds : [];
    if (existingIds.includes(studentId)) {
      return { id: classId, studentIds: existingIds }; // Already in class
    }
    const newStudents = [...existingIds, studentId];
    await ctx.db.patch(cls._id, { studentIds: newStudents, updatedAt: Date.now() });
    return { id: classId, studentIds: newStudents };
  },
});

export const removeStudentFromClass = mutation({
  args: { 
    userId: v.id("users"), // Teacher performing the action
    classId: v.id("classes"), 
    studentId: v.string(),
  },
  handler: async (ctx, { userId, classId, studentId }) => {
    await requireTeacher(ctx, userId);
    
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    const newStudents = (cls.studentIds || []).filter((s: string) => s !== studentId);
    await ctx.db.patch(cls._id, { studentIds: newStudents, updatedAt: Date.now() });
    return { id: classId, studentIds: newStudents };
  },
});

export const addAssignmentToClass = mutation({
  args: { 
    userId: v.id("users"),
    classId: v.id("classes"), 
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, { userId, classId, assignmentId }) => {
    await requireTeacher(ctx, userId);
    
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    const existingAssignments = Array.isArray(cls.assignmentIds) ? cls.assignmentIds : [];
    if (existingAssignments.includes(assignmentId)) {
      return { id: classId, assignmentIds: existingAssignments };
    }
    const newAssignments = [...existingAssignments, assignmentId];
    await ctx.db.patch(classId, { assignmentIds: newAssignments, updatedAt: Date.now() });
    return { id: classId, assignmentIds: newAssignments };
  },
});

export const removeAssignmentFromClass = mutation({
  args: { 
    userId: v.id("users"),
    classId: v.id("classes"), 
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, { userId, classId, assignmentId }) => {
    await requireTeacher(ctx, userId);
    
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    const newAssignments = (cls.assignmentIds || []).filter((a) => a !== assignmentId);
    await ctx.db.patch(classId, { assignmentIds: newAssignments, updatedAt: Date.now() });
    return { id: classId, assignmentIds: newAssignments };
  },
});

// Join a class by code (for students)
export const joinClassByCode = mutation({
  args: { code: v.string(), studentId: v.string() },
  handler: async (ctx, { code, studentId }) => {
    const cls = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (!cls) throw new Error("Class not found with that code");
    
    const existingIds = Array.isArray(cls.studentIds) ? cls.studentIds : [];
    if (existingIds.includes(studentId)) {
      return { success: true, classId: cls._id, message: "Already enrolled" };
    }
    
    const newStudents = [...existingIds, studentId];
    await ctx.db.patch(cls._id, { studentIds: newStudents, updatedAt: Date.now() });
    return { success: true, classId: cls._id, message: "Successfully joined class" };
  },
});
