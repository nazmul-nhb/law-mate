import type { I18Keys } from '@/i18n';

const bn = {
	translation: {
		// App
		'app.name': 'আইন বন্ধু',
		'app.tagline': 'আপনার আইন সম্পর্কিত নোটগুলো গুছিয়ে রাখুন',

		// Navigation
		'nav.notes': 'নোটসমূহ',
		'nav.trash': 'ট্র্যাশ',
		'nav.settings': 'সেটিংস',

		// Notes
		'notes.title': 'নোটসমূহ',
		'notes.empty': 'কোনো নোট নেই',
		'notes.empty.description': 'নতুন নোট তৈরি করতে নিচের বাটনে ক্লিক করুন',
		'notes.create': 'নতুন নোট',
		'notes.edit': 'নোট সম্পাদনা',
		'notes.delete': 'মুছে ফেলুন',
		'notes.save': 'সংরক্ষণ করুন',
		'notes.cancel': 'বাতিল',
		'notes.title.label': 'শিরোনাম',
		'notes.title.placeholder': 'নোটের শিরোনাম লিখুন...',
		'notes.description.label': 'বিবরণ',
		'notes.description.placeholder': 'নোটের বিবরণ লিখুন...',
		'notes.deleted.success': 'নোটটি ট্র্যাশে সরানো হয়েছে',
		'notes.saved.success': 'নোটটি সংরক্ষিত হয়েছে',
		'notes.untitled': 'শিরোনাম নেই',
		'notes.no.description': 'কোনো বিবরণ নেই',

		// Markdown Editor
		'editor.write': 'লিখুন',
		'editor.preview': 'প্রিভিউ',
		'editor.preview.empty': 'প্রিভিউ করার মত কিছু নেই',
		'editor.bold': 'বোল্ড',
		'editor.italic': 'ইটালিক',
		'editor.heading': 'শিরোনাম',
		'editor.link': 'লিঙ্ক',
		'editor.code': 'কোড',
		'editor.list': 'তালিকা',
		'editor.ordered.list': 'ক্রমিক তালিকা',
		'editor.quote': 'উদ্ধৃতি',

		// Search
		'search.placeholder': 'নোট খুঁজুন...',
		'search.empty': 'কোনো ফলাফল পাওয়া যায়নি',
		'search.hint': 'খুঁজুন',

		// Trash
		'trash.title': 'ট্র্যাশ',
		'trash.empty': 'ট্র্যাশ খালি',
		'trash.empty.description': 'মুছে ফেলা নোটগুলো এখানে দেখা যাবে',
		'trash.restore': 'পুনরুদ্ধার করুন',
		'trash.delete.permanent': 'স্থায়ীভাবে মুছুন',
		'trash.restore.success': 'নোটটি পুনরুদ্ধার করা হয়েছে',
		'trash.delete.success': 'নোটটি স্থায়ীভাবে মুছে ফেলা হয়েছে',
		'trash.confirm.delete': 'আপনি কি নিশ্চিত? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
		'trash.confirm.soft.delete': 'আপনি কি নিশ্চিত যে এই নোটটি ট্র্যাশে পাঠাতে চান?',

		// Settings
		'settings.title': 'সেটিংস',
		'settings.language': 'ভাষা',
		'settings.language.bn': 'বাংলা',
		'settings.language.en': 'English',
		'settings.theme': 'থিম',
		'settings.theme.light': 'লাইট',
		'settings.theme.dark': 'ডার্ক',
		'settings.theme.system': 'সিস্টেম',
		'settings.fontsize': 'ফন্টের আকার',
		'settings.sync': 'সিংক্রোনাইজেশন',
		'settings.sync.status': 'সিংক স্ট্যাটাস',
		'settings.sync.connected': 'সংযুক্ত',
		'settings.sync.not.connected': 'সংযুক্ত নয়',
		'settings.sync.label': 'সর্বশেষ সিংক করা হয়েছে',
		'settings.sync.manual': 'ম্যানুয়াল সিংক',
		'settings.storage': 'স্টোরেজ ব্যবহার',
		'settings.storage.used': 'ব্যবহৃত',
		'settings.storage.of': 'এর মধ্যে',
		'settings.version': 'সংস্করণ',
		'settings.sign.in': 'লগইন',
		'settings.sign.out': 'লগ আউট',

		// Admin
		'nav.admin': 'এডমিন',
		'admin.title': 'এডমিন কনসোল',
		'admin.stats.total': 'মোট ব্যবহারকারী',
		'admin.stats.active': 'সক্রিয়',
		'admin.stats.blocked': 'ব্লকড',
		'admin.stats.deleted': 'মুছে ফেলা',
		'admin.search.placeholder': 'নাম বা ইমেল দিয়ে খুঁজুন...',
		'admin.table.user': 'ব্যবহারকারী',
		'admin.table.role': 'ভূমিকা',
		'admin.table.status': 'অবস্থা',
		'admin.table.joined': 'যোগদান করেছেন',
		'admin.table.actions': 'পদক্ষেপ',
		'admin.action.block': 'ব্লক করুন',
		'admin.action.unblock': 'আনব্লক করুন',
		'admin.action.delete': 'সাময়িক মুছুন',
		'admin.action.restore': 'পুনরুদ্ধার',
		'admin.blocked.message':
			'আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।',
		'admin.confirm.block': 'আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে ব্লক করতে চান?',
		'admin.confirm.delete': 'আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে সাময়িকভাবে মুছে ফেলতে চান?',

		// Common
		'common.loading': 'লোড হচ্ছে...',
		'common.error': 'একটি ত্রুটি ঘটেছে',
		'common.retry': 'পুনরায় চেষ্টা করুন',
		'common.confirm': 'নিশ্চিত করুন',
		'common.close': 'বন্ধ করুন',
		'common.or': 'অথবা',
	} satisfies Record<I18Keys, string>,
};

export default bn;
