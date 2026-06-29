import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
	const {
		user,
		session,
		isLoading,
		initialized,
		setSession,
		setIsLoading,
		setInitialized,
		signInWithGoogle,
		signOut,
	} = useAuthStore();

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
			setSession(initialSession);
			setIsLoading(false);
			setInitialized(true);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, currentSession) => {
			setSession(currentSession);
			setIsLoading(false);
			setInitialized(true);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setSession, setIsLoading, setInitialized]);

	// Initialize Google One Tap if GIS SDK is loaded and client ID exists
	useEffect(() => {
		if (isLoading || !initialized || user) return;

		const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
		if (!googleClientId) {
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
	}, [user, isLoading, initialized, setIsLoading]);

	return {
		user,
		session,
		isLoading,
		initialized,
		signInWithGoogle,
		signOut,
	};
}
