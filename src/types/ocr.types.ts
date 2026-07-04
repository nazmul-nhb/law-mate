import type { LooseLiteral } from 'toolbox-x/types/utils';

export type OcrInsertionMode = 'replace' | 'append' | 'prepend';

export interface VisionTextAnnotation {
	description: string;
	locale?: string;
}

export interface VisionAnnotateImageResponse {
	textAnnotations?: VisionTextAnnotation[];
	fullTextAnnotation?: {
		text: string;
	};
	error?: {
		code: number;
		message: string;
	};
}

export interface VisionBatchAnnotateImagesResponse {
	responses: VisionAnnotateImageResponse[];
}

export interface OcrExtractionResult {
	text: string;
	success: boolean;
	error?: LooseLiteral<
		| 'MISSING_API_KEY'
		| 'INVALID_IMAGE_TYPE'
		| 'FILE_TOO_LARGE'
		| 'NO_TEXT_FOUND'
		| 'NO_INTERNET_CONNECTION'
	>;
}
