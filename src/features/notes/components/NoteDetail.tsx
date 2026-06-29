import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { formatDateRelative } from 'toolbox-x/date';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { noteRepository } from '@/repositories/note.repository';
import { useUIStore } from '@/stores/ui.store';
import type { Note } from '@/types/note.types';

export function NoteDetail() {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const openNoteDialog = useUIStore((s) => s.openNoteDialog);
	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const fetchNote = useCallback(() => {
		if (!id) return;
		noteRepository
			.getById(id)
			.then(setNote)
			.catch(() => navigate('/', { replace: true }))
			.finally(() => setIsLoading(false));
	}, [id, navigate]);

	useEffect(() => {
		fetchNote();

		window.addEventListener('note-updated', fetchNote);
		return () => {
			window.removeEventListener('note-updated', fetchNote);
		};
	}, [fetchNote]);

	const handleDelete = async () => {
		if (!id) return;
		await noteRepository.softDelete(id);
		setIsDeleteOpen(false);
		navigate('/', { replace: true });
	};

	const handleEdit = () => {
		if (!id) return;
		openNoteDialog(id);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<p className="text-sm text-muted-foreground">{t('common.loading')}</p>
			</div>
		);
	}

	if (!note) return null;

	return (
		<div className="mx-auto max-w-3xl">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<button
					className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
					onClick={() => navigate('/')}
					type="button"
				>
					<ArrowLeft className="size-4" />
					{t('nav.notes')}
				</button>

				<div className="flex items-center gap-1">
					<button
						className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						onClick={handleEdit}
						title={t('notes.edit')}
						type="button"
					>
						<Pencil className="size-4" />
					</button>
					<button
						className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
						onClick={() => setIsDeleteOpen(true)}
						title={t('notes.delete')}
						type="button"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			</div>

			{/* Note content */}
			<article>
				<h1 className="text-2xl font-bold text-foreground">
					{note.title || t('notes.untitled')}
				</h1>
				<p className="mt-2 text-xs text-muted-foreground">
					{formatDateRelative(note.updated_at)}
				</p>

				{note.description ? (
					<div className="mt-6">
						<MarkdownPreview content={note.description} />
					</div>
				) : (
					<p className="mt-6 text-sm text-muted-foreground">
						{t('notes.no.description')}
					</p>
				)}
			</article>

			{/* Soft delete confirmation dialog */}
			<Dialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t('notes.delete')}</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						{t('trash.confirm.soft.delete')}
					</p>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							{t('notes.cancel')}
						</DialogClose>
						<Button
							onClick={handleDelete}
							variant="destructive"
						>
							{t('common.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
