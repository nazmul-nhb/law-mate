const en = {
	translation: {
		// App
		'app.name': 'LawMate',
		'app.tagline': 'Keep Your Law Notes Organized',

		// Navigation
		'nav.notes': 'Notes',
		'nav.trash': 'Trash',
		'nav.settings': 'Settings',

		// Notes
		'notes.title': 'Notes',
		'notes.empty': 'No notes yet',
		'notes.empty.description': 'Click the button below to create your first note',
		'notes.create': 'New Note',
		'notes.edit': 'Edit Note',
		'notes.delete': 'Delete',
		'notes.save': 'Save',
		'notes.cancel': 'Cancel',
		'notes.title.label': 'Title',
		'notes.title.placeholder': 'Enter note title...',
		'notes.description.label': 'Description',
		'notes.description.placeholder': 'Write note description...',
		'notes.deleted.success': 'Note moved to trash',
		'notes.saved.success': 'Note saved successfully',
		'notes.untitled': 'Untitled',
		'notes.no.description': 'No description',

		// Markdown Editor
		'editor.write': 'Write',
		'editor.preview': 'Preview',
		'editor.preview.empty': 'Nothing to preview',
		'editor.bold': 'Bold',
		'editor.italic': 'Italic',
		'editor.heading': 'Heading',
		'editor.link': 'Link',
		'editor.code': 'Code',
		'editor.list': 'List',
		'editor.ordered.list': 'Ordered List',
		'editor.quote': 'Quote',

		// Search
		'search.placeholder': 'Search notes...',
		'search.empty': 'No results found',
		'search.hint': 'Search',

		// Trash
		'trash.title': 'Trash',
		'trash.empty': 'Trash is Empty',
		'trash.empty.description': 'Deleted notes will appear here',
		'trash.restore': 'Restore',
		'trash.delete.permanent': 'Delete Permanently',
		'trash.restore.success': 'Note restored successfully',
		'trash.delete.success': 'Note permanently deleted',
		'trash.confirm.delete': 'Are you sure? This action cannot be undone.',
		'trash.confirm.soft.delete': 'Are you sure you want to move this note to trash?',

		// Settings
		'settings.title': 'Settings',
		'settings.auth': 'Account',
		'settings.language': 'Language',
		'settings.language.bn': 'বাংলা',
		'settings.language.en': 'English',
		'settings.theme': 'Theme',
		'settings.theme.light': 'Light',
		'settings.theme.dark': 'Dark',
		'settings.theme.system': 'System',
		'settings.fontsize': 'Font Size',
		'settings.sync': 'Synchronization',
		'settings.sync.status': 'Sync Status',
		'settings.sync.connected': 'Connected',
		'settings.sync.not.connected': 'Not connected',
		'settings.sync.label': 'Last Synced',
		'settings.sync.auto': 'Auto Sync',
		'settings.sync.manual': 'Sync Now',
		'settings.storage': 'Storage Usage',
		'settings.storage.used': 'used',
		'settings.storage.of': 'of',
		'settings.version': 'Version',
		'settings.sign.in': 'Login',
		'settings.sign.out': 'Logout',

		// Admin
		'nav.admin': 'Admin',
		'admin.title': 'Admin Console',
		'admin.offline.title': 'No Internet Connection',
		'admin.offline.description':
			'Please, connect your device to the internet and try again.',
		'admin.stats.total': 'Total Users',
		'admin.stats.active': 'Active',
		'admin.stats.blocked': 'Blocked',
		'admin.stats.deleted': 'Deleted',
		'admin.search.placeholder': 'Search by name or email...',
		'admin.table.user': 'User',
		'admin.table.role': 'Role',
		'admin.table.status': 'Status',
		'admin.table.joined': 'Joined',
		'admin.table.actions': 'Actions',
		'admin.action.block': 'Block',
		'admin.action.unblock': 'Unblock',
		'admin.action.delete': 'Soft Delete',
		'admin.action.restore': 'Restore',
		'admin.blocked.message':
			'Your account has been blocked. Please contact the administrator.',
		'admin.confirm.block': 'Are you sure you want to block this user?',
		'admin.confirm.delete': 'Are you sure you want to soft delete this user?',

		// Common
		'common.loading': 'Loading...',
		'common.error': 'An error occurred',
		'common.retry': 'Retry',
		'common.confirm': 'Confirm',
		'common.close': 'Close',
		'common.or': 'or',

		// Footer
		'footer.privacy': 'Privacy Policy',
		'footer.terms': 'Terms of Service',
		'footer.rights': 'All rights reserved',
		'footer.created.by': 'Created by ❤️ Nazmul Hassan',

		// Legal
		'legal.last.updated': 'Last updated',
		'legal.last.updated.date': '2026-07-01',
		'legal.privacy.title': 'Privacy Policy',
		'legal.privacy.intro.title': 'Introduction',
		'legal.privacy.intro.body':
			'LawMate ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our application.',
		'legal.privacy.collect.title': 'Information We Collect',
		'legal.privacy.collect.email': 'Email address (via Google Sign-In)',
		'legal.privacy.collect.name': 'Display name and profile picture (via Google Sign-In)',
		'legal.privacy.collect.avatar': 'Profile avatar URL provided by Google',
		'legal.privacy.collect.notes': 'Notes and content you create within the application',
		'legal.privacy.use.title': 'How We Use Your Information',
		'legal.privacy.use.auth': 'To authenticate your identity and manage your account',
		'legal.privacy.use.sync':
			'To synchronize your notes across devices when you are signed in',
		'legal.privacy.use.improve': 'To maintain and improve the application',
		'legal.privacy.storage.title': 'Data Storage',
		'legal.privacy.storage.body':
			'Your notes are stored locally on your device using IndexedDB. When you sign in, your notes may also be stored on our cloud servers (Supabase) to enable cross-device synchronization. You may use the application without signing in, in which case your data remains entirely on your device.',
		'legal.privacy.thirdparty.title': 'Third-Party Services',
		'legal.privacy.thirdparty.body':
			'We use Google OAuth for authentication and Supabase for cloud storage and synchronization. These services have their own privacy policies that govern their handling of your data.',
		'legal.privacy.contact.title': 'Contact Us',
		'legal.privacy.contact.body':
			'If you have any questions about this Privacy Policy, please contact us via the project repository on GitHub. or this URL (https://nazmul-nhb.dev/)',
		'legal.terms.title': 'Terms of Service',
		'legal.terms.acceptance.title': 'Acceptance of Terms',
		'legal.terms.acceptance.body':
			'By accessing or using LawMate, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.',
		'legal.terms.description.title': 'Service Description',
		'legal.terms.description.body':
			'LawMate is a free, open-source note-taking application designed for legal professionals and students. It provides local-first storage with optional cloud synchronization.',
		'legal.terms.accounts.title': 'User Accounts',
		'legal.terms.accounts.body':
			'You may sign in with your Google account to enable cloud synchronization. You are responsible for maintaining the security of your account credentials. We reserve the right to suspend or terminate accounts that violate these terms.',
		'legal.terms.content.title': 'User Content',
		'legal.terms.content.body':
			'You retain full ownership of all content you create within LawMate. We do not claim any intellectual property rights over your notes or data.',
		'legal.terms.termination.title': 'Termination',
		'legal.terms.termination.body':
			'We may suspend or terminate your access to the service at any time, with or without cause. Upon termination, your locally stored data will remain on your device.',
		'legal.terms.liability.title': 'Limitation of Liability',
		'legal.terms.liability.body':
			'LawMate is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from the use or inability to use the application, including data loss.',
		'legal.terms.changes.title': 'Changes to Terms',
		'legal.terms.changes.body':
			'We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the revised terms.',

		// Not Found
		'notfound.title': 'Page Not Found',
		'notfound.description':
			'The page you are looking for does not exist or has been moved.',
		'notfound.back.home': 'Go to Notes',
		'notfound.back.prev': 'Go Back',

		// Error Boundary
		'error.title': 'Something went wrong',
		'error.description': 'An unexpected error has occurred. Please try reloading the page.',
		'error.details': 'Error Details',
		'error.reload': 'Reload Application',
	},
};

export default en;
