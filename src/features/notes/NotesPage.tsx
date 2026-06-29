import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoteDialog } from '@/features/notes/components/NoteDialog';
import { NoteList } from '@/features/notes/components/NoteList';
import { useNotes } from '@/hooks/useNotes';
import { useUIStore } from '@/stores/ui.store';

export function NotesPage() {
	const { t } = useTranslation();
	const { notes, isLoading, error, refresh, deleteNote } = useNotes();
	const openNoteDialog = useUIStore((s) => s.openNoteDialog);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<p className="text-sm text-muted-foreground">{t('common.loading')}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16">
				<p className="text-sm text-destructive">{error}</p>
				<button
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
					onClick={refresh}
					type="button"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	return (
		<div>
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-bold text-foreground">{t('notes.title')}</h1>
				<button
					className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					onClick={() => openNoteDialog()}
					type="button"
				>
					<Plus className="size-4" />
					{t('notes.create')}
				</button>
			</div>

			{/* Notes grid */}
			<NoteList
				notes={notes}
				onCreateClick={() => openNoteDialog()}
				onDelete={deleteNote}
			/>

			{/* Create/Edit dialog */}
			<NoteDialog onSaved={refresh} />

			{/* Mobile FAB */}
			<button
				aria-label={t('notes.create')}
				className="fixed right-4 bottom-4 z-50 rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
				onClick={() => openNoteDialog()}
				type="button"
			>
				<Plus className="size-5" />
			</button>
		</div>
	);
}
