import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	initialized: boolean;
	setUser: (user: User | null) => void;
	setSession: (session: Session | null) => void;
	setIsLoading: (isLoading: boolean) => void;
	setInitialized: (initialized: boolean) => void;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	session: null,
	isLoading: true,
	initialized: false,

	setUser: (user) => set({ user }),
	setSession: (session) => set({ session, user: session?.user ?? null }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setInitialized: (initialized) => set({ initialized }),

	signInWithGoogle: async () => {
		set({ isLoading: true });
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: window.location.origin,
					queryParams: {
						prompt: 'select_account',
					},
				},
			});
			if (error) throw error;
		} catch (error) {
			console.error('Failed to sign in with Google OAuth:', error);
			set({ isLoading: false });
		}
	},

	signOut: async () => {
		set({ isLoading: true });
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			set({ user: null, session: null });
		} catch (error) {
			console.error('Failed to sign out:', error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
