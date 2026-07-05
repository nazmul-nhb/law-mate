import type { $UUID } from 'locality-idb';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateRelativeNative } from 'toolbox-x/date';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Separator } from '@/components/ui/separator';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { useSettingsStore } from '@/stores/settings.store';
import type { IDBTableNames, Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

interface TrashListProps<Data extends Law | Note> {
	data: Data[];
	i18nPrefix: IDBTableNames;
	onRestore: (id: $UUID) => Promise<boolean>;
	onPermanentDelete: (id: $UUID) => Promise<boolean>;
}

export function TrashList<Data extends Law | Note>({
	data,
	i18nPrefix,
	onRestore,
	onPermanentDelete,
}: TrashListProps<Data>) {
	const { t } = useTranslation();
	const [confirmId, setConfirmId] = useState<Nullable<$UUID>>(null);

	const language = useSettingsStore((s) => s.language);

	const handleConfirmDelete = async () => {
		if (!confirmId) return;
		await onPermanentDelete(confirmId);
		setConfirmId(null);
	};

	return (
		<Fragment>
			<div className="grid md:grid-cols-2 gap-2">
				{data.map((item) => (
					<div className="rounded-lg border border-border bg-card p-4" key={item.id}>
						<div className="min-w-0 flex-1">
							<h3 className="flex items-center justify-between gap-2 flex-wrap truncate line-clamp-1 text-sm font-medium text-foreground">
								<span>{item.title || t(`notes.untitled`)}</span>

								<div className="flex items-center gap-1">
									<TooltipSimple content={t('trash.restore')}>
										<button
											className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
											onClick={() => onRestore(item.id)}
											type="button"
										>
											<RotateCcw className="size-5" />
										</button>
									</TooltipSimple>
									<Separator orientation="vertical" />
									<TooltipSimple content={t('trash.delete.permanent')}>
										<button
											className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
											onClick={() => setConfirmId(item.id)}
											type="button"
										>
											<Trash2 className="size-5" />
										</button>
									</TooltipSimple>
								</div>
							</h3>
							{item.deleted_at ? (
								<p className="mt-2 text-xs text-muted-foreground font-mono">
									{t(`${i18nPrefix}.deleted.success`)}
									{': '}
									<span className="font-semibold">
										{formatDateRelativeNative(item.deleted_at, {
											locale: language,
										})}
									</span>
								</p>
							) : null}
						</div>
					</div>
				))}
			</div>

			{/* Confirm permanent delete dialog */}
			<ConfirmDialog
				description={t('trash.confirm.delete')}
				onConfirm={handleConfirmDelete}
				onOpenChange={(open) => !open && setConfirmId(null)}
				open={!!confirmId}
				title={t('trash.delete.permanent')}
			/>
		</Fragment>
	);
}
