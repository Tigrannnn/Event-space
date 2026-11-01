import { REVIEW_CONFIG } from '@event-space/shared';

/** Same ceiling on one file as the pictures of an event; the number of files is the review's own. */
export const reviewImageUploadOptions = {
	limits: {
		fileSize: REVIEW_CONFIG.MAX_IMAGE_FILE_SIZE_BYTES,
		files: REVIEW_CONFIG.MAX_IMAGES,
		fieldSize: 64 * 1024,
		fields: 2,
		parts: REVIEW_CONFIG.MAX_IMAGES + 2,
	},
} as const;
