import type { $UUID } from 'locality-idb';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react/jsx-runtime';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipSimple } from '@/components/ui/tooltip-simple';
import { cn } from '@/lib/utils';
import type { Nullable } from '@/types/common.types';
import type { Law } from '@/types/laws.types';

interface LawSidebarProps {
	laws: Law[];
	selectedLawId: Nullable<$UUID>;
	onSelectLaw: (id: $UUID) => void;
	onAddLaw: () => void;
	onEditLaw: (id: $UUID) => void;
	onDeleteLaw: (id: $UUID) => void;
	isMobileDevice?: boolean;
	className?: string;
	lawSorter: JSX.Element;
}

export function LawSidebar({
	laws,
	selectedLawId,
	onSelectLaw,
	onAddLaw,
	onEditLaw,
	onDeleteLaw,
	isMobileDevice = false,
	className,
	lawSorter,
}: LawSidebarProps) {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				'flex flex-col h-full bg-card/45 border-r border-border w-full',
				className
			)}
		>
			{/* Sidebar Header */}
			<div className="p-4 border-b border-border flex items-center flex-wrap justify-between shrink-0 pr-12 md:pr-4">
				<h2 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
					{t('laws.sidebar.title')}
				</h2>

				<div className="flex items-center gap-0.5 flex-wrap">
					{laws.length ? lawSorter : null}

					<TooltipSimple content={t('laws.create')}>
						<button
							className="rounded p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							onClick={onAddLaw}
							type="button"
						>
							<FolderPlus className="size-4.5" />
						</button>
					</TooltipSimple>
				</div>
			</div>

			{/* Sidebar List */}
			<ScrollArea className="flex-1 h-[calc(100%-2.5rem)] pb-6">
				<div className="p-2 space-y-1">
					{laws.length === 0 ? (
						<p className="text-xs text-muted-foreground text-center py-8 px-4 leading-relaxed font-mono">
							{t('laws.empty')}
						</p>
					) : (
						laws.map((law) => {
							const isActive = law.id === selectedLawId;
							return (
								<div
									className={`group relative flex items-center justify-between rounded-md p-2 transition-all cursor-pointer ${
										isActive
											? 'bg-primary/10 text-primary font-semibold'
											: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
									}`}
									key={law.id}
									onClick={() => {
										onSelectLaw(law.id);
									}}
								>
									<span className="text-sm truncate line-clamp-1 max-w-42.5 select-none block">
										{law.title}
									</span>

									{/* Action buttons (only show on hover or when active) */}
									<div
										className={cn(
											'flex items-center gap-1 transition-opacity shrink-0 bg-transparent pl-2',
											isMobileDevice
												? 'opacity-100'
												: 'opacity-0 group-hover:opacity-100 '
										)}
									>
										<button
											className="rounded p-0.5 hover:bg-accent-foreground/10 text-muted-foreground hover:text-foreground cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												onEditLaw(law.id);
											}}
											type="button"
										>
											<Pencil className="size-4" />
										</button>
										<button
											className="rounded p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												onDeleteLaw(law.id);
											}}
											type="button"
										>
											<Trash2 className="size-4" />
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
