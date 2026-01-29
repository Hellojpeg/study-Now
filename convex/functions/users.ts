import { mutation, query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Public: Returns sanitized user info (NO passwords)
export const getUserByEmail = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();
      
    if (!user) return null;

    // Sanitize: Return only non-sensitive fields
    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

// Internal: Returns full user object with password hash (for auth only)
export const getFullUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const cleanEmail = email.toLowerCase().trim();
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();
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
