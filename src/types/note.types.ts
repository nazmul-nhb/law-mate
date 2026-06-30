import type { InferInsertType, InferSelectType, InferUpdateType } from 'locality-idb';
import type { schema } from '@/database/schema';

/** Full note record as stored in IndexedDB. */
export type Note = InferSelectType<typeof schema.notes>;

/** Data required to insert a new note. */
export type InsertNote = InferInsertType<typeof schema.notes>;

/** Partial data for updating an existing note. */
export type UpdateNote = InferUpdateType<typeof schema.notes>;

/** User-provided fields when creating a note. */
export type CreateNoteInput = Pick<InsertNote, 'title' | 'description'>;

/** User-provided fields when editing a note. */
export type EditNoteInput = Partial<CreateNoteInput>;
