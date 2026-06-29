import type { UUID } from 'locality-idb';
import { getTimestamp } from 'toolbox-x/date';
import { db } from '@/database/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors';
import { useAuthStore } from '@/stores/auth.store';
import type { CreateNoteInput, EditNoteInput, Note } from '@/types/note.types';

type NoteId = UUID<'v4'>;

/** Repository layer for Note CRUD operations via locality-idb. */
export const noteRepository = {
	/** Get all active (non-deleted) notes, ordered by updated_at descending. */
	async getAll(): Promise<Note[]> {
		try {
			const user = useAuthStore.getState().user;
			const userId = user?.id || null;

			const notes = await db
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
	async getById(id: string): Promise<Note> {
		try {
			const note = await db.from('notes').findByPk(id as NoteId);
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
		if (!input.title.trim()) {
			throw new ValidationError('Note title cannot be empty.');
		}

		try {
			const user = useAuthStore.getState().user;
			const userId = user?.id || undefined;

			const note = await db
				.insert('notes')
				.values({
					user_id: userId,
					title: input.title.trim(),
					description: input.description?.trim(),
					last_synced_at: undefined,
					deleted_at: undefined,
				})
				.run();

			return note as Note;
		} catch (error) {
			throw new DatabaseError('create note', error);
		}
	},

	/** Update an existing note with version bump. */
	async update(id: string, input: EditNoteInput): Promise<void> {
		try {
			const existing = await db.from('notes').findByPk(id as NoteId);
			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			const updateData: Record<string, unknown> = {
				version: existing.version + 1,
			};

			if (input.title !== undefined) {
				if (!input.title.trim()) {
					throw new ValidationError('Note title cannot be empty.');
				}
				updateData.title = input.title.trim();
			}

			if (input.description !== undefined) {
				updateData.description = input.description.trim();
			}

			await db
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
	async softDelete(id: string): Promise<void> {
		try {
			const existing = await db.from('notes').findByPk(id as NoteId);
			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			await db
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
	async restore(id: string): Promise<void> {
		try {
			const existing = await db.from('notes').findByPk(id as NoteId);
			if (!existing) {
				throw new NotFoundError('Note', id);
			}

			await db
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
			const user = useAuthStore.getState().user;
			const userId = user?.id || null;

			const notes = await db
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
	async permanentDelete(id: string): Promise<void> {
		try {
			const existing = await db.from('notes').findByPk(id as NoteId);
			if (!existing) {
				throw new NotFoundError('Note', id);
			}
			if (!existing.deleted_at) {
				throw new ValidationError(
					'Cannot permanently delete a note that has not been soft-deleted first.'
				);
			}

			await db
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
			const user = useAuthStore.getState().user;
			const userId = user?.id || null;

			return await db
				.from('notes')
				.where((note) => !note.deleted_at && note.user_id === userId)
				.findAll();
		} catch (error) {
			throw new DatabaseError('getAllForSearch notes', error);
		}
	},
};
