import type { InferInsertType, InferSelectType, InferUpdateType } from 'locality-idb';
import type { PropertyOptional, PropertyRequired } from 'toolbox-x/types/utils';
import type { LawMateSchema } from '@/types/common.types';

export type NoteSchema = LawMateSchema['notes'];

/** Full note record as stored in IndexedDB. */
export type Note = PropertyOptional<InferSelectType<NoteSchema>, 'user_id'>;

/** Data required to insert a new note. */
export type InsertNote = PropertyRequired<InferInsertType<NoteSchema>, 'law_id'>;

/** Partial data for updating an existing note. */
export type UpdateNote = InferUpdateType<NoteSchema>;

/** User-provided fields when creating a note. */
export type CreateNoteInput = Pick<InsertNote, 'title' | 'description' | 'law_id'>;

/** User-provided fields when editing a note. */
export type EditNoteInput = Partial<CreateNoteInput>;
