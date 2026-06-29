import type { SUPPORTED_LANGUAGES, THEME_OPTIONS } from '@/constants/app';

export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export type Theme = (typeof THEME_OPTIONS)[number];
