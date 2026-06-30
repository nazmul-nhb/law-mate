import { getNumbersInRange } from 'toolbox-x';
import type { LooseLiteral } from 'toolbox-x/types/utils';
import pkg from '../../package.json';

export const APP_NAME = 'LawMate';
export const APP_VERSION = (pkg.version || '1.0.0') as LooseLiteral<'1.0.0'>;
export const DB_NAME = 'law-mate-db';
export const DB_VERSION = 1;

export const DEFAULT_LANGUAGE = 'bn';
export const SUPPORTED_LANGUAGES = ['bn', 'en'] as const;

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export const DEFAULT_THEME = 'system';

export const SEARCH_KEYS = ['title', 'description'] as const;
export const SEARCH_THRESHOLD = 0.3;
export const SEARCH_RESULT_LIMIT = 20;

export const DEFAULT_FONT_SIZE = 16;
export const FONT_SIZES = getNumbersInRange('natural', { min: 10, max: 24 });
