import { ArrowLeft, FileQuestion, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
			<div className="max-w-md w-full space-y-6">
				<div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-accent/50 mx-auto border border-border">
					<FileQuestion className="h-12 w-12 text-muted-foreground animate-bounce" />
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						{t('notfound.title')}
					</h1>
					<p className="text-sm text-muted-foreground">{t('notfound.description')}</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
					<Button
						className="flex items-center justify-center gap-2 cursor-pointer"
						onClick={() => navigate(-1)}
						variant="outline"
					>
						<ArrowLeft className="h-4 w-4" />
						{t('notfound.back.prev')}
					</Button>

					<Button
						className="flex items-center justify-center gap-2 cursor-pointer"
						onClick={() => navigate('/')}
					>
						<Home className="h-4 w-4" />
						{t('notfound.back.home')}
					</Button>
				</div>
			</div>
		</div>
	);
}
