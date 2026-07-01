import { digitToBangla } from 'toolbox-x';
import { TERMS_PRIVACY_LAST_MODIFIED } from '@/constants/app';
import type { I18Values } from '@/i18n';

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
		'notes.edited': 'সম্পাদনা করা হয়েছে',
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
		'trash.confirm.delete': 'আপনি কি নিশ্চিত? এই প্রক্রিয়াটি পুনরুদ্ধারযোগ্য নয়।',
		'trash.confirm.soft.delete': 'আপনি কি নিশ্চিত যে এই নোটটি ট্র্যাশে পাঠাতে চান?',

		// Settings
		'settings.title': 'সেটিংস',
		'settings.auth': 'অ্যাকাউন্ট',
		'settings.language': 'ভাষা',
		'settings.language.bn': 'বাংলা',
		'settings.language.en': 'English',
		'settings.theme': 'থিম',
		'settings.theme.light': 'লাইট',
		'settings.theme.dark': 'ডার্ক',
		'settings.theme.system': 'সিস্টেম',
		'settings.fontsize': 'ফন্টের আকার',
		'settings.sync': 'সিঙ্ক্রোনাইজেশন',
		'settings.sync.status': 'সিঙ্ক স্ট্যাটাস',
		'settings.sync.connected': 'সংযুক্ত',
		'settings.sync.not.connected': 'সংযুক্ত নয়',
		'settings.sync.label': 'সর্বশেষ সিঙ্ক করা হয়েছে',
		'settings.sync.auto': 'অটো সিঙ্ক',
		'settings.sync.manual': 'সিঙ্ক করুন',
		'settings.storage': 'স্টোরেজ ব্যবহার',
		'settings.storage.used': 'ব্যবহৃত',
		'settings.storage.of': 'এর মধ্যে',
		'settings.version': 'সংস্করণ',
		'settings.sign.in': 'লগইন',
		'settings.sign.out': 'লগ আউট',

		// Admin
		'nav.admin': 'এডমিন',
		'admin.title': 'এডমিন কনসোল',
		'admin.offline.title': 'ইন্টারনেট কানেকশন নেই',
		'admin.offline.description':
			'দয়া করে আপনার ডিভাইসটি ইন্টারনেটের সাথে সংযুক্ত করে আবার চেষ্টা করুন।',
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

		// Footer
		'footer.privacy': 'গোপনীয়তা নীতি',
		'footer.terms': 'সেবার শর্তাবলী',
		'footer.rights': 'সর্বস্বত্ব সংরক্ষিত',
		'footer.created.by': 'তৈরি করেছেন ❤️ নাজমুল হাসান',

		// Legal
		'legal.last.updated': 'সর্বশেষ আপডেট',
		'legal.last.updated.date': digitToBangla(TERMS_PRIVACY_LAST_MODIFIED),
		'legal.privacy.title': 'গোপনীয়তা নীতি',
		'legal.privacy.intro.title': 'ভূমিকা',
		'legal.privacy.intro.body':
			'"আইন বন্ধু" ("আমরা", "আমাদের") আপনার গোপনীয়তাকে সম্মান করে। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করি যখন আপনি আমাদের অ্যাপ্লিকেশন ব্যবহার করেন।',
		'legal.privacy.collect.title': 'যে তথ্য আমরা সংগ্রহ করি',
		'legal.privacy.collect.email': 'ইমেল ঠিকানা (Google সাইন-ইন এর মাধ্যমে)',
		'legal.privacy.collect.name': 'প্রদর্শন নাম এবং প্রোফাইল ছবি (Google সাইন-ইন এর মাধ্যমে)',
		'legal.privacy.collect.avatar': 'Google দ্বারা প্রদত্ত প্রোফাইল ছবির URL',
		'legal.privacy.collect.notes': 'আপনি অ্যাপ্লিকেশনের মধ্যে যে নোট এবং বিষয়বস্তু তৈরি করেন',
		'legal.privacy.use.title': 'আমরা কীভাবে আপনার তথ্য ব্যবহার করি',
		'legal.privacy.use.auth': 'আপনার পরিচয় যাচাই এবং অ্যাকাউন্ট পরিচালনা করতে',
		'legal.privacy.use.sync': 'আপনি সাইন ইন করলে বিভিন্ন ডিভাইসে আপনার নোট সিঙ্ক্রোনাইজ করতে',
		'legal.privacy.use.improve': 'অ্যাপ্লিকেশন রক্ষণাবেক্ষণ এবং উন্নত করতে',
		'legal.privacy.storage.title': 'ডেটা সংরক্ষণ',
		'legal.privacy.storage.body':
			'আপনার নোটগুলো IndexedDB ব্যবহার করে আপনার ডিভাইসে স্থানীয়ভাবে সংরক্ষণ করা হয়। আপনি সাইন ইন করলে, ক্রস-ডিভাইস সিঙ্ক্রোনাইজেশন সক্ষম করতে আপনার নোটগুলো আমাদের ক্লাউড সার্ভারেও (Supabase) সংরক্ষণ করা হতে পারে। সাইন ইন ছাড়া অ্যাপ্লিকেশন ব্যবহার করলে আপনার ডেটা সম্পূর্ণরূপে আপনার ডিভাইসে থাকে।',
		'legal.privacy.thirdparty.title': 'তৃতীয় পক্ষের সেবা',
		'legal.privacy.thirdparty.body':
			'আমরা প্রমাণীকরণের জন্য Google OAuth এবং ক্লাউড স্টোরেজ ও সিঙ্ক্রোনাইজেশনের জন্য Supabase ব্যবহার করি। এই সেবাগুলোর নিজস্ব গোপনীয়তা নীতি রয়েছে যা আপনার ডেটা পরিচালনা নিয়ন্ত্রণ করে।',
		'legal.privacy.contact.title': 'যোগাযোগ করুন',
		'legal.privacy.contact.body':
			'এই গোপনীয়তা নীতি সম্পর্কে কোনো প্রশ্ন থাকলে, অনুগ্রহ করে GitHub রিপোজিটরি (https://github.com/nazmul-nhb/law-mate/) অথবা এই URL-এর (https://nazmul-nhb.dev/) মাধ্যমে আমাদের সাথে যোগাযোগ করুন।',
		'legal.terms.title': 'সেবার শর্তাবলী',
		'legal.terms.acceptance.title': 'শর্তাবলী গ্রহণ',
		'legal.terms.acceptance.body':
			'"আইন বন্ধু" অ্যাক্সেস বা ব্যবহার করে আপনি এই সেবার শর্তাবলী দ্বারা আবদ্ধ হতে সম্মত হচ্ছেন। আপনি সম্মত না হলে, অনুগ্রহ করে অ্যাপ্লিকেশনটি ব্যবহার করবেন না।',
		'legal.terms.description.title': 'সেবার বিবরণ',
		'legal.terms.description.body':
			'"আইন বন্ধু" একটি বিনামূল্যে, ওপেন-সোর্স নোট-টেকিং অ্যাপ্লিকেশন যা আইন পেশাদার এবং শিক্ষার্থীদের জন্য ডিজাইন করা হয়েছে। এটি ঐচ্ছিক ক্লাউড সিঙ্ক্রোনাইজেশনের সাথে লোকাল-ফার্স্ট স্টোরেজ প্রদান করে।',
		'legal.terms.accounts.title': 'ব্যবহারকারী অ্যাকাউন্ট',
		'legal.terms.accounts.body':
			'ক্লাউড সিঙ্ক্রোনাইজেশন সক্ষম করতে আপনি আপনার Google অ্যাকাউন্ট দিয়ে সাইন ইন করতে পারেন। আপনার অ্যাকাউন্ট শংসাপত্রের নিরাপত্তা বজায় রাখার দায়িত্ব আপনার। এই শর্তাবলী লঙ্ঘনকারী অ্যাকাউন্টগুলো স্থগিত বা বন্ধ করার অধিকার আমরা সংরক্ষণ করি।',
		'legal.terms.content.title': 'ব্যবহারকারীর বিষয়বস্তু',
		'legal.terms.content.body':
			'"আইন বন্ধু"-তে আপনার তৈরি করা সমস্ত বিষয়বস্তুর সম্পূর্ণ মালিকানা আপনার। আপনার নোট বা ডেটার উপর আমরা কোনো মেধা-স্বত্ব অধিকার দাবি করি না।',
		'legal.terms.termination.title': 'সমাপ্তি',
		'legal.terms.termination.body':
			'আমরা যেকোনো সময়ে, কারণ সহ বা ছাড়া, সেবায় আপনার প্রবেশ স্থগিত বা বন্ধ করতে পারি। সমাপ্তির পর, আপনার স্থানীয়ভাবে সংরক্ষিত ডেটা আপনার ডিভাইসে থাকবে।',
		'legal.terms.liability.title': 'দায় সীমাবদ্ধতা',
		'legal.terms.liability.body':
			'"আইন বন্ধু" কোনো ধরনের ওয়ারেন্টি ছাড়াই "যেমন আছে" ভিত্তিতে প্রদান করা হয়। অ্যাপ্লিকেশন ব্যবহার বা ব্যবহারে অক্ষমতা থেকে উদ্ভূত কোনো ক্ষতির জন্য, ডেটা হারানো সহ, আমরা দায়ী থাকব না।',
		'legal.terms.changes.title': 'শর্তাবলীর পরিবর্তন',
		'legal.terms.changes.body':
			'আমরা যেকোনো সময় এই শর্তাবলী সংশোধন করার অধিকার সংরক্ষণ করি। পরিবর্তনের পরে অ্যাপ্লিকেশনের অব্যাহত ব্যবহার সংশোধিত শর্তাবলী গ্রহণ বলে গণ্য হবে।',

		// Not Found
		'notfound.title': 'পাতাটি পাওয়া যায়নি',
		'notfound.description': 'আপনি যে পাতাটি খুঁজছেন তা অস্তিত্বহীন বা সরানো হয়েছে।',
		'notfound.back.home': 'নোটসমূহে যান',
		'notfound.back.prev': 'পেছনে যান',

		// Error Boundary
		'error.title': 'কিছু একটা ভুল হয়েছে',
		'error.description':
			'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পৃষ্ঠাটি পুনরায় লোড করার চেষ্টা করুন বা ড্যাশবোর্ডে ফিরে যান।',
		'error.details': 'ত্রুটির বিবরণ',
		'error.reload': 'অ্যাপ্লিকেশন পুনরায় লোড করুন',

		// Settings Data management
		'settings.data.title': 'ডেটা ম্যানেজমেন্ট',
		'settings.data.export.label': 'ডেটা এক্সপোর্ট',
		'settings.data.export.desc': 'একটি JSON ফাইলে আপনার নোট এবং মেটাডেটা ব্যাকআপ রাখুন।',
		'settings.data.export.meta': 'মেটাডেটা অন্তর্ভুক্ত করুন',
		'settings.data.export.pretty': 'প্রিটি প্রিন্ট JSON',
		'settings.data.export.button': 'JSON ফাইলে এক্সপোর্ট',
		'settings.data.import.label': 'ডেটা ইম্পোর্ট',
		'settings.data.import.desc': 'পূর্বে এক্সপোর্ট করা কোনো JSON ফাইল থেকে নোট পুনরুদ্ধার করুন।',
		'settings.data.import.mode': 'ইম্পোর্ট মোড',
		'settings.data.import.mode.merge': 'মার্জ (বিদ্যমান নোট এড়িয়ে যান)',
		'settings.data.import.mode.upsert': 'আপসার্ট (বিদ্যমান নোট প্রতিস্থাপন করুন)',
		'settings.data.import.mode.replace': 'রিপ্লেস (সব মুছে ইম্পোর্ট করুন)',
		'settings.data.import.dropzone':
			'JSON ফাইলটি এখানে ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা নির্বাচন করতে ক্লিক করুন',
		'settings.data.import.preview': 'ইম্পোর্ট প্রিভিউ',
		'settings.data.import.confirm': 'আপনি কি ইম্পোর্ট প্রক্রিয়াটি শুরু করতে চান?',
		'settings.data.import.success': 'ডেটা সফলভাবে ইম্পোর্ট করা হয়েছে',
		'settings.data.import.error.invalid': 'অকার্যকর JSON ফাইল ফরম্যাট।',
		'settings.data.import.error.empty': 'ফাইলে কোনো ইম্পোর্টযোগ্য নোট ডেটা পাওয়া যায়নি।',
		'settings.data.import.changes.insert': 'নতুন যুক্ত হবে',
		'settings.data.import.changes.update': 'হালনাগাদ হবে',
		'settings.data.import.changes.skip': 'এড়িয়ে যাওয়া হবে',
		'settings.data.import.changes.delete': 'মুছে ফেলা হবে',
		'settings.data.import.run': 'ইম্পোর্ট নিশ্চিত করুন',

		// DB Explorer
		'settings.data.explore.label': 'IndexedDB এক্সপ্লোরার',
		'settings.data.explore.desc': 'আপনার ব্রাউজারে সংরক্ষিত সমস্ত লোকাল নোট দেখুন।',
		'settings.data.explore.button': 'ডাটাবেস এক্সপ্লোর করুন',
		'settings.data.explore.title': 'লোকাল ডাটাবেস নোটসমূহ',
		'settings.data.explore.clear.all': 'সমস্ত লোকাল ডেটা মুছুন',
		'settings.data.explore.delete.selected': 'নির্বাচিতগুলো মুছুন',
		'settings.data.explore.confirm.clear':
			'আপনি কি নিশ্চিত যে IndexedDB এর সমস্ত ডেটা মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।',
		'settings.data.explore.confirm.delete':
			'আপনি কি নিশ্চিত যে নির্বাচিত নোটগুলো মুছে ফেলতে চান?',
		'settings.data.explore.col.id': 'আইডি',
		'settings.data.explore.col.title': 'শিরোনাম',
		'settings.data.explore.col.owner': 'মালিক আইডি',
		'settings.data.explore.col.status': 'অবস্থা',
		'settings.data.explore.col.version': 'সংস্করণ',
	} satisfies I18Values,
};

export default bn;
