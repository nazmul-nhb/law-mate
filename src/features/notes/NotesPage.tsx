import type { $UUID } from 'locality-idb';
import { BookOpen, FolderPlus, Menu, Plus } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { digitToBangla } from 'toolbox-x';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { LawDialog } from '@/features/notes/components/LawDialog';
import { LawSidebar } from '@/features/notes/components/LawSidebar';
import { NoteDialog } from '@/features/notes/components/NoteDialog';
import { NoteList } from '@/features/notes/components/NoteList';
import { useLaws } from '@/hooks/useLaws';
import { useNotes } from '@/hooks/useNotes';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useSettingsStore } from '@/stores/settings.store';
import { useUIStore } from '@/stores/ui.store';
import type { Nullable } from '@/types/common.types';

export function NotesPage() {
	const { t } = useTranslation();
	const {
		notes,
		isLoading: isNotesLoading,
		error: notesError,
		refresh: refreshNotes,
		deleteNote,
	} = useNotes();
	const { laws, isLoading: isLawsLoading, error: lawsError, deleteLaw } = useLaws();
	const openNoteDialog = useUIStore((s) => s.openNoteDialog);
	const { getQueryParam, setQueryParams } = useQueryParams();

	const [deleteConfirmId, setDeleteConfirmId] = useState<Nullable<$UUID>>(null);
	const [lawDeleteConfirmId, setLawDeleteConfirmId] = useState<Nullable<$UUID>>(null);
	const [isLawDialogOpen, setIsLawDialogOpen] = useState(false);
	const [editingLawId, setEditingLawId] = useState<Nullable<$UUID>>(null);
	const [isMobileLawsOpen, setIsMobileLawsOpen] = useState(false);

	const lang = useSettingsStore((s) => s.language);
	useTitle(t('app.tagline'), { position: 'after' });

	const urlLawId = getQueryParam<$UUID>('law_id');
	const selectedLawId: Nullable<$UUID> =
		urlLawId && laws.some((l) => l.id === urlLawId) ? urlLawId : (laws[0]?.id ?? null);

	const handleSelectLaw = useCallback(
		(id: Nullable<$UUID>) => {
			setQueryParams({ law_id: id });
		},
		[setQueryParams]
	);

	// Ensure default law ID is reflected in URL if missing
	useEffect(() => {
		if (laws.length > 0 && !urlLawId) {
			setQueryParams({ law_id: laws[0].id });
		}
	}, [laws, urlLawId, setQueryParams]);

	const handleConfirmDeleteNote = async () => {
		if (deleteConfirmId) {
			await deleteNote(deleteConfirmId);
			setDeleteConfirmId(null);
		}
	};

	const handleConfirmDeleteLaw = async () => {
		if (lawDeleteConfirmId) {
			await deleteLaw(lawDeleteConfirmId);
			if (selectedLawId === lawDeleteConfirmId) {
				const nextLawId = laws.find((l) => l.id !== lawDeleteConfirmId)?.id || null;
				handleSelectLaw(nextLawId);
			}
			setLawDeleteConfirmId(null);
			refreshNotes();
		}
	};

	const selectedLaw = laws.find((l) => l.id === selectedLawId);
	const activeNotes = notes.filter((n) => n.law_id === selectedLawId);
	const totalNotes = activeNotes.length;

	if (isNotesLoading || isLawsLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<p className="text-sm text-muted-foreground">{t('common.loading')}</p>
			</div>
		);
	}

	const error = notesError || lawsError;
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-16">
				<p className="text-sm text-destructive">{error}</p>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-100px)] border border-border rounded-lg overflow-hidden bg-background">
			{/* Desktop Left Sidebar */}
			<div className="hidden md:block h-full shrink-0 w-64">
				<LawSidebar
					laws={laws}
					onAddLaw={() => {
						setEditingLawId(null);
						setIsLawDialogOpen(true);
					}}
					onDeleteLaw={(id) => setLawDeleteConfirmId(id)}
					onEditLaw={(id) => {
						setEditingLawId(id);
						setIsLawDialogOpen(true);
					}}
					onSelectLaw={handleSelectLaw}
					selectedLawId={selectedLawId}
				/>
			</div>

			{/* Mobile Left Drawer Sheet */}
			<Sheet onOpenChange={setIsMobileLawsOpen} open={isMobileLawsOpen}>
				<SheetContent className="w-72 p-0 h-full border-r border-border" side="left">
					<LawSidebar
						laws={laws}
						onAddLaw={() => {
							setIsMobileLawsOpen(false);
							setEditingLawId(null);
							setIsLawDialogOpen(true);
						}}
						onDeleteLaw={(id) => {
							setIsMobileLawsOpen(false);
							setLawDeleteConfirmId(id);
						}}
						onEditLaw={(id) => {
							setIsMobileLawsOpen(false);
							setEditingLawId(id);
							setIsLawDialogOpen(true);
						}}
						onSelectLaw={(id) => {
							handleSelectLaw(id);
							setIsMobileLawsOpen(false);
						}}
						isMobileDevice={isMobileLawsOpen}
						selectedLawId={selectedLawId}
					/>
				</SheetContent>
			</Sheet>

			{/* Main Notes Area */}
			<div className="flex-1 flex flex-col h-full bg-background overflow-hidden p-4">
				{/* Mobile Header bar */}
				<div className="flex items-center justify-between flex-wrap md:hidden mb-4 shrink-0 border-b border-border pb-3">
					<button
						className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
						onClick={() => setIsMobileLawsOpen(true)}
						type="button"
					>
						<Menu className="size-4" />
						{selectedLaw ? selectedLaw.title : t('laws.select')}
					</button>

					<button
						className="flex items-center gap-1 text-xs text-primary font-semibold cursor-pointer"
						onClick={() => {
							setEditingLawId(null);
							setIsLawDialogOpen(true);
						}}
						type="button"
					>
						<FolderPlus className="size-3.5" />
						{t('laws.create')}
					</button>
				</div>

				{selectedLaw ? (
					<div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
						{/* Law Detail summary Card */}
						<div className="mb-6 space-y-3 bg-muted/20 border border-border p-4 rounded-lg shrink-0">
							<div className="flex items-center justify-between flex-wrap gap-4">
								<h1 className="text-lg font-bold text-foreground flex items-center flex-wrap gap-2">
									<span>{selectedLaw.title}</span>
									<span className="text-sm font-semibold text-primary font-mono bg-background px-2 pb-0.5 pt-1  rounded border border-border shrink-0">
										{lang === 'bn'
											? digitToBangla(totalNotes).concat(' টি')
											: String(totalNotes)}{' '}
										{t('notes.title')}
									</span>
								</h1>
								<button
									className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer shrink-0"
									onClick={() => openNoteDialog()}
									type="button"
								>
									<Plus className="size-3.5" />
									{t('notes.create')}
								</button>
							</div>
							{selectedLaw.description ? (
								<div className="text-xs text-muted-foreground prose dark:prose-invert max-w-none pt-2 border-t border-border/40">
									<MarkdownPreview content={selectedLaw.description} />
								</div>
							) : null}
						</div>

						{/* Notes Grid */}
						<div className="flex-1 min-h-0 overflow-y-auto pr-1">
							<NoteList
								notes={activeNotes}
								onCreateClick={() => openNoteDialog()}
								onDelete={setDeleteConfirmId}
							/>
						</div>
					</div>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center text-center p-8">
						<BookOpen className="size-12 text-muted-foreground/40 mb-4 animate-pulse" />
						<h2 className="text-base font-semibold text-foreground mb-1">
							{t('laws.unselected.title')}
						</h2>
						<p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6 font-mono">
							{t('laws.unselected.desc')}
						</p>
						<Button
							onClick={() => {
								setEditingLawId(null);
								setIsLawDialogOpen(true);
							}}
							size="sm"
						>
							<FolderPlus className="size-4 mr-2" />
							{t('laws.create')}
						</Button>
					</div>
				)}
			</div>

			{/* Soft delete note confirmation */}
			<ConfirmDialog
				description={t('trash.confirm.soft.delete')}
				onConfirm={handleConfirmDeleteNote}
				onOpenChange={(open) => !open && setDeleteConfirmId(null)}
				open={!!deleteConfirmId}
				title={t('notes.delete')}
			/>

			{/* Soft delete law confirmation */}
			<ConfirmDialog
				description={t('laws.confirm.soft.delete')}
				onConfirm={handleConfirmDeleteLaw}
				onOpenChange={(open) => !open && setLawDeleteConfirmId(null)}
				open={!!lawDeleteConfirmId}
				title={t('laws.delete')}
			/>

			{/* Note Dialog */}
			<NoteDialog defaultLawId={selectedLawId} />

			{/* Law Dialog */}
			<LawDialog
				lawId={editingLawId}
				onOpenChange={setIsLawDialogOpen}
				onSelectLaw={(id) => {
					handleSelectLaw(id);
					if (isMobileLawsOpen) {
						setIsMobileLawsOpen(false);
					}
				}}
				open={isLawDialogOpen}
			/>
		</div>
	);
}
