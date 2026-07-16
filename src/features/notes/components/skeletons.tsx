import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotesPageSkeleton() {
	return (
		<ScrollArea className="h-[calc(100vh-100px)]">
			<div className="flex border border-border rounded-lg overflow-hidden bg-background animate-pulse">
				{/* Left Sidebar Skeleton */}
				<div className="hidden md:flex flex-col h-full shrink-0 w-64 border-r border-border bg-muted/10 p-4 space-y-4">
					<div className="h-8 bg-muted/60 rounded w-3/4" />
					<div className="h-9 bg-muted/60 rounded w-full" />
					<div className="space-y-2.5 py-4">
						{Array.from({ length: 12 }).map((_, i) => (
							<div className="h-9 bg-muted/60 rounded-md w-full" key={i} />
						))}
					</div>
				</div>
				{/* Main Content Area Skeleton */}
				<div className="flex-1 flex flex-col h-full bg-background p-6 space-y-6">
					<div className="flex items-center justify-between border-b border-border pb-4">
						<div className="space-y-2">
							<div className="h-7 bg-muted/60 rounded w-48" />
							<div className="h-4 bg-muted/60 rounded w-32" />
						</div>
						<div className="h-8 bg-muted/60 rounded w-24" />
					</div>
					<div className="flex items-center gap-2">
						<div className="h-8 bg-muted/60 rounded w-36" />
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 12 }).map((_, i) => (
							<NoteCardSkeleton key={i} />
						))}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}

function NoteCardSkeleton() {
	return (
		<div className="h-28 bg-muted/30 border border-border/60 rounded-lg p-4 space-y-3">
			<div className="h-5 bg-muted/60 rounded w-5/6" />
			<div className="h-4 bg-muted/60 rounded w-1/3" />
			<div className="h-3 bg-muted/60 rounded w-1/4" />
		</div>
	);
}
