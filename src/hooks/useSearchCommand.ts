import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui.store';

/** Registers the Ctrl+K / ⌘K keyboard shortcut to toggle the search command palette. */
export function useSearchCommand() {
	const setSearchOpen = useUIStore((s) => s.setSearchOpen);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setSearchOpen(true);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [setSearchOpen]);
}
