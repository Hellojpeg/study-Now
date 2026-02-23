import { Doc, Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

// ============== Authorization Helpers ==============
// These helpers validate user identity and permissions server-side.
// Use them at the start of any mutation that modifies data.

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthenticatedUser {
  _id: Id<"users">;
  name: string;
  email: string;
  role: string;
}

/**
 * Validates that the provided userId exists and returns the user.
 * Throws if user not found.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users"> | undefined | null
): Promise<AuthenticatedUser> {
  if (!userId) {
    throw new Error("Authentication required: No user ID provided");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("Authentication failed: User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Validates that the user exists AND has TEACHER or ADMIN role.
 * Use for mutations that only teachers should access.
 */
export async function requireTeacher(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users"> | undefined | null
): Promise<AuthenticatedUser> {
  const user = await requireAuth(ctx, userId);
  
  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    throw new Error("Authorization failed: Teacher role required");
  }

  return user;
}

/**
 * Validates that the user exists AND has ADMIN role.
 * Use for sensitive system mutations.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users"> | undefined | null
): Promise<AuthenticatedUser> {
  const user = await requireAuth(ctx, userId);
  
  if (user.role !== "ADMIN") {
    throw new Error("Authorization failed: Admin role required");
  }

  return user;
}

/**
 * Validates that the authenticated user owns the resource or is an admin.
 * Use for operations where users can only modify their own resources.
 */
export async function requireOwnership(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users"> | undefined | null,
  resourceOwnerId: Id<"users"> | undefined | null
): Promise<AuthenticatedUser> {
  const user = await requireAuth(ctx, userId);
  
  if (user.role !== "ADMIN" && user._id !== resourceOwnerId) {
    throw new Error("Authorization failed: You don't have permission to modify this resource");
  }

  return user;
}
