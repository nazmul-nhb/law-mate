import { useQuery } from '@tanstack/react-query';
import type { $UUID } from 'locality-idb';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
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
import { lawKeys } from '@/hooks/useLaws';
import { useCreateNoteMutation, useNoteQuery, useUpdateNoteMutation } from '@/hooks/useNotes';
import { useQueryParams } from '@/hooks/useQueryParams';
import { lawRepository } from '@/repositories/law.repository';
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
	const [selectedLawId, setSelectedLawId] = useState<Nullable<$UUID>>(null);
	const [error, setError] = useState<Nullable<string>>(null);
	const navigate = useNavigate();

	const { getQueryParam } = useQueryParams();

	const isEditing = !!noteDialog.noteId;

	// Load laws using TanStack Query
	const { data: laws = [] } = useQuery<Law[], Error>({
		queryKey: lawKeys.list('title', 'asc'),
		queryFn: () => lawRepository.getAll('title', 'asc'),
		enabled: noteDialog.open,
	});

	// Load existing note data using reusable hook when editing
	const { data: existingNote } = useNoteQuery(noteDialog.noteId || undefined);

	const createMutation = useCreateNoteMutation();
	const updateMutation = useUpdateNoteMutation();
	const isSaving = createMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		if (noteDialog.open && existingNote && noteDialog.noteId) {
			setTitle(existingNote.title);
			setDescription(existingNote.description ?? '');
			setSelectedLawId(existingNote.law_id);
		} else if (noteDialog.open && !noteDialog.noteId) {
			setTitle('');
			setDescription('');
			setSelectedLawId(defaultLawId || null);

			const lawId = getQueryParam<$UUID>('law_id');
			if (lawId) {
				setSelectedLawId(lawId);
			}
		}
	}, [noteDialog.open, noteDialog.noteId, existingNote, defaultLawId, getQueryParam]);

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

		setError(null);

		try {
			if (isEditing && noteDialog.noteId) {
				await updateMutation.mutateAsync({
					id: noteDialog.noteId,
					input: {
						title: title.trim(),
						description: description.trim(),
						law_id: selectedLawId,
					},
				});
				closeNoteDialog();
				setTitle('');
				setDescription('');
				setSelectedLawId(null);
				onSaved?.();
			} else {
				const createdNote = await createMutation.mutateAsync({
					title: title.trim(),
					description: description.trim(),
					law_id: selectedLawId,
				});
				closeNoteDialog();
				setTitle('');
				setDescription('');
				setSelectedLawId(null);
				if (createdNote) {
					navigate(`/note/${createdNote.id}`, { replace: true });
				}
				onSaved?.();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : t('common.error'));
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
							<ComboboxInput
								autoFocus={false}
								placeholder={t('notes.law.placeholder')}
							/>
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
