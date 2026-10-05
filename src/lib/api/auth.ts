import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * Authenticates a mobile/API request that carries a Supabase access token:
 *   Authorization: Bearer <access_token>
 * The token is validated with Supabase Auth (never decoded locally). Returns the verified user and
 * a client that acts AS that user, so Row Level Security applies to everything it does.
 */
export async function authenticateBearer(
  request: NextRequest,
): Promise<{ user: User; userClient: SupabaseClient } | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = /^Bearer\s+(.+)$/i.exec(header)?.[1]?.trim();
  if (!token) return null;

  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser(token);
  if (error || !user) return null;
  return { user, userClient };
}
