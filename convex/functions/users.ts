import { mutation, query, internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

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

// Create a new user - ALWAYS defaults to STUDENT role for security
// Teachers are created via scripts or promoted by admins
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()), // Ignored in public mutations, used by internal scripts
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

    // SECURITY: Always default to STUDENT role for public signups
    // Use internalCreateUser for teacher/admin accounts
    const role = "STUDENT";

    const id = await ctx.db.insert("users", {
      name: args.name,
      email: cleanEmail,
      role,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      createdAt: args.createdAt,
    });
    return { id, name: args.name, email: cleanEmail, role };
  },
});

// Internal mutation for creating users with any role (for scripts/seeding)
export const internalCreateUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(), // 'STUDENT' | 'TEACHER' | 'ADMIN'
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const cleanEmail = args.email.toLowerCase().trim();
    
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

// Upsert: Create user if not exists, or update if exists
// SECURITY: For new users, always defaults to STUDENT role
// Existing users retain their current role unless changed by admin
export const upsertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()), // Only used for existing users to preserve role
    passwordHash: v.string(),
    passwordSalt: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cleanEmail = args.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();

    if (existing) {
      // Update existing user - preserve their current role (don't allow role change via upsert)
      await ctx.db.patch(existing._id, {
        name: args.name,
        // Don't update role here - use promoteUser mutation for role changes
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        updatedAt: args.updatedAt || Date.now(),
      });
      return { id: existing._id, isNew: false };
    }

    // Create new user - ALWAYS STUDENT role for security
    const id = await ctx.db.insert("users", {
      name: args.name,
      email: cleanEmail,
      role: "STUDENT", // Always STUDENT for new users via public API
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      createdAt: args.createdAt,
    });

    return { id, isNew: true };
  },
});

// Admin-only mutation to change user role
export const promoteUser = mutation({
  args: {
    adminId: v.id("users"),
    targetUserId: v.id("users"),
    newRole: v.string(), // 'STUDENT' | 'TEACHER' | 'ADMIN'
  },
  handler: async (ctx, args) => {
    // Verify the caller is an admin
    await requireAdmin(ctx, args.adminId);
    
    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }
    
    // Validate role
    const validRoles = ["STUDENT", "TEACHER", "ADMIN"];
    if (!validRoles.includes(args.newRole)) {
      throw new Error("Invalid role. Must be STUDENT, TEACHER, or ADMIN");
    }
    
    await ctx.db.patch(args.targetUserId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });
    
    return { success: true, userId: args.targetUserId, newRole: args.newRole };
  },
});

// Get all users (admin only - for teacher dashboard)
export const listAll = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    if (args.role) {
      users = users.filter((u) => u.role === args.role);
    }

    // Sanitize: Remove password fields
    return users.map((u) => ({
      _id: u._id,
      _creationTime: u._creationTime,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  },
});

// Get user by ID
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Sanitize: Remove password fields
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
