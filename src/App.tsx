import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Layout } from '@/app/Layout';
import { AppProviders } from '@/app/providers/AppProviders';
import { AdminPage } from '@/features/admin/AdminPage';
import { ErrorBoundary } from '@/features/error/ErrorBoundary';
import { NotFoundPage } from '@/features/error/NotFoundPage';
import { PrivacyPage } from '@/features/legal/PrivacyPage';
import { TermsPage } from '@/features/legal/TermsPage';
import { NoteDetail } from '@/features/notes/components/NoteDetail';
import { NotesPage } from '@/features/notes/NotesPage';
import { IDBExplorerPage } from '@/features/settings/IDBExplorerPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { TrashPage } from '@/features/trash/TrashPage';

export default function App() {
	return (
		<ErrorBoundary>
			<AppProviders>
				<BrowserRouter>
					<Routes>
						<Route element={<Layout />}>
							<Route element={<NotesPage />} index />
							<Route element={<NoteDetail />} path="note/:id" />
							<Route element={<TrashPage />} path="trash" />
							<Route
								element={<Navigate replace to="/settings" />}
								path="setting"
							/>
							<Route
								element={<Navigate replace to="/settings/idb-explorer" />}
								path="idb-explorer"
							/>
							<Route element={<SettingsPage />} path="settings" />
							<Route element={<IDBExplorerPage />} path="settings/idb-explorer" />
							<Route element={<AdminPage />} path="admin" />
							<Route element={<PrivacyPage />} path="privacy" />
							<Route element={<TermsPage />} path="terms" />
							<Route element={<NotFoundPage />} path="*" />
						</Route>
					</Routes>
				</BrowserRouter>
			</AppProviders>
		</ErrorBoundary>
	);
}
