import type { SUPPORTED_LANGUAGES, THEME_OPTIONS } from '@/constants/app';

export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export type Theme = (typeof THEME_OPTIONS)[number];

export type Nullable<T> = T | null;
export type Uncertain<T> = T | null | undefined;
