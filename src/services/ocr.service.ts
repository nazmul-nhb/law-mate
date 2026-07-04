import type { OcrExtractionResult, VisionBatchAnnotateImagesResponse } from '@/types/ocr.types';

/**
 * Convert a File object to base64 string (without data URL prefix)
 */
function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			// Strip prefix e.g. "data:image/png;base64,"
			const base64Data = result.split(',')[1] || result;
			resolve(base64Data);
		};
		reader.onerror = (error) => reject(error);
		reader.readAsDataURL(file);
	});
}

export const ocrService = {
	/**
	 * Extract text from an image file using Google Cloud Vision REST API
	 */
	async extractTextFromImage(file: File): Promise<OcrExtractionResult> {
		try {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				return {
					text: '',
					success: false,
					error: 'INVALID_IMAGE_TYPE',
				};
			}

			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				return {
					text: '',
					success: false,
					error: 'FILE_TOO_LARGE',
				};
			}

			const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
			if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GOOGLE_VISION_API_KEY') {
				return {
					text: '',
					success: false,
					error: 'MISSING_API_KEY',
				};
			}

			const base64Content = await fileToBase64(file);

			const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(
				apiKey.trim()
			)}`;

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					requests: [
						{
							image: {
								content: base64Content,
							},
							features: [
								{
									type: 'TEXT_DETECTION',
								},
								{
									type: 'DOCUMENT_TEXT_DETECTION',
								},
							],
						},
					],
				}),
			});

			if (!response.ok) {
				const errorJson = await response.json().catch(() => null);
				const msg =
					errorJson?.error?.message ||
					`HTTP ${response.status}: ${response.statusText}`;
				return {
					text: '',
					success: false,
					error: msg,
				};
			}

			const data: VisionBatchAnnotateImagesResponse = await response.json();
			const firstResponse = data.responses?.[0];

			if (firstResponse?.error) {
				return {
					text: '',
					success: false,
					error: firstResponse.error.message,
				};
			}

			const fullText = firstResponse?.fullTextAnnotation?.text;
			const descText = firstResponse?.textAnnotations?.[0]?.description;
			const extractedText = (fullText || descText || '').trim();

			if (!extractedText) {
				console.warn(
					'[Google Vision API] No text annotations found in response:',
					data
				);
				return {
					text: '',
					success: false,
					error: 'NO_TEXT_FOUND',
				};
			}

			return {
				text: extractedText.trim(),
				success: true,
			};
		} catch (err) {
			return {
				text: '',
				success: false,
				error: err instanceof Error ? err.message : 'UNKNOWN_ERROR',
			};
		}
	},
};
