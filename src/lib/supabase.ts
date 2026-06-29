import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
	console.warn('Supabase URL or Key is missing. Cloud sync and auth will not function.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
