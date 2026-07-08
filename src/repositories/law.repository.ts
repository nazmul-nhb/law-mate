import type { $UUID, SortDirection } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';
import { getFromLocalStorage, saveToLocalStorage } from 'toolbox-x/dom';
import { DELETE_LAWS_QUEUE_KEY } from '@/constants/app';
import { idb } from '@/database/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import type { SortableField } from '@/types/common.types';
import type { CreateLawInput, EditLawInput, Law, UpdateLaw } from '@/types/laws.types';

/** Repository layer for Law CRUD operations via locality-idb. */
export const lawRepository = {
	/** Get all active (non-deleted) laws, ordered by updated_at descending. */
	async getAll(sortBy?: SortableField, sortOrder?: SortDirection): Promise<Law[]> {
		try {
			const { user } = useAuthStore.getState();

			return await idb
				.from('laws')
				.where((law) => !law.deleted_at && law.user_id === user?.id)
				.orderBy(sortBy || 'title', sortOrder)
				.findAll();
		} catch (error) {
			throw new DatabaseError('getAll laws', error);
		}
	},

	/** Get a single law by its primary key. */
	async getById(id: $UUID): Promise<Law> {
		try {
			const law = await idb.from('laws').findByPk(id);

			if (!law) {
				throw new NotFoundError('Law', id);
			}

			return law;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;

			throw new DatabaseError('getById law', error);
		}
	},

	/** Create a new law. */
	async create(input: CreateLawInput): Promise<Law> {
		if (!input.title) {
			throw new ValidationError('Law title cannot be empty.');
		}

		try {
			const { user } = useAuthStore.getState();

			const law = await idb
				.insert('laws')
				.values({
					user_id: user?.id,
					title: input.title,
					description: input.description,
				})
				.run();

			return law;
		} catch (error) {
			throw new DatabaseError('create law', error);
		}
	},

	/** Update an existing law with version bump. */
	async update(id: $UUID, input: EditLawInput): Promise<void> {
		try {
			const existing = await idb.from('laws').findByPk(id);

			if (!existing) {
				throw new NotFoundError('Law', id);
			}

			const updateData: UpdateLaw = {
				version: existing.version + 1,
				updated_at: getTimestamp(),
			};

			if (input.title !== undefined) {
				if (!input.title) {
					throw new ValidationError('Law title cannot be empty.');
				}
				updateData.title = input.title;
			}

			if (input.description !== undefined) {
				updateData.description = input.description || undefined;
			}

			await idb.update('laws').set(updateData).where('id', id).run();
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof ValidationError) {
				throw error;
			}

			throw new DatabaseError('update law', error);
		}
	},

	/** Soft-delete a law by setting deleted_at. */
	async softDelete(id: $UUID): Promise<void> {
		try {
			const existing = await idb.from('laws').findByPk(id);
			if (!existing) {
				throw new NotFoundError('Law', id);
			}

			await idb
				.update('laws')
				.set({
					deleted_at: getTimestamp(),
					version: existing.version + 1,
				})
				.where('id', id)
				.run();

			// Cascade soft-delete notes under this law
			const notes = await idb.from('notes').where('law_id', id).findAll();
			for (const note of notes) {
				if (!note.deleted_at) {
					await idb
						.update('notes')
						.set({
							deleted_at: getTimestamp(),
							version: note.version + 1,
						})
						.where('id', note.id)
						.run();
				}
			}
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			throw new DatabaseError('softDelete law', error);
		}
	},

	/** Restore a soft-deleted law. */
	async restore(id: $UUID): Promise<void> {
		try {
			const existing = await idb.from('laws').findByPk(id);

			if (!existing) {
				throw new NotFoundError('Law', id);
			}

			await idb
				.update('laws')
				.set({
					deleted_at: undefined,
					version: existing.version + 1,
				})
				.where('id', id)
				.run();

			// Cascade restore notes under this law
			const notes = await idb.from('notes').where('law_id', id).findAll();
			for (const note of notes) {
				if (note.deleted_at) {
					await idb
						.update('notes')
						.set({
							deleted_at: undefined,
							version: note.version + 1,
						})
						.where('id', note.id)
						.run();
				}
			}
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			throw new DatabaseError('restore law', error);
		}
	},

	/** Get all soft-deleted laws. */
	async getDeleted(): Promise<Law[]> {
		try {
			const { user } = useAuthStore.getState();

			const laws = await idb
				.from('laws')
				.where((law) => law.deleted_at && law.user_id === user?.id)
				.orderBy('deleted_at', 'desc')
				.findAll();

			return laws;
		} catch (error) {
			throw new DatabaseError('getDeleted laws', error);
		}
	},

	/** Permanently delete a law (must already be soft-deleted). */
	async permanentDelete(id: $UUID): Promise<void> {
		try {
			const existing = await idb.from('laws').findByPk(id);

			if (!existing) {
				throw new NotFoundError('Law', id);
			}

			if (!existing.deleted_at) {
				throw new ValidationError(
					'Cannot permanently delete a law that has not been soft-deleted first.'
				);
			}

			// 1. Delete locally from IndexedDB
			await idb.delete('laws').where('id', id).run();

			// Cascade local permanent delete of notes under this law
			await idb.delete('notes').where('law_id', id).run();

			// 2. Delete from Supabase or queue if offline
			const { user } = useAuthStore.getState();
			if (user) {
				if (window.navigator.onLine) {
					try {
						const { error } = await supabase.from('laws').delete().eq('id', id);
						if (error) throw error;
						return; // Success
					} catch (err) {
						console.warn(
							'Failed to delete law from Supabase immediately, queuing for sync:',
							err
						);
					}
				}

				// Offline or error: queue for sync
				const pending = getFromLocalStorage<$UUID[]>(DELETE_LAWS_QUEUE_KEY) || [];

				if (!pending.includes(id)) {
					pending.push(id);
					saveToLocalStorage(DELETE_LAWS_QUEUE_KEY, pending);
				}
			}
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof ValidationError) {
				throw error;
			}

			throw new DatabaseError('permanentDelete law', error);
		}
	},
};
