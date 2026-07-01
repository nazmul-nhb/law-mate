import type { $UUID } from 'locality-idb';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { formatDateRelativeNative } from 'toolbox-x/date';
import { isNonEmptyString } from 'toolbox-x/guards';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
		<Card
			className={cn(
				'group cursor-pointer transition-all hover:border-primary/20 hover:shadow-sm h-full flex flex-col'
			)}
			onClick={handleClick}
			onDoubleClick={handleEdit}
			onKeyDown={(e) => {
				if (e.key === 'Enter') handleClick();
			}}
			tabIndex={0}
		>
			<div className="relative flex-1 flex flex-col">
				<CardHeader className="pb-1 pr-12">
					<CardTitle className="truncate line-clamp-1 text-sm font-semibold text-foreground">
						{note.title || t('notes.untitled')}
					</CardTitle>
					<button
						aria-label={t('notes.delete')}
						className="absolute -top-1 right-4 rounded p-1.5 hover:text-destructive/80 transition-all hover:bg-destructive/10 text-destructive z-10"
						onClick={handleDelete}
						type="button"
					>
						<Trash2 className="size-4" />
					</button>
				</CardHeader>
				{isNonEmptyString(note.description) && (
					<CardContent className="">
						<div className="line-clamp-2 text-xs text-muted-foreground">
							<MarkdownPreview
								content={note.description}
								removeMarkdown
								replaceNewLine
							/>
						</div>
					</CardContent>
				)}
			</div>
			<CardFooter className="pt-2.5 pb-2 border-t bg-muted/30">
				<p className="text-xs text-muted-foreground font-mono">
					{`${t('notes.edited')}: ${formatDateRelativeNative(note.updated_at, {
						locale: language,
					})}`}
				</p>
			</CardFooter>
		</Card>
	);
}
