import type { $UUID } from 'locality-idb';
import { AlertTriangle, Database, Eye, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { idb } from '@/database/db';
import type { Note } from '@/types/note.types';

export function DatabaseExplorer() {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [notes, setNotes] = useState<Note[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [viewingNote, setViewingNote] = useState<Note | null>(null);
	const [confirmClear, setConfirmClear] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	const fetchAllNotes = useCallback(async () => {
		try {
			const data = await idb.from('notes').findAll();
			setNotes(data || []);
			setSelectedIds(new Set());
		} catch (err) {
			console.error('Failed to fetch explorer notes:', err);
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			fetchAllNotes();
		}
	}, [isOpen, fetchAllNotes]);

	// Filter notes locally
	const filteredNotes = notes.filter((note) => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return true;
		return (
			(note.title || '').toLowerCase().includes(q) ||
			(note.description || '').toLowerCase().includes(q)
		);
	});

	// Pagination math
	const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
	const paginatedNotes = filteredNotes.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: searchQuery change triggers page reset
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(new Set(paginatedNotes.map((n) => n.id)));
		} else {
			setSelectedIds(new Set());
		}
	};

	const handleSelectRow = (id: string, checked: boolean) => {
		const next = new Set(selectedIds);
		if (checked) {
			next.add(id);
		} else {
			next.delete(id);
		}
		setSelectedIds(next);
	};

	const handleDeleteSelected = async () => {
		try {
			const ids = Array.from(selectedIds);
			await Promise.all(
				ids.map((id) =>
					idb
						.delete('notes')
						.where('id', id as $UUID)
						.run()
				)
			);
			window.dispatchEvent(new CustomEvent('note-updated'));
			await fetchAllNotes();
			setConfirmDelete(false);
		} catch (err) {
			console.error('Failed to delete notes:', err);
		}
	};

	const handleClearAll = async () => {
		try {
			await idb.clearAll();
			window.dispatchEvent(new CustomEvent('note-updated'));
			await fetchAllNotes();
			setConfirmClear(false);
		} catch (err) {
			console.error('Failed to clear database:', err);
		}
	};

	const handleDeleteSingle = async (id: string) => {
		try {
			await idb
				.delete('notes')
				.where('id', id as $UUID)
				.run();
			window.dispatchEvent(new CustomEvent('note-updated'));
			await fetchAllNotes();
		} catch (err) {
			console.error('Failed to delete note:', err);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/10">
				<div className="space-y-1">
					<h3 className="text-sm font-medium text-foreground">
						{t('settings.data.explore.label')}
					</h3>
					<p className="text-xs text-muted-foreground">
						{t('settings.data.explore.desc')}
					</p>
				</div>
				<Button
					className="cursor-pointer gap-2 shrink-0"
					onClick={() => setIsOpen(true)}
					size="sm"
					variant="outline"
				>
					<Database className="size-4" />
					{t('settings.data.explore.button')}
				</Button>
			</div>

			<Dialog onOpenChange={setIsOpen} open={isOpen}>
				<DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col p-6">
					<DialogHeader>
						<DialogTitle>{t('settings.data.explore.title')}</DialogTitle>
						<DialogDescription>{t('settings.data.explore.desc')}</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col sm:flex-row items-center gap-3 py-2">
						<div className="relative flex-1 w-full">
							<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
							<Input
								className="pl-9 h-9"
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t('search.placeholder')}
								value={searchQuery}
							/>
						</div>
						<div className="flex items-center gap-2 w-full sm:w-auto justify-end">
							<Button
								className="h-9 w-9"
								onClick={fetchAllNotes}
								size="icon-sm"
								variant="ghost"
							>
								<RefreshCw className="size-4" />
							</Button>
							<Button
								className="cursor-pointer h-9"
								disabled={selectedIds.size === 0}
								onClick={() => setConfirmDelete(true)}
								size="sm"
								variant="destructive"
							>
								{t('settings.data.explore.delete.selected')} ({selectedIds.size}
								)
							</Button>
							<Button
								className="cursor-pointer h-9"
								onClick={() => setConfirmClear(true)}
								size="sm"
								variant="destructive"
							>
								{t('settings.data.explore.clear.all')}
							</Button>
						</div>
					</div>

					<div className="flex-1 overflow-auto rounded-md border border-border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12 text-center">
										<input
											checked={
												paginatedNotes.length > 0 &&
												selectedIds.size === paginatedNotes.length
											}
											className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer mt-1"
											onChange={(e) => handleSelectAll(e.target.checked)}
											type="checkbox"
										/>
									</TableHead>
									<TableHead className="text-xs uppercase">
										{t('settings.data.explore.col.title')}
									</TableHead>
									<TableHead className="text-xs uppercase hidden sm:table-cell">
										{t('settings.data.explore.col.owner')}
									</TableHead>
									<TableHead className="text-xs uppercase w-24 text-center">
										{t('settings.data.explore.col.status')}
									</TableHead>
									<TableHead className="text-xs uppercase w-20 text-center">
										{t('settings.data.explore.col.version')}
									</TableHead>
									<TableHead className="w-24 text-right"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedNotes.length > 0 ? (
									paginatedNotes.map((note) => (
										<TableRow key={note.id}>
											<TableCell className="text-center">
												<input
													checked={selectedIds.has(note.id)}
													className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer mt-1"
													onChange={(e) =>
														handleSelectRow(
															note.id,
															e.target.checked
														)
													}
													type="checkbox"
												/>
											</TableCell>
											<TableCell className="font-medium truncate max-w-50">
												{note.title || (
													<span className="text-muted-foreground italic">
														{t('notes.untitled')}
													</span>
												)}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground truncate max-w-30 hidden sm:table-cell">
												{note.user_id || 'anonymous'}
											</TableCell>
											<TableCell className="text-center">
												<span
													className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
														note.deleted_at
															? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
															: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
													}`}
												>
													{note.deleted_at ? 'trash' : 'active'}
												</span>
											</TableCell>
											<TableCell className="text-center text-xs font-mono">
												{note.version}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														onClick={() => setViewingNote(note)}
														size="icon-sm"
														variant="ghost"
													>
														<Eye className="size-4" />
													</Button>
													<Button
														className="hover:text-destructive"
														onClick={() =>
															handleDeleteSingle(note.id)
														}
														size="icon-sm"
														variant="ghost"
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											className="h-24 text-center text-muted-foreground text-xs"
											colSpan={6}
										>
											{t('search.empty')}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination footer */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between gap-4 py-2 border-t mt-4 text-xs text-muted-foreground">
							<div>
								Page {currentPage} of {totalPages} ({filteredNotes.length}{' '}
								total)
							</div>
							<div className="flex gap-2">
								<Button
									disabled={currentPage === 1}
									onClick={() => setCurrentPage((c) => c - 1)}
									size="sm"
									variant="outline"
								>
									{t('trash.restore')}
									Prev
								</Button>
								<Button
									disabled={currentPage === totalPages}
									onClick={() => setCurrentPage((c) => c + 1)}
									size="sm"
									variant="outline"
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Viewing Note Dialog */}
			<Dialog onOpenChange={(open) => !open && setViewingNote(null)} open={!!viewingNote}>
				<DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{viewingNote?.title || t('notes.untitled')}</DialogTitle>
						<DialogDescription className="font-mono text-[10px] break-all">
							ID: {viewingNote?.id}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2 text-xs">
						<div className="grid grid-cols-2 gap-4 border-b border-border pb-3 text-muted-foreground">
							<div>
								<span className="font-semibold text-foreground">User ID:</span>{' '}
								{viewingNote?.user_id || 'anonymous'}
							</div>
							<div>
								<span className="font-semibold text-foreground">Version:</span>{' '}
								{viewingNote?.version}
							</div>
							<div>
								<span className="font-semibold text-foreground">Created:</span>{' '}
								{viewingNote?.created_at}
							</div>
							<div>
								<span className="font-semibold text-foreground">Updated:</span>{' '}
								{viewingNote?.updated_at}
							</div>
							{viewingNote?.deleted_at ? (
								<div className="col-span-2 text-rose-500 font-semibold">
									Deleted At: {viewingNote.deleted_at}
								</div>
							) : null}
						</div>
						<div className="space-y-1">
							<span className="font-semibold text-foreground">
								Description / Content:
							</span>
							<pre className="p-3 bg-muted border rounded-md whitespace-pre-wrap font-mono text-xs max-h-48 overflow-auto leading-relaxed">
								{viewingNote?.description || t('notes.no.description')}
							</pre>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={() => setViewingNote(null)}>
							{t('common.close')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirm Delete Dialog */}
			<Dialog onOpenChange={setConfirmDelete} open={confirmDelete}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="size-5 text-destructive" />
							{t('settings.data.explore.delete.selected')}
						</DialogTitle>
						<DialogDescription>
							{t('settings.data.explore.confirm.delete')}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button onClick={() => setConfirmDelete(false)} variant="outline">
							{t('notes.cancel')}
						</Button>
						<Button
							className="cursor-pointer"
							onClick={handleDeleteSelected}
							variant="destructive"
						>
							{t('common.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirm Clear Dialog */}
			<Dialog onOpenChange={setConfirmClear} open={confirmClear}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="size-5 text-destructive animate-pulse" />
							{t('settings.data.explore.clear.all')}
						</DialogTitle>
						<DialogDescription>
							{t('settings.data.explore.confirm.clear')}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button onClick={() => setConfirmClear(false)} variant="outline">
							{t('notes.cancel')}
						</Button>
						<Button
							className="cursor-pointer"
							onClick={handleClearAll}
							variant="destructive"
						>
							{t('common.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
