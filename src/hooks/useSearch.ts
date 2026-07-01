import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { SEARCH_KEYS, SEARCH_THRESHOLD } from '@/constants/app';
import type { Note } from '@/types/note.types';

interface UseSearchReturn {
	query: string;
	setQuery: (query: string) => void;
	results: Note[];
}

export function useSearch(notes: Note[]): UseSearchReturn {
	const [query, setQuery] = useState('');

	const fuse = useMemo(() => {
		const index = Fuse.createIndex([...SEARCH_KEYS], notes);

		return new Fuse(
			notes,
			{
				keys: [...SEARCH_KEYS],
				threshold: SEARCH_THRESHOLD,
				ignoreLocation: true,
				includeScore: true,
			},
			index
		);
	}, [notes]);

	const results = useMemo(() => {
		if (!query.trim()) return [];
		return fuse.search(query).map((result) => result.item);
	}, [fuse, query]);

	return { query, setQuery, results };
}
