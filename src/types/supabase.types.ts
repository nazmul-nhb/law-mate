export type Database = {
	public: {
		Tables: {
			notes: {
				Row: {
					id: string;
					user_id: string | null;
					title: string;
					description: string;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
					last_synced_at: string | null;
					version: number;
				};
				Insert: Partial<Database['public']['Tables']['notes']['Row']> & {
					id: string;
					title: string;
				};
				Update: Partial<Database['public']['Tables']['notes']['Row']>;
				Relationships: [];
			};
			profiles: {
				Row: {
					id: string;
					email: string;
					full_name: string | null;
					avatar_url: string | null;
					role: 'admin' | 'user';
					status: 'active' | 'blocked' | 'deleted';
					created_at: string;
				};
				Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
					id: string;
					email: string;
				};
				Update: Partial<Database['public']['Tables']['profiles']['Row']>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
