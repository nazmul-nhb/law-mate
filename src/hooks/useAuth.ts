import { useCallback, useEffect, useState } from 'react';
import { googleClientId } from '@/constants/env';
import { idb } from '@/database/db';
import { supabase } from '@/lib/supabase';
import { invalidateLawsAndNotes, queryClient } from '@/lib/queryClient';
import { syncService } from '@/services/sync.service';
import { useAuthStore } from '@/stores/auth.store';
import type { AppUser } from '@/types/profile.types';

let isGsiInitialized = false;

export function useAuth() {
	const {
		user,
		profile,
		isLoading,
		initialized,
		signInWithGoogle,
		signOut,
		setUser,
		setProfile,
		setIsLoading,
		setInitialized,
	} = useAuthStore();
	const [isOnline, setIsOnline] = useState<boolean>(window.navigator.onLine);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const assureUserProfile = useCallback(
		async (u: AppUser) => {
			if (!window.navigator.onLine) return;

			try {
				const { data: prof } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', u.id)
					.maybeSingle();

				if (prof) {
					setProfile(prof);
				}

				// Adopt any local anonymous notes created while signed out
				const updatedNotes = await idb
					.update('notes')
					.set({ user_id: u.id })
					.where((n) => !n.user_id)
					.run();

				// Adopt any local anonymous laws created while signed out
				const updatedLaws = await idb
					.update('laws')
					.set({ user_id: u.id })
					.where((l) => !l.user_id)
					.run();

				const invalidations: Array<Promise<void>> = [];
				if (updatedNotes > 0) {
					invalidations.push(queryClient.invalidateQueries({ queryKey: ['notes'] }));
				}
				if (updatedLaws > 0) {
					invalidations.push(queryClient.invalidateQueries({ queryKey: ['laws'] }));
				}
				if (invalidations.length > 0) {
					await Promise.all(invalidations);
				}
			} catch (err) {
				console.error('Failed to assure user profile:', err);
			}
		},
		[setProfile]
	);

	useEffect(() => {
		// Initial session check
		if (isOnline) {
			supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
				if (initialSession?.user) {
					const appUser = initialSession.user as AppUser;
					setUser(appUser);
					await assureUserProfile(appUser);
					await syncService.sync();
					await invalidateLawsAndNotes();
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
		} = supabase.auth.onAuthStateChange(async (event, currentSession) => {
			if (currentSession?.user) {
				const appUser = currentSession.user as AppUser;
				setUser(appUser);
				await assureUserProfile(appUser);
				if (event === 'SIGNED_IN') {
					await syncService.sync();
					await invalidateLawsAndNotes();
				}
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
	}, [setUser, setProfile, setIsLoading, setInitialized, isOnline, assureUserProfile]);

	// Initialize Google One Tap if GIS SDK is loaded and client ID exists
	useEffect(() => {
		if (user || isLoading || !initialized || !googleClientId || !isOnline) return;

		// Skip automatic floating One Tap prompt on local development origins to prevent 403 unregistered origin logs
		const isLocalhost =
			window.location.hostname === 'localhost' ||
			window.location.hostname === '127.0.0.1';

		if (isLocalhost) return;

		const initializeOneTap = () => {
			if (!google?.accounts?.id || isGsiInitialized) return;
			isGsiInitialized = true;

			google.accounts.id.initialize({
				client_id: googleClientId,
				use_fedcm_for_prompt: true,
				callback: async (response) => {
					if (!response.credential || !isOnline) return;
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

			try {
				google.accounts.id.prompt();
			} catch (err) {
				console.warn('Google One Tap prompt error:', err);
			}
		};

		// Check if window.google is already loaded, otherwise wait
		if (google?.accounts?.id) {
			initializeOneTap();
		} else {
			const handleLoad = () => {
				initializeOneTap();
			};
			window.addEventListener('load', handleLoad);
			return () => window.removeEventListener('load', handleLoad);
		}
	}, [user, isLoading, initialized, isOnline, setIsLoading]);

	return {
		user,
		profile,
		isLoading,
		initialized,
		signInWithGoogle,
		signOut,
	};
}
