import { useCallback, useEffect, useState } from 'react';
import { noteRepository } from '@/repositories/note.repository';
import type { Note } from '@/types/note.types';

interface UseTrashReturn {
	deletedNotes: Note[];
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	restoreNote: (id: string) => Promise<boolean>;
	permanentDeleteNote: (id: string) => Promise<boolean>;
}

export function useTrash(): UseTrashReturn {
	const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			setError(null);
			const data = await noteRepository.getDeleted();
			setDeletedNotes(data);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load trash';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const restoreNote = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				await noteRepository.restore(id);
				await refresh();
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to restore note';
				setError(message);
				return false;
			}
		},
		[refresh]
	);

	const permanentDeleteNote = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				await noteRepository.permanentDelete(id);
				await refresh();
				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : 'Failed to permanently delete note';
				setError(message);
				return false;
			}
		},
		[refresh]
	);

	return { deletedNotes, isLoading, error, refresh, restoreNote, permanentDeleteNote };
}
