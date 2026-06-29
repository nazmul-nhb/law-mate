import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldAlert, UserCheck, UserX, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, type Profile } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { profile } = useAuthStore();
	const [users, setUsers] = useState<Profile[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState<string | null>(null);

	// Fetch users list
	const fetchUsers = useCallback(async () => {
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
	useEffect(() => {
		if (profile && profile.role !== 'admin') {
			navigate('/');
		}
	}, [profile, navigate]);

	useEffect(() => {
		if (profile?.role === 'admin') {
			fetchUsers();
		}
	}, [profile, fetchUsers]);

	const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'blocked' | 'deleted') => {
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
	};

	if (profile?.role !== 'admin') {
		return null;
	}

	// Filter users
	const filteredUsers = users.filter((u) => {
		const name = u.full_name?.toLowerCase() || '';
		const email = u.email.toLowerCase();
		const query = searchQuery.toLowerCase();
		return name.includes(query) || email.includes(query);
	});

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

			{/* Statistics Cards */}
			<div className="grid gap-4 sm:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{t('admin.stats.total')}
					</p>
					<p className="mt-2 text-2xl font-bold text-foreground">{totalUsers}</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{t('admin.stats.active')}
					</p>
					<p className="mt-2 text-2xl font-bold text-emerald-500">{activeUsers}</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{t('admin.stats.blocked')}
					</p>
					<p className="mt-2 text-2xl font-bold text-rose-500">{blockedUsers}</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{t('admin.stats.deleted')}
					</p>
					<p className="mt-2 text-2xl font-bold text-muted-foreground">{deletedUsers}</p>
				</div>
			</div>

			{/* Controls and Table */}
			<div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6">
				<div className="relative max-w-sm">
					<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={t('admin.search.placeholder')}
						value={searchQuery}
					/>
				</div>

				{isLoading ? (
					<div className="flex h-32 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-left text-sm text-muted-foreground">
							<thead>
								<tr className="border-b border-border text-xs font-semibold text-foreground uppercase">
									<th className="py-3 px-4">{t('admin.table.user')}</th>
									<th className="py-3 px-4">{t('admin.table.role')}</th>
									<th className="py-3 px-4">{t('admin.table.status')}</th>
									<th className="py-3 px-4">{t('admin.table.joined')}</th>
									<th className="py-3 px-4 text-right">{t('admin.table.actions')}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{filteredUsers.map((u) => {
									const isCurrentUser = u.id === profile.id;
									const joinedDate = new Date(u.created_at).toLocaleDateString(
										undefined,
										{ year: 'numeric', month: 'short', day: 'numeric' }
									);

									return (
										<tr className="hover:bg-accent/30 transition-colors" key={u.id}>
											<td className="py-3.5 px-4 flex items-center gap-3">
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
											</td>
											<td className="py-3.5 px-4 font-mono text-xs">
												<span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium border ${
													u.role === 'admin' 
														? 'bg-primary/5 text-primary border-primary/20' 
														: 'bg-muted text-muted-foreground border-transparent'
												}`}>
													{u.role === 'admin' && <Shield className="size-3" />}
													{u.role}
												</span>
											</td>
											<td className="py-3.5 px-4">
												<span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
													u.status === 'active'
														? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
														: u.status === 'blocked'
														? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
														: 'bg-muted text-muted-foreground border-transparent'
												}`}>
													{u.status}
												</span>
											</td>
											<td className="py-3.5 px-4 text-xs">
												{joinedDate}
											</td>
											<td className="py-3.5 px-4 text-right">
												{isCurrentUser ? (
													<span className="text-xs text-muted-foreground italic px-2">
														Current Admin
													</span>
												) : (
													<div className="flex items-center justify-end gap-1.5">
														{u.status === 'blocked' ? (
															<Button
																disabled={isUpdating === u.id}
																onClick={() => handleStatusUpdate(u.id, 'active')}
																size="icon-sm"
																variant="ghost"
															>
																<UserCheck className="size-4 text-emerald-500" />
															</Button>
														) : (
															<Button
																disabled={isUpdating === u.id}
																onClick={() => {
																	if (confirm(t('admin.confirm.block'))) {
																		handleStatusUpdate(u.id, 'blocked');
																	}
																}}
																size="icon-sm"
																variant="ghost"
															>
																<ShieldAlert className="size-4 text-rose-500" />
															</Button>
														)}

														{u.status === 'deleted' ? (
															<Button
																disabled={isUpdating === u.id}
																onClick={() => handleStatusUpdate(u.id, 'active')}
																size="icon-sm"
																variant="ghost"
															>
																<UserCheck className="size-4 text-muted-foreground" />
															</Button>
														) : (
															<Button
																disabled={isUpdating === u.id}
																onClick={() => {
																	if (confirm(t('admin.confirm.delete'))) {
																		handleStatusUpdate(u.id, 'deleted');
																	}
																}}
																size="icon-sm"
																variant="ghost"
															>
																<UserX className="size-4 text-muted-foreground" />
															</Button>
														)}
													</div>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
