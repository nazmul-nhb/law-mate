import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Cipher } from 'toolbox-x/hash';
import { cipherKey } from '@/constants/env';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const cipher = new Cipher(cipherKey);
