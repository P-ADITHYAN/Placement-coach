import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Privileged client that bypasses Row Level Security. Server-only: used for the
 * writes students may not make themselves (sessions, turns, reports). Always
 * scope queries to a user id that was verified with getClaims() first.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
