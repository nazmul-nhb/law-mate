import { getNumbersInRange } from 'toolbox-x';
import type { LooseLiteral } from 'toolbox-x/types/utils';
import pkg from '../../package.json';

export const APP_NAME = 'LawMate';
export const APP_VERSION = (pkg.version || '1.0.0') as LooseLiteral<'1.0.0'>;
export const DB_NAME = 'law-mate-db';
export const DB_VERSION = 2;

export const DELETE_NOTES_QUEUE_KEY = 'law-mate-pending-permanent-notes-deletes';
export const DELETE_LAWS_QUEUE_KEY = 'law-mate-pending-permanent-laws-deletes';
export const TERMS_PRIVACY_LAST_MODIFIED = '2026-07-01';

export const DEFAULT_LANGUAGE = 'bn';
export const SUPPORTED_LANGUAGES = ['bn', 'en'] as const;

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export const DEFAULT_THEME = 'system';

export const CUSTOM_EVENTS = {
	LAWS_UPDATED: 'law-updated',
	NOTES_UPDATED: 'note-updated',
} as const;

export const SEARCH_KEYS = ['title', 'description'] as const;
export const SEARCH_THRESHOLD = 0.3;
export const SEARCH_RESULT_LIMIT = 20;

export const DEFAULT_FONT_SIZE = 16;
export const FONT_SIZES = getNumbersInRange('natural', { min: 10, max: 24 });

export const DATA_SHAPE = `{
  "metadata": {
    "dbName": "law-mate-db",
    "version": 1,
    "exportedAt": "2026-07-02T07:30:46.428Z",
    "tables": ["laws", "notes"]
  },
  "data": {
    "laws": [
      {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
        "title": "Constitution of Bangladesh",
        "description": "The supreme law of Bangladesh.",
        "created_at": "2026-07-02T05:50:00.000Z",
        "updated_at": "2026-07-02T05:50:00.000Z",
        "version": 1
      }
    ],
    "notes": [
      {
        "id": "e6e69b88-5b28-48cb-9e0f-ff61f6da2edf",
        "law_id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
        "title": "Article 1",
        "description": "Bangladesh is a unitary republic.",
        "created_at": "2026-07-02T05:50:04.744Z",
        "updated_at": "2026-07-02T05:50:04.744Z",
        "version": 1
      }
    ]
  }
}`;

export const SIMPLE_DATA_SHAPE = `{
  "laws": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "title": "Constitution of Bangladesh",
      "description": "The supreme law of Bangladesh.",
      "created_at": "2026-07-02T05:50:00.000Z",
      "updated_at": "2026-07-02T05:50:00.000Z",
      "version": 1
    }
  ],
  "notes": [
    {
      "id": "e6e69b88-5b28-48cb-9e0f-ff61f6da2edf",
      "law_id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "title": "Article 1",
      "description": "Bangladesh is a unitary republic.",
      "created_at": "2026-07-02T05:50:04.744Z",
      "updated_at": "2026-07-02T05:50:04.744Z",
      "version": 1
    }
  ]
}`;
