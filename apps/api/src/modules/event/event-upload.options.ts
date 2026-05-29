import {
	MAX_EVENT_IMAGE_FILE_SIZE_BYTES,
	MAX_EVENT_IMAGES,
	MAX_EVENT_MULTIPART_PAYLOAD_OVERHEAD_BYTES,
} from '@event-space/shared';

export const eventImageUploadOptions = {
	limits: {
		fileSize: MAX_EVENT_IMAGE_FILE_SIZE_BYTES,
		files: MAX_EVENT_IMAGES,
		fieldSize: MAX_EVENT_MULTIPART_PAYLOAD_OVERHEAD_BYTES,
		fields: 4,
		parts: MAX_EVENT_IMAGES + 4,
	},
} as const;
