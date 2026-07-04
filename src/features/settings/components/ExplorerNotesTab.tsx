import { flexRender } from '@tanstack/react-table';
import type { $UUID } from 'locality-idb';
import { RefreshCw, Search } from 'lucide-react';
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
import { CUSTOM_EVENTS } from '@/constants/app';
import { idb } from '@/database/db';
import ExplorerDataView from '@/features/settings/components/ExplorerDataView';
import { useExplorerTables } from '@/hooks/useExplorerTables';
import type { Nullable } from '@/types/common.types';
import type { Note } from '@/types/note.types';

const PAGE_LIMITS = [5, 10, 20, 30, 40, 50].map((val) => ({
	value: val,
	label: String(val),
}));

interface ExplorerNotesTabProps {
	localizeNumber: (val: number | string) => string;
	setConfirmConfig: (
		config: Nullable<{
			title: string;
			description: string;
			onConfirm: () => void | Promise<void>;
			variant?: 'default' | 'destructive';
		}>
	) => void;
}

export function ExplorerNotesTab({ localizeNumber, setConfirmConfig }: ExplorerNotesTabProps) {
	const { t } = useTranslation();
	const [notes, setNotes] = useState<Note[]>([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [viewingNote, setViewingNote] = useState<Nullable<Note>>(null);

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

	const { table } = useExplorerTables({
		data: notes,
		globalFilter,
		setGlobalFilter,
		onView: (note) => setViewingNote(note),
		onDelete: (id) => {
			setConfirmConfig({
				title: t('settings.data.explore.delete.single'),
				description: t('settings.data.explore.confirm.delete.single'),
				onConfirm: async () => {
					try {
						await idb
							.delete('notes')
							.where('id', id as $UUID)
							.run();
						window.dispatchEvent(new CustomEvent(CUSTOM_EVENTS.NOTES_UPDATED));
						await fetchAllNotes();
					} catch (err) {
						console.error('Failed to delete note:', err);
					}
				},
			});
		},
	});

	const selectedRows = table.getSelectedRowModel().flatRows;

	const handleDeleteSelected = async () => {
		try {
			const ids = selectedRows.map((r) => r.original.id);
			await Promise.all(ids.map((id) => idb.delete('notes').where('id', id).run()));
			window.dispatchEvent(new CustomEvent(CUSTOM_EVENTS.NOTES_UPDATED));
			await fetchAllNotes();
			table.resetRowSelection();
		} catch (err) {
			console.error('Failed to delete notes:', err);
		}
	};

	const handleClearAll = async () => {
		try {
			await idb.delete('notes').run();
			window.dispatchEvent(new CustomEvent(CUSTOM_EVENTS.NOTES_UPDATED));
			await fetchAllNotes();
			table.resetRowSelection();
		} catch (err) {
			console.error('Failed to clear database:', err);
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="font-semibold">
				{t('notes.total')} {localizeNumber(table.getFilteredRowModel().rows.length)}
			</h2>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="relative max-w-sm w-full">
					<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						className="pl-9 h-9"
						onChange={(e) => setGlobalFilter(e.target.value)}
						placeholder={t('search.notes.placeholder')}
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
						onClick={() => {
							setConfirmConfig({
								title: t('settings.data.explore.delete.selected'),
								description: t('settings.data.explore.confirm.delete'),
								onConfirm: handleDeleteSelected,
							});
						}}
						size="sm"
						variant="destructive"
					>
						{t('settings.data.explore.delete.selected')} (
						{localizeNumber(selectedRows.length)})
					</Button>
					<Button
						className="cursor-pointer h-9 shrink-0"
						onClick={() => {
							setConfirmConfig({
								title: t('settings.data.explore.clear.all'),
								description: t('settings.data.explore.confirm.clear'),
								onConfirm: handleClearAll,
							});
						}}
						size="sm"
						variant="destructive"
					>
						{t('settings.data.explore.clear.all')}
					</Button>
					<div className="flex items-center gap-2 shrink-0">
						<span className="text-xs text-muted-foreground whitespace-nowrap">
							{t('common.table.rows.per.page')}:
						</span>
						<Select
							onValueChange={(val) => table.setPageSize(Number(val))}
							value={String(table.getState().pagination.pageSize)}
						>
							<SelectTrigger className="h-8 w-17.5 text-xs">
								<SelectValue>
									{localizeNumber(table.getState().pagination.pageSize)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{PAGE_LIMITS.map((limit) => (
									<SelectItem key={limit.value} value={String(limit.value)}>
										{localizeNumber(limit.label)}
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
										<TableCell className="px-4 py-2 text-xs" key={cell.id}>
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
						{t('common.table.page.label')}{' '}
						{localizeNumber(table.getState().pagination.pageIndex + 1)}/
						{localizeNumber(table.getPageCount())}
					</div>
					<div className="flex gap-2">
						<Button
							disabled={!table.getCanPreviousPage()}
							onClick={() => table.previousPage()}
							size="sm"
							variant="outline"
						>
							{t('common.table.pagination.prev.label')}
						</Button>
						<Button
							disabled={!table.getCanNextPage()}
							onClick={() => table.nextPage()}
							size="sm"
							variant="outline"
						>
							{t('common.table.pagination.next.label')}
						</Button>
					</div>
				</div>
			)}

			{/* Viewing Note Dialog */}
			<Dialog onOpenChange={(open) => !open && setViewingNote(null)} open={!!viewingNote}>
				<DialogContent className="max-w-lg sm:max-w-[96%] md:max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{viewingNote?.title || t('notes.untitled')}</DialogTitle>
						<DialogDescription className="font-mono text-[10px] break-all">
							ID: {viewingNote?.id}
						</DialogDescription>
					</DialogHeader>

					<ExplorerDataView data={viewingNote} />

					<DialogFooter>
						<Button onClick={() => setViewingNote(null)}>
							{t('common.close')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
