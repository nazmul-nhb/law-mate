import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import type { Nullable } from '@/types/common.types';
import type { Note } from '@/types/note.types';

interface SearchResult {
	query: string;
	setQuery: (query: string) => void;
	results: Note[];
	scopeLawId: Nullable<string>;
	setScopeLawId: (id: Nullable<string>) => void;
	searchFields: 'all' | 'title' | 'description';
	setSearchFields: (fields: 'all' | 'title' | 'description') => void;
}

export function useNoteSearch(notes: Note[]): SearchResult {
	const [query, setQuery] = useState('');
	const [scopeLawId, setScopeLawId] = useState<Nullable<string>>(null);
	const [searchFields, setSearchFields] = useState<'all' | 'title' | 'description'>('all');

	const filteredNotesByLaw = useMemo(() => {
		if (!scopeLawId) return notes;
		return notes.filter((n) => n.law_id === scopeLawId);
	}, [notes, scopeLawId]);

	const fuse = useMemo(() => {
		const keys =
			searchFields === 'title'
				? ['title']
				: searchFields === 'description'
					? ['description']
					: ['title', 'description'];

		return new Fuse(filteredNotesByLaw, {
			keys,
			threshold: 0.3,
			ignoreLocation: true,
			includeScore: true,
		});
	}, [filteredNotesByLaw, searchFields]);

	const results = useMemo(() => {
		if (!query.trim()) return [];
		return fuse.search(query).map((result) => result.item);
	}, [fuse, query]);

	return {
		query,
		setQuery,
		results,
		scopeLawId,
		setScopeLawId,
		searchFields,
		setSearchFields,
	};
}
