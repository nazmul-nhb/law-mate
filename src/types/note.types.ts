import type { InferInsertType, InferSelectType, InferUpdateType } from 'locality-idb';
import type { LawMateSchema } from '@/types/common.types';

export type NoteSchema = LawMateSchema['notes'];

/** Full note record as stored in IndexedDB. */
export type Note = InferSelectType<NoteSchema>;

/** Data required to insert a new note. */
export type InsertNote = InferInsertType<NoteSchema>;

/** Partial data for updating an existing note. */
export type UpdateNote = InferUpdateType<NoteSchema>;

/** User-provided fields when creating a note. */
export type CreateNoteInput = Pick<InsertNote, 'title' | 'description'>;

/** User-provided fields when editing a note. */
export type EditNoteInput = Partial<CreateNoteInput>;
