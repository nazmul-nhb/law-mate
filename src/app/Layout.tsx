import { FileText, Menu, Search, Settings, Trash2 } from 'lucide-react';
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
import { NoteDialog } from '@/features/notes/components/NoteDialog';
import { useSearchCommand } from '@/hooks/useSearchCommand';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';

const NAV_ITEMS = [
	{ path: '/', labelKey: 'nav.notes', icon: FileText },
	{ path: '/trash', labelKey: 'nav.trash', icon: Trash2 },
	{ path: '/settings', labelKey: 'nav.settings', icon: Settings },
] as const;

function NavItem({
	path,
	labelKey,
	icon: Icon,
}: {
	path: string;
	labelKey: string;
	icon: React.ElementType;
}) {
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
	const { t } = useTranslation();
	const setSearchOpen = useUIStore((s) => s.setSearchOpen);

	// Register Ctrl+K shortcut
	useSearchCommand();

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
										{t('app.name')}
									</SheetTitle>
								</SheetHeader>
								<nav className="mt-4 space-y-1 px-4">
									{NAV_ITEMS.map((item) => (
										<SheetClose key={item.path} render={<div />}>
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
							{t('app.name')}
						</NavLink>
					</div>

					{/* Center: desktop nav */}
					<nav className="hidden items-center gap-1 sm:flex">
						{NAV_ITEMS.map((item) => (
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
							<div className="flex items-center justify-center gap-1 rounded-md border border-input px-2 py-1 text-xs text-muted-foreground">
								<kbd className="font-mono pt-0.5">⌘</kbd>
								<kbd className="font-mono pt-0.5">K</kbd>
								<Search className="size-4" />
							</div>
						</button>
						<LanguageToggle />
						<ThemeToggle />
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
