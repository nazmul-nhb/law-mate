import type { InferInsertType, InferSelectType, InferUpdateType } from 'locality-idb';
import type { LawMateSchema } from '@/types/common.types';

export type LawSchema = LawMateSchema['laws'];

/** Full law record as stored in IndexedDB. */
export type Law = InferSelectType<LawSchema>;

/** Data required to insert a new law. */
export type InsertLaw = InferInsertType<LawSchema>;

/** Partial data for updating an existing law. */
export type UpdateLaw = InferUpdateType<LawSchema>;

/** User-provided fields when creating a law. */
export type CreateLawInput = Pick<InsertLaw, 'title' | 'description'>;

/** User-provided fields when editing a law. */
export type EditLawInput = Partial<CreateLawInput>;
