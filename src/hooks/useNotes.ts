import type { $UUID } from 'locality-idb';
import { useCallback, useEffect, useState } from 'react';
import { noteRepository } from '@/repositories/note.repository';
import { syncService } from '@/services/sync.service';
import type { CreateNoteInput, EditNoteInput, Note } from '@/types/note.types';

interface UseNotesReturn {
	notes: Note[];
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	createNote: (input: CreateNoteInput) => Promise<Note | null>;
	updateNote: (id: $UUID, input: EditNoteInput) => Promise<boolean>;
	deleteNote: (id: $UUID) => Promise<boolean>;
}

export function useNotes(): UseNotesReturn {
	const [notes, setNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		try {
			setError(null);
			const data = await noteRepository.getAll();
			setNotes(data);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load notes';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
		window.addEventListener('note-updated', refresh);
		return () => {
			window.removeEventListener('note-updated', refresh);
		};
	}, [refresh]);

	const createNote = useCallback(
		async (input: CreateNoteInput): Promise<Note | null> => {
			try {
				const note = await noteRepository.create(input);
				await refresh();
				syncService.sync();
				return note;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to create note';
				setError(message);
				return null;
			}
		},
		[refresh]
	);

	const updateNote = useCallback(
		async (id: $UUID, input: EditNoteInput): Promise<boolean> => {
			try {
				await noteRepository.update(id, input);
				await refresh();
				syncService.sync();
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to update note';
				setError(message);
				return false;
			}
		},
		[refresh]
	);

	const deleteNote = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				await noteRepository.softDelete(id);
				await refresh();
				syncService.sync();
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to delete note';
				setError(message);
				return false;
			}
		},
		[refresh]
	);

	return { notes, isLoading, error, refresh, createNote, updateNote, deleteNote };
}
