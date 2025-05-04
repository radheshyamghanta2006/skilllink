import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
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

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => {
          if (typeof document === 'undefined') return [];
          const pairs = document.cookie.split(';');
          return pairs.map(pair => {
            const [key, value] = pair.split('=');
            return {
              name: key.trim(),
              value: decodeURIComponent(value),
            };
          });
        },
        setAll: (cookieStrings) => {
          if (typeof document === 'undefined') return;
          cookieStrings.forEach(({ name, value, ...options }) => {
            let cookieString = `${name}=${encodeURIComponent(value)}`;
            if (options.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`;
            }
            if (options.domain) {
              cookieString += `; Domain=${options.domain}`;
            }
            if (options.path) {
              cookieString += `; Path=${options.path}`;
            }
            if (options.expires) {
              cookieString += `; Expires=${options.expires.toUTCString()}`;
            }
            if (options.httpOnly) {
              cookieString += '; HttpOnly';
            }
            if (options.secure) {
              cookieString += '; Secure';
            }
            if (options.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`;
            }
            document.cookie = cookieString;
          });
        },
        // Also include get, set and remove for backward compatibility
        get(name) {
          if (typeof document === 'undefined') return '';
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : '';
        },
        set(name, value, options) {
          if (typeof document === 'undefined') return;
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`;
          }
          if (options.domain) {
            cookieString += `; Domain=${options.domain}`;
          }
          if (options.path) {
            cookieString += `; Path=${options.path}`;
          }
          if (options.expires) {
            cookieString += `; Expires=${options.expires.toUTCString()}`;
          }
          if (options.httpOnly) {
            cookieString += '; HttpOnly';
          }
          if (options.secure) {
            cookieString += '; Secure';
          }
          if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`;
          }
          document.cookie = cookieString;
        },
        remove(name, options) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; Max-Age=0; ${options?.path ? `Path=${options.path};` : ''}`;
        }
      },
      auth: {
        persistSession: true,
        storageKey: 'skilllink-auth',
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null;
            return window.localStorage.getItem(key);
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') window.localStorage.removeItem(key);
          },
        },
      },
    }
  );
};

// Default export for convenience - using the browser client
export const supabase = createBrowserSupabaseClient();

// Note: Server component client has been moved to a separate file
// to avoid importing server-only modules in client contexts
