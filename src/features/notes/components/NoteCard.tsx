import type { $UUID } from 'locality-idb';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { truncateString } from 'toolbox-x';
import { formatDateRelativeNative } from 'toolbox-x/date';
import { isNonEmptyString } from 'toolbox-x/guards';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';
import type { Note } from '@/types/note.types';

interface NoteCardProps {
	note: Note;
	onDelete: (id: $UUID) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const openNoteDialog = useUIStore((s) => s.openNoteDialog);
	const language = useSettingsStore((s) => s.language);

	const handleClick = () => {
		navigate(`/note/${note.id}`);
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		openNoteDialog(note.id);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete(note.id);
	};

	return (
		<article
			className={cn(
				'group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all',
				'hover:border-primary/20 hover:shadow-sm'
			)}
			onClick={handleClick}
			onDoubleClick={handleEdit}
			onKeyDown={(e) => {
				if (e.key === 'Enter') handleClick();
			}}
		>
			<div className="relative">
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-sm font-semibold text-foreground">
						{note.title || t('notes.untitled')}
					</h3>
					{isNonEmptyString(note.description) && (
						<div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
							<MarkdownPreview content={truncateString(note.description, 150)} />
						</div>
					)}
					<p className="mt-2 text-xs text-muted-foreground">
						<span>{`${t('notes.edited')}: ${formatDateRelativeNative(
							note.updated_at,
							{ locale: language }
						)}`}</span>
					</p>
				</div>

				<button
					aria-label={t('notes.delete')}
					className="absolute top-0 right-0 rounded p-1.5 hover:text-destructive/80 transition-all hover:bg-destructive/10 text-destructive"
					onClick={handleDelete}
					type="button"
				>
					<Trash2 className="size-4" />
				</button>
			</div>
		</article>
	);
}
