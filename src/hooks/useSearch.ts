import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { SEARCH_KEYS, SEARCH_RESULT_LIMIT, SEARCH_THRESHOLD } from '@/constants/app';
import type { Note } from '@/types/note.types';

interface UseSearchReturn {
	query: string;
	setQuery: (query: string) => void;
	results: Note[];
}

export function useSearch(notes: Note[]): UseSearchReturn {
	const [query, setQuery] = useState('');

	const fuse = useMemo(
		() =>
			new Fuse(notes, {
				keys: [...SEARCH_KEYS],
				threshold: SEARCH_THRESHOLD,
				ignoreLocation: true,
				includeScore: true,
			}),
		[notes]
	);

	const results = useMemo(() => {
		if (!query.trim()) return [];
		return fuse.search(query, { limit: SEARCH_RESULT_LIMIT }).map((result) => result.item);
	}, [fuse, query]);

	return { query, setQuery, results };
}
