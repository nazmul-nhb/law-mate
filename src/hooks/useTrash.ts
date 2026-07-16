import { useMutation, useQuery } from '@tanstack/react-query';
import type { $UUID } from 'locality-idb';
import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { lawKeys } from '@/hooks/useLaws';
import { noteKeys } from '@/hooks/useNotes';
import { queryClient } from '@/lib/queryClient';
import { lawRepository } from '@/repositories/law.repository';
import { noteRepository } from '@/repositories/note.repository';
import { syncService } from '@/services/sync.service';
import type { Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

interface UseTrashReturn {
	deletedNotes: Note[];
	deletedLaws: Law[];
	isLoading: boolean;
	error: Nullable<string>;
	refresh: () => Promise<void>;
	restoreNote: (id: $UUID) => Promise<boolean>;
	permanentDeleteNote: (id: $UUID) => Promise<boolean>;
	restoreLaw: (id: $UUID) => Promise<boolean>;
	permanentDeleteLaw: (id: $UUID) => Promise<boolean>;
}

export function useTrash(): UseTrashReturn {
	const [mutationError, setMutationError] = useState<Nullable<string>>(null);
	const { user } = useAuth();

	// Fetch deleted notes query
	const {
		data: deletedNotes = [],
		isLoading: isNotesLoading,
		error: notesError,
		refetch: refetchNotes,
	} = useQuery<Note[], Error>({
		queryKey: [...noteKeys.all, 'deleted'] as const,
		queryFn: () => noteRepository.getDeleted(),
	});

	// Fetch deleted laws query
	const {
		data: deletedLaws = [],
		isLoading: isLawsLoading,
		error: lawsError,
		refetch: refetchLaws,
	} = useQuery<Law[], Error>({
		queryKey: [...lawKeys.all, 'deleted'] as const,
		queryFn: () => lawRepository.getDeleted(),
	});

	const isLoading = isNotesLoading || isLawsLoading;
	const queryError = notesError || lawsError;

	const refresh = useCallback(async () => {
		setMutationError(null);
		await Promise.all([refetchNotes(), refetchLaws()]);
	}, [refetchNotes, refetchLaws]);

	// Mutation: Restore Note
	const restoreNoteMutation = useMutation<void, Error, $UUID>({
		mutationFn: (id) => noteRepository.restore(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after restore note mutation:', err);
				}
			}
		},
	});

	// Mutation: Permanent Delete Note
	const permanentDeleteNoteMutation = useMutation<void, Error, $UUID>({
		mutationFn: (id) => noteRepository.permanentDelete(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after permanent delete note mutation:', err);
				}
			}
		},
	});

	// Mutation: Restore Law
	const restoreLawMutation = useMutation<void, Error, $UUID>({
		mutationFn: (id) => lawRepository.restore(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: lawKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after restore law mutation:', err);
				}
			}
		},
	});

	// Mutation: Permanent Delete Law
	const permanentDeleteLawMutation = useMutation<void, Error, $UUID>({
		mutationFn: (id) => lawRepository.permanentDelete(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: lawKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after permanent delete law mutation:', err);
				}
			}
		},
	});

	const restoreNote = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				setMutationError(null);
				await restoreNoteMutation.mutateAsync(id);
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to restore note';
				setMutationError(message);
				return false;
			}
		},
		[restoreNoteMutation]
	);

	const permanentDeleteNote = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				setMutationError(null);
				await permanentDeleteNoteMutation.mutateAsync(id);
				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : 'Failed to permanently delete note';
				setMutationError(message);
				return false;
			}
		},
		[permanentDeleteNoteMutation]
	);

	const restoreLaw = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				setMutationError(null);
				await restoreLawMutation.mutateAsync(id);
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to restore law';
				setMutationError(message);
				return false;
			}
		},
		[restoreLawMutation]
	);

	const permanentDeleteLaw = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				setMutationError(null);
				await permanentDeleteLawMutation.mutateAsync(id);
				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : 'Failed to permanently delete law';
				setMutationError(message);
				return false;
			}
		},
		[permanentDeleteLawMutation]
	);

	const error = queryError ? queryError.message : mutationError;

	return {
		deletedNotes,
		deletedLaws,
		isLoading,
		error,
		refresh,
		restoreNote,
		permanentDeleteNote,
		restoreLaw,
		permanentDeleteLaw,
	};
}
