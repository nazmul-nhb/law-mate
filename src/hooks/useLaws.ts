import { useMutation, useQuery } from '@tanstack/react-query';
import type { $UUID } from 'locality-idb';
import { type JSX, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSorter } from '@/hooks/useSorter';
import { queryClient } from '@/lib/queryClient';
import { lawRepository } from '@/repositories/law.repository';
import { syncService } from '@/services/sync.service';
import type { Nullable } from '@/types/common.types';
import type { CreateLawInput, EditLawInput, Law } from '@/types/laws.types';

// Strict Query Keys Factory for Law repository
export const lawKeys = {
	all: ['laws'] as const,
	lists: () => [...lawKeys.all, 'list'] as const,
	list: (sortField: string, sortOrder: string) => {
		return [...lawKeys.lists(), { sortField, sortOrder }] as const;
	},
	details: () => [...lawKeys.all, 'detail'] as const,
	detail: (id: $UUID) => [...lawKeys.details(), id] as const,
};

// Reusable Query Hook for a single law
export function useLawQuery(id: $UUID | undefined) {
	return useQuery<Law, Error>({
		queryKey: id ? lawKeys.detail(id) : [],
		queryFn: async () => {
			if (!id) throw new Error('Law ID is required');
			return lawRepository.getById(id);
		},
		enabled: !!id,
	});
}

// Reusable Mutation Hook for creating a law
export function useCreateLawMutation() {
	const { user } = useAuth();
	return useMutation<Nullable<Law>, Error, CreateLawInput>({
		mutationFn: (input) => lawRepository.create(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: lawKeys.all });
			if (window.navigator.onLine && user) {
				await syncService.sync();
			}
		},
	});
}

// Reusable Mutation Hook for updating a law
export function useUpdateLawMutation() {
	const { user } = useAuth();
	return useMutation<void, Error, { id: $UUID; input: EditLawInput }>({
		mutationFn: ({ id, input }) => lawRepository.update(id, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: lawKeys.all });
			if (window.navigator.onLine && user) {
				await syncService.sync();
			}
		},
	});
}

// Reusable Mutation Hook for deleting a law
export function useDeleteLawMutation() {
	const { user } = useAuth();
	return useMutation<void, Error, $UUID>({
		mutationFn: (id) => lawRepository.softDelete(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: lawKeys.all });
			if (window.navigator.onLine && user) {
				await syncService.sync();
			}
		},
	});
}

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
	const [mutationError, setMutationError] = useState<Nullable<string>>(null);

	const { sortField, sortOrder, sorter } = useSorter();

	const {
		data: laws = [],
		isLoading,
		error: queryError,
		refetch,
	} = useQuery<Law[], Error>({
		queryKey: lawKeys.list(sortField, sortOrder),
		queryFn: () => lawRepository.getAll(sortField, sortOrder),
	});

	const refresh = useCallback(async () => {
		setMutationError(null);
		await refetch();
	}, [refetch]);

	const createLawMutation = useCreateLawMutation();
	const updateLawMutation = useUpdateLawMutation();
	const deleteLawMutation = useDeleteLawMutation();

	const createLaw = useCallback(
		async (input: CreateLawInput): Promise<Nullable<Law>> => {
			try {
				setMutationError(null);
				return await createLawMutation.mutateAsync(input);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to create law';
				setMutationError(message);
				return null;
			}
		},
		[createLawMutation]
	);

	const updateLaw = useCallback(
		async (id: $UUID, input: EditLawInput): Promise<boolean> => {
			try {
				setMutationError(null);
				await updateLawMutation.mutateAsync({ id, input });
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to update law';
				setMutationError(message);
				return false;
			}
		},
		[updateLawMutation]
	);

	const deleteLaw = useCallback(
		async (id: $UUID): Promise<boolean> => {
			try {
				setMutationError(null);
				await deleteLawMutation.mutateAsync(id);
				return true;
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Failed to delete law';
				setMutationError(message);
				return false;
			}
		},
		[deleteLawMutation]
	);

	const error = queryError ? queryError.message : mutationError;

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
