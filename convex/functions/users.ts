// convex/functions/users.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normEmail = email.toLowerCase();
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), normEmail))
      .first();
    return user;
  },
});

export const upsertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(), // 'STUDENT' | 'TEACHER'
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.any(), // Keeping loose for Date/number flexibility
    updatedAt: v.optional(v.any()), // Can be undefined
  },
  handler: async (ctx, args) => {
    const normEmail = args.email.toLowerCase();
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), normEmail))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        role: args.role,
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        updatedAt: args.updatedAt,
      });
      return { ...args, id: existing._id, updated: true };
    } else {
      const id = await ctx.db.insert("users", {
        name: args.name,
        email: normEmail,
        role: args.role,
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        createdAt: args.createdAt,
      });
      return { ...args, id, created: true };
    }
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.any(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      ...args,
      email: args.email.toLowerCase(),
    });
    return { id, ...args };
  },
});
