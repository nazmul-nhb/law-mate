import type { $UUID, Nullable } from 'locality-idb';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { generateQueryParams } from 'toolbox-x';
import type { QueryObject } from 'toolbox-x/types/object';
import type { LooseLiteral } from 'toolbox-x/types/utils';

export interface LawMateQueryObject extends QueryObject {
	law_id?: $UUID;
	tab?: LooseLiteral<'notes' | 'laws'>;
}

export function useQueryParams() {
	const [searchParams, setSearchParams] = useSearchParams();

	/**
	 * * Get a query parameter value.
	 * @param key Key of the query param to get the value from.
	 * @returns Value of the query param for the specified key.
	 */
	const getQueryParam = <T extends string>(key: string): Nullable<T> => {
		return searchParams.get(key) as Nullable<T>;
	};

	/**
	 * * Set multiple query parameters at once.
	 *
	 * @param params Params object to set.
	 */
	const setQueryParams = useCallback(
		(params: LawMateQueryObject) => {
			// Create a new URLSearchParams object from the current query parameters
			const newSearchParams = new URLSearchParams(searchParams);

			// Merge the new parameters with the existing ones
			Object.entries(params).forEach(([key, value]) => {
				if (value !== null && value !== undefined && value !== '') {
					newSearchParams.set(key, String(value));
				} else {
					newSearchParams.delete(key);
				}
			});

			// Update the URL with the merged query parameters
			setSearchParams(newSearchParams);
		},
		[searchParams, setSearchParams]
	);

	/**
	 * * Remove a query parameter.
	 *
	 * @param key Key to remove query parameter and its value.
	 */
	const removeQueryParam = (key: string) => {
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.delete(key);
		setSearchParams(newSearchParams);
	};

	/**
	 * * Get all query parameters as an object.
	 *
	 * @returns Query object.
	 */
	const getAllQueryParams = useCallback(() => {
		const params: LawMateQueryObject = {};

		searchParams.forEach((value, key) => {
			// URL-decode the key and value (if needed)
			const decodedKey = decodeURIComponent(key);
			const decodedValue = decodeURIComponent(value);
			params[decodedKey] = decodedValue;
		});

		return params;
	}, [searchParams]);

	/**
	 * * Convert the current query parameters into a query string.
	 *
	 * @returns The full query string.
	 */
	const getQueryString = () => {
		const params = getAllQueryParams();
		return generateQueryParams(params);
	};

	return {
		getQueryParam,
		setQueryParams,
		removeQueryParam,
		getAllQueryParams,
		getQueryString,
	};
}
