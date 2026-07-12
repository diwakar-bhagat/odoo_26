import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import type { UserRole } from "@/lib/assetflow-schema";

/**
 * Get the current authenticated session on the server.
 * Returns null if the user is not signed in.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current user from the session.
 * Returns null if unauthenticated.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require a specific set of roles for an API route or server action.
 * Throws a Response-compatible object if unauthorized.
 *
 * Usage:
 *   const user = await requireRole(["Admin", "Asset Manager"]);
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return user;
}

/**
 * Check (without throwing) whether the user has one of the given roles.
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role as UserRole);
}
