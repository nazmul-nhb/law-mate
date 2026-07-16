import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '@/constants/app';

interface SplashScreenProps {
	isFading: boolean;
}

export function SplashScreen({ isFading }: SplashScreenProps) {
	const { t } = useTranslation();

	return (
		<div
			className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-[#f5f5f5] transition-opacity duration-300 ${
				isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
			}`}
		>
			<div className="flex flex-col items-center space-y-6">
				{/* Original App Icon */}
				<img
					alt="LawMate Logo"
					className="size-20 rounded-2xl shadow-xl shadow-black/60 animate-pulse border border-white/5"
					loading="eager"
					src="/lm-192x192.png"
				/>

				{/* App Name & Tagline */}
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold tracking-tight text-white select-none">
						{t('app.name')}
					</h1>
					<p className="text-neutral-400 max-w-xs px-4 select-none">
						{t('app.tagline')}
					</p>
					<p className="text-sm text-neutral-500 max-w-xs px-4 select-none">
						{t('footer.created.by')}
					</p>
				</div>
			</div>

			{/* Version Number at Bottom */}
			<div className="absolute bottom-8 left-0 right-0 text-center select-none">
				<span className="text-sm text-neutral-500 font-mono">
					{t('settings.version')} v{APP_VERSION}
				</span>
			</div>
		</div>
	);
}
