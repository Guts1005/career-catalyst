import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns';

// Configure DNS fallback for environments with local router caching lag
try {
  const resolver = new dns.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in browser/edge environments
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://uedfokzpsgajinewqyam.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZGZva3pwc2dhamluZXdxeWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzQzNzIsImV4cCI6MjEwMjY1MDM3Mn0.iBoEwRRuvRz-CsD5yBBHa7fZH289qfPHJHRjghpyDz8';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}
