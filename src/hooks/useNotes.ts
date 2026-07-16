import { useMutation, useQuery } from '@tanstack/react-query';
import type { $UUID } from 'locality-idb';
import { type JSX, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSorter } from '@/hooks/useSorter';
import { queryClient } from '@/lib/queryClient';
import { noteRepository } from '@/repositories/note.repository';
import { syncService } from '@/services/sync.service';
import type { Nullable } from '@/types/common.types';
import type { CreateNoteInput, EditNoteInput, Note } from '@/types/note.types';

// Strict Query Keys Factory for Note repository
export const noteKeys = {
	all: ['notes'] as const,
	lists: () => [...noteKeys.all, 'list'] as const,
	list: (sortField: string, sortOrder: string) => {
		return [...noteKeys.lists(), { sortField, sortOrder }] as const;
	},
	details: () => [...noteKeys.all, 'detail'] as const,
	detail: (id: $UUID) => [...noteKeys.details(), id] as const,
};

// Reusable Query Hook for a single note
export function useNoteQuery(id: $UUID | undefined) {
	return useQuery<Note, Error>({
		queryKey: id ? noteKeys.detail(id) : [],
		queryFn: async () => {
			if (!id) throw new Error('Note ID is required');
			return noteRepository.getById(id);
		},
		enabled: !!id,
	});
}

// Reusable Mutation Hook for creating a note
export function useCreateNoteMutation() {
	const { user } = useAuth();
	return useMutation<Nullable<Note>, Error, CreateNoteInput>({
		mutationFn: (input) => noteRepository.create(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after create note mutation:', err);
				}
			}
		},
	});
}

// Reusable Mutation Hook for updating a note
export function useUpdateNoteMutation() {
	const { user } = useAuth();
	return useMutation<void, Error, { id: $UUID; input: EditNoteInput }>({
		mutationFn: ({ id, input }) => noteRepository.update(id, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after update note mutation:', err);
				}
			}
		},
	});
}

// Reusable Mutation Hook for deleting a note
export function useDeleteNoteMutation() {
	const { user } = useAuth();
	return useMutation<void, Error, $UUID>({
		mutationFn: (id) => noteRepository.softDelete(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteKeys.all });
			if (window.navigator.onLine && user) {
				try {
					await syncService.sync();
				} catch (err) {
					console.warn('Sync failed after delete note mutation:', err);
				}
			}
		},
	});
}

interface UseNotesReturn {
	notes: Note[];
	isLoading: boolean;
	error: Nullable<string>;
	refresh: () => Promise<void>;
	createNote: (input: CreateNoteInput) => Promise<Nullable<Note>>;
	updateNote: (id: $UUID, input: EditNoteInput) => Promise<boolean>;
	deleteNote: (id: $UUID) => Promise<boolean>;
	noteSorter: JSX.Element;
}

export function useNotes(): UseNotesReturn {
	const [mutationError, setMutationError] = useState<Nullable<string>>(null);

	const { sortField, sortOrder, sorter } = useSorter({
		defaultField: 'title',
		defaultOrder: 'asc',
	});

	const {
		data: notes = [],
		isLoading,
		error: queryError,
		refetch,
	} = useQuery<Note[], Error>({
		queryKey: noteKeys.list(sortField, sortOrder),
		queryFn: () => noteRepository.getAll(sortField, sortOrder),
	});

	const refresh = useCallback(async () => {
		setMutationError(null);
		await refetch();
	}, [refetch]);

	const createNoteMutation = useCreateNoteMutation();
	const updateNoteMutation = useUpdateNoteMutation();
	const deleteNoteMutation = useDeleteNoteMutation();

	const createNote = useCallback(
		async (input: CreateNoteInput): Promise<Nullable<Note>> => {
			try {
				setMutationError(null);
				return await createNoteMutation.mutateAsync(input);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to create note';
				setMutationError(message);
				return null;
			}
		},
		[createNoteMutation]
	);

	const updateNote = useCallback(
		async (id: $UUID, input: EditNoteInput): Promise<boolean> => {
			try {
				setMutationError(null);
				await updateNoteMutation.mutateAsync({ id, input });
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to update note';
				setMutationError(message);
				return false;
			}
		},
		[updateNoteMutation]
	);

	const deleteNote = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				setMutationError(null);
				await deleteNoteMutation.mutateAsync(id);
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to delete note';
				setMutationError(message);
				return false;
			}
		},
		[deleteNoteMutation]
	);

	const error = queryError ? queryError.message : mutationError;

	return {
		notes,
		isLoading,
		error,
		refresh,
		createNote,
		updateNote,
		deleteNote,
		noteSorter: sorter,
	};
}
