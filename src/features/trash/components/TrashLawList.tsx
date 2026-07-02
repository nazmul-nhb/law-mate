import type { $UUID } from 'locality-idb';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateRelativeNative } from 'toolbox-x/date';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Separator } from '@/components/ui/separator';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { useSettingsStore } from '@/stores/settings.store';
import type { Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';

interface TrashLawListProps {
	laws: Law[];
	onRestore: (id: $UUID) => Promise<boolean>;
	onPermanentDelete: (id: $UUID) => Promise<boolean>;
}

export function TrashLawList({ laws, onRestore, onPermanentDelete }: TrashLawListProps) {
	const { t } = useTranslation();
	const [confirmId, setConfirmId] = useState<Nullable<$UUID>>(null);

	const language = useSettingsStore((s) => s.language);

	const handleConfirmDelete = async () => {
		if (!confirmId) return;
		await onPermanentDelete(confirmId);
		setConfirmId(null);
	};

	return (
		<div className="space-y-4">
			<div className="grid md:grid-cols-2 gap-2">
				{laws.map((law) => (
					<div className="rounded-lg border border-border bg-card p-4" key={law.id}>
						<div className="min-w-0 flex-1">
							<h3 className="flex items-center justify-between gap-2 flex-wrap truncate line-clamp-1 text-sm font-medium text-foreground">
								<span>{law.title}</span>

								<div className="flex items-center gap-1">
									<TooltipSimple content={t('trash.restore')}>
										<button
											className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
											onClick={() => onRestore(law.id)}
											type="button"
										>
											<RotateCcw className="size-5" />
										</button>
									</TooltipSimple>
									<Separator orientation="vertical" />
									<TooltipSimple content={t('trash.delete.permanent')}>
										<button
											className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
											onClick={() => setConfirmId(law.id)}
											type="button"
										>
											<Trash2 className="size-5" />
										</button>
									</TooltipSimple>
								</div>
							</h3>
							{law.deleted_at ? (
								<p className="mt-2 text-xs text-muted-foreground font-mono">
									{t('notes.deleted.success')}
									{': '}
									<span className="font-semibold">
										{formatDateRelativeNative(law.deleted_at, {
											locale: language,
										})}
									</span>
								</p>
							) : null}
						</div>
					</div>
				))}
			</div>

			<ConfirmDialog
				description={t(
					'trash.confirm.delete',
					'Are you sure you want to permanently delete this law? This action is irreversible.'
				)}
				onConfirm={handleConfirmDelete}
				onOpenChange={(open) => !open && setConfirmId(null)}
				open={!!confirmId}
				title={t('trash.delete.permanent')}
			/>
		</div>
	);
}
