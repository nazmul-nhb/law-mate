import path from 'node:path';
import babel from '@rolldown/plugin-babel';
import tailwind from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwind(),
		babel({
			presets: [reactCompilerPreset()],
		}),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
			},
			includeAssets: ['favicon.png'],
			manifest: {
				name: 'LawMate - Organize Your Law Notes',
				short_name: 'LawMate',
				description: 'Keep your law notes organized with offline-first support.',
				theme_color: '#0a0a0a',
				background_color: '#0a0a0a',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: 'lm-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'lm-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'lm-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	server: {
		host: true,
	},

	build: { chunkSizeWarningLimit: 2048 },
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
