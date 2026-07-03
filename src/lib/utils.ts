import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clampNumber } from 'toolbox-x';
import { Cipher } from 'toolbox-x/hash';
import type { DateArgs } from 'toolbox-x/types/date';
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

export function getTimeDiff(time1: DateArgs, time2: DateArgs): number {
	return new Date(time1).getTime() - new Date(time2).getTime();
}
