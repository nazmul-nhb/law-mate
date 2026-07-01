import type { $UUID } from 'locality-idb';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateRelative } from 'toolbox-x/date';
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
import type { Nullable } from '@/types/common.types';
import type { Note } from '@/types/note.types';

interface TrashListProps {
	notes: Note[];
	onRestore: (id: $UUID) => Promise<boolean>;
	onPermanentDelete: (id: $UUID) => Promise<boolean>;
}

export function TrashList({ notes, onRestore, onPermanentDelete }: TrashListProps) {
	const { t } = useTranslation();
	const [confirmId, setConfirmId] = useState<Nullable<$UUID>>(null);

	const handleConfirmDelete = async () => {
		if (!confirmId) return;
		await onPermanentDelete(confirmId);
		setConfirmId(null);
	};

	return (
		<>
			<div className="space-y-2">
				{notes.map((note) => (
					<div
						className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
						key={note.id}
					>
						<div className="min-w-0 flex-1">
							<h3 className="truncate text-sm font-medium text-foreground">
								{note.title || t('notes.untitled')}
							</h3>
							<p className="mt-0.5 text-xs text-muted-foreground">
								{note.deleted_at && formatDateRelative(note.deleted_at)}
							</p>
						</div>

						<div className="flex items-center gap-1">
							<TooltipSimple content={t('trash.restore')}>
								<button
									className="rounded p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
									onClick={() => onRestore(note.id)}
									type="button"
								>
									<RotateCcw className="size-4" />
								</button>
							</TooltipSimple>
							<TooltipSimple content={t('trash.delete.permanent')}>
								<button
									className="rounded p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
									onClick={() => setConfirmId(note.id)}
									type="button"
								>
									<Trash2 className="size-4" />
								</button>
							</TooltipSimple>
						</div>
					</div>
				))}
			</div>

			{/* Confirm permanent delete dialog */}
			<Dialog onOpenChange={(open) => !open && setConfirmId(null)} open={!!confirmId}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t('trash.delete.permanent')}</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">{t('trash.confirm.delete')}</p>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							{t('notes.cancel')}
						</DialogClose>
						<Button onClick={handleConfirmDelete} variant="destructive">
							{t('common.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
