import { getSupabase } from './supabase';

/**
 * Career Catalyst Unified Database Client
 * Powered by Supabase (PostgreSQL Cloud)
 */
export function getDb() {
  return getSupabase();
}

export { getSupabase };
export default getSupabase;
