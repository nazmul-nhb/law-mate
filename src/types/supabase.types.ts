import type { PropertyRequired } from 'toolbox-x/types/utils';
import type { InsertNote, Note, UpdateNote } from '@/types/note.types';
import type { Profile } from '@/types/profile.types';

export type Database = {
	public: {
		Tables: {
			notes: {
				Row: Note;
				Insert: InsertNote;
				Update: UpdateNote;
				Relationships: [];
			};
			profiles: {
				Row: Profile;
				Insert: PropertyRequired<Partial<Profile>, 'id' | 'email'>;
				Update: Partial<Omit<Profile, 'id' | 'email'>>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
