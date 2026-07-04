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
	error?: string;
}
