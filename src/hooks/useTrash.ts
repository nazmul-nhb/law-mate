import type { $UUID } from 'locality-idb';
import { useCallback, useEffect, useState } from 'react';
import { CUSTOM_EVENTS } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
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
	const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
	const [deletedLaws, setDeletedLaws] = useState<Law[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Nullable<string>>(null);
	const { user } = useAuth();

	const refresh = useCallback(async () => {
		try {
			setError(null);
			const [notesData, lawsData] = await Promise.all([
				noteRepository.getDeleted(),
				lawRepository.getDeleted(),
			]);
			setDeletedNotes(notesData);
			setDeletedLaws(lawsData);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load trash';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
		window.addEventListener(CUSTOM_EVENTS.NOTES_UPDATED, refresh);
		window.addEventListener(CUSTOM_EVENTS.LAWS_UPDATED, refresh);
		return () => {
			window.removeEventListener(CUSTOM_EVENTS.NOTES_UPDATED, refresh);
			window.removeEventListener(CUSTOM_EVENTS.LAWS_UPDATED, refresh);
		};
	}, [refresh]);

	const isSyncable = window.navigator.onLine && !!user;

	const restoreNote = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				await noteRepository.restore(id);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to restore note';
				setError(message);
				return false;
			}
		},
		[refresh, isSyncable]
	);

	const permanentDeleteNote = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				await noteRepository.permanentDelete(id);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : 'Failed to permanently delete note';
				setError(message);
				return false;
			}
		},
		[refresh, isSyncable]
	);

	const restoreLaw = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				await lawRepository.restore(id);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to restore law';
				setError(message);
				return false;
			}
		},
		[refresh, isSyncable]
	);

	const permanentDeleteLaw = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				await lawRepository.permanentDelete(id);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return true;
			} catch (err) {
				const message =
					err instanceof Error ? err.message : 'Failed to permanently delete law';
				setError(message);
				return false;
			}
		},
		[refresh, isSyncable]
	);

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
