import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clampNumber } from 'toolbox-x';
import { Cipher } from 'toolbox-x/hash';
import { cipherKey } from '@/constants/env';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const cipher = new Cipher(cipherKey);

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	const i = clampNumber(Math.floor(Math.log(bytes) / Math.log(1024)), 0, units.length - 1);

	return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}
