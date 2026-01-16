"use node";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import crypto from "crypto";

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
    const now = Date.now(); // Store as number for serialization safety

    // Call mutation
    const result = await ctx.runMutation(api.functions.users.upsertUser, {
      name,
      email: normEmail,
      role: "TEACHER",
      passwordHash,
      passwordSalt: salt,
      createdAt: now,
      updatedAt: now,
    });

    return result;
  },
});
