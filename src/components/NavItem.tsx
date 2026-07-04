import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import type { I18Keys } from '@/i18n';
import { cn } from '@/lib/utils';

export type NavItem = {
	path: string;
	labelKey: I18Keys;
	icon: React.ElementType;
};

export default function StyledNavLink({ path, labelKey, icon: Icon }: NavItem) {
	const { t } = useTranslation();

	return (
		<NavLink
			className={({ isActive }) =>
				cn(
					'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
					isActive
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
				)
			}
			end={path === '/'}
			to={path}
		>
			<Icon className="size-4" />
			<span> {t(labelKey)}</span>
		</NavLink>
	);
}
