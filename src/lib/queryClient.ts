import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes cache validity
			gcTime: 1000 * 60 * 30, // Garbage collection time of 30 minutes
			refetchOnWindowFocus: false, // Disable refetch on window focus to save local DB cycles
			refetchOnReconnect: false,
			retry: false, // Local repository actions don't benefit from network retries
		},
	},
});

export async function invalidateLawsAndNotes() {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: ['laws'] }),
		queryClient.invalidateQueries({ queryKey: ['notes'] }),
	]);
}
