import { flexRender } from '@tanstack/react-table';
import type { $UUID } from 'locality-idb';
import { AlertTriangle, ArrowLeft, Database, RefreshCw, Search } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { idb } from '@/database/db';
import { useIDBETable } from '@/hooks/useIDBETable';
import type { Nullable } from '@/types/common.types';
import type { Note } from '@/types/note.types';

const PAGE_LIMITS = [5, 10, 20, 30, 40, 50].map((val) => ({
	value: val,
	label: String(val),
}));

export function IDBExplorerPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [notes, setNotes] = useState<Note[]>([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [viewingNote, setViewingNote] = useState<Nullable<Note>>(null);
	const [confirmClear, setConfirmClear] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const fetchAllNotes = useCallback(async () => {
		try {
			const data = await idb.from('notes').findAll();
			setNotes(data || []);
		} catch (err) {
			console.error('Failed to fetch IDB notes:', err);
		}
	}, []);

	useEffect(() => {
		fetchAllNotes();
	}, [fetchAllNotes]);

	const { table } = useIDBETable({
		notes,
		globalFilter,
		setGlobalFilter,
		onView: (note) => setViewingNote(note),
		onDelete: async (id) => {
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
		},
	});

	const selectedRows = table.getSelectedRowModel().flatRows;

	const handleDeleteSelected = async () => {
		try {
			const ids = selectedRows.map((r) => r.original.id);
			await Promise.all(ids.map((id) => idb.delete('notes').where('id', id).run()));
			window.dispatchEvent(new CustomEvent('note-updated'));
			await fetchAllNotes();
			table.resetRowSelection();
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
			table.resetRowSelection();
			setConfirmClear(false);
		} catch (err) {
			console.error('Failed to clear database:', err);
		}
	};

	useTitle(t('settings.data.explore.label'));

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Button
					className="h-8 w-8 cursor-pointer"
					onClick={() => navigate('/settings')}
					size="icon-sm"
					variant="ghost"
				>
					<ArrowLeft className="size-4" />
				</Button>
				<Database className="size-6 text-primary" />
				<h1 className="text-xl font-bold text-foreground">
					{t('settings.data.explore.title')}
				</h1>
			</div>

			<div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="relative max-w-sm w-full">
						<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
						<Input
							className="pl-9 h-9"
							onChange={(e) => setGlobalFilter(e.target.value)}
							placeholder={t('search.placeholder')}
							value={globalFilter}
						/>
					</div>

					<div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
						<Button
							className="h-9 w-9 shrink-0"
							onClick={fetchAllNotes}
							size="icon-sm"
							variant="ghost"
						>
							<RefreshCw className="size-4" />
						</Button>
						<Button
							className="cursor-pointer h-9 shrink-0"
							disabled={selectedRows.length === 0}
							onClick={() => setConfirmDelete(true)}
							size="sm"
							variant="destructive"
						>
							{t('settings.data.explore.delete.selected')} ({selectedRows.length})
						</Button>
						<Button
							className="cursor-pointer h-9 shrink-0"
							onClick={() => setConfirmClear(true)}
							size="sm"
							variant="destructive"
						>
							{t('settings.data.explore.clear.all')}
						</Button>
						<div className="flex items-center gap-2 shrink-0">
							<span className="text-xs text-muted-foreground whitespace-nowrap">
								Rows per page:
							</span>
							<Select
								onValueChange={(val) => table.setPageSize(Number(val))}
								value={String(table.getState().pagination.pageSize)}
							>
								<SelectTrigger className="h-8 w-17.5 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PAGE_LIMITS.map((limit) => (
										<SelectItem
											key={limit.value}
											value={String(limit.value)}
										>
											{limit.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<div className="rounded-md border border-border overflow-hidden">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead className="px-4 py-3" key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.length > 0 ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												className="px-4 py-2 text-xs"
												key={cell.id}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										className="h-24 text-center text-muted-foreground text-xs"
										colSpan={table.getAllColumns().length}
									>
										{t('search.empty')}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{table.getPageCount() > 1 && (
					<div className="flex items-center justify-between gap-4 py-2 border-t mt-4 text-xs text-muted-foreground">
						<div>
							Page {table.getState().pagination.pageIndex + 1} of{' '}
							{table.getPageCount()} ({table.getFilteredRowModel().rows.length}{' '}
							total)
						</div>
						<div className="flex gap-2">
							<Button
								disabled={!table.getCanPreviousPage()}
								onClick={() => table.previousPage()}
								size="sm"
								variant="outline"
							>
								Prev
							</Button>
							<Button
								disabled={!table.getCanNextPage()}
								onClick={() => table.nextPage()}
								size="sm"
								variant="outline"
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Viewing Note Dialog */}
			<Dialog onOpenChange={(open) => !open && setViewingNote(null)} open={!!viewingNote}>
				<DialogContent className="max-w-lg sm:max-w-[96%] md:max-w-2xl max-h-[80vh] overflow-y-auto">
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
						<div className="space-y-2">
							<div className="font-semibold text-foreground">
								{t('notes.description.label')}:
							</div>
							<ScrollArea className="h-40 overflow-auto">
								<pre className="p-3 bg-muted border rounded-md whitespace-pre-wrap font-mono text-xs  leading-relaxed">
									{viewingNote?.description || t('notes.no.description')}
								</pre>
							</ScrollArea>
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
							<AlertTriangle className="size-5 text-destructive" />
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
