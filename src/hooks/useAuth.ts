import type { User } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { googleClientId } from '@/constants/env';
import { idb } from '@/database/db';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
	const { user, isLoading, initialized, signInWithGoogle, signOut } = useAuthStore();

	return {
		user,
		isLoading,
		initialized,
		signInWithGoogle,
		signOut,
	};
}

export function useAuthInit() {
	const { user, isLoading, initialized, setUser, setProfile, setIsLoading, setInitialized } =
		useAuthStore();

	const isOnline = window.navigator.onLine;

	useEffect(() => {
		const assureUserProfile = async (u: User) => {
			if (!u) return;

			// Do not Assure Profile if offline
			if (!isOnline) {
				console.info('Offline: Skipping profile assurance check.');
				return;
			}

			try {
				const { data: existingProfile, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', u.id)
					.maybeSingle();

				let finalProfile = existingProfile;

				if (!existingProfile && !error) {
					const { data: newProfile, error: insertError } = await supabase
						.from('profiles')
						.insert({
							id: u.id,
							email: u.email || '',
							full_name:
								u.user_metadata?.full_name || u.user_metadata?.name || '',
							avatar_url:
								u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
							role: 'user',
							status: 'active',
						})
						.select('*')
						.single();

					if (!insertError) {
						finalProfile = newProfile;
					}
				}

				if (finalProfile) {
					setProfile(finalProfile);
					setUser(u);
				}

				// Adopt any local anonymous notes created while signed out
				const updated = await idb
					.update('notes')
					.set({ user_id: u.id })
					.where((n) => !n.user_id)
					.run();

				if (updated > 0) {
					window.dispatchEvent(new Event('note-updated'));
				}
			} catch (err) {
				console.error('Failed to assure user profile:', err);
			}
		};

		// Get initial session if online
		if (isOnline) {
			supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
				if (initialSession?.user) {
					await assureUserProfile(initialSession.user);
				} else {
					setProfile(null);
					setUser(null);
				}
				setIsLoading(false);
				setInitialized(true);
			});
		} else {
			setIsLoading(false);
			setInitialized(true);
		}

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
			if (currentSession?.user) {
				await assureUserProfile(currentSession.user);
			} else {
				setProfile(null);
				setUser(null);
			}
			setIsLoading(false);
			setInitialized(true);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setProfile, setUser, setIsLoading, setInitialized, isOnline]);

	// Initialize Google One Tap if GIS SDK is loaded and client ID exists
	useEffect(() => {
		if (isLoading || !initialized || user) return;

		if (!googleClientId) {
			return;
		}

		// No network request when offline
		if (!isOnline) {
			return;
		}

		const initializeOneTap = () => {
			// @ts-ignore
			const google = window.google;
			if (!google?.accounts?.id) return;

			google.accounts.id.initialize({
				client_id: googleClientId,
				callback: async (response: { credential?: string }) => {
					if (!response.credential) return;
					if (!isOnline) return; // check connection before API calls
					setIsLoading(true);
					try {
						const { error } = await supabase.auth.signInWithIdToken({
							provider: 'google',
							token: response.credential,
						});
						if (error) throw error;
					} catch (err) {
						console.error('Google One Tap sign in failed:', err);
					} finally {
						setIsLoading(false);
					}
				},
				auto_select: false,
				cancel_on_tap_outside: true,
			});

			google.accounts.id.prompt();
		};

		// Check if window.google is already loaded, otherwise wait
		// @ts-ignore
		if (window.google?.accounts?.id) {
			initializeOneTap();
		} else {
			const handleLoad = () => {
				initializeOneTap();
			};
			window.addEventListener('load', handleLoad);
			return () => window.removeEventListener('load', handleLoad);
		}
	}, [user, isLoading, initialized, isOnline, setIsLoading]);
}
