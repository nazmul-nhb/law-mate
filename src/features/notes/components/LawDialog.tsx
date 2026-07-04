import type { $UUID } from 'locality-idb';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { generateQueryParams } from 'toolbox-x';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CUSTOM_EVENTS } from '@/constants/app';
import { lawRepository } from '@/repositories/law.repository';
import type { Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';

interface LawDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelectLaw?: (id: $UUID) => void;
	lawId?: Nullable<$UUID>;
	onSaved?: () => void;
}

export function LawDialog({ open, onOpenChange, lawId, onSelectLaw, onSaved }: LawDialogProps) {
	const { t } = useTranslation();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<Nullable<string>>(null);

	const navigate = useNavigate();

	const isEditing = !!lawId;

	useEffect(() => {
		if (open && lawId) {
			lawRepository.getById(lawId).then((law) => {
				setTitle(law.title);
				setDescription(law.description ?? '');
			});
		} else if (open) {
			setTitle('');
			setDescription('');
		}
	}, [open, lawId]);

	const handleSave = async () => {
		if (!title.trim()) {
			setError(t('laws.title.required'));
			return;
		}

		setIsSaving(true);
		setError(null);

		let createdLaw: Nullable<Law> = null;

		try {
			if (isEditing && lawId) {
				await lawRepository.update(lawId, {
					title: title.trim(),
					description: description.trim() || undefined,
				});
			} else {
				createdLaw = await lawRepository.create({
					title: title.trim(),
					description: description.trim() || undefined,
				});
			}

			onOpenChange(false);
			setTitle('');
			setDescription('');
			window.dispatchEvent(new CustomEvent(CUSTOM_EVENTS.LAWS_UPDATED));

			if (createdLaw) {
				onSelectLaw?.(createdLaw.id);
				const queryString = generateQueryParams({ law_id: createdLaw.id });
				navigate({ pathname: '/', search: queryString }, { replace: true });
			}

			onSaved?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : t('common.error'));
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		setTitle('');
		setDescription('');
		setError(null);
	};

	const idForTitle = useId();

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[90vh] overflow-y-auto max-w-[99%] md:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEditing ? t('laws.edit') : t('laws.create')}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2 max-w-full">
					<div className="space-y-2 max-w-full">
						<Label htmlFor={idForTitle}>{t('laws.title.label')}</Label>
						<Input
							autoFocus
							id={idForTitle}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t('laws.title.placeholder')}
							value={title}
						/>
					</div>

					<div className="space-y-2">
						<Label>{t('laws.description.label')}</Label>
						<MarkdownEditor
							onChange={setDescription}
							placeholder={t('laws.description.placeholder')}
							value={description}
						/>
					</div>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}
				</div>

				<DialogFooter className="gap-2 sm:gap-3">
					<Button onClick={handleClose} variant="outline">
						{t('notes.cancel')}
					</Button>
					<Button className="cursor-pointer" disabled={isSaving} onClick={handleSave}>
						{isSaving ? t('common.loading') : t('notes.save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
