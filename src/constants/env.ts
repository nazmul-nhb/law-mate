import type { Maybe } from 'toolbox-x/types';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as Maybe<string>;
export const cipherKey = import.meta.env.VITE_CIPHER_KEY as string;
