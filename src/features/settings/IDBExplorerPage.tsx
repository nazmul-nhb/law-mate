import { ArrowLeft, Database } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExplorerLawsTab } from '@/features/settings/components/ExplorerLawsTab';
import { ExplorerNotesTab } from '@/features/settings/components/ExplorerNotesTab';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useSettingsStore } from '@/stores/settings.store';
import type { Nullable } from '@/types/common.types';

type TabType = 'notes' | 'laws';

export function IDBExplorerPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { getQueryParam, setQueryParams } = useQueryParams();

	const activeTab = getQueryParam<TabType>('tab');

	useEffect(() => {
		if (!activeTab) {
			setQueryParams({ tab: 'notes' });
		}
	}, [activeTab, setQueryParams]);

	const [confirmConfig, setConfirmConfig] =
		useState<
			Nullable<{
				title: string;
				description: string;
				onConfirm: () => void | Promise<void>;
				variant?: 'default' | 'destructive';
			}>
		>(null);

	const localizeNumber = useSettingsStore((s) => s.localizeNumber);
	useTitle(t('settings.data.explore.label'));

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Button
					className="h-8 w-8 cursor-pointer"
					onClick={() => navigate('/settings')}
					size="icon-sm"
					variant="ghost"
				>
					<ArrowLeft className="size-4" />
				</Button>
				<Database className="size-6 text-primary" />
				<h1 className="text-xl font-bold text-foreground">
					{t('settings.data.explore.title')}
				</h1>
			</div>

			<Tabs
				className="space-y-4"
				onValueChange={(value: TabType) => setQueryParams({ tab: value })}
				value={activeTab || 'notes'}
			>
				<TabsList className="grid w-full grid-cols-2 max-w-md">
					<TabsTrigger
						className="font-mono text-xs uppercase tracking-wider font-semibold"
						value="notes"
					>
						{t('nav.notes')}
					</TabsTrigger>
					<TabsTrigger
						className="font-mono text-xs uppercase tracking-wider font-semibold"
						value="laws"
					>
						{t('laws.sidebar.title')}
					</TabsTrigger>
				</TabsList>

				<TabsContent
					className="rounded-lg border border-border bg-card p-4 sm:p-6"
					value="notes"
				>
					<ExplorerNotesTab
						localizeNumber={localizeNumber}
						setConfirmConfig={setConfirmConfig}
					/>
				</TabsContent>

				<TabsContent
					className="rounded-lg border border-border bg-card p-4 sm:p-6"
					value="laws"
				>
					<ExplorerLawsTab
						localizeNumber={localizeNumber}
						setConfirmConfig={setConfirmConfig}
					/>
				</TabsContent>
			</Tabs>

			{/* Centered Confirmation Dialog */}
			<ConfirmDialog
				description={confirmConfig?.description || ''}
				onConfirm={confirmConfig?.onConfirm || (() => {})}
				onOpenChange={(open) => !open && setConfirmConfig(null)}
				open={!!confirmConfig}
				title={confirmConfig?.title || ''}
				variant={confirmConfig?.variant}
			/>
		</div>
	);
}
