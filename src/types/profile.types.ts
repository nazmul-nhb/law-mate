import type { User } from '@supabase/supabase-js';
import type { $UUID } from 'locality-idb';
import type { Nullable } from '@/types/common.types';

export type ProfileStatus = 'active' | 'blocked' | 'deleted';

export type Role = 'admin' | 'user';

/** User from Supabase `id` as UUID */
export interface AppUser extends Omit<User, 'id'> {
	id: $UUID;
}

export type Profile = {
	id: $UUID;
	email: string;
	full_name: Nullable<string>;
	avatar_url: Nullable<string>;
	role: Role;
	status: ProfileStatus;
	created_at: string;
};
