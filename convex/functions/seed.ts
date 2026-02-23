"use node";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import crypto from "crypto";

// Seed a teacher account (admin script only)
export const seedTeacher = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normEmail = args.email.toLowerCase();
    const name = args.name || "Teacher";

    // Hash password
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.scryptSync(args.password, salt, 64).toString("hex");
    const now = Date.now();

    // Use internal mutation to bypass STUDENT-only restriction
    const result = await ctx.runMutation(internal.functions.users.internalCreateUser, {
      name,
      email: normEmail,
      role: "TEACHER",
      passwordHash,
      passwordSalt: salt,
      createdAt: now,
    });

    return result;
  },
});

export const seedCourses = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.functions.courses.seed, {});
  },
});
