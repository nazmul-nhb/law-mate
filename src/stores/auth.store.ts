import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/profile.types';

interface AuthState {
	user: User | null;
	// session: Session | null;
	profile: Profile | null;
	isLoading: boolean;
	initialized: boolean;
	setUser: (user: User | null) => void;
	// setSession: (session: Session | null) => void;
	setProfile: (profile: Profile | null) => void;
	setIsLoading: (isLoading: boolean) => void;
	setInitialized: (initialized: boolean) => void;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
}

// type EncryptedValue = StorageValue<
// 	Pick<AuthState, 'user' | 'profile' | 'isLoading' | 'initialized'> & { session: string }
// >;

// type StoredValue = StorageValue<
// 	Pick<AuthState, 'user' | 'profile' | 'session' | 'isLoading' | 'initialized'>
// >;

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			// session: null,
			profile: null,
			isLoading: true,
			initialized: false,

			setUser: (user) => set({ user }),
			// setSession: (session) => set({ session, user: session?.user ?? null }),
			setProfile: (profile) => set({ profile }),
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
				} finally {
					set({ isLoading: false });
				}
			},

			signOut: async () => {
				set({ isLoading: true });
				try {
					const { error } = await supabase.auth.signOut();
					set({ user: null, profile: null });
					if (error) throw error;
				} catch (error) {
					console.error('Failed to sign out:', error);
				} finally {
					set({ isLoading: false });
				}
			},
		}),
		{
			name: 'law-mate-auth-store',
			partialize: ({ user, profile, initialized, isLoading }) => ({
				user,
				profile,
				initialized,
				isLoading,
			}),

			// storage: {
			// 	setItem(name, value) {
			// 		saveToLocalStorage(name, value, (state) => {
			// 			const stringifiedSession = JSON.stringify(state.state.session);
			// 			const session = cipher.encrypt(stringifiedSession);
			// 			const encryptedState: EncryptedValue = {
			// 				state: { ...state.state, session },
			// 			};
			// 			console.log(encryptedState);
			// 			return JSON.stringify(encryptedState);
			// 		});
			// 	},

			// 	getItem(name) {
			// 		return getFromLocalStorage<StoredValue>(name, (stored) => {
			// 			const parsedState = parseJSON<EncryptedValue>(stored, false);
			// 			const decryptedSession = cipher.decrypt(parsedState.state.session);
			// 			console.log(decryptedSession);
			// 			const session = parseJSON<Session>(decryptedSession, false);
			// 			return { state: { ...parsedState.state, session } };
			// 		});
			// 	},

			// 	removeItem(name) {
			// 		removeFromLocalStorage(name);
			// 	},
			// },
		}
	)
);
