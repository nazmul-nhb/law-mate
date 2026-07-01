import { Shield } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SearchCommand } from '@/components/SearchCommand';
import { NoteDialog } from '@/features/notes/components/NoteDialog';
import { useAuth, useAuthInit } from '@/hooks/useAuth';
import { useSearchCommand } from '@/hooks/useSearchCommand';
import { syncService } from '@/services/sync.service';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';

export function Layout() {
	useAuthInit();
	const { t } = useTranslation();
	const { user, initialized } = useAuth();
	const { profile, signOut } = useAuthStore();
	const autoSync = useSettingsStore((s) => s.autoSync);

	useSearchCommand();

	useEffect(() => {
		if (initialized && user && autoSync) {
			syncService.sync();
		}
	}, [initialized, user, autoSync]);

	if (profile?.status === 'blocked') {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
				<div className="max-w-md space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 shadow-xs">
					<Shield className="mx-auto size-12 text-destructive" />
					<h1 className="text-xl font-bold text-foreground">Access Denied</h1>
					<p className="text-sm text-muted-foreground">
						{t('admin.blocked.message')}
					</p>
					<button
						className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
						onClick={async () => await signOut()}
						type="button"
					>
						{t('settings.sign.out')}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<Header />

			{/* Main content */}
			<main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
				<Outlet />
			</main>

			{/* Footer */}
			<Footer />

			{/* Search command palette */}
			<SearchCommand />

			{/* Global Note create/edit dialog */}
			<NoteDialog onSaved={() => {}} />
		</div>
	);
}
