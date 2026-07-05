import type { $UUID } from 'locality-idb';
import { type JSX, useCallback, useEffect, useState } from 'react';
import { CUSTOM_EVENTS } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { useSorter } from '@/hooks/useSorter';
import { lawRepository } from '@/repositories/law.repository';
import { syncService } from '@/services/sync.service';
import type { Nullable } from '@/types/common.types';
import type { CreateLawInput, EditLawInput, Law } from '@/types/laws.types';

interface UseLawsReturn {
	laws: Law[];
	isLoading: boolean;
	error: Nullable<string>;
	refresh: () => Promise<void>;
	createLaw: (input: CreateLawInput) => Promise<Nullable<Law>>;
	updateLaw: (id: $UUID, input: EditLawInput) => Promise<boolean>;
	deleteLaw: (id: $UUID) => Promise<boolean>;
	lawSorter: JSX.Element;
}

export function useLaws(): UseLawsReturn {
	const [laws, setLaws] = useState<Law[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Nullable<string>>(null);
	const { user } = useAuth();

	const { sortField, sortOrder, sorter } = useSorter();

	const refresh = useCallback(async () => {
		try {
			setError(null);
			const data = await lawRepository.getAll(sortField, sortOrder);
			setLaws(data);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load laws';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [sortField, sortOrder]);

	useEffect(() => {
		refresh();
		window.addEventListener(CUSTOM_EVENTS.LAWS_UPDATED, refresh);
		return () => {
			window.removeEventListener(CUSTOM_EVENTS.LAWS_UPDATED, refresh);
		};
	}, [refresh]);

	const isSyncable = window.navigator.onLine && !!user;

	const createLaw = useCallback(
		async (input: CreateLawInput): Promise<Nullable<Law>> => {
			try {
				const law = await lawRepository.create(input);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return law;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to create law';
				setError(message);
				return null;
			}
		},
		[refresh, isSyncable]
	);

	const updateLaw = useCallback(
		async (id: $UUID, input: EditLawInput): Promise<boolean> => {
			try {
				await lawRepository.update(id, input);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to update law';
				setError(message);
				return false;
			}
		},
		[refresh, isSyncable]
	);

	const deleteLaw = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				await lawRepository.softDelete(id);
				await refresh();

				if (isSyncable) {
					await syncService.sync();
				}

				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to delete law';
				setError(message);
				return false;
			}
		},
		[refresh, isSyncable]
	);

	return {
		laws,
		isLoading,
		error,
		refresh,
		createLaw,
		updateLaw,
		deleteLaw,
		lawSorter: sorter,
	};
}
