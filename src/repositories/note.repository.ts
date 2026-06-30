import type { $UUID } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';
import { idb } from '@/database/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors';
import { useAuthStore } from '@/stores/auth.store';
import type { CreateNoteInput, EditNoteInput, Note, UpdateNote } from '@/types/note.types';

/** Repository layer for Note CRUD operations via locality-idb. */
export const noteRepository = {
	/** Get all active (non-deleted) notes, ordered by updated_at descending. */
	async getAll(): Promise<Note[]> {
		try {
			const { user } = useAuthStore.getState();
			const userId = user?.id || null;

			const notes = await idb
				.from('notes')
				.where((note) => !note.deleted_at && note.user_id === userId)
				.orderBy('updated_at', 'desc')
				.findAll();

			return notes;
		} catch (error) {
			throw new DatabaseError('getAll notes', error);
		}
	},

	/** Get a single note by its primary key. */
	async getById(id: $UUID): Promise<Note> {
		try {
			const note = await idb.from('notes').findByPk(id);

			if (!note) {
				throw new NotFoundError('Note', id);
			}

			return note;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;

			throw new DatabaseError('getById note', error);
		}
	},

	/** Create a new note. */
	async create(input: CreateNoteInput): Promise<Note> {
		if (!input.title) {
			throw new ValidationError('Note title cannot be empty.');
		}

		if (!input.description) {
			throw new ValidationError('Note description cannot be empty.');
		}

		try {
			const { user } = useAuthStore.getState();

			const note = await idb
				.insert('notes')
				.values({
					user_id: user?.id,
					title: input.title,
					description: input.description,
					last_synced_at: undefined,
					deleted_at: undefined,
				})
				.run();

			return note;
		} catch (error) {
			throw new DatabaseError('create note', error);
		}
	},

	/** Update an existing note with version bump. */
	async update(id: $UUID, input: EditNoteInput): Promise<void> {
		try {
			const existing = await idb.from('notes').findByPk(id);

			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			const updateData: UpdateNote = {
				version: existing.version + 1,
				updated_at: getTimestamp(),
			};

			if (input.title !== undefined) {
				if (!input.title) {
					throw new ValidationError('Note title cannot be empty.');
				}
				updateData.title = input.title;
			}

			if (input.description !== undefined) {
				if (!input.description) {
					throw new ValidationError('Note description cannot be empty.');
				}
				updateData.description = input.description;
			}

			await idb
				.update('notes')
				.set(updateData)
				.where((note) => note.id === id)
				.run();
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof ValidationError) {
				throw error;
			}

			throw new DatabaseError('update note', error);
		}
	},

	/** Soft-delete a note by setting deleted_at. */
	async softDelete(id: $UUID): Promise<void> {
		try {
			const existing = await idb.from('notes').findByPk(id);
			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			await idb
				.update('notes')
				.set({
					deleted_at: getTimestamp(),
					version: existing.version + 1,
				})
				.where((note) => note.id === id)
				.run();
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			throw new DatabaseError('softDelete note', error);
		}
	},

	/** Restore a soft-deleted note. */
	async restore(id: $UUID): Promise<void> {
		try {
			const existing = await idb.from('notes').findByPk(id);

			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			await idb
				.update('notes')
				.set({
					deleted_at: undefined,
					version: existing.version + 1,
				})
				.where((note) => note.id === id)
				.run();
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			throw new DatabaseError('restore note', error);
		}
	},

	/** Get all soft-deleted notes. */
	async getDeleted(): Promise<Note[]> {
		try {
			const { user } = useAuthStore.getState();
			const userId = user?.id || null;

			const notes = await idb
				.from('notes')
				.where((note) => !!note.deleted_at && note.user_id === userId)
				.orderBy('deleted_at', 'desc')
				.findAll();

			return notes;
		} catch (error) {
			throw new DatabaseError('getDeleted notes', error);
		}
	},

	/** Permanently delete a note (must already be soft-deleted). */
	async permanentDelete(id: $UUID): Promise<void> {
		try {
			const existing = await idb.from('notes').findByPk(id);

			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			if (!existing.deleted_at) {
				throw new ValidationError(
					'Cannot permanently delete a note that has not been soft-deleted first.'
				);
			}

			await idb
				.delete('notes')
				.where((note) => note.id === id)
				.run();
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof ValidationError) {
				throw error;
			}

			throw new DatabaseError('permanentDelete note', error);
		}
	},

	/** Get all active notes for search indexing. */
	async getAllForSearch(): Promise<Note[]> {
		try {
			const { user } = useAuthStore.getState();
			const userId = user?.id || null;

			return await idb
				.from('notes')
				.where((note) => !note.deleted_at && note.user_id === userId)
				.findAll();
		} catch (error) {
			throw new DatabaseError('getAllForSearch notes', error);
		}
	},
};
