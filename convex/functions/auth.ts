"use node";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import crypto from "crypto";

export const signIn = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.runQuery(api.functions.users.getUserByEmail, { email });
    if (!user) {
      throw new Error("User not found");
    }

    const derived = crypto.scryptSync(password, user.passwordSalt, 64).toString("hex");
    if (derived !== user.passwordHash) {
      throw new Error("Invalid password");
    }

    return user;
  },
});

export const signUp = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.string()), // 'STUDENT' default handled by caller logic or default arg
  },
  handler: async (ctx, args) => {
    const role = args.role || "STUDENT";
    
    // Check existing
    const existing = await ctx.runQuery(api.functions.users.getUserByEmail, { email: args.email });
    if (existing) {
      throw new Error("Email already in use");
    }

    // Hash
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.scryptSync(args.password, salt, 64).toString("hex");
    const now = Date.now();

    const result = await ctx.runMutation(api.functions.users.createUser, {
      name: args.name,
      email: args.email,
      role,
      passwordHash,
      passwordSalt: salt,
      createdAt: now,
    });

    return { 
        id: result.id, 
        name: args.name, 
        email: args.email, 
        role,
        // Don't return secrets
    };
  },
});
