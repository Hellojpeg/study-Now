import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ==================== PACKAGE QUERIES ====================

export const listPackagesForTeacher = query({
  args: { teacherId: v.string() },
  handler: async (ctx, { teacherId }) => {
    return await ctx.db
      .query("scorm_packages")
      .filter((q) => q.eq(q.field("teacherId"), teacherId))
      .collect();
  },
});

export const getPackage = query({
  args: { packageId: v.id("scorm_packages") },
  handler: async (ctx, { packageId }) => {
    return await ctx.db.get(packageId);
  },
});

export const listPackagesForClass = query({
  args: { classId: v.string() },
  handler: async (ctx, { classId }) => {
    const all = await ctx.db.query("scorm_packages").collect();
    return all.filter((pkg) => pkg.classIds.includes(classId));
  },
});

export const listPackagesForStudent = query({
  args: { studentId: v.string() },
  handler: async (ctx, { studentId }) => {
    // Get all classes the student is in
    const allClasses = await ctx.db.query("classes").collect();
    const studentClassIds = allClasses
      .filter((cls) => cls.studentIds.includes(studentId))
      .map((cls) => cls._id as string);

    // Get all packages assigned to those classes
    const allPackages = await ctx.db.query("scorm_packages").collect();
    return allPackages.filter((pkg) =>
      pkg.classIds.some((cid) => studentClassIds.includes(cid))
    );
  },
});

// ==================== PACKAGE MUTATIONS ====================

export const createPackage = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    teacherId: v.string(),
    filename: v.string(),
    storagePath: v.string(),
    manifestUrl: v.string(),
    metadata: v.optional(
      v.object({
        entryPoint: v.optional(v.string()),
        masteryScore: v.optional(v.number()),
        maxTimeAllowed: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("scorm_packages", {
      ...args,
      classIds: [],
      createdAt: Date.now(),
    });
    return { id, ...args };
  },
});

export const updatePackage = mutation({
  args: {
    packageId: v.id("scorm_packages"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    classIds: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        entryPoint: v.optional(v.string()),
        masteryScore: v.optional(v.number()),
        maxTimeAllowed: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { packageId, ...updates }) => {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) throw new Error("Package not found");

    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.classIds !== undefined) patch.classIds = updates.classIds;
    if (updates.metadata !== undefined) patch.metadata = updates.metadata;

    await ctx.db.patch(packageId, patch);
    return { id: packageId, ...patch };
  },
});

export const deletePackage = mutation({
  args: { packageId: v.id("scorm_packages") },
  handler: async (ctx, { packageId }) => {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) throw new Error("Package not found");

    // Also delete all attempts for this package
    const attempts = await ctx.db
      .query("scorm_attempts")
      .filter((q) => q.eq(q.field("packageId"), packageId as string))
      .collect();
    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    await ctx.db.delete(packageId);
    return { success: true, id: packageId };
  },
});

export const assignPackageToClasses = mutation({
  args: {
    packageId: v.id("scorm_packages"),
    classIds: v.array(v.string()),
  },
  handler: async (ctx, { packageId, classIds }) => {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) throw new Error("Package not found");

    await ctx.db.patch(packageId, {
      classIds,
      updatedAt: Date.now(),
    });
    return { id: packageId, classIds };
  },
});

// ==================== ATTEMPT QUERIES ====================

export const getAttempt = query({
  args: { attemptId: v.id("scorm_attempts") },
  handler: async (ctx, { attemptId }) => {
    return await ctx.db.get(attemptId);
  },
});

export const getAttemptForPackageStudent = query({
  args: { packageId: v.string(), studentId: v.string() },
  handler: async (ctx, { packageId, studentId }) => {
    return await ctx.db
      .query("scorm_attempts")
      .filter((q) =>
        q.and(
          q.eq(q.field("packageId"), packageId),
          q.eq(q.field("studentId"), studentId)
        )
      )
      .first();
  },
});

export const listAttemptsForPackage = query({
  args: { packageId: v.string() },
  handler: async (ctx, { packageId }) => {
    return await ctx.db
      .query("scorm_attempts")
      .filter((q) => q.eq(q.field("packageId"), packageId))
      .collect();
  },
});

export const listAttemptsForStudent = query({
  args: { studentId: v.string() },
  handler: async (ctx, { studentId }) => {
    return await ctx.db
      .query("scorm_attempts")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();
  },
});

// ==================== ATTEMPT MUTATIONS ====================

export const createOrUpdateAttempt = mutation({
  args: {
    packageId: v.string(),
    studentId: v.string(),
    classId: v.optional(v.string()),
    cmiData: v.object({
      coreStudentId: v.optional(v.string()),
      coreStudentName: v.optional(v.string()),
      coreLessonLocation: v.optional(v.string()),
      coreLessonStatus: v.optional(v.string()),
      coreScoreRaw: v.optional(v.number()),
      coreScoreMin: v.optional(v.number()),
      coreScoreMax: v.optional(v.number()),
      coreTotalTime: v.optional(v.string()),
      coreSessionTime: v.optional(v.string()),
      coreExit: v.optional(v.string()),
      coreEntry: v.optional(v.string()),
      suspendData: v.optional(v.string()),
      launchData: v.optional(v.string()),
      comments: v.optional(v.string()),
      objectives: v.optional(v.string()),
      interactions: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { packageId, studentId, classId, cmiData }) => {
    // Check for existing attempt
    const existing = await ctx.db
      .query("scorm_attempts")
      .filter((q) =>
        q.and(
          q.eq(q.field("packageId"), packageId),
          q.eq(q.field("studentId"), studentId)
        )
      )
      .first();

    const now = Date.now();
    const isCompleted =
      cmiData.coreLessonStatus === "completed" ||
      cmiData.coreLessonStatus === "passed";

    if (existing) {
      // Update existing attempt
      await ctx.db.patch(existing._id, {
        cmiData,
        lastAccessedAt: now,
        ...(isCompleted && !existing.completedAt ? { completedAt: now } : {}),
      });
      return { id: existing._id, updated: true };
    } else {
      // Create new attempt
      const id = await ctx.db.insert("scorm_attempts", {
        packageId,
        studentId,
        classId,
        cmiData,
        startedAt: now,
        lastAccessedAt: now,
        ...(isCompleted ? { completedAt: now } : {}),
      });
      return { id, updated: false };
    }
  },
});

export const deleteAttempt = mutation({
  args: { attemptId: v.id("scorm_attempts") },
  handler: async (ctx, { attemptId }) => {
    const attempt = await ctx.db.get(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    await ctx.db.delete(attemptId);
    return { success: true, id: attemptId };
  },
});

// ==================== REPORTING QUERIES ====================

export const getPackageReport = query({
  args: { packageId: v.optional(v.string()) },
  handler: async (ctx, { packageId }) => {
    if (!packageId) return [];
    const attempts = await ctx.db
      .query("scorm_attempts")
      .filter((q) => q.eq(q.field("packageId"), packageId))
      .collect();

    const studentIds = [...new Set(attempts.map((a) => a.studentId))];
    const students = await Promise.all(
      studentIds.map((id) => ctx.db.get(id as any))
    );
    const studentMap = new Map(
      students.filter(Boolean).map((s: any) => [s._id, s])
    );

    return attempts.map((a) => {
      const student = studentMap.get(a.studentId as any);
      return {
        attemptId: a._id,
        studentId: a.studentId,
        studentName: (student as any)?.name || "Unknown",
        studentEmail: (student as any)?.email || "",
        status: a.cmiData.coreLessonStatus || "not attempted",
        score: a.cmiData.coreScoreRaw,
        totalTime: a.cmiData.coreTotalTime,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        lastAccessedAt: a.lastAccessedAt,
      };
    });
  },
});

export const getStudentProgress = query({
  args: { studentId: v.string() },
  handler: async (ctx, { studentId }) => {
    const attempts = await ctx.db
      .query("scorm_attempts")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();

    const packageIds = [...new Set(attempts.map((a) => a.packageId))];
    const packages = await Promise.all(
      packageIds.map((id) => ctx.db.get(id as any))
    );
    const packageMap = new Map(
      packages.filter(Boolean).map((p: any) => [p._id, p])
    );

    return attempts.map((a) => {
      const pkg = packageMap.get(a.packageId as any);
      return {
        attemptId: a._id,
        packageId: a.packageId,
        packageTitle: (pkg as any)?.title || "Unknown",
        status: a.cmiData.coreLessonStatus || "not attempted",
        score: a.cmiData.coreScoreRaw,
        totalTime: a.cmiData.coreTotalTime,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        lastAccessedAt: a.lastAccessedAt,
      };
    });
  },
});
