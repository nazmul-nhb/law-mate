import { FileText, Menu, Search, Settings, Shield, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { LanguageToggle } from '@/components/LanguageToggle';
import type { NavItem } from '@/components/NavItem';
import StyledNavLink from '@/components/NavItem';
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
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';

export default function Header() {
	const { t } = useTranslation();
	const setSearchOpen = useUIStore((s) => s.setSearchOpen);
	const profile = useAuthStore((s) => s.profile);

	const navItems = [
		{ path: '/', labelKey: 'nav.notes', icon: FileText },
		{ path: '/trash', labelKey: 'nav.trash', icon: Trash2 },
		{ path: '/settings', labelKey: 'nav.settings', icon: Settings },
		...((profile?.role === 'admin'
			? [{ path: '/admin', labelKey: 'nav.admin', icon: Shield }]
			: []) satisfies Array<NavItem>),
	] satisfies Array<NavItem>;

	return (
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
									<span className="inline sm:hidden">{t('app.name')}</span>
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-1 px-4">
								{navItems.map((item) => (
									<SheetClose key={item.path}>
										<StyledNavLink {...item} />
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
						<StyledNavLink key={item.path} {...item} />
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
							<kbd className="font-mono pt-1 sm:inline hidden">⌘ + K</kbd>
						</div>
					</button>
					<LanguageToggle />
					<ThemeToggle />
					<UserNav />
				</div>
			</div>
		</header>
	);
}
