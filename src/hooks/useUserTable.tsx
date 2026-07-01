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
import { ArrowUpDown, Shield, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from 'toolbox-x/date';
import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { useAuthStore } from '@/stores/auth.store';
import type { Nullable } from '@/types/common.types';
import type { Profile, ProfileStatus } from '@/types/profile.types';

type UserTableOptions = {
	users: Profile[];
	isUpdating: Nullable<string>;
	globalFilter: string;
	setGlobalFilter: Dispatch<SetStateAction<string>>;
	setPendingAction: Dispatch<
		SetStateAction<
			Nullable<{
				userId: string;
				action: Exclude<ProfileStatus, 'active'>;
			}>
		>
	>;
	handleStatusUpdate: (userId: string, newStatus: ProfileStatus) => Promise<void>;
};

type UserTable = {
	columns: ColumnDef<Profile>[];
	table: Table<Profile>;
};

export function useUserTable(options: UserTableOptions): UserTable {
	const { t } = useTranslation();
	const profile = useAuthStore((s) => s.profile);

	const {
		isUpdating,
		users,
		globalFilter,
		setGlobalFilter,
		setPendingAction,
		handleStatusUpdate,
	} = options;

	const [sorting, setSorting] = useState<SortingState>([]);

	// Columns definition
	const columns = useMemo<ColumnDef<Profile>[]>(
		() => [
			{
				accessorKey: 'full_name',
				header: ({ column }) => {
					return (
						<button
							className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider"
							onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
							type="button"
						>
							{t('admin.table.user')}
							<ArrowUpDown className="ml-1 size-3.5" />
						</button>
					);
				},
				cell: ({ row }) => {
					const u = row.original;
					return (
						<div className="flex items-center gap-3">
							<div className="size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
								<UserAvatar
									className="size-full"
									image={u.avatar_url}
									name={u.full_name || u.email}
								/>
							</div>
							<div className="flex flex-col min-w-0">
								<span className="font-medium text-foreground truncate">
									{u.full_name || t('notes.untitled')}
								</span>
								<span className="text-xs text-muted-foreground truncate">
									{u.email}
								</span>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: 'role',
				header: ({ column }) => {
					return (
						<button
							className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider"
							onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
							type="button"
						>
							{t('admin.table.role')}
							<ArrowUpDown className="ml-1 size-3.5" />
						</button>
					);
				},
				cell: ({ row }) => {
					const { role } = row.original;
					return (
						<span
							className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium border ${
								role === 'admin'
									? 'bg-primary/5 text-primary border-primary/20'
									: 'bg-muted text-muted-foreground border-transparent'
							}`}
						>
							{role === 'admin' && <Shield className="size-3" />}
							{role}
						</span>
					);
				},
			},
			{
				accessorKey: 'status',
				header: ({ column }) => {
					return (
						<button
							className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider"
							onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
							type="button"
						>
							{t('admin.table.status')}
							<ArrowUpDown className="ml-1 size-3.5" />
						</button>
					);
				},
				cell: ({ row }) => {
					const { status } = row.original;
					return (
						<span
							className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
								status === 'active'
									? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
									: status === 'blocked'
										? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
										: 'bg-muted text-muted-foreground border-transparent'
							}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				accessorKey: 'created_at',
				header: ({ column }) => {
					return (
						<button
							className="flex items-center gap-1 hover:text-foreground cursor-pointer text-xs font-semibold uppercase tracking-wider"
							onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
							type="button"
						>
							{t('admin.table.joined')}
							<ArrowUpDown className="ml-1 size-3.5" />
						</button>
					);
				},
				cell: ({ row }) => {
					return formatDate({
						date: row.original.created_at,
						format: 'dd, mmm DD, YYYY',
					});
				},
			},
			{
				id: 'actions',
				header: () => (
					<div className="text-right text-xs font-semibold uppercase tracking-wider">
						{t('admin.table.actions')}
					</div>
				),
				cell: ({ row }) => {
					const u = row.original;
					const isCurrentUser = u.id === profile?.id;
					if (isCurrentUser) {
						return (
							<div className="text-right text-xs text-muted-foreground italic px-2">
								Current Admin
							</div>
						);
					}
					return (
						<div className="flex items-center justify-end gap-1.5">
							{u.status === 'blocked' ? (
								<TooltipSimple content={t('admin.action.unblock')}>
									<Button
										disabled={isUpdating === u.id}
										onClick={() => handleStatusUpdate(u.id, 'active')}
										size="icon-sm"
										variant="ghost"
									>
										<UserCheck className="size-4 text-emerald-500" />
									</Button>
								</TooltipSimple>
							) : (
								<TooltipSimple content={t('admin.action.block')}>
									<Button
										disabled={isUpdating === u.id}
										onClick={() =>
											setPendingAction({
												userId: u.id,
												action: 'blocked',
											})
										}
										size="icon-sm"
										variant="ghost"
									>
										<ShieldAlert className="size-4 text-rose-500" />
									</Button>
								</TooltipSimple>
							)}

							{u.status === 'deleted' ? (
								<TooltipSimple content={t('admin.action.restore')}>
									<Button
										disabled={isUpdating === u.id}
										onClick={() => handleStatusUpdate(u.id, 'active')}
										size="icon-sm"
										variant="ghost"
									>
										<UserCheck className="size-4 text-muted-foreground" />
									</Button>
								</TooltipSimple>
							) : (
								<TooltipSimple content={t('admin.action.delete')}>
									<Button
										disabled={isUpdating === u.id}
										onClick={() =>
											setPendingAction({
												userId: u.id,
												action: 'deleted',
											})
										}
										size="icon-sm"
										variant="ghost"
									>
										<UserX className="size-4 text-muted-foreground" />
									</Button>
								</TooltipSimple>
							)}
						</div>
					);
				},
			},
		],
		[t, profile?.id, isUpdating, handleStatusUpdate, setPendingAction]
	);

	// Setup TanStack Table
	const table = useReactTable({
		data: users,
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return { columns, table };
}
