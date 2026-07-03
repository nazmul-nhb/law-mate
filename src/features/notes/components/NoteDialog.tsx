import type { $UUID } from 'locality-idb';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Button } from '@/components/ui/button';
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox';
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
import { lawRepository } from '@/repositories/law.repository';
import { noteRepository } from '@/repositories/note.repository';
import { useUIStore } from '@/stores/ui.store';
import type { Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';

interface NoteDialogProps {
	onSaved?: () => void;
	defaultLawId?: Nullable<$UUID>;
}

export function NoteDialog({ onSaved, defaultLawId }: NoteDialogProps = {}) {
	const { t } = useTranslation();
	const { noteDialog, closeNoteDialog } = useUIStore();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [laws, setLaws] = useState<Law[]>([]);
	const [selectedLawId, setSelectedLawId] = useState<Nullable<$UUID>>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<Nullable<string>>(null);

	const isEditing = !!noteDialog.noteId;

	// Load laws
	useEffect(() => {
		if (noteDialog.open) {
			lawRepository.getAll().then((data) => {
				setLaws(data || []);
			});
		}
	}, [noteDialog.open]);

	// Load existing note data when editing
	useEffect(() => {
		if (noteDialog.open && noteDialog.noteId) {
			noteRepository.getById(noteDialog.noteId).then((note) => {
				setTitle(note.title);
				setDescription(note.description ?? '');
				setSelectedLawId(note.law_id);
			});
		} else if (noteDialog.open) {
			setTitle('');
			setDescription('');
			setSelectedLawId(defaultLawId || null);
		}
	}, [noteDialog.open, noteDialog.noteId, defaultLawId]);

	const handleSave = async () => {
		if (!selectedLawId) {
			setError(t('notes.law.required'));
			return;
		}

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
					law_id: selectedLawId,
				});
			} else {
				await noteRepository.create({
					title: title.trim(),
					description: description.trim(),
					law_id: selectedLawId,
				});
			}

			closeNoteDialog();
			setTitle('');
			setDescription('');
			setSelectedLawId(null);
			window.dispatchEvent(new CustomEvent('note-updated'));
			onSaved?.();
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
			setSelectedLawId(null);
			setError(null);
		}
	};

	const idForTitle = useId();
	const selectedLaw = laws.find((l) => l.id === selectedLawId) ?? null;

	return (
		<Dialog onOpenChange={handleOpenChange} open={noteDialog.open}>
			<DialogContent className="max-h-[90vh] overflow-y-auto max-w-[99%] md:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEditing ? t('notes.edit') : t('notes.create')}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2 max-w-full">
					<div className="space-y-2">
						<Label>{t('notes.law.label')}</Label>
						<Combobox
							isItemEqualToValue={(a: Nullable<Law>, b: Nullable<Law>) =>
								a?.id === b?.id
							}
							items={laws}
							itemToStringLabel={(item: Nullable<Law>) => item?.title ?? ''}
							itemToStringValue={(item: Nullable<Law>) => item?.id ?? ''}
							onValueChange={(law) => setSelectedLawId(law?.id ?? null)}
							value={selectedLaw}
						>
							<ComboboxInput placeholder={t('notes.law.placeholder')} />
							<ComboboxContent>
								<ComboboxEmpty>{t('notes.law.empty')}</ComboboxEmpty>
								<ComboboxList>
									{(item: Law) => (
										<ComboboxItem key={item.id} value={item}>
											{item.title}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
					</div>

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

				<DialogFooter className="gap-2 sm:gap-3">
					<DialogClose render={<Button variant="outline" />}>
						{t('notes.cancel')}
					</DialogClose>
					<Button className="cursor-pointer" disabled={isSaving} onClick={handleSave}>
						{isSaving ? t('common.loading') : t('notes.save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
