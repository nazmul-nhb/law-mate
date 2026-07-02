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
import type { Law } from '@/types/laws.types';

type IDBExplorerLawsTableOptions = {
	laws: Law[];
	globalFilter: string;
	setGlobalFilter: Dispatch<SetStateAction<string>>;
	onView: (law: Law) => void;
	onDelete: (id: $UUID) => void;
};

type IDBExplorerLawsTableResult = {
	columns: ColumnDef<Law>[];
	table: Table<Law>;
};

export function useIDBELawsTable(
	options: IDBExplorerLawsTableOptions
): IDBExplorerLawsTableResult {
	const { t } = useTranslation();
	const { laws, globalFilter, onView, onDelete } = options;

	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

	// Fuzzy search via Fuse.js
	const filteredLawIds = useMemo(() => {
		if (!globalFilter.trim()) return null;

		const index = Fuse.createIndex(['title', 'description'], laws);

		const fuse = new Fuse(
			laws,
			{
				keys: ['title', 'description'],
				threshold: 0.25,
				ignoreLocation: true,
			},
			index
		);

		return new Set<string>(fuse.search(globalFilter).map((r) => String(r.item.id)));
	}, [laws, globalFilter]);

	const columns = useMemo<ColumnDef<Law>[]>(() => {
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
					const law = row.original;
					return (
						<div className="max-w-50 truncate font-medium text-foreground">
							{law.title}
						</div>
					);
				},
			},
			{
				accessorKey: 'description',
				header: () => (
					<span className="text-xs font-semibold uppercase tracking-wider font-mono">
						{t('notes.description.label')}
					</span>
				),
				cell: ({ row }) => {
					const desc = row.original.description;
					return (
						<div className="max-w-75 truncate text-muted-foreground">
							{desc ? removeMd(desc) : '-'}
						</div>
					);
				},
				enableSorting: false,
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
				cell: ({ row }) => (
					<div className="flex items-center gap-1">
						<Button
							onClick={() => onView(row.original)}
							size="icon-xs"
							variant="ghost"
						>
							<Eye className="size-3.5" />
						</Button>
						<Button
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => onDelete(row.original.id)}
							size="icon-xs"
							variant="ghost"
						>
							<Trash2 className="size-3.5" />
						</Button>
					</div>
				),
				enableSorting: false,
			},
		];
	}, [t, onView, onDelete]);

	const table = useReactTable({
		data: laws,
		columns,
		state: {
			sorting,
			rowSelection,
		},
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: (row) => {
			if (!filteredLawIds) return true;
			return filteredLawIds.has(String(row.original.id));
		},
	});

	return { columns, table };
}
