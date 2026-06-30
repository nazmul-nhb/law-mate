import type { $UUID } from 'locality-idb';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/features/notes/components/NoteCard';
import type { Note } from '@/types/note.types';

interface NoteListProps {
	notes: Note[];
	onDelete: (id: $UUID) => void;
	onCreateClick: () => void;
}

export function NoteList({ notes, onDelete, onCreateClick }: NoteListProps) {
	const { t } = useTranslation();

	if (notes.length === 0) {
		return (
			<EmptyState
				action={
					<button
						className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						onClick={onCreateClick}
						type="button"
					>
						{t('notes.create')}
					</button>
				}
				description={t('notes.empty.description')}
				icon={FileText}
				title={t('notes.empty')}
			/>
		);
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			{notes.map((note) => (
				<NoteCard key={note.id} note={note} onDelete={onDelete} />
			))}
		</div>
	);
}
