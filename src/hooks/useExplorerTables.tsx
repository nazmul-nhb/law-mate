import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type Table,
	useReactTable,
} from '@tanstack/react-table';
import Fuse from 'fuse.js';
import type { $UUID } from 'locality-idb';
import { ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import removeMd from 'remove-markdown';
import { Button } from '@/components/ui/button';
import { SEARCH_KEYS } from '@/constants/app';
import type { Law } from '@/types/laws.types';
import type { Note } from '@/types/note.types';

type ExplorerTableOptions<Data extends Note | Law> = {
	data: Data[];
	globalFilter: string;
	setGlobalFilter: Dispatch<SetStateAction<string>>;
	onView: (data: Data) => void;
	onDelete: (id: $UUID) => void;
};

type IDBETable<Data extends Note | Law> = {
	columns: ColumnDef<Data>[];
	table: Table<Data>;
};

export function useExplorerTables<Data extends Note | Law>(
	options: ExplorerTableOptions<Data>
): IDBETable<Data> {
	const { t } = useTranslation();
	const { data, globalFilter, setGlobalFilter, onView, onDelete } = options;

	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

	// Fuzzy search via Fuse.js
	const filteredNoteIds = useMemo(() => {
		if (!globalFilter.trim()) return null;

		const index = Fuse.createIndex([...SEARCH_KEYS], data);

		const fuse = new Fuse(
			data,
			{
				keys: ['title', 'description'],
				threshold: 0.25,
				ignoreLocation: true,
			},
			index
		);

		return new Set<string>(fuse.search(globalFilter).map((r) => String(r.item.id)));
	}, [data, globalFilter]);

	const columns = useMemo<ColumnDef<Data>[]>(() => {
		return [
			{
				id: 'select',
				header: ({ table }) => (
					<div className="flex justify-center">
						<input
							checked={table.getIsAllPageRowsSelected()}
							className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
							onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
							type="checkbox"
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className="flex justify-center">
						<input
							checked={row.getIsSelected()}
							className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
							onChange={(e) => row.toggleSelected(e.target.checked)}
							type="checkbox"
						/>
					</div>
				),
				enableSorting: false,
			},
			{
				accessorKey: 'title',
				header: ({ column }) => (
					<button
						className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider font-mono"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						type="button"
					>
						{t('settings.data.explore.col.title')}
						<ArrowUpDown className="ml-1 size-3.5" />
					</button>
				),
				cell: ({ row }) => {
					const note = row.original;
					return (
						<span className="font-medium truncate line-clamp-1 max-w-50 block">
							{note.title || (
								<span className="text-muted-foreground italic">
									{t('notes.untitled')}
								</span>
							)}
						</span>
					);
				},
			},
			{
				accessorKey: 'description',
				header: ({ column }) => (
					<button
						className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider font-mono"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						type="button"
					>
						{t('notes.description.label')}
						<ArrowUpDown className="ml-1 size-3.5" />
					</button>
				),
				cell: ({ row }) => {
					const note = row.original;
					return (
						<span className="font-medium truncate line-clamp-1 max-w-50 block">
							{removeMd(note?.description ?? '') || (
								<span className="text-muted-foreground italic">
									{t('notes.no.description')}
								</span>
							)}
						</span>
					);
				},
			},
			{
				accessorKey: 'user_id',
				header: ({ column }) => (
					<button
						className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider font-mono"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						type="button"
					>
						{t('settings.data.explore.col.owner')}
						<ArrowUpDown className="ml-1 size-3.5" />
					</button>
				),
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground truncate max-w-30 block">
						{row.original.user_id || 'anonymous'}
					</span>
				),
			},
			{
				accessorKey: 'deleted_at',
				header: () => (
					<span className="text-xs font-semibold uppercase tracking-wider block text-center font-mono">
						{t('settings.data.explore.col.status')}
					</span>
				),
				cell: ({ row }) => {
					const isDeleted = !!row.original.deleted_at;
					return (
						<div className="text-center">
							<span
								className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
									isDeleted
										? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
										: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
								}`}
							>
								{isDeleted ? 'trash' : 'active'}
							</span>
						</div>
					);
				},
			},
			{
				accessorKey: 'version',
				header: ({ column }) => (
					<button
						className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider font-mono"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						type="button"
					>
						{t('settings.data.explore.col.version')}
						<ArrowUpDown className="ml-1 size-3.5" />
					</button>
				),
				cell: ({ row }) => (
					<span className="font-mono text-xs">{row.original.version}</span>
				),
			},
			{
				id: 'actions',
				header: () => (
					<span className="text-xs font-semibold uppercase tracking-wider block text-right font-mono">
						{t('admin.table.actions')}
					</span>
				),
				cell: ({ row }) => (
					<div className="flex items-center justify-end gap-1 text-right">
						<Button
							onClick={() => onView(row.original)}
							size="icon-sm"
							variant="ghost"
						>
							<Eye className="size-4" />
						</Button>
						<Button
							className="hover:text-destructive"
							onClick={() => onDelete(row.original.id)}
							size="icon-sm"
							variant="ghost"
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				),
			},
		];
	}, [t, onView, onDelete]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
			rowSelection,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onRowSelectionChange: setRowSelection,
		globalFilterFn: (row) => {
			if (!filteredNoteIds) return true;
			return filteredNoteIds.has(String(row.original.id));
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return { columns, table };
}
