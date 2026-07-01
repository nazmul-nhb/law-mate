import type { Nullable } from '@/types/common.types';

export type ProfileStatus = 'active' | 'blocked' | 'deleted';

export type Role = 'admin' | 'user';

export type Profile = {
	id: string;
	email: string;
	full_name: Nullable<string>;
	avatar_url: Nullable<string>;
	role: Role;
	status: ProfileStatus;
	created_at: string;
};
