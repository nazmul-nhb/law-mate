# LawMate (আইন বন্ধু)

LawMate is a modern, progressive web application (PWA) designed to help legal professionals and law students organize notes with ease. It combines a clean, distraction-free markdown editing interface with local-first offline storage and real-time cloud synchronization.

Live URL: <https://law-mate.nazmul-nhb.dev/>

## ✨ Features

- **Local-First Storage**: Read and write notes instantly offline using `IndexedDB` via `locality-idb`.
- **Cloud Sync**: Automatically synchronizes local notes to `Supabase` when connection is available and user is authenticated.
- **Export/Import**: Export database to JSON and import data from JSON.
- **OCR**: Extracts text from images using `Google Vision API`.
- **Markdown Editor**: Distraction-free minimal editing pane with dynamic live rendering previews.
- **PWA Capabilities**: Fully installable offline app support.
- **Multi-lingual**: Complete localization support in Bengali and English.
- **Admin Panel**: TanStack table-powered administration interface with sorting, pagination, search, and profile status management.

## 🛠️ Tech Stack

- **Core**: `React 19`, `TypeScript`, `Vite`
- **Database**: `IndexedDB` ([`locality-idb`](https://github.com/nazmul-nhb/locality-idb)) + `Supabase`
- **OCR**: `Google Cloud Vision API`
- **State Management**: `Zustand`
- **UI Components**: `Base UI` (via `shadcn`), `TailwindCSS`, `Lucide Icons`
- **i18n**: `i18next` & `react-i18next`

---

## 🚀 Development

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
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_VISION_API_KEY=YOUR_GOOGLE_VISION_API_KEY
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

### 6. Run the Production Build Locally

```bash
pnpm preview
```

---

Built with ❤️ by [Nazmul Hassan](https://nazmul-nhb.dev)
