import { FileText, Menu, Search, Settings, Shield, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SearchCommand } from '@/components/SearchCommand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { UserNav } from '@/features/auth/components/UserNav';
import { NoteDialog } from '@/features/notes/components/NoteDialog';
import { useAuth, useAuthInit } from '@/hooks/useAuth';
import { useSearchCommand } from '@/hooks/useSearchCommand';
import type { I18Values } from '@/i18n';
import { cn } from '@/lib/utils';
import { syncService } from '@/services/sync.service';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';

type NavItem = {
	path: string;
	labelKey: keyof I18Values;
	icon: React.ElementType;
};

function NavItem({ path, labelKey, icon: Icon }: NavItem) {
	const { t } = useTranslation();

	return (
		<NavLink
			className={({ isActive }) =>
				cn(
					'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
					isActive
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
				)
			}
			end={path === '/'}
			to={path}
		>
			<Icon className="size-4" />
			{t(labelKey)}
		</NavLink>
	);
}

export function Layout() {
	useAuthInit();
	const { t } = useTranslation();
	const setSearchOpen = useUIStore((s) => s.setSearchOpen);
	const { user, initialized } = useAuth();
	const { profile, signOut } = useAuthStore();

	useSearchCommand();

	// useEffect(() => {
	// 	const handleOnline = () => {
	// 		if (user) {
	// 			syncService.sync();
	// 		}
	// 	};
	// 	window.addEventListener('online', handleOnline);
	// 	return () => window.removeEventListener('online', handleOnline);
	// }, [user]);

	useEffect(() => {
		if (initialized && user) {
			syncService.sync();
		}
	}, [initialized, user]);

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

	const navItems = [
		{ path: '/', labelKey: 'nav.notes', icon: FileText },
		{ path: '/trash', labelKey: 'nav.trash', icon: Trash2 },
		{ path: '/settings', labelKey: 'nav.settings', icon: Settings },
		...((profile?.role === 'admin'
			? [{ path: '/admin', labelKey: 'nav.admin', icon: Shield }]
			: []) satisfies Array<NavItem>),
	] satisfies Array<NavItem>;

	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
					{/* Left: mobile menu + logo */}
					<div className="flex items-center gap-3">
						{/* Mobile hamburger */}
						<Sheet>
							<SheetTrigger
								render={
									<Button
										aria-label="Menu"
										className="sm:hidden"
										size="icon-sm"
										variant="ghost"
									/>
								}
							>
								<Menu className="size-5" />
							</SheetTrigger>
							<SheetContent className="w-64" side="left">
								<SheetHeader>
									<SheetTitle className="text-left text-lg font-bold flex items-center gap-2">
										<img
											alt="Logo"
											className="size-6 object-contain"
											src="/law-mate.png"
										/>
										<span className="inline sm:hidden">
											{t('app.name')}
										</span>
									</SheetTitle>
								</SheetHeader>
								<nav className="flex flex-col gap-1 px-4">
									{navItems.map((item) => (
										<SheetClose key={item.path}>
											<NavItem {...item} />
										</SheetClose>
									))}
								</nav>
							</SheetContent>
						</Sheet>

						<NavLink
							className="text-lg font-bold text-foreground flex items-center gap-2"
							to="/"
						>
							<img
								alt="LawMate Logo"
								className="size-6 object-contain"
								src="/law-mate.png"
							/>
							<span className="sm:inline hidden">{t('app.name')}</span>
						</NavLink>
					</div>

					{/* Center: desktop nav */}
					<nav className="hidden items-center gap-1 sm:flex">
						{navItems.map((item) => (
							<NavItem key={item.path} {...item} />
						))}
					</nav>

					{/* Right: search + language + theme */}
					<div className="flex items-center gap-1">
						<button
							aria-label={t('search.hint')}
							className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							onClick={() => setSearchOpen(true)}
							type="button"
						>
							<div className="flex items-center justify-center gap-1 h-8 rounded-md border border-input px-2 py-1 text-xs text-muted-foreground">
								<Search className="size-5 mr-1" />
								<kbd className="font-mono pt-1">⌘ + K</kbd>
							</div>
						</button>
						<LanguageToggle />
						<ThemeToggle />
						<UserNav />
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
				<Outlet />
			</main>

			{/* Search command palette */}
			<SearchCommand />

			{/* Global Note create/edit dialog */}
			<NoteDialog onSaved={() => {}} />
		</div>
	);
}
