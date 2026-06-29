import { create } from 'zustand';

interface NoteDialogState {
	open: boolean;
	/** When set, the dialog is in edit mode for this note ID. */
	noteId?: string;
}

interface UIState {
	isSearchOpen: boolean;
	isMobileMenuOpen: boolean;
	isSyncing: boolean;
	noteDialog: NoteDialogState;
	setSearchOpen: (open: boolean) => void;
	toggleSearch: () => void;
	setMobileMenuOpen: (open: boolean) => void;
	setIsSyncing: (isSyncing: boolean) => void;
	openNoteDialog: (noteId?: string) => void;
	closeNoteDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	isSearchOpen: false,
	isMobileMenuOpen: false,
	isSyncing: false,
	noteDialog: { open: false },

	setSearchOpen: (open) => set({ isSearchOpen: open }),
	toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
	setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
	setIsSyncing: (isSyncing) => set({ isSyncing }),

	openNoteDialog: (noteId) => set({ noteDialog: { open: true, noteId } }),

	closeNoteDialog: () => set({ noteDialog: { open: false, noteId: undefined } }),
}));
