import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import {
	ArrowUpDown,
	Loader2,
	Search,
	Shield,
	ShieldAlert,
	UserCheck,
	UserX,
	WifiOffIcon,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { EmptyState } from '@/components/EmptyState';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import type { Profile, ProfileStatus } from '@/types/profile.types';

const PAGE_LIMITS = [5, 10, 20, 30, 40, 50].map((val) => ({ value: val, label: String(val) }));

export function AdminPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { profile } = useAuthStore();
	const [users, setUsers] = React.useState<Profile[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

	// Table states
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState('');

	// Action confirmation states
	const [pendingAction, setPendingAction] = React.useState<{
		userId: string;
		action: Exclude<ProfileStatus, 'active'>;
	} | null>(null);

	// Fetch users list
	const fetchUsers = React.useCallback(async () => {
		if (!navigator.onLine) {
			setIsLoading(false);
			return;
		}
		try {
			setIsLoading(true);
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setUsers(data || []);
		} catch (error) {
			console.error('Failed to fetch users:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Redirect non-admins
	React.useEffect(() => {
		if (profile?.role !== 'admin') {
			navigate('/');
		}
	}, [profile, navigate]);

	React.useEffect(() => {
		if (navigator.onLine && profile?.role === 'admin') {
			fetchUsers();
		}
	}, [profile, fetchUsers]);

	const handleStatusUpdate = React.useCallback(
		async (userId: string, newStatus: ProfileStatus) => {
			try {
				setIsUpdating(userId);
				const { error } = await supabase
					.from('profiles')
					.update({ status: newStatus })
					.eq('id', userId);

				if (error) throw error;

				// Update local state instantly
				setUsers((prev) =>
					prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
				);
			} catch (error) {
				console.error('Failed to update user status:', error);
			} finally {
				setIsUpdating(null);
			}
		},
		[]
	);

	const handleConfirmAction = async () => {
		if (!pendingAction) return;
		const { userId, action } = pendingAction;
		setPendingAction(null);
		await handleStatusUpdate(userId, action);
	};

	// Columns definition
	const columns = React.useMemo<ColumnDef<Profile>[]>(
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
								{u.avatar_url ? (
									<img
										alt={u.full_name || ''}
										className="aspect-square size-full object-cover"
										src={u.avatar_url}
									/>
								) : (
									<div className="flex size-full items-center justify-center text-xs font-bold">
										{(u.full_name || u.email).charAt(0).toUpperCase()}
									</div>
								)}
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
					const role = row.getValue('role') as string;
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
					const status = row.getValue('status') as string;
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
					const createdAt = row.getValue('created_at') as string;
					return new Date(createdAt).toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
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
		[t, profile?.id, isUpdating, handleStatusUpdate]
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

	if (profile?.role !== 'admin') {
		return null;
	}

	// Calculate statistics
	const totalUsers = users.length;
	const activeUsers = users.filter((u) => u.status === 'active').length;
	const blockedUsers = users.filter((u) => u.status === 'blocked').length;
	const deletedUsers = users.filter((u) => u.status === 'deleted').length;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Shield className="size-6 text-primary" />
				<h1 className="text-xl font-bold text-foreground">{t('admin.title')}</h1>
			</div>

			{navigator.onLine ? (
				<React.Fragment>
					{/* Statistics Cards */}
					<div className="grid gap-4 sm:grid-cols-4">
						<div className="rounded-lg border border-border bg-card p-4">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{t('admin.stats.total')}
							</p>
							<p className="mt-2 text-2xl font-bold text-foreground">
								{totalUsers}
							</p>
						</div>
						<div className="rounded-lg border border-border bg-card p-4">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{t('admin.stats.active')}
							</p>
							<p className="mt-2 text-2xl font-bold text-emerald-500">
								{activeUsers}
							</p>
						</div>
						<div className="rounded-lg border border-border bg-card p-4">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{t('admin.stats.blocked')}
							</p>
							<p className="mt-2 text-2xl font-bold text-rose-500">
								{blockedUsers}
							</p>
						</div>
						<div className="rounded-lg border border-border bg-card p-4">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{t('admin.stats.deleted')}
							</p>
							<p className="mt-2 text-2xl font-bold text-muted-foreground">
								{deletedUsers}
							</p>
						</div>
					</div>

					{/* Controls and Table */}
					<div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="relative max-w-sm w-full">
								<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
								<Input
									className="pl-9"
									onChange={(e) => setGlobalFilter(e.target.value)}
									placeholder={t('admin.search.placeholder')}
									value={globalFilter}
								/>
							</div>

							<div className="flex items-center gap-2">
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

						{isLoading ? (
							<div className="flex h-32 items-center justify-center">
								<Loader2 className="size-6 animate-spin text-muted-foreground" />
							</div>
						) : (
							<div className="rounded-md border border-border">
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<TableHead
														className="px-4 py-3"
														key={header.id}
													>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef
																		.header,
																	header.getContext()
																)}
													</TableHead>
												))}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table.getRowModel().rows?.length ? (
											table.getRowModel().rows.map((row) => (
												<TableRow
													data-state={
														row.getIsSelected() && 'selected'
													}
													key={row.id}
												>
													{row.getVisibleCells().map((cell) => (
														<TableCell
															className="px-4 py-3.5"
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
													className="h-24 text-center"
													colSpan={columns.length}
												>
													No results.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						)}

						{/* Pagination Controls */}
						{!isLoading && (
							<div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
								<div className="text-xs text-muted-foreground">
									Page {table.getState().pagination.pageIndex + 1} of{' '}
									{table.getPageCount()} (
									{table.getFilteredRowModel().rows.length} total users)
								</div>
								<div className="flex items-center space-x-2">
									<Button
										disabled={!table.getCanPreviousPage()}
										onClick={() => table.previousPage()}
										size="sm"
										variant="outline"
									>
										Previous
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

					{/* Confirm Action AlertDialog */}
					<AlertDialog
						onOpenChange={(open) => !open && setPendingAction(null)}
						open={!!pendingAction}
					>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{pendingAction?.action === 'blocked'
										? t('admin.action.block')
										: t('admin.action.delete')}
								</AlertDialogTitle>
								<AlertDialogDescription>
									{pendingAction?.action === 'blocked'
										? t('admin.confirm.block')
										: t('admin.confirm.delete')}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t('notes.cancel')}</AlertDialogCancel>
								<AlertDialogAction
									className={
										pendingAction?.action === 'blocked'
											? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
											: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer'
									}
									onClick={handleConfirmAction}
								>
									{t('common.confirm')}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</React.Fragment>
			) : (
				<EmptyState
					description={t('admin.offline.description')}
					i18nIsDynamicList
					icon={WifiOffIcon}
					title={t('admin.offline.title')}
				/>
			)}
		</div>
	);
}
