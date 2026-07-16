import type { $UUID } from 'locality-idb';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { formatDateRelativeNative } from 'toolbox-x/date';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { useDeleteNoteMutation, useNoteQuery } from '@/hooks/useNotes';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';

export function NoteDetail() {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const openNoteDialog = useUIStore((s) => s.openNoteDialog);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const language = useSettingsStore((s) => s.language);

	const { data: note, isLoading, error } = useNoteQuery(id as $UUID);
	const deleteNoteMutation = useDeleteNoteMutation();

	useEffect(() => {
		if (error) {
			console.error('Failed to fetch note:', error);
			navigate('/');
		}
	}, [error, navigate]);

	useTitle(note?.title || t('app.tagline'));

	const handleEdit = () => {
		if (!note) return;
		openNoteDialog(note.id);
	};

	const handleDelete = async () => {
		if (!note) return;
		try {
			await deleteNoteMutation.mutateAsync(note.id);
			navigate(-1);
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
					onClick={() => navigate(-1)}
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
					{`${t('notes.edited')}: ${formatDateRelativeNative(note.updated_at, {
						locale: language,
					})}`}
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
			<ConfirmDialog
				description={t('trash.confirm.soft.delete')}
				onConfirm={handleDelete}
				onOpenChange={setIsDeleteOpen}
				open={isDeleteOpen}
				title={t('notes.delete')}
			/>
		</div>
	);
}
