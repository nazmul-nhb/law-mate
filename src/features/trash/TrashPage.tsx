import { Trash2 } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/EmptyState';
import { TrashList } from '@/features/trash/components/TrashList';
import { useTrash } from '@/hooks/useTrash';

export function TrashPage() {
	const { t } = useTranslation();
	const {
		deletedNotes,
		isLoading,
		error: trashError,
		restoreNote,
		permanentDeleteNote,
		refresh,
	} = useTrash();

	useTitle(t('trash.title'));

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<p className="text-sm text-muted-foreground">{t('common.loading')}</p>
			</div>
		);
	}

	if (trashError) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16">
				<p className="text-sm text-destructive">{trashError}</p>
				<button
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
					onClick={refresh}
					type="button"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1 className="mb-6 text-xl font-bold text-foreground">{t('trash.title')}</h1>

			{deletedNotes.length === 0 ? (
				<EmptyState
					description={t('trash.empty.description')}
					icon={Trash2}
					title={t('trash.empty')}
				/>
			) : (
				<TrashList
					notes={deletedNotes}
					onPermanentDelete={permanentDeleteNote}
					onRestore={restoreNote}
				/>
			)}
		</div>
	);
}
