import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const cleanEmail = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();
    return user;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(), // 'STUDENT' | 'TEACHER'
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const cleanEmail = args.email.toLowerCase().trim();
    
    // Double check uniqueness (though auth action usually handles this check)
    const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", cleanEmail))
        .first();
        
    if (existing) {
        throw new Error("User with this email already exists");
    }

    const id = await ctx.db.insert("users", {
      name: args.name,
      email: cleanEmail,
      role: args.role,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      createdAt: args.createdAt,
    });
    return { id, ...args };
  },
});

export const updateUserTime = mutation({
    args: { id: v.id("users"), updatedAt: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { updatedAt: args.updatedAt });
    }
});
