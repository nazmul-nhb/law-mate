import { Cloud, FileText, Loader2, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { syncService } from '@/services/sync.service';
import { useUIStore } from '@/stores/ui.store';

export function UserNav() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user, signInWithGoogle, signOut, isLoading } = useAuth();
	const { isSyncing } = useUIStore();

	const handleSync = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (user) {
			await syncService.sync();
		}
	};

	if (isLoading) {
		return (
			<div className="flex size-8 items-center justify-center rounded-full bg-muted">
				<Loader2 className="size-4 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (user) {
		const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
		const name =
			user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
		const initial = name.charAt(0).toUpperCase();

		return (
			<DropdownMenu>
				<DropdownMenuTrigger className="relative flex size-8 shrink-0 overflow-hidden rounded-full border border-border outline-hidden cursor-pointer hover:opacity-90 transition-opacity">
					{avatarUrl ? (
						<img
							alt={name}
							className="aspect-square size-full object-cover"
							src={avatarUrl}
						/>
					) : (
						<div className="flex size-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
							{initial}
						</div>
					)}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<div className="px-2.5 py-2 text-xs font-medium text-muted-foreground">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-semibold text-foreground leading-none truncate">{name}</p>
							<p className="text-xs leading-none text-muted-foreground truncate">
								{user.email}
							</p>
						</div>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => navigate('/')}>
						<FileText className="mr-2 size-4" />
						<span>{t('nav.notes')}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate('/settings')}>
						<Settings className="mr-2 size-4" />
						<span>{t('nav.settings')}</span>
					</DropdownMenuItem>
					<DropdownMenuItem disabled={isSyncing} onClick={handleSync}>
						{isSyncing ? (
							<Loader2 className="mr-2 size-4 animate-spin text-primary" />
						) : (
							<Cloud className="mr-2 size-4 text-emerald-500" />
						)}
						<span>{t('settings.sync.manual')}</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={signOut} variant="destructive">
						<LogOut className="mr-2 size-4" />
						<span>{t('settings.sign.out')}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<button
			className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent text-foreground transition-colors cursor-pointer"
			onClick={signInWithGoogle}
			type="button"
		>
			<svg
				className="size-3.5"
				height="24"
				viewBox="0 0 24 24"
				width="24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Google Logo</title>
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					fill="#4285F4"
				/>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				/>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
					fill="#FBBC05"
				/>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
					fill="#EA4335"
				/>
			</svg>
			<span className="hidden sm:inline">{t('settings.sign.in')}</span>
		</button>
	);
}
