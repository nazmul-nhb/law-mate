import type { $UUID } from 'locality-idb';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
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
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { noteRepository } from '@/repositories/note.repository';
import { useUIStore } from '@/stores/ui.store';
import type { Nullable } from '@/types/common.types';
import type { Note } from '@/types/note.types';

export function NoteDetail() {
	const { t } = useTranslation();
	const { id } = useParams<{ id: $UUID }>();
	const navigate = useNavigate();
	const openNoteDialog = useUIStore((s) => s.openNoteDialog);
	const [note, setNote] = useState<Nullable<Note>>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const fetchNote = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoading(true);
			const data = await noteRepository.getById(id);
			setNote(data);
		} catch (error) {
			console.error('Failed to fetch note:', error);
			navigate('/');
		} finally {
			setIsLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		fetchNote();

		// Listen to save events
		const handleUpdated = () => {
			fetchNote();
		};
		window.addEventListener('note-updated', handleUpdated);
		return () => window.removeEventListener('note-updated', handleUpdated);
	}, [fetchNote]);

	useTitle(note?.title || t('app.tagline'));

	const handleEdit = () => {
		if (!note) return;
		openNoteDialog(note.id);
	};

	const handleDelete = async () => {
		if (!note) return;
		try {
			await noteRepository.softDelete(note.id);
			window.dispatchEvent(new CustomEvent('note-updated'));
			navigate('/');
		} catch (error) {
			console.error('Failed to delete note:', error);
		}
	};

	if (isLoading) {
		return (
			<div className="text-center text-sm text-muted-foreground">
				{t('common.loading')}
			</div>
		);
	}

	if (!note) {
		return <div className="text-center text-sm text-muted-foreground">Note not found</div>;
	}

	return (
		<div className="space-y-6">
			{/* Toolbar */}
			<div className="flex items-center justify-between">
				<button
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					onClick={() => navigate('/')}
					type="button"
				>
					<ArrowLeft className="size-4" />
					{t('nav.notes')}
				</button>

				<div className="flex items-center gap-1">
					<TooltipSimple content={t('notes.edit')}>
						<button
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
							onClick={handleEdit}
							type="button"
						>
							<Pencil className="size-4" />
						</button>
					</TooltipSimple>
					<TooltipSimple content={t('notes.delete')}>
						<button
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
							onClick={() => setIsDeleteOpen(true)}
							type="button"
						>
							<Trash2 className="size-4" />
						</button>
					</TooltipSimple>
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
						<Button onClick={handleDelete} variant="destructive">
							{t('common.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
