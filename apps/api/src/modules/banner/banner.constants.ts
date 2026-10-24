import { Prisma } from '@prisma/client';
import {
	MAX_BANNER_IMAGE_FILE_SIZE_BYTES,
	MAX_BANNER_IMAGE_FILES,
	MAX_BANNER_MULTIPART_PAYLOAD_OVERHEAD_BYTES,
} from '@event-space/shared';

export const bannerImageUploadOptions = {
	limits: {
		fileSize: MAX_BANNER_IMAGE_FILE_SIZE_BYTES,
		files: MAX_BANNER_IMAGE_FILES,
		fieldSize: MAX_BANNER_MULTIPART_PAYLOAD_OVERHEAD_BYTES,
		fields: 4,
		parts: MAX_BANNER_IMAGE_FILES + 4,
	},
} as const;

export const BANNER_INCLUDE = {
	translations: true,
	event: {
		select: {
			id: true,
			status: true,
			translations: true,
		},
	},
	category: {
		select: {
			id: true,
			slug: true,
			translations: true,
		},
	},
} satisfies Prisma.BannerInclude;

export type BannerWithTargets = Prisma.BannerGetPayload<{ include: typeof BANNER_INCLUDE }>;
