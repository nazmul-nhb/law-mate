import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { noteRepository } from '@/repositories/note.repository';
import { useUIStore } from '@/stores/ui.store';
import type { Nullable } from '@/types/common.types';

interface NoteDialogProps {
	onSaved?: () => void;
}

export function NoteDialog({ onSaved }: NoteDialogProps = {}) {
	const { t } = useTranslation();
	const { noteDialog, closeNoteDialog } = useUIStore();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<Nullable<string>>(null);

	const isEditing = !!noteDialog.noteId;

	// Load existing note data when editing
	useEffect(() => {
		if (noteDialog.open && noteDialog.noteId) {
			noteRepository.getById(noteDialog.noteId).then((note) => {
				setTitle(note.title);
				setDescription(note.description ?? '');
			});
		} else if (noteDialog.open) {
			setTitle('');
			setDescription('');
		}
	}, [noteDialog.open, noteDialog.noteId]);

	const handleSave = async () => {
		if (!title.trim()) {
			setError(t('notes.title.placeholder'));
			return;
		}

		if (!description.trim()) {
			setError(t('notes.description.placeholder'));
			return;
		}

		setIsSaving(true);
		setError(null);

		try {
			if (isEditing && noteDialog.noteId) {
				await noteRepository.update(noteDialog.noteId, {
					title: title.trim(),
					description: description.trim(),
				});
			} else {
				await noteRepository.create({
					title: title.trim(),
					description: description.trim(),
				});
			}

			closeNoteDialog();
			setTitle('');
			setDescription('');
			window.dispatchEvent(new CustomEvent('note-updated'));
			if (onSaved) onSaved();
		} catch (err) {
			setError(err instanceof Error ? err.message : t('common.error'));
		} finally {
			setIsSaving(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeNoteDialog();
			setTitle('');
			setDescription('');
			setError(null);
		}
	};

	const idForTitle = useId();

	return (
		<Dialog onOpenChange={handleOpenChange} open={noteDialog.open}>
			<DialogContent className="max-h-[90vh] overflow-y-auto max-w-[99%] md:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEditing ? t('notes.edit') : t('notes.create')}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2 max-w-full">
					<div className="space-y-2 max-w-full">
						<Label htmlFor={idForTitle}>{t('notes.title.label')}</Label>
						<Input
							autoFocus
							id={idForTitle}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t('notes.title.placeholder')}
							value={title}
						/>
					</div>

					<div className="space-y-2">
						<Label>{t('notes.description.label')}</Label>
						<MarkdownEditor onChange={setDescription} value={description} />
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}
				</div>

				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>
						{t('notes.cancel')}
					</DialogClose>
					<Button disabled={isSaving || !title.trim()} onClick={handleSave}>
						{isSaving ? t('common.loading') : t('notes.save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
