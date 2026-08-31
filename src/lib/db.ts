import { getSupabase } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Career Catalyst Unified Database Client
 * Powered by Supabase (PostgreSQL Cloud)
 */
export function getDb(): SupabaseClient {
  return getSupabase();
}

export { getSupabase };
export default getSupabase;
