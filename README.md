# LawMate (আইন বন্ধু)

LawMate is a modern, progressive web application (PWA) designed to help legal professionals and law students organize notes with ease. It combines a clean, distraction-free markdown editing interface with local-first offline storage and real-time cloud synchronization.

Live URL: <https://law-mate.nazmul-nhb.dev/>

## ✨ Features

- **Local-First Storage**: Read and write notes instantly offline using IndexedDB via `locality-idb`.
- **Cloud Sync**: Automatically synchronizes local notes to Supabase when connection is available and user is authenticated.
- **Markdown Editor**: Distraction-free editing pane with dynamic live rendering previews.
- **Admin Panel**: TanStack table-powered administration interface with sorting, pagination, search, and profile status management.
- **PWA Capabilities**: Fully installable offline app support.
- **Multi-lingual**: Complete localization support in Bengali and English.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Database**: IndexedDB ([`locality-idb`](https://github.com/nazmul-nhb/locality-idb)) + Supabase
- **State Management**: Zustand
- **UI Components**: Radix UI, Base UI, TailwindCSS, Lucide Icons
- **i18n**: `i18next` & `react-i18next`

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js and `pnpm` installed on your machine.

### 2. Installation

Install the project dependencies:

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root folder with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4. Development Server

Run the local dev server:

```bash
pnpm dev
```

### 5. Production Build

Build static assets for production:

```bash
pnpm build
```

---

## Future Plans

- Export to `json` and import/restore notes from `json`
- Display curated law nots by all users in home page
