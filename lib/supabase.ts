import { createClient } from "@supabase/supabase-js";
import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import { type Database } from "../types/database.types";

// Create a Supabase client for use on the server side with service role
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
};

// Create a Supabase client for the browser using the anon key
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: 'skilllink-auth',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null
          return window.localStorage.getItem(key)
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') window.localStorage.removeItem(key)
        },
      },
    },
  });
};

// Default export for convenience - using the browser client
export const supabase = createBrowserSupabaseClient();

// Note: Server component client has been moved to a separate file
// to avoid importing server-only modules in client contexts
