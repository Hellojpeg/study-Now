import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ==================== QUERIES ====================

export const listClassesForTeacher = query({
  args: { teacherId: v.string() },
  handler: async (ctx, { teacherId }) => {
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
  args: { classId: v.string() },
  handler: async (ctx, { classId }) => {
    if (!classId) return [];
    const cls = await ctx.db.query("classes").filter((q) => q.eq(q.field("_id"), classId as any)).first();
    if (!cls) return [];
    const ids = cls.studentIds || [];
    const users = await Promise.all(ids.map((id: string) => ctx.db.get(id as any)));
    return users.filter(Boolean);
  },
});

// ==================== MUTATIONS ====================

export const createClass = mutation({
  args: {
    name: v.string(),
    section: v.string(),
    code: v.string(),
    teacherId: v.string(),
  },
  handler: async (ctx, { name, section, code, teacherId }) => {
    const id = await ctx.db.insert("classes", {
      name,
      section,
      code,
      teacherId,
      studentIds: [],
      assignments: [],
      createdAt: Date.now(),
    });
    return { id, name, section, code, teacherId };
  },
});

export const updateClass = mutation({
  args: {
    classId: v.id("classes"),
    name: v.optional(v.string()),
    section: v.optional(v.string()),
    code: v.optional(v.string()),
    assignments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { classId, ...updates }) => {
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    
    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.section !== undefined) patch.section = updates.section;
    if (updates.code !== undefined) patch.code = updates.code;
    if (updates.assignments !== undefined) patch.assignments = updates.assignments;
    
    await ctx.db.patch(classId, patch);
    return { id: classId, ...patch };
  },
});

export const deleteClass = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    await ctx.db.delete(classId);
    return { success: true, id: classId };
  },
});

export const addStudentToClass = mutation({
  args: { classId: v.string(), studentId: v.string() },
  handler: async (ctx, { classId, studentId }) => {
    const cls = await ctx.db.query("classes").filter((q) => q.eq(q.field("_id"), classId as any)).first();
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
  args: { classId: v.string(), studentId: v.string() },
  handler: async (ctx, { classId, studentId }) => {
    const cls = await ctx.db.query("classes").filter((q) => q.eq(q.field("_id"), classId as any)).first();
    if (!cls) throw new Error("Class not found");
    const newStudents = (cls.studentIds || []).filter((s: string) => s !== studentId);
    await ctx.db.patch(cls._id, { studentIds: newStudents, updatedAt: Date.now() });
    return { id: classId, studentIds: newStudents };
  },
});

export const addAssignmentToClass = mutation({
  args: { classId: v.id("classes"), assignmentId: v.string() },
  handler: async (ctx, { classId, assignmentId }) => {
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    const existingAssignments = Array.isArray(cls.assignments) ? cls.assignments : [];
    if (existingAssignments.includes(assignmentId)) {
      return { id: classId, assignments: existingAssignments };
    }
    const newAssignments = [...existingAssignments, assignmentId];
    await ctx.db.patch(classId, { assignments: newAssignments, updatedAt: Date.now() });
    return { id: classId, assignments: newAssignments };
  },
});

export const removeAssignmentFromClass = mutation({
  args: { classId: v.id("classes"), assignmentId: v.string() },
  handler: async (ctx, { classId, assignmentId }) => {
    const cls = await ctx.db.get(classId);
    if (!cls) throw new Error("Class not found");
    const newAssignments = (cls.assignments || []).filter((a: string) => a !== assignmentId);
    await ctx.db.patch(classId, { assignments: newAssignments, updatedAt: Date.now() });
    return { id: classId, assignments: newAssignments };
  },
});
