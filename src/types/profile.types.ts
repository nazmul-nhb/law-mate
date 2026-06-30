export type ProfileStatus = 'active' | 'blocked' | 'deleted';

export type Role = 'admin' | 'user';

export type Profile = {
	id: string;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
	role: Role;
	status: ProfileStatus;
	created_at: string;
};
