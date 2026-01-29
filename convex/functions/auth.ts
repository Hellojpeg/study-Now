"use node";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import crypto from "crypto";

export const signIn = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    // Fetch user by email (using internal query to get password fields)
    const user = await ctx.runQuery(internal.functions.users.getFullUserByEmail, { 
        email: email.toLowerCase().trim() 
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    try {
        const derived = crypto.scryptSync(password, user.passwordSalt, 64).toString("hex");
        if (derived !== user.passwordHash) {
          throw new Error("Invalid credentials");
        }
    } catch (e) {
        throw new Error("Authentication failed");
    }
    
    return user;
  },
});

export const signUp = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.string()), 
  },
  handler: async (ctx, args) => {
    const role = args.role || "STUDENT";
    const cleanEmail = args.email.toLowerCase().trim();
    
    // Check if user exists (can use public query for existence check)
    const existing = await ctx.runQuery(internal.functions.users.getFullUserByEmail, { email: cleanEmail });
    if (existing) {
      throw new Error("Email already in use");
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.scryptSync(args.password, salt, 64).toString("hex");
    const now = Date.now();

    // Create user
    const result = await ctx.runMutation(api.functions.users.createUser, {
      name: args.name,
      email: cleanEmail,
      role,
      passwordHash,
      passwordSalt: salt,
      createdAt: now,
    });

    return { 
        id: result.id, 
        name: args.name, 
        email: cleanEmail, 
        role,
        createdAt: now,
    };
  },
});
