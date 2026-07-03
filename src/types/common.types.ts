import type { GenericObject } from 'toolbox-x/types/object';
import type { SUPPORTED_LANGUAGES, THEME_OPTIONS } from '@/constants/app';
import type { lawMateSchema } from '@/database/schema';

export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export type Theme = (typeof THEME_OPTIONS)[number];

export type Nullable<T> = T | null;
export type Uncertain<T> = T | null | undefined;

export type Intersect<A extends GenericObject, B extends GenericObject> = {
	[K in keyof A & keyof B]: A[K] | B[K];
};

export type LawMateSchema = typeof lawMateSchema;
export type IDBTableNames = keyof LawMateSchema;

export type SyncType = 'push' | 'pull' | 'noop';
