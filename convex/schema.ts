import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // 'STUDENT' | 'TEACHER'
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Classes table to store class metadata and roster (student ids)
  classes: defineTable({
    name: v.string(),
    section: v.string(),
    code: v.string(),
    teacherId: v.string(),
    studentIds: v.array(v.string()),
    assignments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_code", ["code"]),

  // SCORM packages uploaded by teachers
  scorm_packages: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    version: v.string(), // '1.2' | '2004'
    teacherId: v.string(),
    classIds: v.array(v.string()), // assigned to these classes
    filename: v.string(),
    storagePath: v.string(), // path on server where package is extracted
    manifestUrl: v.string(), // URL to launch the package
    metadata: v.optional(v.object({
      entryPoint: v.optional(v.string()),
      masteryScore: v.optional(v.number()),
      maxTimeAllowed: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"]),

  // SCORM attempt tracking for each student
  scorm_attempts: defineTable({
    packageId: v.string(),
    studentId: v.string(),
    classId: v.optional(v.string()),
    // SCORM 1.2 CMI data
    cmiData: v.object({
      coreStudentId: v.optional(v.string()),
      coreStudentName: v.optional(v.string()),
      coreLessonLocation: v.optional(v.string()),
      coreLessonStatus: v.optional(v.string()), // 'not attempted' | 'incomplete' | 'completed' | 'passed' | 'failed' | 'browsed'
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
      objectives: v.optional(v.string()), // JSON string of objectives array
      interactions: v.optional(v.string()), // JSON string of interactions array
    }),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    lastAccessedAt: v.number(),
  })
    .index("by_package", ["packageId"])
    .index("by_student", ["studentId"])
    .index("by_package_student", ["packageId", "studentId"]),
});
