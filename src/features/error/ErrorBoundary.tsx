import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
	const { t } = useTranslation();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-center">
			<div className="max-w-md w-full space-y-6">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
					<AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						{t('error.title')}
					</h1>
					<p className="text-sm text-muted-foreground">{t('error.description')}</p>
				</div>

				{error && (
					<details className="text-left bg-muted border border-border p-3 rounded-md text-xs font-mono max-h-40 overflow-auto">
						<summary className="cursor-pointer font-semibold text-muted-foreground select-none">
							{t('error.details')}
						</summary>
						<pre className="mt-2 text-destructive whitespace-pre-wrap break-all">
							{String(error)}
						</pre>
					</details>
				)}

				<Button
					className="w-full flex items-center justify-center gap-2 cursor-pointer"
					onClick={onReset}
				>
					<RefreshCw className="h-4 w-4" />
					{t('error.reload')}
				</Button>
			</div>
		</div>
	);
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
	}

	private handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.href = '/';
	};

	public render() {
		if (this.state.hasError) {
			return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
		}

		return this.props.children;
	}
}
