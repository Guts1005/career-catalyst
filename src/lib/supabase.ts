import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe DNS fallback for Node.js development environments
if (typeof window === 'undefined') {
  try {
    const dns = require('node:dns');
    if (typeof dns.setServers === 'function') {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    }
  } catch {
    // Ignore in edge or browser environments
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://uedfokzpsgajinewqyam.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZGZva3pwc2dhamluZXdxeWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzQzNzIsImV4cCI6MjEwMjY1MDM3Mn0.iBoEwRRuvRz-CsD5yBBHa7fZH289qfPHJHRjghpyDz8';

let supabaseClient: SupabaseClient | null = null;

// Fail-fast fetch for Public Demonstration Mode resilience
const timeoutFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

export function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: timeoutFetch,
    },
  });

  return supabaseClient;
}
