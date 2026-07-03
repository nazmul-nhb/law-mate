import { ChevronDown, Trash2 } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { digitToBangla } from 'toolbox-x';
import { EmptyState } from '@/components/EmptyState';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TrashLawList } from '@/features/trash/components/TrashLawList';
import { TrashList } from '@/features/trash/components/TrashList';
import { useTrash } from '@/hooks/useTrash';
import { useSettingsStore } from '@/stores/settings.store';

export function TrashPage() {
	const { t } = useTranslation();
	const {
		deletedNotes,
		deletedLaws,
		isLoading,
		error: trashError,
		restoreNote,
		permanentDeleteNote,
		restoreLaw,
		permanentDeleteLaw,
		refresh,
	} = useTrash();

	useTitle(t('trash.title'));

	const lang = useSettingsStore((s) => s.language);
	const [isNotesOpen, setIsNotesOpen] = useState(true);
	const [isLawsOpen, setIsLawsOpen] = useState(true);

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
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer"
					onClick={refresh}
					type="button"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	const totalCount = deletedNotes.length + deletedLaws.length;

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-bold text-foreground">
				{t('trash.title')} (
				{lang === 'bn' ? digitToBangla(totalCount) : String(totalCount)})
			</h1>

			{totalCount === 0 ? (
				<EmptyState
					description={t('trash.empty.description')}
					icon={Trash2}
					title={t('trash.empty')}
				/>
			) : (
				<div className="space-y-4">
					{/* Laws Section */}
					<Collapsible onOpenChange={setIsLawsOpen} open={isLawsOpen}>
						<CollapsibleTrigger className="flex items-center justify-between w-full p-4 border border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer select-none">
							<h2 className="text-sm font-semibold tracking-tight text-foreground font-mono">
								{t('trash.laws.section')} (
								{lang === 'bn'
									? digitToBangla(deletedLaws.length)
									: String(deletedLaws.length)}
								)
							</h2>
							<ChevronDown
								className={`size-4 text-muted-foreground transition-transform duration-200 ${
									isLawsOpen ? 'rotate-180' : ''
								}`}
							/>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2 overflow-hidden transition-all duration-200">
							{deletedLaws.length === 0 ? (
								<p className="text-xs text-muted-foreground py-4 text-center">
									{t('trash.laws.empty')}
								</p>
							) : (
								<TrashLawList
									laws={deletedLaws}
									onPermanentDelete={permanentDeleteLaw}
									onRestore={restoreLaw}
								/>
							)}
						</CollapsibleContent>
					</Collapsible>

					{/* Notes Section */}
					<Collapsible onOpenChange={setIsNotesOpen} open={isNotesOpen}>
						<CollapsibleTrigger className="flex items-center justify-between w-full p-4 border border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer select-none">
							<h2 className="text-sm font-semibold tracking-tight text-foreground font-mono">
								{t('trash.notes.section')} (
								{lang === 'bn'
									? digitToBangla(deletedNotes.length)
									: String(deletedNotes.length)}
								)
							</h2>
							<ChevronDown
								className={`size-4 text-muted-foreground transition-transform duration-200 ${
									isNotesOpen ? 'rotate-180' : ''
								}`}
							/>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2 overflow-hidden transition-all duration-200">
							{deletedNotes.length === 0 ? (
								<p className="text-xs text-muted-foreground py-4 text-center">
									{t('trash.notes.empty')}
								</p>
							) : (
								<TrashList
									notes={deletedNotes}
									onPermanentDelete={permanentDeleteNote}
									onRestore={restoreNote}
								/>
							)}
						</CollapsibleContent>
					</Collapsible>
				</div>
			)}
		</div>
	);
}
