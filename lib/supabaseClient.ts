import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Public Supabase credentials. Next.js inlines every `NEXT_PUBLIC_*` variable
 * from `.env.local` at build time, so both are safe to ship to the browser.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `false` until `.env.local` is filled in. Everything that talks to Supabase
 * checks this flag so the UI can keep working off the local fallback data.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn(
      "[supabase] Client could not be created. Falling back to local data.",
      error,
    );
    return null;
  }
}

/**
 * The single Supabase client shared by the whole app, or `null` when the
 * environment variables are missing.
 */
export const supabase = createSupabaseClient();
