import path from 'node:path';
import babel from '@rolldown/plugin-babel';
import tailwind from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwind(),
		babel({
			presets: [reactCompilerPreset()],
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
