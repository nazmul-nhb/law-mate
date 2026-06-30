import { createClient } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '@/constants/env';
import type { Database } from '@/types/supabase.types';

if (!supabaseUrl || !supabaseKey) {
	console.warn('Supabase URL or Key is missing. Cloud sync and auth will not function.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
